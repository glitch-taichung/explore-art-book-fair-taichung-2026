#!/usr/bin/env node
/**
 * 自動圖片轉檔與最佳化腳本（使用 macOS 內建原生 sips，免額外安裝任何套件）
 * 執行：npm run optimize:images（或於 npm run build 時自動執行）
 * 作用：
 * 1. 若資料夾內放入 .pdf（例如 logo.pdf），自動轉出同名的 .png 供網頁顯示
 * 2. 遍歷 src/assets/images 下的所有圖片，依據版位自動縮放至最佳尺寸並壓縮品質（~82%），避免大圖拖慢網站載入速度
 */
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

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
  if (
    filePath.includes('/speakers/') ||
    filePath.endsWith('/speaker.jpg') ||
    filePath.endsWith('/speaker.png')
  ) {
    return 400 // 講者頭像 1:1
  }
  if (filePath.includes('/books/')) {
    return 900 // 選書 / 餐點
  }
  if (filePath.endsWith('/cover.jpg') || filePath.endsWith('/cover.png')) {
    return filePath.includes('/programs/') ? 1200 : 800 // 節目大圖 1200，攤位封面 800
  }
  return 1200 // 預設最大 1200px
}

function optimizeImage(filePath) {
  const maxDim = getTargetDimension(filePath)
  const ext = extname(filePath).toLowerCase()
  const statBefore = statSync(filePath)

  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', filePath], {
      encoding: 'utf8',
    })
    const wMatch = out.match(/pixelWidth:\s*(\d+)/)
    const hMatch = out.match(/pixelHeight:\s*(\d+)/)
    const currentMax = Math.max(
      wMatch ? parseInt(wMatch[1], 10) : 0,
      hMatch ? parseInt(hMatch[1], 10) : 0
    )

    if (currentMax > maxDim || statBefore.size > 250 * 1024) {
      const args = []
      if (currentMax > maxDim) {
        args.push('-Z', String(maxDim))
      }
      if (ext === '.jpg' || ext === '.jpeg') {
        args.push('-s', 'formatOptions', '82')
      }
      if (args.length > 0) {
        execFileSync('sips', [...args, filePath], { stdio: 'ignore' })
        const statAfter = statSync(filePath)
        const saved = ((statBefore.size - statAfter.size) / 1024).toFixed(1)
        const rel = filePath.replace(ROOT + '/', '')
        if (statBefore.size > statAfter.size) {
          console.log(
            `✔ 最佳化 ${rel}：${(statBefore.size / 1024).toFixed(1)} KB → ${(statAfter.size / 1024).toFixed(1)} KB (-${saved} KB)`
          )
        }
      }
    }
  } catch (err) {
    console.error(`✘ 壓縮失敗 ${filePath}:`, err.message)
  }
}

console.log('🚀 開始檢查與最佳化圖片...')
convertPdfsToPng(ROOT)
const images = findImages(ROOT)
for (const img of images) {
  optimizeImage(img)
}
console.log(`✨ 完成！共檢查 ${images.length} 張圖片。`)
