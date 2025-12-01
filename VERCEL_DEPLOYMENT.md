# Vercel Deployment Guide

## Why Vercel?

- ✅ Made by the creators of Next.js
- ✅ Zero configuration needed
- ✅ Automatic HTTPS and CDN
- ✅ Easy database integration
- ✅ Generous free tier
- ✅ Excellent performance

## Prerequisites

- GitHub account with your code pushed
- Vercel account (free)
- Cloudinary account (already set up ✅)
- Stripe test keys (already have ✅)
- Resend API key (already have ✅)

---

## Step-by-Step Deployment

### 1. Create Vercel Account

1. Go to [vercel.com/signup](https://vercel.com/signup)
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### 2. Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository: `manenbrouw_website`
3. Vercel will automatically detect it's a Next.js app
4. Click **"Deploy"** (don't configure anything yet)

**Note:** The first deployment will fail because we haven't set up the database and environment variables yet. That's expected!

### 3. Set Up Database (Vercel Postgres)

#### Option A: Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"** → **"Postgres"**
3. Choose a region close to your users (e.g., Frankfurt for Europe)
4. Click **"Create"**
5. Vercel will automatically add `DATABASE_URL` to your environment variables

#### Option B: External Database (Alternative)

If you prefer, you can use:
- **Neon** (free PostgreSQL): [neon.tech](https://neon.tech)
- **Supabase** (free PostgreSQL): [supabase.com](https://supabase.com)
- **PlanetScale** (free MySQL): [planetscale.com](https://planetscale.com)

### 4. Update Database Schema for PostgreSQL

Since we're moving from SQLite to PostgreSQL, update your Prisma schema:

**File:** `prisma/schema.prisma`

Change line 6 from:
```prisma
provider = "sqlite"
```

To:
```prisma
provider = "postgresql"
```

**Commit and push this change:**
```bash
git add prisma/schema.prisma
git commit -m "Update database provider to PostgreSQL"
git push origin main
```

### 5. Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

#### Database (Auto-added if using Vercel Postgres)
```
DATABASE_URL=<automatically added by Vercel Postgres>
```

#### Stripe (Test Mode)
```
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

#### Resend (Email)
```
RESEND_API_KEY=re_YOUR_API_KEY
```

#### Cloudinary (Image Uploads)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=de4xdsv7p
CLOUDINARY_API_KEY=553996473685574
CLOUDINARY_API_SECRET=otZd2c59JGvHGZ4yDgrMgn_1-qw
```

**Important:** For each variable, select **"All Environments"** (Production, Preview, Development)

### 6. Run Database Migrations

After adding environment variables, you need to set up the database schema.

**Option A: Use Vercel CLI (Recommended)**

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

6. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

**Option B: Use Prisma Data Platform**

1. Go to [cloud.prisma.io](https://cloud.prisma.io)
2. Connect your database
3. Run migrations from the web interface

### 7. Redeploy

1. Go to Vercel dashboard → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger automatic deployment

### 8. Set Up Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter your Vercel URL:
   ```
   https://your-project.vercel.app/api/stripe/webhook
   ```
4. Select events: `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
7. Redeploy

### 9. Test Your Deployment

Visit your Vercel URL (e.g., `https://your-project.vercel.app`) and test:

- [ ] Homepage loads
- [ ] Shop page shows products
- [ ] Events page shows events
- [ ] Add product to cart
- [ ] Add event ticket to cart
- [ ] Checkout process works
- [ ] Test payment with card: `4242 4242 4242 4242`
- [ ] Verify email confirmation
- [ ] Test admin panel login
- [ ] Upload product/event image (Cloudinary)

---

## Custom Domain (Optional)

### Add Your Domain

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `manenbrouw.be`
4. Follow DNS instructions to point your domain to Vercel
5. Vercel automatically provisions SSL certificate

### DNS Configuration

Add these records to your domain registrar:

**For root domain (manenbrouw.be):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Advantages Over AWS Amplify

✅ **Better Next.js Support** - Made by Next.js creators
✅ **Easier Database** - One-click Postgres setup
✅ **Faster Deployments** - Optimized for Next.js
✅ **Better Edge Network** - Faster global delivery
✅ **Simpler Pricing** - More predictable costs
✅ **Better DX** - Superior developer experience

---

## Cost Estimate

### Free Tier (Hobby Plan)
- **Bandwidth:** 100 GB/month
- **Build time:** 6,000 minutes/month
- **Serverless function executions:** 100 GB-hours
- **Edge middleware:** 1M requests/month

**This is more than enough for a small-medium webshop!**

### Pro Plan ($20/month)
Only needed if you exceed free tier or need:
- Team collaboration
- Advanced analytics
- Password protection
- More build minutes

### Database Costs
- **Vercel Postgres:** $20/month (includes 256MB storage, 60 compute hours)
- **Alternative:** Neon free tier (0.5GB storage, unlimited)

---

## Monitoring & Analytics

Vercel provides built-in:
- **Real-time logs** - See errors as they happen
- **Analytics** - Page views, performance metrics
- **Web Vitals** - Core Web Vitals monitoring
- **Error tracking** - Automatic error reporting

Access via: **Dashboard → Analytics**

---

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to Vercel dashboard → Deployments
2. Click on failed deployment
3. View build logs

**Common issues:**
- Missing environment variables
- Database connection issues
- Prisma client not generated

**Solution:** Ensure all environment variables are set and redeploy

### Database Connection Errors

**Cause:** Database URL not set or incorrect

**Solution:**
1. Check `DATABASE_URL` in environment variables
2. Ensure Prisma schema uses `postgresql` provider
3. Run migrations: `npx prisma migrate deploy`

### Images Not Uploading

**Cause:** Cloudinary credentials not set

**Solution:**
1. Verify all 3 Cloudinary variables are set
2. Check Cloudinary dashboard for errors
3. Test upload in admin panel

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will:
1. Detect the push
2. Build your app
3. Run tests (if configured)
4. Deploy to production
5. Send you a notification

**Preview Deployments:**
- Every pull request gets its own preview URL
- Test changes before merging
- Share with team/clients

---

## Security Best Practices

✅ **Environment Variables** - Never commit secrets to Git
✅ **HTTPS** - Automatic SSL certificates
✅ **DDoS Protection** - Built-in protection
✅ **Rate Limiting** - Consider adding for API routes
✅ **CSP Headers** - Configure in `next.config.ts`

---

## Next Steps After Deployment

1. **Test thoroughly** - All features, payments, emails
2. **Set up monitoring** - Check Vercel Analytics
3. **Configure custom domain** - Point manenbrouw.be to Vercel
4. **Update email sender** - Use your domain in Resend
5. **Switch Stripe to live mode** - When ready for production
6. **Set up backups** - Database backups (automatic with Vercel Postgres)

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Support](https://vercel.com/support)

---

## Migration from AWS Amplify

If you already deployed to AWS Amplify:

1. **Keep Amplify running** - Don't delete it yet
2. **Deploy to Vercel** - Follow this guide
3. **Test Vercel deployment** - Ensure everything works
4. **Update DNS** - Point domain to Vercel
5. **Delete Amplify app** - Once Vercel is stable

**Data Migration:**
- Export data from SQLite (if you have any test data)
- Import to PostgreSQL using Prisma Studio or SQL

---

## Checklist

- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set up Vercel Postgres database
- [ ] Update Prisma schema to PostgreSQL
- [ ] Add all environment variables
- [ ] Run database migrations
- [ ] Redeploy
- [ ] Set up Stripe webhook
- [ ] Test all functionality
- [ ] Configure custom domain (optional)
- [ ] Switch to production mode when ready

**You're ready to deploy! 🚀**
