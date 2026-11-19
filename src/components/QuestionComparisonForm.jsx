import React from 'react'
import {
  ArrowRightLeft,
  Sparkles,
  RotateCcw,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react'

export default function QuestionComparisonForm({
  question1,
  question2,
  onQuestionChange,
  onCompare,
  onSwap,
  onClear,
  onExample,
  selectedModel,
  onSelectModel,
  loading
}) {
  return (
    <form className="card animate-fade-in" onSubmit={onCompare} aria-busy={loading} style={{ overflow: 'hidden' }}>
      {/* Top Model Selection Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Classification Engine:
          </span>
          <select
            className="select-field"
            value={selectedModel || 'TF-IDF + Cosine Similarity'}
            onChange={(e) => onSelectModel && onSelectModel(e.target.value)}
            disabled={loading}
            style={{
              padding: '6px 28px 6px 10px',
              fontSize: '12.5px',
              fontWeight: 500,
              width: 'auto',
              minWidth: '220px'
            }}
          >
            <option value="TF-IDF + Cosine Similarity">TF-IDF + Cosine Similarity (Baseline)</option>
            <option value="Random Forest Classifier">Random Forest Classifier (Ensemble)</option>
            <option value="Logistic Regression Classifier">Logistic Regression (Calibrated)</option>
            <option value="Semantic LSA Similarity Model">Semantic LSA Latent Vectors</option>
          </select>
        </div>

        {/* Example Question Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Examples:</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onExample('similar')}
            disabled={loading}
          >
            <Sparkles size={12} style={{ color: 'var(--primary)' }} />
            <span>Similar pair</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onExample('different')}
            disabled={loading}
          >
            <span>Different pair</span>
          </button>
        </div>
      </div>

      {/* Two-Column Comparison Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          padding: '28px'
        }}
      >
        {/* Question 1 Input Column */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label htmlFor="question-1" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                1
              </span>
              <span>Source Question</span>
            </label>
            <span
              id="count-1"
              style={{
                fontSize: '11px',
                color: question1.length >= 450 ? 'var(--warning)' : 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {question1.length} / 500
            </span>
          </div>

          <textarea
            id="question-1"
            className="textarea-field"
            rows={5}
            maxLength={500}
            value={question1}
            disabled={loading}
            onChange={(e) => onQuestionChange(0, e.target.value)}
            placeholder="e.g. How can I learn Python programming effectively for data science?"
            required
            style={{ minHeight: '140px' }}
          />
        </div>

        {/* Question 2 Input Column */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label htmlFor="question-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                2
              </span>
              <span>Comparison Target</span>
            </label>
            <span
              id="count-2"
              style={{
                fontSize: '11px',
                color: question2.length >= 450 ? 'var(--warning)' : 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {question2.length} / 500
            </span>
          </div>

          <textarea
            id="question-2"
            className="textarea-field"
            rows={5}
            maxLength={500}
            value={question2}
            disabled={loading}
            onChange={(e) => onQuestionChange(1, e.target.value)}
            placeholder="e.g. What is the best way to start learning Python for beginners?"
            required
            style={{ minHeight: '140px' }}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !question1.trim() || !question2.trim()}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Analysing Questions...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Compare Questions</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onSwap}
            disabled={loading || (!question1 && !question2)}
            title="Swap Source and Target questions"
          >
            <ArrowRightLeft size={14} />
            <span>Swap</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClear}
            disabled={loading || (!question1 && !question2)}
          >
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>
        </div>

        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Both inputs are pre-normalized and tokenized for comparison.
        </span>
      </div>
    </form>
  )
}
