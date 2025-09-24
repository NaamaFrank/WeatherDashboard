import { api } from "./api";
import type {
  Alert,
  CreateAlertDto,
  UpdateAlertDto,
  AlertStatus,
  AlertForecastWindow,
} from "../lib/types";

export async function listAlerts(): Promise<Alert[]> {
  const res = await api.get<Alert[]>("/api/alerts");
  return res.data;
}

export async function createAlert(payload: CreateAlertDto): Promise<Alert> {
  const res = await api.post<Alert>("/api/alerts", payload);
  return res.data;
}

export async function updateAlert(id: number, patch: UpdateAlertDto): Promise<Alert> {
  const res = await api.patch<Alert>(`/api/alerts/${id}`, patch);
  return res.data;
}

export async function deleteAlert(id: number): Promise<void> {
  await api.delete(`/api/alerts/${id}`);
}

export async function getAlertStatus(id: number): Promise<AlertStatus> {
  const res = await api.get(`/api/alerts/${id}/status`);
  return res.data;
}

export async function getAlertTriggerForecast(id: number): Promise<AlertForecastWindow> {
  const res = await api.get(`/api/alerts/${id}/trigger-forecast`);
  return res.data;
}
