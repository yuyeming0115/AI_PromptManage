import { useRef } from 'react'
import { usePromptStore } from '../store/usePromptStore'

export function FloatButton() {
  const { floatBtnPos, setFloatBtnPos, toggleOpen, isOpen } = usePromptStore()
  const btnRef = useRef<HTMLButtonElement>(null)
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)

  function clamp(pos: { x: number; y: number }) {
    const size = 48
    return {
      x: Math.max(8, Math.min(window.innerWidth - size - 8, pos.x)),
      y: Math.max(8, Math.min(window.innerHeight - size - 8, pos.y)),
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return
    dragging.current = true
    hasMoved.current = false
    dragOffset.current = {
      x: e.clientX - floatBtnPos.x,
      y: e.clientY - floatBtnPos.y,
    }
    btnRef.current?.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging.current) return
    const newPos = clamp({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    })
    const dx = newPos.x - floatBtnPos.x
    const dy = newPos.y - floatBtnPos.y
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved.current = true
    setFloatBtnPos(newPos)
  }

  function onPointerUp() {
    if (!dragging.current) return
    dragging.current = false
    if (!hasMoved.current) {
      toggleOpen()
    }
  }

  return (
    <button
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'fixed',
        left: floatBtnPos.x,
        top: floatBtnPos.y,
        zIndex: 2147483646,
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: 'none',
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isOpen ? '#4f46e5' : '#6366f1',
        color: 'white',
        boxShadow: '0 4px 14px rgba(99,102,241,0.6)',
        transition: 'background-color 0.15s',
      }}
      title="AI Prompt Manager"
    >
      <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>P</span>
    </button>
  )
}
