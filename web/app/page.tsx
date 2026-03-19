'use client'
import { useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  async function handleSignUp() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">AI Prompt Manager</h1>
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-indigo-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-600 disabled:opacity-50"
          >
            登录
          </button>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="border border-gray-200 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            注册
          </button>
        </div>
      </div>
    </div>
  )
}
