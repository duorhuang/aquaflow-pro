import { BaseRepo } from './base';

export const announcementRepo = new (class extends BaseRepo {
  async list(params?: { group?: string; archived?: boolean }) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString();

    let rows: any[];
    if (params?.archived) {
      if (params?.group) {
        rows = await this.sql`SELECT * FROM "CoachAnnouncement" WHERE "targetGroup" = ${params.group} AND "createdAt" < ${cutoffStr} AND "isStarred" = false ORDER BY "createdAt" DESC`;
      } else {
        rows = await this.sql`SELECT * FROM "CoachAnnouncement" WHERE "createdAt" < ${cutoffStr} AND "isStarred" = false ORDER BY "createdAt" DESC`;
      }
    } else {
      if (params?.group) {
        rows = await this.sql`SELECT * FROM "CoachAnnouncement" WHERE "targetGroup" = ${params.group} AND ("createdAt" >= ${cutoffStr} OR "isStarred" = true) ORDER BY "createdAt" DESC`;
      } else {
        rows = await this.sql`SELECT * FROM "CoachAnnouncement" WHERE "createdAt" >= ${cutoffStr} OR "isStarred" = true ORDER BY "createdAt" DESC`;
      }
    }

    const results = await Promise.all(rows.map(async (a: any) => {
      const blocks = await this.sql`SELECT * FROM "AnnouncementBlock" WHERE "announcementId" = ${a.id} ORDER BY "sortOrder" ASC`;
      if (a.targetSwimmerIds && typeof a.targetSwimmerIds === 'string') {
        try { a.targetSwimmerIds = JSON.parse(a.targetSwimmerIds); } catch { a.targetSwimmerIds = []; }
      }
      return { ...a, blocks };
    }));
    return results;
  }

  async create(data: any) {
    const rows = await this.sql`
      INSERT INTO "CoachAnnouncement" ("id", "title", "content", "targetGroup", "targetSwimmerIds", "isStarred", "isArchived", "createdAt")
      VALUES (${data.id || crypto.randomUUID()}, ${data.title}, ${data.content}, ${data.targetGroup || null}, ${this.toJson(data.targetSwimmerIds || [])}, ${Boolean(data.isStarred)}, ${Boolean(data.isArchived)}, NOW())
      RETURNING *
    `;
    const announcement = rows[0];
    if (data.blocks && Array.isArray(data.blocks)) {
      for (const block of data.blocks) {
        await this.sql`INSERT INTO "AnnouncementBlock" ("id", "announcementId", "content", "sortOrder", "createdAt") VALUES (${block.id || crypto.randomUUID()}, ${announcement.id}, ${block.content}, ${block.sortOrder || 0}, NOW())`;
      }
    }
    return announcement;
  }

  async delete(id: string) {
    await this.sql`DELETE FROM "CoachAnnouncement" WHERE "id" = ${id}`;
  }

  async toggleStar(id: string, isStarred: boolean) {
    const rows = await this.sql`UPDATE "CoachAnnouncement" SET "isStarred" = ${isStarred} WHERE "id" = ${id} RETURNING *`;
    return rows[0];
  }
})();
