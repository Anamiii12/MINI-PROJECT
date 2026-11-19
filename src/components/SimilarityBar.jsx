
export default function SimilarityBar({ score, height = 8 }) {
  const clamped = Math.max(0, Math.min(1, Number(score) || 0))
  const percentage = (clamped * 100).toFixed(1)

  // Gradient or solid color based on threshold
  let barColor = 'var(--text-muted)'
  if (clamped >= 0.70) {
    barColor = 'var(--primary)'
  } else if (clamped >= 0.50) {
    barColor = 'var(--primary-light)'
  } else if (clamped >= 0.30) {
    barColor = 'var(--warning)'
  }

  return (
    <div
      role="progressbar"
      aria-label="Similarity score"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Number(percentage)}
      aria-valuetext={`${percentage}%`}
      style={{
        width: '100%',
        height: `${height}px`,
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        position: 'relative'
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: barColor,
          borderRadius: 'var(--radius-full)',
          transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />
    </div>
  )
}
