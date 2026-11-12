// 來源：261110-活動總覽.pdf 與最新 Spot 1–5 名單。書店／創作者 25 組、飲食 5 攤（Jammm果醬 與 吉龍里麵包計劃 分日出攤）。
const b = (id, name, zone, origin) => ({ id, name, zone, origin, kind: 'book', days: [1, 2] })
const f = (id, name, zone, origin, days = [1, 2]) => ({ id, name, zone, origin, kind: 'food', days })

export const exhibitors = [
  // Spot 1（4 組書攤／單位 ＋ 5 攤飲食，共 9 桌位）
  b('library', '臺中市立圖書館總館', 'Spot 1', ['Taichung']),
  b('glitch', '毛刺 Glitch', 'Spot 1', ['Taichung']),
  b('dmp', 'dmp editions', 'Spot 1', ['Taipei']),
  b('meadowroom', '草地房 meadowroom', 'Spot 1', ['Taichung']),
  f('pebbling', '激浪特攻本部 ✕ pebbling', 'Spot 1', ['Taichung']),
  f('wandertail', '三更小尾巴 WanterTail', 'Spot 1', ['Taichung']),
  f('onegu', '頑固油飯 OneGu Steamed Glutinious Rice', 'Spot 1', ['Kaohsiung']),
  f('narcos', 'Narcos.sugar', 'Spot 1', ['Taoyuan']),
  f('jammmm', 'jammm果醬 (SAT)', 'Spot 1', ['Taichung'], [1]),
  f('jilongli', '吉龍里麵包計劃 (SUN)', 'Spot 1', ['Taichung'], [2]),

  // Spot 2（5 組）
  b('spec', 'SPEC MAGAZINE', 'Spot 2', ['Taichung']),
  b('papaya', '遊牧木瓜出版 Nomad Papaya Books', 'Spot 2', ['Taipei', 'Hamburg']),
  b('carp', '鯉魚藝廊 Carp Gallery', 'Spot 2', ['Taichung']),
  b('artqpie', '本冊圖書館 Artqpie Library', 'Spot 2', ['Taichung']),
  b('springbao', '白水 SPRINGBAO', 'Spot 2', ['Taichung']),

  // Spot 3（6 組）
  b('nowhere', '飛地書店 Nowhere Bookstore', 'Spot 3', ['Taipei', 'Hongkong']),
  b('nodate', '野点 nodate', 'Spot 3', ['Taipei']),
  b('childreneyes', '不標準圖書 children eyes x 慢工文化 slowork publishing', 'Spot 3', ['Taipei']),
  b('storage', 'Seoul Publishers Table / 서울 퍼블리셔스 테이블', 'Spot 3', ['Seoul']),
  b('jerrys', '學學齋古書店 Jerry’s Rare Books & Autographs', 'Spot 3', ['Hsinchu', 'Hamburg']),
  b('aaa', '亞洲藝術文獻庫 Asia Art Archive', 'Spot 3', ['Hongkong']),

  // Spot 4（4 組）
  b('prndl', '品度藝術 PRNDL.art', 'Spot 4', ['Taipei']),
  b('booksociety', 'The Book Society / Mediabus', 'Spot 4', ['Seoul']),
  b('thingbooks', 'Thing Books / Singapore Art Book Fair', 'Spot 4', ['Singapore']),
  b('thumbbooks', '拇指书 Thumb Books', 'Spot 4', ['Singapore']),

  // Spot 5（6 組）
  b('ssspace', 'ss space space', 'Spot 5', ['Taipei']),
  b('yao', '窯座 YÁO', 'Spot 5', ['Taichung']),
  b('phyllshin', 'Phyllshin Books', 'Spot 5', ['Taipei', 'Keelung']),
  b('zitdim', '節點 Zit-Dim Art Space', 'Spot 5', ['Tainan']),
  b('licorice', 'LICORICE BOOK SERVICE', 'Spot 5', ['Taipei']),
  b('weightbooks', '重本書店 Weight Books', 'Spot 5', ['Taipei']),
]

// 對應 vendors.json 內的詳細介紹與選書／菜單資料（內部查詢用，不在介面顯示 A–E）
import vendors from './generated/vendors.json' with { type: 'json' }

const VENDOR_KEY = {
  glitch: 'A-1', dmp: 'A-2', meadowroom: 'A-3', spec: 'A-4', papaya: 'A-5', carp: 'A-6', artqpie: 'A-7', springbao: 'A-8',
  pebbling: 'B-1', wandertail: 'B-2', onegu: 'B-3', narcos: 'B-4', jammmm: 'B-5', jilongli: 'B-5',
  nowhere: 'C-1', nodate: 'C-2', childreneyes: 'C-3', storage: 'C-4', jerrys: 'C-5', aaa: 'C-6',
  prndl: 'D-1', booksociety: 'D-2', thingbooks: 'D-4', thumbbooks: 'D-5',
  ssspace: 'E-1', yao: 'E-2', phyllshin: 'E-3', zitdim: 'E-4', licorice: 'E-5', weightbooks: 'E-6',
}

// 實體桌位索引（供地圖將週六 Jammm果醬 與週日 吉龍里麵包計劃 合併於同一桌位）
const BOOTH_SLOT = {
  library: '1-1', glitch: '1-2', dmp: '1-3', meadowroom: '1-4',
  pebbling: '1-5', wandertail: '1-6', onegu: '1-7', narcos: '1-8', jammmm: '1-9', jilongli: '1-9',
  spec: '2-1', papaya: '2-2', carp: '2-3', artqpie: '2-4', springbao: '2-5',
  nowhere: '3-1', nodate: '3-2', childreneyes: '3-3', storage: '3-4', jerrys: '3-5', aaa: '3-6',
  prndl: '4-1', booksociety: '4-2', thingbooks: '4-3', thumbbooks: '4-4',
  ssspace: '5-1', yao: '5-2', phyllshin: '5-3', zitdim: '5-4', licorice: '5-5', weightbooks: '5-6',
}

export const exhibitorList = exhibitors.map((e) => {
  const vk = VENDOR_KEY[e.id]
  const byId = vendors[e.id]
  const byKey = vk && vendors[vk] ? vendors[vk] : null
  const d = byId || byKey || null
  return {
    ...e,
    slot: BOOTH_SLOT[e.id],
    ...(d && {
      ig: e.ig ?? d.ig,
      website: e.website ?? d.website,
      introZh: e.introZh ?? d.introZh,
      introEn: e.introEn ?? d.introEn,
      books: e.books ?? d.books,
      menu: e.menu ?? d.menu,
      limited: e.limited ?? d.limited,
      ready: e.ready ?? d.ready,
      note: e.note ?? d.note,
    }),
  }
})
