import { Router } from "express";
import * as Alerts from "../controllers/alerts.controller";

const r = Router();

r.post("/alerts", Alerts.create);
r.get("/alerts", Alerts.list);
r.patch("/alerts/:id", Alerts.update); 
r.delete("/alerts/:id", Alerts.remove);
r.get("/alerts/:id/status", Alerts.status);
r.get("/alerts/:id/trigger-forecast", Alerts.forecastWindow);

export default r;
