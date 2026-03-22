# AI Prompt Manager

浏览器扩展，在任意网页快速调用你保存的 AI 提示词。

## 功能

- **悬浮面板** — 任意页面点击悬浮按钮，秒开提示词库
- **快捷键** — `Alt+P` 全局唤起/关闭面板
- **一键复制** — 点击卡片即复制全文到剪贴板
- **模板变量** — 内容含 `{{变量}}` 时弹出填写框，替换后复制
- **分类管理** — 内置通用/代码/写作分类，支持自定义分类
- **标签 Tag** — 每条提示词可打多个标签，支持按标签搜索过滤
- **关键词搜索** — 实时过滤标题、内容、标签
- **编辑模式** — 新增、编辑、删除提示词和分类
- **分享** — 编辑模式下一键复制为 Markdown 格式
- **使用统计** — 记录每条提示词的使用次数，支持按频次排序
- **导入/导出** — JSON 格式备份与恢复
- **面板缩放** — 拖拽边缘自由调整面板大小
- **云端同步** — 登录后跨设备实时同步（Supabase）

## 技术栈

- [WXT](https://wxt.dev) — 浏览器扩展框架（基于 Vite，MV3）
- React 18 + TypeScript
- Tailwind CSS v4
- Zustand — 状态管理
- Supabase — 认证 + 云同步（PostgreSQL + Realtime）

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（Chrome）
pnpm dev

# 生产构建
pnpm build
```

## 多设备同步（Win + Mac）

无需开发桌面 App，浏览器扩展 + Supabase 免费套餐即可实现多台电脑同步。

### 首次配置

1. 创建 [Supabase](https://supabase.com) 项目（免费，永久可用）
2. 在 SQL Editor 中执行 `supabase/schema.sql`
3. 在 Supabase Table Editor 中分别对 `prompts` 和 `categories` 表点击顶部 **"Enable Realtime"** 按钮
4. 创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

5. 构建扩展：

```bash
pnpm build
```

### 每台电脑安装

1. Chrome 地址栏输入 `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」，选择 `.output/chrome-mv3/` 目录
4. 点击扩展图标，注册/登录同一个账号

登录后自动触发同步并建立 Realtime 订阅，增删改实时推送到所有已登录设备。

### 同步机制说明

- **登录时** 自动执行双向合并同步（Last-Write-Wins，以 `updatedAt` 为准）
- **Realtime** 订阅建立后，任一设备的增删改会实时推送到其他设备，无需手动刷新
- **手动同步** 可点击云端同步页面的「立即同步」按钮强制重新拉取

### Supabase 免费套餐说明

| 限制 | 额度 | 是否够用 |
|------|------|----------|
| 项目数 | 2 个 | ✓ |
| 数据库 | 500MB | ✓（Prompt 数据极小）|
| 非活跃暂停 | 7 天无请求 | ✓（每天使用不会触发）|
| 费用 | 永久免费 | ✓ |

## Web 管理后台

`web/` 目录为独立 Next.js 项目，可部署到 Vercel，使用同一个 Supabase 账号登录管理所有 Prompt。

```bash
cd web
cp .env.local.example .env.local   # 填入 Supabase 配置
pnpm install
pnpm dev
```

## 隐私政策

见 [privacy-policy.md](./privacy-policy.md)。
