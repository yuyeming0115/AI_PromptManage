import { useState } from 'react'
import { type Prompt } from '../types'
import { usePromptStore } from '../store/usePromptStore'

interface Props {
  prompt: Prompt
}

export function PromptCard({ prompt }: Props) {
  const isEditMode = usePromptStore((s) => s.isEditMode)
  const deletePrompt = usePromptStore((s) => s.deletePrompt)
  const setEditingPromptId = usePromptStore((s) => s.setEditingPromptId)
  const incrementUseCount = usePromptStore((s) => s.incrementUseCount)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.content)
    } catch {
      const el = document.createElement('textarea')
      el.value = prompt.content
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    incrementUseCount(prompt.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  function handleCardClick() {
    if (isEditMode) {
      setEditingPromptId(prompt.id)
    } else {
      handleCopy()
    }
  }

  const count = prompt.useCount ?? 0

  return (
    <div
      className={[
        'group flex items-stretch gap-2 px-3 py-2 mx-2 my-1 rounded-lg border',
        'transition-all duration-100 cursor-pointer select-none',
        copied
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50',
      ].join(' ')}
      onClick={handleCardClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {copied ? (
          <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.707-4.707a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : isEditMode ? (
          <svg className="w-4 h-4 text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium text-gray-700 truncate leading-4 flex-1">
            {prompt.title}
          </p>
          {count > 0 && (
            <span className="text-[10px] text-gray-300 flex-shrink-0">×{count}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 leading-4 line-clamp-2">{prompt.content}</p>
      </div>

      {/* Delete button — only in edit mode */}
      {isEditMode && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            deletePrompt(prompt.id)
          }}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors ml-1 self-center"
          title="删除"
        >
          <span className="text-red-400 text-sm leading-none">✕</span>
        </button>
      )}
    </div>
  )
}
