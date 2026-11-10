import { useState } from 'react'
import Picture from './Picture'

/** 書／餐點「吊掛」陳列：點一本，其他模糊退後、被選的放大，下方出現說明。 */
export default function BookShelf({ vendor }) {
  const isFood = vendor.kind === 'food'
  const raw = isFood ? vendor.menu : vendor.books
  const items = raw?.length
    ? raw.map((it) => (typeof it === 'string' ? { title: it } : { title: it.name, by: it.by, bio: it.bio }))
    : [1, 2, 3].map(() => ({ title: isFood ? '餐點整理中' : '選書整理中', empty: true }))

  const [active, setActive] = useState(null)
  const n = items.length
  const go = (d) => setActive((a) => (a === null ? 0 : (a + d + n) % n))
  const cur = active === null ? null : items[active]

  return (
    <section
      aria-label={isFood ? '餐點' : '選書'}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1)
        if (e.key === 'ArrowLeft') go(-1)
        if (e.key === 'Escape' && active !== null) {
          e.stopPropagation()
          setActive(null)
        }
      }}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-cap font-bold">{isFood ? '餐點 Menu' : '選書 Selected Books'}</h3>
        <span className="text-cap text-ink/60">{active === null ? '點一本看看' : `${active + 1} / ${n}`}</span>
      </div>

      {/* 吊桿 */}
      <div className="mt-4 border-t border-ink">
        <ul className="flex h-[22rem] gap-3 pt-4">
          {items.map((it, i) => {
            const isActive = active === i
            const dim = active !== null && !isActive
            return (
              <li
                key={i}
                className="relative min-w-0 basis-0"
                style={{
                  flexGrow: active === null ? 1 : isActive ? 4 : 1,
                  transition: 'flex-grow 500ms cubic-bezier(.2,.7,.2,1), filter 500ms, opacity 500ms',
                  filter: dim ? 'blur(3px)' : 'none',
                  opacity: dim ? 0.4 : 1,
                }}
              >
                <span aria-hidden="true" className="absolute -top-4 left-1/2 h-4 w-px bg-ink" />
                <button
                  type="button"
                  aria-pressed={isActive}
                  aria-label={it.title}
                  onClick={() => setActive(isActive ? null : i)}
                  className="block h-full w-full cursor-pointer"
                >
                  <Picture
                    path={`exhibitors/${vendor.id}/books/${String(i + 1).padStart(2, '0')}`}
                    label={`${it.title}\n${String(i + 1).padStart(2, '0')}`}
                    ratio="auto"
                    className="h-full w-full whitespace-pre-line"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-5 min-h-[7rem]" aria-live="polite">
        {cur ? (
          <>
            <p className="font-bold">{cur.title}</p>
            {cur.by && <p className="text-cap text-ink/60">{cur.by}</p>}
            {cur.bio && <p className="mt-2 whitespace-pre-line text-body">{cur.bio}</p>}
          </>
        ) : null}
      </div>

      {n > 1 && !items[0].empty && (
        <div className="flex gap-6 text-cap">
          <button type="button" onClick={() => go(-1)} className="underline underline-offset-4">
            ← 上一本
          </button>
          <button type="button" onClick={() => go(1)} className="underline underline-offset-4">
            下一本 →
          </button>
        </div>
      )}

      {vendor.limited && <p className="mt-4 text-cap">書展限定：{vendor.limited}</p>}
    </section>
  )
}
