import { createHash, randomBytes, timingSafeEqual } from 'crypto'

/**
 * Generate a cryptographically secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Base64 URL-safe token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('base64url')
}

/**
 * Generate a numeric verification code
 * @param length - Number of digits (default: 6)
 * @returns Numeric string
 */
export function generateVerificationCode(length: number = 6): string {
  let result = ''
  // Generate a random 32-bit unsigned integer to get more randomness at once
  // or stick to byte-by-byte for simplicity if performance isn't a bottleneck.
  // The current byte-by-byte approach is cryptographically fine for small lengths.
  for (let i = 0; i < length; i++) {
    const randomByte = randomBytes(1)[0]
    result += (randomByte % 10).toString()
  }
  return result
}

/**
 * Safely compare two HEX-ENCODED HASHES or BASE64URL-ENCODED TOKENS to prevent timing attacks.
 * This function is versatile but assumes the inputs are consistently encoded (either both hex or both base64url).
 * For comparing SHA256 hex hashes, ensure both inputs are hex strings.
 * @param val1 - First string value (e.g., hashed token from user input or DB).
 * @param val2 - Second string value (e.g., stored hashed token from DB).
 * @param encoding - The encoding of the input strings ('hex' for hashes, 'base64url' for secure tokens, 'utf8' for general strings). Default to 'hex' if used for hashes.
 * @returns True if values match after decoding and timing-safe comparison.
 */
export function safeCompareTokens(val1: string, val2: string, encoding: BufferEncoding = 'hex'): boolean {
  if (!val1 || !val2) return false

  try {
    const buf1 = Buffer.from(val1, encoding)
    const buf2 = Buffer.from(val2, encoding)

    // Ensure buffers are the same length to prevent timing attacks
    if (buf1.length !== buf2.length) return false

    return timingSafeEqual(buf1, buf2)
  } catch (error) {
    // Log error if necessary, but return false on any decoding or comparison failure
    console.error("Error during safe token comparison:", error)
    return false
  }
}

/**
 * Check if a timestamp has expired
 * @param expiryDate - Expiry date to check
 * @returns True if expired or null/undefined
 */
export function isExpired(expiryDate: Date | null | undefined): boolean {
  if (!expiryDate) return true // Treat null/undefined expiry as expired
  return new Date() > expiryDate
}

/**
 * Generate a password reset token with metadata
 * @returns Object with plaintext token and expiry
 */
export function generatePasswordResetToken() {
  const token = generateSecureToken(32)
  const expiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

  return { token, expiry } // Return plaintext token here
}

/**
 * Generate an email verification token with metadata
 * @returns Object with plaintext token and expiry
 */
export function generateEmailVerificationToken() {
  const token = generateSecureToken(32)
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  return { token, expiry } // Return plaintext token here
}

/**
 * Hashes a given plaintext token using SHA-256.
 * @param token The plaintext token to hash.
 * @returns The SHA-256 hash of the token, in hex format.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}