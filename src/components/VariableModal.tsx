import { useState } from 'react'

interface Props {
  content: string
  onConfirm: (filled: string) => void
  onCancel: () => void
}

export function VariableModal({ content, onConfirm, onCancel }: Props) {
  const vars = [...new Set(Array.from(content.matchAll(/\{\{([^}]+)\}\}/g), (m) => m[1]))]
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(vars.map((v) => [v, ''])),
  )

  function handleConfirm() {
    let result = content
    for (const [k, v] of Object.entries(values)) {
      result = result.replaceAll(`{{${k}}}`, v)
    }
    onConfirm(result)
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        borderRadius: '12px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '10px',
          padding: '16px',
          width: '80%',
          maxWidth: '320px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
          填写变量
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {vars.map((v) => (
            <div key={v}>
              <label
                style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '3px' }}
              >
                {v}
              </label>
              <input
                type="text"
                value={values[v]}
                onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                placeholder={`输入 ${v}`}
                style={{
                  width: '100%',
                  fontSize: '13px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              fontSize: '12px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: 'white',
              color: '#6b7280',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            style={{
              fontSize: '12px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#6366f1',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            复制
          </button>
        </div>
      </div>
    </div>
  )
}
