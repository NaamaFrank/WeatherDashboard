import { Request, Response } from "express";
import * as AlertsService from "../services/alert.service";
import { CreateAlertDto, UpdateAlertDto } from "@shared/alerts";

// Create new alert
export async function create(req: Request<{}, {}, CreateAlertDto>, res: Response) {
  try {
    const alert = await AlertsService.create(req.body);
    res.status(201).json(alert);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Failed to create alert" });
  }
}

// List all alerts
export async function list(_req: Request, res: Response) {
  try {
    const alerts = await AlertsService.list();
    res.json(alerts);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Failed to list alerts" });
  }
}

// Update an alert
export async function update(req: Request<{ id: string }, {}, UpdateAlertDto>, res: Response) {
  try {
    const id = req.params.id;
    const updatedAlert = await AlertsService.update(id, req.body);
    res.json(updatedAlert);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Failed to update alert" });
  }
}

// Delete an alert
export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    await AlertsService.remove(id);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Failed to delete alert" });
  }
}

// Get alert status (triggered or not)
export async function status(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const status = await AlertsService.status(id);
    res.json(status);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Failed to get alert status" });
  }
}

// Get forecast window (when alert will trigger in next 3 days)
export async function forecastWindow(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const window = await AlertsService.forecastWindow(id);
    res.json(window);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Failed to get forecast window" });
  }
}

