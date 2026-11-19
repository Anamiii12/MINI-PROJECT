import { useState } from 'react'
import QuestionComparisonForm from '../components/QuestionComparisonForm.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import ResultCard from '../components/ResultCard.jsx'
import { compareQuestions } from '../services/api.js'

export default function ComparePage() {
  const [question1, setQuestion1] = useState('')
  const [question2, setQuestion2] = useState('')
  const [selectedModel, setSelectedModel] = useState('TF-IDF + Cosine Similarity')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCompare(event) {
    if (event) event.preventDefault()
    if (loading || !question1.trim() || !question2.trim()) return
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await compareQuestions(question1.trim(), question2.trim(), selectedModel)
      setResult(res)
    } catch {
      setError('Unable to analyse the questions. Please verify input text.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setQuestion1('')
    setQuestion2('')
    setResult(null)
    setError('')
  }

  function handleQuestionChange(index, value) {
    if (index === 0) setQuestion1(value)
    else setQuestion2(value)
    setResult(null)
    setError('')
  }

  function handleSwap() {
    const temp = question1
    setQuestion1(question2)
    setQuestion2(temp)
    setResult(null)
    setError('')
  }

  function handleExample(kind) {
    if (loading) return
    if (kind === 'similar') {
      setQuestion1('How can I learn Python?')
      setQuestion2('What is the best way to learn Python?')
    } else {
      setQuestion1('How do I install Python?')
      setQuestion2('What is cloud computing?')
    }
    setResult(null)
    setError('')
  }

  return (
    <section id="compare" className="animate-fade-in" aria-labelledby="compare-heading">
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Pairwise Inference
            </span>
            <span className="badge badge-primary">
              <span className="status-dot-active" />
              Semantic Engine
            </span>
          </div>
          <h1 id="compare-heading">Compare Questions</h1>
          <p className="page-description">
            Evaluate two inquiries to detect semantic duplication, calculate similarity scores, and review explainable token matching.
          </p>
        </div>
      </div>

      <QuestionComparisonForm
        question1={question1}
        question2={question2}
        onQuestionChange={handleQuestionChange}
        onCompare={handleCompare}
        onSwap={handleSwap}
        onClear={handleClear}
        onExample={handleExample}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        loading={loading}
      />

      <ErrorMessage message={error} />

      <div aria-live="polite" aria-atomic="true">
        {result && (
          <ResultCard
            result={result}
            question1={question1}
            question2={question2}
          />
        )}
      </div>
    </section>
  )
}
