# Vercel Deployment Checklist

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] Prisma schema updated to PostgreSQL ✅
- [ ] All environment variables documented
- [ ] Cloudinary account set up ✅
- [ ] Stripe test keys ready ✅
- [ ] Resend API key ready ✅

## Vercel Setup

### 1. Account & Project
- [ ] Create Vercel account at [vercel.com/signup](https://vercel.com/signup)
- [ ] Connect GitHub account
- [ ] Import `manenbrouw_website` repository
- [ ] Let first deployment fail (expected - no database yet)

### 2. Database Setup
- [ ] Go to Storage tab in Vercel dashboard
- [ ] Create Postgres database
- [ ] Choose region (e.g., Frankfurt for Europe)
- [ ] Verify `DATABASE_URL` is auto-added to environment variables

### 3. Environment Variables

Go to **Settings → Environment Variables** and add:

#### Stripe
- [ ] `STRIPE_SECRET_KEY` = `sk_test_...`
- [ ] `STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...` (get after webhook setup)

#### Resend
- [ ] `RESEND_API_KEY` = `re_...`

#### Cloudinary
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = `de4xdsv7p`
- [ ] `CLOUDINARY_API_KEY` = `553996473685574`
- [ ] `CLOUDINARY_API_SECRET` = `otZd2c59JGvHGZ4yDgrMgn_1-qw`

**Important:** Select "All Environments" for each variable

### 4. Database Migration

Install Vercel CLI:
```bash
npm i -g vercel
```

Login and link project:
```bash
vercel login
vercel link
```

Pull environment variables:
```bash
vercel env pull .env.local
```

Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Deploy
- [ ] Push code to GitHub (triggers auto-deploy)
- [ ] Or click "Redeploy" in Vercel dashboard
- [ ] Wait for build to complete (~2-3 minutes)

### 6. Stripe Webhook
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Add endpoint: `https://your-project.vercel.app/api/stripe/webhook`
- [ ] Select event: `checkout.session.completed`
- [ ] Copy webhook signing secret
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] Redeploy

## Testing

- [ ] Visit your Vercel URL
- [ ] Test homepage
- [ ] Browse shop products
- [ ] Browse events
- [ ] Add items to cart
- [ ] Complete test checkout (card: `4242 4242 4242 4242`)
- [ ] Verify cart clears after purchase
- [ ] Check email confirmation
- [ ] Test admin panel login
- [ ] Upload product image (test Cloudinary)
- [ ] Upload event image (test Cloudinary)

## Optional: Custom Domain

- [ ] Go to Settings → Domains in Vercel
- [ ] Add domain: `manenbrouw.be`
- [ ] Update DNS records at your registrar
- [ ] Wait for SSL certificate (automatic)

## Post-Deployment

- [ ] Monitor Vercel Analytics
- [ ] Check error logs if any issues
- [ ] Update email sender to use your domain
- [ ] Document your Vercel URL
- [ ] Share with stakeholders for testing

## When Ready for Production

- [ ] Switch Stripe to live mode keys
- [ ] Update Stripe webhook to production URL
- [ ] Test with real payment (small amount)
- [ ] Set up database backups
- [ ] Monitor performance and errors

---

## Quick Reference

**Your Vercel Project:** [vercel.com/dashboard](https://vercel.com/dashboard)

**Documentation:** See `VERCEL_DEPLOYMENT.md` for detailed instructions

**Support:** [vercel.com/support](https://vercel.com/support)

---

## Estimated Time

- Setup: 15 minutes
- Database migration: 5 minutes
- Testing: 15 minutes
- **Total: ~35 minutes**

🚀 **You're ready to deploy!**
