import { randomBytes, timingSafeEqual } from 'crypto'

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
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  return Math.floor(Math.random() * (max - min + 1) + min).toString()
}

/**
 * Safely compare two tokens to prevent timing attacks
 * @param token1 - First token
 * @param token2 - Second token
 * @returns True if tokens match
 */
export function safeCompareTokens(token1: string, token2: string): boolean {
  if (!token1 || !token2) return false
  
  try {
    const buf1 = Buffer.from(token1, 'utf8')
    const buf2 = Buffer.from(token2, 'utf8')
    
    // Ensure buffers are the same length to prevent timing attacks
    if (buf1.length !== buf2.length) return false
    
    return timingSafeEqual(buf1, buf2)
  } catch {
    return false
  }
}

/**
 * Check if a timestamp has expired
 * @param expiryDate - Expiry date to check
 * @returns True if expired
 */
export function isExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true
  return new Date() > expiryDate
}

/**
 * Generate a password reset token with metadata
 * @returns Object with token and expiry
 */
export function generatePasswordResetToken() {
  const token = generateSecureToken(32)
  const expiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  
  return { token, expiry }
}

/**
 * Generate an email verification token with metadata
 * @returns Object with token and expiry
 */
export function generateEmailVerificationToken() {
  const token = generateSecureToken(32)
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  
  return { token, expiry }
}