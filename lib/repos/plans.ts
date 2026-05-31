import * as crypto from 'crypto';
import { BaseRepo } from './base';

const JSON_FIELDS = ['blocks', 'targetedNotes'] as const;

export const planRepo = new (class extends BaseRepo {
  async list(group?: string) {
    let rows: any[];
    if (group) {
      rows = await this.sql`SELECT * FROM "TrainingPlan" WHERE "group" = ${group} ORDER BY "date" DESC`;
    } else {
      rows = await this.sql`SELECT * FROM "TrainingPlan" ORDER BY "date" DESC`;
    }
    return this.parseJsonRows(rows, [...JSON_FIELDS]);
  }

  async create(data: any) {
    const planId = data.id || crypto.randomUUID();
    const blocksJson = this.toJson(data.blocks || []);
    const targetedNotesJson = this.toJson(data.targetedNotes || {});

    const rows = await this.sql`
      INSERT INTO "TrainingPlan" ("id", "date", "startTime", "endTime", "group", "blocks", "totalDistance", "focus", "status", "coachNotes", "targetedNotes", "imageUrl", "isStarred", "trainingType", "primaryStroke", "createdAt", "updatedAt")
      VALUES (${planId}, ${String(data.date)}, ${data.startTime ?? ''}, ${data.endTime ?? ''}, ${String(data.group)}, ${blocksJson}, ${Number(data.totalDistance) || 0}, ${data.focus ?? ''}, ${data.status ?? 'Draft'}, ${data.coachNotes ?? ''}, ${targetedNotesJson}, ${data.imageUrl ?? null}, ${Boolean(data.isStarred)}, ${data.trainingType || null}, ${data.primaryStroke || null}, NOW(), NOW())
      RETURNING *
    `;
    return this.parseJsonFields(rows[0], [...JSON_FIELDS]);
  }

  async update(id: string, data: any) {
    const existing = await this.sql`SELECT * FROM "TrainingPlan" WHERE "id" = ${id}`;
    const current = this.requireOne(existing, 'TrainingPlan', id);

    const blocksJson = data.blocks !== undefined
      ? this.toJson(data.blocks)
      : (typeof (current as any).blocks === 'string' ? (current as any).blocks : this.toJson((current as any).blocks));
    const targetedNotesJson = data.targetedNotes !== undefined
      ? this.toJson(data.targetedNotes)
      : (typeof (current as any).targetedNotes === 'string' ? (current as any).targetedNotes : this.toJson((current as any).targetedNotes));

    const rows = await this.sql`
      UPDATE "TrainingPlan" SET
        "date" = ${data.date ?? (current as any).date},
        "startTime" = ${data.startTime ?? (current as any).startTime},
        "endTime" = ${data.endTime ?? (current as any).endTime},
        "group" = ${data.group ?? (current as any).group},
        "blocks" = ${blocksJson},
        "totalDistance" = ${data.totalDistance !== undefined ? Number(data.totalDistance) : (current as any).totalDistance},
        "focus" = ${data.focus ?? (current as any).focus},
        "status" = ${data.status ?? (current as any).status},
        "coachNotes" = ${data.coachNotes ?? (current as any).coachNotes},
        "targetedNotes" = ${targetedNotesJson},
        "imageUrl" = ${data.imageUrl !== undefined ? (data.imageUrl ?? null) : (current as any).imageUrl},
        "isStarred" = ${data.isStarred !== undefined ? Boolean(data.isStarred) : (current as any).isStarred},
        "trainingType" = ${data.trainingType !== undefined ? (data.trainingType ?? null) : (current as any).trainingType},
        "primaryStroke" = ${data.primaryStroke !== undefined ? (data.primaryStroke ?? null) : (current as any).primaryStroke},
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;
    return this.parseJsonFields(rows[0], [...JSON_FIELDS]);
  }

  async delete(id: string) {
    await this.sql`DELETE FROM "TrainingPlan" WHERE "id" = ${id}`;
  }
})();
