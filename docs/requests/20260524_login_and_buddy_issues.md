# 需求记录：修复登录报错和死党申请问题

**日期**：2026-05-25

## 需求描述
1. **登录报错问题**：当尝试切换角色并登录教练端（对眼）时，系统会弹出“Server error. Please try again in a moment.”的服务器报错信息，已完成排查和说明（见下方分析）。
2. **死党申请问题**：系统无法发送“死党”申请，点击“申请死党”按钮后弹出红字提示“发送申请失败”。

---

## 问题排查与分析（死党申请问题）

1. **核心原因 1：缺失 `crypto` 模块导入引发的 Runtime 500 崩溃**
   - 经排查，在上一次针对 Next.js Edge 编译优化及 lint 检查的修改中，`app/api/buddy/route.ts` 和 `app/api/attendance/route.ts` 顶部的 `import * as crypto from 'crypto';` 被错误地清理删除了。
   - 导致 API 在执行 `crypto.randomUUID()` 动态生成 `BuddyPair` 的 ID 和通知消息 ID 时，触发 **`ReferenceError: crypto is not defined`** 运行时错误，导致接口直接返回 500 状态码崩溃。

2. **核心原因 2：API 客户端静默吞噬了 4xx 错误**
   - 在前端 `@/lib/api-client.ts` 封装的 `fetchAPI` 工具中，第三个参数 `silent4xx` 默认为 `true`。
   - 导致当死党接口返回 400 Bad Request（如“死党结对关系已存在”）时，错误被默默吞掉并返回 `null`，导致前端无法捕获具体的校验错误，只能展示兜底的 `"发送申请失败"`，阻碍了真实原因的呈现。

3. **背景状态验证**：
   - 编写测试脚本查询数据库，发现当前登录运动员 `ggdayup` 与目标队员 `黄一子yizi` 之间，其实**早在 2026-05-22 就已经存在一条 pending 状态的死党申请记录**。
   - 再次点击申请时，数据库会校验并触发 duplicate check，返回 400 校验错误。由于上述原因，错误被静默吞掉，最终以 generic 错误提示呈现在了页面上。

---

## 修复方案与实施细节

1. **补全 `crypto` 模块导入（已完成）**：
   - 在 `app/api/buddy/route.ts` 和 `app/api/attendance/route.ts` 顶部重新引入 `import * as crypto from 'crypto';`，彻底解决 `randomUUID` 引发的 ReferenceError 500 崩溃问题。

2. **打通错误消息通道（已完成）**：
   - 修改 `lib/api-client.ts`，将 `api.buddy.request`、`accept`、`dissolve` 的 `fetchAPI` 调用中第三个参数 `silent4xx` 显式设为 `false`。
   - 使得 API 抛出的任何 4xx 校验错误能被前端组件的 `try-catch` 捕获，并通过 `setError(errMsg)` 完美展现在 UI 界面上。

3. **优雅的中文校验错误提示（已完成）**：
   - 重构了 `app/api/buddy/route.ts` 中的报错提示文案，将原本的英文错误（如 `Cannot buddy with yourself`, `Buddy pairing request already exists or is active`）全部升级为极其友好的中文提示（如 `"不能和自己结为死党"`, `"死党结对申请已存在，或者对方已经是你的死党啦！"`）。

4. **编译与打包验证（已完成）**：
   - 运行 `npm run build`，编译完全成功，零报错，项目编译状态极其健康。
