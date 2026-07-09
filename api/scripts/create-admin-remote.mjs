/**
 * Create or update an admin user in the remote Cloudflare D1 database.
 *
 * Usage:
 *   node scripts/create-admin-remote.mjs <email> <password>
 *
 * This writes to the remote `vanaila-studio` D1 database configured in
 * api/wrangler.toml. It resets the user's password, promotes them to admin,
 * marks the account active and verified, and clears old sessions.
 */

import { execFileSync } from 'node:child_process'
import { randomBytes, pbkdf2Sync } from 'node:crypto'
import { writeFileSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DATABASE_NAME = 'vanaila-studio'
const ALGORITHM = 'pbkdf2_sha256'
const ITERATIONS = 30_000
const KEY_LENGTH = 32

const [email, password] = process.argv.slice(2)

if (!email || !password) {
  console.error('Usage: node scripts/create-admin-remote.mjs <email> <password>')
  console.error('Example: node scripts/create-admin-remote.mjs admin@example.com SecurePass123!')
  process.exit(1)
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Email is invalid.')
  process.exit(1)
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

function sqlString(value) {
  return value.replace(/'/g, "''")
}

function hashPassword(plain) {
  const salt = randomBytes(16)
  const hash = pbkdf2Sync(plain, salt, ITERATIONS, KEY_LENGTH, 'sha256').toString('hex')
  return `${ALGORITHM}$${ITERATIONS}$${salt.toString('hex')}$${hash}`
}

const passwordHash = hashPassword(password)
const safeEmail = sqlString(email.toLowerCase())
const safeHash = sqlString(passwordHash)

const sql = `
INSERT INTO users (email, password_hash, plan, role, status, email_verified)
VALUES ('${safeEmail}', '${safeHash}', 'pro', 'admin', 'active', 1)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '${safeHash}',
  plan = 'pro',
  role = 'admin',
  status = 'active',
  email_verified = 1,
  deleted_at = NULL;

DELETE FROM sessions
WHERE user_id = (SELECT id FROM users WHERE email = '${safeEmail}');

SELECT id, email, role, status, plan, email_verified
FROM users
WHERE email = '${safeEmail}';
`.trim()

const __dirname = dirname(fileURLToPath(import.meta.url))
const apiRoot = join(__dirname, '..')
const tmpFile = join(apiRoot, `_create_admin_remote_${Date.now()}.sql`)
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

try {
  writeFileSync(tmpFile, sql)
  const output = execFileSync(
    npx,
    ['wrangler', 'd1', 'execute', DATABASE_NAME, '--remote', '--file', tmpFile],
    { cwd: apiRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  )

  console.log(`Admin user is ready: ${email.toLowerCase()}`)
  console.log(output)
} catch (err) {
  console.error('Failed to create remote admin user.')
  if (err.stdout) console.error(err.stdout.toString())
  if (err.stderr) console.error(err.stderr.toString())
  console.error(err.message)
  process.exit(1)
} finally {
  try {
    unlinkSync(tmpFile)
  } catch {
    // Temp file may not exist if writing failed.
  }
}
