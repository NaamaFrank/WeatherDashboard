export type Units = "metric" | "imperial";

export interface CurrentWeather {
  location: string;
  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  observedAt: string;
}

export interface ForecastHour {
  time: string;
  values?: {
    temperature?: number;
    windSpeed?: number;
    humidity?: number;
    precipitationProbability?: number;
    [key: string]: any;
  };
}

export interface ForecastResponse {
  location: string;
  hours: ForecastHour[];
}
