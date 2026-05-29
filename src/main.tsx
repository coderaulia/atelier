import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import DocumentTool from './modules/documents/DocumentTool'
import CVTool from './modules/cv/CVTool'
import PDFToImageTool from './modules/pdf-to-image/PDFToImageTool'
import ImageConverterTool from './modules/image-converter/ImageConverterTool'
import OCRTool from './modules/ocr/OCRTool'
import ErrorBoundary from './components/ErrorBoundary'
import './modules/documents/documents.css'
import './modules/cv/cv.css'
import './modules/pdf-to-image/pdf-to-image.css'
import './modules/image-converter/image-converter.css'
import './modules/ocr/ocr.css'
import './landing.css'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/app', element: <ErrorBoundary><DocumentTool /></ErrorBoundary> },
  { path: '/cv', element: <ErrorBoundary><CVTool /></ErrorBoundary> },
  { path: '/pdf-to-image', element: <ErrorBoundary><PDFToImageTool /></ErrorBoundary> },
  { path: '/image-converter', element: <ErrorBoundary><ImageConverterTool /></ErrorBoundary> },
  { path: '/ocr', element: <ErrorBoundary><OCRTool /></ErrorBoundary> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)