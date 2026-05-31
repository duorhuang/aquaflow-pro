# AquaFlow Pro — 技术债与 Codebase 质量审计

> **审计日期**: 2026-05-29
> **审计范围**: 整体 UX codebase（前端架构、状态管理、API 层、类型系统、项目卫生）
> **状态**: ✅ 讨论完成，待实施

---

## 概述

对 AquaFlow Pro 的 UX codebase 进行了全面审计，识别出 **7 大类技术债**。以下按优先级排序，每项均包含现状分析、影响评估和已确认的改进方案。

---

## 🔴 P0 — 高优先级

### 1. 类型安全严重缺失（`any` 疫疾）

**现状**：
- `lib/api-client.ts` 中有 **25+ 处** `data: any` 和 `fetchAPI<any>`
- `lib/store.tsx` 中 `weeklyPlans: any[]`、`announcements: any[]` 等核心状态全是 `any`
- 全项目共 **93 处** `as any` 强制类型转换
- `lib/store/entity-crud.ts` 的 `addAnnouncement(data: any)` 等接口完全无类型约束

**影响**：
- 编译时无法捕获任何字段拼写错误、缺失字段、类型不匹配
- `types/index.ts` 中有完整的 `WeeklyPlan`、`Announcement` 等类型定义，但很多地方根本没用上
- 运行时 bug 难以排查，重构风险高

**确认方案**：全面清理 any，强类型贯穿 `api-client` → `store` → `components`

**涉及文件**：
- `lib/api-client.ts` — 所有 API 方法添加正确的泛型参数和入参类型
- `lib/store.tsx` — `weeklyPlans: WeeklyPlan[]`, `announcements: Announcement[]` 等
- `lib/store/entity-crud.ts` — 所有 CRUD 函数参数类型化
- `lib/store/sync-engine.ts` — `onLoad`/`onSync` 的 callback 参数类型化
- `types/index.ts` — 可能需要补充 `SyncResponse` 接口

---

### 2. Store 架构 — 单一巨大 Context 导致性能隐患

**现状**：
- `lib/store.tsx` 是一个单一 Context，包含 **9 个状态 collection + 25+ 个方法**
- 任何一个 collection 变化，整个 App 树都会 re-render
- `handleLoad` 和 `handleSync` 内有**大量重复的转换逻辑**（`transformedDaily` 在两处完全相同）

**影响**：
- 每次打卡（attendance 变化），整个训练计划、通知、成绩等 UI 都会重渲染
- 大数据量下可能产生卡顿

**确认方案**：拆分成多个独立的 Zustand store（swimmers, plans, attendance 等），彻底解耦

**涉及文件**：
- `lib/store.tsx` → 拆分为 `lib/stores/swimmers.ts`, `lib/stores/plans.ts`, `lib/stores/attendance.ts` 等
- `lib/store/entity-crud.ts` → 合并到各 store 内
- `lib/store/sync-engine.ts` → 适配新 store 架构
- `lib/store/persist-layer.ts` → 适配新 key 结构
- 所有使用 `useStore()` 的组件 → 改为 `useSwimmers()`, `usePlans()` 等

---

### 3. 增量同步改造

**现状**：
- `/api/sync` 每次请求执行 **9 个并行 SQL 查询**，加载所有 plans、swimmers、feedbacks、attendance 等
- 还有 2 次额外子查询（sessions, announcement blocks）
- `sync-engine.ts` 每 60s 轮询一次，每次都是**全量加载**
- 代码中已有 Neon quota 检测逻辑（说明**以前已经触及过配额**）

**影响**：
- 数据量增长后，每次 sync 传输大量数据
- 浪费数据库 transfer quota

**确认方案**：让 `/api/sync` 支持增量同步（发 `lastSyncTimestamp`，只返回变更的记录），大幅减少每次传输量

**涉及文件**：
- `app/api/sync/route.ts` — 接受 `?since=<timestamp>` 参数，SQL 加 `WHERE "updatedAt" > $timestamp`
- `lib/store/sync-engine.ts` — 记录 lastSyncTimestamp，发送增量请求
- 数据库 schema — 可能需要确保所有表都有 `updatedAt` 字段

---

## 🟠 P1 — 中优先级

### 4. "巨无霸"组件拆分

**现状**：
- `app/(athlete)/workout/page.tsx` 有 **934 行**，包含日历、训练计划显示、状态表单、统计、月报等所有逻辑
- `components/dashboard/PlanModuleEditor.tsx` 有 **610 行**

**具体问题**：
- `workout/page.tsx` 内有 `getSelectedDatePlans()`、`getMonthlyStats()`、`isWeeklyPlanVisible()` 等完整业务函数，应该提取到 hooks 或 utils
- `isWeeklyPlanVisible()` 函数内有复杂的 `JSON.parse` try/catch 逻辑——说明后端的 `targetGroup` 有时是 string、有时是 array，类型不一致
- 硬编码的中文字符串散落在各处

**确认方案**：保留现有结构，做局部拆分（提取 WeeklyCalendar 和 StatusForm 为独立组件）

**涉及文件**：
- `app/(athlete)/workout/page.tsx` → 拆出 `components/athlete/WeeklyCalendar.tsx` + `components/athlete/StatusForm.tsx`
- 业务逻辑函数 → 提取到 `hooks/useWorkoutData.ts`

---

### 5. i18n 补全 — 消除硬编码中文

**现状**：
- 已有完整 i18n 系统：`lib/i18n.tsx` + `lib/dictionary.ts` (17,960 bytes)
- 但 `workout/page.tsx` 中多处硬编码中文："回到本周"、"14天连续训练"、"本月训练率位列全队前 3%"
- `SwimmerStatusPanel.tsx` 中 "队员状态监控"、"竞技状态"、"打赏寄语" 等全是硬编码
- `dashboard/page.tsx` 则规范地用了 `t.common.dashboard`、`t.dashboard.coachFeed`

**结果**：切换英文时，部分 UI 还是显示中文，体验不一致

**确认方案**：把所有硬编码中文迁移到 `dictionary.ts`。中文用户优先，但也为未来英文用户预留

**涉及文件**：
- `lib/dictionary.ts` — 添加缺失的翻译 key
- `app/(athlete)/workout/page.tsx` — 替换所有硬编码字符串
- `components/dashboard/SwimmerStatusPanel.tsx` — 替换硬编码
- 其他含硬编码中文的组件 — 逐一迁移

---

### 6. API Handler 重构 — 消除 `__req__` hack

**现状**：
```typescript
// lib/api-handler.ts
export function handleCoach(req: Request, handler: AuthHandlerFn): Promise<NextResponse> {
  return withApiHandler(async () => {
    (handler as any).__req__ = req; // ← hacky: 把 request 挂在函数对象上
    const result = await requireCoach(req);
    if (result instanceof NextResponse) return result;
    return handler(req, result);
  });
}
```

- 这是为了解决 closure scope 问题，但 `(handler as any).__req__` 是不稳定且不安全的
- 同一模式在 `handleCoach`、`handleAnyAuth`、`handleAthlete` 三处重复

**确认方案**：重写成直接传参模式，消除 hack

**涉及文件**：
- `lib/api-handler.ts` — 重构 3 个 handler 函数
- 无需修改调用方（接口签名不变）

---

## 🟡 P2 — 低优先级但需立即执行

### 7. 项目卫生 — 残留文件清理

**现状**：

**重复文件** (macOS Finder 复制产生):
- `hooks/useBackgroundTheme 2.ts`
- `hooks/useWaterRipple 2.ts`
- `.eslintignore 2`

**残留 debug/build 文件** (项目根目录):
- `diff1.txt`, `diff2.txt`, `diff3.txt`
- `build-output.log`, `lint_output.txt`, `targeted_lint_output.txt`
- `next_build_output.txt`, `next_build_single.log`, `next_build_final.log`
- `curl_output.txt`, `npm_logs.txt` (340KB!)
- `cleanup-test-data.ts`, `set-password.ts`, `test-db.ts`, `test-neon.ts`
- `final-force-deploy.sh`

**老旧 build 目录**:
- `.next-old-30759/`, `.next-old-31216/`, `.next-old-32352/`, `.next-old-98618/`
- `.open-next-old-30759/`, `.open-next-old-31216/`, `.open-next-old-32352/`, `.open-next-old-98618/`

**确认方案**：删除所有残留文件，更新 `.gitignore`

---

## 🔍 其他观察（暂不列为技术债）

### Sync 的 Local Merge 逻辑
`handleLoad` 中有一段将 localStorage 数据与 DB 数据合并的逻辑（按 id 去重），这在某些边缘场景（如离线创建后重新上线）可能产生数据冲突。目前可观察。

### Prisma vs Raw SQL 混用
项目同时使用 Prisma Client 和 `@neondatabase/serverless` 直接 SQL。`/api/sync` 用的是原生 SQL，而 repos 层可能用 Prisma。需要统一为一种方案。

### CSS 设计系统完善度
`globals.css` 的设计系统（theme tokens, glassmorphism, wave animations）非常完善，这是项目的亮点。

---

## 实施计划

| 阶段 | 内容 | 估计工作量 |
|------|------|-----------|
| Phase 0 | 项目卫生清理（删除残留文件） | 0.5h |
| Phase 1 | 类型安全改造（消除 any） | 4-6h |
| Phase 2 | Zustand store 重构 | 6-8h |
| Phase 3 | 增量同步改造 | 4-6h |
| Phase 4 | 组件拆分 + i18n 补全 | 3-4h |
| Phase 5 | API handler 重构 | 1-2h |

> **总估计**: 约 18-26 小时工作量

---

*此文档由 Grill-Me 技术讨论生成，已经过用户确认。*
