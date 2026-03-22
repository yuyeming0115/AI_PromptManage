# 修复：多设备云端同步不生效

## 问题现象

- 扩展登录账号后点击「立即同步」，显示"上次同步：刚刚"，网络请求全部 200
- Supabase 数据库中数据正常存在
- 但另一台电脑打开扩展后，Prompt 和分类没有更新

## 根本原因

`onAuthStateChange` 回调只设置了 `user` 状态，**没有调用 `syncNow()`**，导致：

1. 另一台电脑打开插件时，session 已存在，走的是 `onAuthStateChange` 路径
2. `subscribeToChanges`（Realtime 订阅）从未被注册
3. 没有 Realtime 连接，收不到其他设备的数据变更推送

## 修复方案

### 代码修改（`src/store/usePromptStore.ts`）

在 `onAuthStateChange` 回调中，检测到已登录 session 时补充调用 `syncNow()`：

```diff
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      set({ user: { id: session.user.id, email: session.user.email ?? '' } })
+     get().syncNow()
    } else {
      set({ user: null })
    }
  })
```

### Supabase 后台配置

在 Supabase Table Editor 中，对 `prompts` 和 `categories` 表分别点击顶部 **"Enable Realtime"** 按钮（截图中两表均标注 `UNRESTRICTED`，需手动开启）。

## 同步完整流程（修复后）

| 触发时机 | 行为 |
|----------|------|
| 首次打开扩展（已有 session）| `initAuth` → 检测到 session → `syncNow()` → 全量合并 + 建立 Realtime 订阅 |
| `onAuthStateChange` 触发 | 同上，补全了 `syncNow()` 调用 |
| 手动点击「立即同步」 | `syncNow()` → 全量合并 + 重建 Realtime 订阅 |
| Realtime 推送 | 直接更新本地 Zustand store，无需手动触发 |

## 合并策略

双向合并，以 `updatedAt` 时间戳为准（Last-Write-Wins）：
- 云端更新时间 > 本地 → 用云端覆盖本地
- 本地更新时间 ≥ 云端 → 推送本地到云端
- 新增条目（对方没有）→ 双向补充
