import { useState, useRef } from 'react'
import { usePromptStore } from '../store/usePromptStore'

export function PromptEditor() {
  const editingPromptId = usePromptStore((s) => s.editingPromptId)
  const prompt = usePromptStore((s) => s.prompts.find((p) => p.id === editingPromptId))
  const allCategories = usePromptStore((s) => s.categories)
  const categories = allCategories.filter((c) => c.id !== 'all')
  const updatePrompt = usePromptStore((s) => s.updatePrompt)
  const setEditingPromptId = usePromptStore((s) => s.setEditingPromptId)

  const [title, setTitle] = useState(prompt?.title ?? '')
  const [content, setContent] = useState(prompt?.content ?? '')
  const [categoryId, setCategoryId] = useState(prompt?.categoryId ?? 'general')
  const [tags, setTags] = useState<string[]>(prompt?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const tagInputRef = useRef<HTMLInputElement>(null)

  if (!prompt) return null

  function handleSave() {
    const trimmed = content.trim()
    if (!trimmed) return
    const finalTitle = title.trim() || trimmed.slice(0, 20)
    updatePrompt(prompt!.id, { title: finalTitle, content: trimmed, categoryId, tags })
    setEditingPromptId(null)
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const t = tagInput.trim()
      if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const canSave = content.trim().length > 0

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Editor header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => setEditingPromptId(null)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          返回
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          style={
            canSave
              ? { backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }
              : { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
          }
        >
          保存
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
        {/* Title */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">标题（留空则自动截取）</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={content.trim().slice(0, 20) || '自动截取内容前 20 字'}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
            style={{ transition: 'border-color 0.1s' }}
            onFocus={(e) => (e.target.style.borderColor = '#818cf8')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1 block">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={9}
            className="resize-none text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none leading-5"
            style={{ transition: 'border-color 0.1s' }}
            onFocus={(e) => (e.target.style.borderColor = '#818cf8')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">标签</label>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 text-indigo-300 hover:text-indigo-500 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="输入标签后按 Enter"
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
            style={{ transition: 'border-color 0.1s' }}
            onFocus={(e) => (e.target.style.borderColor = '#818cf8')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">分类</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                style={
                  categoryId === cat.id
                    ? { backgroundColor: '#6366f1', color: 'white' }
                    : { backgroundColor: '#f3f4f6', color: '#4b5563' }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
