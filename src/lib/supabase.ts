import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Persist auth session in chrome.storage.local (survives page navigation)
const storageAdapter = {
  getItem: (key: string): Promise<string | null> =>
    new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(key, (r) => resolve((r[key] as string) ?? null))
      } else {
        resolve(localStorage.getItem(key))
      }
    }),
  setItem: (key: string, value: string): Promise<void> =>
    new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [key]: value }, resolve)
      } else {
        localStorage.setItem(key, value)
        resolve()
      }
    }),
  removeItem: (key: string): Promise<void> =>
    new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove(key, resolve)
      } else {
        localStorage.removeItem(key)
        resolve()
      }
    }),
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
