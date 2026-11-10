export const cn = (...parts) => parts.filter(Boolean).join(' ')

/** 資料推導的徽章：晚於書展閉幕或不在遮蔭廣場 → 「場外」 */
export function badgeFor(item, event) {
  if (item.scope !== 'fair') return null
  const day = event.days.find((d) => d.date === item.date)
  if (!day) return null
  const afterClose = item.start >= day.close
  const offsite = !/遮蔭廣場|現場|主舞台|B1/.test(item.venue)
  return afterClose || offsite ? '場外' : null
}
