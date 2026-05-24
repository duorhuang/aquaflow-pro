# 计划创建入口修复与功能移除 (Plan Creation Entry Fix & Feature Removal)

**Date**: 2026-05-23
**Type**: Bug Fix / Feature Adjustment

## 需求背景 (Background)
在训练日程表（`schedule/page.tsx`）中点击某一天的日期弹出的对话框里，有“新建空白计划”和“上传照片计划”两个选项。然而点击后会跳转到 `/dashboard/new-plan`，导致 404 错误页面，因为该路由目前并不存在。

用户反馈并建议：直接删掉这两个无法使用的选项作为最佳解决方案，或提供更好的解决方案。

## 解决方案 (Solution)
1. **修复“新建计划”全局入口**：
   - 将页面顶部全局的“新建计划”按钮从不存在的 `/dashboard/new-plan` 重定向到 `/dashboard/quick-plan`，确保用户仍然能通过页面顶部的按钮正常创建新计划。
2. **移除弹窗内不需要的功能（根据后续用户要求）**：
   - 彻底移除了“新建空白计划”选项。
   - 彻底移除了“上传照片计划”（Photo Plan）选项。

## 后续建议 (Future Considerations)
如果未来需要实现“上传照片计划”（拍照识别手写板书生成计划）的功能，可以重新在 `schedule/page.tsx` 的弹窗中加入该选项，并创建相应的专门路由和页面来处理图像识别逻辑。
