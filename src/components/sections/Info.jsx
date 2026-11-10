import { useState } from 'react'
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
]

/**
 * 頁面底部段落 (#info)：
 * 1. 上半：擷取第一篇 IG 貼文 8 張圖卡的「圓弧型扇形輪播 (Arc Carousel)」＋ Previous / 伸縮膠囊 / Next 控制器
 * 2. 下半：滑到頁面最下方時最需要的實用參展資訊（DATE / PLACE / ADMISSION / CURATORIAL NOTE），採 OFFPRINT × timesmuseum 乾淨對齊排版
 */
export default function Info({ event }) {
  const [active, setActive] = useState(0)
  const total = IG_SLIDES.length

  const prev = () => setActive((i) => (i - 1 + total) % total)
  const next = () => setActive((i) => (i + 1) % total)

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
      className="snap-start scroll-mt-12 min-h-dvh bg-slate px-6 py-28 text-white sm:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* 1. 圓弧型 IG 視覺輪播 (Curved Arc Carousel) */}
        <div className="mb-8">
          <h2 className="text-display font-bold">
            <span className="font-explore-en font-bold not-italic">Info</span>　活動資訊
          </h2>
        </div>

        <div
          className="relative mx-auto h-[23rem] w-full overflow-hidden pt-6 sm:h-[27rem]"
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
                  onClick={() => setActive(idx)}
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

        {/* 你喜歡的多圖選擇器：Previous / 中間圓弧伸縮膠囊 (▬ • •) / Next */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={prev}
            className="rounded-full bg-white/15 px-5 py-2 text-cap text-white transition hover:bg-lime hover:text-ink"
          >
            Previous
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="切換活動圖卡">
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
                  style={{
                    width: isCur ? '28px' : '8px',
                    transition: 'width 320ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 250ms',
                  }}
                  className={`h-2 rounded-full ${
                    isCur ? 'bg-lime' : 'bg-white/35 hover:bg-white/65'
                  }`}
                />
              )
            })}
          </div>

          <button
            type="button"
            onClick={next}
            className="rounded-full bg-white/15 px-5 py-2 text-cap text-white transition hover:bg-lime hover:text-ink"
          >
            Next
          </button>
        </div>

        {/* 2. 滑到最底部時的核心實用資訊（參考 OFFPRINT × timesmuseum 留白對齊版式） */}
        <div className="mt-28 grid gap-12 border-t border-white/25 pt-16 lg:grid-cols-12">
          {/* 左欄：時間、地點、入場 */}
          <dl className="grid grid-cols-[5.5rem_1fr] gap-y-8 text-body lg:col-span-5">
            <dt className="text-cap text-white/70">PLACE</dt>
            <dd>
              <p className="font-bold">@{event.venue}</p>
              <p className="text-cap text-white/80">Taichung Green Museumbrary · Shaded Plaza</p>
              <p className="mt-2 font-bold text-lime">Free entrance 自由入場</p>
            </dd>

            <dt className="text-cap text-white/70">DATES</dt>
            <dd className="space-y-3">
              {event.days.map((d) => (
                <div key={d.day} className="flex flex-wrap items-baseline gap-x-4">
                  <span className="font-bold tracking-wide">
                    {d.label.replace('.', '/')} {d.weekday}
                  </span>
                  <span className="text-white/90">
                    {d.open} - {d.close}
                  </span>
                </div>
              ))}
            </dd>

            <dt className="text-cap text-white/70">ACCESS</dt>
            <dd className="text-cap text-white/80">
              論壇與工作坊需事先報名，主舞台沙龍與專家導覽皆為現場自由參與。
            </dd>
          </dl>

          {/* 右欄：timesmuseum 風底線引言 ＋ 精簡論述 */}
          <div className="space-y-6 lg:col-span-7">
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
