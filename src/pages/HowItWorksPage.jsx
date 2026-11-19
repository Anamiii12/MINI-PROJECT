import { Activity, Database, ListFilter, Search, SlidersHorizontal } from 'lucide-react'

const stages = [
  {
    icon: SlidersHorizontal,
    title: 'Normalize question text',
    description: 'The API trims input, lowercases and normalizes punctuation, tokenizes the text, and removes stop words for vectorization.'
  },
  {
    icon: Activity,
    title: 'Extract pair features',
    description: 'The trained feature extractor computes TF-IDF cosine, token Jaccard and Dice, length ratios, common-token measures, character trigram overlap, first-token match, longest common substring, and LSA similarity.'
  },
  {
    icon: Search,
    title: 'Retrieve likely matches',
    description: 'Duplicate Finder represents the query and indexed questions with TF-IDF vectors, then ranks candidates with the selected classifier when there is lexical signal.'
  },
  {
    icon: ListFilter,
    title: 'Classify the pair',
    description: 'Pair comparison supports TF-IDF cosine, logistic regression, random forest, and an LSA logistic model. Each method returns its own score and classification.'
  },
  {
    icon: Database,
    title: 'Record results',
    description: 'The service stores prediction and finder history, and records submitted feedback. Feedback is not used to retrain models automatically.'
  }
]

const features = [
  ['tfidf_cosine', 'Cosine similarity between fitted unigram and bigram TF-IDF vectors.'],
  ['token_jaccard', 'Intersection over union of normalized tokens.'],
  ['token_dice', 'Dice overlap of normalized token sets.'],
  ['char_length_diff_ratio', 'Relative difference in normalized character counts.'],
  ['token_count_diff_ratio', 'Relative difference in normalized token counts.'],
  ['common_token_count', 'Count of shared meaningful tokens.'],
  ['common_token_ratio_min', 'Shared meaningful tokens divided by the smaller meaningful-token set.'],
  ['common_token_ratio_max', 'Shared meaningful tokens divided by the larger meaningful-token set.'],
  ['char_trigram_jaccard', 'Jaccard overlap of normalized character trigrams.'],
  ['first_word_match', 'Whether the first normalized tokens match.'],
  ['longest_common_substring_ratio', 'Longest shared contiguous substring relative to average text length.'],
  ['lsa_semantic_similarity', 'Cosine similarity after the fitted TF-IDF vectors are projected through truncated SVD.']
]

export default function HowItWorksPage() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">How QuerySense Works</h1>
          <p className="page-subtitle">The current API pipeline and the features used by its trained models.</p>
        </div>
      </div>

      <div className="metrics-grid">
        {stages.map(({ icon: Icon, title, description }, index) => (
          <article className="card card-padding" key={title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Icon size={18} color="var(--primary)" />
              <span className="badge badge-info">Stage {index + 1}</span>
            </div>
            <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>{title}</h2>
            <p className="card-subtitle">{description}</p>
          </article>
        ))}
      </div>

      <section className="card card-padding" style={{ marginTop: '24px' }}>
        <h2 className="card-title">Pair feature vector</h2>
        <p className="card-subtitle" style={{ marginBottom: '18px' }}>
          The feature extractor uses these 12 values. TF-IDF and LSA vector spaces are fitted from training data.
        </p>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Feature</th><th>What it measures</th></tr></thead>
            <tbody>
              {features.map(([name, description]) => (
                <tr key={name}><td><code>{name}</code></td><td>{description}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="pipeline-note" style={{ marginTop: '18px' }}>
        Similarity scores have method-specific meanings: the TF-IDF baseline returns cosine similarity, while classifier methods return the model’s duplicate-class probability. Evaluation metrics are shown only after a training run.
      </p>
    </div>
  )
}
