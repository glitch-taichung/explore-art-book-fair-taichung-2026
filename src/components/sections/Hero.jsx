import { useEffect, useRef } from 'react'
import wordmarkH from '../../assets/brand/wordmark_horizontal.png'
import wordmarkSub from '../../assets/brand/wordmark_sub.png'
import { EXPLORE_TILES, ExploreTile, ExploreTextLogotype } from '../ui/ExploreLogotype'
import Marquee from '../ui/Marquee'

// 扉頁左側原版交疊排法（對應 7 個圖樣字：E, X, P, L, O, R, E）
// L 左上角交疊於 P 右下角；R 右上角交疊於 O 左下角
const SCATTER_POS = [
  { row: 0, col: 0, rot: 0 },    // 0: E
  { row: 0, col: 1, rot: 0 },    // 1: X
  { row: 0, col: 2, rot: 0 },    // 2: P
  { row: 1, col: 2.35, rot: 0 }, // 3: L（左上交疊 P 右下）
  { row: 2, col: 0.9, rot: 0 },  // 4: O
  { row: 3, col: 0.1, rot: 0 },  // 5: R（右上交疊 O 左下）
  { row: 4, col: 1.55, rot: 0 }, // 6: E
]

// 每個字母掉落的些微時間差與途中微傾角（到達下個區段時全部歸零排齊）
const FALL_META = [
  { delay: 0.06, midRot: -6 },
  { delay: 0.11, midRot: 5 },
  { delay: 0.15, midRot: -4 },
  { delay: 0.04, midRot: 7 },
  { delay: 0.08, midRot: -5 },
  { delay: 0.0, midRot: 4 },
  { delay: 0.02, midRot: -5 },
]

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * 遮蔭廣場 (Shaded Plaza) 幾何空間背景：
 * - 後景僅保留紅圈指定的兩處結構：
 *   1. 中景後方挑空區的「一個環的建築輪廓」(2F Curved Ring Balcony Contour)
 *   2. 右側後景的「斜向電梯／手扶梯結構」
 * - 所有前景圓柱皆加上不透明基底遮擋，確保後景電梯與線條絕不穿透或擋到柱子
 */
function ShadedPlazaGeometricBg() {
  const louverLines = Array.from({ length: 44 }, (_, i) => {
    const xTop = -260 + i * 48
    return { x1: xTop, y1: 0, x2: 780 + (i - 22) * 14, y2: 278 }
  })

  const ceilingLights = [
    [320, 72], [410, 96], [510, 124], [605, 152], [690, 178],
    [540, 64], [640, 98], [735, 130], [820, 162], [895, 190],
    [820, 58], [910, 94], [995, 132], [1075, 168],
    [1080, 52], [1165, 92], [1245, 134],
  ]

  const columns = [
    { x: 86, y1: 58, y2: 675, w: 46, opacity: 0.28 },    // 左側近景柱
    { x: 356, y1: 192, y2: 545, w: 22, opacity: 0.22 },  // 左中景柱
    { x: 525, y1: 0, y2: 735, w: 68, opacity: 0.32 },    // 中央主近景圓柱
    { x: 742, y1: 185, y2: 552, w: 24, opacity: 0.22 },  // 中景柱
    { x: 965, y1: 112, y2: 622, w: 40, opacity: 0.26 },  // 右中景柱
    { x: 1168, y1: 156, y2: 575, w: 30, opacity: 0.22 }, // 右側柱
    { x: 1328, y1: 175, y2: 555, w: 24, opacity: 0.18 }, // 極右遠柱
  ]

  return (
    <svg
      viewBox="0 0 1440 820"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full select-none"
    >
      {/* 1. 基底：深灰藍 (#5d7a90) */}
      <rect width="1440" height="820" fill="#5d7a90" />

      {/* 2. 後方背景半透明遮罩（無網格線） */}
      <rect x="330" y="278" width="1110" height="242" fill="#c9d4de" fillOpacity="0.10" />
      <line x1="330" y1="278" x2="1440" y2="278" stroke="#ffffff" strokeOpacity="0.32" strokeWidth="1.2" />
      <line x1="330" y1="520" x2="1440" y2="520" stroke="#ffffff" strokeOpacity="0.30" strokeWidth="1.2" />

      {/* 3. 紅圈指定後景 A：後方挑空區「一個環的建築輪廓」（2F 弧形環狀連廊與支撐立柱） */}
      <g>
        <path
          d="M 455 316 Q 555 312 622 346 L 600 356 Q 545 328 455 332 Z"
          fill="#c9d4de"
          fillOpacity="0.14"
          stroke="#ffffff"
          strokeOpacity="0.34"
          strokeWidth="1.1"
        />
        <path
          d="M 455 352 Q 555 350 622 368 L 622 398 Q 555 382 455 384 Z"
          fill="#c9d4de"
          fillOpacity="0.20"
          stroke="#ffffff"
          strokeOpacity="0.42"
          strokeWidth="1.2"
        />
        <rect
          x="574"
          y="392"
          width="14"
          height="128"
          fill="#c9d4de"
          fillOpacity="0.18"
          stroke="#ffffff"
          strokeOpacity="0.36"
          strokeWidth="1"
        />
      </g>

      {/* 4. 紅圈指定後景 B：右側後景斜向電梯／手扶梯量體（位於圓柱底層之後，絕不擋柱） */}
      <g>
        <polygon
          points="1020,278 1135,278 1425,495 1310,495"
          fill="#c9d4de"
          fillOpacity="0.14"
          stroke="#ffffff"
          strokeOpacity="0.32"
          strokeWidth="1.2"
        />
        <line x1="1078" y1="278" x2="1368" y2="495" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1" />
      </g>

      {/* 5. 左側中景：垂直分割線條的白色建築核心量體 */}
      <polygon points="0,95 330,196 330,545 0,635" fill="#5d7a90" />
      <polygon
        points="0,95 330,196 330,545 0,635"
        fill="#c9d4de"
        fillOpacity="0.15"
        stroke="#ffffff"
        strokeOpacity="0.4"
        strokeWidth="1.25"
      />
      {Array.from({ length: 14 }, (_, i) => {
        const t = (i + 1) / 15
        const x = t * 330
        const yTop = 95 + t * (196 - 95)
        const yBot = 635 + t * (545 - 635)
        return (
          <line
            key={i}
            x1={x}
            y1={yTop}
            x2={x}
            y2={yBot}
            stroke="#ffffff"
            strokeOpacity="0.16"
            strokeWidth="1"
          />
        )
      })}

      {/* 6. 天花板透視線性金屬格柵 */}
      <g>
        {louverLines.map((l, idx) => (
          <line
            key={idx}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#ffffff"
            strokeOpacity="0.20"
            strokeWidth="1"
          />
        ))}
        {ceilingLights.map(([lx, ly], idx) => (
          <circle
            key={idx}
            cx={lx}
            cy={ly}
            r="2.6"
            fill="#d2fea1"
            fillOpacity="0.85"
          />
        ))}
      </g>

      {/* 7. 遮蔭廣場開闊混凝土地面幾何透視線 */}
      <g>
        {[-180, 120, 420, 720, 1020, 1320, 1620].map((fx, idx) => (
          <line
            key={idx}
            x1="740"
            y1="520"
            x2={fx}
            y2="820"
            stroke="#ffffff"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
        ))}
        {[565, 625, 705, 795].map((fy) => (
          <line
            key={fy}
            x1="0"
            y1={fy}
            x2="1440"
            y2={fy}
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        ))}
      </g>

      {/* 8. 前景圓柱群：先以不透明基底 (#5d7a90) 遮蔽後方電梯與背景線條，再疊上半透明白柱 */}
      {columns.map((col, idx) => (
        <g key={idx}>
          {idx >= 1 && idx <= 4 && (
            <ellipse
              cx={col.x + col.w / 2}
              cy={col.y2}
              rx={col.w * 2.1}
              ry={col.w * 0.55}
              fill="none"
              stroke="#d2fea1"
              strokeOpacity="0.45"
              strokeWidth="1.2"
            />
          )}
          <rect x={col.x} y={col.y1} width={col.w} height={col.y2 - col.y1} fill="#5d7a90" />
          <rect
            x={col.x}
            y={col.y1}
            width={col.w}
            height={col.y2 - col.y1}
            fill="#ffffff"
            fillOpacity={col.opacity}
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="1.2"
          />
        </g>
      ))}
    </svg>
  )
}

/**
 * 一頁式前兩屏舞台（扉頁 #top ＋ 首頁遮蔭廣場 #home）
 * 效能優化：
 * - 起點與終點座標僅於 mount / resize 時量測快取，不在每次 scroll 時呼叫 16 次 getBoundingClientRect()
 * - 滾動時直接透過 DOM ref 更新 7 個字塊的 style.transform，零 React 狀態重繪 (0 re-renders)
 * - 滑過 #home 之後立即略過計算，徹底消除長頁面滾動卡頓
 */
export default function Hero({ event }) {
  const stageRef = useRef(null)
  const startRefs = useRef([])
  const endRefs = useRef([])
  const floatingRefs = useRef([])
  const textLogoRef = useRef(null)
  const metricsRef = useRef(null)

  useEffect(() => {
    let rafId = null
    let lastP = -1

    // 僅在初始化與視窗縮放時量測一次幾何位置
    const measureLayout = () => {
      const stage = stageRef.current
      const homeEl = document.getElementById('home')
      if (!stage || !homeEl) return

      const stageRect = stage.getBoundingClientRect()
      const totalTravel = Math.max(1, homeEl.offsetTop)

      const items = EXPLORE_TILES.map((_, i) => {
        const sEl = startRefs.current[i]
        const eEl = endRefs.current[i]
        if (!sEl || !eEl) return null
        const sRect = sEl.getBoundingClientRect()
        const eRect = eEl.getBoundingClientRect()
        return {
          sx: sRect.left - stageRect.left,
          sy: sRect.top - stageRect.top,
          sw: sRect.width,
          sh: sRect.height,
          ex: eRect.left - stageRect.left,
          ey: eRect.top - stageRect.top,
          ew: eRect.width,
          eh: eRect.height,
        }
      })

      metricsRef.current = { totalTravel, items }
      lastP = -1
      applyScroll()
    }

    // 滾動時僅做純數值插值並直接寫入 DOM style，完全不觸發 React re-render
    const applyScroll = () => {
      const m = metricsRef.current
      if (!m) return

      const scrollY = window.scrollY || window.pageYOffset || 0
      const rawP = clamp01(scrollY / m.totalTravel)
      if (Math.abs(rawP - lastP) < 0.0005) return
      lastP = rawP

      for (let i = 0; i < EXPLORE_TILES.length; i++) {
        const el = floatingRefs.current[i]
        const box = m.items[i]
        if (!el || !box) continue

        const { delay, midRot } = FALL_META[i]
        const localP = clamp01((rawP - delay) / (1 - delay))
        const eased = easeInOutCubic(localP)

        const x = box.sx + (box.ex - box.sx) * eased
        const y = box.sy + (box.ey - box.sy) * eased
        const w = box.sw + (box.ew - box.sw) * eased
        const h = box.sh + (box.eh - box.sh) * eased
        const rot = Math.sin(localP * Math.PI) * midRot

        el.style.width = `${w.toFixed(1)}px`
        el.style.height = `${h.toFixed(1)}px`
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`
      }

      if (textLogoRef.current) {
        const textP = clamp01((rawP - 0.65) / 0.3)
        textLogoRef.current.style.opacity = textP.toFixed(3)
        textLogoRef.current.style.transform = `translate3d(0, ${((1 - textP) * 12).toFixed(1)}px, 0)`
      }
    }

    const onScroll = () => {
      const m = metricsRef.current
      // 若已滾動超過第二屏且狀態已固定為 1，完全不排程 rAF
      if (m && window.scrollY > m.totalTravel * 1.15 && lastP === 1) return
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        applyScroll()
      })
    }

    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        rafId = null
        measureLayout()
      })
    }

    measureLayout()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div ref={stageRef} className="relative overflow-x-clip">
      {/* 中間層 (z-10)：可掉落並於下個區段排成整齊一列的 7 個 EXPLORE 圖樣字塊 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
      >
        {EXPLORE_TILES.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              floatingRefs.current[i] = el
            }}
            className="absolute top-0 left-0 will-change-transform"
          >
            <ExploreTile index={i} className="h-full w-full shadow-xs" />
          </div>
        ))}
      </div>

      {/* =====================================================================
          第一屏：進站扉頁 (#top)
          - 純背景色 (#eceeef)，移除主視覺網狀與色彩圖樣
          - 保留：一週年館慶標準字置於主視覺上方、城市中的閱讀風景、EXPLORE 7 個散落字塊
          - 手機版全置中、精確緊湊間距確保進站第一屏可見「進入書展現場 ↓」
         ===================================================================== */}
      <section
        id="top"
        aria-label="扉頁"
        className="md:snap-start relative flex min-h-dvh flex-col justify-between overflow-hidden bg-[#eceeef] px-4 py-4 text-ink sm:px-12 sm:py-8"
      >
        {/* 主內容區：
            電腦版兩欄（左：EXPLORE 散落字塊；右：一週年館慶標準字置於主視覺上方）
            手機版單欄垂直（上：一週年館慶 ＋ 城市裡的閱讀風景；下：EXPLORE 散落字塊，均水平置中） */}
        <div className="relative z-20 mx-auto my-auto grid w-full max-w-[1280px] flex-1 items-center gap-4 py-2 lg:grid-cols-12 lg:gap-12 lg:py-6">
          {/* 左欄（桌機）：EXPLORE 散落字塊（電腦版維持喜愛之佈局，手機版置中） */}
          <div className="order-2 flex items-center justify-center lg:order-1 lg:col-span-6 lg:justify-start xl:col-span-6">
            {/* 7 個圖樣字的原版交疊起點定位錨框 */}
            <div
              aria-label="Explore"
              className="relative mx-auto w-full max-w-[15rem] select-none sm:max-w-[18.5rem] lg:mx-0 lg:max-w-[23rem]"
            >
              <div className="relative aspect-[4/4.85] w-full">
                {SCATTER_POS.map((pos, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      startRefs.current[i] = el
                    }}
                    style={{
                      left: `${(pos.col / 3.45) * 100}%`,
                      top: `${(pos.row / 5.05) * 100}%`,
                      width: '25.5%',
                      aspectRatio: '72.01 / 87.54',
                    }}
                    className="pointer-events-none absolute opacity-0"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 右欄（桌機）：一週年館慶標準字置於主視覺標準字上方，比例對齊附圖 */}
          <div className="order-1 flex flex-col items-center justify-center text-center lg:order-2 lg:col-span-6 lg:items-start lg:pl-6 lg:text-left xl:col-span-6">
            <div className="w-full max-w-[22rem] sm:max-w-[26rem] lg:max-w-[34rem] xl:max-w-[38rem]">
              <img
                src={wordmarkSub}
                alt="臺中綠美圖一週年館慶活動"
                className="mb-2 w-full h-auto object-contain sm:mb-3"
              />
              <img
                src={wordmarkH}
                alt="城市裡的閱讀風景 Reading in the City"
                width="2240"
                height="860"
                fetchPriority="high"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* 底部導覽：時間地點置於進入書展現場上方，置中對齊 */}
        <div className="relative z-20 mx-auto mt-auto flex w-full flex-col items-center justify-center pt-2 pb-2 text-center">
          <div className="mb-2 w-full space-y-0.5 text-center font-normal text-ink">
            <p className="w-full text-center text-[0.88rem] font-normal whitespace-nowrap sm:text-title">
              <span>12/12 ⋯ 12/13</span>
              <span className="ml-2">臺中綠美圖・遮蔭廣場</span>
            </p>
            <p
              lang="en"
              className="w-full text-center text-[0.72rem] font-normal whitespace-nowrap tracking-tight sm:text-title sm:tracking-normal"
            >
              Taichung Green Museumbrary・Shaded Plaza
            </p>
          </div>

          <a
            href="#home"
            className="inline-block text-center text-[0.92rem] font-normal text-ink underline underline-offset-8 transition-opacity hover:opacity-70 sm:text-title"
          >
            進入書展現場 ↓
          </a>
        </div>
      </section>

      {/* =====================================================================
          第二屏：首頁主畫面 (#home)
         ===================================================================== */}
      <section
        id="home"
        aria-label="Explore Art Book Fair 首頁"
        className="snap-start relative flex min-h-dvh flex-col justify-between overflow-hidden bg-slate px-6 pt-16 pb-0 text-white sm:px-12"
      >
        {/* 遮蔭廣場幾何建築空間背景 (z-0) */}
        <ShadedPlazaGeometricBg />

        {/* 頂部留白 */}
        <div aria-hidden="true" className="h-8" />

        {/* 中央舞台：EXPLORE 7 個圖樣字整齊落位 ＋ 下方非圖樣的原版英文字 Explore Art Book Fair */}
        <div className="relative z-20 mx-auto my-auto flex w-full max-w-[980px] flex-col items-center py-16">
          <div className="grid w-full grid-cols-7 gap-2.5 sm:gap-4 md:gap-5">
            {EXPLORE_TILES.map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  endRefs.current[i] = el
                }}
                style={{ aspectRatio: '72.01 / 87.54' }}
                className="pointer-events-none w-full opacity-0"
              />
            ))}
          </div>

          <div
            ref={textLogoRef}
            style={{ opacity: 0, transform: 'translate3d(0, 12px, 0)' }}
            className="mt-7 w-[66%] max-w-[540px] text-lime will-change-transform sm:mt-9"
          >
            <ExploreTextLogotype className="h-auto w-full" />
          </div>
        </div>

        {/* 底部大型三向引導（Programme / Exhibitors / Info）＋ 首頁尾巴跑馬燈 */}
        <div className="relative z-20 w-full">
          <nav
            aria-label="主要區段導覽"
            className="mx-auto grid w-full max-w-[1280px] border-t border-white/45 sm:grid-cols-3"
          >
            {[
              ['#programme', 'Programme', '活動日程'],
              ['#exhibitor', 'Exhibitors', '書展夥伴'],
              ['#info', 'Info', '活動資訊'],
            ].map(([href, en, zh]) => (
              <a
                key={href}
                href={href}
                className="group flex items-baseline justify-between gap-4 border-b border-white/45 py-7 text-display transition-colors hover:text-lime sm:not-first:pl-8 sm:not-last:border-r sm:not-last:pr-8"
              >
                <span>
                  <span className="font-explore-en font-bold not-italic">{en}</span>
                  <span className="ml-4 text-title font-normal text-white/90 group-hover:text-lime">
                    {zh}
                  </span>
                </span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-y-1">
                  ↓
                </span>
              </a>
            ))}
          </nav>

          {/* 首頁的尾巴：跑馬燈 */}
          <div className="-mx-6 mt-10 sm:-mx-12">
            <Marquee />
          </div>
        </div>
      </section>
    </div>
  )
}
