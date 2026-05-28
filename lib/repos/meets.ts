import * as crypto from 'crypto';
import { BaseRepo } from './base';

export const meetRepo = new (class extends BaseRepo {
  async list() {
    const rows = await this.sql`SELECT * FROM "Meet" ORDER BY "date" ASC, "time" ASC`;
    const now = new Date();
    let closestMeet: any = null;
    let diffMs = Infinity;

    for (const meet of rows) {
      const meetDateTime = new Date(`${meet.date}T${meet.time || '00:00'}:00`);
      if (meetDateTime.getTime() > now.getTime()) {
        const diff = meetDateTime.getTime() - now.getTime();
        if (diff < diffMs) {
          diffMs = diff;
          closestMeet = {
            ...meet,
            diffMs,
            daysLeft: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hoursLeft: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutesLeft: Math.floor((diff / (1000 * 60)) % 60),
            secondsLeft: Math.floor((diff / 1000) % 60),
          };
        }
      }
    }

    const isDarkGoldActive = closestMeet && closestMeet.daysLeft < 7 && closestMeet.isActive;
    return { meets: rows, closestMeet, isDarkGoldActive };
  }

  async create(data: any) {
    const id = data.id || crypto.randomUUID();
    const rows = await this.sql`
      INSERT INTO "Meet" ("id", "name", "date", "time", "location", "description", "isActive", "createdAt", "updatedAt")
      VALUES (${id}, ${String(data.name)}, ${String(data.date)}, ${data.time || null}, ${data.location || null}, ${data.description || null}, ${data.isActive !== undefined ? Boolean(data.isActive) : true}, NOW(), NOW())
      RETURNING *
    `;
    return rows[0];
  }

  async update(id: string, data: any) {
    const existing = await this.sql`SELECT * FROM "Meet" WHERE "id" = ${id}`;
    const current = this.requireOne(existing, 'Meet', id);

    const rows = await this.sql`
      UPDATE "Meet" SET
        "name" = ${data.name ?? (current as any).name},
        "date" = ${data.date ?? (current as any).date},
        "time" = ${data.time !== undefined ? (data.time || null) : (current as any).time},
        "location" = ${data.location !== undefined ? (data.location || null) : (current as any).location},
        "description" = ${data.description !== undefined ? (data.description || null) : (current as any).description},
        "isActive" = ${data.isActive !== undefined ? Boolean(data.isActive) : (current as any).isActive},
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;
    return rows[0];
  }

  async delete(id: string) {
    await this.sql`DELETE FROM "Meet" WHERE "id" = ${id}`;
  }
})();
