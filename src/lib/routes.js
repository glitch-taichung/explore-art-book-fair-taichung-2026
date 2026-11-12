/**
 * 網址設定與路由映射系統
 * 主要網址：explore-art-book-fair-2026
 * 區段：programme、exhibitor、info
 * 活動內頁：#program-{活動英文名} （沙龍為 #program-salon-{講者}）
 * 書商內頁：#program-{展商英文名}
 */

export const VENDOR_SLUGS = {
  // Spot 1 & 飲食
  library: 'taichung-public-library',
  glitch: 'glitch-taichung',
  dmp: 'dmp-editions',
  meadowroom: 'meadowroom-taichung',
  pebbling: 'kooonoyaro-pebbling-taichung',
  wandertail: 'wantertail-taichung',
  onegu: 'onegu-steamed-glutinious-rice',
  narcos: 'narcos-sugar',
  jammmm: 'jammm-taichung',
  jilongli: 'jilongli-bread-project-taichung',

  // Spot 2
  spec: 'spec-magazine',
  yao: 'yao-taichung',
  carp: 'carp-gallety-taichung',
  artqpie: 'artqpie-library-taichung',
  springbao: 'springbao-taichung',

  // Spot 3
  nowhere: 'nowhere-bookstore',
  nodate: 'nodate',
  childreneyes: 'children-eyes-slowork-publishing',
  storage: 'storage-book-film-seoul',
  jerrys: 'jerry-s-rare-books-autographs',
  aaa: 'asia-art-archive-hk',

  // Spot 4
  prndl: 'prndl-art',
  booksociety: 'the-book-society-seoul',
  thingbooks: 'thing-books-singapore-art-book-fair',
  thumbbooks: 'thumb-books-singapore',

  // Spot 5
  ssspace: 'ss-space-space',
  papaya: 'nomad-papaya-books',
  phyllshin: 'phyllshin-books',
  zitdim: 'zit-dim-art-space',
  licorice: 'licorice-book-service',
  weightbooks: 'weight-books',
}

export const PROGRAM_SLUGS = {
  // 沙龍（後面再-分講者）
  'salon-1': 'salon-yehchungyi',
  'salon-2': 'salon-joefang',
  'salon-3': 'salon-prndl-art',
  'salon-4': 'salon-artqpie-library',
  'salon-5': 'salon-glitch-zimdimartspace-carpgallery-yao',
  'salon-6': 'salon-nodate',

  // 活動
  forum: 'asian-independent-publishing-forum',
  'tour-1': 'art-book-guide',
  'tour-2': 'art-book-guide-d2',
  'riso-1': 'riso-printing-workshop',
  'riso-2': 'riso-printing-workshop-d2',
  'woodbook-1': 'woodbook-workshop',
  'woodbook-2': 'woodbook-workshop-d2',
  'silent-party': 'silent-party',
  opening: 'opening',
  'kids-1': 'family-art-bookmaking',
  'kids-2': 'family-art-bookmaking-d2',
  'quiet-1': 'silent-book-hour-tpl',
  'quiet-2': 'silent-book-hour-ntmc',
  'quiet-3': 'silent-book-hour-waipu',
  'quiet-4': 'silent-book-hour-dongshi',
}

// 建立反向查詢表（包含別名相容處理）
const REVERSE_VENDOR_MAP = {}
Object.entries(VENDOR_SLUGS).forEach(([id, slug]) => {
  REVERSE_VENDOR_MAP[slug] = id
  REVERSE_VENDOR_MAP[`program-${slug}`] = id
})
// 容錯別名
REVERSE_VENDOR_MAP['carp-gallery-taichung'] = 'carp'
REVERSE_VENDOR_MAP['program-carp-gallery-taichung'] = 'carp'

const REVERSE_PROGRAM_MAP = {}
Object.entries(PROGRAM_SLUGS).forEach(([id, slug]) => {
  REVERSE_PROGRAM_MAP[slug] = id
  REVERSE_PROGRAM_MAP[`program-${slug}`] = id
})
// 沙龍別名容錯（例：直接輸入 #program-joefang 或 #joefang）
REVERSE_PROGRAM_MAP['joefang'] = 'salon-2'
REVERSE_PROGRAM_MAP['program-joefang'] = 'salon-2'
REVERSE_PROGRAM_MAP['yehchungyi'] = 'salon-1'
REVERSE_PROGRAM_MAP['program-yehchungyi'] = 'salon-1'
REVERSE_PROGRAM_MAP['prndl-art'] = 'salon-3'
REVERSE_PROGRAM_MAP['program-prndl-art'] = 'salon-3'
REVERSE_PROGRAM_MAP['artqpie-library'] = 'salon-4'
REVERSE_PROGRAM_MAP['program-artqpie-library'] = 'salon-4'
REVERSE_PROGRAM_MAP['glitch-zimdimartspace-carpgallery-yao'] = 'salon-5'
REVERSE_PROGRAM_MAP['program-glitch-zimdimartspace-carpgallery-yao'] = 'salon-5'
REVERSE_PROGRAM_MAP['nodate-salon'] = 'salon-6'
REVERSE_PROGRAM_MAP['program-nodate-salon'] = 'salon-6'
REVERSE_PROGRAM_MAP['forum'] = 'forum'
REVERSE_PROGRAM_MAP['program-forum'] = 'forum'

/**
 * 依據當前 URL 解析狀態：
 * 返回 { type: 'vendor' | 'program' | 'section' | null, id: string | null }
 */
export function parseCurrentRoute() {
  if (typeof window === 'undefined') return { type: null, id: null }

  const hash = window.location.hash.replace(/^#\/?/, '').trim()
  if (!hash) return { type: null, id: null }

  // 1. 優先比對書商內頁
  if (REVERSE_VENDOR_MAP[hash]) {
    return { type: 'vendor', id: REVERSE_VENDOR_MAP[hash] }
  }

  // 2. 比對活動內頁
  if (REVERSE_PROGRAM_MAP[hash]) {
    return { type: 'program', id: REVERSE_PROGRAM_MAP[hash] }
  }

  // 3. 一般區段
  if (hash === 'programme' || hash === 'programmes') {
    return { type: 'section', id: 'programme' }
  }
  if (hash === 'exhibitor' || hash === 'exhibitors') {
    return { type: 'section', id: 'exhibitor' }
  }
  if (hash === 'info') {
    return { type: 'section', id: 'info' }
  }
  if (hash === 'top') {
    return { type: 'section', id: 'top' }
  }
  if (hash === 'home' || hash === 'map') {
    return { type: 'section', id: 'home' }
  }

  return { type: null, id: null }
}

/**
 * 取得展商對應之完整 URL Hash (例如 #program-taichung-public-library)
 */
export function getVendorHash(vendorId) {
  const slug = VENDOR_SLUGS[vendorId] || vendorId
  return `#program-${slug}`
}

/**
 * 取得活動對應之完整 URL Hash (例如 #program-salon-joefang 或 #program-forum)
 */
export function getProgramHash(programId) {
  const slug = PROGRAM_SLUGS[programId] || programId
  return `#program-${slug}`
}
