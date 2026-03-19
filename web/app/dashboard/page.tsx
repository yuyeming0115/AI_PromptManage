'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

interface Prompt {
  id: string
  title: string
  content: string
  category_id: string
  use_count: number
  tags: string[] | null
  created_at: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/')
    })
    fetchPrompts()
  }, [])

  async function fetchPrompts() {
    setLoading(true)
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
    setPrompts(data ?? [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('prompts').delete().eq('id', id)
    setPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleSave(id: string) {
    await supabase
      .from('prompts')
      .update({ title: editTitle, content: editContent })
      .eq('id', id)
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: editTitle, content: editContent } : p)),
    )
    setEditingId(null)
  }

  async function handleExport() {
    const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompts.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = prompts.filter(
    (p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="搜索 Prompt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <button
          onClick={handleExport}
          className="text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          导出 JSON
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-10">加载中...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
              {editingId === p.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-400"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="border border-gray-200 rounded px-2 py-1 text-sm outline-none resize-none focus:border-indigo-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(p.id)}
                      className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.content}</p>
                      {p.tags && p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(p.id)
                          setEditTitle(p.title)
                          setEditContent(p.content)
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-600"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">没有匹配的 Prompt</p>
          )}
        </div>
      )}
    </div>
  )
}
