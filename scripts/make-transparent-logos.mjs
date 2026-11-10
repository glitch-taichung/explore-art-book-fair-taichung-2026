import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { deflateSync } from 'node:zlib'

function makeCrcTable() {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[n] = c
  }
  return table
}
const CRC_TABLE = makeCrcTable()

function crc32(buf) {
  let crc = 0 ^ (-1)
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF]
  }
  return (crc ^ (-1)) >>> 0
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const toCrc = Buffer.concat([typeBuf, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(toCrc), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgbaBuffer) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width(4), height(4), bitDepth(1)=8, colorType(1)=6 (RGBA), comp(1)=0, filter(1)=0, interlace(1)=0
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8
  ihdrData[9] = 6
  ihdrData[10] = 0
  ihdrData[11] = 0
  ihdrData[12] = 0
  const ihdrChunk = makeChunk('IHDR', ihdrData)

  // Scanlines with filter byte 0
  const rowLen = 1 + width * 4
  const rawData = Buffer.alloc(height * rowLen)
  for (let y = 0; y < height; y++) {
    const rawOffset = y * rowLen
    rawData[rawOffset] = 0 // None filter
    const srcOffset = y * width * 4
    rgbaBuffer.copy(rawData, rawOffset + 1, srcOffset, srcOffset + width * 4)
  }

  const idatData = deflateSync(rawData, { level: 9 })
  const idatChunk = makeChunk('IDAT', idatData)
  const iendChunk = makeChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk])
}

export function removeWhiteBackground(srcImagePath, destPngPath, threshold = 238) {
  const tmpBmp = '/tmp/_tmp_logo.bmp'
  execFileSync('sips', ['-s', 'format', 'bmp', srcImagePath, '--out', tmpBmp], { stdio: 'ignore' })
  const bmp = readFileSync(tmpBmp)

  const offset = bmp.readUInt32LE(10)
  const width = Math.abs(bmp.readInt32LE(18))
  const rawHeight = bmp.readInt32LE(22)
  const height = Math.abs(rawHeight)
  const isTopDown = rawHeight < 0
  const rowSize = Math.ceil((width * 3) / 4) * 4

  const rgba = Buffer.alloc(width * height * 4)

  for (let y = 0; y < height; y++) {
    const bmpRow = isTopDown ? y : (height - 1 - y)
    const rowOffset = offset + bmpRow * rowSize
    for (let x = 0; x < width; x++) {
      const b = bmp[rowOffset + x * 3]
      const g = bmp[rowOffset + x * 3 + 1]
      const r = bmp[rowOffset + x * 3 + 2]

      const minVal = Math.min(r, g, b)
      let outR = r
      let outG = g
      let outB = b
      let outA = 255

      if (minVal >= threshold) {
        outA = 0
      } else if (minVal > threshold - 40) {
        // Linear antialiasing
        const factor = (threshold - minVal) / 40 // 0 near threshold, 1 near threshold-40
        outA = Math.round(255 * factor)
        // Defringe white halo: C_unwhite = (C - 255*(1-alpha)) / alpha
        const aNorm = outA / 255
        outR = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - aNorm)) / aNorm)))
        outG = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - aNorm)) / aNorm)))
        outB = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - aNorm)) / aNorm)))
      }

      const destIdx = (y * width + x) * 4
      rgba[destIdx] = outR
      rgba[destIdx + 1] = outG
      rgba[destIdx + 2] = outB
      rgba[destIdx + 3] = outA
    }
  }

  const pngBuffer = encodePng(width, height, rgba)
  writeFileSync(destPngPath, pngBuffer)
  console.log(`✔ 成功去背並輸出至：${destPngPath} (${width}x${height})`)
}

// 執行指定名單
const LOGO_TARGETS = [
  { id: 'weightbooks', folder: 'src/assets/images/exhibitors/weightbooks' },
  { id: 'zitdim', folder: 'src/assets/images/exhibitors/zitdim' },
  { id: 'phyllshin', folder: 'src/assets/images/exhibitors/phyllshin' },
  { id: 'papaya', folder: 'src/assets/images/exhibitors/papaya' },
  { id: 'nodate', folder: 'src/assets/images/exhibitors/nodate' },
  { id: 'carp', folder: 'src/assets/images/exhibitors/carp' },
  { id: 'spec', folder: 'src/assets/images/exhibitors/spec' },
  { id: 'jammmm', folder: 'src/assets/images/exhibitors/jammmm' },
  { id: 'library', folder: 'src/assets/images/exhibitors/library' },
]

for (const item of LOGO_TARGETS) {
  const dir = item.folder
  // 找出來源圖：優先找 logo.jpg / logo.png 或資料夾內的原始 logo
  let src = null
  const candidates = [
    join(dir, 'logo.jpg'),
    join(dir, 'logo.png'),
    join(dir, '重本logo.jpg'),
    join(dir, '節點_標準字.jpg'),
    join(dir, 'Phyllshin Books_LOGO.png'),
    join(dir, 'Nomad papaya books logo-06.jpg'),
    join(dir, '野点LOGO.jpg'),
    join(dir, 'Carp_Gallery_guideline_OL (1) (1).png'),
    join(dir, 'SPEC-LOGO.jpg'),
    join(dir, 'jammm_LOGO-03.jpg'),
    join(dir, '市圖TPL Logo使用規範.png'),
  ]
  for (const c of candidates) {
    if (existsSync(c)) {
      src = c
      break
    }
  }
  if (!src) {
    console.warn(`✘ 找不到來源圖：${dir}`)
    continue
  }

  const destPng = join(dir, 'logo.png')
  removeWhiteBackground(src, destPng)

  // 若資料夾內存在 logo.jpg，將其備份移除避免幹擾 Vite 的 png 優先載入
  const jpgPath = join(dir, 'logo.jpg')
  if (existsSync(jpgPath) && jpgPath !== destPng) {
    try {
      unlinkSync(jpgPath)
      console.log(`  (已移除舊有 logo.jpg，統一使用透明 logo.png)`)
    } catch {
      // ignore
    }
  }
}
