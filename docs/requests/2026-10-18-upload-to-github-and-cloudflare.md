# 2026-10-18 全量同步至 GitHub 与 Cloudflare 生产环境

## 需求背景
用户明确指示：
1. 将所有最新的代码、配置与文档提交并上传至 GitHub 远端仓库。
2. 确保生产环境部署在 Cloudflare（不再使用 Vercel）。
3. 验证构建流程与线上服务状态，确保 Cloudflare 正常承载全新生产版本。

## 涉及范围与环境
- **版本控制**：GitHub 远端仓库 (`https://github.com/duorhuang/aquaflow-pro.git`)，分支 `main`。
- **目标平台**：Cloudflare Workers / Pages (`opennextjs-cloudflare` + `wrangler`)。
- **自定义域名**：`https://sw.sportsflow.best` (通过 Cloudflare Custom Domain 接入)。
- **自动化流水线**：`.github/workflows/deploy.yml` 监听 `main` 分支 push 事件，自动执行 `npm run deploy` 部署至 Cloudflare。
- **本地部署验证**：本地执行 `npm run deploy` 或验证 Cloudflare CI/CD 流水线。

## 执行计划
1. **记录需求文档**：按规范写入 `docs/requests/2026-10-18-upload-to-github-and-cloudflare.md`。
2. **清理与暂存变更**：
   - 纳入全站中文本土化、类型优化及测试验证脚本。
   - 彻底清理多余的历史临时/副本文件（如 `package-lock 2.json`、`test-results 2/` 等）。
3. **构建与语法验证**：
   - 执行构建与语法检查，确保生产打包无异常。
4. **提交与推送至 GitHub**：
   - 执行 `git add` 并编写规范 commit 信息。
   - 推送至 GitHub `origin/main`。
5. **Cloudflare 部署与线上验证**：
   - 触发 Cloudflare 部署（通过 GitHub Actions 或本地 Wrangler）。
   - 核验 Cloudflare 线上生产服务响应与状态。
