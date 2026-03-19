# AI_PromptManage — 项目规划文档

> 版本：v0.1 · 日期：2026-03-19

---

## 1. 产品定位

**一句话定位：** 面向 AI 重度用户的浏览器端 Prompt 速查 & 复用工具，让每一条精心打磨的 Prompt 随时随地触手可及。

**核心价值：**
- 极速调用：不打断当前工作流，悬浮面板秒开秒用
- 统一管理：分类归档，告别在备忘录、文档、聊天记录里翻找
- 多端同步：换浏览器、换电脑，Prompt 库始终在线

**产品形态：** 浏览器扩展（Chrome / Edge / Firefox）+ 可选的轻量 Web 端（用于管理后台 & 数据导入导出）

---

## 2. 用户画像

| 维度 | 描述 |
|------|------|
| 核心用户 | AI 工具重度用户：产品经理、程序员、设计师、内容创作者、研究人员 |
| 使用场景 | 每天频繁使用 ChatGPT / Claude / Gemini 等，积累了大量自用 Prompt |
| 痛点 | Prompt 散落各处、切换窗口查找效率低、同一 Prompt 要反复手打 |
| 技术水平 | 中等偏上，能安装浏览器扩展，接受账号登录同步 |
| 设备环境 | 多台电脑、多个浏览器（Chrome 主力 + Edge 备用） |

---

## 3. MVP 功能清单

### P0 — 必须有（第一版上线）

| # | 功能 | 说明 |
|---|------|------|
| 1 | 悬浮入口 | 页面右下角（或用户拖动后的位置）悬浮按钮，单击展开/收起面板 |
| 2 | 悬浮按钮拖拽定位 | 长按 / 拖拽可自由定位，位置本地持久化 |
| 3 | Prompt 列表 | 左侧竖向滚动列表，每条为横向长条卡片，显示标题 + 内容摘要 |
| 4 | 一键复制 | 点击卡片即复制 Prompt 全文到剪贴板，无需二次操作 |
| 5 | 快速录入 | 顶部文本输入区 + 归档按钮，输入后点击存入当前选中分类 |
| 6 | 分类标签 | 顶部横向 Tab，支持自定义分类，默认「全部 / 通用 / 代码 / 写作」 |
| 7 | 编辑模式 | 右上角切换，开启后卡片右侧显示删除按钮，平时隐藏防误触 |
| 8 | 本地存储 | 数据写入浏览器 `chrome.storage.local`，离线可用 |
| 9 | 云端同步 | 账号登录后自动同步到云端，跨浏览器 / 跨设备实时拉取 |

### P1 — 重要（第二版迭代）

| # | 功能 | 说明 |
|---|------|------|
| 10 | 搜索 / 关键词过滤 | 顶部输入区兼做搜索，未聚焦时显示 placeholder「搜索 Prompt…」 |
| 11 | 面板尺寸调节 | 面板四角 / 边缘可拖拽调整宽高，记忆上次尺寸 |
| 12 | Prompt 编辑 | 点击卡片进入编辑态，支持修改标题 / 内容 / 分类 |
| 13 | 使用频次统计 | 每次复制 +1，卡片上显示使用次数，可按频次排序 |
| 14 | 导入 / 导出 | 支持 JSON 格式导入导出，便于备份迁移 |

### P2 — 锦上添花（后续版本）

- Prompt 模板变量（`{{变量名}}` 占位符，点击后弹出填写框）
- 标签 Tag 多维度打标
- 分享 Prompt（生成链接 / 一键导入）
- Web 管理后台（批量操作、统计大屏）
- 快捷键唤起面板

---

## 4. 页面结构

### 4.1 浮层面板整体布局

```
┌─────────────────────────────────────────────┐
│  [≡ AI Prompts]          [编辑] [×关闭]      │  ← 顶栏
├─────────────────────────────────────────────┤
│  [全部] [通用] [代码] [写作] [+]             │  ← 区域1：分类 Tab
├──────────────────────────────────────────┬──┤
│  输入 Prompt 内容...                      │🔘│  ← 区域2：快速录入
├──────────────────────────────────────────┴──┤
│ ┌─────────────────────────────────────────┐ │
│ │ [📋] 标题摘要...                   [🚫] │ │  ← Prompt 卡片（编辑模式才显示🚫）
│ ├─────────────────────────────────────────┤ │
│ │ [📋] 标题摘要...                   [🚫] │ │
│ ├─────────────────────────────────────────┤ │
│ │ [📋] 标题摘要...                        │ │
│ └─────────────────────────────────────────┘ │  ← 区域3：Prompt 列表（可滚动）
└─────────────────────────────────────────────┘
                                        ↑
                              面板四角可拖拽调整尺寸
```

### 4.2 悬浮按钮

```
页面任意位置（默认右下角）：

    ╭───╮
    │ P │   ← 圆形悬浮按钮
    ╰───╯
    拖动：长按 100ms 进入拖拽模式
    点击：展开 / 收起面板
```

### 4.3 Prompt 卡片（正常模式 vs 编辑模式）

```
正常：  ┌──────────────────────────────────┐
        │ [📋]  标题（最多1行截断）         │
        │       内容摘要（最多2行截断）     │
        └──────────────────────────────────┘

编辑：  ┌──────────────────────────────────┐
        │ [📋]  标题                  [🚫] │
        │       内容摘要                   │
        └──────────────────────────────────┘
```

### 4.4 Web 管理后台（P1）

```
路由：
  /        → 登录 / 注册
  /dashboard → Prompt 列表 + 分类管理
  /import   → 导入导出
  /settings → 账号设置、同步设置
```

---

## 5. 数据模型

### 5.1 Prompt 条目

```typescript
interface Prompt {
  id: string;           // UUID
  title: string;        // 标题（可自动取内容前20字）
  content: string;      // Prompt 全文
  categoryId: string;   // 所属分类 ID
  tags?: string[];      // 可选标签（P1）
  useCount: number;     // 使用次数
  createdAt: number;    // Unix timestamp
  updatedAt: number;
  syncedAt?: number;    // 最后同步时间
}
```

### 5.2 分类

```typescript
interface Category {
  id: string;
  name: string;
  icon?: string;        // emoji 或图标名
  order: number;        // 排序权重
  createdAt: number;
}
```

### 5.3 用户设置（本地）

```typescript
interface LocalSettings {
  floatBtnPosition: { x: number; y: number };  // 悬浮按钮位置
  panelSize: { width: number; height: number }; // 面板尺寸
  lastCategoryId: string;                        // 上次选中的分类
  isEditMode: boolean;
}
```

### 5.4 用户账号（云端）

```typescript
interface User {
  uid: string;
  email: string;
  createdAt: number;
  syncEnabled: boolean;
  lastSyncAt: number;
}
```

### 5.5 同步策略

- 本地优先：离线修改记录到本地，联网后推送差异
- 冲突解决：以 `updatedAt` 较新的一方为准（Last-Write-Wins）
- 增量同步：每次只传 `updatedAt > lastSyncAt` 的条目

---

## 6. 技术选型

### 6.1 浏览器扩展

| 层 | 技术 | 理由 |
|----|------|------|
| 扩展框架 | **WXT**（基于 Vite） | 现代扩展开发框架，支持 Chrome/Firefox/Edge，HMR 开发体验好 |
| UI 框架 | **React 18 + TypeScript** | 生态成熟，组件复用性强 |
| 样式 | **Tailwind CSS** | 原子化，bundle 小，适合扩展体积限制 |
| 状态管理 | **Zustand** | 轻量，无样板代码，持久化插件简单 |
| 本地持久化 | **chrome.storage.local** + `@webext-core/storage` | 跨浏览器兼容封装 |
| 拖拽 | **@dnd-kit/core** 或原生 PointerEvent | 轻量，悬浮按钮拖拽 + 面板 resize |

### 6.2 云端同步后端

| 层 | 技术 | 理由 |
|----|------|------|
| BaaS 方案（推荐 MVP） | **Supabase**（PostgreSQL + Auth + Realtime） | 开箱即用，免费额度够 MVP，Row Level Security 保证数据隔离 |
| 备选自建 | **Hono** (Cloudflare Workers) + **D1** | 边缘计算，低延迟，成本极低 |
| 认证 | Supabase Auth（邮箱 / Google OAuth） | 省去自建 Auth 成本 |
| 实时同步 | Supabase Realtime | 多端数据变更实时推送 |

### 6.3 Web 管理后台（P1）

| 层 | 技术 |
|----|------|
| 框架 | Next.js 15 (App Router) |
| 部署 | Vercel |
| UI 组件库 | shadcn/ui |

### 6.4 开发工具链

| 工具 | 用途 |
|------|------|
| pnpm + monorepo (Turborepo) | 扩展、后端、Web 共享类型定义 |
| Vitest | 单元测试 |
| Playwright | E2E 测试（扩展场景） |
| Biome | Lint + Format，替代 ESLint + Prettier |

---

## 7. 开发里程碑

### Phase 0 — 搭建骨架（Week 1）

- [ ] 初始化 monorepo，配置 WXT + React + Tailwind
- [ ] 扩展 Manifest 配置（content script + popup 两种模式评估）
- [ ] 搭建 Supabase 项目，设计数据库表结构
- [ ] CI/CD 基础配置（GitHub Actions）

### Phase 1 — MVP 本地版（Week 2-3）

- [ ] 悬浮按钮：渲染、拖拽定位、位置持久化
- [ ] 面板展开/收起动画
- [ ] 分类 Tab 组件（增删改）
- [ ] Prompt 列表 + 卡片组件
- [ ] 一键复制功能 + Toast 提示
- [ ] 快速录入（输入区 + 归档按钮）
- [ ] 编辑模式切换 + 删除
- [ ] 本地 chrome.storage 读写

### Phase 2 — 云端同步（Week 4-5）

- [ ] 注册 / 登录界面（面板内嵌小入口）
- [ ] Supabase Auth 接入
- [ ] 本地 → 云端初始化上传
- [ ] 云端 → 本地实时监听
- [ ] 离线队列 + 联网后自动同步
- [ ] 多端冲突处理逻辑

### Phase 3 — 体验打磨（Week 6）

- [ ] 面板尺寸调节（四边 resize handle）
- [ ] 关键词搜索 / 过滤
- [ ] Prompt 编辑功能
- [ ] 使用次数统计 + 排序
- [ ] 导入 / 导出 JSON
- [ ] 扩展图标、Store 截图、说明文案

### Phase 4 — 发布上线（Week 7）

- [ ] Chrome Web Store 审核提交
- [ ] Edge Add-ons 提交
- [ ] Web 管理后台上线（Vercel）
- [ ] 用户反馈渠道建立（GitHub Issues / Discord）

---

## 8. 风险分析

### 8.1 技术风险

| 风险 | 可能性 | 影响 | 应对策略 |
|------|--------|------|----------|
| Chrome Extensions Manifest V3 限制（CSP、Service Worker 生命周期短） | 高 | 中 | 同步逻辑移到 offscreen document 或 background keep-alive ping |
| 扩展审核被拒（注入 content script 敏感权限） | 中 | 高 | 最小权限原则，仅申请 `storage` + `activeTab`，准备申诉说明 |
| Supabase 免费额度超限 | 低 | 中 | 监控用量，超限后迁移到 Cloudflare D1 方案 |
| 多端同步冲突导致数据丢失 | 中 | 高 | 实现软删除 + 操作日志，7天内可恢复 |

### 8.2 产品风险

| 风险 | 可能性 | 影响 | 应对策略 |
|------|--------|------|----------|
| 用户不愿注册账号（抵触云同步） | 高 | 中 | 纯本地模式完整可用，注册仅为解锁同步功能 |
| 市场上已有类似插件竞争 | 高 | 中 | 主打「极简 + 悬浮随时调用」差异化，不做大而全的 Prompt 社区 |
| 面板与目标网站 CSS 冲突 | 中 | 低 | Shadow DOM 隔离扩展 UI |
| 用户 Prompt 数据隐私顾虑 | 中 | 高 | 数据加密存储，隐私政策透明，支持纯本地模式 |

### 8.3 进度风险

| 风险 | 应对策略 |
|------|----------|
| 跨浏览器兼容调试耗时 | MVP 阶段专注 Chrome，Firefox 作为 Phase 3 支持 |
| Supabase Realtime 集成复杂度超预期 | Phase 2 可降级为轮询同步（每30秒），保证功能完整性 |

---

## 9. 后续扩展方向（路线图展望）

- **Prompt 模板变量**：`{{角色}}` `{{任务}}` 占位符，点击后弹出填写表单，组合成最终 Prompt
- **AI 自动分类**：输入 Prompt 后调用 Claude API 自动建议分类和标题
- **团队共享库**：企业版，团队内共享 Prompt 库，权限管控
- **跨 AI 平台注入**：在 ChatGPT / Claude / Gemini 输入框下方直接显示推荐 Prompt
- **Firefox & Safari 扩展**：完整跨浏览器覆盖

---

*文档持续更新，以实际开发进展为准。*
