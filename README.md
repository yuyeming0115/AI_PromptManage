# AI Prompt Manager

浏览器扩展，在任意网页快速调用你保存的 AI 提示词。

## 功能

- **悬浮面板** — 任意页面点击悬浮按钮，秒开提示词库
- **一键复制** — 点击卡片即复制全文到剪贴板
- **分类管理** — 内置通用/代码/写作分类，支持自定义分类
- **关键词搜索** — 实时过滤提示词
- **编辑模式** — 新增、编辑、删除提示词和分类
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

## 云同步配置

1. 创建 [Supabase](https://supabase.com) 项目
2. 在 SQL Editor 中执行 `supabase/schema.sql`
3. 在 Dashboard → Realtime 中开启 `prompts` 和 `categories` 表
4. 创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 隐私政策

见 [privacy-policy.md](./privacy-policy.md)。
