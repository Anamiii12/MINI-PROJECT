import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Bell,
  Plus,
  Moon,
  Sun
} from 'lucide-react'

const ROUTE_NAMES = {
  '/': 'Home',
  '/dashboard': 'Overview',
  '/compare': 'Compare Questions',
  '/duplicate-finder': 'Smart Duplicate Finder',
  '/finder': 'Smart Duplicate Finder',
  '/datasets': 'Dataset Management',
  '/analyzer': 'Dataset Analyzer',
  '/dataset': 'Dataset Analyzer',
  '/training': 'Model Training Center',
  '/train': 'Model Training Center',
  '/performance': 'Model Performance',
  '/models': 'Model Performance',
  '/history': 'Prediction History',
  '/how-it-works': 'How It Works',
  '/settings': 'Settings',
  '/about': 'About QuerySense'
}

export default function TopNavbar({ onOpenMobile, theme, setTheme }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const currentTitle = ROUTE_NAMES[location.pathname] || 'Dashboard'

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Mobile menu button */}
        <button
          className="mobile-menu-toggle"
          onClick={onOpenMobile}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="breadcrumbs" aria-label="Breadcrumbs">
          <Link to="/" className="breadcrumb-item" title="Go to Home Page">QuerySense</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{currentTitle}</span>
        </nav>
      </div>

      <div className="topbar-right">
        {/* Global Search Bar Trigger */}
        <div
          className="search-bar-trigger"
          onClick={() => navigate('/duplicate-finder')}
          title="Search existing question database"
        >
          <Search size={15} />
          <span>Search questions...</span>
          <kbd className="search-kbd">⌘K</kbd>
        </div>

        {/* Quick Action Button */}
        <Link to="/compare" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <Plus size={15} />
          <span>New Comparison</span>
        </Link>

        {/* Theme Switcher */}
        <button
          className="icon-button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} style={{ color: '#FBBF24' }} /> : <Moon size={17} />}
        </button>

        {/* Notifications Button */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="System notifications"
            aria-label="View notifications"
          >
            <Bell size={17} />
            <span className="notification-badge-dot" />
          </button>

          {showNotifications && (
            <div
              className="card animate-fade-in"
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '320px',
                zIndex: 60,
                boxShadow: 'var(--shadow-lg)',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Activity</span>
                <span className="badge badge-success">Ready</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Analysis Engine Ready</p>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Model availability is shown in the Model Performance page.</p>
                </div>
                <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Question Repository</p>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Candidate questions are loaded from the backend repository.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
