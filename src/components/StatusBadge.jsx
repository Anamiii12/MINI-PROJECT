import React from 'react'
import { Check, X } from 'lucide-react'

export default function StatusBadge({ isDuplicate, size = 'md' }) {
  const isDup = Boolean(isDuplicate)
  return (
    <span
      className={`badge ${isDup ? 'badge-duplicate' : 'badge-nondup'}`}
      style={{
        padding: size === 'sm' ? '3px 8px' : '5px 12px',
        fontSize: size === 'sm' ? '11px' : '12.5px',
        fontWeight: 600,
        letterSpacing: '0.2px'
      }}
    >
      {isDup ? (
        <>
          <Check size={size === 'sm' ? 12 : 14} strokeWidth={2.5} />
          <span>Duplicate</span>
        </>
      ) : (
        <>
          <X size={size === 'sm' ? 12 : 14} strokeWidth={2.5} />
          <span>Non-Duplicate</span>
        </>
      )}
    </span>
  )
}
