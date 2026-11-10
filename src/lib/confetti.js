import confetti from 'canvas-confetti'

const COLORS = ['#5d7a90', '#e1fbb9', '#91aeef', '#54abaa', '#d0dae1']

export function burst(origin = { x: 0.5, y: 0.6 }) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  confetti({ particleCount: 45, spread: 60, origin, colors: COLORS, scalar: 0.85, disableForReducedMotion: true })
}
