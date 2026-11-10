import { exhibitorList as exhibitors } from '../src/data/exhibitors.js'
import { schedule } from '../src/data/schedule.js'

const books = exhibitors.filter((e) => e.kind === 'book')
const food = exhibitors.filter((e) => e.kind === 'food')
const foodPerDay = [1, 2].map((d) => food.filter((e) => e.days.includes(d)).length)
const fair = schedule.filter((s) => s.scope === 'fair')
const beyond = schedule.filter((s) => s.scope === 'beyond')
const ids = new Set(schedule.map((s) => s.id))

const checks = [
  ['書店／創作者 = 25', books.length === 25, books.length],
  ['每日飲食攤位 = 5', foodPerDay.every((n) => n === 5), foodPerDay.join('/')],
  ['節目 id 不重複', ids.size === schedule.length, schedule.length],
  ['書展日程皆在 12/12–12/13', fair.every((s) => ['2026-12-12', '2026-12-13'].includes(s.date)), fair.length],
  ['延伸活動 = 6', beyond.length === 6, beyond.length],
]
let ok = true
for (const [name, pass, v] of checks) {
  console.log(`${pass ? '✔' : '✘'} ${name} (${v})`)
  ok &&= pass
}
process.exit(ok ? 0 : 1)
