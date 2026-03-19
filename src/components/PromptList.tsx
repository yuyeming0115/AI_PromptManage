import { usePromptStore } from '../store/usePromptStore'
import { PromptCard } from './PromptCard'

export function PromptList() {
  const prompts = usePromptStore((s) => s.prompts)
  const activeCategory = usePromptStore((s) => s.activeCategory)
  const searchQuery = usePromptStore((s) => s.searchQuery)
  const sortBy = usePromptStore((s) => s.sortBy)

  const filtered = prompts
    .filter((p) => activeCategory === 'all' || p.categoryId === activeCategory)
    .filter((p) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    })

  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'count'
      ? (b.useCount ?? 0) - (a.useCount ?? 0)
      : b.createdAt - a.createdAt,
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-300">
        <svg
          className="w-10 h-10 mb-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          {searchQuery ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          )}
        </svg>
        <p className="text-xs">
          {searchQuery ? `没有匹配「${searchQuery}」的 Prompt` : '还没有 Prompt，在上方输入并归档吧'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {sorted.map((p) => (
        <PromptCard key={p.id} prompt={p} />
      ))}
    </div>
  )
}
