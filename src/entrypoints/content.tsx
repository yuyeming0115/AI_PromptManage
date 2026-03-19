import '../styles/tailwind.css'
import ReactDOM from 'react-dom/client'
import { App } from '../components/App'

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'ai-prompt-manage',
      position: 'overlay',
      anchor: 'body',
      append: 'last',
      onMount(container) {
        const root = ReactDOM.createRoot(container)
        root.render(<App />)
        return root
      },
      onRemove(root) {
        root?.unmount()
      },
    })
    ui.mount()
  },
})
