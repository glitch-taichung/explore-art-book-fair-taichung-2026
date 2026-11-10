import { useEffect, useState } from 'react'

export default function Countdown({ targetIso }) {
  const [diff, setDiff] = useState(() => Math.max(0, new Date(targetIso).getTime() - Date.now()))

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(Math.max(0, new Date(targetIso).getTime() - Date.now()))
    }, 1000)
    return () => clearInterval(id)
  }, [targetIso])

  if (diff <= 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-mint/25 px-3.5 py-1 font-mono text-xs font-bold text-ink">
        <span className="h-2 w-2 rounded-full bg-teal" />
        活動進行中・NOW OPEN
      </div>
    )
  }

  const totalSec = Math.floor(diff / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-md border border-mesh/80 bg-white/85 px-3.5 py-1.5 font-mono text-xs shadow-xs backdrop-blur-xs">
      <span className="text-slate/75">距離開幕</span>
      <span className="font-bold text-ink">{days}</span>
      <span className="text-slate/70">D</span>
      <span className="font-bold text-ink">{pad(hours)}</span>
      <span className="text-slate/70">H</span>
      <span className="font-bold text-ink">{pad(mins)}</span>
      <span className="text-slate/70">M</span>
      <span className="font-bold text-teal">{pad(secs)}</span>
      <span className="text-slate/70">S</span>
    </div>
  )
}
