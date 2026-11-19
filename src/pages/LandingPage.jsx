import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  GitCompare,
  Search,
  Database,
  Cpu,
  Activity,
  History,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react'
import { healthCheck, isMockMode } from '../services/api.js'

export default function LandingPage() {

  const [theme, setTheme] = useState(() => localStorage.getItem('qs_theme') || 'light')
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('qs_theme', theme)
  }, [theme])

  useEffect(() => {
    let active = true
    healthCheck()
      .then(() => active && setBackendStatus('available'))
      .catch(() => active && setBackendStatus('unavailable'))
    return () => { active = false }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const serviceLabel = isMockMode
    ? 'Development demo mode'
    : backendStatus === 'available' ? 'API connected' : backendStatus === 'checking' ? 'Checking API…' : 'API unavailable'

  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* 1. Header / Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg-topbar)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '18px',
                boxShadow: '0 2px 6px rgba(23, 63, 53, 0.25)'
              }}
            >
              Q
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>
                QuerySense
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Intelligent Text Similarity
              </span>
            </div>
          </Link>

          <nav style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '24px' }} className="landing-nav-links">
            <a href="#about" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
              About
            </a>
            <a href="#features" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
              Features
            </a>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
              How It Works
            </a>
            <a href="#technology" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
              Technology
            </a>
            <a href="#benefits" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
              Benefits
            </a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="icon-button"
            title={theme === 'dark' ? 'Switch to Forest Light' : 'Switch to Charcoal Dark'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: '#FBBF24' }} /> : <Moon size={18} />}
          </button>

          <Link
            to="/dashboard"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontSize: '14px', fontWeight: 600 }}
          >
            <span>Launch App</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section
        id="hero"
        style={{
          padding: '80px 24px 60px',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px'
            }}
          >
            <Sparkles size={14} />
            <span>AI Semantic Similarity & Deduplication Engine</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 4.5vw, 54px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-1.2px',
              color: 'var(--text-primary)',
              marginBottom: '20px'
            }}
          >
            Discover Similar Questions. Eliminate Duplicates. Improve Knowledge.
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 1.8vw, 19px)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              maxWidth: '560px'
            }}
          >
            QuerySense compares question pairs and ranks related questions using TF-IDF features and trained classification models.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            <Link
              to="/dashboard"
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '15px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '10px' }}
            >
              <span>Get Started</span>
              <ArrowRight size={17} />
            </Link>

            <a
              href="#features"
              className="btn btn-secondary"
              style={{ padding: '14px 24px', fontSize: '15px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Explore Features</span>
              <ChevronRight size={17} />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>Live API</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configured service</span>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
            <div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>TF-IDF + ML</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Backend inference</span>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
            <div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>Health check</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Service availability</span>
            </div>
          </div>
        </div>

        <div className="card card-padding" style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: backendStatus === 'available' ? '#10B981' : backendStatus === 'checking' ? '#D4A017' : '#DC5A52' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Backend status</span>
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--text-primary)' }}>{serviceLabel}</h2>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {isMockMode
                ? 'Local development is using the optional demo scorer.'
                : backendStatus === 'available'
                  ? 'Predictions and search results are served by the QuerySense API.'
                  : backendStatus === 'checking'
                    ? 'Connecting to the configured QuerySense API.'
                    : 'The API did not respond. Check the service status and try again.'}
            </p>
          </div>
          <Link to="/compare" className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>Run a live comparison</span>
            <ArrowRight size={16} />
          </Link>
        </div>      </section>

      {/* 3. Key Features Section */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
            Capabilities & Architecture
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Everything You Need to Audit & Detect Duplicate Inquiries
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Compare question pairs, search the indexed repository, and inspect measured model evaluations and dataset results.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Feature 1 */}
          <div className="card" style={{ padding: '28px', transition: 'transform 180ms ease' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <GitCompare size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Pairwise Semantic Comparison
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Compare two questions with the selected backend model and inspect the returned score, confidence, and explanation.
            </p>
            <Link to="/compare" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Compare Questions <ArrowRight size={13} />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Search size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Smart Duplicate Finder
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                Search the indexed question collection with TF-IDF cosine ranking, configurable similarity thresholds, and category filtering.
            </p>
            <Link to="/duplicate-finder" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Search Questions <ArrowRight size={13} />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Database size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Dataset Management &amp; Analyzer
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Drag-and-drop CSV upload, schema validation, modal record preview, missing field detection, and pairwise matrix analysis across entire collections.
            </p>
            <Link to="/datasets" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Manage Datasets <ArrowRight size={13} />
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Model Training Center
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Train and persist 4 distinct model architectures (Logistic Regression, Random Forest, Latent Semantic Analysis, and TF-IDF Cosine) with automated versioning.
            </p>
            <Link to="/training" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Open Training Lab <ArrowRight size={13} />
            </Link>
          </div>

          {/* Feature 5 */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Empirical Performance Analytics
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Examine live test split metrics: Accuracy, Precision, Recall, F1-score, 2&times;2 empirical confusion matrices, and model comparison charts.
            </p>
            <Link to="/performance" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Model Metrics <ArrowRight size={13} />
            </Link>
          </div>

          {/* Feature 6 */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <History size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Prediction History &amp; Feedback
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Searchable prediction audit log with CSV export and human feedback loops (thumbs up / down) to refine classifiers on domain-specific questions.
            </p>
            <Link to="/history" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Audit History <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              Processing Pipeline
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)', marginBottom: '16px' }}>
              How QuerySense Detects Duplicate Questions
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A hybrid NLP architecture uniting lexical string distance, character n-grams, and Latent Semantic concept projections.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Step 1 */}
            <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-soft)', padding: '4px 10px', borderRadius: '100px', display: 'inline-block', marginBottom: '14px' }}>
                STEP 01
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Text Preprocessing
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Lowercasing, contraction normalization, special symbol cleansing, and token normalization to canonical form.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-soft)', padding: '4px 10px', borderRadius: '100px', display: 'inline-block', marginBottom: '14px' }}>
                STEP 02
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                12 Pair Features
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Includes TF-IDF cosine, token overlap, character-trigram overlap, length differences, and LSA similarity.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-soft)', padding: '4px 10px', borderRadius: '100px', display: 'inline-block', marginBottom: '14px' }}>
                STEP 03
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Latent Semantic Projection
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Truncated SVD projects the fitted TF-IDF corpus into a lower-dimensional space for semantic similarity scoring.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-soft)', padding: '4px 10px', borderRadius: '100px', display: 'inline-block', marginBottom: '14px' }}>
                STEP 04
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Supervised Decision
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Trained classifiers evaluate probability and decision boundaries with guardrails against false duplicates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technology Overview Section */}
      <section id="technology" style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
            Technology Stack
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Built on Proven NLP &amp; Web Engineering
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>FRONTEND INTERFACE</span>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '8px' }}>
              React 18 &amp; Vite
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Single-page architecture with responsive navigation, theme preferences, and direct route refresh support.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>BACKEND SERVICE</span>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '8px' }}>
              FastAPI &amp; Uvicorn
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              High-throughput asynchronous REST endpoints with Pydantic validation and automatic OpenAPI documentation.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>MACHINE LEARNING</span>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '8px' }}>
              Scikit-Learn &amp; Joblib
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Random Forest and Logistic Regression classifiers use a persisted feature extractor; TF-IDF remains the default baseline.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>STORAGE &amp; AUDIT</span>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '8px' }}>
              SQLite with WAL Mode
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              ACID-compliant relational storage for benchmark datasets, training history, and continuous human feedback.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Benefits Section */}
      <section id="benefits" style={{ padding: '80px 24px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              Impact &amp; Advantages
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Why Intelligent Duplicate Detection Matters
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <CheckCircle2 size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Prevent Forum Fragmentation</h3>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Consolidate user queries to single authoritative discussions rather than splintering community knowledge across duplicate threads.
              </p>
            </div>

            <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <CheckCircle2 size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Accelerate Search &amp; Retrieval</h3>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Guide users to answers instantly by understanding intent rather than requiring exact keyword matches.
              </p>
            </div>

            <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <CheckCircle2 size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Explainable AI Predictions</h3>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Unlike opaque black-box models, QuerySense shows exact keyword overlaps, length ratios, and concept confidence metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section style={{ padding: '90px 24px', maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }}>
        <div
          className="card"
          style={{
            padding: '56px 32px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: '16px', color: '#FFFFFF', letterSpacing: '-0.8px' }}>
            Ready to Eliminate Duplicate Questions?
          </h2>
          <p style={{ fontSize: '17px', color: '#DCE9DF', maxWidth: '620px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Launch QuerySense to compare inquiries, manage datasets, and train models evaluated on a held-out split.
          </p>
          <Link
            to="/dashboard"
            className="btn"
            style={{
              background: '#FAF9F5',
              color: '#173F35',
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)'
            }}
          >
            <span>Launch Dashboard</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* 8. Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '48px 24px 36px',
          background: 'var(--bg-surface)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '36px',
            marginBottom: '40px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: 'var(--radius-sm)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px' }}>
                Q
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>QuerySense</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Intelligent Duplicate Question Detection Using Text Similarity Techniques.
            </p>
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '12px' }}>
              Core Application
            </span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <li><Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Overview Dashboard</Link></li>
              <li><Link to="/compare" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Compare Questions</Link></li>
              <li><Link to="/duplicate-finder" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Smart Duplicate Finder</Link></li>
              <li><Link to="/history" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Prediction History</Link></li>
            </ul>
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '12px' }}>
              ML &amp; Datasets
            </span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <li><Link to="/datasets" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Dataset Management</Link></li>
              <li><Link to="/analyzer" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Dataset Analyzer</Link></li>
              <li><Link to="/training" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Model Training Center</Link></li>
              <li><Link to="/performance" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Model Performance</Link></li>
            </ul>
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '12px' }}>
              Platform
            </span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <li><Link to="/how-it-works" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>How It Works</Link></li>
              <li><Link to="/settings" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Settings &amp; Theme</Link></li>
              <li><a href="#technology" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Technology Architecture</a></li>
            </ul>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>&copy; {new Date().getFullYear()} QuerySense AI Platform. All rights reserved.</span>
          <span>Forest Green &amp; Warm Neutral Design System</span>
        </div>
      </footer>
    </div>
  )
}
