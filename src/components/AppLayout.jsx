import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopNavbar from './TopNavbar.jsx'
import ScrollToTop from './ScrollToTop.jsx'

export default function AppLayout() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('qs_theme') || 'light'
  })
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('qs_sidebar_collapsed') === 'true'
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('qs_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('qs_sidebar_collapsed', collapsed ? 'true' : 'false')
  }, [collapsed])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <ScrollToTop />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        theme={theme}
        setTheme={setTheme}
      />

      <div className={`main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <TopNavbar
          onOpenMobile={() => setMobileOpen(true)}
          theme={theme}
          setTheme={setTheme}
        />
        <main className="content-area" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
