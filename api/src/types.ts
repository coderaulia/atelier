export interface Bindings {
  DB: D1Database
  JWT_SECRET: string
  JWT_SECRET_OLD?: string
  RESEND_API_KEY: string
  APP_URL?: string
  ALLOWED_ORIGINS?: string
  MIDTRANS_SERVER_KEY?: string
  MIDTRANS_BASE_URL?: string
  GROQ_API_KEY?: string
  ENVIRONMENT?: string
}
