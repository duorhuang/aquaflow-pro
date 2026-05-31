import * as crypto from 'crypto';
import { BaseRepo } from './base';

function parsePlanJson(plan: any) {
  if (plan.targetGroup && typeof plan.targetGroup === 'string') {
    try { plan.targetGroup = JSON.parse(plan.targetGroup); } catch { plan.targetGroup = []; }
  }
  if (plan.targetSwimmerIds && typeof plan.targetSwimmerIds === 'string') {
    try { plan.targetSwimmerIds = JSON.parse(plan.targetSwimmerIds); } catch { plan.targetSwimmerIds = []; }
  }
  return plan;
}

function parseSessionJson(s: any) {
  if (s.contentBlocks && typeof s.contentBlocks === 'string') {
    try { s.contentBlocks = JSON.parse(s.contentBlocks); } catch {}
  }
  if (s.trainingBlocks && typeof s.trainingBlocks === 'string') {
    try { s.trainingBlocks = JSON.parse(s.trainingBlocks); } catch {}
  }
  return s;
}

export const weeklyPlanRepo = new (class extends BaseRepo {
  async getById(id: string) {
    const planRows = await this.sql`SELECT * FROM "WeeklyPlan" WHERE "id" = ${id}`;
    if (planRows.length === 0) return null;
    const plan = parsePlanJson(planRows[0]);
    const sessions = await this.sql`SELECT * FROM "DailySession" WHERE "weeklyPlanId" = ${id} ORDER BY "sortOrder" ASC`;
    return { ...plan, sessions: sessions.map(parseSessionJson) };
  }

  async list(params?: { group?: string; isPublished?: boolean }) {
    let rows: any[];
    if (params?.group !== undefined && params?.isPublished !== undefined) {
      rows = await this.sql`SELECT * FROM "WeeklyPlan" WHERE "group" = ${params.group} AND "isPublished" = ${params.isPublished} ORDER BY "weekStart" DESC`;
    } else if (params?.group !== undefined) {
      rows = await this.sql`SELECT * FROM "WeeklyPlan" WHERE "group" = ${params.group} ORDER BY "weekStart" DESC`;
    } else if (params?.isPublished !== undefined) {
      rows = await this.sql`SELECT * FROM "WeeklyPlan" WHERE "isPublished" = ${params.isPublished} ORDER BY "weekStart" DESC`;
    } else {
      rows = await this.sql`SELECT * FROM "WeeklyPlan" ORDER BY "weekStart" DESC`;
    }

    const plans = rows.map(parsePlanJson);
    if (plans.length > 0) {
      const planIds = plans.map((p: any) => p.id);
      const sessions = await this.sql`SELECT * FROM "DailySession" WHERE "weeklyPlanId" = ANY(${planIds}) ORDER BY "sortOrder" ASC`;
      const sessionsByPlanId: Record<string, any[]> = {};
      for (const s of sessions) {
        (sessionsByPlanId[s.weeklyPlanId] ||= []).push(parseSessionJson(s));
      }
      return plans.map((plan: any) => ({ ...plan, sessions: sessionsByPlanId[plan.id] || [] }));
    }
    return plans;
  }

  async create(data: any) {
    const planId = data.id || crypto.randomUUID();
    const rows = await this.sql`
      INSERT INTO "WeeklyPlan" ("id", "group", "weekStart", "weekEnd", "title", "coachNotes", "description", "targetGroup", "targetSwimmerIds", "isPublished", "overviewImageUrl", "overviewContentHtml", "createdAt", "updatedAt")
      VALUES (${planId}, ${String(data.group || '')}, ${String(data.weekStart || '')}, ${String(data.weekEnd || '')}, ${data.title || ''}, ${data.coachNotes || ''}, ${data.description || ''}, ${this.toJson(data.targetGroup || [])}, ${this.toJson(data.targetSwimmerIds || [])}, ${Boolean(data.isPublished)}, ${data.overviewImageUrl || null}, ${data.overviewContentHtml || null}, NOW(), NOW())
      RETURNING *
    `;
    return parsePlanJson(rows[0]);
  }

  async update(id: string, data: any) {
    const existing = await this.sql`SELECT * FROM "WeeklyPlan" WHERE "id" = ${id}`;
    const current = this.requireOne(existing, 'WeeklyPlan', id);

    const rows = await this.sql`
      UPDATE "WeeklyPlan" SET
        "group" = ${data.group ?? (current as any).group},
        "weekStart" = ${data.weekStart ?? (current as any).weekStart},
        "weekEnd" = ${data.weekEnd ?? (current as any).weekEnd},
        "title" = ${data.title ?? (current as any).title},
        "coachNotes" = ${data.coachNotes ?? (current as any).coachNotes},
        "description" = ${data.description ?? (current as any).description},
        "targetGroup" = ${data.targetGroup !== undefined ? this.toJson(data.targetGroup) : this.toJson((current as any).targetGroup || [])},
        "targetSwimmerIds" = ${data.targetSwimmerIds !== undefined ? this.toJson(data.targetSwimmerIds) : this.toJson((current as any).targetSwimmerIds || [])},
        "isPublished" = ${data.isPublished !== undefined ? Boolean(data.isPublished) : (current as any).isPublished},
        "overviewImageUrl" = ${data.overviewImageUrl !== undefined ? (data.overviewImageUrl ?? null) : (current as any).overviewImageUrl},
        "overviewContentHtml" = ${data.overviewContentHtml !== undefined ? (data.overviewContentHtml ?? null) : (current as any).overviewContentHtml},
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;
    return parsePlanJson(rows[0]);
  }

  async delete(id: string) {
    await this.sql`DELETE FROM "WeeklyPlan" WHERE "id" = ${id}`;
  }

  async addSession(data: any) {
    const rows = await this.sql`
      INSERT INTO "DailySession" ("id", "weeklyPlanId", "label", "date", "title", "imageData", "imageType", "contentBlocks", "trainingBlocks", "contentHtml", "notes", "sortOrder", "imageUrl", "editorMode", "trainingType", "primaryStroke", "createdAt", "updatedAt")
      VALUES (${data.id || crypto.randomUUID()}, ${String(data.weeklyPlanId)}, ${data.label || ''}, ${String(data.date)}, ${data.title}, ${data.imageData || ''}, ${data.imageType || ''}, ${this.toJson(data.contentBlocks || [])}, ${this.toJson(data.trainingBlocks || [])}, ${data.contentHtml || ''}, ${data.notes || ''}, ${Number(data.sortOrder) || 0}, ${data.imageUrl || null}, ${data.editorMode || 'legacy'}, ${data.trainingType || null}, ${data.primaryStroke || null}, NOW(), NOW())
      RETURNING *
    `;
    return parseSessionJson(rows[0]);
  }

  async updateSession(id: string, data: any) {
    const existing = await this.sql`SELECT * FROM "DailySession" WHERE "id" = ${id}`;
    const current = this.requireOne(existing, 'DailySession', id);

    const rows = await this.sql`
      UPDATE "DailySession" SET
        "date" = ${data.date ?? (current as any).date},
        "label" = ${data.label ?? (current as any).label},
        "imageData" = ${data.imageData !== undefined ? (data.imageData ?? '') : (current as any).imageData},
        "imageType" = ${data.imageType !== undefined ? (data.imageType ?? '') : (current as any).imageType},
        "title" = ${data.title ?? (current as any).title},
        "contentBlocks" = ${data.contentBlocks !== undefined ? this.toJson(data.contentBlocks) : (current as any).contentBlocks},
        "trainingBlocks" = ${data.trainingBlocks !== undefined ? this.toJson(data.trainingBlocks) : (current as any).trainingBlocks},
        "contentHtml" = ${data.contentHtml !== undefined ? String(data.contentHtml) : (current as any).contentHtml},
        "notes" = ${data.notes !== undefined ? String(data.notes) : (current as any).notes},
        "sortOrder" = ${data.sortOrder !== undefined ? Number(data.sortOrder) : (current as any).sortOrder},
        "imageUrl" = ${data.imageUrl !== undefined ? (data.imageUrl ?? null) : (current as any).imageUrl},
        "editorMode" = ${data.editorMode !== undefined ? String(data.editorMode) : ((current as any).editorMode ?? 'legacy')},
        "trainingType" = ${data.trainingType !== undefined ? (data.trainingType ?? null) : (current as any).trainingType},
        "primaryStroke" = ${data.primaryStroke !== undefined ? (data.primaryStroke ?? null) : (current as any).primaryStroke},
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;
    return parseSessionJson(rows[0]);
  }

  async deleteSession(id: string) {
    await this.sql`DELETE FROM "DailySession" WHERE "id" = ${id}`;
  }
})();
