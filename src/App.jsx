import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import AppLayout from './components/AppLayout.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import ComparePage from './pages/ComparePage.jsx'
import DuplicateFinder from './pages/DuplicateFinder.jsx'
import DatasetManagementPage from './pages/DatasetManagementPage.jsx'
import DatasetAnalyzer from './pages/DatasetAnalyzer.jsx'
import ModelTrainingPage from './pages/ModelTrainingPage.jsx'
import ModelPerformancePage from './pages/ModelPerformancePage.jsx'
import PredictionHistoryPage from './pages/PredictionHistoryPage.jsx'
import HowItWorksPage from './pages/HowItWorksPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public Home Page (Landing Page) */}
        <Route path="/" element={<LandingPage />} />

        {/* Inner Application Pages (with Dashboard Sidebar & Top Navbar) */}
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<OverviewPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="duplicate-finder" element={<DuplicateFinder />} />
          <Route path="finder" element={<Navigate to="/duplicate-finder" replace />} />
          <Route path="datasets" element={<DatasetManagementPage />} />
          <Route path="analyzer" element={<DatasetAnalyzer />} />
          <Route path="dataset" element={<Navigate to="/analyzer" replace />} />
          <Route path="training" element={<ModelTrainingPage />} />
          <Route path="train" element={<Navigate to="/training" replace />} />
          <Route path="performance" element={<ModelPerformancePage />} />
          <Route path="models" element={<Navigate to="/performance" replace />} />
          <Route path="history" element={<PredictionHistoryPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
