import { useEffect } from 'react'
import { usePromptStore } from '../store/usePromptStore'
import { FloatButton } from './FloatButton'
import { Panel } from './Panel'

export function App() {
  const init = usePromptStore((s) => s.init)
  const initAuth = usePromptStore((s) => s.initAuth)
  const toggleOpen = usePromptStore((s) => s.toggleOpen)

  useEffect(() => {
    init().then(() => initAuth())
  }, [init, initAuth])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.altKey && e.key === 'p') {
        e.preventDefault()
        toggleOpen()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleOpen])

  return (
    <>
      <FloatButton />
      <Panel />
    </>
  )
}
