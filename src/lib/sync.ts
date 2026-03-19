import { supabase } from './supabase'
import { type Category, type Prompt, BUILT_IN_IDS } from '../types'

// ── DB row types ────────────────────────────────────────────────────────────
interface DbPrompt {
  id: string
  user_id: string
  title: string
  content: string
  category_id: string
  use_count: number
  created_at: number
  updated_at: number
}

interface DbCategory {
  id: string
  user_id: string
  label: string
  created_at: number
}

// ── Converters ───────────────────────────────────────────────────────────────
export function dbToPrompt(r: DbPrompt): Prompt {
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    categoryId: r.category_id,
    useCount: r.use_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function promptToDb(p: Prompt, userId: string): DbPrompt {
  return {
    id: p.id,
    user_id: userId,
    title: p.title,
    content: p.content,
    category_id: p.categoryId,
    use_count: p.useCount ?? 0,
    created_at: p.createdAt,
    updated_at: p.updatedAt ?? p.createdAt,
  }
}

function categoryToDb(c: Category, userId: string): DbCategory {
  return { id: c.id, user_id: userId, label: c.label, created_at: Date.now() }
}

const builtInSet = new Set<string>(BUILT_IN_IDS)

// ── Push single prompt ───────────────────────────────────────────────────────
export async function pushPrompt(prompt: Prompt, userId: string) {
  await supabase.from('prompts').upsert(promptToDb(prompt, userId))
}

// ── Delete single prompt ─────────────────────────────────────────────────────
export async function deletePromptFromCloud(id: string) {
  await supabase.from('prompts').delete().eq('id', id)
}

// ── Push custom categories ───────────────────────────────────────────────────
export async function pushCategories(categories: Category[], userId: string) {
  const custom = categories.filter((c) => !builtInSet.has(c.id))
  if (custom.length === 0) return
  await supabase.from('categories').upsert(custom.map((c) => categoryToDb(c, userId)))
}

// ── Delete custom category ───────────────────────────────────────────────────
export async function deleteCategoryFromCloud(id: string) {
  await supabase.from('categories').delete().eq('id', id)
}

// ── Full bidirectional sync ──────────────────────────────────────────────────
export async function syncAll(
  localPrompts: Prompt[],
  localCategories: Category[],
  userId: string,
): Promise<{ prompts: Prompt[]; categories: Category[] }> {
  // Pull cloud data
  const [{ data: cloudPrompts }, { data: cloudCats }] = await Promise.all([
    supabase.from('prompts').select('*').eq('user_id', userId),
    supabase.from('categories').select('*').eq('user_id', userId),
  ])

  // ── Merge prompts (Last-Write-Wins by updatedAt) ──────────────────────────
  const localMap = new Map(localPrompts.map((p) => [p.id, p]))
  const cloudMap = new Map((cloudPrompts ?? []).map((r: DbPrompt) => [r.id, dbToPrompt(r)]))

  const merged = new Map<string, Prompt>()

  // Add all local prompts
  for (const p of localPrompts) merged.set(p.id, p)

  // Merge cloud: cloud wins if newer
  for (const [id, cp] of cloudMap) {
    const local = merged.get(id)
    if (!local || (cp.updatedAt ?? cp.createdAt) > (local.updatedAt ?? local.createdAt)) {
      merged.set(id, cp)
    }
  }

  const mergedPrompts = [...merged.values()].sort((a, b) => b.createdAt - a.createdAt)

  // Push to cloud: local prompts not in cloud or locally newer
  const toUpsert: DbPrompt[] = []
  for (const p of localPrompts) {
    const cp = cloudMap.get(p.id)
    if (!cp || (p.updatedAt ?? p.createdAt) >= (cp.updatedAt ?? cp.createdAt)) {
      toUpsert.push(promptToDb(p, userId))
    }
  }
  if (toUpsert.length > 0) {
    await supabase.from('prompts').upsert(toUpsert)
  }

  // ── Merge categories ──────────────────────────────────────────────────────
  const localCatMap = new Map(localCategories.map((c) => [c.id, c]))
  const cloudCatIds = new Set((cloudCats ?? []).map((r: DbCategory) => r.id))

  // Add cloud custom categories not in local
  const mergedCats = [...localCategories]
  for (const r of cloudCats ?? []) {
    if (!localCatMap.has(r.id)) {
      mergedCats.push({ id: r.id, label: r.label })
    }
  }

  // Push local custom categories not in cloud
  const customToUpsert = localCategories
    .filter((c) => !builtInSet.has(c.id) && !cloudCatIds.has(c.id))
    .map((c) => categoryToDb(c, userId))
  if (customToUpsert.length > 0) {
    await supabase.from('categories').upsert(customToUpsert)
  }

  return { prompts: mergedPrompts, categories: mergedCats }
}

// ── Realtime subscription ────────────────────────────────────────────────────
type PromptChangeHandler = (event: 'upsert' | 'delete', prompt: Prompt | { id: string }) => void
type CategoryChangeHandler = (event: 'upsert' | 'delete', cat: Category | { id: string }) => void

let activeChannel: ReturnType<typeof supabase.channel> | null = null

export function subscribeToChanges(
  userId: string,
  onPromptChange: PromptChangeHandler,
  onCategoryChange: CategoryChangeHandler,
) {
  // Clean up any previous subscription
  if (activeChannel) {
    supabase.removeChannel(activeChannel)
    activeChannel = null
  }

  activeChannel = supabase
    .channel(`user-sync-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'prompts', filter: `user_id=eq.${userId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onPromptChange('delete', { id: (payload.old as DbPrompt).id })
        } else {
          onPromptChange('upsert', dbToPrompt(payload.new as DbPrompt))
        }
      },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onCategoryChange('delete', { id: (payload.old as DbCategory).id })
        } else {
          const r = payload.new as DbCategory
          onCategoryChange('upsert', { id: r.id, label: r.label })
        }
      },
    )
    .subscribe()

  return () => {
    if (activeChannel) {
      supabase.removeChannel(activeChannel)
      activeChannel = null
    }
  }
}
