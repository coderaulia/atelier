/**
 * Generate a Vanaila Studio password hash.
 *
 * Usage:
 *   node scripts/hash-password.mjs <password>
 *   node scripts/hash-password.mjs <email> <password>
 */

import { randomBytes, pbkdf2Sync } from 'node:crypto'

const ALGORITHM = 'pbkdf2_sha256'
const ITERATIONS = 30_000
const KEY_LENGTH = 32

const [first, second] = process.argv.slice(2)
const email = second ? first : null
const password = second ?? first

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs <password>')
  console.error('   or: node scripts/hash-password.mjs <email> <password>')
  process.exit(1)
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

const salt = randomBytes(16)
const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256').toString('hex')
const passwordHash = `${ALGORITHM}$${ITERATIONS}$${salt.toString('hex')}$${hash}`

if (email) {
  console.log(`email=${email}`)
}
console.log(`password_hash=${passwordHash}`)
