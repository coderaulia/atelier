export type ToolPage = {
  slug: string
  path: string
  name: string
  primaryKeyword: string
  title: string
  description: string
  valueProp: string
  ogImage: string
  accent: string
  features: { icon: string; text: string }[]
  faqs: { question: string; answer: string }[]
}

export const siteUrl = 'https://studio.vanaila.com'
export const allStaticRoutes = ['/', '/pricing', '/pdf-to-image', '/pdf-merge', '/pdf-compress', '/image-converter', '/ocr', '/cv-builder', '/document-generator', '/social-generator']

export const toolPages: ToolPage[] = [
  {
    slug: 'pdf-to-image',
    path: '/pdf-to-image',
    name: 'PDF to Image Converter',
    primaryKeyword: 'PDF to image converter',
    title: 'PDF to Image Converter Online | Vanaila Studio',
    description: 'Convert PDF pages to JPG or PNG in your browser. Private, fast, free for small files, with Pro batch ZIP export.',
    valueProp: 'Turn PDF pages into sharp JPG or PNG files without sending documents to a server.',
    ogImage: `${siteUrl}/og/pdf-to-image.png`,
    accent: '#2c4a6b',
    features: [
      { icon: '🔒', text: 'Local browser rendering keeps sensitive PDFs private.' },
      { icon: '🖼️', text: 'Export pages as PNG or compressed JPG.' },
      { icon: '📦', text: 'Pro unlocks multi-page ZIP downloads.' },
      { icon: '⚡', text: 'Lazy-loaded pdf.js keeps page load fast.' },
    ],
    faqs: [
      { question: 'Can I convert PDF to JPG without uploading?', answer: 'Yes. Vanaila Studio renders PDF pages locally in your browser, so files never leave your device.' },
      { question: 'Can I convert only selected PDF pages to images?', answer: 'Yes. Select individual pages before downloading. Free users can try limited pages; Pro unlocks bulk export.' },
      { question: 'Does PDF to image work on mobile?', answer: 'Yes, but large PDFs may process faster on desktop because rendering uses your device memory and CPU.' },
      { question: 'Is this PDF to PNG converter free?', answer: 'Small conversions are free. Pro adds higher limits, bulk ZIP export, and faster workflow for frequent use.' },
      { question: 'Are my PDF files stored by Vanaila Studio?', answer: 'No. Conversion runs in-browser and files are not uploaded or stored.' },
    ],
  },
  {
    slug: 'image-converter',
    path: '/image-converter',
    name: 'Image Converter',
    primaryKeyword: 'image converter',
    title: 'Image Converter for PNG, JPG, WebP, AVIF | Vanaila Studio',
    description: 'Convert images between PNG, JPG, WebP, and AVIF locally in your browser. Free single files, Pro batch exports.',
    valueProp: 'Convert PNG, JPG, WebP, and AVIF files with private browser-side processing.',
    ogImage: `${siteUrl}/og/image-converter.png`,
    accent: '#3e5f7a',
    features: [
      { icon: '🎛️', text: 'Tune format, quality, and export settings.' },
      { icon: '🧩', text: 'WASM codecs load only when needed.' },
      { icon: '📚', text: 'Pro batch converts up to 20 files with ZIP download.' },
      { icon: '🔐', text: 'Images stay on your device during conversion.' },
    ],
    faqs: [
      { question: 'Can I convert WebP to JPG without uploading?', answer: 'Yes. Browser APIs and lazy-loaded codecs process images locally without server upload.' },
      { question: 'Does the image converter support AVIF?', answer: 'Yes. AVIF conversion is available through lazy-loaded WASM codecs where your browser supports it.' },
      { question: 'Is batch image conversion free?', answer: 'Free plan supports single-file conversion. Pro unlocks batch conversion and ZIP export.' },
      { question: 'Will image quality be reduced?', answer: 'Only if you choose lossy formats or lower quality settings. PNG exports preserve lossless output.' },
      { question: 'Are converted images watermarked?', answer: 'No. Vanaila Studio never adds watermarks on free or Pro exports.' },
    ],
  },
  {
    slug: 'ocr',
    path: '/ocr',
    name: 'Free OCR Text Recognition',
    primaryKeyword: 'free OCR text recognition',
    title: 'Free OCR Online for Images and PDFs | Vanaila Studio',
    description: 'Extract text from images and PDFs with free OCR in your browser. Private local recognition for English and Indonesian.',
    valueProp: 'Extract editable text from images and PDFs privately in your browser.',
    ogImage: `${siteUrl}/og/ocr.png`,
    accent: '#4a6fa5',
    features: [
      { icon: '🔍', text: 'Recognize text from PNG, JPG, WebP, and PDF pages.' },
      { icon: '🌏', text: 'English and Indonesian OCR language support.' },
      { icon: '📋', text: 'Copy recognized text or download as .txt.' },
      { icon: '🛡️', text: 'Tesseract runs locally; uploads are not required.' },
    ],
    faqs: [
      { question: 'Is this OCR free?', answer: 'Yes. You can run OCR for free within daily limits. Pro unlocks higher limits and multi-page workflows.' },
      { question: 'Can I OCR a PDF without uploading it?', answer: 'Yes. PDF pages render in your browser and OCR runs locally with Tesseract.js.' },
      { question: 'Does OCR support Indonesian text?', answer: 'Yes. Choose Indonesian or English before recognizing text.' },
      { question: 'Can OCR read handwriting?', answer: 'Typed or printed text works best. Handwriting accuracy depends on image clarity and letter style.' },
      { question: 'Where is OCR text stored?', answer: 'Recognized text stays in your browser unless you copy or download it.' },
    ],
  },
  {
    slug: 'cv-builder',
    path: '/cv-builder',
    name: 'CV Builder',
    primaryKeyword: 'CV builder',
    title: 'CV Builder Online with PDF Export | Vanaila Studio',
    description: 'Build a polished CV or resume online with live preview, browser PDF export, free templates, and Pro premium layouts.',
    valueProp: 'Create a polished resume with live preview and direct PDF download.',
    ogImage: `${siteUrl}/og/cv-builder.png`,
    accent: '#5a8fc7',
    features: [
      { icon: '📝', text: 'Guided sections for summary, experience, education, and skills.' },
      { icon: '👀', text: 'Live preview before exporting your PDF.' },
      { icon: '🎨', text: 'Free and Pro templates for different roles.' },
      { icon: '📄', text: 'Direct PDF blob export with no print dialog.' },
    ],
    faqs: [
      { question: 'Can I make a CV online for free?', answer: 'Yes. Free templates and daily exports are available. Pro unlocks premium templates and higher limits.' },
      { question: 'Does the CV builder export PDF?', answer: 'Yes. It generates a PDF directly in your browser for download.' },
      { question: 'Can I edit my resume after previewing it?', answer: 'Yes. Update sections and the live preview refreshes before export.' },
      { question: 'Are Pro CV templates watermarked?', answer: 'No. Vanaila Studio never adds watermarks to exported CVs.' },
      { question: 'Is my resume data uploaded?', answer: 'No. CV editing and PDF generation happen in your browser.' },
    ],
  },
  {
    slug: 'document-generator',
    path: '/document-generator',
    name: 'Document Generator',
    primaryKeyword: 'document generator',
    title: 'Document Generator for Freelancers | Vanaila Studio',
    description: 'Generate proposals, invoices, quotes, and client documents in browser with branded templates and private local export.',
    valueProp: 'Create polished freelance documents faster with branded templates and local export.',
    ogImage: `${siteUrl}/og/document-generator.png`,
    accent: '#2c4a6b',
    features: [
      { icon: '📑', text: 'Templates for proposals, quotes, invoices, and briefs.' },
      { icon: '🏷️', text: 'Brand settings help keep documents consistent.' },
      { icon: '🧮', text: 'Quote calculator support for faster pricing.' },
      { icon: '🔒', text: 'Document content stays in your browser.' },
    ],
    faqs: [
      { question: 'Can I generate business documents for free?', answer: 'Yes. Free daily usage is available, while Pro unlocks premium templates and unlimited workflow.' },
      { question: 'Does the document generator upload client data?', answer: 'No. Files and content stay local in your browser.' },
      { question: 'Can I make invoices and proposals in one app?', answer: 'Yes. Vanaila Studio includes multiple freelance document templates in one workspace.' },
      { question: 'Can I add my brand to documents?', answer: 'Yes. Use brand settings for logo, colors, and repeatable document identity.' },
      { question: 'Are generated documents watermarked?', answer: 'No. Free and Pro exports have no watermarks.' },
    ],
  },
  {
    slug: 'social-generator',
    path: '/social-generator',
    name: 'Social Media Generator',
    primaryKeyword: 'social media generator',
    title: 'Social Media Post Generator | Vanaila Studio',
    description: 'Create branded social media visuals and content templates in your browser. Fast, private, and built for freelancers.',
    valueProp: 'Design branded social posts and creator assets without leaving your browser.',
    ogImage: `${siteUrl}/og/social-generator.png`,
    accent: '#3e5f7a',
    features: [
      { icon: '📱', text: 'Templates for social posts and creator formats.' },
      { icon: '✨', text: 'Premium visual styles built for client-facing content.' },
      { icon: '🎯', text: 'Reusable brand assets keep every post consistent.' },
      { icon: '🛡️', text: 'Design data stays local during editing and export.' },
    ],
    faqs: [
      { question: 'Can I create social media posts for free?', answer: 'Yes. Free templates and daily exports are available. Pro unlocks premium styles and higher limits.' },
      { question: 'Does this social generator make Instagram posts?', answer: 'Yes. It supports creator-friendly visual layouts for social channels.' },
      { question: 'Can I use my own brand colors and logo?', answer: 'Yes. Vanaila Studio supports reusable brand assets across templates.' },
      { question: 'Are social exports watermarked?', answer: 'No. Exports never include Vanaila watermarks.' },
      { question: 'Is my social content uploaded?', answer: 'No. Editing and export happen locally in your browser.' },
    ],
  },
  {
    slug: 'pdf-merge',
    path: '/pdf-merge',
    name: 'PDF Merge Tool',
    primaryKeyword: 'merge PDF files online',
    title: 'Merge PDF Files Online Free | Vanaila Studio',
    description: 'Combine multiple PDFs into one file in your browser. Private, fast, free for 3 files, Pro for bulk merging.',
    valueProp: 'Merge up to 20 PDF files into one document without uploading to servers.',
    ogImage: `${siteUrl}/og/pdf-merge.png`,
    accent: '#2c4a6b',
    features: [
      { icon: '📑', text: 'Merge 2-20 PDF files into one.' },
      { icon: '🎯', text: 'Drag and drop to reorder files.' },
      { icon: '🔒', text: 'Files never leave your browser.' },
      { icon: '⚡', text: 'Instant client-side merging.' },
    ],
    faqs: [
      { question: 'Can I merge PDFs for free?', answer: 'Yes. Free plan allows merging up to 3 PDFs. Pro unlocks up to 20 PDFs per merge.' },
      { question: 'How many PDFs can I combine?', answer: 'Free: 3 PDFs. Pro: 20 PDFs per merge operation.' },
      { question: 'Are my PDF files uploaded?', answer: 'No. All merging happens in your browser using pdf-lib.' },
      { question: 'Can I reorder PDFs before merging?', answer: 'Yes. Drag and drop files to change merge order.' },
      { question: 'Does merging reduce PDF quality?', answer: 'No. Pages are copied exactly as-is with no quality loss.' },
    ],
  },
  {
    slug: 'pdf-compress',
    path: '/pdf-compress',
    name: 'PDF Compress Tool',
    primaryKeyword: 'compress PDF online',
    title: 'Compress PDF Online Free | Vanaila Studio',
    description: 'Reduce PDF file size in your browser. Private compression with quality preview. Free for small files, Pro for unlimited.',
    valueProp: 'Compress PDFs without uploading files to servers.',
    ogImage: `${siteUrl}/og/pdf-compress.png`,
    accent: '#4a6fa5',
    features: [
      { icon: '🗜️', text: 'Reduce file size with browser-side optimization.' },
      { icon: '👁️', text: 'Compare before and after file size.' },
      { icon: '🔒', text: 'Private compression; files stay on your device.' },
      { icon: '⚙️', text: 'Choose light, balanced, or maximum compression.' },
    ],
    faqs: [
      { question: 'How much can I compress a PDF?', answer: 'It depends on the PDF content. Files with unoptimized images usually shrink the most, while already-optimized PDFs may only reduce slightly.' },
      { question: 'Will compression reduce quality?', answer: 'Light compression keeps quality closest to original. Maximum compression prioritizes smaller file size.' },
      { question: 'Is PDF compression free?', answer: 'Yes. Free and anonymous users can compress within daily limits. Pro unlocks higher usage.' },
      { question: 'Are my files uploaded?', answer: 'No. Compression runs locally in your browser.' },
      { question: 'Can I compress password-protected PDFs?', answer: 'No. Remove password protection first, then compress the file.' },
    ],
  },
]

export function getToolByPath(pathname: string) {
  return toolPages.find((page) => page.path === pathname)
}

export function routeMeta(pathname: string) {
  const tool = getToolByPath(pathname)
  if (tool) return tool
  if (pathname === '/pricing') {
    return {
      title: 'Pricing | Vanaila Studio Pro',
      description: 'Upgrade Vanaila Studio for unlimited daily use, premium templates, bulk exports, and Pro browser tools.',
      ogImage: `${siteUrl}/og/pricing.png`,
      name: 'Vanaila Studio Pricing',
    }
  }
  return {
    title: 'Vanaila Studio — Browser Tools for Working Freelancers',
    description: 'Create documents, CVs, social posts, OCR, and file conversions privately in your browser with no watermarks.',
    ogImage: `${siteUrl}/og/home.png`,
    name: 'Vanaila Studio',
  }
}
