import type { Alert, AlertStatus } from "../lib/types";
import { PARAMETER_LABELS, OPERATOR_LABELS } from "../lib/constants";

interface ToastNotificationProps {
  isVisible: boolean;
  alert: Alert | null;
  status: AlertStatus | null;
  onClose: () => void;
}

export default function ToastNotification({ isVisible, alert, status, onClose }: ToastNotificationProps) {
  if (!isVisible || !alert || !status) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <div className={`bg-white rounded-xl shadow-2xl border-l-4 ${
        status.triggered 
          ? 'border-red-500' 
          : 'border-green-500'
      } p-4 transform transition-all duration-300 animate-in slide-in-from-right`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            status.triggered 
              ? 'bg-red-100' 
              : 'bg-green-100'
          }`}>
            {status.triggered ? (
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-semibold ${
                status.triggered 
                  ? 'text-red-800' 
                  : 'text-green-800'
              }`}>
                {status.triggered ? '🚨 Alert Triggered!' : '✅ Alert Status Updated'}
              </h3>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-700 mt-1 font-medium">
              {alert.name}
            </p>
            
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-medium">{PARAMETER_LABELS[status.parameter]}</span> is{' '}
              <span className={`font-bold ${
                status.triggered ? 'text-red-700' : 'text-green-700'
              }`}>
                {status.currentValue}
              </span>
              {status.parameter === 'temperature' ? '°C' : 
               status.parameter === 'windSpeed' ? 'm/s' : '%'}
              {' '}({OPERATOR_LABELS[status.operator]} {status.threshold})
            </p>
            
            <p className="text-xs text-gray-500 mt-1">
              📍 {alert.location}
            </p>
            
            {/* Progress bar for auto-hide */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full ${
                  status.triggered ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{
                  width: '100%',
                  transition: 'width 8s linear',
                  animation: 'pulse 2s infinite'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
