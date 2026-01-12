# Authentication System Inventory
## Complete Reference for Auth System Refactor

**Generated:** 2025-11-20  
**Purpose:** Comprehensive list of ALL files, functions, components, and dependencies related to the authentication system for a major refactor.

---

## Table of Contents
1. [Core Auth Library](#1-core-auth-library)
2. [Auth Components](#2-auth-components)
3. [Auth Pages](#3-auth-pages)
4. [Database Schema](#4-database-schema)
5. [API Routes Using Auth](#5-api-routes-using-auth)
6. [Admin & Account Pages](#6-admin--account-pages)
7. [Main App Pages Using Auth](#7-main-app-pages-using-auth)
8. [Types & Schemas](#8-types--schemas)
9. [Configuration Files](#9-configuration-files)
10. [Security & Rate Limiting](#10-security--rate-limiting)
11. [Email Templates](#11-email-templates)
12. [Other Components Using Auth](#12-other-components-using-auth)
13. [Middleware & Proxy](#13-middleware--proxy)
14. [External Dependencies](#14-external-dependencies)

---

## 1. Core Auth Library
**Location:** `src/lib/auth/`

### 1.1 Account Management
**File:** `accountActions.ts`
- `deactivateAccountAction()` - Server action to deactivate account
- `deleteAccountAction()` - Server action to delete account
- `getSessionsAction()` - Get user sessions for account management
- `getAccountInfoAction()` - Get account information
- `revokeAllSessionsAction()` - Revoke all user sessions

**File:** `accountManagement.ts`
- `deactivateAccount()` - Deactivate a user account
- `reactivateAccount()` - Reactivate a deactivated account
- `deleteAccount()` - Permanently delete a user account
- `getAccountStatus()` - Get account status and details

### 1.2 Authentication Core
**File:** `auth.ts`
- Re-exports from other auth modules (barrel file)

**File:** `authDatabase.ts`
- `checkAdminSetupRequired()` - Check if admin setup is needed
- `checkAdminSetupRequiredSafe()` - Safe version for server components

**File:** `authHelpers.ts`
- `hashPassword()` - Hash password using bcrypt
- `verifyPassword()` - Verify password against hash
- `createSession()` - Create JWT session token

**File:** `authSession.ts`
- `getSession()` - Get current user session from cookies
- `updateSession()` - Update session cookie
- `createGalleryPasswordCookie()` - Create gallery password cookie
- `verifyGalleryPasswordCookie()` - Verify gallery password cookie
- `invalidateUserSessions()` - Invalidate all user sessions

### 1.3 Password Management
**File:** `changePasswordAction.ts`
- `changePasswordAction()` - Server action to change user password

**File:** `passwordManagement.ts`
- `verifyPasswordResetToken()` - Verify password reset token
- `resetPasswordWithToken()` - Reset password using token
- `changePassword()` - Change user password
- `validatePasswordStrength()` - Validate password meets requirements

**File:** `forgotPasswordAction.ts`
- `forgotPassword()` - Server action for forgot password flow

**File:** `resetPasswordAction.ts`
- `resetPassword()` - Server action to reset password

### 1.4 Email Verification
**File:** `emailVerification.ts`
- `verifyEmailToken()` - Verify email verification token
- `resendEmailVerification()` - Resend verification email
- `isEmailVerified()` - Check if user email is verified
- `getUnverifiedUsers()` - Get list of unverified users

**File:** `resendVerificationAction.ts`
- `resendVerificationAction()` - Server action to resend verification

### 1.5 Permissions & Authorization
**File:** `permissions.ts`
- `requireAdminAuth()` - Require admin authentication (throws if not admin)
- `requireAuth()` - Require authentication (throws if not logged in)
- `checkAdminRole()` - Check if user has admin role

### 1.6 Session Management
**File:** `sessionManagement.ts`
- `createUserSession()` - Create new user session in database
- `validateAndRefreshSession()` - Validate and refresh session
- `revokeSession()` - Revoke a specific session
- `revokeAllUserSessions()` - Revoke all sessions for a user
- `getUserActiveSessions()` - Get all active sessions for user
- `cleanupExpiredSessions()` - Clean up expired sessions
- `getUserAgent()` - Get user agent from headers

**File:** `sessionMonitoring.ts`
- `getSessionStats()` - Get session statistics
- `detectSuspiciousActivity()` - Detect suspicious session activity
- `monitorSessionHealth()` - Monitor session health
- `performSessionMaintenance()` - Perform session maintenance tasks

### 1.7 User Management
**File:** `userActions.ts`
- **Interfaces:**
  - `FormState` - Form state for auth forms
  - `User` - User interface
  - `UserSearchOptions` - Search options for users
  - `UserSearchResult` - User search result
- **Functions:**
  - `login()` - Login user
  - `register()` - Register new user
  - `logout()` - Logout current user
  - `getUsers()` - Get all users (admin)
  - `deleteUser()` - Delete a user (admin)
  - `promoteUser()` - Promote user to admin
  - `demoteUser()` - Demote admin to user
  - `logoutUser()` - Force logout a user (admin)
  - `searchUsers()` - Search for users
  - `getUserStats()` - Get user statistics

**File:** `setupAdmin.ts`
- `setupFirstAdmin()` - Setup first admin user

### 1.8 Token Management
**File:** `tokenHelpers.ts`
- `generateSecureToken()` - Generate secure random token
- `generateVerificationCode()` - Generate verification code
- `safeCompareTokens()` - Safely compare tokens (timing-safe)
- `isExpired()` - Check if token/date is expired
- `generatePasswordResetToken()` - Generate password reset token
- `generateEmailVerificationToken()` - Generate email verification token
- `hashToken()` - Hash token for storage

---

## 2. Auth Components
**Location:** `src/components/auth/`

### 2.1 Form Components
**File:** `SigninForm.tsx`
- `LoginState` interface
- `SigninForm` component - Sign in form with email/password

**File:** `SignupForm.tsx`
- `SignupForm` component - Registration form

**File:** `ForgotPasswordForm.tsx`
- `ForgotPasswordForm` component - Forgot password form

**File:** `ResetPasswordForm.tsx`
- `ResetPasswordForm` component - Reset password form with token

**File:** `ResendVerificationForm.tsx`
- `ResendVerificationForm` component - Resend email verification

**File:** `SetupAdminForm.tsx`
- `SetupAdminForm` component - First admin setup form

### 2.2 UI Components
**File:** `PasswordRequirements.tsx`
- `PasswordRequirements` component - Display password requirements

**File:** `LogoutPageClient.tsx`
- `LogoutPageClient` component - Client-side logout component

### 2.3 Guard Components
**File:** `AdminSetupChecker.tsx`
- `AdminSetupChecker` component - Check if admin setup required

**File:** `AdminSetupGuard.tsx`
- `AdminSetupGuard` component - Guard for admin setup pages

---

## 3. Auth Pages
**Location:** `src/app/(auth)/`

### 3.1 Page Files
- `layout.tsx` - Auth layout wrapper
- `auth-test/page.tsx` - Auth testing page
- `forgot-password/page.tsx` - Forgot password page
- `login/page.tsx` - Login page (legacy)
- `logout/page.tsx` - Logout page
- `reset-password/page.tsx` - Reset password page
- `reset-password-success/page.tsx` - Password reset success page
- `setup-admin/page.tsx` - First admin setup page
- `signin/page.tsx` - Sign in page
- `signup/page.tsx` - Sign up page
- `verify-email/page.tsx` - Email verification page
- `verify-email-notice/page.tsx` - Email verification notice page

---

## 4. Database Schema
**Location:** `src/server/db/schema.ts`

### 4.1 Users Table
**Table:** `users`
**Fields:**
- `id` - Serial primary key
- `email` - Unique email address
- `name` - User's full name
- `password` - Hashed password (bcrypt)
- `role` - User role ('admin' | 'user')
- `createdAt` - Account creation timestamp
- `modifiedAt` - Last modification timestamp
- `failedLoginAttempts` - Failed login attempt counter
- `accountLockedUntil` - Account lockout expiry
- `lastLoginAt` - Last login timestamp
- `passwordChangedAt` - Password change timestamp
- `emailVerified` - Email verification status
- `emailVerificationToken` - Email verification token
- `emailVerificationExpiry` - Verification token expiry
- `passwordResetToken` - Password reset token
- `passwordResetExpiry` - Reset token expiry
- `isActive` - Account active status
- `deactivatedAt` - Deactivation timestamp
- `deactivationReason` - Reason for deactivation
- `lastLoginIP` - Last login IP address
- `lastLoginUserAgent` - Last login user agent

**Indexes:**
- `users_email_idx` - Email lookup
- `users_role_idx` - Role filtering
- `users_email_verification_token_idx` - Verification token lookup
- `users_password_reset_token_idx` - Reset token lookup
- `users_is_active_idx` - Active users filtering
- `users_email_verified_idx` - Verified users filtering
- `users_last_login_idx` - Login activity sorting
- `users_password_reset_expiry_idx` - Reset token cleanup
- `users_email_verification_expiry_idx` - Verification cleanup
- `users_account_locked_idx` - Locked accounts lookup
- `users_active_verified_idx` - Active verified users (composite)
- `users_role_active_idx` - Role-based active users (composite)

### 4.2 User Sessions Table
**Table:** `userSessions`
**Fields:**
- `id` - Serial primary key
- `userId` - Foreign key to users.id (cascade delete)
- `sessionToken` - Unique session token
- `ipAddress` - Session IP address
- `userAgent` - Session user agent
- `isRememberMe` - Remember me flag
- `expiresAt` - Session expiration timestamp
- `lastUsedAt` - Last session activity timestamp
- `createdAt` - Session creation timestamp
- `revokedAt` - Session revocation timestamp
- `revokeReason` - Reason for revocation

**Indexes:**
- `user_sessions_user_id_idx` - User sessions lookup
- `user_sessions_session_token_idx` - Token lookup
- `user_sessions_expires_at_idx` - Expiry-based queries
- `user_sessions_active_idx` - Active sessions (composite)
- `user_sessions_last_used_idx` - Activity sorting
- `user_sessions_remember_me_idx` - Remember me filtering
- `user_sessions_cleanup_idx` - Cleanup queries (composite)
- `user_sessions_user_active_idx` - User active sessions (composite)

---

## 5. API Routes Using Auth
**Location:** `src/app/api/`

### 5.1 Auth-Specific Routes
- `auth/session/route.ts` - Session management API

### 5.2 Admin-Only Routes (using `requireAdminAuth`)
- `orders/stream/route.ts` - Order streaming

### 5.3 Protected Routes (using `getSession`)

#### Upload & Files
- `upload/route.ts` - File upload
- `upload/cleanup/route.ts` - Upload cleanup
- `lightroom/upload/route.ts` - Lightroom upload
- `files/upload/route.ts` - Generic file upload
- `files/rename/route.ts` - File rename
- `files/folder/route.ts` - Folder operations
- `files/delete/route.ts` - File deletion
- `files/thumbnail/route.ts` - Thumbnail generation
- `files/list/route.ts` - File listing
- `files/move/route.ts` - File move

#### Images
- `images/route.ts` - Image operations
- `images/[id]/route.ts` - Single image operations
- `images/check-duplicate/route.ts` - Duplicate checking
- `images/copy-reference/route.ts` - Copy reference
- `images/exif/route.ts` - EXIF data
- `images/export/route.ts` - Image export
- `images/import/route.ts` - Image import
- `images/search-existing/route.ts` - Search existing images

#### Gallery
- `gallery/access-logs/route.ts` - Gallery access logs
- `gallery/password/route.ts` - Gallery password verification
- `gallery/temp-link/route.ts` - Temporary gallery links
- `gallery/bulk-operations/route.ts` - Bulk gallery operations

#### Storage
- `storage/usage/route.ts` - Storage usage stats
- `storage/dismiss-alert/route.ts` - Dismiss storage alerts
- `storage/duplicates/route.ts` - Storage duplicates
- `storage/duplicates/delete/route.ts` - Delete duplicates
- `storage/config/route.ts` - Storage configuration
- `storage/config/[id]/route.ts` - Single storage config
- `storage/active-alerts/route.ts` - Active storage alerts
- `storage/global-config/route.ts` - Global storage config

#### Blog
- `blog/posts/route.ts` - Blog post operations
- `blog/posts/[slug]/route.ts` - Single post operations

#### Videos
- `videos/[id]/comments/route.ts` - Video comments
- `videos/[id]/comments/[commentId]/route.ts` - Single comment

#### Other
- `metadata/route.ts` - Metadata operations
- `metadata/background/route.ts` - Background metadata
- `about/route.ts` - About page operations
- `revalidate/route.ts` - Cache revalidation

---

## 6. Admin & Account Pages
**Location:** `src/app/(admin)/` and `src/app/(account)/`

### 6.1 Admin Pages (Protected by Admin Layout)
**Note:** All pages under `(admin)/` route group are protected by the admin layout which checks for admin authentication.

**Layout:**
- `(admin)/layout.tsx` - Admin layout with auth guard

**Admin Dashboard:**
- `(admin)/admin/page.tsx` - Main admin dashboard

**Content Management:**
- `(admin)/admin/about/page.tsx` - About page management
- `(admin)/admin/blog/page.tsx` - Blog listing
- `(admin)/admin/blog/new/page.tsx` - New blog post
- `(admin)/admin/blog/edit/[slug]/page.tsx` - Edit blog post
- `(admin)/admin/galleries/page.tsx` - Gallery listing
- `(admin)/admin/galleries/new/page.tsx` - New gallery
- `(admin)/admin/galleries/[slug]/page.tsx` - Edit gallery
- `(admin)/admin/gallery/page.tsx` - Gallery management
- `(admin)/admin/videos/page.tsx` - Video listing
- `(admin)/admin/videos/new/page.tsx` - New video
- `(admin)/admin/videos/[id]/edit/page.tsx` - Edit video

**File & Storage Management:**
- `(admin)/admin/files/page.tsx` - File manager
- `(admin)/admin/upload/page.tsx` - Upload interface
- `(admin)/admin/storage-alerts/page.tsx` - Storage alerts
- `(admin)/admin/storage-alerts/deduplication/page.tsx` - Deduplication management

**Store Management:**
- `(admin)/admin/store/page.tsx` - Store dashboard
- `(admin)/admin/store/products/[id]/page.tsx` - Product management
- `(admin)/admin/store/costs/page.tsx` - Cost management
- `(admin)/admin/store/frame/page.tsx` - Frame management

**System Management:**
- `(admin)/admin/users/page.tsx` - User management (explicitly uses getSession)
- `(admin)/admin/emails/page.tsx` - Email management
- `(admin)/admin/site-config/page.tsx` - Site configuration
- `(admin)/admin/manage/page.tsx` - General management
- `(admin)/admin/migrate/page.tsx` - Data migration

**Pages with explicit auth calls:**
- `about/page.tsx` - Uses `getSession()`
- `blog/new/page.tsx` - Uses `getSession()`
- `blog/edit/[slug]/page.tsx` - Uses `getSession()`
- `files/page.tsx` - Uses `getSession()`
- `storage-alerts/page.tsx` - Uses `getSession()`
- `storage-alerts/deduplication/page.tsx` - Uses `getSession()`
- `store/page.tsx` - Uses `getSession()`

### 6.2 Account Pages (Layout uses auth check)
- `(account)/layout.tsx` - Account layout with auth
- `(account)/account/page.tsx` - Account dashboard
- `(account)/account/change-password/page.tsx` - Change password

---

## 7. Main App Pages Using Auth
**Location:** `src/app/(main)/`

### 7.1 Pages with Auth Integration
- `page.tsx` - Homepage (checks admin setup, gets session)
- `blog/p/[slug]/page.tsx` - Blog post preview (checks session)
- `g/[slug]/page.tsx` - Gallery page (checks session)
- `video/[slug]/page.tsx` - Video page (checks session)

---

## 8. Types & Schemas
**Location:** `src/lib/types/`

### 8.1 Session Types
**File:** `session.ts`
- `UserSession` interface - User session data
- `SessionPayload` interface - JWT payload

### 8.2 Validation Schemas
**File:** `loginSchema.ts`
- `loginSchema` - Zod schema for login validation

**File:** `registerSchema.ts`
- `registerSchema` - Zod schema for registration validation
- Password strength requirements:
  - Min 8, max 128 characters
  - Uppercase, lowercase, numbers, special chars
  - No common weak passwords
  - No common sequences

### 8.3 Other Types
**File:** `galleryType.ts`
- Contains gallery password-related types

---

## 9. Configuration Files
**Location:** `src/config/`

### 9.1 Security Configuration
**File:** `security-config.ts`
- Password requirements (length, complexity, bcrypt rounds)
- JWT configuration (algorithm, expiration)
- Session configuration (cookie settings)
- Rate limiting configuration
- Security headers (CSP, X-Frame-Options, etc.)
- Input validation rules
- Security logging settings
- Account security (lockout, email verification)

### 9.2 Site Configuration
**File:** `site.ts`
- May contain auth-related site settings

**File:** `seo.ts`
- May contain auth page SEO settings

---

## 10. Security & Rate Limiting
**Location:** `src/lib/`

### 10.1 Account Security
**File:** `account-security.ts`
- `checkAccountLockStatus()` - Check if account is locked
- `recordFailedLoginAttempt()` - Record failed login
- `resetFailedAttempts()` - Reset failed login counter
- `lockAccount()` - Lock account after too many failures
- `unlockAccount()` - Unlock account

### 10.2 Security Logging
**File:** `security-logging.ts`
- `logSecurityEvent()` - Log security-related events
- Security event types tracking

### 10.3 Rate Limiting
**File:** `rate-limit.ts`
- Rate limiting middleware using session data
- IP-based rate limiting

**File:** `rate-limiting.ts`
- Advanced rate limiting implementation
- Different limits for different endpoints

---

## 10.4 Server Actions Using Auth
**Location:** `src/lib/actions/`

### Store Actions
**File:** `store/store.ts`
- Uses `requireAdminAuth()` for store management operations

### Gallery Actions
**File:** `gallery/gallery.ts`
- Uses `hashPassword()` for gallery password protection

---

## 11. Email Templates
**Location:** `src/components/emails/auth/`

### 11.1 Auth Email Templates
**File:** `email-verification.tsx`
- Email verification template
- Contains verification link/code

**File:** `password-reset.tsx`
- Password reset email template
- Contains reset link

**File:** `security-notification.tsx`
- Security notification template
- Sent for suspicious activity, password changes, etc.

**File:** `index.ts`
- Email template exports

### 11.2 Email Service
**File:** `src/lib/email/email-service.ts`
- Uses `generateSecureToken()` and `hashToken()` from auth
- Sends auth-related emails

---

## 12. Other Components Using Auth
**Location:** `src/components/`

### 12.1 Site Header
**File:** `site-header.tsx`
- Imports `getSession()` to show user info
- Imports `logout()` for logout functionality
- Displays login/logout state

### 12.2 User Management
**File:** `user/users.tsx`
- User management table for admins
- Uses multiple functions from `userActions.ts`

**File:** `user/user-dialogs.tsx`
- User management dialogs
- Imports `User` type from `userActions.ts`

### 12.3 Account Management
**File:** `account/AccountDashboard.tsx`
- Account dashboard component
- Uses functions from `accountActions.ts`

**File:** `account/ChangePasswordForm.tsx`
- Change password form
- Uses `changePasswordAction()` and `PasswordRequirements`

### 12.4 UI Components
**File:** `ui/password-input.tsx`
- `PasswordInput` component - Password input with show/hide toggle
- Used in all password forms (login, register, reset, change password)

### 12.5 Other Components
**File:** `GetStartedMessage.tsx`
- May reference auth/login
- Guide users to setup/login

---

## 13. Middleware & Proxy
**Location:** `src/`

### 13.1 Proxy/Middleware
**File:** `src/proxy.ts`
- **Main authentication middleware for the application**
- Uses `getSession()` from `authSession.ts`
- Protects routes matching: `/admin/:path*`, `/store/:path*`, `/api/files/:path*`
- Checks admin role for protected routes (redirects to `/` if not admin)
- Applies comprehensive security headers from `security-config.ts`
- Logs all admin access attempts (both authorized and unauthorized)
- Extracts client IP from various headers (x-forwarded-for, x-real-ip, cf-connecting-ip)
- **This is the primary protection mechanism for all admin pages**

**Protected Route Patterns:**
- `/admin/*` - All admin pages (entire admin dashboard)
- `/store/*` - Store-related pages
- `/api/files/*` - File API endpoints

**Note:** 
- Individual page components may also check auth for additional security
- API route handlers independently verify authentication
- Account pages check auth at the page level (not in middleware)

---

## 14. External Dependencies

### 14.1 npm Packages
- `bcrypt` / `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `zod` - Schema validation
- `drizzle-orm` - Database ORM
- `next` - Framework (cookies, headers)
- `react` - UI components

### 14.2 Environment Variables
Required for auth system (check `.env.example`):
- `JWT_SECRET` - JWT signing secret
- `DATABASE_URL` - Database connection
- Email service credentials (for verification/reset emails)
- Any other auth-related environment variables

---

## Summary Statistics

### File Counts
- **Core Auth Library:** 18 files
- **Auth Components:** 10 files
- **Auth Pages:** 12 files (including layout)
- **API Routes Using Auth:** 40+ routes
- **Admin Pages:** 8+ pages
- **Account Pages:** 2+ pages
- **Email Templates:** 3 files
- **Types/Schemas:** 4 files
- **Config Files:** 3 files
- **Security Files:** 3 files
- **Other Components:** 5 files

### Function Counts (Approximate)
- **Auth Library Functions:** 70+ exported functions
- **Auth Components:** 10+ exported components
- **Interfaces/Types:** 10+ exported types

### Database Tables
- **Users Table:** 1 table, 20+ fields, 12 indexes
- **User Sessions Table:** 1 table, 11 fields, 8 indexes

---

## Refactor Considerations

### Critical Dependencies
1. **Database Schema:** Any changes must include migration strategy
2. **JWT Structure:** Session payload structure affects all auth checks
3. **Cookie Management:** Session cookie name/structure used everywhere
4. **Password Hashing:** bcrypt compatibility required for existing users
5. **Email System:** Verification and reset flows depend on email service

### High-Risk Areas
1. **Session Management:** Used in 40+ API routes
2. **Permission Checks:** `requireAdminAuth()` and `requireAuth()` widely used
3. **Password Reset Flow:** Multi-step process with token management
4. **Email Verification:** Impacts user registration and account security

### Testing Requirements
- Unit tests for all auth functions
- Integration tests for auth flows (login, register, reset password)
- E2E tests for auth pages
- Security tests for rate limiting and account lockout
- Session management tests

### Migration Strategy
1. **Phase 1:** Update core auth library while maintaining compatibility
2. **Phase 2:** Update database schema with backward-compatible migrations
3. **Phase 3:** Update components and pages
4. **Phase 4:** Update API routes
5. **Phase 5:** Clean up deprecated code

---

## Notes
- All auth functions use server-side execution (no client-side auth logic)
- Session management uses both JWT (for stateless auth) and database sessions (for tracking)
- Email verification is enabled by default
- Account lockout after 5 failed attempts
- Sessions expire after 1 week by default
- Password requirements are strict (uppercase, lowercase, numbers, special chars)
- All sensitive operations log security events

---

**Last Updated:** 2025-11-20  
**Document Version:** 1.0  
**Maintainer:** Generated for auth system refactor
