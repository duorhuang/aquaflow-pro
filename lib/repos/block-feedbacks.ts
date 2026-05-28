import * as crypto from 'crypto';
import { BaseRepo } from './base';

export const blockFeedbackRepo = new (class extends BaseRepo {
  async list(params?: { planId?: string; blockId?: string; swimmerId?: string; isCoach?: boolean }) {
    const effectiveSwimmerId = !params?.isCoach && params?.swimmerId ? params.swimmerId : params?.swimmerId;
    let rows: any[];

    if (params?.planId && params?.blockId && effectiveSwimmerId) {
      rows = await this.sql`SELECT * FROM "BlockFeedback" WHERE "planId" = ${params.planId} AND "blockId" = ${params.blockId} AND "swimmerId" = ${effectiveSwimmerId} ORDER BY "createdAt" DESC`;
    } else if (params?.planId && params?.blockId) {
      rows = await this.sql`SELECT * FROM "BlockFeedback" WHERE "planId" = ${params.planId} AND "blockId" = ${params.blockId} ORDER BY "createdAt" DESC`;
    } else if (params?.planId && effectiveSwimmerId) {
      rows = await this.sql`SELECT * FROM "BlockFeedback" WHERE "planId" = ${params.planId} AND "swimmerId" = ${effectiveSwimmerId} ORDER BY "createdAt" DESC`;
    } else if (params?.blockId && effectiveSwimmerId) {
      rows = await this.sql`SELECT * FROM "BlockFeedback" WHERE "blockId" = ${params.blockId} AND "swimmerId" = ${effectiveSwimmerId} ORDER BY "createdAt" DESC`;
    } else if (params?.planId) {
      rows = await this.sql`SELECT * FROM "BlockFeedback" WHERE "planId" = ${params.planId} ORDER BY "createdAt" DESC`;
    } else if (params?.blockId) {
      rows = await this.sql`SELECT * FROM "BlockFeedback" WHERE "blockId" = ${params.blockId} ORDER BY "createdAt" DESC`;
    } else if (effectiveSwimmerId) {
      rows = await this.sql`SELECT * FROM "BlockFeedback" WHERE "swimmerId" = ${effectiveSwimmerId} ORDER BY "createdAt" DESC`;
    } else {
      rows = await this.sql`SELECT * FROM "BlockFeedback" ORDER BY "createdAt" DESC`;
    }

    const results = await Promise.all(rows.map(async (f: any) => {
      const swimmer = await this.sql`SELECT "id", "name", "group" FROM "Swimmer" WHERE "id" = ${f.swimmerId}`;
      return { ...f, swimmer: swimmer[0] || null };
    }));
    return results;
  }

  async create(data: any) {
    const rows = await this.sql`
      INSERT INTO "BlockFeedback" ("id", "planId", "blockId", "swimmerId", "content", "createdAt")
      VALUES (${data.id || crypto.randomUUID()}, ${String(data.planId)}, ${String(data.blockId)}, ${String(data.swimmerId)}, ${data.content || ''}, NOW())
      RETURNING *
    `;
    return rows[0];
  }

  async delete(id: string) {
    await this.sql`DELETE FROM "BlockFeedback" WHERE "id" = ${id}`;
  }
})();
