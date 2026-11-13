#!/usr/bin/env node
/**
 * 自動圖片轉檔與最佳化腳本（使用 macOS 內建原生 sips，免額外安裝任何套件）
 * 執行：npm run optimize:images（或於 npm run build 時自動執行）
 * 作用：
 * 1. 若資料夾內放入 .pdf（例如 logo.pdf），自動轉出同名的 .png 供網頁顯示
 * 2. 遍歷 src/assets/images 下的所有圖片，依據版位自動縮放至最佳尺寸並壓縮品質（~82%），避免大圖拖慢網站載入速度
 * 3. 自動偵測無透明度的相片 PNG 轉為輕量 JPG，大幅減少傳輸流量
 */
import { readdirSync, statSync, existsSync, unlinkSync, copyFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const ROOT = fileURLToPath(new URL('../src/assets/images', import.meta.url))
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png'])

function convertPdfsToPng(dir) {
  try {
    const list = readdirSync(dir)
    for (const file of list) {
      const fullPath = join(dir, file)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        convertPdfsToPng(fullPath)
      } else if (extname(file).toLowerCase() === '.pdf') {
        const pngPath = fullPath.replace(/\.pdf$/i, '.png')
        if (!existsSync(pngPath)) {
          try {
            execFileSync('sips', ['-s', 'format', 'png', fullPath, '--out', pngPath], {
              stdio: 'ignore',
            })
            const rel = pngPath.replace(ROOT + '/', '')
            console.log(`✔ 自動將 PDF 轉為 PNG：${rel}`)
          } catch (err) {
            console.error(`✘ PDF 轉檔失敗 ${fullPath}:`, err.message)
          }
        }
      }
    }
  } catch {
    // skip unreadable
  }
}

function findImages(dir) {
  let results = []
  try {
    const list = readdirSync(dir)
    for (const file of list) {
      const fullPath = join(dir, file)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        results = results.concat(findImages(fullPath))
      } else if (EXTENSIONS.has(extname(file).toLowerCase())) {
        results.push(fullPath)
      }
    }
  } catch {
    // skip unreadable
  }
  return results
}

function getTargetDimension(filePath) {
  const lower = filePath.toLowerCase()
  if (
    lower.includes('/speakers/') ||
    lower.endsWith('/speaker.jpg') ||
    lower.endsWith('/speaker.png')
  ) {
    return 400 // 講者頭像 1:1
  }
  if (lower.includes('/hero/ig/')) {
    return 720 // IG 卡片最大顯示寬度 ~256px，720px 足夠 2.8x Retina
  }
  if (lower.includes('logo')) {
    return 600 // Logo 顯示尺寸通常在 80~160px，600px 足供 3x Retina 清晰呈現
  }
  if (lower.includes('/books/')) {
    return 900 // 選書 / 餐點
  }
  if (lower.endsWith('/cover.jpg') || lower.endsWith('/cover.png')) {
    return lower.includes('/programs/') ? 1200 : 800 // 節目大圖 1200，攤位封面 800
  }
  return 1200 // 預設最大 1200px
}

function optimizeImage(filePath) {
  const maxDim = getTargetDimension(filePath)
  const ext = extname(filePath).toLowerCase()
  const statBefore = statSync(filePath)
  const tempOut = join(tmpdir(), `opt_${Date.now()}_${Math.random().toString(36).slice(2)}` + (ext === '.png' ? '.jpg' : ext))

  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'hasAlpha', filePath], {
      encoding: 'utf8',
    })
    const wMatch = out.match(/pixelWidth:\s*(\d+)/)
    const hMatch = out.match(/pixelHeight:\s*(\d+)/)
    const alphaMatch = out.match(/hasAlpha:\s*(yes|no)/i)

    const w = wMatch ? parseInt(wMatch[1], 10) : 0
    const h = hMatch ? parseInt(hMatch[1], 10) : 0
    const currentMax = Math.max(w, h)
    const hasAlpha = alphaMatch ? alphaMatch[1].toLowerCase() === 'yes' : false
    const isLogo = filePath.toLowerCase().includes('logo')

    // 情況 A：PNG 照片轉為輕量 JPG
    // 包含：無透明度、或者不是 Logo 且檔案 > 250KB 的矩形相片（避免無謂佔用 1~2MB 頻寬）
    if (ext === '.png' && !isLogo && (!hasAlpha || statBefore.size > 250 * 1024)) {
      const jpgPath = filePath.replace(/\.png$/i, '.jpg')
      const args = ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82']
      if (currentMax > maxDim) {
        args.push('-Z', String(maxDim))
      }
      args.push(filePath, '--out', tempOut)
      execFileSync('sips', args, { stdio: 'ignore' })

      if (existsSync(tempOut)) {
        const statNew = statSync(tempOut)
        // 只有節省至少 25% 且檔案真的縮小時才轉檔
        if (statNew.size < statBefore.size * 0.75) {
          copyFileSync(tempOut, jpgPath)
          unlinkSync(filePath) // 移除原始龐大 PNG
          try { unlinkSync(tempOut) } catch {}
          const rel = filePath.replace(ROOT + '/', '')
          const saved = ((statBefore.size - statNew.size) / 1024).toFixed(1)
          console.log(`✔ PNG轉JPG ${rel}：${(statBefore.size / 1024).toFixed(1)} KB → ${(statNew.size / 1024).toFixed(1)} KB (-${saved} KB)`)
          return
        }
        try { unlinkSync(tempOut) } catch {}
      }
    }

    // 情況 B：PNG 帶透明度但尺寸過大，縮小至 maxDim
    if (ext === '.png' && currentMax > maxDim) {
      execFileSync('sips', ['-Z', String(maxDim), filePath, '--out', tempOut], { stdio: 'ignore' })
      if (existsSync(tempOut)) {
        const statNew = statSync(tempOut)
        if (statNew.size < statBefore.size) {
          copyFileSync(tempOut, filePath)
          const rel = filePath.replace(ROOT + '/', '')
          const saved = ((statBefore.size - statNew.size) / 1024).toFixed(1)
          console.log(`✔ 縮小透明PNG ${rel}：${(statBefore.size / 1024).toFixed(1)} KB → ${(statNew.size / 1024).toFixed(1)} KB (-${saved} KB)`)
        }
        try { unlinkSync(tempOut) } catch {}
      }
      return
    }

    // 情況 C：JPG / JPEG 圖片（若過大縮小，或未最佳化品質者壓縮至 ~82%）
    if (ext === '.jpg' || ext === '.jpeg') {
      const args = ['-s', 'formatOptions', '82']
      if (currentMax > maxDim) {
        args.push('-Z', String(maxDim))
      }
      args.push(filePath, '--out', tempOut)
      execFileSync('sips', args, { stdio: 'ignore' })

      if (existsSync(tempOut)) {
        const statNew = statSync(tempOut)
        // 只有省下超過 10KB 且檔案確實變小時才替換
        if (statNew.size + 10240 < statBefore.size) {
          copyFileSync(tempOut, filePath)
          const rel = filePath.replace(ROOT + '/', '')
          const saved = ((statBefore.size - statNew.size) / 1024).toFixed(1)
          console.log(`✔ 壓縮JPG ${rel}：${(statBefore.size / 1024).toFixed(1)} KB → ${(statNew.size / 1024).toFixed(1)} KB (-${saved} KB)`)
        }
        try { unlinkSync(tempOut) } catch {}
      }
    }
  } catch (err) {
    console.error(`✘ 壓縮失敗 ${filePath}:`, err.message)
    try { unlinkSync(tempOut) } catch {}
  }
}

console.log('🚀 開始檢查與最佳化圖片...')
convertPdfsToPng(ROOT)
const images = findImages(ROOT)
for (const img of images) {
  optimizeImage(img)
}
console.log(`✨ 完成！共檢查 ${images.length} 張圖片。`)
