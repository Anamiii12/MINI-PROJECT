import React, { useRef, useState } from 'react'
import {
  UploadCloud,
  FileText,
  BarChart2,
  Download,
  AlertCircle,
  RotateCcw,
  Sparkles,
  PieChart,
  CheckCircle2
} from 'lucide-react'
import { analyzeDataset, isMockMode } from '../services/api.js'
import { validateCsvFile, parseQuestionCsv, createSampleCsv, downloadCsv } from '../utils/csv.js'
import { MAX_DEMO_QUESTIONS } from '../utils/textAnalysis.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import DatasetResults from '../components/DatasetResults.jsx'
import StatCard from '../components/StatCard.jsx'

export default function DatasetAnalyzer() {
  const [dataset, setDataset] = useState(null)
  const [filename, setFilename] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reading, setReading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef(null)
  const busy = loading || reading
  const selection = useRef(0)

  async function loadFile(file) {
    if (busy || !file) return
    const request = ++selection.current
    setResult(null)
    setDataset(null)
    setError('')
    setFilename('')
    setReading(true)
    try {
      validateCsvFile(file)
      const parsed = parseQuestionCsv(await file.text())
      if (request !== selection.current) return
      setDataset(parsed)
      setFilename(file.name)
    } catch (failure) {
      setError(failure.message || 'Unable to read this CSV file.')
    } finally {
      setReading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  function clear() {
    selection.current++
    setDataset(null)
    setFilename('')
    setResult(null)
    setError('')
    if (fileInput.current) fileInput.current.value = ''
  }

  async function analyse() {
    if (!dataset || busy) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await analyzeDataset(dataset.questions)
      setResult(res)
    } catch {
      setError('Unable to analyse this dataset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate descriptive stats from parsed questions
  const totalParsed = dataset?.questions?.length || 0
  const avgLen = totalParsed
    ? Math.round(dataset.questions.reduce((acc, q) => acc + q.length, 0) / totalParsed)
    : 0

  return (
    <section id="dataset" className="animate-fade-in" aria-labelledby="dataset-heading">
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Batch Ingestion
            </span>
            <span className="badge badge-primary">
              <span className="status-dot-active" />
              Corpus Intelligence
            </span>
          </div>
          <h1 id="dataset-heading">Dataset Analyzer</h1>
          <p className="page-description">
            Ingest question files, audit data quality, and compute all pairwise similarity combinations across the collection.
          </p>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="card card-padding" style={{ marginBottom: '24px' }} aria-busy={busy}>
        <div
          className={`upload-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (!busy) {
              if (e.dataTransfer.files.length !== 1) setError('Please drop one CSV file at a time.')
              else loadFile(e.dataTransfer.files[0])
            }
          }}
          onClick={() => fileInput.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '36px 20px',
            textAlign: 'center',
            backgroundColor: dragging ? 'var(--primary-soft)' : 'var(--bg-subtle)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            marginBottom: '20px'
          }}
        >
          <input
            className="sr-only"
            ref={fileInput}
            type="file"
            id="dataset-file"
            aria-label="Upload question CSV"
            accept=".csv,text/csv"
            disabled={busy}
            onChange={(e) => loadFile(e.target.files[0])}
          />
          <UploadCloud size={36} style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {dataset ? filename : 'Drag & drop CSV here or click to browse'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            CSV &middot; Maximum 2 MB &middot; 1–500 characters per question
          </p>
        </div>

        {/* Dataset Stats Row (When dataset loaded) */}
        {dataset && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PARSED QUESTIONS</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                {totalParsed}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>IGNORED / OVERLONG</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block' }}>
                {dataset.ignored || 0}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>AVG QUESTION LENGTH</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
                {avgLen} chars
              </span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>DATA QUALITY STATUS</span>
              <span className="badge badge-success" style={{ marginTop: '4px' }}>
                Valid UTF-8 Clean
              </span>
            </div>
          </div>
        )}

        {/* Workspace Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              disabled={!dataset || busy}
              onClick={analyse}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Analysing Dataset Combinations...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Analyse Dataset</span>
                </>
              )}
            </button>
            <button
              className="btn btn-ghost"
              disabled={busy || !dataset}
              onClick={clear}
            >
              <RotateCcw size={14} />
              <span>Clear Dataset</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => downloadCsv(createSampleCsv(), 'querysense-sample.csv')}
          >
            <Download size={14} />
            <span>Download Sample CSV</span>
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Results Section */}
      <div role="status">
        {reading ? (
          <p className="card card-padding" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Preparing questions from CSV...</p>
        ) : loading ? (
          <div className="card card-padding" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--primary)', margin: '0 auto 12px' }} />
            <p>Comparing all unordered pairs (i, j) where 1 ≤ i &lt; j ≤ min(N, 100)...</p>
          </div>
        ) : null}
      </div>

      {result && <DatasetResults result={result} />}
    </section>
  )
}
