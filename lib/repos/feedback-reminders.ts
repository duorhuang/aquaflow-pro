import * as crypto from 'crypto';
import { BaseRepo } from './base';

export const feedbackReminderRepo = new (class extends BaseRepo {
  async list(withResponses?: boolean) {
    if (withResponses) {
      const rows = await this.sql`
        SELECT "TargetedFeedbackReminder".*,
               (SELECT json_agg(row_to_json("TargetedFeedback"))
                FROM "TargetedFeedback"
                WHERE "TargetedFeedback"."reminderId" = "TargetedFeedbackReminder"."id") as responses
        FROM "TargetedFeedbackReminder"
        ORDER BY "createdAt" DESC
      `;
      return rows.map((r: any) => {
        if (r.targetSwimmerIds && typeof r.targetSwimmerIds === 'string') {
          try { r.targetSwimmerIds = JSON.parse(r.targetSwimmerIds); } catch { r.targetSwimmerIds = []; }
        }
        return r;
      });
    }
    const rows = await this.sql`SELECT * FROM "TargetedFeedbackReminder" ORDER BY "createdAt" DESC`;
    return rows.map((r: any) => {
      if (r.targetSwimmerIds && typeof r.targetSwimmerIds === 'string') {
        try { r.targetSwimmerIds = JSON.parse(r.targetSwimmerIds); } catch { r.targetSwimmerIds = []; }
      }
      return r;
    });
  }

  async getForSwimmer(swimmerId: string) {
    const rows = await this.sql`SELECT * FROM "TargetedFeedbackReminder" ORDER BY "createdAt" DESC`;
    return rows.filter((r: any) => {
      let ids: string[] = [];
      if (r.targetSwimmerIds && typeof r.targetSwimmerIds === 'string') {
        try { ids = JSON.parse(r.targetSwimmerIds); } catch { return false; }
      } else if (Array.isArray(r.targetSwimmerIds)) {
        ids = r.targetSwimmerIds;
      }
      return ids.includes(swimmerId);
    });
  }

  async create(data: any) {
    const rows = await this.sql`
      INSERT INTO "TargetedFeedbackReminder" ("id", "title", "description", "targetSwimmerIds", "createdAt")
      VALUES (${data.id || crypto.randomUUID()}, ${data.title}, ${data.description}, ${this.toJson(data.targetSwimmerIds || [])}, NOW())
      RETURNING *
    `;
    return rows[0];
  }

  async respond(data: any) {
    const rows = await this.sql`
      INSERT INTO "TargetedFeedback" ("id", "reminderId", "swimmerId", "response", "createdAt")
      VALUES (${crypto.randomUUID()}, ${String(data.reminderId)}, ${String(data.swimmerId)}, ${data.response || ''}, NOW())
      RETURNING *
    `;
    return rows[0];
  }

  async replyToTargeted(id: string, coachReply: string) {
    const rows = await this.sql`UPDATE "TargetedFeedback" SET "coachReply" = ${coachReply} WHERE "id" = ${id} RETURNING *`;
    return rows[0];
  }
})();
