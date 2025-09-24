import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { join } from "path";

// keep DB under project (adjust path if you prefer)
mkdirSync("data", { recursive: true });
export const db = new Database(join("data", "app.db"));

// Create tables if not exist (runs once at startup)
db.exec(`
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL,             
  parameter TEXT NOT NULL,             
  operator TEXT NOT NULL,           
  threshold REAL NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS alerts_updatedAt
AFTER UPDATE ON alerts
BEGIN
  UPDATE alerts SET updatedAt = datetime('now') WHERE id = NEW.id;
END;
`);
