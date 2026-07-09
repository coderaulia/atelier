export interface Bindings {
  DB: D1Database
  JWT_SECRET: string
  JWT_SECRET_OLD?: string
  BETTER_AUTH_SECRET?: string
  BETTER_AUTH_URL?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  BREVO_API_KEY: string
  APP_URL?: string
  ALLOWED_ORIGINS?: string
  MIDTRANS_SERVER_KEY?: string
  MIDTRANS_BASE_URL?: string
  GROQ_API_KEY?: string
  ENVIRONMENT?: string
}
