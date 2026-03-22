import { create } from 'zustand'
import { type Category, type Prompt, DEFAULT_CATEGORIES, SEED_PROMPTS } from '../types'

const STORAGE_KEY = 'ai_prompt_manage'

interface StorageData {
  prompts: Prompt[]
  categories: Category[]
  floatBtnPos: { x: number; y: number }
  activeCategory: string
  panelSize: { w: number; h: number }
  sortBy: 'date' | 'count'
}

async function loadFromStorage(): Promise<StorageData | null> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        resolve((result[STORAGE_KEY] as StorageData) ?? null)
      })
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        resolve(raw ? JSON.parse(raw) : null)
      } catch {
        resolve(null)
      }
    }
  })
}

async function saveToStorage(data: StorageData): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ [STORAGE_KEY]: data })
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

export interface AuthUser {
  id: string
  email: string
}

interface PromptStore extends StorageData {
  isEditMode: boolean
  isOpen: boolean
  initialized: boolean
  searchQuery: string
  editingPromptId: string | null
  user: AuthUser | null
  syncing: boolean
  lastSyncedAt: number | null

  init: () => Promise<void>
  initAuth: () => Promise<void>
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  syncNow: () => Promise<void>

  addPrompt: (content: string, categoryId: string) => void
  deletePrompt: (id: string) => void
  updatePrompt: (id: string, patch: Partial<Pick<Prompt, 'title' | 'content' | 'categoryId' | 'tags'>>) => void
  incrementUseCount: (id: string) => void
  setActiveCategory: (id: string) => void
  setFloatBtnPos: (pos: { x: number; y: number }) => void
  setPanelSize: (size: { w: number; h: number }) => void
  setSortBy: (sort: 'date' | 'count') => void
  setEditMode: (v: boolean) => void
  toggleOpen: () => void
  setSearchQuery: (q: string) => void
  setEditingPromptId: (id: string | null) => void
  addCategory: (label: string) => void
  deleteCategory: (id: string) => void
  importData: (data: { prompts: Prompt[]; categories?: Category[] }) => void
}

export const usePromptStore = create<PromptStore>((set, get) => {
  const persist = () => {
    const { prompts, categories, floatBtnPos, activeCategory, panelSize, sortBy } = get()
    saveToStorage({ prompts, categories, floatBtnPos, activeCategory, panelSize, sortBy })
  }

  const now = () => Date.now()

  return {
    prompts: [],
    categories: DEFAULT_CATEGORIES,
    floatBtnPos: { x: window.innerWidth - 72, y: window.innerHeight - 72 },
    activeCategory: 'all',
    panelSize: { w: 340, h: 480 },
    sortBy: 'date',
    isEditMode: false,
    isOpen: false,
    initialized: false,
    searchQuery: '',
    editingPromptId: null,
    user: null,
    syncing: false,
    lastSyncedAt: null,

    init: async () => {
      if (get().initialized) return
      const stored = await loadFromStorage()
      if (stored) {
        set({
          ...stored,
          categories: stored.categories ?? DEFAULT_CATEGORIES,
          panelSize: stored.panelSize ?? { w: 340, h: 480 },
          sortBy: stored.sortBy ?? 'date',
          prompts: (stored.prompts ?? []).map((p) => ({
            ...p,
            useCount: p.useCount ?? 0,
            updatedAt: p.updatedAt ?? p.createdAt,
          })),
          initialized: true,
        })
      } else {
        const initial: StorageData = {
          prompts: SEED_PROMPTS,
          categories: DEFAULT_CATEGORIES,
          floatBtnPos: { x: window.innerWidth - 72, y: window.innerHeight - 72 },
          activeCategory: 'all',
          panelSize: { w: 340, h: 480 },
          sortBy: 'date',
        }
        set({ ...initial, initialized: true })
        saveToStorage(initial)
      }
    },

    // ── Auth ────────────────────────────────────────────────────────────────
    initAuth: async () => {
      const { supabase } = await import('../lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: { id: session.user.id, email: session.user.email ?? '' } })
        get().syncNow()
      }

      supabase.auth.onAuthStateChange((_event: unknown, session: { user: { id: string; email?: string } } | null) => {
        if (session?.user) {
          set({ user: { id: session.user.id, email: session.user.email ?? '' } })
          get().syncNow()
        } else {
          set({ user: null })
        }
      })
    },

    signIn: async (email, password) => {
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return error.message
      await get().syncNow()
      return null
    },

    signUp: async (email, password) => {
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return error.message
      return null
    },

    signOut: async () => {
      const { supabase } = await import('../lib/supabase')
      await supabase.auth.signOut()
      set({ user: null, lastSyncedAt: null })
    },

    syncNow: async () => {
      const { user, prompts, categories } = get()
      if (!user) return
      set({ syncing: true })
      try {
        const { syncAll, subscribeToChanges } = await import('../lib/sync')
        const merged = await syncAll(prompts, categories, user.id)
        set({ ...merged, lastSyncedAt: Date.now() })
        persist()

        // Set up realtime subscription
        subscribeToChanges(
          user.id,
          (event, data) => {
            set((s) => {
              if (event === 'delete') {
                return { prompts: s.prompts.filter((p) => p.id !== (data as { id: string }).id) }
              }
              const prompt = data as Prompt
              const idx = s.prompts.findIndex((p) => p.id === prompt.id)
              if (idx >= 0) {
                const existing = s.prompts[idx]
                if ((prompt.updatedAt ?? 0) <= (existing.updatedAt ?? existing.createdAt)) return {}
                const prompts = [...s.prompts]
                prompts[idx] = prompt
                return { prompts }
              }
              return { prompts: [prompt, ...s.prompts] }
            })
          },
          (event, data) => {
            set((s) => {
              if (event === 'delete') {
                return { categories: s.categories.filter((c) => c.id !== (data as { id: string }).id) }
              }
              const cat = data as Category
              if (s.categories.find((c) => c.id === cat.id)) return {}
              return { categories: [...s.categories, cat] }
            })
          },
        )
      } finally {
        set({ syncing: false })
      }
    },

    // ── Mutations ────────────────────────────────────────────────────────────
    addPrompt: (content, categoryId) => {
      const trimmed = content.trim()
      if (!trimmed) return
      const ts = now()
      const newPrompt: Prompt = {
        id: crypto.randomUUID(),
        title: trimmed.slice(0, 20),
        content: trimmed,
        categoryId,
        useCount: 0,
        createdAt: ts,
        updatedAt: ts,
      }
      set((s) => ({ prompts: [newPrompt, ...s.prompts] }))
      persist()
      const { user } = get()
      if (user) import('../lib/sync').then(({ pushPrompt }) => pushPrompt(newPrompt, user.id))
    },

    deletePrompt: (id) => {
      set((s) => ({ prompts: s.prompts.filter((p) => p.id !== id) }))
      persist()
      const { user } = get()
      if (user) import('../lib/sync').then(({ deletePromptFromCloud }) => deletePromptFromCloud(id))
    },

    updatePrompt: (id, patch) => {
      const ts = now()
      set((s) => ({
        prompts: s.prompts.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: ts } : p)),
      }))
      persist()
      const { user, prompts } = get()
      if (user) {
        const updated = prompts.find((p) => p.id === id)
        if (updated) import('../lib/sync').then(({ pushPrompt }) => pushPrompt(updated, user.id))
      }
    },

    incrementUseCount: (id) => {
      const ts = now()
      set((s) => ({
        prompts: s.prompts.map((p) =>
          p.id === id ? { ...p, useCount: (p.useCount ?? 0) + 1, updatedAt: ts } : p,
        ),
      }))
      persist()
      const { user, prompts } = get()
      if (user) {
        const updated = prompts.find((p) => p.id === id)
        if (updated) import('../lib/sync').then(({ pushPrompt }) => pushPrompt(updated, user.id))
      }
    },

    setActiveCategory: (id) => {
      set({ activeCategory: id })
      persist()
    },

    setFloatBtnPos: (pos) => {
      set({ floatBtnPos: pos })
      persist()
    },

    setPanelSize: (size) => {
      set({ panelSize: size })
      persist()
    },

    setSortBy: (sort) => {
      set({ sortBy: sort })
      persist()
    },

    setEditMode: (v) => set({ isEditMode: v }),

    toggleOpen: () =>
      set((s) => ({
        isOpen: !s.isOpen,
        searchQuery: s.isOpen ? '' : s.searchQuery,
        editingPromptId: s.isOpen ? null : s.editingPromptId,
      })),

    setSearchQuery: (q) => set({ searchQuery: q }),
    setEditingPromptId: (id) => set({ editingPromptId: id }),

    addCategory: (label) => {
      const trimmed = label.trim()
      if (!trimmed) return
      const newCat: Category = { id: crypto.randomUUID(), label: trimmed }
      set((s) => ({ categories: [...s.categories, newCat] }))
      persist()
      const { user } = get()
      if (user) import('../lib/sync').then(({ pushCategories }) => pushCategories([newCat], user.id))
    },

    deleteCategory: (id) => {
      if (id === 'all') return
      const { categories, prompts, activeCategory } = get()
      const newCategories = categories.filter((c) => c.id !== id)
      const fallbackId = newCategories.find((c) => c.id !== 'all')?.id ?? 'general'
      const newPrompts = prompts.map((p) =>
        p.categoryId === id ? { ...p, categoryId: fallbackId, updatedAt: now() } : p,
      )
      const newActive = activeCategory === id ? 'all' : activeCategory
      set({ categories: newCategories, prompts: newPrompts, activeCategory: newActive })
      persist()
      const { user } = get()
      if (user) import('../lib/sync').then(({ deleteCategoryFromCloud }) => deleteCategoryFromCloud(id))
    },

    importData: ({ prompts: incoming, categories: incomingCats }) => {
      const { prompts, categories } = get()
      const existingIds = new Set(prompts.map((p) => p.id))
      const ts = now()
      const newPrompts = (incoming ?? [])
        .map((p) => ({ ...p, useCount: p.useCount ?? 0, updatedAt: p.updatedAt ?? ts }))
        .filter((p) => !existingIds.has(p.id))

      const existingCatIds = new Set(categories.map((c) => c.id))
      const newCats = (incomingCats ?? []).filter((c) => !existingCatIds.has(c.id))

      set({ prompts: [...prompts, ...newPrompts], categories: [...categories, ...newCats] })
      persist()
    },
  }
})
