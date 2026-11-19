import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GitCompare,
  Search,
  Database,
  Cpu,
  Activity,
  History,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BarChart2,
  Layers,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  Code2,
  Terminal,
  HelpCircle
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => localStorage.getItem('qs_theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('qs_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Interactive Hero Demo State
  const [activeDemo, setActiveDemo] = useState(0)
  const demoPairs = [
    {
      q1: 'How do I start learning Python programming?',
      q2: 'What is the best way to learn Python for beginners?',
      score: 94.2,
      isDup: true,
      category: 'Programming',
      matchingWords: ['python', 'learning', 'programming', 'beginners']
    },
    {
      q1: 'How can I bake sourdough bread with a crispy crust?',
      q2: 'What are the principles of quantum computing and superposition?',
      score: 0.0,
      isDup: false,
      category: 'Cross-Domain',
      matchingWords: []
    },
    {
      q1: 'How do I become financially independent in five years?',
      q2: 'What strategies can help me achieve financial freedom?',
      score: 87.5,
      isDup: true,
      category: 'Finance',
      matchingWords: ['financial', 'freedom', 'independent', 'strategies']
    }
  ]

  const currentDemo = demoPairs[activeDemo]

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
            QuerySense is an intelligent text similarity platform designed to identify duplicate questions across large corpora, forums, and knowledge bases using multi-perspective feature engineering and calibrated machine learning.
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
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>93.0%</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Evaluated Test Accuracy</span>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
            <div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>14 Features</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lexical & Concept Vectors</span>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
            <div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>&lt; 50 ms</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Inference Latency</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Visualization Card */}
        <div
          className="card"
          style={{
            padding: '28px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Live Inference Demonstration</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {demoPairs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDemo(idx)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeDemo === idx ? 'var(--primary)' : 'var(--bg-subtle)',
                    color: activeDemo === idx ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 120ms ease'
                  }}
                >
                  Pair 0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question 1 Box */}
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
              Question 01
            </span>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
              "{currentDemo.q1}"
            </p>
          </div>

          {/* Question 2 Box */}
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '18px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
              Question 02
            </span>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
              "{currentDemo.q2}"
            </p>
          </div>

          {/* Prediction Result Gauge */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: currentDemo.isDup ? 'var(--status-duplicate-bg)' : 'var(--status-nondup-bg)',
              border: `1px solid ${currentDemo.isDup ? 'var(--status-duplicate-border)' : 'var(--status-nondup-border)'}`,
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color={currentDemo.isDup ? '#102D26' : '#7B847E'} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: currentDemo.isDup ? 'var(--status-duplicate-text)' : 'var(--status-nondup-text)' }}>
                  {currentDemo.isDup ? 'Duplicate Question' : 'Distinct Question'}
                </span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: currentDemo.isDup ? 'var(--primary-dark)' : 'var(--text-secondary)' }}>
                {currentDemo.score}%
              </span>
            </div>

            {/* Visual Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${currentDemo.score}%`,
                  height: '100%',
                  background: currentDemo.isDup ? 'linear-gradient(90deg, #173F35, #2A6355)' : '#7B847E',
                  transition: 'width 300ms ease'
                }}
              />
            </div>
          </div>

          {/* Keywords & Quick Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {currentDemo.matchingWords.length > 0 ? (
                currentDemo.matchingWords.map((w) => (
                  <span key={w} style={{ fontSize: '11.5px', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    #{w}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>0 common keywords &middot; Disjoint concepts</span>
              )}
            </div>

            <Link to="/compare" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Try your own pair</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

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
            Engineered from the ground up for transparent similarity evaluation, reproducible ML training, and sub-millisecond retrieval.
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
              Compare two questions side-by-side with live character counters, instant token alignment, fuzzy matching, and multi-model probability estimation.
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
              Search across indexed question databases to retrieve semantically matching queries with configurable similarity sliders and category filtering.
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
                14-D Feature Extraction
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Computes Jaccard overlap, Levenshtein edit distance, length disparity, token sorting, and TF-IDF cosine angles.
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
                Truncated SVD reduces vocabulary sparsity, capturing conceptual synonyms that share zero literal word overlap.
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
              Single-page architecture with responsive navigation, fluid dark mode, and sub-second asset compilation.
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
              Random Forest, Logistic Regression, and Truncated SVD vectorizers persisted for zero-cold-start inference.
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
            Launch the QuerySense application to compare inquiries, index custom datasets, and train production-ready NLP models.
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
