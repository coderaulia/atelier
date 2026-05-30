import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
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
      <App />
    </BrowserRouter>
  </StrictMode>
)