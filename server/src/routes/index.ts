import { Router } from "express";
import weatherRoutes from "./weather.routes";
import alertsRoutes from "./alerts.routes";

const api = Router();

api.use("/api", weatherRoutes);
api.use("/api", alertsRoutes);

api.get("/health", (_req, res) => res.json({ ok: true }));

export default api;
