import { useEffect, useId, useRef, useState } from 'react'

// 直接取自《圖書館_直式海報(印刷)_210_297.ai》stream 1445 (lines 24–41) 的真實擴張金屬網孔貝茲曲線 (Expanded-Metal Spindle Mesh)
const KV_MESH_PATH =
  'M0,0 H18.02 V40.65 H0 Z ' +
  'M13.76,25.02 C14.45,23.46 14.91,21.87 14.88,20.33 C14.85,15.41 10.76,11.36 9.26,5.00 C8.97,5.61 8.65,6.21 8.31,6.80 C7.31,9.77 5.81,12.45 4.36,15.51 C3.67,17.06 3.17,18.68 3.14,20.33 C3.33,24.96 6.57,28.55 8.35,33.92 C8.68,34.49 8.99,35.08 9.27,35.68 C9.33,35.45 9.37,35.21 9.43,34.97 C10.36,31.39 12.32,28.24 13.76,25.02 Z ' +
  'M4.75,4.69 C5.44,3.13 5.90,1.54 5.87,0.00 C5.84,-4.91 1.75,-8.96 0.25,-15.33 C-0.04,-14.72 -0.36,-14.12 -0.70,-13.53 C-1.70,-10.56 -3.20,-7.88 -4.65,-4.82 C-5.34,-3.26 -5.84,-1.65 -5.87,0.00 C-5.68,4.63 -2.44,8.22 -0.66,13.59 C-0.33,14.17 -0.02,14.76 0.26,15.35 C0.32,15.12 0.36,14.88 0.42,14.65 C1.35,11.06 3.31,7.91 4.75,4.69 Z ' +
  'M22.77,4.69 C23.46,3.13 23.92,1.54 23.89,0.00 C23.86,-4.91 19.77,-8.96 18.27,-15.33 C17.98,-14.72 17.66,-14.12 17.32,-13.53 C16.32,-10.56 14.82,-7.88 13.37,-4.82 C12.68,-3.26 12.18,-1.65 12.15,0.00 C12.34,4.63 15.58,8.22 17.36,13.59 C17.69,14.17 18.00,14.76 18.28,15.35 C18.34,15.12 18.38,14.88 18.44,14.65 C19.37,11.06 21.33,7.91 22.77,4.69 Z ' +
  'M4.75,45.34 C5.44,43.78 5.90,42.20 5.87,40.65 C5.84,35.74 1.75,31.69 0.25,25.32 C-0.04,25.94 -0.36,26.53 -0.70,27.12 C-1.70,30.10 -3.20,32.77 -4.65,35.84 C-5.34,37.39 -5.84,39.00 -5.87,40.65 C-5.68,45.28 -2.44,48.88 -0.66,54.25 C-0.33,54.82 -0.02,55.41 0.26,56.01 C0.32,55.77 0.36,55.53 0.42,55.30 C1.35,51.71 3.31,48.57 4.75,45.34 Z ' +
  'M22.77,45.34 C23.46,43.78 23.92,42.20 23.89,40.65 C23.86,35.74 19.77,31.69 18.27,25.32 C17.98,25.94 17.66,26.53 17.32,27.12 C16.32,30.10 14.82,32.77 13.37,35.84 C12.68,37.39 12.18,39.00 12.15,40.65 C12.34,45.28 15.58,48.88 17.36,54.25 C17.69,54.82 18.00,55.41 18.28,56.01 C18.34,55.77 18.38,55.53 18.44,55.30 C19.37,51.71 21.33,48.57 22.77,45.34 Z'

/**
 * 區段過渡：主視覺擴張金屬網紋 + 滾動視差與漸層過渡動畫
 * - fromBg: 上一區段底色
 * - toBg: 下一區段底色
 * - variant: 'hero' (扉頁至遮蔭廣場) | 'light' (一般白底/淺底區段間)
 */
export default function MeshTransition({
  fromBg = '#eceeef',
  toBg = '#5d7a90',
  variant = 'light',
}) {
  const uid = useId().replace(/:/g, '')
  const wrapRef = useRef(null)
  const [prog, setProg] = useState(0.5)

  useEffect(() => {
    let rafId = null
    const update = () => {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      // 當元素從畫面底部進入 (0) 到離開畫面頂部 (1)
      const p = 1 - (rect.top + rect.height * 0.5) / (vh + rect.height)
      setProg(Math.max(0, Math.min(1, p)))
    }
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // 隨滾動產生雙層擴張網的錯位視差與張開感
  const shiftA = (prog - 0.5) * 44
  const shiftB = (0.5 - prog) * 32
  const scaleY = 0.92 + Math.sin(prog * Math.PI) * 0.16

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{
        background: `linear-gradient(to bottom, ${fromBg} 0%, ${fromBg} 28%, ${toBg} 72%, ${toBg} 100%)`,
      }}
      className={`relative z-0 w-full overflow-hidden select-none ${
        variant === 'hero' ? 'h-36 sm:h-44' : 'h-24 sm:h-28'
      }`}
    >
      <svg
        className="h-full w-full"
        preserveAspectRatio="none"
        style={{
          transform: `scaleY(${scaleY.toFixed(3)})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          {/* 第一層：主視覺灰藍擴張網紋 */}
          <pattern
            id={`kv-mesh-a-${uid}`}
            width="18.02"
            height="40.65"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${shiftA.toFixed(1)}, ${(shiftA * 0.45).toFixed(1)})`}
          >
            <path
              d={KV_MESH_PATH}
              fillRule="evenodd"
              fill={variant === 'hero' ? '#98a8b5' : '#b7c2cb'}
              fillOpacity={variant === 'hero' ? '0.52' : '0.42'}
            />
          </pattern>

          {/* 第二層：微斜向交疊的薄荷/冰藍副網紋（隨滾動反向滑移，形成主視覺疊網動態感） */}
          <pattern
            id={`kv-mesh-b-${uid}`}
            width="18.02"
            height="40.65"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${shiftB.toFixed(1)}, ${(-shiftB * 0.6).toFixed(1)}) rotate(-12)`}
          >
            <path
              d={KV_MESH_PATH}
              fillRule="evenodd"
              fill={variant === 'hero' ? '#63d2a7' : '#8da0af'}
              fillOpacity={variant === 'hero' ? '0.28' : '0.22'}
            />
          </pattern>

          {/* 上下柔化漸層遮罩，讓擴張網自然浮現與消融，不產生生硬切線 */}
          <linearGradient id={`kv-fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="22%" stopColor="white" stopOpacity="1" />
            <stop offset="78%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id={`kv-mask-${uid}`}>
            <rect width="100%" height="100%" fill={`url(#kv-fade-${uid})`} />
          </mask>
        </defs>

        <g mask={`url(#kv-mask-${uid})`}>
          <rect width="100%" height="100%" fill={`url(#kv-mesh-a-${uid})`} />
          <rect width="100%" height="100%" fill={`url(#kv-mesh-b-${uid})`} />
        </g>
      </svg>
    </div>
  )
}
