import { useState, useEffect } from 'react'
import {

  Search,
  Trash2,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react'
import {
  getPredictionHistory,
  clearPredictionHistory,
  submitPredictionFeedback
} from '../services/api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import SimilarityBar from '../components/SimilarityBar.jsx'
import Modal from '../components/Modal.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function PredictionHistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 15

  // Details Modal
  const [selectedRecord, setSelectedRecord] = useState(null)

  const loadHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPredictionHistory(100)
      setHistory(data || [])
    } catch {
      setError('Unable to load prediction history from database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(loadHistory)
  }, [])

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all prediction history records?')) return
    try {
      await clearPredictionHistory()
      setSuccessMsg('Prediction history cleared.')
      setHistory([])
    } catch {
      setError('Failed to clear prediction history.')
    }
  }

  const handleFeedback = async (id, feedbackType) => {
    try {
      await submitPredictionFeedback(id, feedbackType)
      setHistory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, feedback: feedbackType } : item))
      )
      setSuccessMsg('Human feedback recorded successfully.')
    } catch {
      setError('Failed to record feedback.')
    }
  }

  const handleExportCSV = () => {
    if (!history.length) return
    const headers = ['id', 'question1', 'question2', 'similarity_score', 'is_duplicate', 'model_name', 'feedback', 'created_at']
    const rows = history.map((h) => [
      h.id,
      `"${(h.question1 || '').replace(/"/g, '""')}"`,
      `"${(h.question2 || '').replace(/"/g, '""')}"`,
      h.similarity_score,
      h.is_duplicate ? 1 : 0,
      `"${h.model_name || ''}"`,
      h.feedback || '',
      h.created_at || ''
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `querysense_history_${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Filtered and paginated list
  const filtered = history.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.question1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.question2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'duplicate' && item.is_duplicate) ||
      (statusFilter === 'non-duplicate' && !item.is_duplicate)
    return matchesSearch && matchesStatus
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Audit Trail
            </span>
            <span className="badge badge-primary">
              <span className="status-dot-active" />
              Audit Ledger
            </span>
          </div>
          <h1>Prediction History &amp; Human Feedback</h1>
          <p className="page-description">
            Complete audit trail of all previous question comparisons, model inference confidence, and recorded human evaluation feedback.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} disabled={!history.length}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleClearHistory} disabled={!history.length}>
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {successMsg && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--success-soft)',
            color: 'var(--success)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card card-padding"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search questions or model name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            style={{ padding: '6px 28px 6px 10px', fontSize: '13px', width: 'auto' }}
          >
            <option value="all">All Classifications</option>
            <option value="duplicate">Duplicates Only</option>
            <option value="non-duplicate">Non-Duplicates Only</option>
          </select>
        </div>
      </div>

      {/* History Data Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Question 1</th>
                <th style={{ width: '32%' }}>Question 2</th>
                <th>Similarity</th>
                <th>Classification</th>
                <th>Human Feedback</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.question1}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.question2}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, width: '42px', fontSize: '13px' }}>
                          {(item.similarity_score * 100).toFixed(1)}%
                        </span>
                        <div style={{ width: '45px' }}>
                          <SimilarityBar score={item.similarity_score} height={6} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge isDuplicate={item.is_duplicate} size="sm" />
                    </td>
                    <td>
                      {item.feedback ? (
                        <span className="badge badge-success" style={{ fontSize: '11px' }}>
                          {item.feedback.replace('_', ' ')}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => handleFeedback(item.id, 'correct_duplicate')}
                            title="Confirm duplicate"
                          >
                            <ThumbsUp size={13} style={{ color: 'var(--success)' }} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => handleFeedback(item.id, 'not_duplicate')}
                            title="Mark not duplicate"
                          >
                            <ThumbsDown size={13} style={{ color: 'var(--danger)' }} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedRecord(item)}
                        title="View details"
                      >
                        <Eye size={13} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading prediction history...' : 'No historical predictions match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pageCount > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)'
            }}
          >
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Page {currentPage} of {pageCount} ({filtered.length} total)
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

      {/* Prediction Details Modal */}
      <Modal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Prediction Audit Details"
        footer={
          <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
            Close
          </button>
        }
      >
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SOURCE QUESTION</span>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                {selectedRecord.question1}
              </p>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>COMPARISON QUESTION</span>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                {selectedRecord.question2}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>CLASSIFICATION</span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge isDuplicate={selectedRecord.is_duplicate} />
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SIMILARITY SCORE</span>
                <span style={{ fontSize: '16px', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                  {(selectedRecord.similarity_score * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>MODEL USED</span>
                <span style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginTop: '4px' }}>
                  {selectedRecord.model_name}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>DATE RECORDED</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  {selectedRecord.created_at || 'Recent'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
