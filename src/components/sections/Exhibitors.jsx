import { useEffect, useRef, useState } from 'react'
import { exhibitorList } from '../../data/exhibitors'
import { SPOTS } from '../../lib/names'
import { img } from '../../lib/images'
import SpotBoothSvg from '../ui/SpotBoothSvg'

/**
 * 參展名單：
 * - 左欄：手機版方格緊接在 Spot X｜ 後方；電腦版方格位於 Spot X｜ 正下方
 *   （預設黑色 #111518，游標經過或已點開對應攤商時變為淺萊姆綠 #e1fbb9）
 * - 右欄：電腦版地點固定於右欄；手機版地點固定於攤商標題的下一列
 */
export default function Exhibitors({ openId, onOpen }) {
  const [hoverId, setHoverId] = useState(null)
  const previewRef = useRef(null)

  // 頁面滾動時立即清除 hover 預覽，徹底消除 Logo 跟隨游標漂浮問題
  useEffect(() => {
    const onScroll = () => setHoverId(null)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const hoveredVendor = exhibitorList.find((e) => e.id === hoverId) || null
  const openedVendor = exhibitorList.find((e) => e.id === openId) || null
  // 確保電腦版點進去攤商時，左邊對應的綠色方格位置依然保留亮起
  const activeSlot = (hoveredVendor || openedVendor)?.slot || null

  const handleMouseMove = (e) => {
    if (!previewRef.current) return
    previewRef.current.style.transform = `translate3d(${e.clientX + 28}px, ${e.clientY - 110}px, 0)`
  }

  const hoverLogoSrc = hoverId ? img(`exhibitors/${hoverId}/logo`) : null

  return (
    <section
      id="exhibitor"
      aria-label="書展夥伴"
      className="scroll-mt-12 min-h-dvh bg-white px-6 py-28 sm:px-12"
      onMouseMove={handleMouseMove}
    >
      <span id="exhibitors" className="sr-only" />
      <div className="mx-auto max-w-[1280px]">
        <h2 className="mb-10 text-display font-bold sm:mb-20">
          <span className="font-explore-en font-bold not-italic">Exhibitors</span>　書展夥伴
        </h2>

        {SPOTS.map((spot) => {
          const list = exhibitorList.filter((e) => e.zone === spot)

          return (
            <div
              key={spot}
              className="grid gap-6 border-t border-ink/15 py-6 md:py-10 md:grid-cols-[13.5rem_1fr] md:gap-x-6"
            >
              {/* 左欄：手機版方格緊接在 Spot X｜ 後方；電腦版位於 Spot X｜ 正下方 */}
              <div className="flex flex-wrap items-center gap-3 self-start md:flex-col md:items-start md:gap-4">
                <p className="shrink-0 text-title font-bold">{spot}｜</p>
                <SpotBoothSvg
                  spot={spot}
                  vendorsInSpot={list}
                  activeSlot={activeSlot}
                  onSelectVendor={onOpen}
                  onHoverVendor={setHoverId}
                />
              </div>

              {/* 右欄：攤商名稱列表（對齊附圖 5 與日程表卡片左緣，右側地區保持獨立欄位不疊字） */}
              <ul>
                {list.map((e) => {
                  const isCurrentActive = (hoverId || openId) === e.id
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onOpen(e.id)}
                        onMouseEnter={() => setHoverId(e.id)}
                        onMouseLeave={() => setHoverId(null)}
                        onFocus={() => setHoverId(e.id)}
                        onBlur={() => setHoverId(null)}
                        className="flex w-full cursor-pointer flex-col items-start gap-y-1 py-2.5 text-left transition-opacity duration-200 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-8"
                        style={{
                          opacity: (hoverId || openId) && !isCurrentActive ? 0.25 : 1,
                        }}
                      >
                        <span className="text-display leading-snug pr-4">{e.name}</span>
                        <span className="shrink-0 text-cap text-ink/60 sm:text-right whitespace-nowrap">
                          ｜{e.origin.join('・')}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      {/* 跟著游標的 Logo 預覽：僅在有上傳 Logo 時顯示；多餘邊緣透明、高寬等比居中自適應（指定攤商特別放大） */}
      {(() => {
        const isEnlarged = hoverId && ['library', 'dmp', 'carp', 'phyllshin', 'jammmm', 'pebbling', 'thingbooks'].includes(hoverId)
        return (
          <div
            ref={previewRef}
            aria-hidden="true"
            className={`pointer-events-none fixed top-0 left-0 z-30 hidden will-change-transform [@media(hover:hover)]:block ${
              isEnlarged ? 'w-52 sm:w-60' : 'w-36 sm:w-40'
            } ${hoverLogoSrc && !openId ? 'opacity-100' : 'opacity-0'}`}
          >
            {hoverLogoSrc && (
              <div className="flex aspect-square w-full items-center justify-center p-1.5">
                <img
                  src={hoverLogoSrc}
                  alt=""
                  className={`max-h-full max-w-full object-contain ${isEnlarged ? 'scale-115' : ''}`}
                />
              </div>
            )}
          </div>
        )
      })()}
    </section>
  )
}
