import { api } from "./api";
import type { 
  CurrentWeather, 
  ForecastResponse, 
  Units
} from "../lib/types";

// Get current weather 
export async function getCurrentWeather(location: string, units?: Units): Promise<CurrentWeather> {
  const res = await api.get<CurrentWeather>("/api/weather/current", {
    params: { location, units },
  });
  
  return res.data;
}

// Get forecast 
export async function getForecast(location: string, units?: Units): Promise<ForecastResponse> {
  const res = await api.get<ForecastResponse>("/api/weather/forecast", {
    params: { location, units },
  });
  
  return res.data;
}
