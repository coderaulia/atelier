import { lazy, type LazyExoticComponent, type ReactNode } from 'react'

export type ToolCategory =
  | 'documents'
  | 'cv'
  | 'pdf'
  | 'image'
  | 'ocr'
  | 'social'

export interface ToolDefinition {
  id: string
  name: string
  description: string
  icon: ReactNode
  category: ToolCategory
  publicPath: string
  appPath: string
  component: LazyExoticComponent<any>
  freeDailyLimit: number
  proOnly: boolean
  badge?: 'new' | 'pro' | 'beta'
}

// Icons as simple emoji for now - can be replaced with proper icon components
const DocIcon = () => <>📄</>
const SocialIcon = () => <>📱</>
const CvIcon = () => <>📝</>
const PdfIcon = () => <>📕</>
const ImageIcon = () => <>🖼️</>
const OcrIcon = () => <>🔍</>
const FolderIcon = () => <>📁</>
const IdCardIcon = () => <>🪪</>
const FilePdfIcon = () => <>📕</>
const PhotoIcon = () => <>🖼️</>
const ScanIcon = () => <>🔎</>
const GridIcon = () => <>⚡</>
const CompressIcon = () => <>🗜️</>
const MergeIcon = () => <>📑</>
const OrganizeIcon = () => <>🗂️</>

export const TOOLS: ToolDefinition[] = [
  {
    id: 'document-generator',
    name: 'Document Generator',
    description: 'Agreements, invoices, proposals and more',
    icon: <DocIcon />,
    category: 'documents',
    publicPath: '/document-generator',
    appPath: '/app/documents',
    component: lazy(() => import('@/modules/documents/DocumentGeneratorTool')),
    freeDailyLimit: 5,
    proOnly: false,
  },
  {
    id: 'social-generator',
    name: 'Social Generator',
    description: 'Instagram, TikTok and Threads content',
    icon: <SocialIcon />,
    category: 'social',
    publicPath: '/social-generator',
    appPath: '/app/social',
    component: lazy(() => import('@/modules/social/SocialTool')),
    freeDailyLimit: 5,
    proOnly: false,
  },
  {
    id: 'cv-builder',
    name: 'CV Builder',
    description: 'ATS-friendly resume in minutes',
    icon: <CvIcon />,
    category: 'cv',
    publicPath: '/cv-builder',
    appPath: '/app/cv-builder',
    component: lazy(() => import('@/modules/cv/CVTool')),
    freeDailyLimit: 3,
    proOnly: false,
    badge: 'new',
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    description: 'Convert PDF pages to PNG or JPG',
    icon: <PdfIcon />,
    category: 'pdf',
    publicPath: '/pdf-to-image',
    appPath: '/app/pdf-to-image',
    component: lazy(() => import('@/modules/pdf-to-image/PDFToImageTool')),
    freeDailyLimit: 3,
    proOnly: false,
  },
  {
    id: 'pdf-merge',
    name: 'PDF Merge',
    description: 'Combine multiple PDFs into one',
    icon: <MergeIcon />,
    category: 'pdf',
    publicPath: '/pdf-merge',
    appPath: '/app/pdf-merge',
    component: lazy(() => import('@/modules/pdf-merge/PDFMergeTool')),
    freeDailyLimit: 3,
    proOnly: false,
  },
  {
    id: 'pdf-compress',
    name: 'PDF Compress',
    description: 'Reduce PDF file size',
    icon: <CompressIcon />,
    category: 'pdf',
    publicPath: '/pdf-compress',
    appPath: '/app/pdf-compress',
    component: lazy(() => import('@/modules/pdf-compress/PDFCompressTool')),
    freeDailyLimit: 3,
    proOnly: false,
  },
  {
    id: 'pdf-organize',
    name: 'PDF Organize',
    description: 'Reorder, rotate, remove, and extract pages',
    icon: <OrganizeIcon />,
    category: 'pdf',
    publicPath: '/pdf-organize',
    appPath: '/app/pdf-organize',
    component: lazy(() => import('@/modules/pdf-organize/PDFOrganizeTool')),
    freeDailyLimit: 3,
    proOnly: false,
    badge: 'new',
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert between PNG, JPG, WebP, AVIF',
    icon: <ImageIcon />,
    category: 'image',
    publicPath: '/image-converter',
    appPath: '/app/image-converter',
    component: lazy(() => import('@/modules/image-converter/ImageConverterTool')),
    freeDailyLimit: 3,
    proOnly: false,
  },
  {
    id: 'ocr',
    name: 'OCR',
    description: 'Extract text from images and PDFs',
    icon: <OcrIcon />,
    category: 'ocr',
    publicPath: '/ocr',
    appPath: '/app/ocr',
    component: lazy(() => import('@/modules/ocr/OCRTool')),
    freeDailyLimit: 3,
    proOnly: false,
  },
]

export const TOOL_CATEGORIES: Record<
  ToolCategory,
  {
    label: string
    icon: ReactNode
  }
> = {
  documents: { label: 'Documents', icon: <FolderIcon /> },
  cv: { label: 'CV & Resume', icon: <IdCardIcon /> },
  pdf: { label: 'PDF Tools', icon: <FilePdfIcon /> },
  image: { label: 'Image Tools', icon: <PhotoIcon /> },
  ocr: { label: 'OCR', icon: <ScanIcon /> },
  social: { label: 'Social Media', icon: <GridIcon /> },
}

export const getToolByAppPath = (path: string): ToolDefinition | undefined => {
  return TOOLS.find((t) => t.appPath === path || path.startsWith(t.appPath + '/'))
}

export const getToolByPublicPath = (path: string): ToolDefinition | undefined => {
  return TOOLS.find((t) => t.publicPath === path)
}

export const getToolById = (id: string): ToolDefinition | undefined => {
  return TOOLS.find((t) => t.id === id)
}

export const getToolsByCategory = (category: ToolCategory): ToolDefinition[] => {
  return TOOLS.filter((t) => t.category === category)
}

export const getAllCategories = (): ToolCategory[] => {
  return Array.from(new Set(TOOLS.map((t) => t.category)))
}
