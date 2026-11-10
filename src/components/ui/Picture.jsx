import { img } from '../../lib/images'
import { EXPLORE_TILES } from './ExploreLogotype'

function getTileIndex(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % EXPLORE_TILES.length
}

/**
 * 圖片或 placeholder。path 對應 src/assets/images/ 下的檔案（不含副檔名）。
 * 放入對應檔名的圖片後會自動取代 placeholder。
 * 未放圖時以 EXPLORE 標準字幾何圖樣與品牌色磚塊呈現。
 */
export default function Picture({ path, label, ratio = '3 / 4', className = '', align = 'center' }) {
  const src = img(path)
  const tile = EXPLORE_TILES[getTileIndex(label || path)]
  const justifyClass = align === 'left' ? 'justify-start' : 'justify-center'
  const imgMarginClass = align === 'left' ? 'm-0 mr-auto' : 'm-auto'
  const objectPosClass = align === 'left' ? 'object-left' : 'object-center'

  return (
    <div
      className={`relative flex items-center ${justifyClass} bg-transparent ${className}`}
      style={ratio && ratio !== 'auto' ? { aspectRatio: ratio } : {}}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className={`max-h-full max-w-full w-auto h-auto object-contain ${objectPosClass} pointer-events-none select-none ${imgMarginClass}`}
        />
      ) : (
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden p-2 select-none"
          style={{ backgroundColor: tile.bg }}
        >
          {/* EXPLORE 標準字幾何十字向量圖樣水印（無任何多餘文字標籤） */}
          <svg
            viewBox="0 0 72.01 87.54"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto h-[88%] w-[88%] opacity-35"
          >
            <path d={tile.d} fill={tile.fg} fillRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}
