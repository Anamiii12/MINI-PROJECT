import React, { useState } from 'react'
import { Download, Filter, ArrowUpDown, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react'
import { getSimilarityLabel } from '../utils/textAnalysis.js'
import { createResultsCsv, downloadCsv } from '../utils/csv.js'
import SimilarityBar from './SimilarityBar.jsx'
import StatusBadge from './StatusBadge.jsx'

export default function DatasetResults({ result }) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('highest')
  const [page, setPage] = useState(1)

  const filtered = result.pairs
    .filter((pair) => filter === 'all' || getSimilarityLabel(pair.similarity_score) === filter)
    .slice()
    .sort((a, b) =>
      sort === 'highest'
        ? b.similarity_score - a.similarity_score
        : a.similarity_score - b.similarity_score
    )

  const pageCount = Math.max(1, Math.ceil(filtered.length / 15))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * 15, currentPage * 15)

  return (
    <div className="card card-padding animate-fade-in" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Batch Analysis Summary
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Identified {result.pairs.length} potential duplicate pairs exceeding {(result.threshold * 100).toFixed(0)}% threshold
          </p>
        </div>
        <span className="badge badge-info">{result.method}</span>
      </div>

      {/* KPI Summary Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          padding: '16px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL QUESTIONS</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
            {result.total_questions}
          </span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>EVALUATED QUESTIONS</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
            {result.analysed_questions}
          </span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>CANDIDATE DUPLICATE PAIRS</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
            {result.pairs.length}
          </span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>HIGHEST SIMILARITY</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
            {(result.highest_similarity * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Filter size={14} />
            <span>Filter:</span>
            <select
              className="select-field"
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1) }}
              style={{ padding: '4px 26px 4px 8px', fontSize: '12px' }}
            >
              <option value="all">All Matches</option>
              <option value="Highly Similar">Highly Similar (≥75%)</option>
              <option value="Similar">Similar (≥50%)</option>
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <ArrowUpDown size={14} />
            <span>Sort:</span>
            <select
              className="select-field"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              style={{ padding: '4px 26px 4px 8px', fontSize: '12px' }}
            >
              <option value="highest">Highest Similarity</option>
              <option value="lowest">Lowest Similarity</option>
            </select>
          </label>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          disabled={!filtered.length}
          onClick={() => downloadCsv(createResultsCsv(filtered), 'querysense-results.csv')}
        >
          <Download size={14} />
          <span>Export Results ({filtered.length})</span>
        </button>
      </div>

      {/* Pairs Table */}
      <div className="table-container" style={{ border: 'none', borderRadius: 'var(--radius-md)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Question A</th>
              <th style={{ width: '40%' }}>Question B</th>
              <th style={{ width: '120px' }}>Similarity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((pair) => (
                <tr key={`${pair.row1}-${pair.row2}`}>
                  <td style={{ fontWeight: 500 }}>{pair.question1}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{pair.question2}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600, width: '42px', fontSize: '12.5px' }}>
                        {(pair.similarity_score * 100).toFixed(1)}%
                      </span>
                      <div style={{ width: '45px' }}>
                        <SimilarityBar score={pair.similarity_score} height={6} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {getSimilarityLabel(pair.similarity_score)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  {result.pairs.length ? 'No pairs match the selected filter.' : 'No candidate duplicate pairs meet the current threshold.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {pageCount}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
