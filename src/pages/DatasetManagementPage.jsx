import { useState, useEffect, useRef } from 'react'
import {

  UploadCloud,
  FileText,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  Plus,
  RefreshCw
} from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import {
  getDatasets,
  uploadDataset,
  deleteDataset,
  previewDataset,
  getDownloadDatasetUrl
} from '../services/api.js'

export default function DatasetManagementPage() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Upload form state
  const [uploadName, setUploadName] = useState('')
  const [uploadSource, setUploadSource] = useState('User Upload')
  const [uploadDesc, setUploadDesc] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const loadDatasets = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getDatasets()
      setDatasets(data || [])
    } catch {
      setError('Unable to load datasets. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(loadDatasets)
  }, [])

  const handleFileDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.name.toLowerCase().endsWith('.csv') && file.size <= 2 * 1024 * 1024) {
        setSelectedFile(file)
        if (!uploadName) {
          setUploadName(file.name.replace('.csv', '').replace(/[-_]/g, ' '))
        }
      } else if (file.size > 2 * 1024 * 1024) {
        setError('CSV files must be 2 MB or smaller.')
      } else {
        setError('Only CSV (.csv) files are supported.')
      }
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Only CSV (.csv) files are supported.')
      } else if (file.size > 2 * 1024 * 1024) {
        setError('CSV files must be 2 MB or smaller.')
      } else {
        setSelectedFile(file)
        if (!uploadName) {
          setUploadName(file.name.replace(/\.csv$/i, '').replace(/[-_]/g, ' '))
        }
      }
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile || !uploadName.trim()) {
      setError('Please provide a dataset name and select a CSV file.')
      return
    }

    setUploading(true)
    setError('')
    setSuccessMsg('')
    try {
      await uploadDataset(selectedFile, uploadName.trim(), uploadSource, uploadDesc)
      setSuccessMsg(`Dataset "${uploadName}" uploaded and indexed successfully!`)
      setSelectedFile(null)
      setUploadName('')
      setUploadDesc('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadDatasets()
    } catch (err) {
      setError(err.message || 'Failed to upload dataset.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete dataset "${name}"?`)) return
    try {
      await deleteDataset(id)
      setSuccessMsg(`Dataset "${name}" deleted.`)
      await loadDatasets()
    } catch {
      setError('Failed to delete dataset.')
    }
  }

  const handleOpenPreview = async (id) => {
    setPreviewLoading(true)
    setPreviewOpen(true)
    setPreviewData(null)
    try {
      const data = await previewDataset(id, 25)
      setPreviewData(data)
    } catch {
      setError('Failed to load dataset preview records.')
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Corpus Management
            </span>
            <span className="badge badge-primary">
              <span className="status-dot-active" />
              Active Repository
            </span>
          </div>
          <h1>Dataset Management</h1>
          <p className="page-description">
            Upload custom question pairs or single inquiry repositories, preview imported records, and manage benchmark training corpora.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadDatasets} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Refresh</span>
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

      {/* Drag & Drop Upload Panel */}
      <div className="card card-padding" style={{ marginBottom: '32px' }}>
        <h2 className="card-title" style={{ marginBottom: '6px' }}>
          <UploadCloud size={18} style={{ color: 'var(--primary)' }} />
          <span>Upload Custom Dataset</span>
        </h2>
        <p className="card-subtitle" style={{ marginBottom: '20px' }}>
          Auto-detects Pair format (<code>question1, question2, is_duplicate</code>) or Single question repository format (<code>question, category</code>).
        </p>

        <form onSubmit={handleUploadSubmit}>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-strong)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: isDragging ? 'var(--primary-soft)' : 'var(--bg-subtle)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              marginBottom: '20px'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <UploadCloud size={36} style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {selectedFile ? selectedFile.name : 'Drag & drop your CSV dataset here, or click to browse'}
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB · Ready to import` : 'Standard UTF-8 CSV · Maximum 2 MB'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}
          >
            <div className="form-group">
              <label className="form-label">Dataset Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. StackOverflow Python Duplicate Pairs"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Source / Origin</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Internal Helpdesk, Kaggle, StackExchange"
                value={uploadSource}
                onChange={(e) => setUploadSource(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Brief summary of domain and data curation criteria"
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {selectedFile && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || !selectedFile || !uploadName.trim()}
            >
              {uploading ? (
                <>
                  <span className="spinner" />
                  <span>Importing & Indexing...</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Upload & Index Dataset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Registered Datasets Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Registered Corpus Datasets ({datasets.length})</h2>
            <p className="card-subtitle">Active benchmark and imported training collections</p>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Dataset Name</th>
                <th>Source</th>
                <th>Format</th>
                <th>Total Rows</th>
                <th>Duplicates</th>
                <th>Non-Duplicates</th>
                <th>Training Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.length > 0 ? (
                datasets.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} style={{ color: 'var(--primary)' }} />
                        <div>
                          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{d.name}</strong>
                          {d.filename && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                              {d.filename}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{d.source || 'Standard'}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        {d.is_pair_format ? 'Pairs (Q1, Q2)' : 'Questions List'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.total_rows}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 500 }}>{d.duplicate_rows}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.non_duplicate_rows}</td>
                    <td>
                      <span className={`badge ${d.used_in_training ? 'badge-success' : 'badge-info'}`}>
                        {d.used_in_training ? 'Used in Training' : 'Available'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenPreview(d.id)}
                          title="Preview records"
                        >
                          <Eye size={13} />
                          <span>Preview</span>
                        </button>
                        <a
                          href={getDownloadDatasetUrl(d.id)}
                          className="btn btn-secondary btn-sm"
                          download
                          title="Download cleaned CSV"
                        >
                          <Download size={13} />
                        </a>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(d.id, d.name)}
                          title="Delete dataset"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading datasets...' : 'No datasets registered. Upload a CSV file above to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Preview: ${previewData?.dataset_name || 'Dataset Records'}`}
        maxWidth="800px"
        footer={
          <button className="btn btn-secondary" onClick={() => setPreviewOpen(false)}>
            Close
          </button>
        }
      >
        {previewLoading && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--primary)', margin: '0 auto 12px' }} />
            <p>Loading dataset sample records...</p>
          </div>
        )}

        {previewData && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Showing sample preview of {previewData.records?.length || 0} records:
            </p>
            <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: '12.5px' }}>
                <thead>
                  <tr>
                    {previewData.is_pair_format ? (
                      <>
                        <th>Question 1</th>
                        <th>Question 2</th>
                        <th>Duplicate</th>
                        <th>Category</th>
                      </>
                    ) : (
                      <>
                        <th>Question</th>
                        <th>Category</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {previewData.records?.map((r, i) => (
                    <tr key={r.id || i}>
                      {previewData.is_pair_format ? (
                        <>
                          <td>{r.question1}</td>
                          <td>{r.question2}</td>
                          <td>
                            <span className={`badge ${r.is_duplicate ? 'badge-duplicate' : 'badge-nondup'}`}>
                              {r.is_duplicate ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>{r.category || 'General'}</td>
                        </>
                      ) : (
                        <>
                          <td>{r.question}</td>
                          <td>{r.category || 'General'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
