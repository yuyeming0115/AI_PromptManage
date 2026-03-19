import { useEffect } from 'react'
import { usePromptStore } from '../store/usePromptStore'
import { FloatButton } from './FloatButton'
import { Panel } from './Panel'

export function App() {
  const init = usePromptStore((s) => s.init)
  const initAuth = usePromptStore((s) => s.initAuth)

  useEffect(() => {
    init().then(() => initAuth())
  }, [init, initAuth])

  return (
    <>
      <FloatButton />
      <Panel />
    </>
  )
}
