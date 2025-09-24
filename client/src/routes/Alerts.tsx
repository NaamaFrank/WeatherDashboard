import { useEffect, useState } from "react";
import { listAlerts, createAlert, deleteAlert, getAlertStatus, getAlertTriggerForecast } from "../services/alertService";
import type { Alert, CreateAlertDto, WeatherParameter, ComparisonOperator, AlertStatus, AlertForecastWindow } from "../lib/types";
import { WEATHER_PARAMETERS, OPERATORS, PARAMETER_LABELS, OPERATOR_LABELS } from "../lib/constants";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";
import AlertForecastModal from "../components/AlertForecastModal";
import ToastNotification from "../components/ToastNotification";

type AlertForm = {
  name: string;
  location: string;
  parameter: WeatherParameter;
  operator: ComparisonOperator;
  threshold: string;
};

const EMPTY_FORM: AlertForm = {
  name: "",
  location: "",
  parameter: "temperature",
  operator: ">",
  threshold: ""
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Alert status tracking
  const [alertStatuses, setAlertStatuses] = useState<Record<number, AlertStatus>>({});
  const [statusLoading, setStatusLoading] = useState<Record<number, boolean>>({});
  const [forecastWindows, setForecastWindows] = useState<Record<number, AlertForecastWindow>>({});
  
  // Form state
  const [form, setForm] = useState<AlertForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    alertId?: number;
    alertName?: string;
  }>({ show: false });

  const [alertModal, setAlertModal] = useState<{
    show: boolean;
    variant?: "success" | "error" | "warning" | "info";
    title?: string;
    message?: string;
  }>({ show: false });

  const [forecastModal, setForecastModal] = useState<{
    show: boolean;
    alertId?: number;
    alertName?: string;
    alertConditions?: string;
  }>({ show: false });

  // Toast notification state
  const [toastNotification, setToastNotification] = useState<{
    show: boolean;
    alert?: Alert;
    status?: AlertStatus;
  }>({ show: false });

  // Load alerts
  useEffect(() => {
    loadAlerts();
    
    // Set up periodic status checking (every 5 minutes)
    const interval = setInterval(() => {
      if (alerts.length > 0) {
        loadAlertsStatus(alerts);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [alerts.length]);



  const showNotification = (alert: Alert, status: AlertStatus) => {
    
    // Show toast notification
    setToastNotification({
      show: true,
      alert,
      status
    });
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      setToastNotification({ show: false });
    }, 8000);
  };

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAlerts();
      setAlerts(data);
      
      // Load status for each alert
      loadAlertsStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAlertsStatus = async (alerts: Alert[]) => {
    // Load status for all alerts in parallel
    const statusPromises = alerts.map(async (alert) => {
      try {
        setStatusLoading(prev => ({ ...prev, [alert.id]: true }));
        
        let status = await getAlertStatus(alert.id);
        
        // Check if this alert was previously not triggered and is now triggered
        const previousStatus = alertStatuses[alert.id];
        if (status.triggered && (!previousStatus || !previousStatus.triggered)) {
          showNotification(alert, status);
        }
        
        setAlertStatuses(prev => ({ ...prev, [alert.id]: status }));
      } catch (err: any) {
        console.warn(`Failed to load status for alert ${alert.id}:`, err);
        
      } finally {
        setStatusLoading(prev => ({ ...prev, [alert.id]: false }));
      }
    });
    
    await Promise.all(statusPromises);
  };

  const loadAlertForecastWindow = async (alertId: number) => {
    try {
      // Clear any existing cached data for this alert to ensure fresh data
      setForecastWindows(prev => {
        const updated = { ...prev };
        delete updated[alertId];
        return updated;
      });
      
      let window = await getAlertTriggerForecast(alertId);
      
      setForecastWindows(prev => ({ ...prev, [alertId]: window }));
      
      // Show forecast modal
      const alert = alerts.find(a => a.id === alertId);
      setForecastModal({ 
        show: true, 
        alertId, 
        alertName: alert?.name,
        alertConditions: alert ? `When ${PARAMETER_LABELS[alert.parameter]} ${OPERATOR_LABELS[alert.operator]} ${alert.threshold}` : undefined
      });
    } catch (err: any) {
      console.warn(`Failed to load forecast window for alert ${alertId}:`, err);
      
      // Show error modal for forecast failures
      const alert = alerts.find(a => a.id === alertId);
      setAlertModal({
        show: true,
        variant: "error",
        title: "Forecast Load Failed",
        message: `Failed to load forecast data for "${alert?.name}": ${err.message}`
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.location.trim() || !form.threshold.trim()) {
      setCreateError("Please fill in all fields");
      return;
    }

    const threshold = parseFloat(form.threshold);
    if (isNaN(threshold)) {
      setCreateError("Threshold must be a valid number");
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);
      
      const alertData: CreateAlertDto = {
        name: form.name.trim(),
        location: form.location.trim(),
        parameter: form.parameter,
        operator: form.operator,
        threshold: threshold
      };

      const newAlert = await createAlert(alertData);
      setAlerts(prev => [...prev, newAlert]);
      setForm(EMPTY_FORM);
      
      setAlertModal({
        show: true,
        variant: "success",
        title: "Alert Created",
        message: `Alert "${newAlert.name}" has been created successfully. You'll receive notifications when conditions are met.`
      });
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (alertId: number) => {
    try {
      await deleteAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      setConfirmModal({ show: false });
      
      setAlertModal({
        show: true,
        variant: "success", 
        title: "Alert Deleted",
        message: "The alert has been successfully deleted."
      });
    } catch (err: any) {
      setAlertModal({
        show: true,
        variant: "error",
        title: "Delete Failed",
        message: err.message
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Weather Alerts</h1>
        <p className="text-slate-600">Create custom weather alerts</p>
      </div>

      {/* Create Alert Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Create New Alert</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Alert Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., High Temperature Alert"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City name or lat,lon coordinates"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Weather Parameter
                </label>
                <select
                  value={form.parameter}
                  onChange={(e) => setForm(prev => ({ ...prev, parameter: e.target.value as WeatherParameter }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {WEATHER_PARAMETERS.map(param => (
                    <option key={param} value={param}>
                      {PARAMETER_LABELS[param]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Condition
                </label>
                <select
                  value={form.operator}
                  onChange={(e) => setForm(prev => ({ ...prev, operator: e.target.value as ComparisonOperator }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {OPERATORS.map(op => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Threshold Value
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.threshold}
                  onChange={(e) => setForm(prev => ({ ...prev, threshold: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            {createError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Unable to Create Alert</h4>
                    <p className="text-red-600 text-sm mt-1">{createError}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? "Creating Alert..." : "Create Alert"}
            </button>
          </form>
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Alerts</h2>
          <button
            onClick={() => loadAlertsStatus(alerts)}
            disabled={Object.values(statusLoading).some(loading => loading)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Status</span>
          </button>
        </div>
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Loading alerts...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">Failed to Load Alerts</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={() => loadAlerts()}
                className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h9v2H4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No alerts yet</h3>
            <p className="text-slate-600">Create your first weather alert using the form above.</p>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="grid gap-4">
            {alerts.map((alert) => {
              const status = alertStatuses[alert.id];
              const isStatusLoading = statusLoading[alert.id];
              
              return (
              <div key={alert.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{alert.name}</h3>
                      {isStatusLoading ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <div className="inline-block animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-gray-600 mr-1"></div>
                          Checking...
                        </span>
                      ) : status ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status.triggered 
                            ? "bg-red-100 text-red-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {status.triggered ? "TRIGGERED" : "Not Triggered"}
                        </span>
                      ) : alertStatuses[alert.id] === undefined && !isStatusLoading ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Status Error</span>
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Status Unknown
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{alert.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>When {PARAMETER_LABELS[alert.parameter]} {OPERATOR_LABELS[alert.operator]} {alert.threshold}</span>
                      </div>
                      
                      {status && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Current: {status.currentValue} {status.parameter === 'temperature' ? '°C' : status.parameter === 'windSpeed' ? 'm/s' : '%'}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => loadAlertForecastWindow(alert.id)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>View 3-day forecast</span>
                        </button>
                        
                        {/* Retry status check if failed */}
                        {alertStatuses[alert.id] === undefined && !statusLoading[alert.id] && (
                          <button 
                            onClick={() => loadAlertsStatus([alert])}
                            className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm ml-4"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Retry status</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setConfirmModal({ 
                      show: true, 
                      alertId: alert.id, 
                      alertName: alert.name 
                    })}
                    className="ml-4 text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete alert"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.show}
        variant="danger"
        title="Delete Alert"
        message={`Are you sure you want to delete "${confirmModal.alertName}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => confirmModal.alertId && handleDelete(confirmModal.alertId)}
        onCancel={() => setConfirmModal({ show: false })}
      />

      <AlertModal
        isOpen={alertModal.show}
        variant={alertModal.variant || "info"}
        title={alertModal.title || ""}
        message={alertModal.message || ""}
        onClose={() => setAlertModal({ show: false })}
      />

      {/* Alert Forecast Modal */}
      <AlertForecastModal
        isOpen={forecastModal.show}
        onClose={() => setForecastModal({ show: false })}
        alertName={forecastModal.alertName}
        alertConditions={forecastModal.alertConditions}
        forecastWindow={forecastModal.alertId ? forecastWindows[forecastModal.alertId] : undefined}
      />

      {/* Toast Notification */}
      <ToastNotification
        isVisible={toastNotification.show}
        alert={toastNotification.alert || null}
        status={toastNotification.status || null}
        onClose={() => setToastNotification({ show: false })}
      />
    </div>
  );
}
