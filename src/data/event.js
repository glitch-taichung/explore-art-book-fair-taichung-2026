export const event = {
  name: 'Explore Art Book Fair',
  nameShort: 'Explore ABF',
  series: '2026 臺中閱讀節｜城市裡的閱讀風景',
  seriesEn: 'Reading in the City',
  venue: '臺中綠美圖・遮蔭廣場',
  days: [
    { day: 1, date: '2026-12-12', label: '12.12', weekday: 'SAT', open: '13:00', close: '21:00' },
    { day: 2, date: '2026-12-13', label: '12.13', weekday: 'SUN', open: '10:00', close: '17:30' },
  ],
  // 倒數用，以第一天開放時間為準（Asia/Taipei）
  startsAt: '2026-12-12T13:00:00+08:00',
  organizer: '臺中市立圖書館',
  curator: '毛刺 Glitch',
  credits: [
    { role: 'Key Visual', name: '@houth.tw', url: 'https://www.instagram.com/houth.tw/' },
    { role: 'Visual Adaptation', name: '@otherwormmm', url: 'https://www.instagram.com/otherwormmm/' },
  ],
  hashtags: ['臺中市立圖書館', '臺中市立美術館', '臺中閱讀節'],
  // TODO: 待補 — 地址、交通、報名連結、OG 圖
  info: { address: null, transport: null, registerUrl: null },
}
