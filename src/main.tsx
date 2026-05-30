import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Overview from './pages/Admin/Overview'
import Users from './pages/Admin/Users'
import UserDetail from './pages/Admin/UserDetail'
import Transactions from './pages/Admin/Transactions'
import Errors from './pages/Admin/Errors'
import Account from './pages/Account'
import Receipt from './pages/Receipt'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import './modules/documents/documents.css'
import './modules/cv/cv.css'
import './modules/pdf-to-image/pdf-to-image.css'
import './modules/pdf-merge/pdf-merge.css'
import './modules/pdf-compress/pdf-compress.css'
import './modules/image-converter/image-converter.css'
import './modules/ocr/ocr.css'
import './landing.css'
import './tool-landing.css'
import './lib/i18n'
import './marketing-demo.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<ErrorBoundary><Overview /></ErrorBoundary>} />
        <Route path="/admin/users" element={<ErrorBoundary><Users /></ErrorBoundary>} />
        <Route path="/admin/users/:id" element={<ErrorBoundary><UserDetail /></ErrorBoundary>} />
        <Route path="/admin/transactions" element={<ErrorBoundary><Transactions /></ErrorBoundary>} />
        <Route path="/admin/errors" element={<ErrorBoundary><Errors /></ErrorBoundary>} />
        <Route path="/account" element={<ErrorBoundary><Account /></ErrorBoundary>} />
        <Route path="/receipt/:transaction_id" element={<ErrorBoundary><Receipt /></ErrorBoundary>} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)