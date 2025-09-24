import { Router } from "express";
import * as Weather from "../controllers/weather.controller";

const r = Router();

r.get("/weather/current", Weather.current);
r.get("/weather/forecast", Weather.forecast);

export default r;
