import * as crypto from 'crypto';
import { BaseRepo } from './base';
import { hashPassword } from '@/lib/auth';

export const swimmerRepo = new (class extends BaseRepo {
  async list() {
    return this.sql`SELECT * FROM "Swimmer" ORDER BY "name" ASC`;
  }

  async create(data: any) {
    const hashedPassword = data.password ? await hashPassword(String(data.password)) : '';
    const swimmerId = crypto.randomUUID();
    const gender = data.gender === 'female' ? 'female' : 'male';

    const keysToFetch = ['head_basic_cap', 'eyes_basic_goggles'];
    if (gender === 'male') keysToFetch.push('body_basic_male', 'lower_basic_male');
    else keysToFetch.push('body_basic_female', 'lower_basic_female');

    const inventoryIds: string[] = [];
    const equippedMapping: Record<string, string> = {};

    try {
      const shopItems = await this.sql`SELECT id, "imageKey", "slotType" FROM "ShopItem" WHERE "imageKey" = ANY(${keysToFetch})`;
      shopItems.forEach((item: any) => {
        inventoryIds.push(item.id);
        equippedMapping[item.slotType] = item.id;
      });
    } catch (e) {
      console.error("Starter pack gear fetch failed:", e);
    }

    const initialXp = Number(data.xp) !== undefined && !isNaN(Number(data.xp)) ? Number(data.xp) : 200;
    const initialTotalXp = data.totalXp !== undefined ? Number(data.totalXp) : initialXp;
    const initialBalance = data.balance !== undefined ? Number(data.balance) : initialXp;

    const rows = await this.sql`
      INSERT INTO "Swimmer" ("id", "name", "group", "username", "password", "status", "readiness", "xp", "level", "gender", "totalXp", "balance", "inventory", "equippedItems", "wishlist", "currentStreak", "createdAt", "updatedAt")
      VALUES (${swimmerId}, ${String(data.name)}, ${String(data.group)}, ${String(data.username)}, ${hashedPassword || ''}, ${data.status || 'Active'}, ${Number(data.readiness) || 100}, ${initialXp}, ${Number(data.level) || 1}, ${gender}, ${initialTotalXp}, ${initialBalance}, ${JSON.stringify(inventoryIds)}, ${JSON.stringify(equippedMapping)}, '[]', 0, NOW(), NOW())
      RETURNING *
    `;

    try {
      const txId = crypto.randomUUID();
      await this.sql`
        INSERT INTO "XpTransaction" ("id", "swimmerId", "amount", "source", "description", "balanceAfter", "totalXpAfter", "createdAt")
        VALUES (${txId}, ${swimmerId}, ${initialBalance}, 'starter_pack', '新手入队大礼包', ${initialBalance}, ${initialTotalXp}, NOW())
      `;
    } catch (e) {
      console.error("Starter pack transaction failed:", e);
    }

    return rows[0];
  }

  async update(id: string, data: any) {
    const existing = await this.sql`SELECT * FROM "Swimmer" WHERE "id" = ${id}`;
    const current = this.requireOne(existing, 'Swimmer', id);

    const fields: string[] = [];
    const values: any[] = [];
    const addField = (col: string, val: any) => {
      fields.push(`"${col}" = $${values.length + 1}`);
      values.push(val);
    };

    const merge = (col: string, key: string, transform?: (v: any) => any) => {
      if (data[key] !== undefined) {
        addField(col, transform ? transform(data[key]) : data[key]);
      } else {
        addField(col, (current as any)[col]);
      }
    };

    // SECURITY: Only merge profile-safe fields. Never allow client to set xp, level,
    // balance, totalXp, inventory, equippedItems, wishlist, status, or password
    // through the general update path — those require dedicated endpoints.
    merge('name', 'name', String);
    merge('group', 'group', String);
    merge('username', 'username', String);
    merge('readiness', 'readiness', Number);
    merge('gender', 'gender', String);

    // SECURITY: inventory/equippedItems/wishlist are managed exclusively by the shop endpoint
    // to enforce balance checks and ownership validation. Preserve current values here.
    addField('inventory', (current as any).inventory || '[]');
    addField('equippedItems', (current as any).equippedItems || '{}');
    addField('wishlist', (current as any).wishlist || '[]');

    if (data.injuryNote === null || data.injuryNote === '') addField('injuryNote', null);
    else if (data.injuryNote !== undefined) addField('injuryNote', String(data.injuryNote));
    else addField('injuryNote', (current as any).injuryNote);

    if (data.injuryImageUrl === null || data.injuryImageUrl === '') addField('injuryImageUrl', null);
    else if (data.injuryImageUrl !== undefined) addField('injuryImageUrl', String(data.injuryImageUrl));
    else addField('injuryImageUrl', (current as any).injuryImageUrl);

    if (data.lastProfileUpdate === null) addField('lastProfileUpdate', null);
    else if (data.lastProfileUpdate !== undefined) addField('lastProfileUpdate', String(data.lastProfileUpdate));
    else addField('lastProfileUpdate', (current as any).lastProfileUpdate);

    if (data.mainStroke === null) addField('mainStroke', null);
    else if (data.mainStroke !== undefined) addField('mainStroke', String(data.mainStroke));
    else addField('mainStroke', (current as any).mainStroke);

    if (data.injuryBodyMap !== undefined) {
      const v = data.injuryBodyMap === null ? null : typeof data.injuryBodyMap === 'string' ? data.injuryBodyMap : JSON.stringify(data.injuryBodyMap);
      addField('injuryBodyMap', v);
    } else {
      const v = (current as any).injuryBodyMap ? (typeof (current as any).injuryBodyMap === 'string' ? (current as any).injuryBodyMap : JSON.stringify((current as any).injuryBodyMap)) : null;
      addField('injuryBodyMap', v);
    }

    if (data.password && !String(data.password).includes(':')) {
      addField('password', await hashPassword(String(data.password)));
    }

    fields.push('"updatedAt" = NOW()');
    fields.push('"id"'); // placeholder — we filter by id below

    const query = `UPDATE "Swimmer" SET ${fields.filter(f => f !== '"id"').join(', ')} WHERE "id" = $${values.length + 1} RETURNING *`;
    values.push(id);
    const result = await this.sql(query, values);
    return result[0];
  }

  async delete(id: string) {
    await this.sql`DELETE FROM "Swimmer" WHERE "id" = ${id}`;
  }
})();
