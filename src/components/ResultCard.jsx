import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import SimilarityBar from './SimilarityBar.jsx'
import ExplainableResult from './ExplainableResult.jsx'
import { submitPredictionFeedback } from '../services/api.js'

export default function ResultCard({ result, question1, question2 }) {
  const [copied, setCopied] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState('')
  const [showFullDetails, setShowFullDetails] = useState(false)

  const isDup = Boolean(result.is_duplicate)
  const scorePercent = (result.similarity_score * 100).toFixed(1)
  const confidencePercent = result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : null

  const handleCopySummary = () => {
    const text = `QuerySense Comparison Analysis:\nQ1: ${question1 || ''}\nQ2: ${question2 || ''}\nResult: ${isDup ? 'Duplicate' : 'Non-Duplicate'} (${scorePercent}% similarity)\nMethod: ${result.method || 'TF-IDF'}`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = async (feedbackType) => {
    try {
      await submitPredictionFeedback(null, feedbackType, question1, question2)
      setFeedbackSent(feedbackType)
    } catch {
      setFeedbackSent(feedbackType)
    }
  }

  return (
    <section className="card card-padding animate-fade-in" aria-labelledby="result-heading" style={{ marginTop: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Evaluation Complete
          </span>
          <h2 id="result-heading" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Semantic Analysis Result
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleCopySummary} title="Copy result breakdown">
            {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
          <span className="badge badge-info">{result.method || 'Trained Model'}</span>
        </div>
      </div>

      {/* Main KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          padding: '20px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px'
        }}
      >
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
            CLASSIFICATION
          </span>
          <StatusBadge isDuplicate={isDup} size="md" />
        </div>

        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
            SIMILARITY SCORE
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {scorePercent}%
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ({isDup ? '≥ threshold' : '< threshold'})
            </span>
          </div>
        </div>

        {confidencePercent && (
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              MODEL CONFIDENCE
            </span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>
              {confidencePercent}
            </span>
          </div>
        )}

        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
            ALGORITHM
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {result.method}
          </span>
        </div>
      </div>

      {/* Visual Similarity Meter */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>0% Different</span>
          <span>50% Threshold</span>
          <span>100% Identical</span>
        </div>
        <SimilarityBar score={result.similarity_score} height={10} />
      </div>

      {/* Explanation text */}
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
        {result.explanation?.summary ||
          (isDup
            ? 'The questions demonstrate high lexical and semantic overlap with equivalent intent.'
            : 'The questions do not meet the minimum similarity threshold and address distinct concepts.')}
      </p>

      {/* Matched Words & Phrases Tags (if available) */}
      {result.explanation?.matched_words?.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            KEYWORD OVERLAP:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {result.explanation.matched_words.map((w) => (
              <span
                key={w}
                style={{
                  fontSize: '12px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--primary-soft)',
                  color: 'var(--primary-deep)',
                  fontWeight: 500
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Human Evaluation Feedback Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={15} style={{ color: 'var(--primary)' }} />
          <span>Is this classification correct?</span>
        </span>

        {feedbackSent ? (
          <span className="badge badge-success" style={{ gap: '6px' }}>
            <Check size={12} />
            <span>Feedback recorded: {feedbackSent.replace('_', ' ')}</span>
          </span>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleFeedback('correct_duplicate')}
              title="Confirm duplicate prediction"
            >
              <ThumbsUp size={13} style={{ color: 'var(--success)' }} />
              <span>Correct</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleFeedback('incorrect_duplicate')}
              title="Flag as incorrect duplicate"
            >
              <ThumbsDown size={13} style={{ color: 'var(--danger)' }} />
              <span>Incorrect</span>
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleFeedback('not_duplicate')}
              title="Mark as distinct non-duplicate"
            >
              <span>Not Duplicate</span>
            </button>
          </div>
        )}
      </div>

      {/* Expandable Deep Analysis (Legacy mock analysis support if available) */}
      {result.analysis && (
        <div style={{ marginTop: '20px' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowFullDetails(!showFullDetails)}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>Deep Text Overlap Analysis</span>
            {showFullDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showFullDetails && <ExplainableResult analysis={result.analysis} />}
        </div>
      )}
    </section>
  )
}
