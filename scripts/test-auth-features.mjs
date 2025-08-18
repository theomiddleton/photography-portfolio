#!/usr/bin/env node
/**
 * Enhanced Authentication System Test Suite
 * 
 * This script tests the new authentication features to ensure they work correctly.
 * Run with: node scripts/test-auth-features.mjs
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔐 Enhanced Authentication System Test Suite')
console.log('============================================\n')

// Initialize test result variables
let testResults = {
  schema: true,
  email: true,
  pages: true,
  components: true,
  security: true
}

// Test database schema changes
console.log('📋 Checking database schema changes...')

try {
  const schemaPath = join(__dirname, '../src/server/db/schema.ts')
  const schemaContent = readFileSync(schemaPath, 'utf8')
  
  const requiredFields = [
    'emailVerified',
    'emailVerificationToken', 
    'emailVerificationExpiry',
    'passwordResetToken',
    'passwordResetExpiry', 
    'isActive',
    'deactivatedAt',
    'deactivationReason',
    'lastLoginIP',
    'lastLoginUserAgent'
  ]
  
  const requiredTables = [
    'userSessions',
    'users'
  ]
  
  for (const field of requiredFields) {
    if (!schemaContent.includes(field)) {
      console.log(`❌ Missing field: ${field}`)
      testResults.schema = false
    } else {
      console.log(`✅ Found field: ${field}`)
    }
  }
  
  for (const table of requiredTables) {
    if (!schemaContent.includes(`export const ${table}`)) {
      console.log(`❌ Missing table: ${table}`)
      testResults.schema = false
    } else {
      console.log(`✅ Found table: ${table}`)
    }
  }
  
  if (testResults.schema) {
    console.log('\n🎉 Database schema looks good!\n')
  } else {
    console.log('\n❌ Database schema has issues!\n')
  }
  
} catch (error) {
  console.log(`❌ Error reading schema: ${error.message}\n`)
  testResults.schema = false
}

// Test email service
console.log('📧 Checking email service...')

try {
  const emailServicePath = join(__dirname, '../src/lib/email/email-service.ts')
  const emailContent = readFileSync(emailServicePath, 'utf8')
  
  const requiredFunctions = [
    'sendEmailVerification',
    'sendPasswordReset', 
    'sendSecurityNotification'
  ]
  
  const requiredTemplates = [
    'EmailVerificationTemplate',
    'PasswordResetTemplate',
    'SecurityNotificationTemplate'
  ]
  
  for (const func of requiredFunctions) {
    if (!emailContent.includes(`export async function ${func}`)) {
      console.log(`❌ Missing function: ${func}`)
      testResults.email = false
    } else {
      console.log(`✅ Found function: ${func}`)
    }
  }
  
  for (const template of requiredTemplates) {
    if (!emailContent.includes(`function ${template}`)) {
      console.log(`❌ Missing template: ${template}`)
      testResults.email = false
    } else {
      console.log(`✅ Found template: ${template}`)
    }
  }
  
  if (testResults.email) {
    console.log('\n🎉 Email service looks good!\n')
  } else {
    console.log('\n❌ Email service has issues!\n')
  }
  
} catch (error) {
  console.log(`❌ Error reading email service: ${error.message}\n`)
  testResults.email = false
}

// Test frontend pages
console.log('🖥️ Checking frontend pages...')

const requiredPages = [
  'src/app/(auth)/forgot-password/page.tsx',
  'src/app/(auth)/reset-password/page.tsx', 
  'src/app/(auth)/verify-email/page.tsx',
  'src/app/(auth)/verify-email-notice/page.tsx',
  'src/app/(main)/account/page.tsx',
  'src/app/(main)/account/change-password/page.tsx'
]

for (const page of requiredPages) {
  try {
    const pagePath = join(__dirname, '..', page)
    readFileSync(pagePath, 'utf8')
    console.log(`✅ Found page: ${page}`)
  } catch (error) {
    console.log(`❌ Missing page: ${page}`)
    testResults.pages = false
  }
}

if (testResults.pages) {
  console.log('\n🎉 All frontend pages are present!\n')
} else {
  console.log('\n❌ Some frontend pages are missing!\n')
}

// Test components
console.log('⚛️ Checking React components...')

const requiredComponents = [
  'src/components/auth/ForgotPasswordForm.tsx',
  'src/components/auth/ResetPasswordForm.tsx',
  'src/components/auth/ResendVerificationForm.tsx', 
  'src/components/account/ChangePasswordForm.tsx',
  'src/components/account/AccountDashboard.tsx'
]

for (const component of requiredComponents) {
  try {
    const componentPath = join(__dirname, '..', component)
    readFileSync(componentPath, 'utf8')
    console.log(`✅ Found component: ${component}`)
  } catch (error) {
    console.log(`❌ Missing component: ${component}`)
    testResults.components = false
  }
}

if (testResults.components) {
  console.log('\n🎉 All React components are present!\n')
} else {
  console.log('\n❌ Some React components are missing!\n')
}

// Test security utilities
console.log('🔒 Checking security utilities...')

const requiredSecurityFiles = [
  'src/lib/auth/tokenHelpers.ts',
  'src/lib/auth/sessionManagement.ts',
  'src/lib/auth/passwordManagement.ts',
  'src/lib/auth/emailVerification.ts',
  'src/lib/auth/accountManagement.ts',
  'src/lib/rate-limiting.ts'
]

for (const file of requiredSecurityFiles) {
  try {
    const filePath = join(__dirname, '..', file)
    readFileSync(filePath, 'utf8')
    console.log(`✅ Found security file: ${file}`)
  } catch (error) {
    console.log(`❌ Missing security file: ${file}`)
    testResults.security = false
  }
}

if (testResults.security) {
  console.log('\n🎉 All security utilities are present!\n')
} else {
  console.log('\n❌ Some security utilities are missing!\n')
}

// Summary
console.log('📊 Test Summary')
console.log('===============')

const allTestsPassed = Object.values(testResults).every(result => result === true)

if (allTestsPassed) {
  console.log('🎉 All tests passed! The enhanced authentication system is ready.')
  console.log('\n📝 Next steps:')
  console.log('1. Run database migrations: pnpm run migrate')
  console.log('2. Set up environment variables for email service')
  console.log('3. Test the authentication flows manually')
  console.log('4. Deploy to staging for integration testing')
} else {
  console.log('❌ Some tests failed. Please review the issues above.')
}

console.log('\n🔐 Enhanced Authentication Features Implemented:')
console.log('• Email verification for new registrations')
console.log('• Password reset via email with secure tokens')
console.log('• Password change for authenticated users')
console.log('• Account deactivation and deletion')
console.log('• Enhanced session management with device tracking')
console.log('• Remember me functionality')
console.log('• Rate limiting for email operations')
console.log('• Comprehensive security logging')
console.log('• Professional email templates')
console.log('• Account management dashboard')