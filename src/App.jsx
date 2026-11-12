import { useCallback, useEffect, useState, useRef } from 'react'
import { event } from './data/event'
import { exhibitorList } from './data/exhibitors'
import Hero from './components/sections/Hero'
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
        requestAnimationFrame(() => {
          document.getElementById('exhibitor')?.scrollIntoView({ behavior: 'auto' })
        })
      } else if (route.type === 'program') {
        setSelectedProgramId(route.id)
        setOpenId(null)
        requestAnimationFrame(() => {
          document.getElementById('programme')?.scrollIntoView({ behavior: 'auto' })
        })
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

  // 2. 滑動同步網址（無彈窗開啟時依所在區段靜默更新網址，回到扉頁 #top 時恢復乾淨首頁網址）
  useEffect(() => {
    if (openId || selectedProgramId) return

    const SECTION_IDS = ['top', 'home', 'programme', 'exhibitor', 'info']
    let rafId = null

    const updateHashFromScroll = () => {
      rafId = null
      if (isNavigatingRef.current) return

      const anchorY = window.scrollY + window.innerHeight * 0.32
      let activeId = 'top'
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.offsetTop <= anchorY) {
          activeId = id
        }
      }

      if (activeId === 'top') {
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      } else {
        const nextHash = `#${activeId}`
        if (window.location.hash !== nextHash) {
          window.history.replaceState(null, '', nextHash)
        }
      }
    }

    const onScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(updateHashFromScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
    }
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

  // 4. 側欄抽屜開啟時鎖定背景滾動（同時鎖定 html 與 body，徹底防止背景捲動）
  useEffect(() => {
    if (openId) {
      const prevBodyOverflow = document.body.style.overflow
      const prevHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prevBodyOverflow
        document.documentElement.style.overflow = prevHtmlOverflow
      }
    }
  }, [openId])

  return (
    <>
      <Navbar />
      <Hero event={event} />
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
