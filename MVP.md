# AI_PromptManage — 2 周 MVP 计划

> 版本：v0.1 · 日期：2026-03-19
> 目标：2 周内跑通核心流程，可自用、可演示，暂不发布商店

---

## 一、MVP 边界

### 纳入（Must Have）

| # | 功能 | 交付标准 |
|---|------|----------|
| 1 | 悬浮按钮 | 页面右下角渲染，点击展开/收起面板 |
| 2 | 按钮拖拽 | 长按 100ms 进入拖拽，松手位置持久化到 localStorage |
| 3 | 分类 Tab | 默认「全部 / 通用 / 代码 / 写作」横向 Tab，可切换过滤列表 |
| 4 | 快速录入 | 顶部 textarea + 归档按钮，存入当前分类，自动取前 20 字为标题 |
| 5 | Prompt 列表 | 横向长条卡片，显示标题 + 内容摘要（2 行截断），可滚动 |
| 6 | 一键复制 | 点击卡片正文区域复制全文到剪贴板，显示 1s 的「已复制」反馈 |
| 7 | 编辑模式 + 删除 | 右上角「编辑」按钮切换，开启后卡片右侧出现删除图标 |
| 8 | 本地持久化 | 数据存 `chrome.storage.local`，刷新 / 重启浏览器后不丢失 |

### 排除（Out of Scope）

- 云端同步、账号注册登录（Week 3-5 再做）
- 面板尺寸调节（Week 6 打磨期）
- Prompt 编辑修改内容（删除 + 重新添加代替）
- 搜索过滤、使用次数统计
- 自定义分类增删
- Firefox / Edge 适配

---

## 二、技术栈（精简版）

| 层 | 选择 | 说明 |
|----|------|------|
| 扩展框架 | **WXT** + Vite | content script 模式注入悬浮 UI |
| UI | **React 18 + TypeScript** | |
| 样式 | **Tailwind CSS v4** | Shadow DOM 内隔离，防止宿主页面样式污染 |
| 状态 | **Zustand** + persist 中间件 | 对接 chrome.storage.local |
| 拖拽 | 原生 **PointerEvent** | 无需引入拖拽库，逻辑简单 |
| 包管理 | **pnpm** | |

> Shadow DOM 是 MVP 阶段最重要的工程决策——必须用，否则在 ChatGPT 等复杂页面上 UI 会崩。

---

## 三、数据模型（MVP 最小集）

```typescript
// 分类（内置，MVP 不支持自定义）
type CategoryId = 'all' | 'general' | 'code' | 'writing'

interface Prompt {
  id: string          // crypto.randomUUID()
  title: string       // 前 20 字自动截取
  content: string     // 全文
  categoryId: Exclude<CategoryId, 'all'>
  createdAt: number   // Date.now()
}

// chrome.storage.local 存储结构
interface StorageSchema {
  prompts: Prompt[]
  floatBtnPos: { x: number; y: number }  // 悬浮按钮坐标
  activeCategory: CategoryId
}
```

---

## 四、文件结构

```
AI_PromptManage/
├── src/
│   ├── content/
│   │   └── index.tsx          # content script 入口，挂载 Shadow DOM
│   ├── components/
│   │   ├── FloatButton.tsx    # 悬浮按钮 + 拖拽逻辑
│   │   ├── Panel.tsx          # 主面板容器
│   │   ├── CategoryTabs.tsx   # 分类 Tab 栏
│   │   ├── PromptInput.tsx    # 输入区 + 归档按钮
│   │   ├── PromptList.tsx     # 列表容器
│   │   └── PromptCard.tsx     # 单条卡片
│   ├── store/
│   │   └── usePromptStore.ts  # Zustand store（含 chrome.storage 持久化）
│   └── types.ts               # 共享类型
├── wxt.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 五、Day-by-Day 任务拆解

### Week 1 — 骨架 + 核心交互

| 天 | 任务 | 产出 |
|----|------|------|
| Day 1 | 初始化项目：WXT + React + Tailwind + Zustand，跑通 content script 注入 Hello World | 能在 Chrome 页面看到注入的 div |
| Day 2 | Shadow DOM 容器搭建，FloatButton 组件：渲染圆形按钮，点击 toggle 面板显隐 | 悬浮按钮可点击 |
| Day 3 | PointerEvent 拖拽实现，floatBtnPos 持久化到 chrome.storage | 按钮可拖动，位置刷新后保留 |
| Day 4 | Panel 骨架布局（顶栏 + 分类 Tab + 输入区 + 列表区），Tailwind 完成静态样式 | 面板 UI 静态稿完成 |
| Day 5 | Zustand store 搭建，chrome.storage 读写封装，prompts 增删基础逻辑 | 数据层跑通 |
| Day 6 | PromptInput 录入功能：输入 → 点归档 → 存储 → 列表刷新 | 可以存入第一条 Prompt |
| Day 7 | Buffer / 联调收尾，处理 Day 1-6 遗留问题 | Week 1 功能完整可运行 |

### Week 2 — 功能完善 + 体验打磨

| 天 | 任务 | 产出 |
|----|------|------|
| Day 8 | PromptCard：标题 + 摘要展示，点击复制 + 「已复制」Toast 动画 | 核心用途跑通 |
| Day 9 | CategoryTabs：切换过滤列表，activeCategory 持久化 | 分类功能完成 |
| Day 10 | 编辑模式：右上角按钮切换 isEditMode，卡片显隐删除图标，删除逻辑 | 编辑模式完成 |
| Day 11 | Shadow DOM 内 Tailwind 样式修复，在 ChatGPT / Claude 页面验证无样式冲突 | 兼容性验证通过 |
| Day 12 | 面板展开/收起过渡动画（CSS transition），按钮 hover / active 状态 | 视觉体验提升 |
| Day 13 | 内置 10 条示例 Prompt（首次安装时写入），空态提示文案 | 开箱即用体验 |
| Day 14 | 全流程自测（增 / 删 / 复制 / 拖拽 / 刷新持久化），Bug 修复 | MVP 完成，可交付演示 |

---

## 六、验收标准

MVP 完成的判断条件（全部通过才算完成）：

- [ ] 在 ChatGPT、Claude、Gemini 页面均能看到悬浮按钮，无样式错乱
- [ ] 输入 Prompt 文字，点归档，卡片出现在列表中
- [ ] 点击卡片，剪贴板内容等于 Prompt 全文（粘贴验证）
- [ ] 切换分类 Tab，列表正确过滤
- [ ] 开启编辑模式，删除一条 Prompt，列表正确更新
- [ ] 刷新页面，列表数据、按钮位置均恢复
- [ ] 拖动按钮到左上角，刷新后按钮仍在左上角

---

## 七、MVP 后的下一步（Week 3+）

完成 MVP 后，按以下优先级继续：

1. **云端同步**（Week 3-5）：Supabase Auth + Realtime，解锁多端同步核心卖点
2. **搜索过滤**（Week 6 前）：输入区兼做搜索框，实时过滤列表
3. **Prompt 编辑**（Week 6）：点击卡片进入编辑态，修改内容 / 分类
4. **自定义分类**（Week 6）：分类 Tab 支持「+」新增
5. **Chrome Store 发布**（Week 7）：打包上架

---

*MVP 原则：能用 > 好用 > 全能。先跑通核心循环，再打磨体验。*
