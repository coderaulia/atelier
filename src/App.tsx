import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmailNotice from './pages/VerifyEmailNotice'
import ToolLanding from './pages/ToolLanding'
import { toolPages } from './pages/toolPages'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
import RefundPolicy from './pages/legal/RefundPolicy'

const DocumentTool = lazy(() => import('./modules/documents/DocumentTool'))
const CVTool = lazy(() => import('./modules/cv/CVTool'))
const PDFToImageTool = lazy(() => import('./modules/pdf-to-image/PDFToImageTool'))
const ImageConverterTool = lazy(() => import('./modules/image-converter/ImageConverterTool'))
const OCRTool = lazy(() => import('./modules/ocr/OCRTool'))

/* Marketing demo modes: wrap tools with limited scope */
function DocGeneratorDemo() { return <DocumentTool mode="documents" /> }
function SocialGeneratorDemo() { return <DocumentTool mode="social" /> }

const toolComponents: Record<string, any> = {
  'pdf-to-image': PDFToImageTool,
  'image-converter': ImageConverterTool,
  ocr: OCRTool,
  'cv-builder': CVTool,
  'document-generator': DocGeneratorDemo,
  'social-generator': SocialGeneratorDemo,
}

function ToolRoute({ slug }: { slug: string }) {
  const tool = toolPages.find((page) => page.slug === slug)
  const LiveTool = toolComponents[slug]

  if (!tool || !LiveTool) {
    return (
      <main className="not-found-page">
        <h1>Tool not found</h1>
        <Link to="/">Back to Vanaila Studio</Link>
      </main>
    )
  }

  return (
    <ToolLanding tool={tool}>
      <ErrorBoundary>
        <Suspense fallback={<div className="tool-lazy-card">Loading live tool…</div>}>
          <LiveTool />
        </Suspense>
      </ErrorBoundary>
    </ToolLanding>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account" element={<Account />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmailNotice />} />
      <Route path="/pricing" element={<Landing />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/refund" element={<RefundPolicy />} />
      <Route path="/app" element={<ToolRoute slug="document-generator" />} />
      {toolPages.map((tool) => (
        <Route key={tool.slug} path={tool.path} element={<ToolRoute slug={tool.slug} />} />
      ))}
    </Routes>
  )
}
