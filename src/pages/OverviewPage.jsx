import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  GitCompare,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  BarChart2,
  Activity
} from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import SimilarityBar from '../components/SimilarityBar.jsx'
import { getDashboardStats, getPredictionHistory } from '../services/api.js'

export default function OverviewPage() {
  const [stats, setStats] = useState(null)
  const [recentPredictions, setRecentPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsData, historyData] = await Promise.all([
        getDashboardStats(),
        getPredictionHistory(6)
      ])
      setStats(statsData)
      setRecentPredictions(historyData || [])
    } catch {
      setError('Unable to load dashboard metrics. Please refresh to try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(loadData)
  }, [])

  const totalQuestions = stats?.total_questions ?? '—'
  const duplicatePairs = stats?.total_duplicate_pairs ?? '—'
  const totalDatasets = stats?.total_datasets ?? '—'
  const modelHasEvaluation = Boolean(stats && stats.active_model_name !== 'No evaluated model')
  const activeModelName = stats?.active_model_name || 'Unavailable'
  const modelAccuracy = modelHasEvaluation ? `${(stats.model_accuracy * 100).toFixed(1)}%` : 'Not evaluated'
  const modelF1 = modelHasEvaluation ? `${(stats.model_f1_score * 100).toFixed(1)}%` : 'Not evaluated'
  const categories = stats?.category_distribution || []

  const dupCount = stats?.duplicate_vs_non_duplicate?.duplicates ?? 0
  const nonDupCount = stats?.duplicate_vs_non_duplicate?.non_duplicates ?? 0
  const totalLabeled = dupCount + nonDupCount
  const dupPercent = totalLabeled ? Math.round((dupCount / totalLabeled) * 100) : 0
  const nonDupPercent = 100 - dupPercent

  return (
    <div className="animate-fade-in">
      {/* Welcome & Overview Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Platform Overview</h1>
          <p className="page-description">
            Live repository counts and recorded model evaluations from the QuerySense API.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/compare" className="btn btn-primary btn-sm">
            <GitCompare size={14} />
            <span>Compare Now</span>
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--danger-soft)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '13.5px'
          }}
        >
          {error}
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="metrics-grid">
        <StatCard
          label="Total Questions Analyzed"
          value={totalQuestions}
          icon={Layers}
          subtitle="Questions currently indexed by the API"
        />
        <StatCard
          label="Duplicate Pairs Identified"
          value={duplicatePairs}
          icon={GitCompare}
          subtitle="Labeled pairs in registered datasets"
        />
        <StatCard
          label="Active Model Accuracy"
          value={modelAccuracy}
          icon={Cpu}
          subtitle={modelHasEvaluation ? `Measured holdout result (${activeModelName})` : 'Run model evaluation to record a measured score'}
        />
        <StatCard
          label="Datasets Registered"
          value={totalDatasets}
          icon={Database}
          subtitle="Seeded benchmarks and uploaded CSV files"
        />
      </div>

      {/* Main Grid: Charts & Model Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '32px' }}>

        {/* Duplicate Distribution Card */}
        <div className="card card-padding">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 className="card-title">
                <BarChart2 size={17} style={{ color: 'var(--primary)' }} />
                <span>Pair Distribution & Balance</span>
              </h2>
              <p className="card-subtitle">Ratio of labeled pairs in registered datasets</p>
            </div>
            <span className="badge badge-info">Live dataset counts</span>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Duplicate Pairs: {dupCount} ({dupPercent}%)
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                Non-Duplicate: {nonDupCount} ({nonDupPercent}%)
              </span>
            </div>

            {/* Split Progress Bar */}
            <div
              style={{
                display: 'flex',
                height: '14px',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                backgroundColor: 'var(--border-subtle)',
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  width: `${dupPercent}%`,
                  backgroundColor: 'var(--primary)',
                  transition: 'width 0.5s ease'
                }}
                title={`Duplicate Pairs: ${dupPercent}%`}
              />
              <div
                style={{
                  width: `${nonDupPercent}%`,
                  backgroundColor: 'var(--accent-sage-dark)',
                  transition: 'width 0.5s ease'
                }}
                title={`Non-Duplicate Pairs: ${nonDupPercent}%`}
              />
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)' }} />
                <span>Duplicate Pairs ({dupCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--accent-sage-dark)' }} />
                <span>Non-Duplicate Pairs ({nonDupCount})</span>
              </div>
            </div>
          </div>

          {/* Quick Domain Distribution Bar Chart */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Top Domain Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.slice(0, 5).map((cat) => (
                <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                  <span style={{ width: '130px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.category}
                  </span>
                  <div style={{ flex: 1 }}>
                    <SimilarityBar score={cat.count / 15} height={6} />
                  </div>
                  <span style={{ width: '30px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Model Performance Summary Card */}
        <div className="card card-padding">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 className="card-title">
                <Activity size={17} style={{ color: 'var(--primary)' }} />
                <span>Active Model Architecture</span>
              </h2>
              <p className="card-subtitle">Trained on verified benchmark corpus</p>
            </div>
            <Link to="/performance" className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
              <span>Details</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeModelName}
              </span>
              <span className={`badge ${modelHasEvaluation ? 'badge-success' : 'badge-info'}`}>{modelHasEvaluation ? 'Evaluated' : 'Not evaluated'}</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Model metadata and scores are loaded from the backend evaluation registry.
            </p>
          </div>

          {/* Metrics Trio */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ padding: '12px 8px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>ACCURACY</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{modelAccuracy}</span>
            </div>
            <div style={{ padding: '12px 8px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>F1-SCORE</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{modelF1}</span>
            </div>
            <div style={{ padding: '12px 8px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>VERSION</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>{stats?.model_version || '—'}</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <Link to="/compare" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>
              <GitCompare size={14} />
              <span>Test Pair</span>
            </Link>
            <Link to="/training" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>
              <Cpu size={14} />
              <span>Retrain Model</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Inference Comparisons</h2>
            <p className="card-subtitle">Live detection logs and human feedback recorded by QuerySense</p>
          </div>
          <Link to="/history" className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
            <span>View Full History</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Question 1</th>
                <th style={{ width: '40%' }}>Question 2</th>
                <th>Similarity</th>
                <th>Classification</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {recentPredictions.length > 0 ? (
                recentPredictions.map((pred) => (
                  <tr key={pred.id}>
                    <td style={{ fontWeight: 500 }}>{pred.question1}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{pred.question2}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, width: '45px' }}>
                          {(pred.similarity_score * 100).toFixed(1)}%
                        </span>
                        <div style={{ width: '60px' }}>
                          <SimilarityBar score={pred.similarity_score} height={6} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge isDuplicate={pred.is_duplicate} size="sm" />
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {pred.model_name || 'TF-IDF Baseline'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No predictions recorded yet. Run a comparison to view live detection logs.
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
