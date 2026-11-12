import { useState } from 'react'
import tpl from '../../assets/brand/logo-tpl_horizontal.png'
import culture from '../../assets/brand/logo-culture_bureau.png'
import glitchLogo from '../../assets/brand/logo-glitch.svg'

export default function Footer({ event }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText('glitch.taichung@gmail.com')
      } else {
        const input = document.createElement('input')
        input.value = 'glitch.taichung@gmail.com'
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy email:', err)
    }
  }

  return (
    <footer className="md:snap-end overflow-x-clip bg-white px-6 py-16 text-cap sm:px-12">
      <div className="mx-auto max-w-[1280px]">
        {/* 合作單位：無分隔頂線，三枚 Logo 同高置中對齊 */}
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="mb-3 text-ink/60 text-left">指導單位</p>
            <div className="flex h-12 items-center">
              <img src={culture} alt="臺中市政府文化局" width="600" height="120" loading="lazy" className="h-8 w-auto" />
            </div>
          </div>
          <div>
            <p className="mb-3 text-ink/60 text-left">主辦單位</p>
            <div className="flex h-12 items-center">
              <img src={tpl} alt="臺中市立圖書館" width="222" height="60" loading="lazy" className="h-9 w-auto" />
            </div>
          </div>
          <div>
            <p className="mb-3 text-ink/60 text-left">策劃單位</p>
            <div className="flex h-12 items-center">
              <img src={glitchLogo} alt="毛刺 Glitch" width="299" height="215" loading="lazy" className="h-11 w-auto" />
            </div>
          </div>
        </div>

        {/* 設計 credit & 聯絡資訊（置左）＋ Copyright（手機最下方置中並拉開距離，電腦最下列靠右） */}
        <div className="mt-12 flex flex-col gap-10 text-ink/70 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex flex-col items-start gap-y-3 text-left sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6 sm:gap-y-1">
            <p className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-left">
              {event.credits.map((c) => (
                <span key={c.role}>
                  {c.role}{' '}
                  <a href={c.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
                    {c.name}
                  </a>
                </span>
              ))}
            </p>
            <div className="flex flex-col items-start gap-y-1 text-left sm:inline-flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
              <span>Contact us:</span>
              <a
                href="https://www.instagram.com/glitch.home/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-ink"
              >
                @glitch.home
              </a>
              <span className="inline-flex items-center gap-1.5">
                <a
                  href="mailto:glitch.taichung@gmail.com"
                  className="underline underline-offset-4 hover:text-ink"
                >
                  glitch.taichung@gmail.com
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="複製信箱"
                  title={copied ? '已複製！' : '複製信箱'}
                  className="inline-flex items-center justify-center p-0.5 text-ink/75 hover:text-ink transition-colors cursor-pointer"
                >
                  {copied ? (
                    <span className="inline-flex items-center gap-1 text-[0.72rem] text-ink font-bold">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Copied!</span>
                    </span>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </span>
            </div>
          </div>
          <p className="w-full shrink-0 text-center text-ink/60 sm:w-auto sm:text-right">
            copyright © 2026 毛刺Glitch
          </p>
        </div>
      </div>
    </footer>
  )
}
