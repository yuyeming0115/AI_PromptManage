import { useState } from 'react'
import { usePromptStore } from '../store/usePromptStore'

interface Props {
  onClose: () => void
}

export function AuthPanel({ onClose }: Props) {
  const user = usePromptStore((s) => s.user)
  const syncing = usePromptStore((s) => s.syncing)
  const lastSyncedAt = usePromptStore((s) => s.lastSyncedAt)
  const signIn = usePromptStore((s) => s.signIn)
  const signUp = usePromptStore((s) => s.signUp)
  const signOut = usePromptStore((s) => s.signOut)
  const syncNow = usePromptStore((s) => s.syncNow)

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    const err =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password)
    setLoading(false)
    if (err) {
      setError(err)
    } else if (mode === 'register') {
      setSuccess('注册成功！请查收验证邮件后登录。')
      setMode('login')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  function formatTime(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
    return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontSize: 13,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '6px 8px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={onClose}
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
        <span className="text-xs font-medium text-gray-600">云端同步</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {user ? (
          /* ── Logged in ─────────────────────────────────────────── */
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 py-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: '#6366f1' }}
              >
                {user.email[0].toUpperCase()}
              </div>
              <p className="text-sm font-medium text-gray-700">{user.email}</p>
              {lastSyncedAt && (
                <p className="text-xs text-gray-400">上次同步：{formatTime(lastSyncedAt)}</p>
              )}
            </div>

            <button
              onClick={syncNow}
              disabled={syncing}
              className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
              style={
                syncing
                  ? { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
                  : { backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }
              }
            >
              {syncing ? '同步中…' : '立即同步'}
            </button>

            <button
              onClick={async () => { await signOut(); onClose() }}
              className="w-full py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              退出登录
            </button>
          </div>
        ) : (
          /* ── Login / Register ──────────────────────────────────── */
          <div className="flex flex-col gap-3">
            {/* Mode toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium mb-1">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                  className="flex-1 py-1.5 transition-colors"
                  style={
                    mode === m
                      ? { backgroundColor: '#6366f1', color: 'white' }
                      : { backgroundColor: 'white', color: '#6b7280' }
                  }
                >
                  {m === 'login' ? '登录' : '注册'}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#818cf8')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="至少 6 位"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#818cf8')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {success && <p className="text-xs text-green-600">{success}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-2 rounded-lg text-sm font-medium transition-colors mt-1"
              style={
                loading || !email.trim() || !password.trim()
                  ? { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
                  : { backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }
              }
            >
              {loading ? '请稍候…' : mode === 'login' ? '登录' : '注册'}
            </button>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              登录后数据自动同步到云端，跨设备随时可用。
              <br />
              未登录时仅本地存储。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
