// 原版遮蔭廣場地圖 (MapSection) 中各 Spot 的真實幾何傾斜排列與仿射座標轉換
// 直接抓自原先地圖各區 (Spot 1–5) 的傾斜矩形配置，保留 18.3° 建築斜角與雙排/單排錯位
const OLD = { o: [85, 45], a: [590, 90], b: [25, 390] }
const NEW = { o: [300, 40], a: [650, 215], b: [-230, 380] }
const DET = OLD.a[0] * OLD.b[1] - OLD.a[1] * OLD.b[0]

function T(x, y) {
  const dx = x - OLD.o[0]
  const dy = y - OLD.o[1]
  const u = (dx * OLD.b[1] - dy * OLD.b[0]) / DET
  const v = (OLD.a[0] * dy - OLD.a[1] * dx) / DET
  return [
    NEW.o[0] + u * NEW.a[0] + v * NEW.b[0],
    NEW.o[1] + u * NEW.a[1] + v * NEW.b[1],
  ]
}

export const ANGLE_DEG = Math.atan2(NEW.a[1], NEW.a[0]) * (180 / Math.PI)
const ANGLE_RAD = Math.atan2(NEW.a[1], NEW.a[0])
export const BOOTH_W = 18
export const BOOTH_H = 11

const RAW_SLOTS = {
  'Spot 1': Array.from({ length: 9 }, (_, i) => [375 + i * 22, 346 + i * 4]),
  'Spot 2': Array.from({ length: 5 }, (_, i) => [650 - i * 4, 218 + i * 19]),
  'Spot 3': Array.from({ length: 6 }, (_, i) => [499 + (i % 3) * 40, 182 + Math.floor(i / 3) * 16]),
  'Spot 4': Array.from({ length: 4 }, (_, i) => [321 + i * 32, 150]),
  'Spot 5': Array.from({ length: 6 }, (_, i) => [202 + (i % 3) * 38, 245 + Math.floor(i / 3) * 16]),
}

const SPOT_PREFIX = {
  'Spot 1': '1',
  'Spot 2': '2',
  'Spot 3': '3',
  'Spot 4': '4',
  'Spot 5': '5',
}

export const SPOT_SHAPES = Object.fromEntries(
  Object.entries(RAW_SLOTS).map(([spot, pts]) => {
    const prefix = SPOT_PREFIX[spot]
    const cos = Math.cos(ANGLE_RAD)
    const sin = Math.sin(ANGLE_RAD)
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    const rects = pts.map(([ox, oy], i) => {
      const [tx, ty] = T(ox, oy)
      const corners = [
        [0, 0],
        [BOOTH_W, 0],
        [BOOTH_W, BOOTH_H],
        [0, BOOTH_H],
      ]
      for (const [cx, cy] of corners) {
        const rx = tx + cx * cos - cy * sin
        const ry = ty + cx * sin + cy * cos
        if (rx < minX) minX = rx
        if (ry < minY) minY = ry
        if (rx > maxX) maxX = rx
        if (ry > maxY) maxY = ry
      }
      return {
        slotKey: `${prefix}-${i + 1}`,
        index: i + 1,
        x: tx,
        y: ty,
      }
    })

    const pad = 3
    const vbX = minX - pad
    const vbY = minY - pad
    const vbW = maxX - minX + pad * 2
    const vbH = maxY - minY + pad * 2

    return [
      spot,
      {
        rects,
        viewBox: `${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`,
        width: vbW,
        height: vbH,
      },
    ]
  })
)

export default function SpotBoothSvg({
  spot,
  vendorsInSpot = [],
  activeSlot = null,
  onSelectVendor,
  onHoverVendor,
  scale = 0.78,
}) {
  const shape = SPOT_SHAPES[spot]
  if (!shape) return null

  return (
    <svg
      viewBox={shape.viewBox}
      aria-label={`${spot} 攤位方格排列`}
      style={{
        width: `${Math.round(shape.width * scale)}px`,
        height: `${Math.round(shape.height * scale)}px`,
      }}
      className="shrink-0 overflow-visible"
    >
      {shape.rects.map((r) => {
        const isGreen = activeSlot === r.slotKey
        const slotVendors = vendorsInSpot.filter((v) => v.slot === r.slotKey)
        const firstVendor = slotVendors[0]
        const titleText = slotVendors.map((v) => v.name).join(' ／ ')

        return (
          <g
            key={r.slotKey}
            role={onSelectVendor ? 'button' : undefined}
            tabIndex={onSelectVendor ? 0 : undefined}
            aria-label={`${r.slotKey} ${titleText}`}
            onClick={() => onSelectVendor && firstVendor && onSelectVendor(firstVendor.id)}
            onKeyDown={(ev) => {
              if ((ev.key === 'Enter' || ev.key === ' ') && onSelectVendor && firstVendor) {
                ev.preventDefault()
                onSelectVendor(firstVendor.id)
              }
            }}
            onMouseEnter={() => onHoverVendor && firstVendor && onHoverVendor(firstVendor.id)}
            onMouseLeave={() => onHoverVendor && onHoverVendor(null)}
            className={onSelectVendor ? 'cursor-pointer outline-none' : ''}
          >
            <title>{`${r.slotKey}：${titleText}`}</title>
            <rect
              x={r.x}
              y={r.y}
              width={BOOTH_W}
              height={BOOTH_H}
              transform={`rotate(${ANGLE_DEG} ${r.x} ${r.y})`}
              fill={isGreen ? '#e1fbb9' : '#111518'}
              stroke="#111518"
              strokeWidth={isGreen ? '1.1' : '0'}
              className="transition-colors duration-150"
            />
          </g>
        )
      })}
    </svg>
  )
}
