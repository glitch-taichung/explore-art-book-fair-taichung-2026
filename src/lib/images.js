// 圖片載入：依資料夾慣例找圖，找不到就回傳 null（畫面改顯示 placeholder）
// 放圖位置：src/assets/images/<分類>/<id>/<檔名>.(jpg|jpeg|png|webp|avif)
const files = import.meta.glob(
  '../assets/images/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  }
)

// 建立不分大小寫與 Unicode 規範化 (NFC / NFD) 的索引表
const normalizedMap = new Map()
for (const [k, url] of Object.entries(files)) {
  const lower = k.toLowerCase()
  normalizedMap.set(lower, url)
  normalizedMap.set(lower.normalize('NFC'), url)
  normalizedMap.set(lower.normalize('NFD'), url)
}

const EXT = ['webp', 'png', 'jpg', 'jpeg', 'avif']

/**
 * 產生候選路徑（容許使用者命名為 01.jpg 或 book01.jpg、01-1.jpg 或 book01-1.jpg / 01_1.jpg）
 */
function buildCandidatePaths(path) {
  const candidates = [path]

  // 跨日活動共用圖片與代表圖別名處理（含 speakers/ 資料夾）
  if (path.startsWith('programs/') || path.startsWith('speakers/')) {
    if (path.includes('forum/cover')) {
      candidates.push('programs/forum/hero')
    }
    if (path.includes('fair-d2/cover')) {
      candidates.push(
        'programs/fair-d2/(IG)第二篇貼文_01',
        'programs/fair-d1/(IG)第二篇貼文_01',
        'programs/fair-d1/cover',
        'programs/fair-d1/(IG)第二篇貼文_02'
      )
    }
    if (path.includes('fair-d1/cover')) {
      candidates.push(
        'programs/fair-d1/(IG)第二篇貼文_01',
        'programs/fair-d1/cover',
        'programs/fair-d1/(IG)第二篇貼文_02'
      )
    }
    if (path.includes('tour-2/cover')) {
      candidates.push('programs/tour-1/cover')
    }
    if (path.includes('tour-1/cover') || path.includes('tour-2/cover')) {
      candidates.push('programs/tour-1/(IG)第二篇貼文_05', 'programs/tour-1/LSZ_1935')
    }
    if (path.includes('woodbook-2/cover')) {
      candidates.push('programs/woodbook-1/cover')
    }
    if (path.includes('woodbook-1/cover') || path.includes('woodbook-2/cover')) {
      candidates.push('programs/woodbook-1/木頭書示意圖-白底', 'programs/woodbook-1/個人照')
    }
    if (path.includes('woodbook-1/speaker') || path.includes('woodbook-2/speaker')) {
      candidates.push('programs/woodbook-1/個人照')
    }
    if (path.includes('riso-2/')) {
      candidates.push(path.replace('riso-2/', 'riso-1/'))
    }
    if (path.includes('salon-1/cover') || path.includes('salon-1/speaker')) {
      candidates.push('speakers/葉忠宜', 'programs/salon-1/speaker', 'exhibitors/weightbooks/logo')
    }
    if (path.includes('salon-2/cover') || path.includes('salon-2/speaker')) {
      candidates.push('speakers/方序中', 'programs/salon-2/speaker')
    }
    if (path.includes('salon-3/cover') || path.includes('salon-3/logo')) {
      candidates.push('programs/salon-3/PRNDL.art_logo_Orange-04', 'exhibitors/prndl/logo')
    }
    if (path.includes('salon-3/speaker')) {
      candidates.push('programs/salon-3/485150682_1056985363132517_6258137980177119903_n')
    }
    if (path.includes('salon-3/space')) {
      candidates.push('programs/salon-3/Screenshot 2026-11-09 at 23.55.16')
    }
    if (path.includes('salon-4/cover') || path.includes('salon-4/space')) {
      candidates.push('programs/salon-4/514363713_30897865573138198_7149075680617061588_n')
    }
    if (path.includes('salon-4/logo') || path.includes('salon-4/speaker')) {
      candidates.push('programs/salon-4/本冊', 'programs/salon-4/logo', 'exhibitors/artqpie/logo', 'exhibitors/artqpie/本冊logo')
    }
    if (path.includes('salon-6/logo')) {
      candidates.push('exhibitors/nodate/logo')
    }
    if (path.includes('silent-party/cover') || path.includes('silent-party/speaker')) {
      candidates.push('speakers/賓哥', 'programs/silent-party/speaker')
    }
    if (path.includes('opening/cover')) {
      candidates.push('speakers/一週年館慶表演者', 'programs/opening/cover')
    }
    if (path.includes('forum/moderator')) {
      candidates.push('speakers/huangyihsuan', 'programs/forum/moderator')
    }
    if (path.includes('forum/speaker-1')) {
      candidates.push('speakers/oh jonggil', 'programs/forum/speaker-1')
    }
    if (path.includes('forum/speaker-2')) {
      candidates.push('speakers/yiyao_crop', 'programs/forum/speaker-2')
    }
    if (path.includes('forum/speaker-3')) {
      candidates.push('speakers/renneting', 'programs/forum/speaker-3')
    }
  }

  // 攤商 Logo 與飲食攤別名處理
  if (path.startsWith('exhibitors/')) {
    if (path.includes('narcos/logo')) {
      candidates.push('exhibitors/narcos/20201125-logo-03', 'exhibitors/narcos/logo')
    }
    if (path.includes('narcos/cover')) {
      candidates.push(
        'exhibitors/narcos/books/NARCOS.SUGAR-01',
        'exhibitors/narcos/books/過往擺攤照（會再重新配置）'
      )
    }
    if (path.includes('narcos/books/01')) {
      candidates.push('exhibitors/narcos/books/三分糖肉桂捲')
    }
    if (path.includes('narcos/books/02')) {
      candidates.push('exhibitors/narcos/books/馬告可可司康_香料堅果醬')
    }
    if (path.includes('narcos/books/03')) {
      candidates.push('exhibitors/narcos/books/無麩質 白玉抹茶巴斯克')
    }
    if (path.includes('narcos/books/04')) {
      candidates.push('exhibitors/narcos/books/無麩質 檸香原味巴斯克')
    }
    if (path.includes('narcos/books/05')) {
      candidates.push('exhibitors/narcos/books/NARCOS.SUGAR-01')
    }
    if (path.includes('narcos/books/06')) {
      candidates.push('exhibitors/narcos/books/過往擺攤照（會再重新配置）')
    }
    if (path.includes('weightbooks/logo')) {
      candidates.push('exhibitors/weightbooks/重本logo', 'exhibitors/weightbooks/logo')
    }
    if (path.includes('zitdim/logo')) {
      candidates.push('exhibitors/zitdim/節點_標準字', 'exhibitors/zitdim/logo')
    }
    if (path.includes('phyllshin/logo')) {
      candidates.push('exhibitors/phyllshin/Phyllshin Books_LOGO', 'exhibitors/phyllshin/logo')
    }
    if (path.includes('papaya/logo')) {
      candidates.push('exhibitors/papaya/Nomad papaya books logo-06', 'exhibitors/papaya/logo')
    }
    if (path.includes('nodate/logo')) {
      candidates.push('exhibitors/nodate/野点LOGO', 'exhibitors/nodate/logo')
    }
    if (path.includes('carp/logo')) {
      candidates.push('exhibitors/carp/Carp_Gallery_guideline_OL (1) (1)', 'exhibitors/carp/logo')
    }
    if (path.includes('spec/logo')) {
      candidates.push('exhibitors/spec/SPEC-LOGO', 'exhibitors/spec/SPEC-LOGO.jpg ', 'exhibitors/spec/logo')
    }
    if (path.includes('library/logo')) {
      candidates.push('exhibitors/library/市圖TPL Logo使用規範', 'exhibitors/library/logo')
    }
    if (path.includes('childreneyes/logo')) {
      candidates.push('exhibitors/childreneyes/children eye x slowork logo', 'exhibitors/childreneyes/logo')
    }
    if (path.includes('artqpie/logo')) {
      candidates.push('exhibitors/artqpie/本冊logo', 'exhibitors/artqpie/logo')
    }
    if (path.includes('wandertail/logo')) {
      candidates.push('exhibitors/wandertail/三更小尾巴_標誌組合_C02', 'exhibitors/wandertail/logo')
    }
    if (path.includes('onegu/logo')) {
      candidates.push('exhibitors/onegu/頑固油飯-方形LOGO-2024', 'exhibitors/onegu/logo')
    }
    if (path.includes('jammmm/logo')) {
      candidates.push('exhibitors/jammmm/jammm_LOGO-03', 'exhibitors/jammmm/logo')
    }
    if (path.includes('pebbling/logo')) {
      candidates.push('exhibitors/pebbling/Pebbling logo', 'exhibitors/pebbling/logo')
    }
    if (path.includes('nowhere/logo')) {
      candidates.push('exhibitors/nowhere/LOGO General.05', 'exhibitors/nowhere/logo')
    }
    if (path.includes('prndl/logo')) {
      candidates.push('exhibitors/prndl/PRNDL.art_logo_Orange-01', 'exhibitors/prndl/logo')
    }
    if (path.includes('meadowroom/logo')) {
      candidates.push('exhibitors/meadowroom/meadowroom_logo', 'exhibitors/meadowroom/logo')
    }
    if (path.includes('licorice/logo')) {
      candidates.push('exhibitors/licorice/Licorice_logo_01', 'exhibitors/licorice/logo')
    }
    if (path.includes('aaa/logo')) {
      candidates.push('exhibitors/aaa/AAA_Logo_RGB_Black', 'exhibitors/aaa/logo')
    }
    if (path.includes('yao/logo')) {
      candidates.push('exhibitors/yao/窯-logo', 'exhibitors/yao/logo')
    }
    if (path.includes('springbao/logo')) {
      candidates.push('exhibitors/springbao/SPRINGBAOLOGO2024', 'exhibitors/springbao/logo')
    }
    if (path.includes('thingbooks/logo')) {
      candidates.push('exhibitors/thingbooks/Thing Books Logo', 'exhibitors/thingbooks/logo')
    }
    if (path.includes('glitch/logo')) {
      candidates.push('exhibitors/glitch/Logo+文字_RGB', 'exhibitors/glitch/logo')
    }
  }

  // 若為 books/01 或 books/01-1 格式，自動支援 book01、01_1、book01-1 等常見命名
  const m = path.match(/^(.*\/books\/)0?(\d+)(?:-(\d+))?$/i)
  if (m) {
    const [, prefix, numRaw, subNum] = m
    const num2 = numRaw.padStart(2, '0')
    const num1 = String(Number(numRaw))
    if (subNum) {
      candidates.push(
        `${prefix}${num2}-${subNum}`,
        `${prefix}${num2}_${subNum}`,
        `${prefix}book${num2}-${subNum}`,
        `${prefix}book${num2}_${subNum}`,
        `${prefix}book-${num2}-${subNum}`,
        `${prefix}${num1}-${subNum}`,
        `${prefix}book${num1}-${subNum}`
      )
    } else {
      candidates.push(
        `${prefix}${num2}`,
        `${prefix}book${num2}`,
        `${prefix}book-${num2}`,
        `${prefix}book_${num2}`,
        `${prefix}${num1}`,
        `${prefix}book${num1}`
      )
    }
  }
  return candidates
}

/** img('exhibitors/glitch/books/01') → 圖片網址或 null */
export function img(path) {
  if (!path) return null
  const candidates = buildCandidatePaths(path)
  for (const cand of candidates) {
    for (const ext of EXT) {
      const baseKey = `../assets/images/${cand}.${ext}`.toLowerCase()
      const hit =
        normalizedMap.get(baseKey) ||
        normalizedMap.get(baseKey.normalize('NFC')) ||
        normalizedMap.get(baseKey.normalize('NFD'))
      if (hit) return hit
    }
  }
  return null
}
