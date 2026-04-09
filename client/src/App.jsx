import './App.css'
import UploadForm from './components/UploadForm'
import { generateBacklog, exportToCSV } from './services/api'
import BacklogDisplay from './components/BacklogDisplay'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthPages from './components/AuthPages'
import LandingPage from './components/LandingPage'
import SuccessPage from './components/SuccessPage'
import CancelPage from './components/CancelPage'

function App() {
  const [backlog, setBacklog] = useState(null)
  const handleGenerate = async (data) => {
    const result = await generateBacklog(data)
    setBacklog(result)
  }
  const handleExport = async (backlog) => {
    const blob = await exportToCSV(backlog)
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${backlog.project_name || 'Product Backlog'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPages />} />
        <Route path="/backlog" element={<BacklogDisplay setBacklog={setBacklog} backlog={backlog} onExport={handleExport} />} />
        <Route path="/upload" element={<UploadForm onGenerate={handleGenerate} setBacklog={setBacklog} />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
      </Routes>
    </Router>
  )
}

export default App
