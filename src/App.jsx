import { useCallback, useEffect, useState, useRef } from 'react'
import { event } from './data/event'
import { exhibitorList } from './data/exhibitors'
import Hero from './components/sections/Hero'
import Marquee from './components/ui/Marquee'
import Navbar from './components/layout/Navbar'
import Programme from './components/sections/Programme'
import Exhibitors from './components/sections/Exhibitors'
import Info from './components/sections/Info'
import Footer from './components/layout/Footer'
import VendorDrawer from './components/ui/VendorDrawer'
import ProgramModal from './components/ui/ProgramModal'
import {
  parseCurrentRoute,
  getVendorHash,
  getProgramHash,
} from './lib/routes'

export default function App() {
  const [openId, setOpenId] = useState(null)
  const [selectedProgramId, setSelectedProgramId] = useState(null)
  const isNavigatingRef = useRef(false)

  // 開啟 / 關閉 展商內頁（URL Hash 自動同步為 #program-{slug}）
  const handleOpenVendor = useCallback((id) => {
    setOpenId(id)
    setSelectedProgramId(null)
    const targetHash = getVendorHash(id)
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash)
    }
  }, [])

  const closeVendor = useCallback(() => {
    setOpenId(null)
    if (window.location.hash.startsWith('#program-')) {
      window.history.pushState(null, '', '#exhibitor')
    }
  }, [])

  // 開啟 / 關閉 活動內頁（URL Hash 自動同步為 #program-{slug} / 沙龍為 #program-salon-{slug}）
  const handleOpenProgram = useCallback((id) => {
    setSelectedProgramId(id)
    setOpenId(null)
    const targetHash = getProgramHash(id)
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash)
    }
  }, [])

  const closeProgram = useCallback(() => {
    setSelectedProgramId(null)
    if (window.location.hash.startsWith('#program-')) {
      window.history.pushState(null, '', '#programme')
    }
  }, [])

  const vendor = exhibitorList.find((e) => e.id === openId) || null

  // 1. 初次載入與前進/後退（popstate / hashchange）雙向同步 URL 與狀態
  useEffect(() => {
    const syncFromUrl = () => {
      const route = parseCurrentRoute()
      if (route.type === 'vendor') {
        setOpenId(route.id)
        setSelectedProgramId(null)
      } else if (route.type === 'program') {
        setSelectedProgramId(route.id)
        setOpenId(null)
      } else {
        setOpenId(null)
        setSelectedProgramId(null)
        if (route.type === 'section') {
          const el = document.getElementById(route.id)
          if (el) {
            isNavigatingRef.current = true
            el.scrollIntoView({ behavior: 'smooth' })
            setTimeout(() => {
              isNavigatingRef.current = false
            }, 800)
          }
        }
      }
    }

    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    window.addEventListener('hashchange', syncFromUrl)
    return () => {
      window.removeEventListener('popstate', syncFromUrl)
      window.removeEventListener('hashchange', syncFromUrl)
    }
  }, [])

  // 2. 頁面滾動時若無開啟彈窗，自動更新區段 Hash (#programme / #exhibitor / #info)
  useEffect(() => {
    if (openId || selectedProgramId) return

    const sections = ['info', 'exhibitor', 'programme']
    const handleScroll = () => {
      if (isNavigatingRef.current) return
      if (openId || selectedProgramId) return

      const scrollY = window.scrollY
      if (scrollY < window.innerHeight * 0.4) {
        if (window.location.hash && window.location.hash !== '#map') {
          window.history.replaceState(null, '', window.location.pathname)
        }
        return
      }

      for (const sId of sections) {
        const el = document.getElementById(sId)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
            const targetHash = `#${sId}`
            if (window.location.hash !== targetHash) {
              window.history.replaceState(null, '', targetHash)
            }
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [openId, selectedProgramId])

  // 3. 全站圖片防下載、防拖曳與防長按選單
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG' || e.target.closest('img')) {
        e.preventDefault()
      }
    }
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG' || e.target.closest('img')) {
        e.preventDefault()
      }
    }
    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('dragstart', handleDragStart)
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('dragstart', handleDragStart)
    }
  }, [])

  // 4. 側欄抽屜開啟時鎖定背景滾動
  useEffect(() => {
    if (openId) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [openId])

  return (
    <>
      <Navbar />
      <Hero event={event} />
      <Marquee />
      <main>
        <Programme onSelectProgram={handleOpenProgram} />
        <Exhibitors openId={openId} onOpen={handleOpenVendor} />
        <Info event={event} />
      </main>
      <Footer event={event} />
      <VendorDrawer vendor={vendor} onClose={closeVendor} onSelectVendor={handleOpenVendor} />
      <ProgramModal
        programId={selectedProgramId}
        onClose={closeProgram}
        onSelectProgram={handleOpenProgram}
      />
    </>
  )
}
