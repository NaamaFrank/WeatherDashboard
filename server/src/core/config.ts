import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV ?? "development";
const PORT = Number(process.env.PORT ?? 4000);
const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY;
const BASE_URL = "https://api.tomorrow.io/v4/";

if (!TOMORROW_API_KEY) {
  throw new Error("Missing TOMORROW_API_KEY in environment");
}

export const config = {
  env: NODE_ENV,
  port: PORT,
  tomorrowApiKey: TOMORROW_API_KEY,
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 8000),
  tomorrowBaseUrl: BASE_URL,
};
