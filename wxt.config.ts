import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'AI Prompt Manager',
    description: 'Quick access to your saved AI prompts from any page',
    version: '0.1.0',
    icons: { '16': 'icon-16.png', '48': 'icon-48.png', '128': 'icon-128.png' },
    permissions: ['storage'],
    host_permissions: ['https://*.supabase.co/*'],
  },
})
