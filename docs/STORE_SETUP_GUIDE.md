# Store Setup Guide

This comprehensive guide walks you through setting up the e-commerce store feature from scratch. The store is **completely optional** and can be disabled if you only need a portfolio website.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Stripe Account Setup](#stripe-account-setup)
- [Environment Configuration](#environment-configuration)
- [Webhook Configuration](#webhook-configuration)
- [Testing the Setup](#testing-the-setup)
- [Production Deployment](#production-deployment)
- [Store Configuration](#store-configuration)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Overview

The store system provides:

- **E-commerce Platform**: Sell photography prints with secure payment processing
- **Order Management**: Track orders, shipping, and customer information
- **Admin Dashboard**: Complete analytics and management interface
- **Customer Experience**: Modern shopping cart, checkout, and order tracking
- **Production Security**: Comprehensive security measures and audit logging

## Prerequisites

Before setting up the store, ensure you have:

- [ ] A Stripe account (free to create)
- [ ] A business email address for order notifications
- [ ] Basic understanding of environment variables
- [ ] Access to your hosting platform's environment settings

## Stripe Account Setup

### 1. Create a Stripe Account

1. Visit [stripe.com](https://stripe.com) and create an account
2. Complete the business verification process
3. Activate your account for live payments (required for production)

### 2. Gather API Keys

Navigate to **Developers > API keys** in your Stripe dashboard:

#### Test Mode Keys (for development)

```bash
# Publishable key (starts with pk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51Abc..."

# Secret key (starts with sk_test_)
STRIPE_SECRET_KEY="sk_test_51Abc..."
```

#### Live Mode Keys (for production)

```bash
# Publishable key (starts with pk_live_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51Abc..."

# Secret key (starts with sk_live_)
STRIPE_SECRET_KEY="sk_live_51Abc..."
```

⚠️ **Important**: Keep secret keys confidential and never commit them to version control.

## Environment Configuration

Add these variables to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_51Abc..."  # Use sk_live_ for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51Abc..."  # Use pk_live_ for production
STRIPE_WEBHOOK_SECRET="whsec_..."  # Get this from webhook setup below

# Required for store functionality
ADMIN_EMAIL="your-business@email.com"  # Where order notifications are sent
RESEND_API_KEY="re_..."  # For sending order confirmation emails

# Site Configuration
SITE_URL="https://yourdomain.com"  # Your website URL (important for webhooks)
```

### Site Configuration

Enable the store in your site configuration:

```typescript
// src/config/site.ts
export const siteConfig = {
  // ... other configuration
  features: {
    storeEnabled: true, // Set to false to disable store
    aiEnabled: true, // AI features (optional)
  },
}
```

## Webhook Configuration

Webhooks are **critical** for the store to function properly. They ensure that when payments succeed, your database is updated with the order information.

### 1. Create Webhook Endpoint

1. In your Stripe dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   - **Development**: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`

### 2. Configure Events to Listen For

Select these specific events (and **only** these events):

- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `payment_intent.canceled`

⚠️ **Important**: Do not select "Send all event types" as this can cause performance issues.

### 3. Get Webhook Secret

1. After creating the webhook, click on it to view details
2. Click **Reveal** next to **Signing secret**
3. Copy the secret (starts with `whsec_`) to your `STRIPE_WEBHOOK_SECRET` environment variable

### 4. Webhook URL Examples

```bash
# Development (using ngrok for local testing)
https://abc123.ngrok.io/api/webhooks/stripe

# Production (your actual domain)
https://yourdomain.com/api/webhooks/stripe
https://www.yourdomain.com/api/webhooks/stripe
```

## Testing the Setup

### 1. Development Testing

Use Stripe's test mode and test cards:

```bash
# Test card numbers
4242424242424242  # Visa - succeeds
4000000000000002  # Visa - declined
4000000000009995  # Visa - insufficient funds
```

### 2. Webhook Testing with Stripe CLI

Install and use the Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
npm install -g stripe-cli
# or download from: https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test with a specific event
stripe trigger payment_intent.succeeded
```

### 3. End-to-End Testing Checklist

Test the complete flow:

- [ ] Add products to cart
- [ ] Proceed to checkout
- [ ] Fill in customer information
- [ ] Complete payment with test card
- [ ] Verify order appears in admin dashboard
- [ ] Check that confirmation email was sent
- [ ] Verify webhook was received and processed

## Production Deployment

### 1. Switch to Live Mode

1. In Stripe dashboard, toggle to **Live mode**
2. Update your environment variables with live keys
3. Update webhook endpoint URL to your production domain
4. Test with real payment methods (use small amounts)

### 2. Production Checklist

Before going live:

- [ ] **Stripe account activated** for live payments
- [ ] **Live API keys** configured in production environment
- [ ] **Webhook endpoint** updated for production URL
- [ ] **SSL certificate** installed (HTTPS required)
- [ ] **Domain verified** and accessible
- [ ] **Email delivery** tested (order confirmations)
- [ ] **Database backups** configured
- [ ] **Monitoring** set up for failed payments/webhooks

### 3. Go-Live Testing

Perform final tests with real (small) payments:

1. Complete a real purchase with a real card
2. Verify the order is created
3. Check webhook delivery in Stripe dashboard
4. Confirm email notifications work
5. Test refund process if needed

## Store Configuration

### Site Configuration Options

The store behavior can be customized through the `siteConfig` object in `src/config/site.ts`:

```typescript
export const siteConfig = {
  // ... other config options
  features: {
    storeEnabled: true, // Enable/disable entire store
    store: {
      reviewsEnabled: false, // Show/hide product reviews
      showTax: true, // Tax display behavior (see below)
    },
  },
}
```

#### Tax Display Configuration

The `showTax` setting controls how taxes are displayed to customers:

**When `showTax: true` (Default)**

- Tax is shown as a separate line item during checkout
- Product prices show base price only
- Customer sees: "Subtotal: £25.00, Tax: £5.00, Total: £30.00"

**When `showTax: false`**

- Tax is included in all displayed prices
- No separate tax line shown to customer
- Customer sees: "Subtotal: £30.00, Total: £30.00" (tax included)

This is useful for:

- **B2C sales in regions where tax-inclusive pricing is standard** (EU, UK)
- **Simplified checkout experience** without tax complexity
- **Compliance with local regulations** requiring tax-inclusive display

#### Reviews Configuration

Set `reviewsEnabled: true/false` to show/hide the entire reviews system:

- Product rating displays under product titles
- Customer review sections on product pages
- Review submission forms

### Product Management

Products are managed through the admin dashboard:

1. Navigate to `/admin` and log in
2. Go to **Store > Products**
3. Add products with:
   - High-quality images
   - Detailed descriptions
   - Pricing and availability
   - Size and material options

### Shipping Configuration

Configure shipping rates in the admin dashboard:

1. Go to **Store > Settings**
2. Set up shipping zones and rates
3. Configure tax rates by location
4. Set up handling fees if needed

### Analytics and Reporting

Monitor your store performance:

1. **Analytics Dashboard**: View sales trends and metrics
2. **Order Management**: Track and fulfill orders
3. **Customer Data**: Monitor customer behavior
4. **Financial Reports**: Track revenue and taxes

## Troubleshooting

### Common Issues

#### Webhook Not Receiving Events

```bash
# Check webhook delivery in Stripe dashboard
# Developers > Webhooks > [Your Webhook] > Events

# Common causes:
- Incorrect URL (check for typos)
- SSL certificate issues
- Server not responding to POST requests
- Firewall blocking Stripe IPs
```

#### Payment Succeeds but Order Not Created

```bash
# This indicates webhook failure
# Check:
1. Webhook secret is correct
2. Webhook events are configured correctly
3. Server logs for webhook errors
4. Database connectivity
```

#### Orders Not Appearing in Admin

```bash
# Check:
1. Database migration completed
2. Webhook processing successfully
3. Admin user permissions
4. Browser cache (hard refresh)
```

### Debug Mode

Enable debug logging by adding to your environment:

```bash
# Enable detailed logging
DEBUG_STORE=true
```

### Webhook Testing Commands

```bash
# Test webhook delivery
curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check webhook endpoint status
curl -I https://yourdomain.com/api/webhooks/stripe
```

## Security Considerations

### Environment Variables

```bash
# Never commit these to version control:
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# These can be public:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Best Practices

1. **Use HTTPS everywhere** (required by Stripe)
2. **Verify webhook signatures** (automatically handled)
3. **Validate all inputs** (automatically handled)
4. **Monitor failed payments** (check Stripe dashboard)
5. **Regular security updates** (keep dependencies updated)
6. **Backup your database** regularly

### Rate Limiting

The store includes automatic rate limiting:

- **Checkout**: 10 attempts per minute per IP
- **Email**: 5 attempts per minute per IP
- **Webhooks**: 100 calls per minute per IP

### Data Protection

- Customer payment data never touches your servers
- Order information is encrypted in your database
- PCI compliance handled by Stripe
- GDPR considerations for customer data

## Support and Resources

### Stripe Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Webhook Testing Guide](https://stripe.com/docs/webhooks/test)
- [API Reference](https://stripe.com/docs/api)
- [Test Card Numbers](https://stripe.com/docs/testing#cards)

### Photography Portfolio Resources

- [Security Documentation](./STORE_SECURITY.md)
- [General Setup Guide](../README.md)
- [Issues and Support](https://github.com/theomiddleton/photography-portfolio/issues)

### Getting Help

If you encounter issues:

1. Check this guide and the troubleshooting section
2. Review [STORE_SECURITY.md](./STORE_SECURITY.md) for security requirements
3. Search existing [GitHub issues](https://github.com/theomiddleton/photography-portfolio/issues)
4. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Environment details (Node.js version, hosting platform)
   - Relevant error messages (without sensitive data)

---

## Quick Reference

### Essential Environment Variables

```bash
# Minimum required for store functionality
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
ADMIN_EMAIL="your@email.com"
RESEND_API_KEY="re_..."
```

### Webhook Events to Configure

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

### Key URLs

- **Webhook Endpoint**: `https://yourdomain.com/api/webhooks/stripe`
- **Admin Dashboard**: `https://yourdomain.com/admin`
- **Store Front**: `https://yourdomain.com/store`

---

**Ready to start selling your photography!** 📸💰

This store system is production-ready with enterprise-grade security, comprehensive analytics, and excellent user experience. Follow this guide step-by-step, and you'll have a professional e-commerce platform for your photography business.
