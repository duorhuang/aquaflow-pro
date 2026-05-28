import * as crypto from 'crypto';
import { BaseRepo } from './base';
import { calculateLevel } from '@/lib/date-utils';

export const attendanceRepo = new (class extends BaseRepo {
  async list() {
    const rows = await this.sql`
      SELECT "AttendanceRecord".*, row_to_json("Swimmer") as swimmer
      FROM "AttendanceRecord"
      LEFT JOIN "Swimmer" ON "AttendanceRecord"."swimmerId" = "Swimmer"."id"
      ORDER BY "AttendanceRecord"."date" DESC
    `;
    return rows.map((a: any) => ({
      ...a,
      swimmer: a.swimmer && Object.keys(a.swimmer).length > 1 ? a.swimmer : null,
    }));
  }

  async create(data: any) {
    const rows = await this.sql`
      INSERT INTO "AttendanceRecord" ("id", "date", "swimmerId", "status", "timestamp", "createdAt")
      VALUES (${data.id || crypto.randomUUID()}, ${String(data.date)}, ${String(data.swimmerId)}, ${String(data.status || 'Present')}, ${data.timestamp || new Date().toISOString()}, NOW())
      RETURNING *
    `;
    return rows[0];
  }

  async delete(id: string) {
    await this.sql`DELETE FROM "AttendanceRecord" WHERE "id" = ${id}`;
  }

  async processCheckIn(swimmerId: string, checkInDate: string, status: string, data: any) {
    const swimmers = await this.sql`SELECT * FROM "Swimmer" WHERE "id" = ${swimmerId}`;
    if (swimmers.length === 0) return { error: 'Swimmer not found', status: 404 };
    const swimmer = swimmers[0];

    const existing = await this.sql`SELECT * FROM "AttendanceRecord" WHERE "swimmerId" = ${swimmerId} AND "date" = ${checkInDate}`;
    if (existing.length > 0) return { error: 'Already checked in for today', status: 400 };

    const plans = await this.sql`SELECT * FROM "TrainingPlan" WHERE "group" = ${swimmer.group} AND "date" = ${checkInDate}`;
    const isTrainingDay = plans.length > 0;

    const recordId = data.id || crypto.randomUUID();
    const recordRows = await this.sql`
      INSERT INTO "AttendanceRecord" ("id", "date", "swimmerId", "status", "timestamp", "createdAt")
      VALUES (${recordId}, ${checkInDate}, ${swimmerId}, ${status}, ${data.timestamp || new Date().toISOString()}, NOW())
      RETURNING *
    `;
    const record = recordRows[0];

    if (!isTrainingDay) return record;

    // Streak calculation
    const pastPlans = await this.sql`SELECT DISTINCT date FROM "TrainingPlan" WHERE "group" = ${swimmer.group} AND "date" <= ${checkInDate} ORDER BY "date" DESC`;
    const swimmerCheckIns = await this.sql`SELECT date FROM "AttendanceRecord" WHERE "swimmerId" = ${swimmerId} AND "status" IN ('Present', 'AthletePresent')`;
    const checkedDates = new Set(swimmerCheckIns.map((a: any) => a.date));
    checkedDates.add(checkInDate);

    let newStreak = 0;
    for (const p of pastPlans) {
      if (checkedDates.has(p.date)) newStreak++;
      else break;
    }

    let totalXpEarned = 50;
    let streakBonus = 0;
    if (newStreak >= 3) {
      streakBonus = Math.min(50, (newStreak - 2) * 10);
      totalXpEarned += streakBonus;
    }

    // Buddy check
    let isBuddySyncAwarded = false;
    let buddyName = '';
    const buddyPairs = await this.sql`SELECT * FROM "BuddyPair" WHERE "status" = 'active' AND ("swimmer1Id" = ${swimmerId} OR "swimmer2Id" = ${swimmerId})`;
    if (buddyPairs.length > 0) {
      const pair = buddyPairs[0];
      const buddyId = pair.swimmer1Id === swimmerId ? pair.swimmer2Id : pair.swimmer1Id;
      const buddyCheckIn = await this.sql`SELECT * FROM "AttendanceRecord" WHERE "swimmerId" = ${buddyId} AND "date" = ${checkInDate} AND "status" IN ('Present', 'AthletePresent')`;
      if (buddyCheckIn.length > 0) {
        isBuddySyncAwarded = true;
        totalXpEarned += 20;
        const buddies = await this.sql`SELECT name, "totalXp", balance FROM "Swimmer" WHERE id = ${buddyId}`;
        if (buddies.length > 0) {
          const buddy = buddies[0];
          buddyName = buddy.name;
          const buddyNewTotalXp = (buddy.totalXp || 0) + 20;
          const buddyNewBalance = (buddy.balance || 0) + 20;
          await this.sql`UPDATE "Swimmer" SET "totalXp" = ${buddyNewTotalXp}, "balance" = ${buddyNewBalance}, "updatedAt" = NOW() WHERE id = ${buddyId}`;
          await this.sql`INSERT INTO "XpTransaction" ("id", "swimmerId", "amount", "source", "description", "balanceAfter", "totalXpAfter", "createdAt") VALUES (${crypto.randomUUID()}, ${buddyId}, 20, 'buddy', ${`死党同步打卡额外奖励 (${swimmer.name} 已打卡)`}, ${buddyNewBalance}, ${buddyNewTotalXp}, NOW())`;
          await this.sql`INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "xpAmount", "isRead", "createdAt") VALUES (${crypto.randomUUID()}, ${buddyId}, 'buddy_sync', '死党同步打卡奖励！', ${`你和死党 ${swimmer.name} 今天都完成了打卡，额外获得 20 XP！`}, 20, false, NOW())`;
        }
      }
    }

    const newTotalXp = (swimmer.totalXp || 0) + totalXpEarned;
    const newBalance = (swimmer.balance || 0) + totalXpEarned;
    const newLevel = calculateLevel(newTotalXp);
    const levelChanged = newLevel > (swimmer.level || 1);

    await this.sql`UPDATE "Swimmer" SET "totalXp" = ${newTotalXp}, "balance" = ${newBalance}, "currentStreak" = ${newStreak}, "level" = ${newLevel}, "xp" = ${newTotalXp}, "updatedAt" = NOW() WHERE "id" = ${swimmerId}`;
    await this.sql`INSERT INTO "XpTransaction" ("id", "swimmerId", "amount", "source", "description", "balanceAfter", "totalXpAfter", "createdAt") VALUES (${crypto.randomUUID()}, ${swimmerId}, ${totalXpEarned}, 'attendance', ${`每日训练打卡 (连胜:${newStreak}天, 包含加成:${streakBonus} XP${isBuddySyncAwarded ? ', 死党加成:20 XP' : ''})`}, ${newBalance}, ${newTotalXp}, NOW())`;
    await this.sql`INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "xpAmount", "isRead", "createdAt") VALUES (${crypto.randomUUID()}, ${swimmerId}, 'xp_earned', ${`每日训练打卡 +${totalXpEarned} XP！`}, ${`基础奖励 50 XP${streakBonus > 0 ? ` + 连胜奖励 ${streakBonus} XP` : ''}${isBuddySyncAwarded ? ` + 死党同步奖励 20 XP (死党:${buddyName})` : ''}。当前连胜已达 ${newStreak} 天！`}, ${totalXpEarned}, false, NOW())`;

    if (levelChanged) {
      const getTitle = (lvl: number) => {
        if (lvl === 8) return '👑 传奇冠军';
        if (lvl === 7) return '🔱 海神之子';
        if (lvl === 6) return '⚡ 闪电泳者';
        if (lvl === 5) return '🏊 精英泳者';
        if (lvl === 4) return '🦈 资深泳者';
        if (lvl === 3) return '🐬 进阶泳者';
        if (lvl === 2) return '🐟 初级泳者';
        return '🐣 游泳新手';
      };
      await this.sql`INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "isRead", "createdAt") VALUES (${crypto.randomUUID()}, ${swimmerId}, 'levelup', ${`恭喜你升级到 Lv.${newLevel}！`}, ${`解锁新称号: 「${getTitle(newLevel)}」！`}, false, NOW())`;
    }

    return record;
  }
})();
