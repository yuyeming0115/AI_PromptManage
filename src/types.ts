export interface Category {
  id: string
  label: string
}

export interface Prompt {
  id: string
  title: string
  content: string
  categoryId: string
  useCount: number
  createdAt: number
  updatedAt: number
  tags?: string[]
}

export const BUILT_IN_IDS = ['all', 'general', 'code', 'writing'] as const

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', label: '全部' },
  { id: 'general', label: '通用' },
  { id: 'code', label: '代码' },
  { id: 'writing', label: '写作' },
]

export const SEED_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: '角色扮演：资深工程师',
    content:
      '你是一位有 10 年经验的资深软件工程师，擅长系统设计与代码评审。请用简洁、专业的方式回答我的问题，必要时给出代码示例。',
    categoryId: 'general',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    title: '代码审查',
    content:
      '请审查以下代码，从可读性、性能、安全性三个维度给出具体改进建议，并提供重构后的代码：\n\n```\n[粘贴代码]\n```',
    categoryId: 'code',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    title: '解释代码逻辑',
    content:
      '请逐行解释以下代码的作用，使用通俗易懂的语言，假设读者是初级开发者：\n\n```\n[粘贴代码]\n```',
    categoryId: 'code',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '4',
    title: '写作润色',
    content:
      '请对以下文字进行润色，保持原意，使其更加流畅、专业，适合正式场合使用：\n\n[粘贴文字]',
    categoryId: 'writing',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '5',
    title: '总结要点',
    content:
      '请将以下内容总结为 3-5 条核心要点，每条要点一句话，使用 bullet point 格式：\n\n[粘贴内容]',
    categoryId: 'writing',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '6',
    title: 'Debug 助手',
    content:
      '我遇到了一个 bug，请帮我分析原因并给出修复方案。\n\n错误信息：[粘贴报错]\n\n相关代码：\n```\n[粘贴代码]\n```',
    categoryId: 'code',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '7',
    title: '头脑风暴',
    content:
      '请围绕以下主题进行头脑风暴，给出 10 个不同角度的想法，每个想法用一句话描述：\n\n主题：[填写主题]',
    categoryId: 'general',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '8',
    title: '翻译为英文',
    content: '请将以下中文翻译为地道的英文，保持原有的语气和风格：\n\n[粘贴文字]',
    categoryId: 'general',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '9',
    title: '写单元测试',
    content:
      '请为以下函数编写完整的单元测试，覆盖正常情况、边界情况和异常情况，使用 Vitest / Jest 语法：\n\n```\n[粘贴函数代码]\n```',
    categoryId: 'code',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '10',
    title: '产品需求分析',
    content:
      '请将以下产品需求拆解为具体的功能点和验收标准，输出格式为：功能名称 / 用户故事 / 验收标准：\n\n需求描述：[填写需求]',
    categoryId: 'writing',
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]
