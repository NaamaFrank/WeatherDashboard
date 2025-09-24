import { Request, Response } from "express";
import * as WeatherService from "../services/weather.service";

export async function current(req: Request, res: Response) {
  try {
    const location = (req.query.location as string) || "Jerusalem";
    const data = await WeatherService.getCurrentWeather(location);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Failed to fetch current weather" });
  }
}

export async function forecast(req: Request, res: Response) {
  try {
    const location = (req.query.location as string);
    const data = await WeatherService.getForecast3d(location);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Failed to fetch forecast" });
  }
}
