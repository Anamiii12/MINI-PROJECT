import { useState, useEffect } from 'react'
import {
  Moon,
  Sun,
  Cpu,
  Database,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import api from '../services/api.js'

export default function SettingsPage() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('qs_theme') || 'light')

  // Model & Threshold preferences
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('qs_default_model') || 'logistic_regression')
  const [threshold, setThreshold] = useState(() => Number(localStorage.getItem('qs_default_threshold') || 0.65))
  const [autoSaveHistory, setAutoSaveHistory] = useState(() => localStorage.getItem('qs_auto_save') !== 'false')

  // Backend status check
  const [backendHealth, setBackendHealth] = useState(null)
  const [checkingBackend, setCheckingBackend] = useState(false)
  const [saveNotice, setSaveNotice] = useState('')

  const checkHealth = async () => {
    setCheckingBackend(true)
    try {
      const start = performance.now()
      const data = await api.healthCheck()
      const latency = Math.round(performance.now() - start)
      setBackendHealth({ status: 'healthy', latency, ...data })
    } catch (err) {
      setBackendHealth({ status: 'error', error: err.message })
    } finally {
      setCheckingBackend(false)
    }
  }

  useEffect(() => {
    queueMicrotask(checkHealth)
  }, [])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('qs_theme', newTheme)
    flashNotice('Appearance theme updated.')
  }

  const handleSavePreferences = (e) => {
    e.preventDefault()
    localStorage.setItem('qs_default_model', selectedModel)
    localStorage.setItem('qs_default_threshold', threshold.toString())
    localStorage.setItem('qs_auto_save', autoSaveHistory ? 'true' : 'false')
    flashNotice('Inference configuration saved successfully.')
  }

  const flashNotice = (msg) => {
    setSaveNotice(msg)
    setTimeout(() => setSaveNotice(''), 3000)
  }

  const handleClearCache = () => {
    if (window.confirm('Reset local preferences to default settings?')) {
      localStorage.removeItem('qs_default_model')
      localStorage.removeItem('qs_default_threshold')
      localStorage.removeItem('qs_auto_save')
      setSelectedModel('logistic_regression')
      setThreshold(0.65)
      setAutoSaveHistory(true)
      flashNotice('Preferences reset to default values.')
    }
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">
            Configure UI themes, active inference models, similarity thresholds, and inspect backend services.
          </p>
        </div>
      </div>

      {saveNotice && (
        <div className="card" style={{ padding: '12px 18px', backgroundColor: 'var(--primary-soft)', border: '1px solid var(--primary-light)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-dark)' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{saveNotice}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>

        {/* Section 1: Appearance & Theme */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>Appearance & Theme</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Choose your workspace visual aesthetic</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px' }}>
            {/* Light Option */}
            <div
              onClick={() => handleThemeChange('light')}
              style={{
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                background: '#FAF9F5',
                color: '#202923',
                position: 'relative',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Forest Light</span>
                <Sun size={16} color="#173F35" />
              </div>
              <p style={{ fontSize: '12px', color: '#7B847E', lineHeight: 1.4 }}>Warm ivory, sage green accents, and crisp contrast.</p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#173F35' }} title="Forest Green" />
                <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#DCE9DF' }} title="Soft Sage" />
                <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#FAF9F5', border: '1px solid #ccc' }} title="Warm Ivory" />
              </div>
              {theme === 'light' && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
              )}
            </div>

            {/* Dark Option */}
            <div
              onClick={() => handleThemeChange('dark')}
              style={{
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: theme === 'dark' ? '2px solid var(--primary-light)' : '1px solid var(--border-default)',
                background: '#141C17',
                color: '#FAF9F5',
                position: 'relative',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Charcoal Dark</span>
                <Moon size={16} color="#A8D5BF" />
              </div>
              <p style={{ fontSize: '12px', color: '#94A399', lineHeight: 1.4 }}>Deep charcoal surfaces with soft sage accents.</p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#0F1411' }} title="Charcoal" />
                <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#235F50' }} title="Forest Accent" />
                <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#A8D5BF' }} title="Muted Green" />
              </div>
              {theme === 'dark' && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-light)' }} />
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Inference Preferences */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>Analysis Engine Defaults</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Configure your preferred model and sensitivity</p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-primary)' }}>
                Default Classifier Model
              </label>
              <select
                className="input"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{ width: '100%', height: '40px' }}
              >
                <option value="logistic_regression">Logistic Regression — fast, balanced, recommended</option>
                <option value="random_forest">Random Forest — ensemble, high accuracy</option>
                <option value="semantic_lsa">Semantic Similarity — concept-level matching</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Decision Threshold
                </label>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                  {Math.round(threshold * 100)}% ({threshold >= 0.70 ? 'Strict' : threshold <= 0.55 ? 'Sensitive' : 'Balanced'})
                </span>
              </div>
              <input
                type="range"
                min="0.40"
                max="0.85"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>40% (Permissive)</span>
                <span>65% (Recommended)</span>
                <span>85% (Strict)</span>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '4px' }}>
              <input
                type="checkbox"
                checked={autoSaveHistory}
                onChange={(e) => setAutoSaveHistory(e.target.checked)}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>Automatically save comparisons to your history log</span>
            </label>

            <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              Save Settings
            </button>
          </form>
        </div>

        {/* Section 3: Service Health */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>Service Health</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Check connection status and response times</p>
              </div>
            </div>

            <button
              className="icon-button"
              onClick={checkHealth}
              disabled={checkingBackend}
              title="Refresh connection status"
              aria-label="Refresh connection status"
            >
              <RefreshCw size={16} className={checkingBackend ? 'animate-spin' : ''} />
            </button>
          </div>

          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status:</span>
              {backendHealth?.status === 'healthy' ? (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Connected
                </span>
              ) : (
                <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {checkingBackend ? 'Checking...' : 'Unavailable'}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Response Time:</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {backendHealth?.latency ? `${backendHealth.latency} ms` : '—'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Storage:</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Persistent service storage</span>
            </div>
          </div>
        </div>

        {/* Section 4: Preferences & About */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>Preferences & About</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Reset your settings or view version information</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Reset to Defaults</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Restore all settings to their original values</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleClearCache}>
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>QuerySense</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Intelligent Duplicate Question Detection · v2.4</p>
              </div>
              <span className="badge badge-neutral">Latest</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
