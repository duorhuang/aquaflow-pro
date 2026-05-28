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
    const rows = await this.sql`
      INSERT INTO "WeeklyFeedback" ("id", "swimmerId", "weekStart", "weekEnd", "reflection", "goals", "isSubmitted", "createdAt", "updatedAt")
      VALUES (${id}, ${String(data.swimmerId)}, ${String(data.weekStart)}, ${String(data.weekEnd)}, ${data.reflection || ''}, ${data.goals || ''}, ${Boolean(data.isSubmitted)}, NOW(), NOW())
      RETURNING *
    `;
    return rows[0];
  }

  async reply(id: string, coachReply: string) {
    const rows = await this.sql`UPDATE "WeeklyFeedback" SET "coachReply" = ${coachReply} WHERE "id" = ${id} RETURNING *`;
    return rows[0];
  }
})();
