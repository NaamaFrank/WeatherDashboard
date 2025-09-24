import { db } from "../core/database";
import type { WeatherParameter, ComparisonOperator } from "@shared/alerts";

export type Alert = {
  id: number;
  name: string;
  location: string;
  parameter: WeatherParameter;
  operator: ComparisonOperator;
  threshold: number;
  createdAt: string;
  updatedAt: string;
};

type CreateAlert = Omit<Alert, "id" | "createdAt" | "updatedAt">;

const insertStmt = db.prepare(`
  INSERT INTO alerts (name, location, parameter, operator, threshold)
  VALUES (@name, @location, @parameter, @operator, @threshold)
`);

const selectAllStmt = db.prepare(`SELECT * FROM alerts ORDER BY id DESC`);
const selectByIdStmt = db.prepare(`SELECT * FROM alerts WHERE id = ?`);

const updateStmt = db.prepare(`
  UPDATE alerts
  SET name = COALESCE(@name, name),
      location = COALESCE(@location, location),
      parameter = COALESCE(@parameter, parameter),
      operator = COALESCE(@operator, operator),
      threshold = COALESCE(@threshold, threshold)
  WHERE id = @id
`);

const deleteStmt = db.prepare(`DELETE FROM alerts WHERE id = ?`);

export const AlertsDB = {
  create(data: CreateAlert): Alert {
    const info = insertStmt.run(data);
    return selectByIdStmt.get(info.lastInsertRowid as number) as Alert;
  },

  list(): Alert[] {
    return selectAllStmt.all() as Alert[];
  },

  get(id: number): Alert | undefined {
    return selectByIdStmt.get(id) as Alert | undefined;
  },

  update(id: number, patch: Partial<CreateAlert>): Alert {
    const info = updateStmt.run({ id, ...patch });
    if (info.changes === 0) throw new Error("Alert not found");
    return selectByIdStmt.get(id) as Alert;
  },

  remove(id: number): void {
    const info = deleteStmt.run(id);
    if (info.changes === 0) throw new Error("Alert not found");
  },
};
