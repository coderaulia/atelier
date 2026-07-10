import type { User } from './api'

export interface GlobalMetadata {
  company_name: string
  company_address: string
  username: string
  email: string
  profile_image_url: string
  company_logo_url: string
  website: string
  social_handle: string
  instagram_url: string
  linkedin_url: string
  x_url: string
  facebook_url: string
  tiktok_url: string
  youtube_url: string
  document_signatory: string
  tax_id: string
  payment_details: string
}

export const EMPTY_GLOBAL_METADATA: GlobalMetadata = {
  company_name: '',
  company_address: '',
  username: '',
  email: '',
  profile_image_url: '',
  company_logo_url: '',
  website: '',
  social_handle: '',
  instagram_url: '',
  linkedin_url: '',
  x_url: '',
  facebook_url: '',
  tiktok_url: '',
  youtube_url: '',
  document_signatory: '',
  tax_id: '',
  payment_details: '',
}

export function normalizeGlobalMetadata(value?: Partial<GlobalMetadata> | null): GlobalMetadata {
  const normalized = { ...EMPTY_GLOBAL_METADATA }
  if (!value) return normalized

  for (const key of Object.keys(normalized) as Array<keyof GlobalMetadata>) {
    const raw = value[key]
    normalized[key] = typeof raw === 'string' ? raw.trim() : ''
  }

  return normalized
}

export function hasGlobalMetadata(value?: Partial<GlobalMetadata> | null): boolean {
  const metadata = normalizeGlobalMetadata(value)
  return Object.values(metadata).some(Boolean)
}

export function metadataFingerprint(value?: Partial<GlobalMetadata> | null): string {
  return JSON.stringify(normalizeGlobalMetadata(value))
}

export function metadataToBrand(value?: Partial<GlobalMetadata> | null, user?: Pick<User, 'name' | 'email'> | null) {
  const metadata = normalizeGlobalMetadata(value)
  const handle = metadata.social_handle || metadata.username

  return compactObject({
    studioName: metadata.company_name,
    fullName: metadata.document_signatory || user?.name || metadata.username,
    handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '',
    email: metadata.email || user?.email || '',
    studioAddress: metadata.company_address,
    payment: metadata.payment_details,
    taxId: metadata.tax_id,
    logo: metadata.company_logo_url,
    logoAvatar: metadata.profile_image_url,
  })
}

function compactObject<T extends Record<string, string | undefined | null>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0)
  ) as Partial<T>
}
