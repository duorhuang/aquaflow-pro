import * as crypto from 'crypto';
import { BaseRepo } from './base';

export const weeklyFeedbackRepo = new (class extends BaseRepo {
  async list(submittedOnly?: boolean) {
    const rows = submittedOnly
      ? await this.sql`SELECT * FROM "WeeklyFeedback" WHERE "isSubmitted" = true ORDER BY "weekStart" DESC`
      : await this.sql`SELECT * FROM "WeeklyFeedback" ORDER BY "weekStart" DESC`;

    if (rows.length === 0) return [];

    const feedbackIds = rows.map((f: any) => f.id);
    const swimmerIds = [...new Set(rows.map((f: any) => f.swimmerId).filter(Boolean))];

    const [dailyRows, swimmerRows] = await Promise.all([
      this.sql`SELECT * FROM "DailyFeedback" WHERE "weeklyFeedbackId" = ANY(${feedbackIds})`,
      this.sql`SELECT * FROM "Swimmer" WHERE "id" = ANY(${swimmerIds})`,
    ]);

    const dailyByFeedback: Record<string, any[]> = {};
    for (const d of dailyRows) (dailyByFeedback[d.weeklyFeedbackId] ||= []).push(d);

    const swimmers: Record<string, any> = {};
    for (const s of swimmerRows) swimmers[s.id] = s;

    return rows.map((f: any) => ({
      ...f,
      dailyFeedbacks: dailyByFeedback[f.id] || [],
      swimmer: swimmers[f.swimmerId] || null,
    }));
  }

  async getBySwimmerAndWeek(swimmerId: string, weekStart: string) {
    const rows = await this.sql`SELECT * FROM "WeeklyFeedback" WHERE "swimmerId" = ${swimmerId} AND "weekStart" = ${weekStart}`;
    if (rows.length === 0) return null;
    const feedback = rows[0];
    const daily = await this.sql`SELECT * FROM "DailyFeedback" WHERE "weeklyFeedbackId" = ${feedback.id}`;
    const swimmer = await this.sql`SELECT * FROM "Swimmer" WHERE "id" = ${feedback.swimmerId}`;
    return { ...feedback, dailyFeedbacks: daily, swimmer: swimmer[0] || null };
  }

  async save(data: any) {
    const id = data.id || crypto.randomUUID();
    const submittedAt = data.isSubmitted ? new Date().toISOString() : null;
    
    const weeklyFeedbackRows = await this.sql`
      INSERT INTO "WeeklyFeedback" ("id", "swimmerId", "weekStart", "summary", "isSubmitted", "submittedAt", "createdAt", "updatedAt")
      VALUES (${id}, ${String(data.swimmerId)}, ${String(data.weekStart)}, ${data.summary || null}, ${Boolean(data.isSubmitted)}, ${submittedAt}, NOW(), NOW())
      ON CONFLICT ("swimmerId", "weekStart") DO UPDATE SET
        "summary" = EXCLUDED."summary",
        "isSubmitted" = EXCLUDED."isSubmitted",
        "submittedAt" = COALESCE(EXCLUDED."submittedAt", "WeeklyFeedback"."submittedAt"),
        "updatedAt" = NOW()
      RETURNING *
    `;
    const weeklyFeedback = weeklyFeedbackRows[0];

    if (data.dailyFeedbacks && Array.isArray(data.dailyFeedbacks)) {
      for (const df of data.dailyFeedbacks) {
        const dfId = df.id || crypto.randomUUID();
        await this.sql`
          INSERT INTO "DailyFeedback" ("id", "weeklyFeedbackId", "swimmerId", "date", "rpe", "soreness", "reflection", "createdAt")
          VALUES (${dfId}, ${weeklyFeedback.id}, ${weeklyFeedback.swimmerId}, ${String(df.date)}, ${df.rpe !== undefined ? Number(df.rpe) : null}, ${df.soreness !== undefined ? Number(df.soreness) : null}, ${df.reflection || null}, NOW())
          ON CONFLICT ("swimmerId", "date") DO UPDATE SET
            "weeklyFeedbackId" = EXCLUDED."weeklyFeedbackId",
            "rpe" = EXCLUDED."rpe",
            "soreness" = EXCLUDED."soreness",
            "reflection" = EXCLUDED."reflection"
        `;
      }
    }

    return this.getBySwimmerAndWeek(weeklyFeedback.swimmerId, weeklyFeedback.weekStart);
  }

  async reply(id: string, coachReply: string) {
    const repliedAt = new Date().toISOString();
    const rows = await this.sql`
      UPDATE "WeeklyFeedback"
      SET "coachReply" = ${coachReply}, "isReplied" = true, "repliedAt" = ${repliedAt}, "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;
    return rows[0];
  }
})();
