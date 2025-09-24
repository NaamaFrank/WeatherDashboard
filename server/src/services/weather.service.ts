import { getRealtime, getForecastHourly } from "../clients/tomorrow.client";
import type { CurrentWeather, ForecastResponse } from "@shared/weather";

export async function getCurrentWeather(location: string): Promise<CurrentWeather> {
  const v = await getRealtime(location);
  return {
    location,
    temperature: v?.temperature,
    windSpeed: v?.windSpeed,
    humidity: v?.humidity,
    observedAt: new Date().toISOString()
  };
}

export async function getForecast3d(location: string): Promise<ForecastResponse> {
  const hours = await getForecastHourly(location);
  return {
    location,
    hours: hours.slice(0, 72) // next 3 days hourly
  };
}
