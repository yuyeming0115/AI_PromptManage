import { useState } from 'react'
import { type Prompt } from '../types'
import { usePromptStore } from '../store/usePromptStore'
import { VariableModal } from './VariableModal'

interface Props {
  prompt: Prompt
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}

export function PromptCard({ prompt }: Props) {
  const isEditMode = usePromptStore((s) => s.isEditMode)
  const deletePrompt = usePromptStore((s) => s.deletePrompt)
  const setEditingPromptId = usePromptStore((s) => s.setEditingPromptId)
  const incrementUseCount = usePromptStore((s) => s.incrementUseCount)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const hasVars = prompt.content.includes('{{')

  async function doCopy(text: string) {
    await copyText(text)
    incrementUseCount(prompt.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  function handleCardClick() {
    if (isEditMode) {
      setEditingPromptId(prompt.id)
    } else if (hasVars) {
      setShowModal(true)
    } else {
      doCopy(prompt.content)
    }
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    const tags = prompt.tags?.length ? `\n---\n标签: ${prompt.tags.join(', ')}` : ''
    const md = `# ${prompt.title}\n\n${prompt.content}${tags}`
    await copyText(md)
    setShared(true)
    setTimeout(() => setShared(false), 1200)
  }

  const count = prompt.useCount ?? 0
  const tags = prompt.tags ?? []

  return (
    <div style={{ position: 'relative' }}>
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
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-400"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-gray-300">+{tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Edit mode actions */}
        {isEditMode && (
          <div className="flex items-center gap-1 flex-shrink-0 self-center">
            {/* Share button */}
            <button
              onClick={handleShare}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-indigo-100 transition-colors"
              title="复制为 Markdown"
            >
              {shared ? (
                <span className="text-green-400 text-xs leading-none">✓</span>
              ) : (
                <svg className="w-3 h-3 text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              )}
            </button>
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                deletePrompt(prompt.id)
              }}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
              title="删除"
            >
              <span className="text-red-400 text-sm leading-none">✕</span>
            </button>
          </div>
        )}
      </div>

      {/* Variable modal */}
      {showModal && (
        <VariableModal
          content={prompt.content}
          onConfirm={(filled) => {
            doCopy(filled)
            setShowModal(false)
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
