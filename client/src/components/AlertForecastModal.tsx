import type { AlertForecastWindow } from "../lib/types";

interface AlertForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertName?: string;
  alertConditions?: string;
  forecastWindow?: AlertForecastWindow;
}

export default function AlertForecastModal({ 
  isOpen, 
  onClose, 
  alertName, 
  alertConditions,
  forecastWindow 
}: AlertForecastModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-1">
                3-Day Forecast Analysis: {alertName}
              </h2>
              {alertConditions && (
                <p className="text-sm text-slate-600">
                  {alertConditions}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {(() => {
            if (!forecastWindow) {
              return <div className="text-center py-8 text-slate-600">Loading forecast data...</div>;
            }

            if (!forecastWindow.hours || forecastWindow.hours.length === 0) {
              return <div className="text-center py-8 text-slate-600">No forecast data available.</div>;
            }

            // Group hours by day
            const hoursByDay = forecastWindow.hours.reduce((groups: Record<string, typeof forecastWindow.hours>, hour) => {
              const date = new Date(hour.time);
              const dayKey = date.toDateString();
              if (!groups[dayKey]) {
                groups[dayKey] = [];
              }
              groups[dayKey].push(hour);
              return groups;
            }, {});

            const today = new Date().toDateString();
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

            const triggeredCount = forecastWindow.hours.filter(h => h.triggered).length;
            
            return (
              <div className="space-y-6">
                {triggeredCount > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Alert will be triggered {triggeredCount} time(s)
                    </h3>
                    <p className="text-red-700 text-sm">Red squares show when your alert conditions will be met.</p>
                  </div>
                )}

                <div className="space-y-6">
                  {Object.entries(hoursByDay).map(([dayKey, dayHours]) => {
                    let dayTitle = dayKey;
                    if (dayKey === today) dayTitle = "Today";
                    else if (dayKey === tomorrow) dayTitle = "Tomorrow";
                    else {
                      const date = new Date(dayKey);
                      dayTitle = date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    }

                    return (
                      <div key={dayKey} className="space-y-3">
                        <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">
                          {dayTitle}
                        </h3>
                        
                        <div className="grid grid-cols-12 gap-2">
                          {dayHours.map((hour, index: number) => {
                            const time = new Date(hour.time);
                            const hourDisplay = time.getHours().toString().padStart(2, '0') + ':00';
                            
                            return (
                              <div
                                key={index}
                                className={`relative p-2 rounded-lg border text-xs font-medium text-center transition-colors ${
                                  hour.triggered
                                    ? 'bg-red-100 border-red-300 text-red-800'
                                    : 'bg-green-100 border-green-300 text-green-800'
                                }`}
                              >
                                {hour.triggered && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                                <div className="text-xs font-bold">{hourDisplay}</div>
                                <div className="text-[10px] mt-1">
                                  {Math.round(hour.value)}
                                  {hour.parameter === 'temperature' ? '°' : hour.parameter === 'windSpeed' ? 'm/s' : '%'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
