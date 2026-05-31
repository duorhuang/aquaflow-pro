# PRD: AquaFlow Pro — 游泳镜面 UI 重构与功能扩展

**Date:** 2026-05-28
**Author:** AquaFlow Pro Team
**Status:** Planning
**Labels:** enhancement, documentation

---

## Problem Statement

作为一个服务于北京某游泳队（1-2 名教练，10-30 名队员）的训练管理网站，AquaFlow Pro 当前的 UI 风格偏"SaaS 仪表盘"，缺乏与游泳运动本身的情感连接。虽然已经有了基础的水色主题、时间背景切换和玻璃拟态面板，但整体视觉仍然科技感过重、缺乏"水"的真实质感。

同时，产品还缺少以下功能：
- 游泳名将格言激励系统
- 照片墙（团队活动照片分享）
- 名人堂（成绩/经验值良性竞争展示）
- 比赛备战倒计时
- 基于训练类型的动态背景匹配

教练和队员都需要一个在视觉上与"泳池"紧密关联、操作时能产生愉悦感的界面，同时保持功能性和专业性。

---

## Solution

进行一次系统化的 UI 重构，核心策略是：

1. **Bing 首页风格的真实照片背景系统** — 用 54-65 张 CC0 真实泳池照片替代纯色渐变，按训练类型 × 时间段自动匹配
2. **水面折射玻璃拟态面板（Glassmorphism 2.0）** — 让卡片像浸在水里一样，透出背景、带有水面反光
3. **LED 计时板字体** — 对数值型数据（成绩时间、距离、XP、倒计时）使用发光数码管风格
4. **全局水波纹点击反馈** — 每次点击都有自然的"水面涟漪"确认感
5. **游泳名人格言语录** — 中英文对照，大库存随机显示
6. **三个新功能** — 照片墙、名人堂、比赛备战倒计时

所有改动保持视觉统一性 — 教练端和队员端看起来是同一套产品。

---

## User Stories

### 背景照片系统

1. 作为队员，我希望打开训练页面时能看到一张真实、美观的泳池照片作为背景，这样我会觉得这个网站是专门为游泳设计的
2. 作为教练，当我发布一个冲刺训练计划时，我希望页面背景自动切换成"动感溅水"风格的泳池照片，让训练类型和视觉氛围同步
3. 作为用户，我希望背景照片每天自动轮换，不会每天都看到同一张
4. 作为用户，我希望如果教练没有布置任何训练计划，页面仍然有好看的默认背景照片，不会显得很空
5. 作为用户，我希望在夜晚（20:00-6:00 北京时间）看到的是带有真实星空/月光的泳池夜景照片，而不是用 CSS 假星光叠加的效果

### 玻璃拟态面板（Glassmorphism 2.0）

6. 作为用户，我希望所有卡片面板都有"浸在水里"的半透明质感，能看到背景透过来，而不是生硬的纯色块
7. 作为用户，我希望卡片顶部有像水面反光一样的微弱高光边框，增加真实感
8. 作为用户，我希望鼠标悬停卡片时有自然的浮力上浮效果，而不是生硬的阴影变化

### LED 计时板字体

9. 作为运动员，我希望看到我的比赛成绩时间像游泳馆电子计时板那样显示（数码管发光字体），让我产生身临其境的感觉
10. 作为用户，我希望训练距离（如 3200m）、XP 数值、等级数字、比赛倒计时都用 LED 风格显示
11. 作为用户，我希望普通文字（标题、正文、标签）保持清晰的常规字体，不要被 LED 风格影响

### 水波纹点击反馈

12. 作为用户，我希望点击页面任何部位时都有一个小的水波纹反馈，让我确认点击已经被接收
13. 作为用户，我希望在重浓度页面（训练页）水波纹更明显，在低浓度页面（数据管理页）水波纹更微弱

### 游泳名人格言

14. 作为运动员，我希望登录时能看到一句游泳名将或体育精神的中英文对照格言，给我训练前的心理暗示和鼓励
15. 作为运动员，我希望在训练页面底部有一个专门的格言展示区域，游完训练后能看到一句启发性话语
16. 作为用户，我希望格言库存足够大（100+ 条），每隔几个月才重复一次
17. 作为用户，我希望格言内容多样化 — 游泳名将、体育精神、哲学思考都涵盖

### 照片墙

18. 作为教练或队员，我希望能上传比赛/训练照片到团队照片墙
19. 作为教练，我希望所有上传的照片都要经过我的审核后才能公开显示
20. 作为用户，我希望照片墙按比赛/活动分类展示，我可以点击查看特定比赛的照片
21. 作为用户，我希望照片采用平铺式网格展示，美观且易于浏览
22. 作为用户，我希望照片在上传 2-4 周后自动从首页消失，归档到历史记录中，但随时可以查看
23. 作为用户，我希望归档历史中不仅能看照片，还能看曾经的训练计划、教练动态等所有历史数据

### 名人堂

24. 作为用户，我希望能看到一个名人堂页面，展示优秀队员的 PB、XP 等级、比赛获奖记录
25. 作为教练，我希望名人堂可以自动生成（根据 PB 数、XP 等级）同时支持手动置顶某人
26. 作为用户，我希望名人堂分为多个榜单 — XP 榜、PB 榜、比赛获奖榜
27. 作为用户，我希望名人堂对教练端和队员端都开放，让所有人看到
28. 作为教练，我希望队员上传的比赛成绩需经过我的批准后才能计入名人堂

### 比赛备战模式

29. 作为用户，当教练创建了一个即将到来的比赛（Meet），我希望在训练页面顶部能看到一个出发台倒计时牌，显示距离比赛还有多少天
30. 作为用户，在备战期间，我希望背景照片切换成"出发台"风格 — 冷蓝色调、空旷泳池、紧张感
31. 作为用户，我希望倒计时使用 LED 计时板风格显示

### 光照与时间系统

32. 作为用户，我希望所有光照效果（晨光、阳光、黄昏光、月光）都严格跟随北京时间（Asia/Shanghai），不随我的设备时区变化
33. 作为用户，我希望清晨看到的是真实的金色阳光泳池照片，正午是强光水面照片，黄昏是暖色调照片 — 不是 CSS 渐变模拟
34. 作为用户，我希望时间段的划分是合理的：清晨(6-9)、上午(9-12)、正午(12-14)、下午(14-17)、黄昏(17-20)、夜晚(20-6)

### 页面浓度分级

35. 作为运动员，我希望训练页面（/workout）有最强的泳池沉浸感 — 池底瓷砖纹理背景 + 泳道线分隔 + LED 数字 + 动态水下光
36. 作为教练，我希望教练首页和计划编辑页有中等程度的泳池识别感 — 微弱纹理 + LED 数字，但不干扰操作
37. 作为教练，我希望运动员管理、反馈浏览、设置等数据密集页面保持干净简洁 — 只用基础玻璃面板 + LED 数字
38. 作为用户，我希望不同浓度页面之间的过渡是平滑的，不要让人感到"换了个网站"

### 系统一致性

39. 作为用户，我希望教练端和队员端看起来是同一套产品 — 共享相同的设计语言、卡片风格、字体、配色
40. 作为用户，我希望页面切换是快速的，不要有多余的切换动画
41. 作为用户，我希望加载状态尽可能少出现；必须出现时用一个"游泳者划水"的 spinner 图标

### 侧边栏与导航

42. 作为教练，我希望侧边栏是半透明玻璃面板，透出背景的泳池照片
43. 作为教练，我希望导航项之间有极淡的泳道线珠串做分隔
44. 作为运动员，我希望底部 tab bar 顶部有一条微微波动的水线效果
45. 作为运动员，我希望选中某个 tab 时有一个微妙的"入水"高亮效果

### 加载与性能

46. 作为用户，我希望背景照片加载不会阻塞页面内容渲染 — 先看到内容，背景慢慢显现
47. 作为用户，我希望背景照片经过压缩（WebP 格式），加载速度足够快

---

## Implementation Decisions

### 1. 背景照片系统

| 决策 | 详情 |
|------|------|
| **存储位置** | `public/backgrounds/` 目录，随代码部署 |
| **照片数量** | 54 张主照片（9 训练类型 × 6 时间段）+ 每格 2-4 张备选 + 7 张 fallback = 总计约 120-180 张 |
| **照片来源** | Unsplash CC0 照片 |
| **格式** | WebP, 80% 质量, 1920px 宽 |
| **命名规则** | `{trainingType}-{timePeriod}-{index}.webp`，如 `sprint-morning-01.webp` |
| **匹配逻辑** | XY 轴：训练类型优先 → 时间段 fallback → 随机 fallback |
| **时间计算** | `Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai' })` 强制北京时间 |
| **轮换机制** | 每天随机从匹配池中选一张（localStorage 缓存当天选择） |
| **渲染方式** | 照片作为底层，CSS overlay 仅做 5% 色调统一，不做假星光/假阳光 |
| **预加载** | 页面加载时 `link rel="preload"` 当前背景照片 |

### 2. 训练类型 × 时间段 匹配矩阵

| trainingType | 时间段 | 匹配照片主题 |
|-------------|--------|-------------|
| `sprint` | morning | 晨光中溅起水花的泳池 |
| `sprint` | midday | 强光下激烈划水 |
| `sprint` | night | 夜间溅水训练 |
| `aerobic` | morning | 平静晨光的泳池 |
| `aerobic` | midday | 明亮平静水面 |
| `aerobic` | night | 平静夜空泳池 |
| `recovery` | morning | 温柔晨光/温水 |
| `recovery` | midday | 柔和水面 |
| `recovery` | night | 安静夜空 |
| `anaerobic` | morning | 晨光力量训练 |
| `anaerobic` | midday | 强光力量感 |
| `anaerobic` | night | 暗夜力量 |
| `lactate` | morning | 晨光滑道 |
| `lactate` | midday | 强光泳道 |
| `lactate` | night | 夜光滑道 |
| `strength` | morning | 晨光深水区 |
| `strength` | midday | 强光深水 |
| `strength` | night | 夜深水 |
| `race_prep` | morning | 晨光出发台 |
| `race_prep` | midday | 强光出发台 |
| `race_prep` | night | 夜出发台 |
| `endurance` | morning | 晨光耐力训练 |
| `endurance` | midday | 强光耐力 |
| `endurance` | night | 夜耐力训练 |
| `relaxation` | morning | 温柔晨光放松 |
| `relaxation` | midday | 柔和放松 |
| `relaxation` | night | 安静放松夜空 |
| *(no plan)* | morning | 清晨空泳池 |
| *(no plan)* | midday | 正午空泳池 |
| *(no plan)* | night | 夜晚空泳池 |

### 3. Glassmorphism 2.0 — 水面折射面板

| 决策 | 详情 |
|------|------|
| **背景透明度** | `rgba(10, 25, 47, 0.35-0.45)` — 比现有的 0.55 更透 |
| **顶部边框** | `border-top: 1px solid rgba(255, 255, 255, 0.12)` — 模拟水面顶部反光 |
| **其他边框** | `border: 1px solid rgba(100, 255, 218, 0.08)` — 水面侧光 |
| **阴影** | `box-shadow: 0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)` — 水中沉没感 |
| **Hover 效果** | `translateY(-2px)` + 边框增强 — 浮力上浮 |
| **内发光** | 微弱 `inset box-shadow` 模拟侧面水光 |
| **保留** | `backdrop-filter: blur(20px)` — 保持模糊透感 |

### 4. LED 计时板字体系统

| 决策 | 详情 |
|------|------|
| **适用元素** | 成绩时间、训练距离、XP 数值、等级数字、比赛倒计时 |
| **不适用元素** | 正文、标题、标签、按钮文字、日期戳 |
| **字体** | `JetBrains Mono` + `font-weight: 700` |
| **发光效果** | `text-shadow: 0 0 8px currentColor, 0 0 20px rgba(100, 255, 218, 0.3)` |
| **颜色** | 跟随 CSS `--primary`（teal `#64ffda`），比赛备战时跟随主题色 |
| **实现** | 新建 `.led-display` CSS class，配合现有 `font-display-metrics` |

### 5. 全局水波纹点击反馈

| 决策 | 详情 |
|------|------|
| **实现方式** | 全局事件监听 `document.addEventListener('click')`，在点击位置创建一个绝对定位的圆形涟漪元素 |
| **浓度分级** | 重浓度页面：波纹直径 60px，opacity 0.4；低浓度页面：波纹直径 30px，opacity 0.15 |
| **动画** | 复用现有 `water-ripple` keyframes |
| **排除元素** | 输入框、下拉菜单、滚动区域不触发 |

### 6. 格言系统

| 决策 | 详情 |
|------|------|
| **存储** | `lib/quotes.ts` — 前端数组（100+ 条），未来可扩展为 API |
| **格式** | `{ zh: "...", en: "...", author: "...", category: "swimming" | "sports" | "philosophy" }` |
| **显示位置** | 登录页（随机一句）、`/workout` 底部固定区域 |
| **刷新频率** | 登录页：每次刷新随机；训练页：每天固定（localStorage 缓存） |
| **组件** | `QuoteCard.tsx` — 中英文对照展示框 |

### 7. 照片墙

| 决策 | 详情 |
|------|------|
| **数据库表** | `PhotoAlbum`（相册）+ `Photo`（单张照片） |
| **存储** | R2 bucket（`aquaflow-uploads/photos/`） |
| **上传权限** | 教练 + 队员均可上传 |
| **审核机制** | `status: "pending" | "approved" | "rejected"`，教练审核后显示 |
| **分类** | 按 `Meet` 或自定义相册名分组 |
| **展示** | Masonry 或网格平铺布局 |
| **归档** | 上传 21 天后 `autoArchive = true`，从首页消失但可通过 Archive 查看 |
| **API** | `GET/POST /api/photos`、`PATCH /api/photos/:id`（审核）、`DELETE /api/photos/:id` |

### 8. 名人堂

| 决策 | 详情 |
|------|------|
| **数据库表** | `HallOfFameEntry` — 手动/自动条目 |
| **自动生成** | 基于 `PerformanceRecord.isPB = true` + `Swimmer.totalXp` 排序 |
| **教练批准** | PB 成绩需教练 `approved = true` 后才上榜 |
| **手动条目** | 教练可手动添加"本月之星"等 |
| **分类** | `type: "pb" | "xp" | "meet_award" | "monthly_star"` |
| **展示** | 头像/照片 + 成绩卡片，分 Tab 展示不同榜单 |
| **页面** | `/hall-of-fame`（两端共用）|
| **API** | `GET /api/hall-of-fame`、`POST /api/hall-of-fame`（教练）、`PATCH /api/hall-of-fame/:id`（批准） |

### 9. 比赛备战模式

| 决策 | 详情 |
|------|------|
| **触发条件** | 当存在 `Meet.isActive = true` 且 `Meet.date` 在未来 14 天内 |
| **倒计时位置** | `/workout` 页面顶部，"出发台计时牌"样式 |
| **倒计时格式** | LED 风格：`12 天 08 时 32 分 15 秒`，每秒更新 |
| **背景变化** | 优先匹配 `race_prep` 类型照片；无比赛计划时使用 `race_prep` 时间段照片 |
| **色调** | 冷蓝色（出发台灯光）+ 红色高亮倒计时数字 |

### 10. 侧边栏与导航改造

| 决策 | 详情 |
|------|------|
| **Sidebar** | 半透明玻璃面板（新的 glassmorphism），导航项之间用珠串 divider 每 4 项分隔一次 |
| **MobileNav** | 同样使用半透明玻璃 |
| **BottomTabBar** | 顶部水线效果（1px 高度 + CSS wave 动画） |
| **Tab 选中** | 颜色变化 + 微弱底部发光（不用"入水"动画以免太慢） |

### 11. 字体层级

| 层级 | 字体 | 用途 |
|------|------|------|
| Display | `JetBrains Mono, 700` + LED glow | 成绩时间、距离、XP、等级、倒计时 |
| Body | `Noto Sans SC, PingFang SC, system` | 正文、标题、描述 |
| Label | `JetBrains Mono, 500, letter-spacing 0.1em` | 小标签、时间戳标记 |

### 12. 训练类型选择器（教练端）

| 决策 | 详情 |
|------|------|
| **位置** | `PlanModuleEditor` 中新增"训练性质"选择区 |
| **UI** | 图标卡片网格 — 每个类型一张小卡片，带图标和名称 |
| **已有字段** | `TrainingPlan.trainingType` — schema 中已存在，无需修改 |

### 13. 游泳 Spinner

| 决策 | 详情 |
|------|------|
| **形式** | SVG 游泳者图标，原地做划水循环动画 |
| **使用场景** | 替换现有 Skeleton 中的脉冲圆点 |
| **实现** | 新建 `SwimSpinner.tsx` 组件 |

### 14. Schema 变更

```prisma
// 新增表

model PhotoAlbum {
  id          String   @id @default(cuid())
  name        String   // e.g. "2026春季锦标赛"
  meetId      String?  // Optional link to Meet
  description String?
  createdAt   DateTime @default(now())
  photos      Photo[]
}

model Photo {
  id          String   @id @default(cuid())
  albumId     String
  uploaderId  String   // swimmer or coach ID
  uploadedBy  String   // "coach" | "swimmer"
  status      String   @default("pending") // "pending" | "approved" | "rejected"
  imageUrl    String   // R2 URL
  caption     String?
  uploadedAt  String
  archivedAt  String?  // Auto-set 21 days after upload
  createdAt   DateTime @default(now())

  album       PhotoAlbum @relation(fields: [albumId], references: [id], onDelete: Cascade)

  @@index([albumId])
  @@index([status])
  @@index([uploadedAt])
}

model HallOfFameEntry {
  id          String   @id @default(cuid())
  swimmerId   String
  type        String   // "pb" | "xp" | "meet_award" | "monthly_star"
  title       String   // e.g. "100 Free PB: 58.32"
  description String?
  imageUrl    String?  // Optional photo
  approved    Boolean  @default(false)
  autoGenerated Boolean @default(true)
  createdAt   DateTime @default(now())

  swimmer     Swimmer @relation(fields: [swimmerId], references: [id], onDelete: Cascade)

  @@index([swimmerId])
  @@index([type])
  @@index([approved])
}
```

---

## Testing Decisions

### 测试策略

- **只测试外部行为** — 测试背景匹配逻辑返回正确的照片路径，不测试 CSS 渲染效果
- **不测试视觉美感** — 这是主观的，通过人工 review 完成
- **测试时间逻辑** — 北京时间计算的正确性（模拟不同系统时区）
- **测试匹配降级** — 训练类型无匹配 → 时间 fallback → 随机 fallback

### 需要测试的模块

| 模块 | 测试类型 | 理由 |
|------|---------|------|
| 背景匹配逻辑 | Unit test | 纯函数，输入训练类型+时间 → 输出照片路径 |
| 时间计算 | Unit test | 确保始终返回北京时间，不依赖系统时区 |
| 格言随机 | Unit test | 确保从数组中正确随机选取 |
| 照片审核 API | Integration test | 审核状态变更、权限检查 |
| 名人堂自动生成 | Integration test | PB 自动上榜逻辑 |
| LED 组件渲染 | Component test | 确保数值正确渲染 |
| 水波纹事件监听 | Component test | 确保排除输入框等元素 |

### 参考现有测试

- `tests/` 目录已有 API client、auth、core API、component rendering 测试
- 背景匹配逻辑测试可参考 `tests/utils.test.ts` 模式
- 组件测试可参考现有 component rendering 测试模式

---

## Out of Scope

- **音效/声音** — 虽然讨论过教练哨声，但暂不实现声音效果
- **页面切换动画** — 明确决定不要
- **多时区支持** — 锁死北京时间，不随访客时区变化
- **AI 生成照片** — 所有照片来自 CC0 真实照片
- **教练端照片墙上传** — 第一版只实现基础功能，教练端上传后续可加
- **照片高级编辑**（裁剪、滤镜） — 只支持原始上传
- **名人堂社交分享** — 不在第一版范围内
- **多语言格言搜索/筛选** — 随机展示即可

---

## 项目执行顺序

### Phase 1 — 基础设施（优先级最高）
1. 下载 120-180 张 CC0 泳池照片，组织到 `public/backgrounds/`
2. 实现背景照片匹配系统（`lib/background-photos.ts`）
3. 改造 `app/layout.tsx` 使用照片背景
4. 实现 Glassmorphism 2.0 CSS（`globals.css`）
5. 实现 LED 计时板字体系统

### Phase 2 — 交互与氛围
6. 全局水波纹点击反馈
7. 游泳 Spinner 组件
8. 格言系统（`lib/quotes.ts` + 组件）
9. 侧边栏玻璃化 + 泳道线 divider

### Phase 3 — 新功能
10. 照片墙（schema + API + 页面）
11. 名人堂（schema + API + 页面）
12. 比赛备战倒计时

### Phase 4 — 打磨
13. 页面浓度分级（高/中/低/特殊）
14. 系统一致性审查
15. 移动端适配（BottomTabBar 水线）
16. 性能优化（图片压缩、预加载）

---

## Further Notes

- **照片选择标准** — 必须高清、美观、CC0 授权。优先选择有水面光影变化的照片（清晨金光、黄昏暖光、夜晚星空）。空泳池和有人游泳的照片都需要。
- **视觉统一性** — 所有改动必须确保教练端和队员端使用同一套 CSS 变量、组件、字体。禁止为某一端单独创建一套设计系统。
- **性能预算** — 背景照片 WebP 压缩后不超过 300KB。首屏内容不应等待背景加载。
- **北京时间** — 所有时间相关逻辑必须使用 `Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai' })`，不依赖系统时区。
- **浓度平滑过渡** — 高浓度页面和低浓度页面共享相同的 `glass-panel` 基础样式，通过 modifier class（如 `glass-panel--immersive`）增加额外效果，而不是完全不同的样式。
