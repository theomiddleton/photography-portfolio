# Auth System Quick Reference

**See [AUTH_SYSTEM_INVENTORY.md](./AUTH_SYSTEM_INVENTORY.md) for complete details**

## 🎯 Quick Stats
- **18** auth library files
- **70+** exported auth functions
- **10** auth form components
- **12** auth pages
- **40+** API routes using auth
- **25+** admin pages protected
- **2** database tables (users, userSessions)

## 📁 Key Directories

```
src/lib/auth/              # Core auth library (18 files)
src/components/auth/       # Auth form components (10 files)
src/app/(auth)/           # Auth pages (signin, signup, etc.)
src/app/(admin)/          # Admin pages (protected by middleware)
src/app/(account)/        # Account management pages
src/components/emails/auth/ # Email templates (3 files)
```

## 🔑 Most Important Files

### Core Authentication
- `src/lib/auth/authSession.ts` - `getSession()` - Used EVERYWHERE
- `src/lib/auth/permissions.ts` - `requireAdminAuth()`, `requireAuth()`
- `src/lib/auth/userActions.ts` - `login()`, `register()`, `logout()`
- `src/proxy.ts` - Middleware protecting `/admin/*`, `/store/*`, `/api/files/*`

### Database
- `src/server/db/schema.ts` - `users` and `userSessions` tables

### Configuration
- `src/config/security-config.ts` - All security settings

## 🛡️ Protection Mechanisms

### 1. Middleware Protection (src/proxy.ts)
Routes automatically protected:
- `/admin/*` - All admin pages
- `/store/*` - Store pages
- `/api/files/*` - File APIs

### 2. Page-Level Protection
Individual pages call:
- `getSession()` - Get current user
- `requireAuth()` - Throw if not logged in
- `requireAdminAuth()` - Throw if not admin

### 3. API Route Protection
40+ API routes independently check:
- `getSession()` in route handlers
- `requireAdminAuth()` for admin APIs

## 🔐 Core Auth Functions

### Session Management
- `getSession()` - Get current session (most used)
- `createUserSession()` - Create new session
- `revokeSession()` - Revoke single session
- `revokeAllUserSessions()` - Revoke all sessions

### User Actions
- `login()` - Login user
- `register()` - Register new user
- `logout()` - Logout user

### Password Management
- `changePassword()` - Change password
- `forgotPassword()` - Initiate password reset
- `resetPassword()` - Complete password reset
- `validatePasswordStrength()` - Check password

### Email Verification
- `verifyEmailToken()` - Verify email
- `resendEmailVerification()` - Resend verification

### Authorization
- `requireAuth()` - Require login
- `requireAdminAuth()` - Require admin
- `checkAdminRole()` - Check if admin

## 📊 Database Schema

### users Table (20+ fields)
Key fields:
- `id`, `email`, `password`, `role`
- `emailVerified`, `emailVerificationToken`
- `passwordResetToken`, `passwordResetExpiry`
- `failedLoginAttempts`, `accountLockedUntil`
- `lastLoginAt`, `lastLoginIP`

### userSessions Table (11 fields)
Key fields:
- `id`, `userId`, `sessionToken`
- `expiresAt`, `lastUsedAt`, `revokedAt`
- `ipAddress`, `userAgent`, `isRememberMe`

## 📧 Email Templates
- `email-verification.tsx` - Email verification
- `password-reset.tsx` - Password reset
- `security-notification.tsx` - Security alerts

## 🔒 Security Features
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ JWT sessions (1 week expiry)
- ✅ Database session tracking
- ✅ Rate limiting
- ✅ Account lockout (5 failed attempts)
- ✅ Email verification
- ✅ Security event logging
- ✅ Strong password requirements
- ✅ Timing-safe token comparison

## 🚨 Files That Import Auth (100+ files)

### Heavy Users (import auth functions)
- All 40+ API routes
- All 25+ admin pages
- Account pages
- Main app pages (homepage, galleries, videos, blog)
- Site header (shows login/logout)
- User management components

### Common Import Patterns
```typescript
// Most common
import { getSession } from '~/lib/auth/auth'

// Admin protection
import { requireAdminAuth } from '~/lib/auth/permissions'

// User actions
import { login, register, logout } from '~/lib/auth/userActions'
```

## 🎨 Auth Components

### Forms (src/components/auth/)
- `SigninForm.tsx` - Login form
- `SignupForm.tsx` - Registration form
- `ForgotPasswordForm.tsx` - Password reset request
- `ResetPasswordForm.tsx` - Password reset with token
- `SetupAdminForm.tsx` - First admin setup

### Guards
- `AdminSetupChecker.tsx` - Check if setup needed
- `AdminSetupGuard.tsx` - Guard for setup pages

### UI
- `PasswordRequirements.tsx` - Password strength display
- `LogoutPageClient.tsx` - Logout page client component

## 📄 Auth Pages (src/app/(auth)/)
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/logout` - Logout page
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token
- `/verify-email` - Email verification
- `/setup-admin` - First admin setup

## 🔄 Typical Auth Flows

### Login Flow
1. User submits `SigninForm`
2. Calls `login()` from `userActions.ts`
3. Verifies password with `verifyPassword()`
4. Creates session with `createUserSession()`
5. Sets cookie with JWT token
6. Redirects to dashboard

### Registration Flow
1. User submits `SignupForm`
2. Calls `register()` from `userActions.ts`
3. Validates with `registerSchema`
4. Hashes password with `hashPassword()`
5. Creates user in database
6. Sends verification email
7. Creates session and redirects

### Password Reset Flow
1. User requests reset via `ForgotPasswordForm`
2. Calls `forgotPassword()`
3. Generates token with `generatePasswordResetToken()`
4. Sends email with reset link
5. User clicks link, visits `/reset-password?token=...`
6. User submits `ResetPasswordForm`
7. Calls `resetPassword()`
8. Validates token with `verifyPasswordResetToken()`
9. Updates password, invalidates sessions

## 🧪 Testing Checklist

When refactoring, test:
- [ ] Login/logout flows
- [ ] Registration with email verification
- [ ] Password reset flow
- [ ] Admin page access (middleware)
- [ ] API route protection
- [ ] Session expiration
- [ ] Account lockout after failed attempts
- [ ] "Remember me" functionality
- [ ] Multi-device session management
- [ ] Security event logging
- [ ] Rate limiting

## 🚀 Refactor Strategy

### Phase 1: Core Library (Maintain Compatibility)
Update `src/lib/auth/*` files while keeping same interfaces

### Phase 2: Database Migration
Update schema with backward-compatible migrations

### Phase 3: Components & Pages
Update UI components and auth pages

### Phase 4: API Routes
Update all API route handlers

### Phase 5: Cleanup
Remove deprecated code and update documentation

## ⚠️ Critical Notes

1. **Don't Break Session Structure**: JWT payload used everywhere
2. **Migration Required**: Any database schema changes
3. **Test Email Flows**: Verification and reset depend on email service
4. **Security Headers**: Defined in `security-config.ts`, applied in `proxy.ts`
5. **Rate Limiting**: Configured per-endpoint in `security-config.ts`

---

📚 **Full Documentation:** [AUTH_SYSTEM_INVENTORY.md](./AUTH_SYSTEM_INVENTORY.md)
