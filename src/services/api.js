import { getMockPrediction } from '../mocks/prediction.js'
import { getMockMatches, getMockDataset } from '../mocks/detection.js'
import { DATASET_THRESHOLD } from '../utils/textAnalysis.js'
import { questions as demoQuestions } from '../mocks/questions.js'

export const demoQuestionCount = demoQuestions.length
export const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')
// Development can use local demos; production must opt in explicitly.
export const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true' ||
  (!import.meta.env.PROD && import.meta.env.VITE_USE_MOCK_API !== 'false')

function validatePrediction(data) {
  if (!data || typeof data.is_duplicate !== 'boolean' ||
    typeof data.similarity_score !== 'number' || !Number.isFinite(data.similarity_score) ||
    data.similarity_score < 0 || data.similarity_score > 1 ||
    typeof data.method !== 'string' || !data.method.trim() ||
    data.label !== (data.is_duplicate ? 'Duplicate' : 'Non-Duplicate')) {
    throw new Error('Invalid prediction response')
  }
  return data
}

export async function compareQuestions(question1, question2, modelName = null) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const first = question1.trim()
    const second = question2.trim()
    if (!first || !second || first.length > 500 || second.length > 500) throw new Error('Invalid input')
    if (isMockMode) return validatePrediction(await getMockPrediction(first, second))
    const body = { question1: first, question2: second }
    if (modelName) body.model_name = modelName
    const response = await fetch(`${baseUrl}/api/v1/predict`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: controller.signal,
    })
    if (!response.ok) throw new Error('Prediction request failed')
    const raw = await response.json()
    const data = validatePrediction(raw)
    // Return standard contract while preserving optional confidence and explanation
    return {
      is_duplicate: data.is_duplicate,
      similarity_score: data.similarity_score,
      label: data.label,
      method: data.method,
      confidence: data.confidence,
      explanation: data.explanation,
      model_version: data.model_version
    }
  } catch {
    throw new Error('Unable to analyse the questions. Please try again.')
  } finally {
    clearTimeout(timeout)
  }
}

function validScore(score) { return typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1 }
function validText(text) { return typeof text === 'string' && text.trim().length > 0 && text.length <= 500 }
function validCount(count) { return Number.isInteger(count) && count >= 0 }

async function postJson(endpoint, body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: controller.signal,
    })
    if (!response.ok) throw new Error('Request failed')
    return await response.json()
  } finally { clearTimeout(timeout) }
}

async function getJson(endpoint) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.statusText}`)
    return await response.json()
  } finally { clearTimeout(timeout) }
}

export async function findSimilarQuestions(question, options = {}) {
  try {
    if (!validText(question)) throw new Error('Invalid question')
    const payload = {
      question: question.trim(),
      limit: options.limit || 5
    }
    if (options.threshold !== undefined) payload.threshold = options.threshold
    if (options.category) payload.category = options.category
    if (options.sort_by) payload.sort_by = options.sort_by
    if (options.page) payload.page = options.page
    if (options.page_size) payload.page_size = options.page_size
    const data = isMockMode
      ? await getMockMatches(question.trim())
      : await postJson('/api/v1/find-similar', payload)

    if (!data || typeof data.method !== 'string' || !data.method.trim() || !Array.isArray(data.matches) || data.matches.some(match => !match || !validText(match.question) || !validScore(match.similarity_score))) {
      throw new Error('Invalid response')
    }

    const matches = (options.sort_by === 'lowest' ? data.matches.slice().sort((a, b) => a.similarity_score - b.similarity_score) : data.matches.slice().sort((a, b) => b.similarity_score - a.similarity_score))
      .slice(0, options.limit || 5)
      .map((match, index) => ({
        id: match.id || index + 1,
        question: match.question,
        similarity_score: match.similarity_score,
        is_duplicate: match.is_duplicate,
        confidence: match.confidence,
        category: typeof match.category === 'string' ? match.category : null,
        matched_terms: Array.isArray(match.matched_terms) && match.matched_terms.every(term => typeof term === 'string') ? [...new Set(match.matched_terms)] : null,
        explanation: match.explanation
      }))

    return {
      method: data.method,
      matches,
      total_matches: data.total_matches || matches.length,
      page: data.page || 1,
      page_size: data.page_size || 10
    }
  } catch {
    throw new Error('Unable to search for similar questions. Please try again.')
  }
}

export async function analyzeDataset(questions, customThreshold = DATASET_THRESHOLD) {
  try {
    if (!Array.isArray(questions) || questions.length < 2 || questions.some(question => !validText(question))) throw new Error('Invalid questions')
    const data = isMockMode ? await getMockDataset(questions) : await postJson('/api/v1/analyze-dataset', { questions, threshold: customThreshold })
    if (!data || !validCount(data.total_questions) || data.total_questions !== questions.length || !validCount(data.analysed_questions) || data.analysed_questions < 2 || data.analysed_questions > data.total_questions || !validScore(data.highest_similarity) || !validScore(data.threshold) || typeof data.method !== 'string' || !data.method.trim() || !Array.isArray(data.pairs)) throw new Error('Invalid response')
    const seen = new Set()
    for (const pair of data.pairs) {
      if (!pair || !validCount(pair.row1) || !validCount(pair.row2) || pair.row1 < 1 || pair.row2 <= pair.row1 || pair.row2 > data.analysed_questions || !validText(pair.question1) || !validText(pair.question2) || !validScore(pair.similarity_score) || pair.similarity_score < data.threshold || pair.similarity_score > data.highest_similarity) throw new Error('Invalid pair')
      const key = `${pair.row1}-${pair.row2}`
      if (seen.has(key)) throw new Error('Repeated pair')
      seen.add(key)
    }
    return { ...data, pairs: data.pairs.slice().sort((a, b) => b.similarity_score - a.similarity_score) }
  } catch { throw new Error('Unable to analyse this dataset. Please try again.') }
}

// -------------------------------------------------------------
// Extended Real Backend Platform Services
// -------------------------------------------------------------

export async function getDashboardStats() {
  if (isMockMode) {
    return {
      total_questions: 90,
      total_duplicate_pairs: 87,
      total_datasets: 4,
      unique_questions: 90,
      average_similarity_score: 0.62,
      model_accuracy: 0.93,
      model_f1_score: 0.92,
      model_precision: 0.91,
      model_recall: 0.93,
      active_model_name: "Random Forest Classifier",
      model_version: "v2.0",
      category_distribution: [
        { category: "Programming", count: 6 },
        { category: "Technology", count: 6 },
        { category: "Education", count: 6 },
        { category: "Money & Finance", count: 6 },
        { category: "Health & Fitness", count: 6 }
      ],
      recent_activities: [],
      duplicate_vs_non_duplicate: { duplicates: 87, non_duplicates: 74 }
    }
  }
  return await getJson('/api/v1/dashboard/stats')
}

export async function getSuggestions(query, limit = 5) {
  if (isMockMode || !query || query.trim().length < 2) return []
  try {
    const data = await getJson(`/api/v1/suggest?query=${encodeURIComponent(query.trim())}&limit=${limit}`)
    return data.suggestions || []
  } catch {
    return []
  }
}

export async function getDatasets() {
  if (isMockMode) return []
  return await getJson('/api/v1/datasets')
}

export async function uploadDataset(file, name, source = 'User Upload', description = '') {
  if (isMockMode) throw new Error('Dataset uploads require active backend.')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', name)
  formData.append('source', source)
  formData.append('description', description)

  const response = await fetch(`${baseUrl}/api/v1/datasets/upload`, {
    method: 'POST',
    body: formData
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Dataset upload failed.')
  }
  return await response.json()
}

export async function previewDataset(datasetId, limit = 20) {
  if (isMockMode) return { records: [] }
  return await getJson(`/api/v1/datasets/${datasetId}/preview?limit=${limit}`)
}

export async function deleteDataset(datasetId) {
  if (isMockMode) return { status: 'success' }
  const response = await fetch(`${baseUrl}/api/v1/datasets/${datasetId}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete dataset.')
  return await response.json()
}

export function getDownloadDatasetUrl(datasetId) {
  return `${baseUrl}/api/v1/datasets/${datasetId}/download`
}

export async function getModels() {
  if (isMockMode) return []
  return await getJson('/api/v1/models')
}

export async function trainModels(datasetIds = null, versionTag = null) {
  if (isMockMode) throw new Error('Model training requires live backend connection.')
  return await postJson('/api/v1/models/train', {
    dataset_ids: datasetIds,
    version_tag: versionTag
  })
}

export async function getModelHistory() {
  if (isMockMode) return []
  return await getJson('/api/v1/models/history')
}

export async function getPredictionHistory(limit = 50) {
  if (isMockMode) return []
  return await getJson(`/api/v1/history?limit=${limit}`)
}

export async function clearPredictionHistory() {
  if (isMockMode) return { status: 'success' }
  const response = await fetch(`${baseUrl}/api/v1/history`, { method: 'DELETE' })
  return await response.json()
}

export async function submitPredictionFeedback(predictionId, feedback, q1 = null, q2 = null) {
  if (isMockMode) return { status: 'success', message: 'Demo feedback recorded.' }
  return await postJson('/api/v1/feedback', {
    prediction_id: predictionId,
    feedback,
    question1: q1,
    question2: q2
  })
}

export async function getFinderHistory(limit = 30) {
  if (isMockMode) return []
  return await getJson(`/api/v1/finder-history?limit=${limit}`)
}

export async function clearFinderHistory() {
  if (isMockMode) return { status: 'success' }
  const response = await fetch(`${baseUrl}/api/v1/finder-history`, { method: 'DELETE' })
  return await response.json()
}

export async function getDuplicateClusters(minSimilarity = 0.55) {
  if (isMockMode) return []
  return await getJson(`/api/v1/explorer/clusters?min_similarity=${minSimilarity}`)
}

export async function healthCheck() {
  if (isMockMode) return { status: 'healthy', mode: 'mock' }
  const res = await fetch(`${baseUrl}/health`)
  if (!res.ok) throw new Error('Health check failed')
  return await res.json()
}

const api = {
  baseUrl,
  isMockMode,
  demoQuestionCount,
  compareQuestions,
  findSimilarQuestions,
  analyzeDataset,
  getSuggestions,
  healthCheck,
  getDashboardStats,
  getDatasets,
  uploadDataset,
  deleteDataset,
  previewDataset,
  getDownloadDatasetUrl,
  getModels,
  trainModels,
  getModelHistory,
  getPredictionHistory,
  clearPredictionHistory,
  submitPredictionFeedback,
  getFinderHistory,
  clearFinderHistory,
  getDuplicateClusters
}

export default api
