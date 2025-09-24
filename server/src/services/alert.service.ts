import { AlertsDB, type Alert } from "../db/alerts";
import { getRealtime  } from "../clients/tomorrow.client";
import {getForecast3d} from "./weather.service";
import type { ForecastResponse } from "@shared/weather";
import { WEATHER_PARAMETERS, COMPARISON_OPERATORS } from "@shared/constants";
import type { WeatherParameter, ComparisonOperator } from "@shared/alerts";

// helper: compare value vs operator/threshold
function cmp(v: number, op: string, t: number) {
  switch (op) {
    case ">":  return v >  t;
    case ">=": return v >= t;
    case "<":  return v <  t;
    case "<=": return v <= t;
    case "==": return v === t;
    case "!=": return v !== t;
    default:   return false;
  }
}

export async function create(body: {
  name?: string;
  location?: string;
  parameter?: WeatherParameter;
  operator?: ComparisonOperator;
  threshold?: number | string;
}): Promise<Alert> {
  const { name, location, parameter, operator, threshold } = body ?? {};
  if (!name || !location) throw new Error("name and location are required");
  if (!parameter || !WEATHER_PARAMETERS.includes(parameter)) throw new Error("invalid parameter");
  if (!operator || !COMPARISON_OPERATORS.includes(operator)) throw new Error("invalid operator");
  const th = Number(threshold);
  if (!Number.isFinite(th)) throw new Error("threshold must be a number");

  return AlertsDB.create({ name, location, parameter, operator, threshold: th });
}

export async function list() {
  return AlertsDB.list();
}

export async function update(id: string, patch: any) {
  const numId = Number(id);
  if (!Number.isInteger(numId)) throw new Error("invalid id");
  return AlertsDB.update(numId, patch);
}

export async function remove(id: string) {
  const numId = Number(id);
  if (!Number.isInteger(numId)) throw new Error("invalid id");
  AlertsDB.remove(numId);
}

export async function status(id: string) {
  const numId = Number(id);
  const alert = AlertsDB.get(numId);
  if (!alert) throw new Error("Alert not found");

  // fetch current weather for alert location
  const values = await getRealtime(alert.location);
  const current = values?.[alert.parameter]; 

  if (typeof current !== "number") {
    throw new Error(`Parameter '${alert.parameter}' not available in realtime response`);
  }

  const triggered = cmp(current, alert.operator, alert.threshold);
  return {
    id: numId,
    triggered,
    currentValue: current,
    parameter: alert.parameter,
    operator: alert.operator,
    threshold: alert.threshold,
    checkedAt: new Date().toISOString(),
  };
}

export async function forecastWindow(id: string) {
  const numId = Number(id);
  const alert = AlertsDB.get(numId);
  if (!alert) throw new Error("Alert not found");

  const field = alert.parameter;
  const forcast: ForecastResponse = await getForecast3d(alert.location); // returns array of hourly steps
  const hours = forcast.hours;

  if (!Array.isArray(hours)) {
    throw new Error("No forecast data returned");
  }

  // Return all forecast hours with triggered status
  const allHours = hours.map((h: any) => {
    const value = h.values?.[field];
    const triggered = typeof value === "number" && cmp(value, alert.operator, alert.threshold);
    
    return {
      time: h.time,
      value: value || 0,
      parameter: alert.parameter,
      operator: alert.operator,
      threshold: alert.threshold,
      triggered: triggered,
    };
  });

  return { id: numId, hours: allHours };
}

