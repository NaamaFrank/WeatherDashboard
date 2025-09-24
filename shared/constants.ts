
export const WEATHER_PARAMETERS = [
  "temperature",
  "windSpeed", 
  "humidity"
] as const;

export const COMPARISON_OPERATORS = [">", ">=", "<", "<=", "==", "!="] as const;

export const LOGICAL_OPERATORS = ["AND", "OR"] as const;

// Display names for UI
export const PARAMETER_DISPLAY_NAMES = {
  temperature: "Temperature",
  windSpeed: "Wind Speed",
  humidity: "Humidity"
} as const;

export const OPERATOR_DISPLAY_NAMES = {
  ">": "greater than",
  ">=": "greater than or equal to",
  "<": "less than",
  "<=": "less than or equal to",
  "==": "equal to",
  "!=": "not equal to"
} as const;

export const DEFAULT_LOCATION = "Jerusalem";
