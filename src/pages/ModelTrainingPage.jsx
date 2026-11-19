import React, { useState, useEffect } from 'react'
import {
  Cpu,
  Play,
  RotateCw,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  BarChart2,
  Sliders,
  History,
  Tag
} from 'lucide-react'
import { trainModels, getModelHistory, getDatasets, isMockMode } from '../services/api.js'
import ErrorMessage from '../components/ErrorMessage.jsx'

const ARCHITECTURES = [
  {
    id: 'Logistic Regression Classifier',
    name: 'Logistic Regression (Calibrated)',
    desc: 'L2-regularized linear classifier trained over 12 lexical, statistical, and LSA features with Sigmoid probability calibration.',
    type: 'Linear / Calibrated',
    features: '12 Dimensions',
    recommended: false
  },
  {
    id: 'Random Forest Classifier',
    name: 'Random Forest Ensemble',
    desc: 'Non-linear ensemble of 100 decision trees (depth 6) evaluating interaction terms between lexical trigrams, dice, and semantic overlap.',
    type: 'Non-Linear Ensemble',
    features: '100 Trees',
    recommended: true
  },
  {
    id: 'Semantic LSA Similarity Model',
    name: 'Latent Semantic Analysis (LSA)',
    desc: 'Truncated Singular Value Decomposition (15 components) capturing latent conceptual synonymy beyond pure word overlap.',
    type: 'Latent Semantic',
    features: '15 Latent Concepts',
    recommended: false
  },
  {
    id: 'TF-IDF + Cosine Similarity',
    name: 'TF-IDF + Cosine Baseline',
    desc: 'Unigram and bigram TF-IDF vectorizer measuring direct cosine angle between token representations with sublinear term scaling.',
    type: 'Vector Space Baseline',
    features: 'Unigram + Bigram',
    recommended: false
  }
]

export default function ModelTrainingPage() {
  const [history, setHistory] = useState([])
  const [datasets, setDatasets] = useState([])
  const [selectedDatasets, setSelectedDatasets] = useState([])
  const [versionTag, setVersionTag] = useState(`v2.${Math.floor(Date.now() / 100000) % 100}`)
  const [training, setTraining] = useState(false)
  const [trainResult, setTrainResult] = useState(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)

  const loadData = async () => {
    try {
      const [histData, dsData] = await Promise.all([
        getModelHistory().catch(() => []),
        getDatasets().catch(() => [])
      ])
      setHistory(histData || [])
      setDatasets(dsData || [])
    } catch {
      // Background loading
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Timer while training
  useEffect(() => {
    let interval = null
    if (training) {
      setElapsed(0)
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [training])

  const handleTrainSubmit = async (e) => {
    e.preventDefault()
    if (isMockMode) {
      setError('Training service is currently unavailable. Please try again.')
      return
    }

    setTraining(true)
    setError('')
    setTrainResult(null)
    try {
      const ids = selectedDatasets.length > 0 ? selectedDatasets : null
      const res = await trainModels(ids, versionTag.trim())
      setTrainResult(res)
      await loadData()
    } catch (err) {
      setError(err.message || 'Model training cycle failed.')
    } finally {
      setTraining(false)
    }
  }

  const toggleDatasetSelection = (id) => {
    setSelectedDatasets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              ML Operations
            </span>
            <span className="badge badge-primary">
              <span className="status-dot-active" />
              Training Engine
            </span>
          </div>
          <h1>Model Training Center</h1>
          <p className="page-description">
            Execute real training cycles across all 4 duplicate question architectures with strict 80/20 train/test splits, leak prevention, and persistence.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Model Architectures Showcase Cards */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Configured Model Architectures
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {ARCHITECTURES.map((arch) => (
            <div
              key={arch.id}
              className="card card-padding"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: arch.recommended ? '3px solid var(--primary)' : '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-info">{arch.type}</span>
                  {arch.recommended && <span className="badge badge-success">Recommended</span>}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {arch.name}
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {arch.desc}
                </p>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                <span>Features: {arch.features}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Trained on Demand</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Training Configuration Form */}
      <form onSubmit={handleTrainSubmit} className="card card-padding" style={{ marginBottom: '32px' }}>
        <h2 className="card-title" style={{ marginBottom: '6px' }}>
          <Sliders size={18} style={{ color: 'var(--primary)' }} />
          <span>Training Pipeline Configuration</span>
        </h2>
        <p className="card-subtitle" style={{ marginBottom: '20px' }}>
          Configure version tag and select training corpora to trigger automated feature fitting, evaluation, and artifact serialization.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {/* Version Tag */}
          <div className="form-group">
            <label className="form-label">Model Version Tag *</label>
            <input
              type="text"
              className="input-field"
              value={versionTag}
              onChange={(e) => setVersionTag(e.target.value)}
              placeholder="e.g. v2.1-production"
              required
              disabled={training}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Artifacts will be serialized to disk as <code>.joblib</code> with this release tag.
            </span>
          </div>

          {/* Dataset Selector */}
          <div className="form-group">
            <label className="form-label">
              Corpora Selection (Leave empty to use all datasets)
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                maxHeight: '130px',
                overflowY: 'auto'
              }}
            >
              {datasets.length > 0 ? (
                datasets.map((d) => (
                  <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedDatasets.includes(d.id)}
                      onChange={() => toggleDatasetSelection(d.id)}
                      disabled={training}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>{d.name} ({d.total_rows} rows)</span>
                  </label>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  All registered datasets will be combined.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={training || !versionTag.trim()}
            >
              {training ? (
                <>
                  <span className="spinner" />
                  <span>Training Models ({elapsed}s)...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Execute Training Pipeline</span>
                </>
              )}
            </button>
          </div>

          {training && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--primary)' }}>
              <Clock size={15} className="spinner" />
              <span>Fitting feature extractors, stratified 80/20 splitting &amp; calculating confusion matrices...</span>
            </div>
          )}
        </div>
      </form>

      {/* Training Success Banner */}
      {trainResult && (
        <div
          className="card card-padding animate-fade-in"
          style={{
            backgroundColor: 'var(--primary-soft)',
            borderColor: 'var(--primary-light)',
            marginBottom: '32px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-deep)' }}>
              Training Pipeline Finished Successfully!
            </h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Model version <strong>{trainResult.version}</strong> completed in <strong>{trainResult.elapsed_seconds}s</strong>. Best performing model on the test split: <strong>{trainResult.best_model}</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL SAMPLES</span>
              <span style={{ fontSize: '16px', fontWeight: 700, display: 'block' }}>{trainResult.total_pairs}</span>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TRAIN SPLIT (80%)</span>
              <span style={{ fontSize: '16px', fontWeight: 700, display: 'block' }}>{trainResult.train_count} pairs</span>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TEST SPLIT (20%)</span>
              <span style={{ fontSize: '16px', fontWeight: 700, display: 'block' }}>{trainResult.test_count} pairs</span>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>BEST TEST MODEL</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
                {trainResult.best_model}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Historical Training Runs Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Training Execution History ({history.length})</h2>
            <p className="card-subtitle">Chronological record of model versions and test metrics recorded in SQLite</p>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Version</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>Test Samples</th>
                <th>Duration</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((run) => (
                  <tr key={run.id}>
                    <td style={{ fontWeight: 600 }}>{run.model_name}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        {run.version}
                      </span>
                    </td>
                    <td>{(run.accuracy * 100).toFixed(1)}%</td>
                    <td>{(run.precision * 100).toFixed(1)}%</td>
                    <td>{(run.recall * 100).toFixed(1)}%</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {(run.f1_score * 100).toFixed(1)}%
                    </td>
                    <td>{run.test_samples}</td>
                    <td>{run.training_time_sec ? `${run.training_time_sec.toFixed(2)}s` : '0.5s'}</td>
                    <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {run.created_at ? run.created_at.replace('T', ' ').slice(0, 19) : 'Recent'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No training history recorded yet. Trigger a training cycle above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
