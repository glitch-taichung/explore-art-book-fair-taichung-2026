// 地圖 hover 簡短名稱（參展列表與詳情抽屜皆顯示完整官方名稱）
const SHORT = {
  library: '臺中市立圖書館總館',
  childreneyes: 'children eyes ✕ slowork',
  jerrys: '學學齋古書店',
  thingbooks: 'Thing Books / SGABF',
  onegu: '頑固油飯 OneGu',
  papaya: '遊牧木瓜出版',
  carp: '鯉魚藝廊 Carp Gallery',
  springbao: '白水/SPRINGBAO',
  aaa: 'Asia Art Archive',
  pebbling: '激浪特攻本部 ✕ Pebbling',
  zitdim: '節點 Zit-Dim Art Space',
  artqpie: '本冊圖書館Artqpie Library',
}

export const shortName = (e) => SHORT[e.id] || e.name

export const SPOTS = ['Spot 1', 'Spot 2', 'Spot 3', 'Spot 4', 'Spot 5']
