import { useEffect, useRef, useState } from 'react'
import { exhibitorList } from '../../data/exhibitors'
import { img } from '../../lib/images'
import Picture from './Picture'
import SpotBoothSvg from './SpotBoothSvg'
import FoodStallEditorial from './FoodStallEditorial'

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * 拆解攤商名稱為「視覺詞塊」：
 * 1. 支援所有拉丁字元（包含帶變音符號的 YÁO 等，絕不漏字）
 * 2. 一個英文單字／常見英文單位不拆開
 * 3. 完整清理（SAT.）/（SUN.) 等日期標記（包含全形半形括號混用）
 * 4. ✕ 為合出標記（內頁呈現萊姆綠 #d2fea1 帶細黑線）
 */
/**
 * 取得特定攤商在段落中自然出現的品牌詞對應
 * title: 在攤商名稱中出現的字詞
 * intro: 在簡介段落中實際出現的字詞
 */
function getVendorDropMappings(vendor) {
  const specificRules = {
    glitch: [{ title: '毛刺 Glitch', intro: '毛刺 Glitch' }],
    dmp: [{ title: 'dmp editions', intro: 'dmp editions' }],
    meadowroom: [
      { title: '草地房', intro: '草地房' },
      { title: 'meadowroom', intro: 'meadowroom' },
    ],
    pebbling: [
      { title: '激浪特攻本部', intro: '激浪特攻本部' },
      { title: 'pebbling', intro: 'Pebbling' },
    ],
    wandertail: [
      { title: '三更', intro: '三更' },
      { title: '小尾巴', intro: '小尾巴' },
    ],
    onegu: [{ title: '頑固', intro: '頑固' }],
    jammmm: [{ title: 'jammm', intro: 'jammm' }],
    narcos: [{ title: 'Narcos', intro: 'NARCOS' }],
    artqpie: [
      { title: '本冊圖書館', intro: '本冊圖書館' },
      { title: 'Artqpie Library', intro: 'Artqpie Library' },
    ],
    childreneyes: [
      { title: '慢工文化', intro: '慢工文化' },
      { title: 'children eyes', intro: 'children eyes' },
    ],
    spec: [{ title: 'SPEC MAGAZINE', intro: 'SPEC MAGAZINE' }],
    yao: [
      { title: '窯座', intro: '窯座' },
      { title: 'YÁO', intro: 'YÁO' },
    ],
    carp: [{ title: '鯉魚藝廊', intro: '鯉魚藝廊' }],
    springbao: [{ title: '白水', intro: '白水' }],
    nowhere: [{ title: '飛地', intro: '飛地' }],
    nodate: [
      { title: '野点', intro: '野点' },
      { title: 'nodate', intro: 'nodate' },
    ],
    jerrys: [{ title: '學學齋', intro: '學學齋' }],
    storage: [{ title: 'Seoul Publishers Table', intro: 'Seoul Publishers Table' }],
    booksociety: [
      { title: 'The Book Society', intro: 'The Book Society' },
      { title: 'Mediabus', intro: 'Mediabus' },
    ],
    aaa: [{ title: '亞洲藝術文獻庫', intro: '亞洲藝術文獻庫' }],
    prndl: [{ title: 'PRNDL.art', intro: 'PRNDL.art' }],
    thingbooks: [
      { title: 'Thing Books', intro: 'Thing Books' },
      { title: 'Singapore Art Book Fair', intro: 'Singapore Art Book Fair' },
    ],
    thumbbooks: [{ title: 'Thumb Books', intro: 'Thumb Books' }],
    papaya: [{ title: '遊牧木瓜出版', intro: '遊牧木瓜出版' }],
    ssspace: [{ title: 'ss space space', intro: 'ss space space' }],
    zitdim: [{ title: '節點', intro: '節點' }],
    weightbooks: [
      { title: '重本書店', intro: '重本書店' },
      { title: 'Weight Books', intro: 'Weight Books' },
    ],
  }

  if (specificRules[vendor.id]) {
    return specificRules[vendor.id]
  }

  const clean = vendor.name.split(/[✕/｜]/)[0].trim()
  return [{ title: clean, intro: clean }]
}

const NO_SELECTED_VENDOR_IDS = new Set(['library', 'jilongli'])

function prepareVendorDrawerData(vendor) {
  if (!vendor) {
    return { titleLines: [], introParagraph: { text: '', segments: [] }, totalFlyingChars: 0 }
  }

  const rawName = vendor.name.replace(/[（(]\s*(?:SAT|SUN)\.?\s*[）)]/gi, '').trim()

  // 1. 標題行拆解
  let rawLines = []
  if (vendor.id === 'glitch') {
    rawLines = ['毛刺 Glitch']
  } else if (vendor.id === 'dmp') {
    rawLines = ['dmp editions']
  } else if (vendor.id === 'childreneyes' || rawName.includes('慢工文化')) {
    rawLines = ['不標準圖書 children eyes', '✕ 慢工文化 slowork publishing']
  } else if (vendor.id === 'thingbooks') {
    rawLines = ['Thing Books', 'Singapore Art Book Fair']
  } else if (rawName.includes('✕')) {
    const parts = rawName.split('✕')
    rawLines = [parts[0].trim(), `✕ ${parts.slice(1).join('✕').trim()}`]
  } else if (rawName.includes('/')) {
    rawLines = rawName.split('/').map((s) => s.trim()).filter(Boolean)
  } else if (rawName.includes('｜')) {
    rawLines = rawName.split('｜').map((s) => s.trim()).filter(Boolean)
  } else {
    const matchZhEn = rawName.match(/^([\u4e00-\u9fa5]+)\s+([A-Za-z0-9À-ÿ.&’'()\-\s]+)$/)
    if (matchZhEn) {
      rawLines = [matchZhEn[1], matchZhEn[2]]
    } else {
      rawLines = [rawName]
    }
  }

  const isDeletedSectionVendor = NO_SELECTED_VENDOR_IDS.has(vendor.id)

  let mappings = getVendorDropMappings(vendor)
  let text =
    vendor.introZh ||
    vendor.introEn ||
    `${vendor.name} 參與本次 Explore Art Book Fair，帶來獨立出版與精選作品。`

  // 刪除第三區段之攤商：文字直接取代第二區段，品牌標題字掉入此句開頭
  if (isDeletedSectionVendor) {
    const brandName = rawLines[0] || vendor.name.split(/[✕/｜]/)[0].trim()
    text = `${brandName} 參與臺中首度舉辦的國際藝術書展 Explore Art Book Fair，絕美品項即將上架＞＞＞Zine 人期待 (ﾉ◕ヮ◕)ﾉ*:･ﾟ`
    mappings = [{ title: brandName, intro: brandName }]
  }

  // 2. 比對 mappings 在 text 與 rawLines 中的出現
  const activePairs = []
  mappings.forEach((m) => {
    const hasTitle = rawLines.some((l) => l.toLowerCase().includes(m.title.toLowerCase()))
    const introIdx = text.toLowerCase().indexOf(m.intro.toLowerCase())
    if (hasTitle && introIdx !== -1) {
      const actualIntroWord = text.slice(introIdx, introIdx + m.intro.length)
      activePairs.push({
        titleWord: m.title,
        introWord: actualIntroWord,
        introStart: introIdx,
        introEnd: introIdx + actualIntroWord.length,
      })
    }
  })

  activePairs.sort((a, b) => a.introStart - b.introStart)

  const filteredPairs = []
  let lastEnd = 0
  for (const pair of activePairs) {
    if (pair.introStart >= lastEnd) {
      filteredPairs.push(pair)
      lastEnd = pair.introEnd
    }
  }

  // 3. 段落切分 segments 並給予各字 globalIndex
  let globalCharCounter = 0
  const pairGlobalIndices = new Map()

  const segments = []
  lastEnd = 0
  for (const pair of filteredPairs) {
    if (pair.introStart > lastEnd) {
      segments.push({
        text: text.slice(lastEnd, pair.introStart),
        isTarget: false,
      })
    }
    const chars = pair.introWord.split('').map((ch) => {
      const idx = globalCharCounter++
      return { char: ch, globalIndex: idx }
    })
    pairGlobalIndices.set(pair, chars.map((c) => c.globalIndex))
    segments.push({
      text: pair.introWord,
      isTarget: true,
      chars,
    })
    lastEnd = pair.introEnd
  }
  if (lastEnd < text.length) {
    segments.push({
      text: text.slice(lastEnd),
      isTarget: false,
    })
  }

  // 4. 為 title lines 分派對應的 globalIndex（與 paragraph 的對應字詞完全同序同數）
  const titleAssignedPairs = new Set()
  const titleLines = rawLines.map((line, lIdx) => {
    const isCrossLine = line.startsWith('✕')
    let lineText = line
    let crossPrefix = false
    if (isCrossLine) {
      crossPrefix = true
      lineText = line.replace(/^✕\s*/, '')
    }

    const lineMatches = []
    for (const pair of filteredPairs) {
      if (!titleAssignedPairs.has(pair)) {
        const lowerLine = lineText.toLowerCase()
        const sIdx = lowerLine.indexOf(pair.titleWord.toLowerCase())
        if (sIdx !== -1) {
          lineMatches.push({ pair, sIdx, len: pair.titleWord.length })
          titleAssignedPairs.add(pair)
        }
      }
    }

    const chars = []
    for (let cIdx = 0; cIdx < lineText.length; cIdx++) {
      const ch = lineText[cIdx]
      let flyingIndex = -1
      for (const lm of lineMatches) {
        if (cIdx >= lm.sIdx && cIdx < lm.sIdx + lm.len) {
          const relIdx = cIdx - lm.sIdx
          const indices = pairGlobalIndices.get(lm.pair)
          if (indices && relIdx < indices.length) {
            flyingIndex = indices[relIdx]
          }
          break
        }
      }
      chars.push({ char: ch, flyingIndex })
    }

    return {
      lineIndex: lIdx,
      crossPrefix,
      chars,
    }
  })

  return {
    titleLines,
    introParagraph: {
      text,
      segments,
    },
    totalFlyingChars: globalCharCounter,
  }
}

function parseAuthorPublisher(it, vendorName) {
  if (it.author || it.publisher) {
    return {
      author: it.author || '',
      publisher: it.publisher || '',
    }
  }
  if (!it.by) {
    return { author: '', publisher: '' }
  }
  const cleanedBy = String(it.by).replace(/[\u2028\u2029\n]+/g, ' ').trim()
  const parts = cleanedBy.split(/\s*[/／]\s*/).filter(Boolean)
  if (parts.length >= 2) {
    return {
      author: parts[0],
      publisher: parts.slice(1).join(' / '),
    }
  }
  return {
    author: parts[0] || '',
    publisher: vendorName.replace(/（.*?）|\(.*?\)/g, '').trim(),
  }
}

/**
 * 手機版選書簡介摺疊收合元件（僅對如遊牧木瓜等極長文本提供收合）
 */
function MobileCollapsibleBio({ bio }) {
  const [expanded, setExpanded] = useState(false)
  if (!bio) return null
  const isExtremelyLong = bio.length > 320
  if (!isExtremelyLong) {
    return (
      <p className="whitespace-pre-line font-sans text-body leading-relaxed text-ink/90 text-justify">
        {bio}
      </p>
    )
  }

  const displayText = expanded ? bio : `${bio.slice(0, 240)}...`

  return (
    <div className="font-sans text-body leading-relaxed text-ink/90">
      <p className="whitespace-pre-line text-justify">{displayText}</p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-3 block cursor-pointer text-left font-bold text-cap text-ink underline underline-offset-4 hover:opacity-75"
      >
        {expanded ? 'Less －' : 'More ＋'}
      </button>
    </div>
  )
}

export default function VendorDrawer({ vendor, onClose, onSelectVendor }) {
  const scrollRef = useRef(null)
  const closeRef = useRef(null)
  const introSecRef = useRef(null)
  const selectedSecRef = useRef(null)
  const desktopStageRef = useRef(null)
  const logoLayerRef = useRef(null)
  const flyingCharRefs = useRef([])
  const targetCharRefs = useRef([])
  const bookSecRefs = useRef([])
  const slideLayerRefs = useRef([])
  const cachedMetricsRef = useRef(null)

  const [showScrollTop, setShowScrollTop] = useState(false)

  const drawerData = prepareVendorDrawerData(vendor)
  const titleLines = drawerData.titleLines
  const introParagraph = drawerData.introParagraph

  // 圖書館、吉龍里麵包計劃先只到第二區段（selected 按鈕先灰掉）
  const hasSelected = !NO_SELECTED_VENDOR_IDS.has(vendor?.id)

  useEffect(() => {
    if (!vendor) return
    if (scrollRef.current) {
      try {
        scrollRef.current.scrollTo({ top: 0, behavior: 'instant' })
      } catch {
        scrollRef.current.scrollTop = 0
      }
    }
    setShowScrollTop(false)
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [vendor, onClose])

  // 滾動轉場效果（標題字準確飛回簡介對應文字位置 + 選書由右往左滑入疊加）
  useEffect(() => {
    if (!vendor) return
    const scroller = scrollRef.current
    if (!scroller) return

    let rafId = null
    let animTimer = null
    cachedMetricsRef.current = null

    try {
      scroller.scrollTo({ top: 0, behavior: 'instant' })
    } catch {
      scroller.scrollTop = 0
    }

    const measurePositions = () => {
      const sTop = scroller.scrollTop
      const scrollerRect = scroller.getBoundingClientRect()
      const vh = scrollerRect.height || window.innerHeight || 800

      flyingCharRefs.current.forEach((el) => {
        if (el) el.style.transform = 'none'
      })

      const startPoints = flyingCharRefs.current.map((el) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return {
          x: r.left - scrollerRect.left,
          y: r.top - scrollerRect.top + sTop,
          h: r.height || 44,
        }
      })

      const targetPoints = targetCharRefs.current.map((el) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return {
          x: r.left - scrollerRect.left,
          y: r.top - scrollerRect.top + sTop,
          h: r.height || 20,
        }
      })

      const introTop = introSecRef.current
        ? introSecRef.current.getBoundingClientRect().top - scrollerRect.top + sTop
        : vh

      const bookTops = bookSecRefs.current.map((el) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return r.top - scrollerRect.top + sTop
      })

      cachedMetricsRef.current = {
        vh,
        startPoints,
        targetPoints,
        introTop,
        bookTops,
      }
    }

    const applyScrollTransforms = () => {
      if (!cachedMetricsRef.current) measurePositions()
      const m = cachedMetricsRef.current
      if (!m) return

      const sTop = scroller.scrollTop
      const vh = m.vh

      // (A) 標題字準確飛回段落：
      // 設定 deadZone 防止剛開啟或輕微位移時標題字提早下墜碰撞！
      const deadZone = Math.max(80, vh * 0.18)
      const introEnd = Math.max(deadZone + 120, m.introTop * 0.88)
      const rawP = sTop <= deadZone ? 0 : (sTop - deadZone) / Math.max(1, introEnd - deadZone)
      const p = clamp01(rawP)

      if (sTop <= deadZone || p === 0) {
        flyingCharRefs.current.forEach((el) => {
          if (!el) return
          el.style.transform = 'none'
          el.style.opacity = '1'
          el.style.color = '#111518'
        })
        targetCharRefs.current.forEach((el) => {
          if (!el) return
          el.style.opacity = '0'
        })
        if (logoLayerRef.current) {
          logoLayerRef.current.style.opacity = '1'
          logoLayerRef.current.style.visibility = 'visible'
        }
        if (desktopStageRef.current && isFood) {
          desktopStageRef.current.style.opacity = '1'
          desktopStageRef.current.style.visibility = 'visible'
        }
      } else {
        flyingCharRefs.current.forEach((el, idx) => {
          if (!el) return
          const sp = m.startPoints[idx]
          const tp = m.targetPoints[idx]
          if (!sp || !tp) return

          const eased = easeOutCubic(p)
          const dx = (tp.x - sp.x) * eased
          const dy = (tp.y - sp.y) * eased
          const targetScale = clamp01(tp.h / Math.max(sp.h, 24)) || 0.45
          const scale = 1 - (1 - targetScale) * eased

          const flyingOpacity = p >= 0.95 ? 0 : 1
          el.style.transformOrigin = 'top left'
          el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`
          el.style.opacity = flyingOpacity.toFixed(3)

          if (p >= 0.88) {
            el.style.color = '#90d326'
          } else {
            el.style.color = '#111518'
          }
        })

        // 段落目標字：飛行字抵達前隱形（保持空白），抵達瞬間 (p >= 0.95) 亮起，絕不重複疊字
        targetCharRefs.current.forEach((el) => {
          if (!el) return
          el.style.opacity = p >= 0.95 ? '1' : '0'
        })
      }

      // (B) 電腦版 Logo 層淡出：一旦滾動超過簡介進入選書區段，Logo 徹底淡出隱藏，杜絕與選書重疊！
      if (logoLayerRef.current) {
        const fadeStart = m.introTop + vh * 0.05
        const fadeEnd = m.introTop + vh * 0.5
        const logoOpacity = clamp01(1 - (sTop - fadeStart) / Math.max(1, fadeEnd - fadeStart))
        logoLayerRef.current.style.opacity = logoOpacity.toFixed(3)
        logoLayerRef.current.style.visibility = logoOpacity <= 0.01 ? 'hidden' : 'visible'
        if (desktopStageRef.current && isFood) {
          desktopStageRef.current.style.opacity = logoOpacity.toFixed(3)
          desktopStageRef.current.style.visibility = logoOpacity <= 0.01 ? 'hidden' : 'visible'
        }
      }

      // (C) 選書圖片由右往左疊上來 (translateX: 100% -> 0%)
      m.bookTops.forEach((bTop, idx) => {
        const layerEl = slideLayerRefs.current[idx]
        if (bTop === null || !layerEl) return
        const slideP = clamp01((sTop - (bTop - vh * 0.6)) / (vh * 0.55))
        const easedSlide = easeOutCubic(slideP)
        const tx = (1 - easedSlide) * 100
        layerEl.style.transform = `translate3d(${tx.toFixed(2)}%, 0, 0)`

        // 若下一本選書滑入，當前選書徹底淡出並隱藏 (visibility: hidden)，保證絕無殘留影子或透光
        const nextTop = m.bookTops[idx + 1]
        if (nextTop) {
          const nextP = clamp01((sTop - (nextTop - vh * 0.45)) / (vh * 0.35))
          const op = Math.max(0, 1 - nextP)
          layerEl.style.opacity = op.toFixed(3)
          layerEl.style.visibility = (op <= 0.005 || slideP <= 0) ? 'hidden' : 'visible'
        } else {
          layerEl.style.opacity = '1'
          layerEl.style.visibility = slideP <= 0 ? 'hidden' : 'visible'
        }
      })
    }

    const onScroll = () => {
      setShowScrollTop(scroller.scrollTop > 320)
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        applyScrollTransforms()
      })
    }

    const onResize = () => {
      measurePositions()
      applyScrollTransforms()
    }

    measurePositions()
    applyScrollTransforms()

    // drawer-in 動畫 (320ms) 結束後重新校正一次精確座標
    animTimer = setTimeout(() => {
      measurePositions()
      applyScrollTransforms()
    }, 360)

    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (animTimer) clearTimeout(animTimer)
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [vendor])

  if (!vendor) return null

  const isFood = vendor.kind === 'food'
  const rawItems = isFood ? vendor.menu : vendor.books
  const items = rawItems?.length
    ? rawItems.map((it, idx) => {
        const num = String(idx + 1).padStart(2, '0')
        const base =
          typeof it === 'string'
            ? { title: it }
            : {
                title: it.name,
                subtitle: it.subtitle || '',
                by: it.by,
                author: it.author,
                publisher: it.publisher,
                bio: it.bio,
                images: it.images,
              }
        const hasTwoDiskImages = Boolean(
          img(`exhibitors/${vendor.id}/books/${num}-1`) &&
            img(`exhibitors/${vendor.id}/books/${num}-2`)
        )
        const hasTwoImages =
          (Array.isArray(base.images) && base.images.length >= 2) || hasTwoDiskImages
        const { author, publisher } = parseAuthorPublisher(base, vendor.name)
        return { ...base, author, publisher, hasTwoImages }
      })
    : [0, 1, 2].map((idx) => ({
        title: isFood ? `精選餐點 0${idx + 1}` : `精選書目 0${idx + 1}`,
        subtitle: '',
        author: '',
        publisher: vendor.name.replace(/（.*?）|\(.*?\)/g, '').trim(),
        bio: '選書與作品介紹整理中。',
        hasTwoImages: false,
      }))

  const vendorsInSameSpot = exhibitorList.filter((e) => e.zone === vendor.zone)
  const singleDayLabel =
    vendor.days.length === 1 ? (vendor.days[0] === 1 ? '12/12 SAT. 限定' : '12/13 SUN. 限定') : null

  const scrollToSection = (targetRef) => {
    if (!targetRef.current) return
    targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* 點擊旁邊（未被視窗蓋住的首頁區域）回到原畫面 */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[58] cursor-pointer bg-transparent transition-opacity"
      />

      <aside
        role="dialog"
        aria-label={vendor.name}
        ref={scrollRef}
        className="drawer-in fixed inset-y-0 right-0 left-0 z-[60] overflow-x-hidden overflow-y-auto scroll-smooth border-l border-ink/15 bg-white font-sans text-ink snap-y snap-proximity md:left-[calc(max(1.5rem,(100vw-1280px)/2)+16.5rem)] md:snap-mandatory"
      >
      {/* 頂部常駐列：Spot 區塊透明無底色；關閉按鈕無遮罩僅保留叉叉 */}
      <div className="pointer-events-none sticky top-0 z-50 flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="pointer-events-auto flex items-center gap-3 bg-transparent md:invisible">
          <span className="shrink-0 text-cap font-bold">{vendor.zone}｜</span>
          <SpotBoothSvg
            spot={vendor.zone}
            vendorsInSpot={vendorsInSameSpot}
            activeSlot={vendor.slot}
            onSelectVendor={onSelectVendor}
            scale={0.65}
          />
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="pointer-events-auto cursor-pointer p-1 text-base font-normal leading-none text-ink transition-opacity hover:opacity-60"
        >
          ✕
        </button>
      </div>

      {/* 手機版返回頂部小按鈕：僅符號，無外框 */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="返回頂部"
          className="fixed right-6 bottom-6 z-50 flex items-center justify-center p-2 text-ink transition-opacity hover:opacity-60 active:scale-90 md:hidden"
        >
          <span className="text-base font-bold leading-none">↑</span>
        </button>
      )}

      {/* =====================================================================
          電腦版右側常駐 Sticky 視覺舞台：
          - 貼在最右邊邊緣 (right-0)、垂直置中切齊右中 (top-1/2 -translate-y-1/2)
          - 完全無最外層框線，上方橫排 IG 與官網連結
          - 書本由右往左水平滑入；滾入選書時 Logo 自動隱藏，杜絕重疊透光
         ===================================================================== */}
      <div
        ref={desktopStageRef}
        className="pointer-events-none sticky top-0 z-30 hidden h-0 w-full transition-opacity duration-200 md:block"
      >
        <div className="absolute top-[50dvh] right-0 w-[42%] max-w-[460px] -translate-y-1/2">
          {/* 圖片正上方：僅在有放 IG 或 Website 時渲染，無連結則完全不顯示佔位文字 */}
          {(vendor.ig?.length > 0 || vendor.website) && (
            <div className="pointer-events-auto mb-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 pr-6 pl-1 text-cap font-sans">
              {vendor.ig?.map((h) => (
                <a
                  key={h}
                  href={`https://www.instagram.com/${h.replace(/^@/, '')}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 transition-colors hover:text-ink/65"
                >
                  {h}
                </a>
              ))}
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 transition-colors hover:text-ink/65"
                >
                  Website ↗︎
                </a>
              )}
            </div>
          )}

          {/* 貼齊右中影像舞台：背景透明、無外邊框 */}
          <div className="relative aspect-square w-full overflow-hidden bg-transparent">
            {/* 底層：攤商 Logo（第 1、2 區段顯示；第 3 區段起淡出完全隱形） */}
            <div
              ref={logoLayerRef}
              className="absolute inset-0 flex items-center justify-center bg-transparent transition-opacity duration-200"
            >
              <Picture
                path={`exhibitors/${vendor.id}/logo`}
                label={`${vendor.name}\nLogo`}
                ratio="auto"
                className="h-full w-full bg-transparent"
              />
            </div>

            {/* 疊加層：非飲食攤的選書圖片，隨滾動由右往左水平疊上來 */}
            {!isFood &&
              items.map((it, idx) => {
                const num = String(idx + 1).padStart(2, '0')
                return (
                  <div
                    key={idx}
                    ref={(el) => {
                      slideLayerRefs.current[idx] = el
                    }}
                    style={{
                      transform: 'translate3d(100%, 0, 0)',
                      zIndex: 10 + idx,
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-transparent will-change-transform"
                  >
                    {it.hasTwoImages ? (
                      <div className="grid h-full w-full grid-cols-2 gap-2 bg-transparent p-2">
                        <Picture
                          path={`exhibitors/${vendor.id}/books/${num}-1`}
                          label={`${it.title}\n${num}-1`}
                          ratio="auto"
                          className="h-full w-full bg-transparent"
                        />
                        <Picture
                          path={`exhibitors/${vendor.id}/books/${num}-2`}
                          label={`${it.title}\n${num}-2`}
                          ratio="auto"
                          className="h-full w-full bg-transparent"
                        />
                      </div>
                    ) : (
                      <Picture
                        path={`exhibitors/${vendor.id}/books/${num}`}
                        label={`${it.title}\n${num}`}
                        ratio="auto"
                        className="h-full w-full bg-transparent"
                      />
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          各區段內容：底色輪流白底、淺灰底交替 (白 -> 灰 -> 白 -> 灰)
         ===================================================================== */}
      <div className="-mt-14">
        {/* ===================================================================
            第一區段 (Screen 1)：白底 (bg-white)
           =================================================================== */}
        <section
          aria-label="攤商視覺主頁"
          className="relative flex min-h-dvh w-full flex-col justify-between overflow-x-clip bg-white px-6 pt-20 pb-14 sm:px-10 snap-start"
        >
          <div className="relative flex min-h-[calc(100dvh-8.5rem)] w-full flex-col justify-between md:w-[54%] md:pr-6">
            {/* 地區與限定日期 */}
            <div className="relative min-h-[3rem] w-full font-sans text-cap">
              <div
                style={{ marginLeft: '12%', marginTop: '0.5rem' }}
                className="inline-flex flex-wrap items-baseline gap-x-2 text-ink"
              >
                <span className="font-bold tracking-wide">{vendor.origin.join('・')}</span>
                {singleDayLabel && (
                  <span className="text-ink/80">｜{singleDayLabel}</span>
                )}
              </div>
            </div>

            {/* 攤商名稱：字色純黑，分行明確絕不重疊；只有要飛回段落的字才被拆出進行滾動轉場 */}
            <div className="relative z-20 my-auto py-6 pr-2 md:py-10">
              <h2
                aria-label={vendor.name}
                className="font-sans text-[clamp(1.75rem,3.8vw,2.85rem)] leading-snug font-bold text-ink"
              >
                {titleLines.map((line, lIdx) => (
                  <div
                    key={lIdx}
                    className={`block w-full leading-snug text-ink ${
                      lIdx > 0 ? (line.crossPrefix ? 'mt-4' : 'mt-3 sm:mt-4') : ''
                    }`}
                  >
                    {line.crossPrefix && (
                      <span className="lime-stroke font-bold mr-3 inline-block">✕</span>
                    )}
                    {(() => {
                      const tokens = []
                      let currentWord = []
                      for (const item of line.chars) {
                        const isLatin = /^[A-Za-z0-9À-ÿ.&’'()\-\/]$/.test(item.char)
                        if (isLatin) {
                          currentWord.push(item)
                        } else {
                          if (currentWord.length > 0) {
                            tokens.push({ type: 'word', chars: currentWord })
                            currentWord = []
                          }
                          tokens.push({ type: 'char', char: item })
                        }
                      }
                      if (currentWord.length > 0) {
                        tokens.push({ type: 'word', chars: currentWord })
                      }

                      return tokens.map((token, tIdx) => {
                        if (token.type === 'word') {
                          return (
                            <span key={tIdx} className="inline-block whitespace-nowrap">
                              {token.chars.map((item, cIdx) => (
                                <span
                                  key={cIdx}
                                  ref={(el) => {
                                    if (item.flyingIndex !== -1) {
                                      flyingCharRefs.current[item.flyingIndex] = el
                                    }
                                  }}
                                  className={`inline-block text-ink ${
                                    item.flyingIndex !== -1 ? 'will-change-transform' : ''
                                  }`}
                                >
                                  {item.char}
                                </span>
                              ))}
                            </span>
                          )
                        }
                        const item = token.char
                        return (
                          <span
                            key={tIdx}
                            ref={(el) => {
                              if (item.flyingIndex !== -1) {
                                flyingCharRefs.current[item.flyingIndex] = el
                              }
                            }}
                            className={`inline-block text-ink ${
                              item.flyingIndex !== -1 ? 'will-change-transform' : ''
                            }`}
                          >
                            {item.char === ' ' ? '\u00A0' : item.char}
                          </span>
                        )
                      })
                    })()}
                  </div>
                ))}
              </h2>
            </div>

            {/* 手機版專屬 Logo 與連結（外部連結放在 Logo 上方靠左對齊，與電腦版一致） */}
            <div className="relative z-10 -mr-6 ml-auto w-[64%] sm:-mr-10 sm:w-[52%] md:hidden">
              {(vendor.ig?.length > 0 || vendor.website) && (
                <div className="mb-2 flex flex-wrap items-baseline justify-start gap-x-2 gap-y-1 pr-6 text-left font-sans text-cap sm:pr-10">
                  {vendor.ig?.map((h) => (
                    <a
                      key={h}
                      href={`https://www.instagram.com/${h.replace(/^@/, '')}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      {h}
                    </a>
                  ))}
                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      Website ↗︎
                    </a>
                  )}
                </div>
              )}
              <Picture
                path={`exhibitors/${vendor.id}/logo`}
                label={`${vendor.name}\nLogo`}
                ratio="1 / 1"
                className="w-full bg-transparent"
              />
            </div>

            {/* intro 與 selected 錨點（思源標準字、萊姆綠 #d2fea1 帶細黑外框） */}
            <div className="relative z-20 mt-6 min-h-[3.5rem] w-full font-sans text-body font-bold">
              <button
                type="button"
                onClick={() => scrollToSection(introSecRef)}
                style={{ marginLeft: '10%' }}
                className="lime-stroke inline-flex cursor-pointer items-baseline transition-transform hover:translate-y-0.5"
              >
                <span>intro</span>
                <span className="ml-1 text-cap">↓</span>
              </button>

              {hasSelected ? (
                <button
                  type="button"
                  onClick={() => scrollToSection(selectedSecRef)}
                  style={{ marginLeft: '18%' }}
                  className="lime-stroke inline-flex translate-y-2 cursor-pointer items-baseline transition-transform hover:translate-y-2.5"
                >
                  <span>selected</span>
                  <span className="ml-1 text-cap">↓</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  style={{ marginLeft: '18%' }}
                  className="inline-flex translate-y-2 cursor-not-allowed items-baseline opacity-35 text-ink/40"
                >
                  <span>selected</span>
                  <span className="ml-1 text-cap">↓</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================================
            第二區段 (Screen 2)：淺灰底 (bg-[#eef0f2]) ＋ 簡介
           =================================================================== */}
        <section
          id="vendor-intro"
          ref={introSecRef}
          aria-label="攤商簡介"
          className="flex min-h-dvh w-full flex-col justify-center overflow-x-clip bg-[#eef0f2] px-6 py-20 sm:px-10 snap-start"
        >
          <div className="w-full md:w-[54%] md:pr-8">
            {/* 簡介：自然出現的攤商名稱以萊姆綠 (#90d326) 標註，字飛回前保持透明空白，絕無 AI 額外添加文字 */}
            <p className="whitespace-pre-line font-sans text-body leading-relaxed text-ink text-justify">
              {introParagraph.segments.map((seg, sIdx) => {
                if (!seg.isTarget) {
                  return <span key={sIdx}>{seg.text}</span>
                }
                return (
                  <span key={sIdx} className="lime-stroke font-bold inline">
                    {seg.chars.map((chObj) => (
                      <span
                        key={chObj.globalIndex}
                        ref={(el) => {
                          targetCharRefs.current[chObj.globalIndex] = el
                        }}
                        className="inline-block"
                        style={{ opacity: 0 }}
                      >
                        {chObj.char === ' ' ? '\u00A0' : chObj.char}
                      </span>
                    ))}
                  </span>
                )
              })}
            </p>

            {/* 英文簡介（僅在非刪除區段且同時有中文與英文時於下方補充呈現） */}
            {hasSelected && vendor.introZh && vendor.introEn && (
              <p
                lang="en"
                className="mt-6 whitespace-pre-line font-sans text-cap leading-relaxed text-ink/75 text-justify"
              >
                {vendor.introEn}
              </p>
            )}
          </div>
        </section>

        {/* ===================================================================
            第三區段：
            - 若為飲食攤：以附圖的當代畫報／拼貼畫廊 (Collage) 排列於單一區段展示完整 Menu
            - 若為出版／選書：維持單屏獨立作品切換 (Screen 3+)
            - 特定攤商先只到第二區段（hasSelected 為 false 者不渲染此區段）
           =================================================================== */}
        {hasSelected && (
          <div id="vendor-selected" ref={selectedSecRef}>
            {isFood ? (
              /* 飲食攤專屬：當代料理畫報排版 (Contemporary Culinary Editorial Spread)
                 文字為整體視覺排版素材之一，錯落呼吸感配置，非刻板圖說 */
              <section
                aria-label="餐點品項當代排版"
                className="flex min-h-dvh w-full flex-col justify-center overflow-x-clip bg-white px-6 py-20 sm:px-10 snap-start"
              >
                <div className="mx-auto w-full max-w-[1180px]">
                  <FoodStallEditorial vendor={vendor} />
                </div>
              </section>
            ) : (
            /* 出版書展攤商：每本選書獨立一屏 (白/灰交替) */
            items.map((it, idx) => {
              const num = String(idx + 1).padStart(2, '0')
              const secBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#eef0f2]'

              return (
                <section
                  key={idx}
                  ref={(el) => {
                    bookSecRefs.current[idx] = el
                  }}
                  aria-label={it.title}
                  className={`flex min-h-dvh w-full flex-col justify-center overflow-x-clip ${secBg} px-6 py-20 sm:px-10 snap-start`}
                >
                  <div className="w-full min-w-0 md:w-[54%] md:pr-8">
                    {/* 電腦版 (md:block)：對齊附圖 1（作者與出版者置於書號與標題上方，離標題更近） */}
                    <div className="hidden md:block mb-6">
                      {(it.author || it.publisher) && (
                        <div className="mb-2 space-y-1 font-sans text-cap max-w-[420px]">
                          {it.author && (
                            <div style={{ marginLeft: '16%' }} className="flex items-start">
                              <span className="lime-stroke font-bold leading-normal break-words [overflow-wrap:anywhere]">{it.author}</span>
                            </div>
                          )}
                          {it.publisher && (
                            <div style={{ marginLeft: '32%' }} className="flex items-start gap-1.5">
                              <span className="shrink-0 font-normal text-ink/75">Published by</span>
                              <span className="lime-stroke font-bold leading-normal whitespace-pre-line break-words [overflow-wrap:anywhere]">{it.publisher}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="font-sans text-cap text-ink/50 text-left">{num}</p>
                      <h3 className="mt-1 font-sans text-title font-bold text-ink leading-tight whitespace-pre-line text-left break-words [overflow-wrap:anywhere]">
                        {it.title}
                      </h3>
                      {it.subtitle && (
                        <p className="lime-stroke mt-3 font-sans text-cap font-bold leading-normal text-left break-words [overflow-wrap:anywhere]">
                          {it.subtitle}
                        </p>
                      )}
                    </div>

                    {/* 手機版 (md:hidden)：維持現有版面 */}
                    <div className="block md:hidden mb-6 pb-2">
                      <p className="font-sans text-cap text-ink/50 text-left">{num}</p>
                      <h3 className="mt-1 font-sans text-title font-bold text-ink leading-tight whitespace-pre-line text-left break-words [overflow-wrap:anywhere]">
                        {it.title}
                      </h3>
                      {it.subtitle && (
                        <p className="lime-stroke mt-3 font-sans text-cap font-bold leading-normal text-left break-words [overflow-wrap:anywhere]">
                          {it.subtitle}
                        </p>
                      )}

                      {(it.author || it.publisher) && (
                        <div className="mt-3 space-y-1.5 font-sans text-cap">
                          {it.author && (
                            <div className="inline-flex items-baseline gap-1.5">
                              <span className="lime-stroke font-bold break-words [overflow-wrap:anywhere]">{it.author}</span>
                            </div>
                          )}
                          {it.publisher && (
                            <div className="flex items-baseline gap-1.5">
                              <span className="shrink-0 font-normal text-ink/75">Published by</span>
                              <span className="lime-stroke font-bold whitespace-pre-line break-words [overflow-wrap:anywhere]">{it.publisher}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 電腦版段落文字區 */}
                    <div className="hidden md:block">
                      {it.bio && (
                        <p className="whitespace-pre-line font-sans text-body leading-relaxed text-ink/90 text-justify">
                          {it.bio}
                        </p>
                      )}
                    </div>

                    {/* 手機版：延續上一版排版（文字在上方自然呈現，圖片於下方右對齊留白） */}
                    <div className="block md:hidden">
                      <MobileCollapsibleBio bio={it.bio} />
                      <div className="mt-6 -mr-6 ml-auto w-[72%] sm:-mr-10 sm:w-[60%]">
                        {it.hasTwoImages ? (
                          <div className="grid grid-cols-2 gap-1.5 bg-transparent">
                            <Picture
                              path={`exhibitors/${vendor.id}/books/${num}-1`}
                              label={`${it.title}\n${num}-1`}
                              ratio="3 / 4"
                              className="bg-transparent"
                            />
                            <Picture
                              path={`exhibitors/${vendor.id}/books/${num}-2`}
                              label={`${it.title}\n${num}-2`}
                              ratio="3 / 4"
                              className="bg-transparent"
                            />
                          </div>
                        ) : (
                          <Picture
                            path={`exhibitors/${vendor.id}/books/${num}`}
                            label={`${it.title}\n${num}`}
                            ratio="3 / 4"
                            className="bg-transparent"
                          />
                        )}
                      </div>
                    </div>

                    {idx === items.length - 1 && vendor.limited && (
                      <p className="lime-stroke mt-8 font-sans text-cap font-bold">
                        書展限定：{vendor.limited}
                      </p>
                    )}
                  </div>
                </section>
              )
            })
          )}
        </div>
        )}
      </div>
    </aside>
    </>
  )
}
