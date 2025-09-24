import axios from "axios";
import { config } from "../core/config";

const weatherBase = `${config.tomorrowBaseUrl}/weather`;

export async function getRealtime(location: string) {
    const { data } = await axios.get(`${weatherBase}/realtime`, {
        params: { location, units: "metric", apikey: config.tomorrowApiKey }
    });
    return data?.data?.values;
}

export async function getForecastHourly(location: string) {
  const { data } = await axios.get(`${weatherBase}/forecast`, {
    params: { location, timesteps: "1h", units: "metric", apikey: config.tomorrowApiKey }
  });
  return data?.timelines?.hourly ?? [];
}
