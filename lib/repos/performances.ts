import * as crypto from 'crypto';
import { BaseRepo } from './base';

export const performanceRepo = new (class extends BaseRepo {
  async list() {
    const rows = await this.sql`
      SELECT "PerformanceRecord".*,
             row_to_json("Swimmer") as swimmer
      FROM "PerformanceRecord"
      LEFT JOIN "Swimmer" ON "PerformanceRecord"."swimmerId" = "Swimmer"."id"
      ORDER BY "PerformanceRecord"."date" DESC
    `;
    return rows.map((p: any) => ({
      ...p,
      swimmer: p.swimmer && Object.keys(p.swimmer).length > 1 ? p.swimmer : null,
    }));
  }

  async create(data: any) {
    const rows = await this.sql`
      INSERT INTO "PerformanceRecord" ("id", "swimmerId", "event", "time", "date", "isPB", "improvement", "meetName", "notes", "createdAt")
      VALUES (${crypto.randomUUID()}, ${String(data.swimmerId)}, ${String(data.event)}, ${String(data.time)}, ${String(data.date)}, ${Boolean(data.isPB)}, ${data.improvement !== undefined ? Number(data.improvement) : null}, ${data.meetName}, ${data.notes}, NOW())
      RETURNING *
    `;
    return rows[0];
  }

  async update(id: string, data: any) {
    const existing = await this.sql`SELECT * FROM "PerformanceRecord" WHERE "id" = ${id}`;
    const current = this.requireOne(existing, 'PerformanceRecord', id);

    const rows = await this.sql`
      UPDATE "PerformanceRecord" SET
        "event" = ${data.event ?? (current as any).event},
        "time" = ${data.time ?? (current as any).time},
        "date" = ${data.date ?? (current as any).date},
        "isPB" = ${data.isPB !== undefined ? Boolean(data.isPB) : (current as any).isPB},
        "improvement" = ${data.improvement !== undefined ? Number(data.improvement) : (current as any).improvement},
        "meetName" = ${data.meetName ?? (current as any).meetName},
        "notes" = ${data.notes ?? (current as any).notes},
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;
    return rows[0];
  }

  async delete(id: string) {
    await this.sql`DELETE FROM "PerformanceRecord" WHERE "id" = ${id}`;
  }
})();
