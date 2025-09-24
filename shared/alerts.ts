export type WeatherParameter = "temperature" | "windSpeed" | "humidity";
export type ComparisonOperator = ">" | ">=" | "<" | "<=" | "==" | "!=";

export interface Alert {
  id: number;
  name: string;
  location: string;
  parameter: WeatherParameter;
  operator: ComparisonOperator;
  threshold: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateAlertDto = Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateAlertDto = Partial<CreateAlertDto>;

export interface AlertStatus {
  id: number;
  triggered: boolean;
  currentValue: number;
  parameter: WeatherParameter;
  operator: ComparisonOperator;
  threshold: number;
  checkedAt: string;
}

export interface TriggeredWindow {
  time: string;
  value: number;
  parameter: WeatherParameter;
  operator: ComparisonOperator;
  threshold: number;
  triggered: boolean;
}

export interface AlertForecastWindow {
  id: number;
  hours: TriggeredWindow[];
}
