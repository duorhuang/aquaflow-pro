import * as crypto from 'crypto';
import { BaseRepo } from './base';

export const feedbackRepo = new (class extends BaseRepo {
  async list() {
    const rows = await this.sql`
      SELECT "Feedback".*, row_to_json("Swimmer") as swimmer
      FROM "Feedback"
      LEFT JOIN "Swimmer" ON "Feedback"."swimmerId" = "Swimmer"."id"
      ORDER BY "Feedback"."createdAt" DESC
    `;
    return rows.map((f: any) => ({
      ...f,
      swimmer: f.swimmer && Object.keys(f.swimmer).length > 1 ? f.swimmer : null,
    }));
  }

  async upsert(data: any) {
    const existing = await this.sql`
      SELECT * FROM "Feedback"
      WHERE "swimmerId" = ${String(data.swimmerId)} AND "date" = ${String(data.date)}
    `;

    let rows: any[];
    if (existing.length > 0) {
      rows = await this.sql`
        UPDATE "Feedback" SET
          "rpe" = ${Number(data.rpe) || 0},
          "soreness" = ${Number(data.soreness) || 0},
          "comments" = ${data.comments || ''},
          "timestamp" = ${data.timestamp || new Date().toISOString()},
          "goodPoints" = ${data.goodPoints},
          "improvementAreas" = ${data.improvementAreas}
        WHERE "swimmerId" = ${String(data.swimmerId)} AND "date" = ${String(data.date)}
        RETURNING *
      `;
    } else {
      rows = await this.sql`
        INSERT INTO "Feedback" ("id", "swimmerId", "planId", "date", "rpe", "soreness", "comments", "timestamp", "goodPoints", "improvementAreas", "createdAt")
        VALUES (${data.id || crypto.randomUUID()}, ${String(data.swimmerId)}, ${data.planId}, ${String(data.date)}, ${Number(data.rpe) || 0}, ${Number(data.soreness) || 0}, ${data.comments || ''}, ${data.timestamp || new Date().toISOString()}, ${data.goodPoints}, ${data.improvementAreas}, NOW())
        RETURNING *
      `;
    }
    return rows[0];
  }
})();
