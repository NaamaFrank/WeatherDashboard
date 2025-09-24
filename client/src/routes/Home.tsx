import { useEffect, useMemo, useState } from "react";
import { getCurrentWeather, getForecast } from "../services/weatherService";
import type { CurrentWeather, ForecastHour, Units } from "../lib/types";
import ForecastModal from "../components/ForecastModal";

export default function Home() {
  const [inputLocation, setInputLocation] = useState("");     // user typing
  const [queryLocation, setQueryLocation] = useState<string>(""); // used to fetch
  const [units, setUnits] = useState<Units>("metric");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastHour[]>([]);
  const [showForecastModal, setShowForecastModal] = useState(false);

  useEffect(() => {
    if (!queryLocation.trim()) return; 
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [c, f] = await Promise.all([
          getCurrentWeather(queryLocation, units),
          getForecast(queryLocation, units),
        ]);
        setCurrent(c);
        setForecast(f.hours || []);
      } catch (e: any) {
        setError(e?.message ?? "Failed to fetch weather");
        setCurrent(null);
        setForecast([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [queryLocation, units]);

  const tempUnit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "m/s" : "mph";

  const todayHours = useMemo(() => forecast.slice(0, 12), [forecast]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputLocation.trim();
    if (!trimmed) {
      setError("Please enter a location.");
      setCurrent(null);
      setForecast([]);
      return;
    }
    // triggers the fetch effect:
    setQueryLocation(trimmed);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.4 4.4 0 003 15z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Weather Dashboard
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Get real-time weather conditions and forecasts for any location worldwide
        </p>
      </div>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="loc" className="text-sm font-medium text-slate-700">
                📍 Location
              </label>
              <input
                id="loc"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter city or coordinates (lat,lon)" 
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
                aria-label="Location"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="units" className="text-sm font-medium text-slate-700">
                📊 Units
              </label>
              <select
                id="units"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={units}
                onChange={(e) => setUnits(e.target.value as Units)}
                aria-label="Units"
              >
                <option value="metric">Metric (°C, m/s)</option>
                <option value="imperial">Imperial (°F, mph)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Get Weather
              </div>
            )}
          </button>
        </form>
      </div>

      {/* Empty State */}
      {!queryLocation && !loading && !current && !error && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Start with a location</h3>
            <p className="text-slate-600 mb-6">
              Search any city or coordinates to view real-time weather and forecasts.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-500">
              <span className="bg-slate-100 px-3 py-1 rounded-full">Try: New York</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full">Try: London</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full">Try: 40.7128,-74.0060</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center">
            <div className="flex items-center justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Fetching Weather Data</h3>
            <p className="text-slate-600">Getting the latest conditions and forecast...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Unable to fetch weather data</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Weather Card */}
      {current && !loading && !error && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 md:p-8 shadow-lg">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">{current.location}</h2>
                </div>
                <div className="text-5xl md:text-6xl font-bold text-blue-600">
                  {current.temperature ? Math.round(current.temperature) : "—"}{tempUnit}
                </div>
                <div className="text-slate-600 text-sm">
                  Last updated: {new Date(current.observedAt).toLocaleString()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 lg:gap-6 w-full lg:w-auto">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-2 text-slate-600 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" stroke="none" viewBox="0 0 24 24">
                      <path d="M12 2.5s-8 8.5-8 13a8 8 0 1016 0c0-4.5-8-13-8-13z" />
                    </svg>
                    <span className="text-sm font-medium">Humidity</span>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-slate-900">{current.humidity ?? "—"}%</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-2 text-slate-600 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" stroke="none" viewBox="0 0 640 640">
                        <path d="M352 96C352 113.7 366.3 128 384 128L424 128C437.3 128 448 138.7 448 152C448 165.3 437.3 176 424 176L96 176C78.3 176 64 190.3 64 208C64 225.7 78.3 240 96 240L424 240C472.6 240 512 200.6 512 152C512 103.4 472.6 64 424 64L384 64C366.3 64 352 78.3 352 96zM416 448C416 465.7 430.3 480 448 480L480 480C533 480 576 437 576 384C576 331 533 288 480 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L480 352C497.7 352 512 366.3 512 384C512 401.7 497.7 416 480 416L448 416C430.3 416 416 430.3 416 448zM192 576L232 576C280.6 576 320 536.6 320 488C320 439.4 280.6 400 232 400L96 400C78.3 400 64 414.3 64 432C64 449.7 78.3 464 96 464L232 464C245.3 464 256 474.7 256 488C256 501.3 245.3 512 232 512L192 512C174.3 512 160 526.3 160 544C160 561.7 174.3 576 192 576z"/>
                    </svg>
                    <span className="text-sm font-medium">Wind Speed</span>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-slate-900">{current.windSpeed ?? "—"} {windUnit}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Section */}
      {todayHours.length > 0 && !loading && !error && (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">12-Hour Forecast</h2>
              <p className="text-slate-600">Hourly weather conditions for the next 12 hours</p>
            </div>
            
            {forecast.length > 12 && (
              <button
                onClick={() => setShowForecastModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Extended Forecast ({forecast.length} hours)
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {todayHours.map((h, i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="text-center space-y-3">
                  <div className="text-sm font-semibold text-slate-600">
                    {new Date(h.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  
                  <div className="text-2xl font-bold text-slate-900">
                    {h.values?.temperature ? Math.round(h.values.temperature) : "—"}{tempUnit}
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    
                    {typeof h.values?.windSpeed === "number" && (
                      <div className="flex items-center justify-center space-x-1 text-slate-600">
                        <svg className="w-3 h-3" fill="currentColor" stroke="none" viewBox="0 0 640 640">
                         <path d="M352 96C352 113.7 366.3 128 384 128L424 128C437.3 128 448 138.7 448 152C448 165.3 437.3 176 424 176L96 176C78.3 176 64 190.3 64 208C64 225.7 78.3 240 96 240L424 240C472.6 240 512 200.6 512 152C512 103.4 472.6 64 424 64L384 64C366.3 64 352 78.3 352 96zM416 448C416 465.7 430.3 480 448 480L480 480C533 480 576 437 576 384C576 331 533 288 480 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L480 352C497.7 352 512 366.3 512 384C512 401.7 497.7 416 480 416L448 416C430.3 416 416 430.3 416 448zM192 576L232 576C280.6 576 320 536.6 320 488C320 439.4 280.6 400 232 400L96 400C78.3 400 64 414.3 64 432C64 449.7 78.3 464 96 464L232 464C245.3 464 256 474.7 256 488C256 501.3 245.3 512 232 512L192 512C174.3 512 160 526.3 160 544C160 561.7 174.3 576 192 576z"/>
                        </svg>
                        <span>{Math.round(h.values.windSpeed)} {windUnit}</span>
                      </div>
                    )}
                    
                    {typeof h.values?.humidity === "number" && (
                      <div className="flex items-center justify-center space-x-1 text-slate-600">
                        <svg className="w-3 h-3" fill="currentColor" stroke="none" viewBox="0 0 24 24">
                          <path d="M12 2.5s-8 8.5-8 13a8 8 0 1016 0c0-4.5-8-13-8-13z" />
                        </svg>
                        <span>{Math.round(h.values.humidity)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Forecast Modal */}
      <ForecastModal
        location={current?.location || queryLocation}
        forecast={forecast}
        units={units}
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
      />
    </div>
  );
}
