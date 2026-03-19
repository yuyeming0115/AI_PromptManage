import { useRef, useState } from 'react'
import { usePromptStore } from '../store/usePromptStore'
import { type Category, type Prompt } from '../types'
import { AuthPanel } from './AuthPanel'
import { CategoryTabs } from './CategoryTabs'
import { PromptEditor } from './PromptEditor'
import { PromptInput } from './PromptInput'
import { PromptList } from './PromptList'

type ResizeDir = 'e' | 's' | 'se'
interface ResizeState {
  dir: ResizeDir
  startX: number
  startY: number
  startW: number
  startH: number
}

export function Panel() {
  const { isOpen, isEditMode, setEditMode, toggleOpen, floatBtnPos } = usePromptStore()
  const editingPromptId = usePromptStore((s) => s.editingPromptId)
  const panelSz = usePromptStore((s) => s.panelSize)
  const sortBy = usePromptStore((s) => s.sortBy)
  const prompts = usePromptStore((s) => s.prompts)
  const categories = usePromptStore((s) => s.categories)
  const user = usePromptStore((s) => s.user)
  const syncing = usePromptStore((s) => s.syncing)
  const setSortBy = usePromptStore((s) => s.setSortBy)
  const setPanelSize = usePromptStore((s) => s.setPanelSize)
  const importData = usePromptStore((s) => s.importData)

  const [showAuth, setShowAuth] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const resizeRef = useRef<ResizeState | null>(null)

  if (!isOpen) return null

  // Panel position
  const btnSize = 48
  const margin = 8
  let left = floatBtnPos.x + btnSize / 2 - panelSz.w / 2
  let top = floatBtnPos.y - panelSz.h - margin
  if (top < margin) top = floatBtnPos.y + btnSize + margin
  left = Math.max(margin, Math.min(window.innerWidth - panelSz.w - margin, left))

  // ── Resize handlers ──────────────────────────────────────────────
  function startResize(e: React.PointerEvent<HTMLDivElement>, dir: ResizeDir) {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      startW: panelSz.w,
      startH: panelSz.h,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onResizeMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = resizeRef.current
    if (!r) return
    const dx = e.clientX - r.startX
    const dy = e.clientY - r.startY
    const maxW = Math.min(window.innerWidth - 24, 600)
    const maxH = Math.min(window.innerHeight - 24, 800)
    setPanelSize({
      w: r.dir === 'e' || r.dir === 'se' ? Math.max(280, Math.min(maxW, r.startW + dx)) : r.startW,
      h: r.dir === 's' || r.dir === 'se' ? Math.max(360, Math.min(maxH, r.startH + dy)) : r.startH,
    })
  }

  function endResize() {
    resizeRef.current = null
  }

  // ── Export ───────────────────────────────────────────────────────
  function handleExport() {
    const data = JSON.stringify({ prompts, categories }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-prompts-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Import ───────────────────────────────────────────────────────
  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string)
        // Support both {prompts, categories} and bare array formats
        const data: { prompts: Prompt[]; categories?: Category[] } = Array.isArray(raw)
          ? { prompts: raw }
          : raw
        if (Array.isArray(data.prompts)) importData(data)
      } catch {
        // invalid JSON — silently ignore
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Shared handle props factory ───────────────────────────────────
  function handleProps(dir: ResizeDir, style: React.CSSProperties) {
    return {
      style: { position: 'absolute' as const, zIndex: 1, ...style },
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => startResize(e, dir),
      onPointerMove: onResizeMove,
      onPointerUp: endResize,
    }
  }

  return (
    // Outer container: fixed position + size, overflow visible for handles
    <div
      style={{
        position: 'fixed',
        left,
        top,
        width: panelSz.w,
        height: panelSz.h,
        zIndex: 2147483645,
      }}
    >
      {/* Main panel content */}
      <div
        className="absolute inset-0 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-700">AI Prompts</span>
          <div className="flex items-center gap-1">
            {/* Auth / User */}
            <button
              onClick={() => { setShowAuth(true) }}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
              style={{ color: user ? '#6366f1' : '#9ca3af' }}
              title={user ? `已登录：${user.email}` : '登录以启用云端同步'}
            >
              {syncing ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M12 2a10 10 0 1 0 10 10" />
                </svg>
              ) : user ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Sort toggle */}
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'count' : 'date')}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
              style={{ color: sortBy === 'count' ? '#6366f1' : '#9ca3af' }}
              title={sortBy === 'date' ? '当前：按时间排序，点击切换为按使用次数' : '当前：按使用次数排序，点击切换为按时间'}
            >
              {sortBy === 'count' ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h7a1 1 0 100-2H3zm0 4a1 1 0 100 2h4a1 1 0 100-2H3z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="导出 JSON"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Import */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="导入 JSON"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />

            {/* Edit mode toggle */}
            <button
              onClick={() => setEditMode(!isEditMode)}
              className={[
                'px-2 py-0.5 rounded text-xs font-medium transition-colors duration-100',
                isEditMode
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
              ].join(' ')}
            >
              {isEditMode ? '完成' : '编辑'}
            </button>

            {/* Close */}
            <button
              onClick={toggleOpen}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="关闭"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        {showAuth ? (
          <AuthPanel onClose={() => setShowAuth(false)} />
        ) : editingPromptId ? (
          <PromptEditor />
        ) : (
          <>
            <div className="flex-shrink-0">
              <CategoryTabs />
            </div>
            <div className="flex-shrink-0">
              <PromptInput />
            </div>
            <PromptList />
          </>
        )}
      </div>

      {/* ── Resize handles ── */}
      {/* Right edge */}
      <div
        {...handleProps('e', { right: -4, top: 20, bottom: 20, width: 8, cursor: 'ew-resize' })}
      />
      {/* Bottom edge */}
      <div
        {...handleProps('s', { bottom: -4, left: 20, right: 20, height: 8, cursor: 'ns-resize' })}
      />
      {/* Bottom-right corner */}
      <div
        {...handleProps('se', { right: -4, bottom: -4, width: 16, height: 16, cursor: 'nwse-resize' })}
      />
    </div>
  )
}
