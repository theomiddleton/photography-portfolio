# Security Policy

## Overview

This photography portfolio implements enterprise-grade security measures to protect user data, prevent unauthorized access, and ensure secure operation of both portfolio and e-commerce features. This document outlines our security architecture, authentication systems, and provides guidance for responsible disclosure of security issues.

## 🔐 Authentication & Authorization

### Authentication System

Our authentication system is built with security-first principles:

- **JWT-based Authentication**: Secure token-based authentication with configurable expiration
- **Session Management**: Device tracking, "Remember Me" functionality, and session revocation
- **Password Security**: Strong password requirements with bcrypt hashing
- **Account Lockouts**: Automatic account lockouts after failed login attempts
- **Email Verification**: Required email verification for new accounts
- **Password Reset**: Secure password reset flow with time-limited tokens

See [`src/lib/account-security.ts`](src/lib/account-security.ts) for implementation details.

### Authorization

- **Role-based Access Control**: Admin and user roles with appropriate permissions
- **Route Protection**: Protected routes with middleware enforcement
- **Admin Setup**: Secure first admin setup process with race condition prevention
- **CSRF Protection**: Cross-site request forgery protection on sensitive operations

### Rate Limiting

Comprehensive rate limiting powered by Upstash Redis:

- **Authentication APIs**: 10 attempts per minute per IP for login/password operations
- **Email APIs**: 5 attempts per minute per IP
- **Admin APIs**: 3x multiplier for administrative operations
- **Store APIs**: 10 attempts per minute per IP for checkout operations
- **AI APIs**: 5 attempts per minute per IP (due to computational cost)

See [Rate Limiting Setup](README.md#-rate-limiting-setup-redis) for configuration details.

## 🔧 Security Configuration

The project uses a centralized security configuration system via [`src/config/security-config.ts`](src/config/security-config.ts) that defines all security parameters and policies.

### Security Configuration Overview

#### Password Security

- **Minimum Length**: 8 characters
- **Maximum Length**: 128 characters
- **Requirements**: Must include uppercase, lowercase, numbers, and special characters
- **Hashing**: bcrypt with 12 rounds (industry standard for 2024)

#### JWT Configuration

- **Algorithm**: HS256 (HMAC SHA-256)
- **Secret Requirements**: Minimum 32 characters for cryptographic security
- **Default Expiration**: 168 hours (1 week) - reduced from 30 days for enhanced security
- **Validation**: Automatic secret length validation

#### Session Security

- **Cookie Name**: `session`
- **HTTP Only**: `true` (prevents XSS access)
- **Secure**: `true` (HTTPS only in production)
- **SameSite**: `strict` (CSRF protection)
- **Path**: `/` (application-wide)

#### Account Security Policies

- **Failed Attempts**: Maximum 5 failed login attempts
- **Lockout Duration**: 15 minutes after account lockout
- **Email Verification**: Required for all new accounts
- **Session Invalidation**: Password changes invalidate all existing sessions

#### Rate Limiting Strategy

- **Fail-Closed Endpoints**: `passwordAttempt`, `email`, `upload` (deny when Redis unavailable)
- **Fail-Open Endpoints**: `webhook`, `revalidate` (allow when Redis unavailable)
- **Admin Multiplier**: 3x rate limit for admin operations

#### Input Validation Limits

- **Email**: Maximum 255 characters
- **Name**: Maximum 100 characters
- **Password**: Maximum 128 characters
- **User Agent**: Maximum 100 characters (for logging)

#### Security Logging Configuration

- **Email Masking**: Enabled (protects PII)
- **IP Masking**: Enabled (GDPR compliance)
- **User Agent Truncation**: Enabled
- **Detail Length**: Maximum 200 characters per log entry

### Required Security Environment Variables

#### Core Authentication & Security

```bash
# JWT Configuration (Required)
JWT_SECRET="your-strong-jwt-secret-min-32-chars"  # Must be at least 32 characters
JWT_EXPIRATION_HOURS="168"  # 1 week (recommended for security)

# Feature Flags Security (Required)
FLAGS_SECRET="your-32-character-minimum-secret"  # Controls feature flags access

# Site Configuration (Required)
SITE_URL="https://yourdomain.com"  # Used for email links and CORS
ADMIN_EMAIL="admin@yourdomain.com"  # Default admin email
```

#### Database & Storage Security

```bash
# Database (Required)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Cloudflare R2 Storage (Required)
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_REGION="auto"  # or specific region
R2_IMAGE_BUCKET_NAME="your-image-bucket"
R2_BLOG_IMG_BUCKET_NAME="your-blog-bucket"
R2_ABOUT_IMG_BUCKET_NAME="your-about-bucket"
R2_CUSTOM_IMG_BUCKET_NAME="your-custom-bucket"
```

#### Rate Limiting (Required for Production)

```bash
# Upstash Redis for Rate Limiting (Required)
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

#### Email Security

```bash
# Resend API for Email (Required)
RESEND_API_KEY="re_..." # From Resend dashboard
```

#### Store Security (Optional - if e-commerce enabled)

```bash
# Stripe Payment Processing
STRIPE_SECRET_KEY="sk_live_..."  # NEVER commit this - use environment
STRIPE_WEBHOOK_SECRET="whsec_..."  # From Stripe webhook configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Safe for client-side
```

#### Additional Security Features

```bash
# Vercel Edge Config (Optional)
EDGE_CONFIG="https://edge-config.vercel.com/..."  # For feature flags

# AI Integration (Optional)
GOOGLE_GENERATIVE_AI_API_KEY="AI..."  # For AI features

# Media Streaming (Optional)
NEXT_PUBLIC_MEDIA_HOSTS="https://cdn1.example.com,https://cdn2.example.com"  # Extra CSP media-src hosts

# Cron Job Security (Optional)
CRON_SECRET="your-cron-secret"  # For securing scheduled tasks
```

### Environment Variable Validation

The project uses [`@t3-oss/env-nextjs`](src/env.js) for robust environment variable validation:

- **Type Safety**: Zod schemas ensure correct types
- **Required vs Optional**: Clear distinction between required and optional variables
- **Validation**: Automatic validation at build time
- **Security**: Prevents deployment with missing critical variables

#### Validation Features

- **URL Validation**: Ensures proper URL format for database and API endpoints
- **Email Validation**: Validates admin email format
- **Minimum Length**: Enforces minimum lengths for secrets (32+ characters)
- **Coercion**: Automatic type conversion for numeric values

## 🛒 E-commerce Security

When the store is enabled, additional security measures are implemented:

### Payment Security

- **Stripe Integration**: PCI-compliant payment processing
- **Webhook Verification**: Cryptographic signature validation for all webhooks
- **Payment Validation**: Server-side amount verification
- **Idempotency**: Prevention of duplicate charges

### Store Security Features

- **Input Validation**: All store inputs validated with Zod schemas
- **Transaction Safety**: Database operations wrapped in transactions
- **Audit Logging**: Complete audit trail for all store operations
- **Authorization Checks**: Admin functions properly protected

For complete store security documentation, see [`docs/STORE_SECURITY.md`](docs/STORE_SECURITY.md).

## 🔍 Security Logging & Monitoring

### Security Event Logging

Comprehensive logging of security-relevant events:

- **Authentication Events**: Login attempts, password changes, account lockouts
- **Admin Operations**: Admin setup, privilege escalations, configuration changes
- **Store Operations**: Payment processing, order creation, refunds
- **Security Incidents**: Failed authentication, rate limit violations, suspicious activity

### Privacy Protection

- **PII Protection**: No personally identifiable information in logs
- **Data Minimization**: Only necessary data is logged
- **Secure Storage**: Logs stored securely with appropriate retention policies

## 🛡️ Security Headers & Middleware

### Security Headers

Implemented via [`src/middleware.ts`](src/middleware.ts):

- **Content Security Policy (CSP)**: Prevents XSS attacks with strict policies
- **X-Frame-Options**: DENY - Prevents clickjacking
- **X-Content-Type-Options**: nosniff - Prevents MIME sniffing
- **X-XSS-Protection**: 1; mode=block - Legacy XSS protection
- **Referrer-Policy**: strict-origin-when-cross-origin - Controls referrer information

#### Content Security Policy Details

```csp
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
style-src 'self' 'unsafe-inline';
media-src 'self' data: blob: https://*.r2.cloudflarestorage.com ${NEXT_PUBLIC_STREAM_BUCKET_URL} [NEXT_PUBLIC_MEDIA_HOSTS];
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https://api.stripe.com;
frame-src https://js.stripe.com;
```

#### Configuring Media Hosts

- The CSP `media-src` directive is generated at runtime from the configured streaming bucket and the comma-separated list stored in `NEXT_PUBLIC_MEDIA_HOSTS`.
- Default builds include sample hosts for the HLS debugger (Mux, Akamai, Apple) so testing works immediately.
- To allow additional CDNs, set `NEXT_PUBLIC_MEDIA_HOSTS="https://cdn1.example.com, https://cdn2.example.com"` and restart the server. The policy de-duplicates entries automatically.
- Ensure every host you add serves over HTTPS to avoid mixed-content failures in modern browsers.

### Input Validation

- **Zod Schemas**: Type-safe input validation for all user inputs
- **Sanitization**: Automatic sanitization of user-provided content
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM

## 🔒 Data Protection

### Database Security

- **Connection Security**: SSL-required database connections
- **Backup Strategy**: Regular automated backups recommended
- **Access Control**: Principle of least privilege for database access
- **Encryption**: Sensitive data encrypted at rest

### File Storage Security

- **Cloudflare R2 Integration**: Secure object storage with access controls
- **Presigned URLs**: Time-limited access to private content
- **File Validation**: File type and size validation
- **Usage Monitoring**: Alerts for storage usage limits

## 🚨 Security Issue Reporting

We take security seriously and appreciate responsible disclosure of security vulnerabilities.

### How to Report a Security Issue

If you discover a security vulnerability, please follow these steps:

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. **Do NOT** disclose the vulnerability publicly until we've had a chance to address it

**Email**: Send details to the project maintainer via GitHub's private vulnerability reporting or create a private security advisory.

### What to Include

When reporting a security issue, please include:

- **Clear description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** assessment
- **Affected versions** (if known)
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Initial Assessment**: We'll provide an initial assessment within 5 business days
- **Updates**: Regular updates on our progress toward a fix
- **Credit**: We'll credit you in our security advisory (if desired)
- **Fix Timeline**: Critical issues will be addressed within 7 days, others within 30 days

### Scope

Security issues we're particularly interested in:

- **Authentication bypasses**
- **Authorization vulnerabilities**
- **SQL injection**
- **Cross-site scripting (XSS)**
- **Cross-site request forgery (CSRF)**
- **Payment processing vulnerabilities**
- **File upload vulnerabilities**
- **Rate limiting bypasses**
- **Session management issues**

### Out of Scope

The following are generally out of scope:

- **Social engineering attacks**
- **Physical attacks**
- **Denial of service attacks**
- **Issues in third-party dependencies** (report to the upstream project)
- **Issues requiring physical access** to the server

### Security Checklist for Production

Before deploying to production:

- [ ] All environment variables configured with secure values
- [ ] JWT_SECRET is at least 32 characters long
- [ ] SSL/TLS certificate installed and configured
- [ ] Stripe webhooks configured and tested (if using store)
- [ ] Upstash Redis rate limiting tested and configured
- [ ] Database backups configured with encryption
- [ ] Security headers verified and CSP tested
- [ ] Admin authentication tested
- [ ] Email sending tested with proper DKIM/SPF
- [ ] Error handling verified (no information leakage)
- [ ] Security logs monitoring configured
- [ ] All secrets stored in environment variables (never committed)

## 🔄 Security Updates

### Keeping Secure

To maintain security:

1. **Regular Updates**: Keep all dependencies updated
2. **Security Patches**: Apply security patches promptly
3. **Monitor Advisories**: Watch for security advisories for used packages
4. **Review Logs**: Regularly review security logs for suspicious activity
5. **Test Security**: Regularly test authentication and authorization

### Dependency Security

We use automated tools to monitor dependencies:

- **npm audit**: Regular dependency vulnerability scanning
- **Dependabot**: Automated dependency updates
- **Security Advisories**: Monitor GitHub security advisories

## 📚 Additional Security Resources

### Documentation

- [Store Security Guide](docs/STORE_SECURITY.md) - Complete e-commerce security documentation
- [Store Setup Guide](docs/STORE_SETUP_GUIDE.md) - Secure store configuration
- [README Security Section](README.md#-security-features) - Overview of security features

### Security Best Practices

- **Regular Security Reviews**: Conduct periodic security assessments
- **Principle of Least Privilege**: Grant minimal necessary permissions
- **Defense in Depth**: Implement multiple security layers
- **Secure Development**: Follow secure coding practices
- **Security Training**: Stay updated on security best practices

---

## 📝 License

This security policy is part of the photography portfolio and is subject to the same license terms. For more information, see [LICENSE](LICENSE).

**Last Updated**: August 2025

---

**Note**: This is a living document. Security practices and procedures may be updated as the project evolves and new threats emerge.
