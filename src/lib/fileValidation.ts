export interface ValidationResult {
  valid: boolean
  error?: string
}

const PDF_MAX_SIZE = 50 * 1024 * 1024       // 50MB
const IMAGE_MAX_SIZE = 20 * 1024 * 1024      // 20MB
const OCR_IMAGE_MAX_SIZE = 10 * 1024 * 1024  // 10MB
const OCR_PDF_PAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

// ---------- PDF ----------

export async function validatePDF(file: File): Promise<ValidationResult> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return { valid: false, error: "This doesn't look like a valid PDF file." }
  }

  if (file.size > PDF_MAX_SIZE) {
    return { valid: false, error: 'File too large. Free plan supports up to 50MB.' }
  }

  // Check magic bytes
  try {
    const header = await file.slice(0, 5).text()
    if (header !== '%PDF-') {
      return { valid: false, error: "This doesn't look like a valid PDF file." }
    }
  } catch {
    return { valid: false, error: "Couldn't read file. Try a different file." }
  }

  return { valid: true }
}

export function warnPDFPageLimit(pageCount: number): string | null {
  if (pageCount > 50) {
    return 'Free plan supports up to 50 pages. Consider splitting the PDF.'
  }
  return null
}

// ---------- Images ----------

export function validateImage(file: File): ValidationResult {
  if (file.size > IMAGE_MAX_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 20MB.' }
  }

  const name = file.name.toLowerCase()
  if (name.endsWith('.heic') || file.type === 'image/heic' || file.type === 'image/heif') {
    return {
      valid: false,
      error: 'HEIC not supported yet. Convert to JPG on your phone first.',
    }
  }

  if (!ACCEPTED_IMAGE_MIMES.includes(file.type)) {
    return { valid: false, error: "This doesn't look like a valid image file." }
  }

  return { valid: true }
}

// ---------- OCR-specific ----------

export function validateOCRImage(file: File): ValidationResult {
  if (file.size > OCR_IMAGE_MAX_SIZE) {
    return { valid: false, error: 'Image too large. OCR supports up to 10MB per image.' }
  }
  return { valid: true }
}

export function validateOCRPDFPage(blobSize: number): ValidationResult {
  if (blobSize > OCR_PDF_PAGE_MAX_SIZE) {
    return { valid: false, error: 'Rendered page too large. OCR supports up to 5MB per page.' }
  }
  return { valid: true }
}

// ---------- CV Builder ----------

export interface CVValidationResult {
  valid: boolean
  missingName: boolean
  missingSections: boolean
  error?: string
}

export function validateCVData(data: {
  personal?: { fullName?: string }
  experience?: unknown[]
  education?: unknown[]
  skills?: unknown[]
}): CVValidationResult {
  const hasName = !!(data?.personal?.fullName?.trim())
  const hasSections = !!(
    data?.experience?.length ||
    data?.education?.length ||
    data?.skills?.length
  )

  if (!hasName) {
    return {
      valid: false,
      missingName: true,
      missingSections: !hasSections,
      error: 'Enter your name before exporting.',
    }
  }

  if (!hasSections) {
    return {
      valid: false,
      missingName: false,
      missingSections: true,
      error: 'Add at least one section (experience, education, or skills) to generate a CV.',
    }
  }

  return { valid: true, missingName: false, missingSections: false }
}
