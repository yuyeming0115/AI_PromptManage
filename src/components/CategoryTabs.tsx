import { useRef, useState } from 'react'
import { BUILT_IN_IDS } from '../types'
import { usePromptStore } from '../store/usePromptStore'

export function CategoryTabs() {
  const categories = usePromptStore((s) => s.categories)
  const activeCategory = usePromptStore((s) => s.activeCategory)
  const isEditMode = usePromptStore((s) => s.isEditMode)
  const setActiveCategory = usePromptStore((s) => s.setActiveCategory)
  const addCategory = usePromptStore((s) => s.addCategory)
  const deleteCategory = usePromptStore((s) => s.deleteCategory)

  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startAdding() {
    setAdding(true)
    setNewLabel('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function confirmAdd() {
    if (newLabel.trim()) addCategory(newLabel)
    setAdding(false)
    setNewLabel('')
  }

  function cancelAdd() {
    setAdding(false)
    setNewLabel('')
  }

  const builtInSet = new Set<string>(BUILT_IN_IDS)

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto scrollbar-none">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id
        const isDeletable = isEditMode && !builtInSet.has(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-100 flex items-center gap-1"
            style={
              isActive
                ? { backgroundColor: '#6366f1', color: 'white' }
                : { backgroundColor: '#f3f4f6', color: '#4b5563' }
            }
          >
            {cat.label}
            {isDeletable && (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  deleteCategory(cat.id)
                }}
                className="ml-0.5 leading-none opacity-70 hover:opacity-100"
                title="删除分类"
              >
                ×
              </span>
            )}
          </button>
        )
      })}

      {adding ? (
        <input
          ref={inputRef}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmAdd()
            if (e.key === 'Escape') cancelAdd()
          }}
          onBlur={confirmAdd}
          placeholder="分类名"
          className="flex-shrink-0 w-16 px-2 py-1 text-xs rounded-full outline-none"
          style={{ border: '1px solid #6366f1' }}
        />
      ) : (
        <button
          onClick={startAdding}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 text-sm leading-none"
          style={{ backgroundColor: '#f3f4f6' }}
          title="添加分类"
        >
          +
        </button>
      )}
    </div>
  )
}
