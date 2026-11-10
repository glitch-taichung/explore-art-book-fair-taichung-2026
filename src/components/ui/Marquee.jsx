export default function Marquee() {
  const items = [
    '⤵︎ 保 ↖︎ 持 ↘︎ 好 ↪︎ 奇 ⤵︎',
    '在紙頁之間',
    '思考、',
    '生活、、',
    '感覺、、、',
  ]

  const unit = (
    <div className="flex shrink-0 items-center gap-8 px-4 text-ink sm:gap-12 sm:px-6">
      {items.map((text, idx) => (
        <span
          key={idx}
          className="text-title font-normal tracking-widest whitespace-nowrap"
        >
          {text}
        </span>
      ))}
    </div>
  )

  return (
    <aside
      aria-label="保持好奇"
      className="relative z-20 overflow-hidden border-y border-ink/15 bg-white py-4 select-none"
    >
      <div className="animate-marquee">
        {unit}
        {unit}
        {unit}
        {unit}
      </div>
    </aside>
  )
}
