import React, { useState } from 'react'
import {
  Search,
  Sliders,
  Filter,
  Sparkles,
  RotateCcw,
  Tag,
  ListOrdered
} from 'lucide-react'
import { findSimilarQuestions, isMockMode, demoQuestionCount } from '../services/api.js'
import { FINDER_USEFUL_THRESHOLD, FINDER_LIMITS } from '../utils/textAnalysis.js'
import DuplicateMatchCard from '../components/DuplicateMatchCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

const CATEGORIES = [
  'All Categories',
  'Programming',
  'Education',
  'Career',
  'Money & Finance',
  'Technology',
  'Health & Fitness',
  'Travel',
  'Food & Cooking',
  'Productivity',
  'General Knowledge',
  'Science'
]

export default function DuplicateFinder() {
  const [question, setQuestion] = useState('')
  const [threshold, setThreshold] = useState(0.0)
  const [category, setCategory] = useState('All Categories')
  const [sortBy, setSortBy] = useState('highest')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(value) {
    setQuestion(value)
    setResult(null)
    setError('')
  }

  async function search(event) {
    if (event) event.preventDefault()
    if (loading || !question.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const options = {
        limit: 10,
        threshold: Number(threshold) || 0.0,
        category: category !== 'All Categories' ? category : null,
        sort_by: sortBy
      }
      const data = await findSimilarQuestions(question.trim(), options)
      setResult(data)
    } catch {
      setError('Unable to search for similar questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const matches = result?.matches || []
  const noMatch = result && (!matches.length || matches[0].similarity_score < FINDER_USEFUL_THRESHOLD)

  return (
    <section id="finder" className="animate-fade-in" aria-labelledby="finder-heading">
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Semantic Search
            </span>
            <span className="badge badge-primary">
              <span className="status-dot-active" />
              Neural Index
            </span>
          </div>
          <h1 id="finder-heading">Smart Duplicate Finder</h1>
          <p className="page-description">
            Query the indexed question repository using hybrid TF-IDF lexical matching and calibrated ML ranking.
          </p>
        </div>
      </div>

      {/* Main Search Panel */}
      <form className="card card-padding" onSubmit={search} aria-busy={loading} style={{ marginBottom: '24px' }}>
        <div className="form-group" style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="finder-question" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              New Inquiring Question
            </label>
            <span id="finder-count" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {question.length} / 500
            </span>
          </div>
          <textarea
            id="finder-question"
            className="textarea-field"
            maxLength={500}
            rows={4}
            value={question}
            disabled={loading}
            onChange={(e) => update(e.target.value)}
            placeholder="e.g. How can I start learning Python programming for beginners?"
            required
            style={{ minHeight: '100px' }}
          />
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            padding: '16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '18px'
          }}
        >
          {/* Threshold Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Min Similarity Filter:</span>
              <span style={{ color: 'var(--primary)' }}>{Math.round(threshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              disabled={loading}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Domain Category:
            </label>
            <select
              className="select-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              style={{ padding: '6px 28px 6px 10px', fontSize: '12.5px' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Ranking Order:
            </label>
            <select
              className="select-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={loading}
              style={{ padding: '6px 28px 6px 10px', fontSize: '12.5px' }}
            >
              <option value="highest">Highest Similarity First</option>
              <option value="lowest">Lowest Similarity First</option>
            </select>
          </div>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" type="submit" disabled={loading || !question.trim()}>
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={15} />
                  <span>Find Similar Questions</span>
                </>
              )}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => update('')} disabled={loading || !question}>
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
          </div>

          {/* Quick Examples */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Try example:</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={loading}
              onClick={() => update('How can I start learning Python?')}
            >
              Python Learning
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={loading}
              onClick={() => update('What is cloud computing?')}
            >
              Cloud Computing
            </button>
          </div>
        </div>
      </form>

      <ErrorMessage message={error} />

      {/* Results Section */}
      <div aria-live="polite" aria-atomic="true">
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
          </div>
        )}

        {!result && !loading && !error && (
          <div className="card card-padding" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <Search size={32} style={{ margin: '0 auto 12px', color: 'var(--border-strong)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Search Candidate Questions
            </h3>
            <p style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto' }}>
              Enter a question above or select an example to identify existing matches across the 90 indexed repository items.
            </p>
          </div>
        )}

        {result && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {noMatch ? 'Closest Matches' : 'Potential Duplicates'}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Found {matches.length} matches &middot; {result.method}
                </span>
              </div>
            </div>

            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {matches.map((match, index) => (
                <DuplicateMatchCard
                  key={match.id || index}
                  match={match}
                  rank={index + 1}
                  originalQuestion={question}
                />
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}
