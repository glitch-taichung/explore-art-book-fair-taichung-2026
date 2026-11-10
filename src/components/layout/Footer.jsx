import tpl from '../../assets/brand/logo-tpl_horizontal.png'
import culture from '../../assets/brand/logo-culture_bureau.png'
import glitchLogo from '../../assets/brand/logo-glitch.svg'

export default function Footer({ event }) {
  return (
    <footer className="bg-white px-6 py-16 text-cap sm:px-12">
      <div className="mx-auto max-w-[1280px]">
        {/* 合作單位：無分隔頂線 */}
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="mb-3 text-ink/60">指導單位</p>
            <img src={culture} alt="臺中市政府文化局" width="600" height="120" loading="lazy" className="h-8 w-auto" />
          </div>
          <div>
            <p className="mb-3 text-ink/60">主辦單位</p>
            <img src={tpl} alt="臺中市立圖書館" width="222" height="60" loading="lazy" className="h-9 w-auto" />
          </div>
          <div>
            <p className="mb-3 text-ink/60">策劃單位</p>
            <img src={glitchLogo} alt="毛刺 Glitch" width="299" height="215" loading="lazy" className="h-12 w-auto" />
          </div>
        </div>

        {/* 設計 credit：置左排版，移除左下角字樣 */}
        <div className="mt-12 flex flex-col items-start gap-3 text-left text-ink/70">
          <p className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            {event.credits.map((c) => (
              <span key={c.role}>
                {c.role}{' '}
                <a href={c.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
                  {c.name}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  )
}
