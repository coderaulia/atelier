/**
 * Seed admin user into local D1 database.
 *
 * Usage:
 *   node api/scripts/seed-admin.mjs                  # default email/password
 *   node api/scripts/seed-admin.mjs admin@studio.com mypassword
 */

import { execSync } from 'node:child_process'
import { randomBytes, pbkdf2Sync } from 'node:crypto'

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: node api/scripts/seed-admin.mjs <email> <password>')
  console.error('Example: node api/scripts/seed-admin.mjs admin@yoursite.com SecurePass123!')
  process.exit(1)
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

// Match api/src/lib/password.ts: PBKDF2, SHA-256, versioned hash format.
const ALGORITHM = 'pbkdf2_sha256'
const ITERATIONS = 600_000
const salt = randomBytes(16)
const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256')
  .toString('hex')
const saltHex = salt.toString('hex')
const passwordHash = `${ALGORITHM}$${ITERATIONS}$${saltHex}$${hash}`

// Escape single quotes for SQL
const safeEmail = email.replace(/'/g, "''")
const safeHash = passwordHash.replace(/'/g, "''")

const sql = `
INSERT INTO users (email, password_hash, plan, role, status, email_verified)
VALUES ('${safeEmail}', '${safeHash}', 'pro', 'admin', 'active', 1)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '${safeHash}',
  role = 'admin',
  status = 'active';
`.trim()

console.log('\nCreating the requested admin account...\n')

try {
  // Write SQL to temp file, execute via wrangler
  const { writeFileSync, unlinkSync } = await import('node:fs')
  const { join, dirname } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const apiRoot = join(__dirname, '..')
  const tmpFile = join(apiRoot, '_seed_tmp.sql')
  writeFileSync(tmpFile, sql)

  execSync(
    'npx wrangler d1 execute vanaila-studio --local --file=' + tmpFile,
    { cwd: apiRoot, encoding: 'utf8' }
  )
  unlinkSync(tmpFile)

  console.log('✅  Admin user seeded successfully!\n')
} catch (err) {
  console.error('Failed to seed admin user.')
  process.exit(1)
}
