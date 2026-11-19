const technologies = [['Frontend', 'React + Vite'], ['Backend', 'FastAPI', 'Planned'], ['NLP', 'NLTK / spaCy', 'Planned'], ['Similarity', 'TF-IDF + trained model', 'Planned'], ['Database', 'Firebase', 'Optional']]
export default function AboutPage() {
  return <section id="about" aria-labelledby="about-heading">
    <p className="eyebrow">Project Information</p><h1 id="about-heading">About QuerySense</h1>
    <p className="intro">Intelligent Duplicate Question Detection Using Text Similarity Techniques</p>
    <div className="about-section about-page-grid">
      <div className="about-copy">
        <h2>Project Overview</h2><p>QuerySense is a CSE mini-project for comparing question pairs and finding potential duplicates in a collection of questions.</p>
        <h2>Project Objective</h2><p>Help users review similar questions before posting and identify repeated questions in datasets, with transparent results and explanations.</p>
        <h2>Current Implementation Status</h2><p>Prediction, duplicate search, dataset analysis, model evaluation, and dataset management use the QuerySense FastAPI backend. Model results identify the inference method returned by the backend.</p>
      </div>
      <div className="stack-panel"><h2>Technology Stack</h2><dl className="technology-grid">{technologies.map(([name, value, status]) => <div key={name}><dt>{name}</dt><dd>{value}{status && <span className="technology-status">{status}</span>}</dd></div>)}</dl>
        <h2>Architecture Summary</h2><p className="muted">React pages use a shared API service to call the FastAPI backend. The backend applies text preprocessing, TF-IDF retrieval, trained classifiers, and pairwise similarity analysis. Local development can explicitly use demo data; production builds use the configured API.</p>
      </div>
    </div>
  </section>
}
