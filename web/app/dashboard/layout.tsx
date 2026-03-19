'use client'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800">AI Prompt Manager</span>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          退出登录
        </button>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
