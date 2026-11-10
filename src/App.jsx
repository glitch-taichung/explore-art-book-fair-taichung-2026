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
  // 關閉瀏覽器預設的滾動記憶，確保未帶 hash 的外部連結一律由最頂端扉頁開啟
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0)
    }

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
