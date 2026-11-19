import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  GitCompare,
  Search,
  Database,
  BarChart2,
  Cpu,
  Activity,
  History,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview / Dashboard', icon: LayoutDashboard },
  { path: '/compare', label: 'Compare Questions', icon: GitCompare },
  { path: '/duplicate-finder', label: 'Smart Duplicate Finder', icon: Search },
  { path: '/datasets', label: 'Dataset Management', icon: Database },
  { path: '/analyzer', label: 'Dataset Analyzer', icon: BarChart2 },
  { path: '/training', label: 'Model Training Center', icon: Cpu },
  { path: '/performance', label: 'Model Performance', icon: Activity },
  { path: '/history', label: 'Prediction History', icon: History },
  { path: '/how-it-works', label: 'How It Works', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings }
]

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  theme,
  setTheme
}) {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(16, 45, 38, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 45
          }}
          onClick={closeMobile}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        style={
          mobileOpen
            ? {
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: '280px',
                zIndex: 50,
                boxShadow: 'var(--shadow-lg)'
              }
            : undefined
        }
      >
        {/* Brand Header: Logo links to Home Page */}
        <div className="sidebar-header">
          <Link to="/" className="brand-container" onClick={closeMobile} title="QuerySense Home Page">
            <div className="brand-logo-icon">Q</div>
            {!collapsed && (
              <div className="brand-text">
                <span className="brand-title">QuerySense</span>
                <span className="brand-tagline">AI Duplicate Engine</span>
              </div>
            )}
          </Link>

          {/* Desktop collapse or mobile close */}
          {mobileOpen ? (
            <button
              className="sidebar-collapse-btn"
              onClick={closeMobile}
              aria-label="Close mobile navigation"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              className="sidebar-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="sidebar-nav-container">
          <div>
            {!collapsed && <div className="nav-section-title">Detection & Analysis</div>}
            <nav className="sidebar-nav" aria-label="Main Navigation">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive ? 'active' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="nav-icon" size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Footer: User profile, theme toggle & status */}
        <div className="sidebar-footer">
          {/* System Status Pill */}
          {!collapsed && (
            <div className="system-status-pill">
              <span className="status-dot-active" />
              <span>AI Semantic Engine · Active</span>
            </div>
          )}

          {/* Theme Switcher Quick Button */}
          <button
            onClick={toggleTheme}
            className="sidebar-nav-link"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: '100%' }}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="nav-icon" size={18} style={{ color: '#FBBF24' }} />
            ) : (
              <Moon className="nav-icon" size={18} style={{ color: 'var(--primary)' }} />
            )}
            {!collapsed && (
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Mode'}</span>
            )}
          </button>

          {/* User Profile Info */}
          <div className="user-profile-badge">
            <div className="user-avatar">AY</div>
            {!collapsed && (
              <div className="user-info-text">
                <span className="user-name">Anamika Yadav</span>
                <span className="user-role">Lead AI Researcher</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
