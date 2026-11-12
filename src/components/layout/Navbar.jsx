import { useEffect, useState } from 'react'
import { ExploreTextLogotype } from '../ui/ExploreLogotype'

const LINKS = [
  ['#home', 'Home'],
  ['#programme', 'Programme'],
  ['#exhibitor', 'Exhibitors'],
  ['#info', 'Info'],
]

/**
 * 頂部導覽列：
 * - 在扉頁 (#top) 與首頁 (#home) 隱藏，保持視覺乾淨
 * - 一旦往下滑動進入活動日程 (#programme) 及其後續區段 (#exhibitor / #info)，即以半透明毛玻璃浮現於頂部
 * - 英文字體採用 EXPLORE ABF_Logotype_20261105.ai 的粗斜體字型與原檔向量標準字
 */
export default function Navbar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      const progEl = document.getElementById('programme')
      if (progEl) {
        const rect = progEl.getBoundingClientRect()
        // 滑入 programme 及其後續區段（手機與電腦版皆顯示 navbar）
        setVisible(rect.top <= 80)
      } else {
        setVisible(window.scrollY > window.innerHeight * 1.8)
      }
    }
    checkScroll()
    window.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      window.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  return (
    <header
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-0 z-[45] bg-white/90 px-6 backdrop-blur-md transition-all duration-300 sm:px-12 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-full opacity-0'
      }`}
    >
      <nav
        aria-label="主選單"
        className="mx-auto flex h-12 max-w-[1280px] items-center justify-center sm:h-13 sm:justify-between"
      >
        <div className="hidden sm:flex sm:items-center">
          <a
            href="#home"
            tabIndex={visible ? 0 : -1}
            aria-label="回到 Explore Art Book Fair 首頁"
            className="text-ink transition-opacity hover:opacity-70"
          >
            <ExploreTextLogotype className="h-5 w-auto sm:h-6" />
          </a>
        </div>

        {/* 導覽連結：手機版居中排成乾淨一列，電腦版靠右並排；一般字重無斜體 */}
        <ul className="flex w-full items-center justify-between gap-5 sm:w-auto sm:gap-9">
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                tabIndex={visible ? 0 : -1}
                className="font-sans text-[0.88rem] font-normal text-ink transition-colors hover:text-teal sm:text-body"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
