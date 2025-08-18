import { describe, it, expect } from '@jest/globals'
import { 
  sanitizeString, 
  sanitizeEmail, 
  sanitizeName,
  removeHtmlTags,
  sanitizeIPAddress 
} from '~/lib/input-sanitization'
import { generateCSRFToken, verifyCSRFToken } from '~/lib/csrf-protection'
import { securityConfig } from '~/lib/security-config'

/**
 * Security test utilities for validating the implementation
 * Run these tests to ensure security measures are working correctly
 */

describe('Security Implementation Tests', () => {
  describe('Input Sanitization', () => {
    it('should remove HTML tags from input', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello'
      const sanitized = sanitizeString(maliciousInput)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert')
      expect(sanitized).toBe('Hello')
    })

    it('should sanitize email addresses correctly', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com')
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
      expect(sanitizeEmail('<script>@example.com')).toBe('')
      expect(sanitizeEmail('invalid-email')).toBe('')
    })

    it('should sanitize names properly', () => {
      expect(sanitizeName('John Doe')).toBe('John Doe')
      expect(sanitizeName('John <script>alert(1)</script> Doe')).toBe('John  Doe')
      expect(sanitizeName('O\'Connor')).toBe('O\'Connor')
      expect(sanitizeName('Mary-Jane')).toBe('Mary-Jane')
    })

    it('should validate IP addresses', () => {
      expect(sanitizeIPAddress('192.168.1.1')).toBe('192.168.1.1')
      expect(sanitizeIPAddress('999.999.999.999')).toBe('')
      expect(sanitizeIPAddress('<script>alert(1)</script>')).toBe('')
      expect(sanitizeIPAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    })

    it('should remove dangerous HTML content', () => {
      const dangerous = 'Hello <script>alert("xss")</script> <img src="x" onerror="alert(1)"> World'
      const safe = removeHtmlTags(dangerous)
      expect(safe).not.toContain('<script>')
      expect(safe).not.toContain('onerror')
      expect(safe).not.toContain('alert')
      expect(safe).toBe('Hello  World')
    })
  })

  describe('CSRF Protection', () => {
    it('should generate valid CSRF tokens', async () => {
      const token = await generateCSRFToken()
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(50) // JWT tokens are longer
    })

    it('should validate CSRF tokens correctly', async () => {
      const token = await generateCSRFToken()
      const isValid = await verifyCSRFToken(token)
      expect(isValid).toBe(true)
    })

    it('should reject invalid CSRF tokens', async () => {
      const invalidToken = 'invalid.token.here'
      const isValid = await verifyCSRFToken(invalidToken)
      expect(isValid).toBe(false)
    })

    it('should reject empty CSRF tokens', async () => {
      const isValid = await verifyCSRFToken('')
      expect(isValid).toBe(false)
    })
  })

  describe('Security Configuration', () => {
    it('should have secure password requirements', () => {
      expect(securityConfig.password.minLength).toBeGreaterThanOrEqual(8)
      expect(securityConfig.password.bcryptRounds).toBeGreaterThanOrEqual(12)
      expect(securityConfig.password.requireUppercase).toBe(true)
      expect(securityConfig.password.requireLowercase).toBe(true)
      expect(securityConfig.password.requireNumbers).toBe(true)
      expect(securityConfig.password.requireSpecialChars).toBe(true)
    })

    it('should have secure JWT configuration', () => {
      expect(securityConfig.jwt.minSecretLength).toBeGreaterThanOrEqual(32)
      expect(securityConfig.jwt.algorithm).toBe('HS256')
      expect(securityConfig.jwt.defaultExpirationHours).toBeLessThanOrEqual(168) // Max 1 week
    })

    it('should have secure session configuration', () => {
      expect(securityConfig.session.httpOnly).toBe(true)
      expect(securityConfig.session.secure).toBe(true)
      expect(securityConfig.session.sameSite).toBe('strict')
    })

    it('should have appropriate rate limiting', () => {
      expect(securityConfig.rateLimiting.failClosedEndpoints).toContain('passwordAttempt')
      expect(securityConfig.rateLimiting.failClosedEndpoints).toContain('email')
      expect(securityConfig.rateLimiting.adminMultiplier).toBeGreaterThan(1)
    })

    it('should have secure headers configured', () => {
      expect(securityConfig.headers['X-Content-Type-Options']).toBe('nosniff')
      expect(securityConfig.headers['X-Frame-Options']).toBe('DENY')
      expect(securityConfig.headers['Content-Security-Policy']).toContain('default-src \'self\'')
    })
  })
})

/**
 * Manual Security Test Checklist
 * 
 * Run these tests manually in your browser/API client:
 * 
 * 1. Password Strength:
 *    - Try registering with weak password (should fail)
 *    - Try password with no uppercase (should fail)
 *    - Try password with no numbers (should fail)
 * 
 * 2. Account Lockout:
 *    - Try logging in with wrong password 5 times
 *    - Account should be locked temporarily
 *    - Wait 15 minutes and try again (should work)
 * 
 * 3. CSRF Protection:
 *    - Try submitting login form without CSRF token (should fail)
 *    - Try with invalid CSRF token (should fail)
 * 
 * 4. Input Validation:
 *    - Try submitting HTML/scripts in name field
 *    - Try extremely long inputs
 *    - Try invalid email formats
 * 
 * 5. Rate Limiting:
 *    - Make rapid requests to auth endpoints
 *    - Should be rate limited after threshold
 * 
 * 6. Session Security:
 *    - Check cookies are httpOnly and secure
 *    - Check session expires appropriately
 *    - Check invalid sessions are rejected
 */

export const manualSecurityTests = {
  passwordStrength: [
    'password123', // Missing uppercase and special chars
    'PASSWORD123', // Missing lowercase and special chars  
    'Password', // Missing numbers and special chars
    'Password123', // Missing special chars
    'Password@', // Missing numbers
    'password@123', // Missing uppercase
    'PASSWORD@123', // Missing lowercase
    'Pass@1', // Too short
  ],
  
  xssAttempts: [
    '<script>alert("xss")</script>',
    'javascript:alert(1)',
    '<img src="x" onerror="alert(1)">',
    '<svg onload="alert(1)">',
    'data:text/html,<script>alert(1)</script>',
  ],
  
  sqlInjectionAttempts: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "admin'--",
    "'; INSERT INTO users VALUES ('hacker'); --",
  ],
  
  pathTraversalAttempts: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '..\\..\\.env',
    '../../../../proc/version',
  ]
}

console.log('Security test utilities loaded. Run tests with: npm test security')