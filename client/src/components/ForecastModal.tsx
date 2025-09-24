import type { ForecastHour, Units } from "../lib/types";

interface ForecastModalProps {
  location: string;
  forecast: ForecastHour[];
  units: Units;
  isOpen: boolean;
  onClose: () => void;
}

function getWeatherIcon(temp: number | undefined): string {
  if (temp === undefined) return "🌤️";
  if (temp <= 0) return "❄️";
  if (temp <= 10) return "🌨️";
  if (temp <= 20) return "⛅";
  if (temp <= 30) return "☀️";
  return "🌡️";
}

function formatTime(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(timeString: string): string {
  const date = new Date(timeString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }
}

function groupForecastByDay(forecast: ForecastHour[]) {
  const groups: Record<string, ForecastHour[]> = {};
  
  forecast.forEach(hour => {
    const date = new Date(hour.time);
    const dayKey = date.toDateString();
    if (!groups[dayKey]) groups[dayKey] = [];
    groups[dayKey].push(hour);
  });
  
  return Object.entries(groups);
}

function getTemperatureUnit(units: Units): string {
  return units === "imperial" ? "°F" : "°C";
}

function getWindUnit(units: Units): string {
  return units === "imperial" ? "mph" : "m/s";
}

export default function ForecastModal({ location, forecast, units, isOpen, onClose }: ForecastModalProps) {
  if (!isOpen || !forecast.length) return null;

  const dayGroups = groupForecastByDay(forecast);
  const tempUnit = getTemperatureUnit(units);
  const windUnit = getWindUnit(units);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close forecast"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div>
                <h2 className="text-xl font-semibold">Weather Forecast</h2>
                <p className="text-blue-100">
                  📍 {location} • {forecast.length} hours • Next {Math.ceil(forecast.length / 24)} days
                </p>
              </div>
            </div>
            <div className="text-3xl">🌤️</div>
          </div>
        </div>

        {/* Forecast Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-8">
            {dayGroups.map(([dayString, dayHours]) => {
              const dayLabel = formatDate(dayHours[0].time);
              
              // Calculate daily stats
              const temps = dayHours.map(h => h.values?.temperature).filter((t): t is number => t !== undefined);
              const minTemp = temps.length ? Math.min(...temps) : undefined;
              const maxTemp = temps.length ? Math.max(...temps) : undefined;
              const avgHumidity = dayHours.reduce((sum, h) => sum + (h.values?.humidity || 0), 0) / dayHours.length;
              const maxPrecipProb = Math.max(...dayHours.map(h => h.values?.precipitationProbability || 0));

              return (
                <div key={dayString} className="space-y-4">
                  {/* Day Header */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{dayLabel}</h3>
                      <div className="text-sm text-slate-600">
                        {minTemp !== undefined && maxTemp !== undefined && (
                          <span>{Math.round(minTemp)}{tempUnit} - {Math.round(maxTemp)}{tempUnit}</span>
                        )}
                        {avgHumidity > 0 && (
                          <span className="ml-3">💧 {Math.round(avgHumidity)}%</span>
                        )}
                        {maxPrecipProb > 0 && (
                          <span className="ml-3">🌧️ {Math.round(maxPrecipProb)}%</span>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl">
                      {getWeatherIcon(maxTemp)}
                    </div>
                  </div>

                  {/* Hourly Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {dayHours.map((hour, idx) => {
                      const time = formatTime(hour.time);
                      const temp = hour.values?.temperature;
                      const wind = hour.values?.windSpeed;
                      const humidity = hour.values?.humidity;
                      const precipProb = hour.values?.precipitationProbability;
                      const icon = getWeatherIcon(temp);

                      return (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="text-center space-y-2">
                            <div className="text-sm font-medium text-slate-600">{time}</div>
                            <div className="text-2xl">{icon}</div>
                            
                            {temp !== undefined && (
                              <div className="text-lg font-bold text-slate-800">
                                {Math.round(temp)}{tempUnit}
                              </div>
                            )}
                            
                            <div className="space-y-1 text-xs text-slate-500">
                              {wind !== undefined && (
                                <div className="flex items-center justify-center gap-1">
                                  <span>💨</span>
                                  <span>{Math.round(wind)}{windUnit}</span>
                                </div>
                              )}
                              
                              {humidity !== undefined && (
                                <div className="flex items-center justify-center gap-1">
                                  <span>💧</span>
                                  <span>{Math.round(humidity)}%</span>
                                </div>
                              )}
                              
                              {precipProb !== undefined && precipProb > 0 && (
                                <div className="flex items-center justify-center gap-1">
                                  <span>🌧️</span>
                                  <span>{Math.round(precipProb)}%</span>
                                </div>
                              )}
                            </div>
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

        {/* Footer */}
        <div className="border-t p-4 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span>🌡️</span>
              <span>Temperature</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💨</span>
              <span>Wind Speed</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💧</span>
              <span>Humidity</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌧️</span>
              <span>Rain Chance</span>
            </div>
          </div>
          <div className="text-xs">
            Powered by Tomorrow.io
          </div>
        </div>
      </div>
    </div>
  );
}
