import type { WeatherParameter, ComparisonOperator } from "./types";

// Re-export shared constants
export { 
  WEATHER_PARAMETERS,
  COMPARISON_OPERATORS as OPERATORS,
  PARAMETER_DISPLAY_NAMES,
  OPERATOR_DISPLAY_NAMES
} from "@shared/constants";

// parameter labels with units
export const PARAMETER_LABELS: Record<WeatherParameter, string> = {
  temperature: "Temperature (°C)",
  windSpeed: "Wind Speed (m/s)", 
  humidity: "Humidity (%)"
};

// operator labels
export const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  ">": "greater than",
  ">=": "greater than or equal to", 
  "<": "less than",
  "<=": "less than or equal to",
  "==": "equal to",
  "!=": "not equal to"
};
