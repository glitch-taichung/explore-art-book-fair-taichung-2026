import { useEffect, useRef, useState } from 'react'
import { img } from '../../lib/images'

const IG_SLIDES = [
  { id: '01', caption: '2026 臺中閱讀節｜城市裡的閱讀風景' },
  { id: '02', caption: '什麼不是日常？閱讀的世界裡有 N 種日常' },
  { id: '03', caption: 'Wow！Zine 一個可能——出版交流論壇' },
  { id: '04', caption: 'Blablabla 有話想說——主舞台沙龍' },
  { id: '05', caption: 'Hi～傻瓜書日的藝術書導讀' },
  { id: '06', caption: '啪！不紙這樣〜 Riso 孔版印刷體驗工作坊' },
  { id: '07', caption: 'Ta-da！手工書製作工作坊——做一本木頭書' },
  { id: '08', caption: 'Ya＃聽我放音樂 台語金曲之夜 Silent Party' },
  { id: '09', caption: 'Ya＃聽我放音樂 台語金曲之夜 Silent Party' },
  { id: '10', caption: 'Ya＃聽我放音樂 台語金曲之夜 Silent Party' },
  { id: '11', caption: 'Ya＃聽我放音樂 台語金曲之夜 Silent Party' }
]

/**
 * 頁面底部段落 (#info)：
 * 1. 上半：擷取第一篇 IG 貼文 8 張圖卡的「圓弧型扇形輪播 (Arc Carousel)」＋ Previous / 伸縮膠囊 / Next 控制器
 * 2. 下半：滑到頁面最下方時最需要的實用參展資訊（DATE / PLACE / ADMISSION / CURATORIAL NOTE），採 OFFPRINT × timesmuseum 乾淨對齊排版
 */
export default function Info({ event }) {
  const [active, setActive] = useState(0)
  const total = IG_SLIDES.length
  const pointerStartRef = useRef(null)
  const didSwipeRef = useRef(false)

  const prev = () => setActive((i) => (i - 1 + total) % total)
  const next = () => setActive((i) => (i + 1) % total)

  useEffect(() => {
    const onWindowPointerUp = (e) => {
      const start = pointerStartRef.current
      if (!start) return
      pointerStartRef.current = null
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy)) {
        didSwipeRef.current = true
        if (dx < 0) setActive((i) => (i + 1) % total)
        else setActive((i) => (i - 1 + total) % total)
      }
    }
    const onWindowPointerCancel = () => {
      pointerStartRef.current = null
    }
    window.addEventListener('pointerup', onWindowPointerUp)
    window.addEventListener('pointercancel', onWindowPointerCancel)
    return () => {
      window.removeEventListener('pointerup', onWindowPointerUp)
      window.removeEventListener('pointercancel', onWindowPointerCancel)
    }
  }, [total])

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    didSwipeRef.current = false
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
  }

  // 計算環形相對距離 (-3 ~ +4) 以排列成圓弧扇形
  const getOffset = (idx) => {
    let diff = idx - active
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return diff
  }

  return (
    <section
      id="info"
      aria-label="活動資訊"
      className="snap-start scroll-mt-12 min-h-dvh overflow-x-clip bg-slate px-6 py-28 text-white sm:px-12"
    >
      <div className="mx-auto max-w-[1280px] min-w-0">
        {/* 1. 圓弧型 IG 視覺輪播 (Curved Arc Carousel) */}
        <div className="mb-8">
          <h2 className="text-display font-bold">
            <span className="font-explore-en font-bold not-italic">Info</span>　活動資訊
          </h2>
        </div>

        <div
          className="relative mx-auto h-[23rem] w-full cursor-grab touch-pan-y overflow-hidden pt-6 select-none active:cursor-grabbing sm:h-[27rem]"
          onPointerDown={handlePointerDown}
          onDragStart={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') prev()
            if (e.key === 'ArrowRight') next()
          }}
        >
          <div className="relative mx-auto flex h-full w-full items-center justify-center">
            {IG_SLIDES.map((slide, idx) => {
              const offset = getOffset(idx)
              const abs = Math.abs(offset)
              const visible = abs <= 3
              const src = img(`hero/ig/${slide.id}`)

              // 圓弧幾何：越往兩側越往下沉 (translateY 呈拋物線) 並帶有扇形旋轉角 (rotate)
              const translateX = offset * 175
              const translateY = offset * offset * 16
              const rotate = offset * 6.5
              const scale = offset === 0 ? 1 : Math.max(0.78, 1 - abs * 0.08)
              const opacity = !visible ? 0 : offset === 0 ? 1 : Math.max(0.35, 0.85 - abs * 0.2)

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    if (didSwipeRef.current) {
                      didSwipeRef.current = false
                      return
                    }
                    setActive(idx)
                  }}
                  aria-label={`檢視第 ${idx + 1} 張活動圖卡：${slide.caption}`}
                  aria-pressed={offset === 0}
                  style={{
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg) scale(${scale})`,
                    zIndex: 20 - abs,
                    opacity,
                    pointerEvents: visible ? 'auto' : 'none',
                    transition:
                      'transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 420ms ease',
                  }}
                  className="absolute top-4 w-52 cursor-pointer overflow-hidden bg-cool shadow-xl sm:w-64"
                >
                  {src ? (
                    <img
                      src={src}
                      alt={slide.caption}
                      loading="lazy"
                      className="aspect-[4/5] h-auto w-full object-contain"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center bg-cool text-cap text-ink/60">
                      IG {slide.id}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 多圖選擇器：手機版收斂按鈕與膠囊間距，確保右側 Next 不被裁切 */}
        <div className="mt-6 flex w-full items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            onClick={prev}
            className="shrink-0 cursor-pointer rounded-full bg-white/15 px-3 py-1.5 text-[0.78rem] text-white transition hover:bg-lime hover:text-ink sm:px-5 sm:py-2 sm:text-cap"
          >
            Previous
          </button>

          <div className="flex min-w-0 items-center justify-center gap-1 sm:gap-2" role="tablist" aria-label="切換活動圖卡">
            {IG_SLIDES.map((s, i) => {
              const isCur = i === active
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={isCur}
                  aria-label={`第 ${i + 1} 張`}
                  onClick={() => setActive(i)}
                  className={`h-1.5 sm:h-2 cursor-pointer rounded-full transition-all duration-300 ${
                    isCur ? 'w-5 sm:w-7 bg-lime' : 'w-1.5 sm:w-2 bg-white/35 hover:bg-white/65'
                  }`}
                />
              )
            })}
          </div>

          <button
            type="button"
            onClick={next}
            className="shrink-0 cursor-pointer rounded-full bg-white/15 px-3 py-1.5 text-[0.78rem] text-white transition hover:bg-lime hover:text-ink sm:px-5 sm:py-2 sm:text-cap"
          >
            Next
          </button>
        </div>

        {/* 2. 滑到最底部時的核心實用資訊（參考 OFFPRINT × timesmuseum 留白對齊版式） */}
        <div className="mt-28 grid gap-12 border-t border-white/25 pt-16 lg:grid-cols-12">
          {/* 左欄：時間、地點、入場 */}
          <dl className="grid min-w-0 grid-cols-[4.75rem_1fr] items-baseline gap-y-8 text-body sm:grid-cols-[5.5rem_1fr] lg:col-span-5">
            <dt className="text-cap text-white/70 text-left">PLACE</dt>
            <dd className="min-w-0 text-left">
              <p className="font-bold text-left">@{event.venue}</p>
              <p className="text-cap text-white/80 text-left">Taichung Green Museumbrary · Shaded Plaza</p>
              <p className="mt-2 font-bold text-lime text-left">Free entrance 自由入場</p>
            </dd>

            <dt className="text-cap text-white/70 text-left">DATES</dt>
            <dd className="min-w-0 space-y-3 text-left">
              {event.days.map((d) => (
                <div key={d.day} className="flex flex-wrap items-baseline gap-x-4">
                  <span className="inline-block min-w-[6.75rem] font-bold tracking-wide">
                    {d.label.replace('.', '/')} {d.weekday}
                  </span>
                  <span className="text-white/90">
                    {d.open} - {d.close}
                  </span>
                </div>
              ))}
            </dd>

            <dt className="text-cap text-white/70 text-left">ACCESS</dt>
            <dd className="min-w-0 text-cap text-white/80 text-left leading-relaxed">
              論壇與工作坊需事先報名，主舞台沙龍與專家導覽皆為現場自由參與。
            </dd>
          </dl>

          {/* 右欄：timesmuseum 風底線引言 ＋ 精簡論述 */}
          <div className="min-w-0 space-y-6 lg:col-span-7">
            <p className="text-title font-bold underline underline-offset-8">
              在臺中綠美圖，從書籍出發，重新想像「書」如何成為每個人日常生活的一部分。
            </p>
            <p className="text-body text-white/90">
              2026 臺中閱讀節「城市裡的閱讀風景 Reading in the City」由臺中市立圖書館主辦、毛刺 Glitch
              策劃，匯聚 25 組國內外藝術書店、Zine 創作者與獨立出版單位，以及 5
              攤特色飲食、出版交流論壇、Blablabla 沙龍與工作坊。在半戶外遮蔭廣場與閱讀島之間，讓每一次翻閱都成為感受與創造的新起點。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
