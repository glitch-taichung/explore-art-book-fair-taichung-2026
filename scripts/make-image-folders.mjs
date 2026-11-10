// 依最新資料建立／更新圖片資料夾與放圖說明：node scripts/make-image-folders.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exhibitorList } from '../src/data/exhibitors.js'
import { schedule } from '../src/data/schedule.js'

const ROOT = fileURLToPath(new URL('../src/assets/images/', import.meta.url))

const put = (dir, file, text) => {
  mkdirSync(join(ROOT, dir), { recursive: true })
  const p = join(ROOT, dir, file)
  writeFileSync(p, text)
}

// 1. 書商／飲食（共 30 組資料夾）
for (const e of exhibitorList) {
  const items = e.kind === 'food' ? e.menu || [] : e.books || []
  const n = Math.max(items.length, 3)
  const lines = items.map((it, i) => {
    const num = String(i + 1).padStart(2, '0')
    const name = typeof it === 'string' ? it : `《${it.name}》${it.by ? `（${it.by}）` : ''}`
    return `  books/${num}.jpg（或 book${num}.jpg）   ← 第 ${i + 1} 項：${name}`
  })

  put(
    `exhibitors/${e.id}`,
    '放圖說明.txt',
    `【${e.zone}】${e.name}（資料夾代號：${e.id}）

1. 攤位代表圖與 Logo（直接放在此資料夾 exhibitors/${e.id}/ 下）：
  cover.jpg        攤位代表圖（參展名單游標滑過時預覽用，建議直式 3:4，寬約 600–800px）
  logo.png         攤商內頁右側主圖／Logo（支援 .png / .jpg / .webp；若放 logo.pdf，執行 npm run build 會自動轉為 logo.png）

2. ${e.kind === 'food' ? '餐點' : '選書'}圖片（放在子資料夾 exhibitors/${e.id}/books/ 下）：
${lines.length ? lines.join('\n') : `  （選書清單尚未提供，預計放 books/01.jpg ~ books/0${n}.jpg）`}

3. 單本書若要使用「兩張圖片並排 ＋ 文字繞圖」版式：
  只要將該本書的圖片拆成兩張放入 books/ 資料夾即可自動切換為並排文繞圖！
  例如第 1 本書放兩張圖：
    books/01-1.jpg  ＋  books/01-2.jpg
    （或命名為 books/book01-1.jpg ＋ books/book01-2.jpg 亦可）

4. 支援副檔名：
  .jpg / .jpeg / .png / .webp / .avif（大小寫皆可，無需修改程式碼，放進資料夾即自動生效！）
`
  )
  mkdirSync(join(ROOT, `exhibitors/${e.id}/books`), { recursive: true })
}

// 2. 節目（共 23 場活動資料夾）
for (const s of schedule) {
  put(
    `programs/${s.id}`,
    '放圖說明.txt',
    `【${s.date} ${s.start}–${s.end}】${s.title}（資料夾代號：${s.id}｜地點：${s.venue}）

直接放在此資料夾 programs/${s.id}/ 下：
  cover.jpg        節目主圖（展開活動日程「閱讀更多 ＋」時於左側顯示，橫式 3:2，建議寬 1200px）
  speaker.jpg      講者照片（展開活動日程時於右欄顯示，正方形 1:1，建議寬 400px；多位講者可用合照）

支援副檔名：.jpg / .jpeg / .png / .webp / .avif（放進資料夾即自動取代灰色 Placeholder）
`
  )
}

// 3. 其他
put(
  'hero',
  '放圖說明.txt',
  `扉頁／社群分享（OG）與首頁相關圖片：
  og.jpg           社群分享預覽圖（建議 1200×630）
  ig/01.jpg ~ 08.jpg  底部資訊區 IG 精選貼文縮圖
`
)
put('venue', '放圖說明.txt', '場地照片、交通示意圖放這裡。\n')
put(
  'speakers',
  '放圖說明.txt',
  '論壇講者備用肖像資料夾（各節目展開圖請優先放入 programs/<節目id>/speaker.jpg）。\n'
)

console.log('✔ 所有放圖說明.txt 已更新完成！')
