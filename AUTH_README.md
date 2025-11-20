# 🔐 Authentication System Documentation

This directory contains comprehensive documentation for the entire authentication system in this photography portfolio application.

## 📚 Documentation Files

### 1. [AUTH_SYSTEM_INVENTORY.md](./AUTH_SYSTEM_INVENTORY.md) 
**The Complete Reference** (678 lines, 23KB)

This is the **master document** containing exhaustive details about every aspect of the authentication system.

**Use this when you need:**
- Complete list of all auth functions and their purposes
- Detailed database schema documentation
- Full API route inventory
- Component-by-component breakdown
- Security configuration details
- Migration planning information

**Contains 14 Sections:**
1. Core Auth Library (18 files)
2. Auth Components (10 files)
3. Auth Pages (12 pages)
4. Database Schema (2 tables, detailed)
5. API Routes Using Auth (40+ routes)
6. Admin & Account Pages (25+ pages)
7. Main App Pages Using Auth
8. Types & Schemas
9. Configuration Files
10. Security & Rate Limiting
11. Email Templates
12. Other Components Using Auth
13. Middleware & Proxy
14. External Dependencies

---

### 2. [AUTH_QUICK_REFERENCE.md](./AUTH_QUICK_REFERENCE.md)
**The Quick Lookup Guide** (238 lines, 6.9KB)

A condensed, easy-to-scan reference for developers working with the auth system.

**Use this when you need:**
- Quick stats and file counts
- Find the most important files quickly
- Understand protection mechanisms
- Look up common functions
- See auth flow diagrams
- Get testing checklist
- Find common import patterns

**Perfect for:**
- Daily development reference
- Onboarding new developers
- Quick lookups during coding
- Understanding the big picture

---

### 3. [AUTH_DIRECTORY_TREE.txt](./AUTH_DIRECTORY_TREE.txt)
**The Visual Structure** (154 lines)

A tree-style visualization of the entire auth system file structure.

**Use this when you need:**
- Visual overview of file organization
- Navigate the codebase structure
- Understand folder hierarchy
- Locate specific files quickly
- See what's in each directory

**Features:**
- Annotated with descriptions
- Critical files marked with ⭐
- Grouped by functionality
- Easy to scan

---

## 🎯 Quick Start Guide

### I'm planning a major refactor
→ Start with **AUTH_SYSTEM_INVENTORY.md** (Section 14: Refactor Considerations)

### I need to understand the auth flow
→ Check **AUTH_QUICK_REFERENCE.md** (Section: Typical Auth Flows)

### I want to find a specific file
→ Use **AUTH_DIRECTORY_TREE.txt** for quick navigation

### I'm new to this codebase
→ Read **AUTH_QUICK_REFERENCE.md** first, then dive into details as needed

### I need to modify an auth function
→ Look it up in **AUTH_SYSTEM_INVENTORY.md** Section 1

### I'm debugging an auth issue
→ Use **AUTH_QUICK_REFERENCE.md** to understand protection layers

---

## 📊 System Overview

### Architecture
```
┌─────────────────────────────────────────────────┐
│              Browser / Client                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Middleware (proxy.ts)                   │
│   Protects: /admin/*, /store/*, /api/files/*   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Pages & API Routes                         │
│   - Check getSession()                          │
│   - Call requireAuth() / requireAdminAuth()     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Auth Library (src/lib/auth/)            │
│   - Session Management                          │
│   - User Operations                             │
│   - Password Management                         │
│   - Email Verification                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Database (Postgres + Drizzle)           │
│   - users table (20+ fields)                    │
│   - userSessions table (11 fields)              │
└─────────────────────────────────────────────────┘
```

### Key Statistics
- **18** auth library files with **70+** functions
- **10** auth form components
- **12** auth pages
- **40+** API routes protected
- **25+** admin pages behind middleware
- **2** database tables for auth
- **3** protection layers

### Most Critical Files
1. `src/lib/auth/authSession.ts` - Session management (used everywhere)
2. `src/lib/auth/permissions.ts` - Authorization guards
3. `src/lib/auth/userActions.ts` - Core user operations
4. `src/proxy.ts` - Middleware protection
5. `src/server/db/schema.ts` - Database schema
6. `src/config/security-config.ts` - Security settings

---

## 🔒 Security Features

✅ **Password Security**
- Bcrypt hashing (12 rounds)
- Strong password requirements
- Password history tracking

✅ **Session Security**
- JWT tokens (1 week expiry)
- Database session tracking
- Multi-device support
- Session revocation

✅ **Account Security**
- Email verification required
- Account lockout (5 failed attempts)
- Security event logging
- Rate limiting

✅ **Network Security**
- Comprehensive security headers
- CSRF protection
- Timing-safe comparisons
- IP tracking

---

## 🧪 Testing Checklist

Before major changes, test:
- [ ] Login/logout flows
- [ ] Registration with email verification
- [ ] Password reset flow
- [ ] Admin page access (middleware)
- [ ] API route protection
- [ ] Session expiration
- [ ] Account lockout
- [ ] "Remember me" functionality
- [ ] Multi-device sessions
- [ ] Security event logging
- [ ] Rate limiting

---

## 🚀 Refactor Strategy

### Recommended 5-Phase Approach

**Phase 1: Core Library**
- Update `src/lib/auth/*` files
- Maintain backward compatibility
- Add new functions alongside old ones

**Phase 2: Database Migration**
- Create migration scripts
- Update schema incrementally
- Test with existing data

**Phase 3: Components & Pages**
- Update UI components
- Update auth pages
- Test all user flows

**Phase 4: API Routes**
- Update all API handlers
- Test each route individually
- Verify protection still works

**Phase 5: Cleanup**
- Remove deprecated code
- Update documentation
- Final security audit

---

## 🆘 Common Tasks

### Adding a new protected page
1. Check if route matches middleware pattern (`/admin/*`, `/store/*`)
2. If not, call `getSession()` or `requireAuth()` in the page
3. See examples in **AUTH_QUICK_REFERENCE.md**

### Adding a new API endpoint
1. Import `getSession()` or `requireAdminAuth()`
2. Check session at the start of the handler
3. Return 401 if unauthorized
4. See patterns in **AUTH_SYSTEM_INVENTORY.md** Section 5

### Modifying the session structure
⚠️ **CAUTION**: Session structure is used in 100+ places
1. Check **AUTH_SYSTEM_INVENTORY.md** Section 8.1
2. Update `UserSession` interface in `src/lib/types/session.ts`
3. Update JWT creation in `authHelpers.ts`
4. Update `getSession()` in `authSession.ts`
5. Test extensively before deploying

### Changing password requirements
1. Update `src/config/security-config.ts`
2. Update `src/lib/types/registerSchema.ts`
3. Update `PasswordRequirements` component
4. Test registration and password change flows

---

## 📞 Support

For questions about this documentation:
1. Check the appropriate documentation file first
2. Search for specific function names in **AUTH_SYSTEM_INVENTORY.md**
3. Review the directory structure in **AUTH_DIRECTORY_TREE.txt**

---

## 📝 Document Maintenance

**Last Updated:** 2025-11-20  
**Version:** 1.0  
**Created for:** Major authentication system refactor planning

**Update Triggers:**
- [ ] New auth features added
- [ ] Auth library restructured
- [ ] Database schema changes
- [ ] Major refactor completed
- [ ] New protection mechanisms added

---

## 🎓 Learning Path

### For New Developers
1. Start → **AUTH_QUICK_REFERENCE.md** (30 min read)
2. Browse → **AUTH_DIRECTORY_TREE.txt** (quick scan)
3. Reference → **AUTH_SYSTEM_INVENTORY.md** (as needed)

### For Refactoring Team
1. Read → **AUTH_SYSTEM_INVENTORY.md** completely (1-2 hours)
2. Reference → **AUTH_QUICK_REFERENCE.md** for quick lookups
3. Use → **AUTH_DIRECTORY_TREE.txt** for navigation

### For Security Audit
1. Focus → **AUTH_SYSTEM_INVENTORY.md** Sections 9, 10, 13
2. Review → All files in `src/lib/auth/`
3. Check → `src/proxy.ts` and `src/config/security-config.ts`

---

**Happy Coding! 🚀**
