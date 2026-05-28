import * as crypto from 'crypto';
import { BaseRepo } from './base';

export const templateRepo = new (class extends BaseRepo {
  async list() {
    const rows = await this.sql`SELECT * FROM "BlockTemplate" ORDER BY "category" ASC`;
    return rows.map((t: any) => {
      if (t.items && typeof t.items === 'string') {
        try { t.items = JSON.parse(t.items); } catch { t.items = []; }
      }
      return t;
    });
  }

  async create(data: any) {
    const existing = await this.sql`SELECT * FROM "BlockTemplate" WHERE "templateId" = ${String(data.templateId)} LIMIT 1`;
    if (existing.length > 0) return { error: 'Template ID already exists', status: 409 };

    const rows = await this.sql`
      INSERT INTO "BlockTemplate" ("id", "templateId", "name", "category", "type", "rounds", "items", "note", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${String(data.templateId)}, ${String(data.name)}, ${String(data.category)}, ${String(data.type)}, ${Number(data.rounds) || 1}, ${this.toJson(data.items || [])}, ${data.note}, NOW(), NOW())
      RETURNING *
    `;
    return rows[0];
  }

  async update(id: string, data: any) {
    const existing = await this.sql`SELECT * FROM "BlockTemplate" WHERE "id" = ${id}`;
    const current = this.requireOne(existing, 'BlockTemplate', id);

    const rows = await this.sql`
      UPDATE "BlockTemplate" SET
        "name" = ${data.name ?? (current as any).name},
        "category" = ${data.category ?? (current as any).category},
        "type" = ${data.type ?? (current as any).type},
        "rounds" = ${data.rounds !== undefined ? Number(data.rounds) : (current as any).rounds},
        "items" = ${data.items !== undefined ? this.toJson(data.items) : (current as any).items},
        "note" = ${data.note ?? (current as any).note},
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;
    return rows[0];
  }

  async delete(id: string) {
    await this.sql`DELETE FROM "BlockTemplate" WHERE "id" = ${id}`;
  }
})();
