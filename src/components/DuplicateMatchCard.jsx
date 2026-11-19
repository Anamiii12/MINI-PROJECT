import { Tag } from 'lucide-react'
import SimilarityBar from './SimilarityBar.jsx'
import { getFinderSimilarityLabel } from '../utils/textAnalysis.js'

export default function DuplicateMatchCard({ match, rank }) {
  const scorePercent = (match.similarity_score * 100).toFixed(1)
  const isHigh = match.similarity_score >= 0.70

  return (
    <li
      className="card card-padding animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderLeft: isHigh ? '4px solid var(--primary)' : '1px solid var(--border-subtle)',
        marginBottom: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isHigh ? 'var(--primary)' : 'var(--bg-subtle)',
              color: isHigh ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            #{rank}
          </span>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {match.question}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span className={`badge ${isHigh ? 'badge-duplicate' : 'badge-info'}`}>
                {getFinderSimilarityLabel(match.similarity_score)}
              </span>
              {match.category && (
                <span className="badge" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                  <Tag size={10} />
                  <span>{match.category}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score & Meter */}
        <div style={{ minWidth: '110px', textAlign: 'right' }}>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {scorePercent}%
          </span>
          <div style={{ marginTop: '4px' }}>
            <SimilarityBar score={match.similarity_score} height={6} />
          </div>
        </div>
      </div>

      {/* Matched Normalized Terms */}
      {match.matched_terms && match.matched_terms.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>MATCHED KEYWORDS:</span>
          {match.matched_terms.map((term) => (
            <span
              key={term}
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary-deep)',
                fontWeight: 500
              }}
            >
              {term}
            </span>
          ))}
        </div>
      )}

      {/* Explanation Snippet */}
      {match.explanation && (
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
          {match.explanation}
        </p>
      )}
    </li>
  )
}
