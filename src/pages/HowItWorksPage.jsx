import React, { useState } from 'react'
import {
  Layers,
  Cpu,
  Database,
  Code2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sliders,
  Scale,
  BrainCircuit,
  Binary,
  Compass
} from 'lucide-react'

const PIPELINE_STAGES = [
  {
    step: '01',
    title: 'Text Preprocessing & Normalization',
    subtitle: 'NLTK / Regex Token Cleansing',
    icon: Code2,
    badge: 'Stage 1',
    description:
      'Raw natural language inputs contain noisy characters, inconsistent casing, punctuation variances, and contraction nuances. The normalization pipeline transforms raw questions into canonical token streams.',
    details: [
      'Case-folding to uniform lowercase representation',
      'Contraction expansion (e.g., "what\'s" → "what is", "can\'t" → "cannot")',
      'Punctuation removal with alphanumeric token preservation',
      'Whitespace stripping and whitespace normalization'
    ],
    example: {
      input: 'Q1: "How can I learn Python easily?!"\nQ2: "What\'s the fastest way to learn python?"',
      output: 'Q1_clean: "how can i learn python easily"\nQ2_clean: "what is the fastest way to learn python"'
    }
  },
  {
    step: '02',
    title: 'Multi-Perspective Feature Extraction',
    subtitle: '14 Dimensional NLP Vector Space',
    icon: Binary,
    badge: 'Stage 2',
    description:
      'Rather than relying solely on raw text overlap, QuerySense extracts 14 engineered statistical and lexical features comparing lexical, syntactic, and structural dimensions.',
    details: [
      'Word & Character Length Differences (normalized delta)',
      'Token Jaccard Overlap and Common Word Ratio',
      'TF-IDF Cosine Similarity across unigram & bigram vocabulary',
      'Fuzzy Levenshtein Ratio and Token Sort Ratio',
      'Longest Common Subsequence (LCS) ratio',
      'Semantic LSA (Latent Semantic Analysis) Cosine Vector'
    ],
    example: {
      input: 'Feature Vector Extraction',
      output: '[len_diff: 0.12, jaccard: 0.50, tfidf_cos: 0.74, fuzzy: 0.82, lsa_cos: 0.88, ...]'
    }
  },
  {
    step: '03',
    title: 'Latent Semantic Analysis (LSA)',
    subtitle: 'Dimensionality Reduction & Synonymy',
    icon: BrainCircuit,
    badge: 'Stage 3',
    description:
      'To catch duplicates that express the same meaning using completely different words (e.g. "purchase automobile" vs "buy a car"), QuerySense employs Truncated SVD over the term-document matrix.',
    details: [
      'Singular Value Decomposition (SVD) with 100 latent concepts',
      'Maps words into continuous semantic space',
      'Computes vector cosine angle in concept space',
      'Mitigates the vocabulary mismatch problem'
    ],
    example: {
      input: 'Concept Alignment',
      output: 'SVD(X) = U · Σ · V^T  →  Cosine Similarity: 0.88'
    }
  },
  {
    step: '04',
    title: 'Supervised ML Classification',
    subtitle: 'Calibrated Inference Ensemble',
    icon: Cpu,
    badge: 'Stage 4',
    description:
      'The 14 extracted features are fed into a trained supervised model (Logistic Regression or Random Forest). The model computes class probability and applies decision thresholds.',
    details: [
      'Trained on balanced Quora benchmark question pairs',
      'Logistic Regression with L2 regularization',
      'Optional Random Forest ensemble with 100 estimators',
      'Zero-token overlap guardrail preventing disjoint false-positives',
      'Probability calibration for reliable confidence scores'
    ],
    example: {
      input: 'Classifier Inference',
      output: 'P(Duplicate | Features) = 0.86 → Duplicate (Confidence: 86.4%)'
    }
  },
  {
    step: '05',
    title: 'Persistence & Feedback Loop',
    subtitle: 'Persistent Logging & Continuous Improvement',
    icon: Database,
    badge: 'Stage 5',
    description:
      'All comparisons and feedback ratings are saved to your history. This creates a full audit trail and allows the system to improve through your corrections.',
    details: [
      'Stores question pairs, similarity scores, and timestamps',
      'Captures your feedback to flag incorrect predictions',
      'Enables sub-millisecond lookups from indexed question history',
      'Full export capability for review and offline analysis'
    ],
    example: {
      input: 'History Record',
      output: 'Logged → Prediction #42, Score: 0.86, Status: Verified ✓'
    }
  }
]

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0)
  const current = PIPELINE_STAGES[activeStep]

  return (
    <div className="page-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">How QuerySense Works</h1>
          <p className="page-subtitle">
            An end-to-end look at the hybrid NLP pipeline, feature engineering, and supervised machine learning architecture.
          </p>
        </div>
      </div>

      {/* Architecture Overview Banner */}
      <div
        className="card"
        style={{
          padding: '28px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)',
          border: '1px solid var(--border-default)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '100px', background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
            <Sparkles size={14} /> Production Machine Learning Pipeline
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Hybrid Semantic & Lexical Architecture
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            QuerySense bridges traditional lexical similarity (character n-grams, Levenshtein edit distance, TF-IDF vectors) with semantic representation (Latent Semantic Analysis via Truncated SVD). The resulting 14-dimensional feature vector is classified by supervised machine learning models to detect duplicate questions with high precision.
          </p>
        </div>
      </div>

      {/* Interactive Pipeline Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {PIPELINE_STAGES.map((s, idx) => {
          const Icon = s.icon
          const isActive = activeStep === idx
          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(idx)}
              style={{
                background: isActive ? 'var(--primary-soft)' : 'var(--bg-surface)',
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {s.badge}
                </span>
                <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-secondary)'} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {s.title}
              </p>
            </button>
          )
        })}
      </div>

      {/* Active Stage Detailed Breakdown */}
      <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              STEP {current.step} OF 05
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {current.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {current.subtitle}
            </p>
          </div>
          <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
            {current.badge}
          </span>
        </div>

        <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '24px' }}>
          {current.description}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Key Operations */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Technical Operations:
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {current.details.map((d, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Transformation Example */}
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Data Transformation Example:
            </h3>
            <pre style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {current.example.input}
            </pre>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
              <ArrowRight size={16} color="var(--primary)" />
            </div>
            <pre style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--primary-dark)', fontWeight: 600, whiteSpace: 'pre-wrap', background: 'var(--primary-soft)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-light)' }}>
              {current.example.output}
            </pre>
          </div>
        </div>
      </div>

      {/* Feature Engineering Reference Table */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          14 Engineered Features Summary
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          The machine learning classifiers evaluate questions across the following vector dimensions:
        </p>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Feature Name</th>
                <th>Category</th>
                <th>Mathematical Basis</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>tfidf_cosine</code></td>
                <td><span className="badge badge-neutral">Lexical Vector</span></td>
                <td>Cosine(TFIDF(Q1), TFIDF(Q2))</td>
                <td>Dot product of normalized TF-IDF term vectors across unigrams & bigrams.</td>
              </tr>
              <tr>
                <td><code>lsa_cosine</code></td>
                <td><span className="badge badge-primary">Semantic Concept</span></td>
                <td>Cosine(SVD(Q1), SVD(Q2))</td>
                <td>Angle between latent semantic concept vectors capturing synonyms.</td>
              </tr>
              <tr>
                <td><code>jaccard_similarity</code></td>
                <td><span className="badge badge-neutral">Set Theoretic</span></td>
                <td>|Q1 ∩ Q2| / |Q1 ∪ Q2|</td>
                <td>Intersection over union of unique content words.</td>
              </tr>
              <tr>
                <td><code>fuzzy_ratio</code></td>
                <td><span className="badge badge-neutral">Edit Distance</span></td>
                <td>Levenshtein(Q1, Q2)</td>
                <td>Normalized minimum character insertions, deletions, and substitutions.</td>
              </tr>
              <tr>
                <td><code>fuzzy_token_sort</code></td>
                <td><span className="badge badge-neutral">Permutation</span></td>
                <td>Levenshtein(Sort(Q1), Sort(Q2))</td>
                <td>Edit distance resilient to word order permutations.</td>
              </tr>
              <tr>
                <td><code>len_diff_ratio</code></td>
                <td><span className="badge badge-neutral">Structural</span></td>
                <td>|len(Q1) - len(Q2)| / max(len)</td>
                <td>Normalized length discrepancy penalizing mismatched detail levels.</td>
              </tr>
              <tr>
                <td><code>common_words_ratio</code></td>
                <td><span className="badge badge-neutral">Lexical Overlap</span></td>
                <td>2 · |Q1 ∩ Q2| / (|Q1| + |Q2|)</td>
                <td>Harmonic mean of shared token counts.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
