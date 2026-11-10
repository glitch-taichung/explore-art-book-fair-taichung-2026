import { useState, useRef } from 'react'
import { event } from '../../data/event'
import { schedule, speakerProfiles } from '../../data/schedule'
import Picture from '../ui/Picture'

// ============================================================================
// 地點色彩系統（依地點區分）：
// - 綠美圖遮蔭廣場・書展現場（書展、導讀、Riso）：#c9d4de (bg-ice)
// - 綠美圖遮蔭廣場・主舞台（開場、沙龍）：#009e9b (bg-teal text-white)
// - 綠美圖 B1 演講廳（論壇）：#d2fea1 (bg-lime)
// - 總館 青少年閱覽區（Silent Party）：#d2fea1 (bg-lime)
// - 總館 兒童閱覽室（木頭書工作坊）：#5d7a90 (bg-slate text-white)
// ============================================================================
const VENUES = {
  plaza: {
    key: 'plaza',
    bg: 'bg-ice text-ink',
    hex: '#c9d4de',
  },
  stage: {
    key: 'stage',
    bg: 'bg-teal text-white',
    hex: '#009e9b',
  },
  b1: {
    key: 'b1',
    bg: 'bg-lime text-ink',
    hex: '#d2fea1',
  },
  youth: {
    key: 'youth',
    bg: 'bg-lime text-ink',
    hex: '#d2fea1',
  },
  kids: {
    key: 'kids',
    bg: 'bg-slate text-white',
    hex: '#5d7a90',
  },
}

function venueKeyOf(s) {
  const v = s.venue || ''
  if (v.includes('主舞台')) return 'stage'
  if (v.includes('B1') || v.includes('演講廳')) return 'b1'
  if (v.includes('青少年')) return 'youth'
  if (v.includes('兒童')) return 'kids'
  return 'plaza'
}

// Where 選項（選取後於地圖顯示所在起點圓圈，並畫出指往遮蔭廣場邊緣的細圓點虛線動線）
const WHERE_OPTIONS = [
  {
    id: 'bus',
    label: '從公車站走進來',
    dots: [
      { cx: 550, cy: 70 }, // 1. 中科路 / 公車站
      { cx: 900, cy: 70 }, // 2. 經貿七路口
    ],
    paths: [
      // 1. 中科路 / 公車站：向下穿過大廳與兒童閱覽室之間，指到遮蔭廣場頂邊
      'M 550 70 C 550 120, 520 180, 485 228',
      // 2. 經貿七路口：大弧度繞過兒童閱覽室右側，指到遮蔭廣場右邊緣
      'M 900 70 C 970 140, 970 300, 880 390 C 820 440, 740 400, 672 315',
    ],
  },
  {
    id: 'parking',
    label: '從綠美圖停車場上樓',
    dots: [
      { cx: 250, cy: 475 }, // 圓點置於文字下方偏左，起跑完全不擋到 B1 指示箭頭
    ],
    paths: [
      // 從起點往下繞過箭頭，穿過綠美圖大廳下方缺口（紅圈廊道處），先往右走再往右上指到遮蔭廣場邊緣
      'M 250 475 C 220 505, 180 520, 170 545 C 160 575, 240 580, 290 560 C 320 545, 345 525, 358 505',
    ],
  },
  {
    id: 'transit',
    label: '國際會展／水湳轉運中心',
    dots: [
      { cx: 200, cy: 70 }, // 國際會展中心 / 水湳轉運中心
    ],
    paths: [
      // 穿過綠美圖大廳上與下兩個缺口（貫穿紅圈廊道處），指到遮蔭廣場左下邊緣
      'M 200 70 C 160 110, 120 160, 110 240 C 100 340, 110 440, 130 520 C 145 565, 230 570, 310 540 C 330 530, 345 515, 355 500',
    ],
  },
]

// When 選項（12/12–13 兩小時一組的時段，支援複選）
const WHEN_DAYS = [
  {
    date: '2026-12-12',
    label: '12/12 SAT',
    slots: [
      { id: 'd1-1', date: '2026-12-12', label: '13:00 - 15:00', start: '13:00', end: '15:00' },
      { id: 'd1-2', date: '2026-12-12', label: '15:00 - 17:00', start: '15:00', end: '17:00' },
      { id: 'd1-3', date: '2026-12-12', label: '17:00 - 19:00', start: '17:00', end: '19:00' },
      { id: 'd1-4', date: '2026-12-12', label: '19:00 - 21:00', start: '19:00', end: '21:00' },
    ],
  },
  {
    date: '2026-12-13',
    label: '12/13 SUN',
    slots: [
      { id: 'd2-1', date: '2026-12-13', label: '10:00 - 12:00', start: '10:00', end: '12:00' },
      { id: 'd2-2', date: '2026-12-13', label: '12:00 - 14:00', start: '12:00', end: '14:00' },
      { id: 'd2-3', date: '2026-12-13', label: '14:00 - 16:00', start: '14:00', end: '16:00' },
      { id: 'd2-4', date: '2026-12-13', label: '16:00 - 18:00', start: '16:00', end: '18:00' },
      { id: 'd2-5', date: '2026-12-13', label: '18:00 - 20:30', start: '18:00', end: '20:30' },
    ],
  },
]

const ALL_SLOTS = WHEN_DAYS.flatMap((d) => d.slots)

function isEventInSelectedSlots(s, selectedSlots) {
  if (!selectedSlots.length) return true
  return selectedSlots.some(
    (slot) => s.date === slot.date && s.start < slot.end && s.end > slot.start
  )
}

/**
 * 綠美圖全區配置地圖（純向量 SVG 重繪版，高度縮至 718）：
 * - 未選取（預設）：全館純線條 (#111518)，無填色（主舞台預設亦不亮）
 * - 選取 When 時：依時段活動場地填色
 *   - 青少年閱覽區 (youth)：#d2fea1
 *   - B1 演講廳&停車場 (b1)：#d2fea1
 *   - 兒童閱覽室 (kids)：#5d7a90
 *   - 遮蔭廣場 (plaza)：#c9d4de
 *   - 主舞台 (stage)：#3b8d99
 * - 選取 Where 時：細圓點虛線動線直接以箭頭指至廣場邊緣（不放廣場中央終點）
 * - 起點圓點：綠色圓點無外圈黑框，帶淡淡半透明外圈
 * - 刪除多餘網點紋理，保持純淨俐落幾何線稿
 * - 字體：思源標準黑體 (font-sans)
 */
function VenueMiniMap({ whereId, activeVenueKeys }) {
  const wherePt = WHERE_OPTIONS.find((w) => w.id === whereId) || null
  const has = (k) => activeVenueKeys.has(k)

  return (
    <div className="relative w-full overflow-hidden bg-transparent">
      <svg
        viewBox="0 0 1024 718"
        aria-label="綠美圖遮蔭廣場與周邊場館配置圖"
        className="h-auto w-full select-none"
      >
        <defs>
          {/* 指向遮蔭廣場邊緣的俐落箭頭端點 */}
          <marker
            id="routeArrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 1 2 L 8 5 L 1 8 z" fill="#111518" />
          </marker>
        </defs>

        {/* 1. 最上方道路與標線 */}
        <line x1="0" y1="70" x2="1024" y2="70" stroke="#111518" strokeWidth="2" />

        {/* 道路文字標示 */}
        <g className="font-sans fill-ink">
          {/* 左側：國際會展中心 / 水湳轉運中心 */}
          <text x="35" y="34" className="text-[15px] font-bold tracking-tight">
            ← 國際會展中心 / 水湳轉運中心
          </text>
          <text x="35" y="53" className="text-[12px] font-normal tracking-tight">
            Taichung Exhibition Center / Shuinan Transit Center
          </text>

          {/* 中間：中科路 / 公車站 */}
          <text x="575" y="34" textAnchor="middle" className="text-[15px] font-bold tracking-tight">
            中科路 / 公車站
          </text>
          <text x="575" y="53" textAnchor="middle" className="text-[12px] font-normal tracking-tight">
            Zhongke Rd. / Bus Station
          </text>

          {/* 右側：經貿七路口 */}
          <text x="860" y="34" className="text-[15px] font-bold tracking-tight">
            經貿七路口 →
          </text>
          <text x="860" y="53" className="text-[12px] font-normal tracking-tight">
            Jingmao 7th Rd. Intersection
          </text>
        </g>

        {/* 2. 左側：綠美圖大廳與周邊牆線（繪出上、下兩個通往大廳與廣場的缺口） */}
        <g stroke="#111518" strokeWidth="2" fill="none">
          {/* 大廳上方缺口：0 到 45，45 到 90 為大廳上方通口 */}
          <line x1="0" y1="170" x2="45" y2="170" />
          {/* 大廳下方缺口：0 到 25，25 到 90 為大廳下方通口 */}
          <line x1="0" y1="530" x2="25" y2="530" />
          <line x1="90" y1="530" x2="140" y2="530" />
          {/* 往下延伸之外側斜牆 */}
          <line x1="90" y1="530" x2="50" y2="718" />
          {/* B1 下方短牆 */}
          <line x1="180" y1="530" x2="260" y2="530" />
        </g>

        {/* 綠美圖大廳文字標記與底線 */}
        <g className="font-sans fill-ink">
          <text x="195" y="140" textAnchor="middle" className="text-[16px] font-bold">
            綠美圖大廳
          </text>
          <text x="195" y="158" textAnchor="middle" className="text-[13px]">
            green museumbrary lobby
          </text>
          <line x1="90" y1="175" x2="305" y2="175" stroke="#111518" strokeWidth="2" />
        </g>

        {/* 服務台圓形圖示 (i) */}
        <circle cx="52" cy="360" r="18" fill="none" stroke="#111518" strokeWidth="2" />
        <text
          x="52"
          y="366"
          textAnchor="middle"
          className="font-sans text-[18px] font-bold fill-ink"
        >
          i
        </text>

        {/* 3. 下方廁所隔間輪廓（依新版圖面位置上移） */}
        <polygon
          points="260,630 335,610 340,670 255,670"
          fill="none"
          stroke="#111518"
          strokeWidth="1.8"
        />
        {/* 下方廁所圖示：男、女、無障礙 */}
        <g stroke="#111518" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* 男生 */}
          <circle cx="272" cy="636" r="2.5" fill="#111518" />
          <path d="M 266 643 L 278 643 M 269 643 L 269 657 M 275 643 L 275 657" />
          {/* 女生 */}
          <circle cx="295" cy="636" r="2.5" fill="#111518" />
          <path d="M 290 643 L 300 643 L 302 653 L 288 653 Z M 292 653 L 292 658 M 298 653 L 298 658" />
          {/* 無障礙 */}
          <circle cx="322" cy="640" r="2" fill="#111518" />
          <path d="M 322 644 L 322 650 L 328 650 M 318 648 C 318 653 322 656 326 656" />
        </g>

        {/* P3 樓梯圖示與文字 */}
        <path
          d="M 720 625 L 733 625 L 733 637 L 746 637 L 746 649 L 759 649"
          fill="none"
          stroke="#111518"
          strokeWidth="2"
        />
        <text x="767" y="641" className="font-sans text-[15px] font-bold fill-ink">
          P3
        </text>

        {/* 中央公園文字（置於右邊空處，兒童閱覽室下方） */}
        <g className="font-sans fill-ink">
          <text x="800" y="555" textAnchor="middle" className="text-[16px] font-bold">
            中央公園
          </text>
          <text x="800" y="575" textAnchor="middle" className="text-[13px]">
            Taichung Central Park
          </text>
        </g>

        {/* 4. 遮蔭廣場 (plaza)：中央大型梯形（頂部與兒童閱覽室保持清楚間隔不重疊） */}
        <polygon
          points="445,215 675,295 615,600 340,490"
          fill={has('plaza') ? '#c9d4de' : 'none'}
          stroke="#111518"
          strokeWidth="2.5"
          className="transition-colors duration-300"
        />
        {/* 內側展位 / 主舞台色塊（預設不亮，僅選取主舞台活動時才出現顏色） */}
        <polygon
          points="377,445 425,422 457,489 410,512"
          fill={has('stage') ? '#3b8d99' : 'none'}
          stroke="#111518"
          strokeWidth="2"
          className="transition-colors duration-300"
        />

        {/* 5. 兒童閱覽室 (kids)：右上 45 度傾斜方塊（與書展廣場線條不重疊） */}
        <polygon
          points="760,85 915,240 760,395 605,240"
          fill={has('kids') ? '#5d7a90' : 'none'}
          stroke="#111518"
          strokeWidth="2.5"
          className="transition-colors duration-300"
        />

        {/* 兒童閱覽室文字 */}
        <g className="font-sans fill-ink">
          <text x="650" y="140" textAnchor="middle" className="text-[16px] font-bold">
            兒童閱覽室
          </text>
          <text x="650" y="158" textAnchor="middle" className="text-[13px]">
            children’s area
          </text>
        </g>

        {/* 兒童閱覽室旁設施：L2 電梯、廁所、飲水機 */}
        <g transform="translate(620, 205)">
          <text x="15" y="-6" textAnchor="middle" className="font-sans text-[13px] font-bold fill-ink">
            ↑ ↓
          </text>
          <rect x="0" y="-2" width="31" height="23" fill="none" stroke="#111518" strokeWidth="1.8" />
          <text x="15" y="14" textAnchor="middle" className="font-sans text-[13px] font-bold fill-ink">
            L2
          </text>
        </g>

        {/* 兒童閱覽室旁廁所圖示 */}
        <g stroke="#111518" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="678" cy="202" r="2.5" fill="#111518" />
          <path d="M 672 209 L 684 209 M 675 209 L 675 223 M 681 209 L 681 223" />
          <circle cx="700" cy="202" r="2.5" fill="#111518" />
          <path d="M 695 209 L 705 209 L 707 219 L 693 219 Z M 697 219 L 697 224 M 703 219 L 703 224" />
          <circle cx="726" cy="206" r="2" fill="#111518" />
          <path d="M 726 210 L 726 216 L 732 216 M 722 214 C 722 219 726 222 730 222" />
        </g>

        {/* 飲水機圖示 */}
        <g transform="translate(745, 150)" stroke="#111518" strokeWidth="1.8" fill="none">
          <path d="M 5 0 L 22 0 L 19 28 L 8 28 Z" />
          <path d="M 6 12 Q 13.5 16 21 12" />
        </g>

        {/* 6. 圖書館 & 青少年閱覽區 (youth)：上方綠色多邊形＋從邊緣長出的膠囊手扶梯 */}
        <polygon
          points="295,230 345,230 375,305 295,305"
          fill={has('youth') ? '#d2fea1' : 'none'}
          stroke="#111518"
          strokeWidth="2.5"
          className="transition-colors duration-300"
        />
        {/* 手扶梯：從青少區下緣邊邊長出的圓角膠囊框 */}
        <g transform="translate(345, 318) rotate(32)">
          <rect x="-18" y="-7" width="36" height="14" rx="7" fill="none" stroke="#111518" strokeWidth="2.2" />
        </g>
        {/* 青少區內指示箭頭（轉方向往右下 ↘ 指示登上電扶梯） */}
        <path d="M 324 268 L 344 288 M 334 288 L 344 288 L 344 278" fill="none" stroke="#111518" strokeWidth="2" />

        {/* 圖書館 & 青少年閱覽區文字與指示箭頭（箭頭在文字後方，絕不壓字） */}
        <g className="font-sans fill-ink">
          <text x="145" y="275" textAnchor="middle" className="text-[15px] font-bold">
            圖書館&青少年閱覽區
          </text>
          <text x="145" y="293" textAnchor="middle" className="text-[12px]">
            Library & Teen Reading Area
          </text>
          <path
            d="M 252 285 L 290 285 M 284 280 L 290 285 L 284 290"
            fill="none"
            stroke="#111518"
            strokeWidth="1.8"
          />
        </g>

        {/* 7. 綠美圖 B1 演講廳&停車場 (b1)：下方綠色長方形 */}
        <rect
          x="260"
          y="355"
          width="75"
          height="103"
          fill={has('b1') ? '#d2fea1' : 'none'}
          stroke="#111518"
          strokeWidth="2.5"
          className="transition-colors duration-300"
        />
        {/* P2 與 L1 電梯按鈕標記 */}
        <g>
          <text x="297" y="375" textAnchor="middle" className="font-sans text-[13px] font-bold fill-ink">
            ↑ ↓
          </text>
          <rect x="282" y="380" width="31" height="23" fill="none" stroke="#111518" strokeWidth="1.8" />
          <text x="297" y="396" textAnchor="middle" className="font-sans text-[13px] font-bold fill-ink">
            P2
          </text>

          <text x="297" y="420" textAnchor="middle" className="font-sans text-[13px] font-bold fill-ink">
            ↑ ↓
          </text>
          <rect x="282" y="425" width="31" height="23" fill="none" stroke="#111518" strokeWidth="1.8" />
          <text x="297" y="441" textAnchor="middle" className="font-sans text-[13px] font-bold fill-ink">
            L1
          </text>
        </g>

        {/* 綠美圖 B1 演講廳&停車場文字與指示箭頭（箭頭在文字後方，絕不壓字） */}
        <g className="font-sans fill-ink">
          <text x="145" y="435" textAnchor="middle" className="text-[15px] font-bold">
            綠美圖 B1 演講廳&停車場
          </text>
          <text x="145" y="453" textAnchor="middle" className="text-[12px]">
            B1 Auditorium&Parking
          </text>
          <path
            d="M 248 440 L 257 440 M 252 435 L 257 440 L 252 445"
            fill="none"
            stroke="#111518"
            strokeWidth="1.8"
          />
        </g>

        {/* 8. Where 選取時之細圓點虛線動線（箭頭指往廣場邊緣，無廣場中央終點） */}
        {wherePt && (
          <g className="transition-all duration-300">
            {/* 前往遮蔭廣場邊緣之細圓點虛線 */}
            {wherePt.paths.map((p, pIdx) => (
              <path
                key={pIdx}
                d={p}
                fill="none"
                stroke="#111518"
                strokeWidth="2"
                strokeDasharray="3 4"
                strokeLinecap="round"
                markerEnd="url(#routeArrow)"
              />
            ))}

            {/* 起點圓圈標記：無黑色外框，帶淡淡半透明外圈 */}
            {wherePt.dots.map((d, dIdx) => (
              <g key={dIdx}>
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r="12"
                  fill="#009e9b"
                  fillOpacity="0.25"
                  stroke="none"
                />
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r="6"
                  fill="#009e9b"
                  stroke="none"
                />
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const EN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const fmtDate = (d) => {
  const dt = new Date(`${d}T00:00:00+08:00`)
  return `${d.slice(5).replace('-', '/')}（${WEEK[dt.getDay()]}）`
}
const fmtDateBeyond = (d) => {
  const dt = new Date(`${d}T00:00:00+08:00`)
  return `${d.slice(5).replace('-', '/')} ${EN_WEEK[dt.getDay()]}`
}
const profileOf = (name) => {
  const key = name.split(' ')[0]
  return speakerProfiles.find((p) => p.name.includes(key))
}

function Row({ s, showDate, isBeyond = false, isMatched = true, onSelectProgram }) {
  const [open, setOpen] = useState(false)
  const rowRef = useRef(null)
  const vKey = venueKeyOf(s)
  const venueStyle = VENUES[vKey]
  const speakers = [...(s.speakers || []), ...(s.hosts || [])]
  const forumPeople = s.id === 'forum' && s.moderator
    ? [...speakers, { ...s.moderator, isModerator: true }]
    : speakers
  const main = s.series || s.title
  const sub = s.id === 'salon-6'
    ? '陳敬元、陳念瑩、張玉音、羅智信'
    : s.series ? s.title : speakers.slice(0, 3).map((p) => p.name).join('、')
  const toggle = () => {
    if (isBeyond) return // 延伸活動先不讓人展開，有要加資料之後加
    if (open && rowRef.current) {
      const topOffset = 80 // 預留頂部導航列高度，避免遮擋
      const targetY = window.pageYOffset + rowRef.current.getBoundingClientRect().top - topOffset
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }
    setOpen((o) => !o)
  }

  const leftBgClass = isBeyond
    ? 'bg-white text-ink'
    : isMatched
      ? venueStyle.bg
      : 'bg-cool-light text-ink/45'

  // 代表圖路徑分配
  const getRepresentativeCover = (item) => {
    if (item.id.startsWith('fair')) return 'programs/fair-d1/cover'
    if (item.id.startsWith('tour')) return 'programs/tour-1/cover'
    if (item.id.startsWith('woodbook')) return 'programs/woodbook-1/cover'
    if (item.id.startsWith('riso')) return 'programs/riso-1/workshop3'
    if (item.id === 'forum') return 'programs/forum/hero'
    if (item.id === 'salon-1') return 'programs/salon-1/speaker'
    if (item.id === 'salon-2') return 'programs/salon-2/speaker'
    if (item.id === 'salon-3') return 'programs/salon-3/space'
    if (item.id === 'salon-4') return 'programs/salon-4/space'
    if (item.id === 'salon-5') return 'exhibitors/glitch/logo'
    if (item.id === 'salon-6') return 'exhibitors/nodate/logo'
    if (item.id === 'silent-party') return 'programs/silent-party/speaker'
    if (item.id === 'opening') return 'programs/opening/cover'
    return `programs/${item.id}/cover`
  }

  // 判斷是否顯示右欄（開場、書展、葉忠宜、方序中、本冊圖書館、四空間對談不放右欄，其餘放右欄）
  const showRightColumn = !(
    s.id === 'opening' ||
    s.id.startsWith('fair') ||
    s.id === 'salon-1' ||
    s.id === 'salon-2' ||
    s.id === 'salon-4' ||
    s.id === 'salon-5'
  )

  const getSpeakerImgPath = (spName, idx) => {
    if (s.id === 'forum') {
      if (spName.includes('黃羿瑄')) return 'programs/forum/moderator'
      return idx === 0
        ? 'programs/forum/speaker-1'
        : idx === 1
          ? 'programs/forum/speaker-2'
          : idx === 2
            ? 'programs/forum/speaker-3'
            : 'programs/forum/moderator'
    }
    if (s.id === 'salon-3') return 'programs/salon-3/speaker'
    if (s.id === 'salon-4') return 'programs/salon-4/space'
    if (s.id === 'salon-6') return 'exhibitors/nodate/logo'
    if (spName.includes('meadowroom') || spName.includes('草地房')) return 'exhibitors/meadowroom/logo'
    if (s.id === 'tour-1' || s.id === 'tour-2') return 'programs/tour-1/LSZ_1935'
    if (s.id === 'woodbook-1' || s.id === 'woodbook-2') return 'programs/woodbook-1/speaker'
    if (s.id === 'silent-party') return 'speakers/賓哥'
    if (s.id === 'opening') return 'programs/opening/cover'
    return `programs/${s.id}/speaker`
  }

  return (
    <li ref={rowRef} className="border-b border-ink/12 last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle())}
        className="grid cursor-pointer md:grid-cols-[13.5rem_1fr]"
      >
        <div
          className={`relative -mx-6 flex items-center justify-between px-10 py-2.5 transition-colors duration-200 md:mx-0 md:flex-col md:items-start md:justify-center md:px-5 md:py-4 ${leftBgClass}`}
        >
          {isBeyond ? (
            <div className="space-y-0.5 text-left">
              <p className="font-latin text-body font-bold leading-none md:leading-normal md:text-title text-ink">
                {fmtDateBeyond(s.date)}
              </p>
              <p className="font-latin text-body font-bold leading-none md:leading-normal md:text-title text-ink">
                {s.start} - {s.end}
              </p>
              <p className="text-cap leading-none md:leading-normal text-ink/75 md:mt-1">
                {s.venue}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-x-2.5 md:block">
                <p className="text-body font-bold leading-none md:leading-normal md:text-title">
                  {showDate && `${fmtDate(s.date)} `}
                  {s.start} - {s.end}
                </p>
                <p className="text-cap leading-none md:leading-normal md:mt-0.5">{s.venue}</p>
              </div>
              {s.registration === 'required' && (
                s.registerUrl ? (
                  <a
                    href={s.registerUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-cap font-bold underline underline-offset-4 hover:opacity-75 md:mt-1.5"
                  >
                    報名連結 ↗
                  </a>
                ) : (
                  <span className="shrink-0 text-cap text-ink/75 md:mt-1.5">
                    報名連結 ↗
                  </span>
                )
              )}
            </>
          )}
        </div>

        <div
          className={`flex items-center justify-between gap-3 bg-transparent px-4 py-4 transition-opacity duration-200 md:gap-4 md:bg-white md:px-6 md:py-5 ${
            !isBeyond && !isMatched ? 'opacity-55' : 'opacity-100'
          }`}
        >
          <div className="min-w-0 pr-2 my-auto">
            <p className="text-title font-bold text-ink">
              {main}
            </p>
            {sub && <p className="mt-1 text-body text-ink/75">{sub}</p>}
          </div>

          {isBeyond ? (
            s.registerUrl ? (
              <a
                href={s.registerUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 self-center text-cap font-bold text-ink underline underline-offset-4 hover:opacity-75"
              >
                報名連結 ↗
              </a>
            ) : (
              <span className="shrink-0 self-center text-cap text-ink/75">
                報名連結 ↗
              </span>
            )
          ) : (
            <span className="shrink-0 self-center text-cap font-bold text-ink underline underline-offset-4">
              {open ? 'Less －' : 'More ＋'}
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="bg-cool-light md:bg-white">
          <div className="grid md:grid-cols-[13.5rem_1fr]">
            {/* 左欄色塊延伸：留著但不放東西，無頂部分隔線 */}
            <div className={`hidden md:block ${leftBgClass}`} />

            {/* 中欄 ＋ 右欄 */}
            <div className={`grid gap-6 px-4 py-5 md:px-6 md:py-6 ${showRightColumn ? 'lg:grid-cols-[1fr_13rem]' : 'grid-cols-1'}`}>
              {/* 中間欄位：依附圖 5 排版 */}
              <div className="space-y-4">
                {s.id === 'salon-6' && (
                  <p className="text-body font-bold text-ink text-left">
                    野点沙龍：紙本派，集合！
                  </p>
                )}

                {s.titleEn && (
                  <p lang="en" className="w-fit text-left text-body font-normal text-ink/75">
                    {s.titleEn}
                  </p>
                )}

                <p className="text-body leading-relaxed text-ink text-justify">
                  {s.blurb || '節目介紹整理中。'}
                </p>

                {/* 四空間對談：四個空間直接往下排，不要右欄 */}
                {s.id === 'salon-5' ? (
                  <div className="pt-2 space-y-6">
                    {[
                      { name: '節點 Zit-Dim Art Space', origin: 'Tainan', logo: 'exhibitors/zitdim/logo' },
                      { name: '鯉魚藝廊 Carp Gallery', origin: 'Taichung', logo: 'exhibitors/carp/logo' },
                      { name: '窯座 YÁO', origin: 'Taichung', logo: 'exhibitors/yao/logo' },
                      { name: '毛刺 Glitch', origin: 'Taichung', logo: 'exhibitors/glitch/logo' },
                    ].map((space) => (
                      <div key={space.name} className="space-y-2 text-left">
                        <p className="font-bold text-ink text-body">
                          {space.name}｜{space.origin}
                        </p>
                        <div className="w-32 h-32">
                          <Picture
                            path={space.logo}
                            label={space.name}
                            ratio="1 / 1"
                            fit="contain"
                            align="left"
                            className="w-full h-full bg-transparent object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : s.id === 'silent-party' ? (
                  /* Silent Party 嵌入 Instagram Reel（完整顯示） */
                  <div className="pt-2 w-full max-w-[420px] mr-auto text-left">
                    <div className="relative w-full h-[540px] sm:h-[580px] overflow-hidden bg-black/5">
                      <iframe
                        src="https://www.instagram.com/p/DClreeSP7fg/embed/"
                        title={s.title}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        scrolling="no"
                        className="h-full w-full border-0"
                      />
                    </div>
                  </div>
                ) : (
                  /* 代表圖 3:2（置於中間欄位介紹文字下方；嚴格靠左對齊） */
                  <div className="pt-2 max-w-[480px] mr-auto text-left">
                    <Picture
                      path={getRepresentativeCover(s)}
                      label="節目主圖 3:2"
                      ratio="3 / 2"
                      fit="contain"
                      align="left"
                      className="w-full bg-transparent object-contain"
                    />
                  </div>
                )}

                {/* 報名說明：中文 ＋ 英文 */}
                <div className="pt-2 text-cap text-ink/80 text-left space-y-0.5">
                  {s.registration === 'required' ? (
                    <>
                      <p className="text-cap text-ink/65 font-normal">免費報名參與，請點選下方報名連結</p>
                      <p lang="en" className="text-cap text-ink/60 font-normal">
                        Free admission upon registration. Click the link below to sign up.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-cap text-ink/65 font-normal">免報名，現場自由參與</p>
                      <p lang="en" className="text-cap text-ink/60 font-normal">
                        Free admission, walk-ins welcome.
                      </p>
                    </>
                  )}
                </div>

                {/* 動作連結列：報名連結 ＋ 活動詳細（開場無活動詳細） */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-cap">
                  {s.registration === 'required' && (
                    <a
                      href={s.registerUrl || 'https://www.accupass.com/'}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold underline underline-offset-4 text-ink hover:opacity-70"
                    >
                      報名連結 ↗
                    </a>
                  )}

                  {!s.id.startsWith('fair') && s.id !== 'opening' && (
                    <button
                      type="button"
                      onClick={() => onSelectProgram?.(s.id)}
                      className="cursor-pointer font-bold text-ink hover:opacity-70 text-left"
                    >
                      <span className="underline underline-offset-4">活動詳細 →</span>
                    </button>
                  )}
                </div>

                {/* 講者/單位往下排（開場、四空間、葉忠宜、方序中不在此重複渲染） */}
                {!showRightColumn &&
                  s.id !== 'salon-1' &&
                  s.id !== 'salon-2' &&
                  s.id !== 'salon-5' &&
                  s.id !== 'opening' &&
                  speakers.length > 0 && (
                  <div className="space-y-4 border-t border-ink/10 pt-4">
                    {speakers.map((sp) => (
                      <div key={sp.name} className="flex items-center gap-3">
                        <Picture
                          path={`programs/${s.id}/speaker`}
                          label={sp.name.slice(0, 3)}
                          ratio="1 / 1"
                          fit="contain"
                          align="left"
                          className="h-12 w-12 shrink-0 object-contain"
                        />
                        <div className="text-left text-cap">
                          <p className="font-bold text-ink">{sp.name}</p>
                          {sp.org && <p className="text-ink/60">{sp.org}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 右欄（對齊需求：照片統一放大一倍至 128px，順序為 姓名 ➔ 單位 ➔ 照片 ➔ Logo照） */}
              {showRightColumn && (
                <div className="space-y-6 border-t border-ink/10 pt-4 text-cap lg:border-t-0 lg:border-l lg:border-ink/10 lg:pt-0 lg:pl-6">
                  {s.id === 'salon-3' ? (
                    /* 曾哲偉（品度）：姓名 ➔ 單位 ➔ 曾哲偉照片 ➔ PRNDL Logo照 */
                    <div className="space-y-2 text-left">
                      <p className="font-bold text-ink">曾哲偉</p>
                      <p className="text-cap text-ink/75">品度藝術 PRNDL.art</p>
                      <div className="flex flex-col gap-3">
                        <Picture
                          path="programs/salon-3/speaker"
                          label="曾哲偉"
                          ratio="1 / 1"
                          fit="contain"
                          align="left"
                          className="w-32 h-32 shrink-0 object-contain"
                        />
                        <Picture
                          path="programs/salon-3/logo"
                          label="PRNDL.art"
                          ratio="1 / 1"
                          fit="contain"
                          align="left"
                          className="w-32 h-32 shrink-0 object-contain"
                        />
                      </div>
                    </div>
                  ) : s.id === 'salon-6' ? (
                    /* 野点：排出四個講者/主持（陳敬元、陳念瑩、張玉音、羅智信），層級同節點為 text-body font-bold */
                    <div className="space-y-6 text-left">
                      {[
                        { name: '陳敬元 Chen Ching-Yuan', role: '講者', path: 'programs/salon-6/陳敬元' },
                        { name: '陳念瑩 Chen Nien-Ying', role: '講者', path: 'programs/salon-6/陳念瑩' },
                        { name: '張玉音 Chang Yu-Yin', role: '主持', path: 'programs/salon-6/張玉音' },
                        { name: '羅智信 Lo Chih-Hsin', role: '主持', path: 'programs/salon-6/羅智信' },
                      ].map((person) => (
                        <div key={person.name} className="space-y-2 text-left">
                          <p className="font-bold text-ink text-body">
                            {person.name}
                            <span className="ml-1 text-ink/60 font-normal">（{person.role}）</span>
                          </p>
                          <Picture
                            path={person.path}
                            label={person.name}
                            ratio="1 / 1"
                            fit="contain"
                            align="left"
                            className="w-32 h-32 shrink-0 object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* 論壇及其他活動講者名單：嚴格遵循 姓名 ➔ 單位 ➔ 照片 順序，且照片放大一倍 (w-32 h-32) */
                    forumPeople.map((sp, idx) => (
                      <div key={sp.name} className="space-y-2 text-left">
                        <p className="font-bold text-ink">
                          {sp.name}
                          {sp.isModerator && <span className="ml-1 text-ink/60 font-normal">（主持）</span>}
                        </p>
                        {sp.org && <p className="text-cap text-ink/75 text-left">{sp.org}</p>}
                        <Picture
                          path={getSpeakerImgPath(sp.name, idx)}
                          label={sp.name.slice(0, 3)}
                          ratio="1 / 1"
                          fit="contain"
                          align="left"
                          className="w-32 h-32 shrink-0 object-contain"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 手機版底部收合按鈕：置左 */}
            <div className="flex justify-start px-4 pb-4 pt-2 md:hidden">
              <button
                type="button"
                onClick={toggle}
                className="cursor-pointer text-cap font-bold text-ink underline underline-offset-4"
              >
                Less －
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

export default function Programme({ onSelectProgram }) {
  const [beyondOpen, setBeyondOpen] = useState(false)
  const [whereId, setWhereId] = useState(null)
  const [selectedWhenIds, setSelectedWhenIds] = useState([])

  const fair = schedule.filter((s) => s.scope === 'fair')
  const beyond = schedule.filter((s) => s.scope === 'beyond')
  const sort = (a, b) => (a.date + a.start).localeCompare(b.date + b.start)

  const selectedSlots = ALL_SLOTS.filter((s) => selectedWhenIds.includes(s.id))

  // 當有選取 when 時段（支援複選）時，計算下方列表篩選出的活動涵蓋哪些地點，點亮地圖對應區塊
  const activeVenueKeys = new Set(
    selectedSlots.length
      ? fair
          .filter((s) => isEventInSelectedSlots(s, selectedSlots))
          .map((s) => venueKeyOf(s))
      : []
  )

  const toggleWhere = (id) => {
    setWhereId((prev) => (prev === id ? null : id))
  }

  const toggleWhen = (slotId) => {
    setSelectedWhenIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    )
  }

  return (
    <section
      id="programme"
      aria-label="活動日程"
      className="scroll-mt-12 min-h-dvh bg-cool-light px-6 py-24 sm:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2 className="mb-10 text-display font-bold lg:mb-14">
          <span className="font-explore-en font-bold not-italic">Programme</span>　活動日程
        </h2>

        {/* 兩日書展主區塊：左欄為小地圖＋Where/When 選擇器（手機版自然流暢排列無滾動頓挫；電腦版隨滾動吸附左側） */}
        <div className="grid items-start gap-8 lg:grid-cols-[20.5rem_1fr] lg:gap-12 xl:grid-cols-[22.5rem_1fr]">
          {/* 小地圖 ＋ Where / When 篩選面板（手機版自然流暢排列隨滾動滑移，不浮動遮擋；電腦版隨滾動吸附左側） */}
          <aside
            aria-label="位置與時段篩選"
            className="relative z-20 mb-8 border-b border-ink/15 pb-6 lg:sticky lg:top-20 lg:mb-0 lg:border-b-0 lg:pb-0"
          >
            {/* 手機版配置：地圖寬度佔滿，下方單列橫向滑動從 Where 到選項到 When 到選項 */}
            <div className="block lg:hidden">
              {/* 1. 地圖寬度佔滿 */}
              <div className="mb-2.5 w-full">
                <VenueMiniMap whereId={whereId} activeVenueKeys={activeVenueKeys} />
              </div>

              {/* 2. 下面一長列可以往右滑看到從 where 到選項到 when 到選項 */}
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1 text-cap">
                <span className="shrink-0 text-[0.78rem] font-bold text-ink">
                  Where <span className="font-normal text-ink/70">你到哪了？</span>
                </span>
                {WHERE_OPTIONS.map((w) => {
                  const active = whereId === w.id
                  return (
                    <button
                      key={w.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleWhere(w.id)}
                      className={`shrink-0 cursor-pointer border px-2.5 py-0.5 text-left whitespace-nowrap transition-colors ${
                        active
                          ? 'border-ink bg-peri font-bold text-white'
                          : 'border-ink/35 bg-transparent text-ink hover:border-ink'
                      }`}
                    >
                      {w.label}
                    </button>
                  )
                })}

                <span className="mx-1 h-4 w-px shrink-0 bg-ink/25" />

                <span className="shrink-0 text-[0.78rem] font-bold text-ink">
                  When <span className="font-normal text-ink/70">你幾點到？</span>
                </span>

                {WHEN_DAYS.map((day) => (
                  <div key={day.date} className="flex items-center gap-1.5 shrink-0">
                    <span className="font-latin text-[0.72rem] font-bold tracking-wider text-ink/65 shrink-0">
                      {day.label}
                    </span>
                    {day.slots.map((slot) => {
                      const active = selectedWhenIds.includes(slot.id)
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleWhen(slot.id)}
                          className={`shrink-0 font-latin cursor-pointer border px-2 py-0.5 text-[0.78rem] whitespace-nowrap transition-colors ${
                            active
                              ? 'border-ink bg-ink font-bold text-white'
                              : 'border-ink/35 bg-transparent text-ink hover:border-ink'
                          }`}
                        >
                          {slot.label}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* 電腦版配置：經典左欄垂直排列 */}
            <div className="hidden lg:block space-y-6">
              <div className="mx-auto w-full max-w-[17.5rem]">
                <VenueMiniMap whereId={whereId} activeVenueKeys={activeVenueKeys} />
              </div>

              <div className="space-y-5 text-cap">
                {/* 1. Where：你到哪了？ */}
                <div>
                  <p className="mb-1.5 text-cap font-bold text-ink">
                    Where　<span className="font-normal text-ink/70">你到哪了？</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {WHERE_OPTIONS.map((w) => {
                      const active = whereId === w.id
                      return (
                        <button
                          key={w.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleWhere(w.id)}
                          className={`cursor-pointer border px-2.5 py-1 text-left whitespace-nowrap transition-colors ${
                            active
                              ? 'border-ink bg-peri font-bold text-white'
                              : 'border-ink/35 bg-transparent text-ink hover:border-ink'
                          }`}
                        >
                          {w.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. When：你幾點到？（可複選） */}
                <div>
                  <p className="mb-1.5 text-cap font-bold text-ink">
                    When　<span className="font-normal text-ink/70">你幾點到？</span>
                  </p>
                  <div className="space-y-2">
                    {WHEN_DAYS.map((day) => (
                      <div key={day.date} className="space-y-1">
                        <p className="font-latin text-[0.75rem] font-bold tracking-wider text-ink/65">
                          {day.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {day.slots.map((slot) => {
                            const active = selectedWhenIds.includes(slot.id)
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => toggleWhen(slot.id)}
                                className={`font-latin cursor-pointer border px-2 py-0.5 text-[0.8rem] whitespace-nowrap transition-colors ${
                                  active
                                    ? 'border-ink bg-ink font-bold text-white'
                                    : 'border-ink/35 bg-transparent text-ink hover:border-ink'
                                }`}
                              >
                                {slot.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* 右側：兩日書展活動列表 */}
          <div>
            {event.days.map((d) => (
              <div key={d.day} className="mb-20 last:mb-12">
                <h3 className="mb-5 flex flex-wrap items-baseline gap-x-6 text-display font-bold px-4 sm:px-0">
                  {d.label.replace('.', '/')} {d.weekday}
                </h3>
                <ul className="border-t border-ink/15">
                  {fair
                    .filter((s) => s.date === d.date)
                    .sort(sort)
                    .map((s) => (
                      <Row
                        key={s.id}
                        s={s}
                        isMatched={isEventInSelectedSlots(s, selectedSlots)}
                        onSelectProgram={onSelectProgram}
                      />
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 延伸活動：Zine 外一天才有空？ 安靜共讀 ⋯ 親子手工書工作坊 */}
        <div className="mt-8 border-t border-ink/25">
          <button
            type="button"
            aria-expanded={beyondOpen}
            onClick={() => setBeyondOpen(!beyondOpen)}
            className="flex w-full cursor-pointer items-baseline justify-between gap-6 py-7 text-left"
          >
            <div>
              <h3 className="text-display font-bold text-ink">
                Zine 外一天才有空？
              </h3>
              <p className="mt-1 text-body font-normal text-ink/75">
                安靜共讀 ⋯ 親子手工書工作坊
              </p>
            </div>
            <span className="text-cap font-bold underline underline-offset-4">
              {beyondOpen ? 'Less －' : 'More ＋'}
            </span>
          </button>
          {beyondOpen && (
            <ul className="border-t border-ink/15 pb-4">
              {[...beyond].sort(sort).map((s) => (
                <Row key={s.id} s={s} showDate isBeyond onSelectProgram={onSelectProgram} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
