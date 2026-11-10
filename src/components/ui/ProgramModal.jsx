import React, { useEffect, useState, useRef } from 'react'
import { getProgramDetails } from '../../lib/programDetails'
import Picture from './Picture'

/**
 * 活動內頁彈窗 (ProgramModal)
 *
 * 遵循使用者精確規範：
 * 1. 版位控制：
 *    - 左欄版位不變 (md:w-[42%] lg:w-[440px] shrink-0)，滾動時隨螢幕吸附往下 (md:sticky md:top-14)
 *    - 右欄向右再縮窄，縮到螢幕右 50% 以內 (md:w-[38%] md:max-w-[390px] lg:max-w-[410px] md:ml-auto)
 * 2. 手機版專屬重排 (只有手機版喔！)：
 *    - 英文標題也有大字效果
 *    - 下面「先接導航那行」(避免手機要滑到最下面才看到)
 *    - 再接著跑馬燈（無上下框線，速度慢讓人點得到超連結）：跑 時間 > 地點 > 報名資訊（或免報名）
 *    - 接著才是活動中文主標題與詳細介紹
 * 3. 電腦版維持原樣：
 *    - 左欄：英文大字粗體、時間地點、報名連結
 *    - 右欄：中文主標 (medium 字重)、內文、底部導航
 * 4. 標題與字重：
 *    - 主標只要 medium 字重 (font-medium)，大小收斂 (text-title)
 *    - 沙龍右上角標題：第一行「Blablabla＞＞＞有話想說」，第二行接講者名，兩行相同層級 (同字級與 medium 字重)
 *    - 林君燁導讀右上角標題：直接寫「Hi～傻瓜書日的藝術書導讀」，不加前綴
 * 5. 線條：
 *    - 絕無任何分段段落線與導航分隔線
 * 6. 圖片靠左：
 *    - 內頁圖片統一靠左排版 (align="left", object-left, flex justify-start)，確保貼左
 * 7. 導航邏輯：
 *    - 「會換文字的只有論壇」！其餘活動只換左側照片，右側文字永遠維持活動詳細介紹
 *    - Riso 工作坊：
 *      - 第 1 張 (workshop3.png)
 *      - 第 2 張 (meadowroom 草地房 logo)
 *      - 第 3 張 (原本主視覺首圖)
 *      - 第 4~6 張 (workshop1, workshop2, workshop4)
 *      - 導航動態：第 1 張 Event / 草地房；第 2 張插入 Next；第 3 張起插入 Previous / Next
 */

function getProgramNavConfig(details) {
  const id = details.id

  // 1. 論壇 (forum) - 唯一會換文字的活動
  if (id === 'forum') {
    return {
      type: 'forum',
      slides: [
        { label: 'Event', photo: details.topImage, speakerIdx: -1 },
        { label: 'Oh Jong-gil 吳鍾佶', photo: 'programs/forum/speaker-1', speakerIdx: 0 },
        { label: 'S. Yi Yao Chao 周亦瑤', photo: 'programs/forum/speaker-2', speakerIdx: 1 },
        { label: 'Renée Ting', photo: 'programs/forum/speaker-3', speakerIdx: 2 },
        { label: '黃羿瑄 HUANG, Yi-Hsuan', photo: 'programs/forum/moderator', speakerIdx: 3 },
      ],
    }
  }

  // 2. 林君燁導讀 (tour-1 / tour-2)
  if (id.startsWith('tour')) {
    return {
      type: 'custom',
      slides: [
        { label: 'Event', photo: 'programs/tour-1/cover' },
        { label: '林君燁 Lin Junye', photo: 'programs/tour-1/LSZ_1935' },
      ],
    }
  }

  // 3. 做一本木頭書 (woodbook-1 / woodbook-2)
  if (id.startsWith('woodbook')) {
    return {
      type: 'custom',
      slides: [
        { label: 'Event', photo: 'programs/woodbook-1/木頭書示意圖-白底' },
        { label: '施絜晴 / Jie', photo: 'programs/woodbook-1/個人照' },
      ],
    }
  }

  // 4. Riso 工作坊 (riso-1 / riso-2)
  // 首圖改為 workshop3，原本主視覺首圖改在草地房 logo 後
  if (id.startsWith('riso')) {
    return {
      type: 'riso',
      slides: [
        { label: 'Event', photo: 'programs/riso-1/workshop3' },
        { label: 'meadowroom 草地房', photo: 'programs/riso-1/meadowroom_logo' },
        { label: '主視覺', photo: 'programs/riso-1/hero' },
        { label: 'workshop1', photo: 'programs/riso-1/workshop1' },
        { label: 'workshop2', photo: 'programs/riso-1/workshop2' },
        { label: 'workshop4', photo: 'programs/riso-1/workshop4' },
      ],
    }
  }

  // 5. 品度藝術 (salon-3)
  if (id === 'salon-3') {
    return {
      type: 'custom',
      slides: [
        { label: 'Event', photo: 'programs/salon-3/space' },
        { label: '曾哲偉', photo: 'programs/salon-3/speaker' },
        { label: '品度藝術 PRNDL.art', photo: 'programs/salon-3/PRNDL.art_logo_Orange-04' },
      ],
    }
  }

  // 6. 本冊圖書館 (salon-4)
  if (id === 'salon-4') {
    return {
      type: 'custom',
      slides: [
        { label: 'Event', photo: 'programs/salon-4/space' },
        { label: '本冊圖書館 Artqpie Library', photo: 'programs/salon-4/本冊' },
      ],
    }
  }

  // 7. 節點四空間對談 (salon-5)
  if (id === 'salon-5') {
    return {
      type: 'custom',
      slides: [
        { label: '節點 Zit-Dim Art Space', photo: 'exhibitors/zitdim/logo' },
        { label: '鯉魚藝廊 Carp Gallery', photo: 'exhibitors/carp/logo' },
        { label: '窯座 YÁO', photo: 'exhibitors/yao/logo' },
        { label: '毛刺 Glitch', photo: 'exhibitors/glitch/logo' },
      ],
    }
  }

  // 8. 野点沙龍 (salon-6)
  if (id === 'salon-6') {
    return {
      type: 'custom',
      slides: [
        { label: 'Event', photo: 'exhibitors/nodate/logo' },
        { label: '陳敬元', photo: 'programs/salon-6/陳敬元' },
        { label: '陳念瑩', photo: 'programs/salon-6/陳念瑩' },
        { label: '張玉音', photo: 'programs/salon-6/張玉音' },
        { label: '羅智信', photo: 'programs/salon-6/羅智信' },
      ],
    }
  }

  // 9. Silent Party (silent-party)
  if (id === 'silent-party') {
    return {
      type: 'custom',
      slides: [
        { label: 'Event', photo: 'programs/silent-party/cover' },
        { label: 'DJ 游璨賓', photo: 'speakers/賓哥' },
      ],
    }
  }

  // 其他多圖活動
  if (details.carouselPhotos?.length) {
    return {
      type: 'prev-next',
      slides: [
        { label: 'Event', photo: details.topImage },
        ...details.carouselPhotos.map((p, i) => ({ label: `Photo ${i + 1}`, photo: p.path || p })),
      ],
    }
  }

  // 單張照片活動
  return {
    type: 'single',
    slides: [{ label: 'Event', photo: details.topImage }],
  }
}

function getSalonHeader(details) {
  const id = details.id
  if (id === 'salon-1') return '葉忠宜 Chung-Yi Yeh'
  if (id === 'salon-2') return '方序中 Joe Fang'
  if (id === 'salon-3') return '曾哲偉 / 品度藝術 PRNDL.art'
  if (id === 'salon-4') return '本冊圖書館 Artqpie Library'
  if (id === 'salon-5') return '節點、鯉魚藝廊、窯座、毛刺'
  if (id === 'salon-6') return '野点沙龍：紙本派，集合！'
  return details.title
}

/**
 * 手機版專屬跑馬燈：慢速滾動跑「時間 地點 報名資訊」，無上下框線，資訊間不用「>」，可直接點選報名超連結
 */
function ProgramMarquee({ details }) {
  const regNode =
    details.registration === 'required' ? (
      details.registerUrl ? (
        <a
          href={details.registerUrl}
          target="_blank"
          rel="noreferrer"
          className="font-normal underline underline-offset-4 text-ink hover:opacity-65"
        >
          報名連結 ↗︎
        </a>
      ) : (
        <span className="font-normal text-ink">報名連結 ↗︎</span>
      )
    ) : (
      <span className="font-normal text-ink/80">免報名，現場自由參與</span>
    )

  const marqueeItem = (
    <span className="inline-flex items-center gap-x-6 text-body font-normal text-ink whitespace-nowrap">
      <span>{details.timeSimple.replace(/\n/g, ' ｜ ')}</span>
      <span>{details.venue}</span>
      {regNode}
    </span>
  )

  return (
    <div className="relative w-full overflow-hidden py-2 select-none">
      <div
        style={{ animationDuration: '48s' }}
        className="animate-marquee flex w-max gap-8 hover:[animation-play-state:paused] active:[animation-play-state:paused]"
      >
        {marqueeItem}
        {marqueeItem}
        {marqueeItem}
        {marqueeItem}
      </div>
    </div>
  )
}

export default function ProgramModal({ programId, onClose }) {
  const modalRef = useRef(null)
  const [slideIdx, setSlideIdx] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const details = programId ? getProgramDetails(programId) : null

  useEffect(() => {
    setSlideIdx(0)
    if (modalRef.current) modalRef.current.scrollTop = 0
    setShowScrollTop(false)

    if (programId) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const onKey = (e) => e.key === 'Escape' && onClose()
      window.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = prevOverflow
        window.removeEventListener('keydown', onKey)
      }
    }
  }, [programId, onClose])

  if (!details) return null

  const navConfig = getProgramNavConfig(details)
  const totalSlides = navConfig.slides.length
  const hasMultipleImages = totalSlides > 1

  const currentSlide = navConfig.slides[slideIdx] || navConfig.slides[0]
  const currentPhoto = currentSlide.photo

  const isSalon = details.id.startsWith('salon')
  const isForum = details.id === 'forum'

  // 論壇是唯一會切換文字內容的活動
  const activeForumSpeaker =
    isForum && slideIdx > 0 && details.hosts ? details.hosts[slideIdx - 1] : null

  const handlePrev = () => {
    setSlideIdx((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))
  }

  const handleNext = () => {
    setSlideIdx((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
  }

  const handleScroll = (e) => {
    setShowScrollTop(e.currentTarget.scrollTop > 240)
  }

  const scrollToTop = () => {
    if (!modalRef.current) return
    try {
      modalRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      modalRef.current.scrollTop = 0
    }
  }

  // 段落切分格式化（無任何多餘分隔線）
  const renderParagraphs = (content) => {
    if (!content) return null
    return String(content)
      .split(/\n\s*\n|\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((para, i) => (
        <p key={i} className="text-body leading-relaxed text-ink text-justify">
          {para}
        </p>
      ))
  }

  // 導航渲染函式（供手機版置頂與電腦版底部使用）
  const renderNav = (isMobile = false) => {
    if (navConfig.type === 'single') return null

    if (navConfig.type === 'riso') {
      return (
        <div
          className={`${
            isMobile ? 'my-3' : 'mt-10'
          } flex flex-wrap items-center gap-x-2 gap-y-1.5 text-cap font-sans`}
        >
          <button
            type="button"
            onClick={() => setSlideIdx(0)}
            className={`cursor-pointer transition-colors ${
              slideIdx === 0
                ? 'font-bold text-ink underline underline-offset-4'
                : 'text-ink/50 hover:text-ink'
            }`}
          >
            Event
          </button>
          <span className="text-ink/30">/</span>
          <button
            type="button"
            onClick={() => setSlideIdx(1)}
            className={`cursor-pointer transition-colors ${
              slideIdx === 1
                ? 'font-bold text-ink underline underline-offset-4'
                : 'text-ink/50 hover:text-ink'
            }`}
          >
            meadowroom 草地房
          </button>

          {slideIdx >= 2 && (
            <>
              <span className="text-ink/30">/</span>
              <button
                type="button"
                onClick={() => setSlideIdx((prev) => (prev > 2 ? prev - 1 : 1))}
                className="cursor-pointer underline underline-offset-4 text-ink hover:opacity-60"
              >
                Previous
              </button>
            </>
          )}

          {slideIdx >= 1 && (
            <>
              <span className="text-ink/30">/</span>
              <button
                type="button"
                onClick={() =>
                  setSlideIdx((prev) => (prev < totalSlides - 1 ? prev + 1 : 2))
                }
                className="cursor-pointer underline underline-offset-4 text-ink hover:opacity-60"
              >
                Next
              </button>
            </>
          )}
        </div>
      )
    }

    if (navConfig.type === 'forum') {
      return (
        <div
          className={`${
            isMobile ? 'my-3' : 'mt-10'
          } flex flex-wrap items-center gap-x-2 gap-y-1.5 text-cap font-sans`}
        >
          {navConfig.slides.map((slide, idx) => {
            const isCur = slideIdx === idx
            return (
              <React.Fragment key={slide.label}>
                {idx > 0 && <span className="text-ink/30">/</span>}
                <button
                  type="button"
                  onClick={() => setSlideIdx(idx)}
                  className={`cursor-pointer transition-colors ${
                    isCur
                      ? 'font-bold text-ink underline underline-offset-4'
                      : 'text-ink/50 hover:text-ink'
                  }`}
                >
                  {slide.label}
                </button>
              </React.Fragment>
            )
          })}
        </div>
      )
    }

    if (navConfig.type === 'custom') {
      return (
        <div
          className={`${
            isMobile ? 'my-3' : 'mt-10'
          } flex flex-wrap items-center gap-x-2 gap-y-1.5 text-cap font-sans`}
        >
          {navConfig.slides.map((slide, idx) => {
            const isCur = slideIdx === idx
            return (
              <React.Fragment key={slide.label}>
                {idx > 0 && <span className="text-ink/30">/</span>}
                <button
                  type="button"
                  onClick={() => setSlideIdx(idx)}
                  className={`cursor-pointer transition-colors ${
                    isCur
                      ? 'font-bold text-ink underline underline-offset-4'
                      : 'text-ink/50 hover:text-ink'
                  }`}
                >
                  {slide.label}
                </button>
              </React.Fragment>
            )
          })}
        </div>
      )
    }

    if (navConfig.type === 'prev-next') {
      return (
        <div
          className={`${
            isMobile ? 'my-3 justify-start' : 'mt-10 justify-end'
          } flex items-center gap-3 text-cap font-bold text-ink`}
        >
          <button
            type="button"
            onClick={handlePrev}
            className="cursor-pointer underline underline-offset-4 hover:opacity-60"
          >
            Previous
          </button>
          <span className="text-ink/30 font-normal">/</span>
          <button
            type="button"
            onClick={handleNext}
            className="cursor-pointer underline underline-offset-4 hover:opacity-60"
          >
            Next
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={details.title}
      className="modal-slide-in fixed inset-0 z-[60] bg-white font-sans text-ink selection:bg-lime selection:text-ink"
    >
      {/* 頂部關閉按鈕：常駐右上角，純文字符號「✕」 */}
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-40 flex items-center justify-end px-6 py-4 sm:px-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="pointer-events-auto cursor-pointer p-1 text-base font-normal leading-none text-ink transition-opacity hover:opacity-60"
        >
          ✕
        </button>
      </div>

      {/* 返回頂部按鈕：純符號「↑」，無外框，常駐固定於視窗右下角 */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="返回頂部"
          className="pointer-events-auto absolute right-6 bottom-6 z-40 flex cursor-pointer items-center justify-center p-2 text-ink transition-opacity hover:opacity-60 active:scale-90"
        >
          <span className="text-base font-bold leading-none">↑</span>
        </button>
      )}

      {/* 內部滾動容器 */}
      <div
        ref={modalRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto pt-14 pb-20 sm:pt-16 sm:pb-24"
      >
        <main className="mx-auto max-w-[1240px] px-6 sm:px-10 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-12 lg:gap-16">
            {/* =================================================================
                左欄：版位不變 (md:w-[42%] lg:w-[440px] shrink-0)
                - 電腦版：照片、膠囊圓點、英文大字標題、時間地點、報名連結，隨滾動吸附往下
                - 手機版：照片、膠囊圓點、英文大字標題、導航行、慢速跑馬燈
               ================================================================= */}
            <div className="w-full md:w-[42%] lg:w-[440px] shrink-0 flex flex-col justify-between md:sticky md:top-14 self-start">
              <div>
                {/* 1. 照片展示或 Instagram Reel 嵌入（統一靠左排版貼左） */}
                {details.topVideoEmbed && slideIdx === 0 ? (
                  <div className="relative aspect-[9/16] max-h-[560px] w-full max-w-[340px] overflow-hidden bg-black/5 m-0 mr-auto">
                    <iframe
                      src={details.topVideoEmbed}
                      title={details.title}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      scrolling="no"
                      className="h-full w-full border-0"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-transparent flex justify-start items-start">
                    <Picture
                      path={currentPhoto}
                      label={details.title}
                      ratio="4 / 3"
                      fit="contain"
                      align="left"
                      className="h-full w-full bg-transparent object-contain object-left"
                    />
                  </div>
                )}

                {/* 2. 膠囊圓點導航 (Info 區塊樣式：多圖時顯示) */}
                {hasMultipleImages && (
                  <div
                    className="mt-4 flex items-center gap-2"
                    role="tablist"
                    aria-label="切換活動照片或講者"
                  >
                    {Array.from({ length: totalSlides }).map((_, i) => {
                      const isCur = i === slideIdx
                      return (
                        <button
                          key={i}
                          type="button"
                          role="tab"
                          aria-selected={isCur}
                          aria-label={`第 ${i + 1} 項`}
                          onClick={() => setSlideIdx(i)}
                          style={{
                            width: isCur ? '28px' : '8px',
                            transition:
                              'width 320ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 250ms',
                          }}
                          className={`h-2 rounded-full cursor-pointer ${
                            isCur ? 'bg-lime' : 'bg-cool-light hover:bg-cool'
                          }`}
                        />
                      )
                    })}
                  </div>
                )}

                {/* 3. 英文活動名稱（手機與電腦均具大字粗體質感） */}
                {details.titleEn && (
                  <h2
                    lang="en"
                    className="mt-6 mb-4 md:mt-8 md:mb-0 text-[1.5rem] sm:text-[1.75rem] font-bold leading-tight text-ink"
                  >
                    {details.titleEn}
                  </h2>
                )}

                {/* 4. 手機版專屬：先接導航行，再接著慢速跑馬燈（只有手機版，行距拉大） */}
                <div className="block md:hidden">
                  <div className="my-4">
                    {renderNav(true)}
                  </div>
                  <div className="my-5">
                    <ProgramMarquee details={details} />
                  </div>
                </div>

                {/* 5. 電腦版專屬：時間地點與報名連結（只有電腦版在左欄） */}
                <div className="hidden md:block">
                  <div className="mt-6 space-y-1.5 text-body font-bold text-ink">
                    <p className="whitespace-pre-line leading-relaxed">{details.timeSimple}</p>
                    <p>{details.venue}</p>
                  </div>

                  <div className="mt-6">
                    {details.registration === 'required' ? (
                      <a
                        href={details.registerUrl || 'https://www.accupass.com/'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cap font-bold underline underline-offset-4 text-ink hover:opacity-65"
                      >
                        報名連結 ↗︎
                      </a>
                    ) : (
                      <p className="text-cap font-bold text-ink/75">
                        免報名，現場自由參與
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                右欄：更窄、向右縮 (md:w-[38%] md:max-w-[390px] lg:max-w-[410px] md:ml-auto)
                - 主標：medium 字重，不比原本大
                - 沙龍標題：Blablabla＞＞＞有話想說 與講者名同層級
                - 林君燁導讀：Hi～傻瓜書日的藝術書導讀
                - 絕無任何分隔線
                - 會換文字的只有論壇
                - 電腦版底部保留導航行 (手機版已置頂)
               ================================================================= */}
            <div className="w-full md:w-[38%] md:max-w-[390px] lg:max-w-[410px] md:ml-auto flex flex-col justify-between min-h-[440px]">
              <div>
                {/* 1. 標題區塊：與下方段落相同字級 (text-body)，用字重 (font-bold) 分層級，靠左對齊 */}
                {isForum && activeForumSpeaker ? (
                  /* 論壇講者切換模式：人名後面接單位，用｜ */
                  <div className="mb-6 font-sans text-left">
                    <p className="text-body font-bold text-ink leading-snug">
                      {activeForumSpeaker.name}
                      {activeForumSpeaker.org ? ` ｜ ${activeForumSpeaker.org}` : ''}
                    </p>
                  </div>
                ) : isSalon ? (
                  /* 沙龍標題格式：Blablabla＞＞＞有話想說 與講者名相同層級 */
                  <div className="mb-6 text-left">
                    <p className="text-body font-bold text-ink leading-snug">
                      Blablabla＞＞＞有話想說
                    </p>
                    <h1 className="text-body font-bold text-ink leading-snug">
                      {getSalonHeader(details)}
                    </h1>
                  </div>
                ) : (
                  /* 一般活動標題（林君燁導讀不加 Explore Art Book Fair 前綴） */
                  <h1 className="mb-6 text-body font-bold text-ink leading-snug text-left">
                    {details.id.startsWith('tour')
                      ? 'Hi～傻瓜書日的藝術書導讀'
                      : details.title}
                  </h1>
                )}

                {/* 2. 內文段落（無任何水平分隔線） */}
                {isForum && activeForumSpeaker ? (
                  /* 論壇講者簡介 */
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {renderParagraphs(activeForumSpeaker.bioZh)}
                    </div>
                    {activeForumSpeaker.bioEn && (
                      <div className="space-y-4 text-ink/80 pt-2" lang="en">
                        {renderParagraphs(activeForumSpeaker.bioEn)}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 所有活動的詳細介紹內容（會換文字的只有論壇，其他活動文字保持不變） */
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {renderParagraphs(
                        details.richIntro || details.statement || details.blurb
                      )}
                    </div>

                    {/* 論壇總覽：講者名單與所屬單位，以 ｜ 連接 */}
                    {isForum && details.hosts?.length > 0 && (
                      <div className="mt-8 space-y-1.5 pt-2 font-sans text-cap text-ink/75">
                        {details.hosts.map((h, i) => (
                          <p key={i}>
                            {h.name}{h.org ? ` ｜ ${h.org}` : ''}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* 單一講者（如施絜晴、草地房、林君燁、葉忠宜等）：無括號頭銜 */}
                    {!isForum && details.hosts?.length > 0 && (
                      <div className="mt-8 space-y-4">
                        {details.hosts.map((h, i) => {
                          const isWoodbook = details.id.startsWith('woodbook')
                          return (
                            <div key={i} className="space-y-2">
                              <p className="font-medium text-body text-ink">
                                {h.name}
                                {!isWoodbook && h.org ? `（${h.org}）` : ''}
                                {h.role && (
                                  <span className="ml-2 font-normal text-ink/60">
                                    | {h.role}
                                  </span>
                                )}
                              </p>
                              {h.bioZh && (
                                <div className="space-y-3">
                                  {renderParagraphs(h.bioZh)}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. 電腦版底部導航（手機版已置於頂部） */}
              <div className="hidden md:block">
                {renderNav(false)}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
