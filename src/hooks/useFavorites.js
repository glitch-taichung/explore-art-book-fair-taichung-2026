import { useCallback, useEffect, useState } from 'react'

const KEY = 'abf26:favorites'

export function useFavorites() {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) ?? [] } catch { return [] }
  })
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* ignore */ }
  }, [ids])
  const toggle = useCallback((id) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])), [])
  return { ids, has: (id) => ids.includes(id), toggle }
}
