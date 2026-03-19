import { useRef, useState } from 'react'
import { usePromptStore } from '../store/usePromptStore'

export function PromptInput() {
  const { activeCategory, addPrompt, searchQuery, setSearchQuery } = usePromptStore()
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const targetCategory = activeCategory === 'all' ? 'general' : activeCategory

  // Sync value → searchQuery in real-time
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value
    setValue(v)
    setSearchQuery(v.trim())
  }

  function handleArchive() {
    const trimmed = value.trim()
    if (!trimmed) return
    addPrompt(trimmed, targetCategory)
    setValue('')
    setSearchQuery('')
    textRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleArchive()
    }
    // Esc clears search
    if (e.key === 'Escape') {
      setValue('')
      setSearchQuery('')
      textRef.current?.blur()
    }
  }

  const hasValue = value.trim().length > 0

  return (
    <div className="flex items-end gap-2 px-3 py-2 border-b border-gray-100">
      <div className="flex-1 relative">
        <textarea
          ref={textRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused || hasValue ? '输入 Prompt，Ctrl+Enter 归档…' : '搜索 Prompt…'}
          rows={2}
          className={[
            'w-full resize-none text-sm text-gray-800 placeholder-gray-400',
            'border border-gray-200 rounded-lg px-2 py-1.5 outline-none',
            'focus:border-indigo-400 transition-colors duration-100 leading-5',
          ].join(' ')}
        />
        {/* Search indicator */}
        {hasValue && !isFocused && (
          <span className="absolute top-1.5 right-2 text-[10px] text-indigo-400 pointer-events-none">
            搜索中
          </span>
        )}
      </div>

      {/* Archive button — always visible, active only when there's content */}
      <button
        onClick={handleArchive}
        disabled={!hasValue}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 transition-all duration-100"
        style={
          hasValue
            ? { backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }
            : { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
        }
        title="归档入库 (Ctrl+Enter)"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 5a1 1 0 011-1h12a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
        </svg>
      </button>
    </div>
  )
}
