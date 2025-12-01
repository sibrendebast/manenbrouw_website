# AWS Amplify Deployment Guide

## Prerequisites
- AWS Account
- GitHub repository with your code
- Test API keys for Stripe, Resend, and Cloudinary

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

Make sure all your latest changes are committed and pushed:

```bash
git add .
git commit -m "Prepare for AWS Amplify deployment"
git push origin main
```

### 2. Set Up AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Select **GitHub** as your repository service
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository: `manenbrouw_website`
6. Select the branch: `main` (or your default branch)

### 3. Configure Build Settings

AWS Amplify should automatically detect your Next.js app and use the `amplify.yml` file.

**Verify the build settings:**
- Build command: `npm run build`
- Build output directory: `.next`
- The `amplify.yml` file in your repo will be used automatically

### 4. Add Environment Variables

In the AWS Amplify console, go to **"Environment variables"** and add the following:

#### Required Variables

```
DATABASE_URL=file:./dev.db
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
RESEND_API_KEY=re_YOUR_API_KEY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**How to add them:**
1. In Amplify Console, select your app
2. Go to **"App settings"** → **"Environment variables"**
3. Click **"Manage variables"**
4. Add each variable with its key and value
5. Click **"Save"**

### 5. Configure Advanced Settings (Optional)

**Node.js Version:**
- Go to **"App settings"** → **"Build settings"**
- Set Node.js version to `20` or `18` (recommended)

**Build Image:**
- Use the default Amazon Linux 2023 image

### 6. Deploy

1. Click **"Save and deploy"**
2. AWS Amplify will:
   - Clone your repository
   - Install dependencies
   - Generate Prisma client
   - Build your Next.js app
   - Deploy to a CDN

The build should take 3-5 minutes.

### 7. Access Your App

Once deployed, AWS Amplify will provide you with a URL like:
```
https://main.d1234567890abc.amplifyapp.com
```

## Post-Deployment Configuration

### Set Up Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   ```
   https://your-amplify-url.amplifyapp.com/api/stripe/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Update the `STRIPE_WEBHOOK_SECRET` environment variable in Amplify
7. Redeploy the app (Amplify → Redeploy this version)

### Update Email Configuration

The email sender is currently set to `onboarding@resend.dev`. For production:

1. Verify your domain in Resend
2. Update `lib/email.ts` line 14 to use your domain:
   ```typescript
   from: 'Man & Brouw <noreply@manenbrouw.be>',
   ```

## Testing Your Deployment

### Test Checklist

- [ ] Visit the homepage
- [ ] Browse products in the shop
- [ ] Add products to cart
- [ ] View cart page
- [ ] Browse events
- [ ] Add event tickets to cart
- [ ] Go through checkout process
- [ ] Complete a test payment with Stripe test card: `4242 4242 4242 4242`
- [ ] Verify order confirmation email is sent
- [ ] Check admin panel access
- [ ] Test image uploads (if using Cloudinary)

### Stripe Test Cards

Use these test cards for testing payments:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

Use any future expiry date, any 3-digit CVC, and any postal code.

## Continuous Deployment

AWS Amplify automatically deploys when you push to your GitHub repository:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. AWS Amplify automatically detects the push and starts a new build

## Monitoring and Logs

### View Build Logs
1. Go to AWS Amplify Console
2. Select your app
3. Click on a deployment
4. View the build logs to debug any issues

### View Application Logs
- Amplify doesn't provide runtime logs by default
- For detailed logging, consider using CloudWatch Logs

## Troubleshooting

### Build Fails

**Check the build logs in Amplify Console:**

1. **"Cannot find module 'prisma'"**
   - Make sure `amplify.yml` includes `npx prisma generate`

2. **"Environment variable not set"**
   - Verify all environment variables are added in Amplify Console
   - Variables should NOT have quotes around values

3. **"Out of memory"**
   - Increase build memory in App settings → Build settings → Build image settings

### Runtime Issues

1. **"Stripe is not configured"**
   - Check that `STRIPE_SECRET_KEY` is set correctly
   - Redeploy after adding environment variables

2. **Database errors**
   - SQLite works for testing but has limitations
   - For production, consider using Amazon RDS (PostgreSQL/MySQL)

3. **Images not loading**
   - Check Cloudinary credentials
   - Verify CORS settings in Cloudinary

## Database Considerations

**Current Setup:** SQLite (file-based database)

**Limitations:**
- Each deployment creates a new instance
- Data is lost between deployments
- Not suitable for production

**Recommended for Production:**
1. Use Amazon RDS (PostgreSQL or MySQL)
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // or "mysql"
     url      = env("DATABASE_URL")
   }
   ```
3. Update `DATABASE_URL` to your RDS connection string
4. Run migrations: `npx prisma migrate deploy`

## Custom Domain (Optional)

1. In Amplify Console, go to **"Domain management"**
2. Click **"Add domain"**
3. Enter your domain: `manenbrouw.be`
4. Follow the instructions to update DNS records
5. AWS will automatically provision an SSL certificate

## Cost Estimate

AWS Amplify pricing (as of 2024):
- **Build minutes:** First 1,000 minutes/month free, then $0.01/minute
- **Hosting:** First 15 GB served/month free, then $0.15/GB
- **Storage:** First 5 GB/month free, then $0.023/GB

For a test application with low traffic, you'll likely stay within the free tier.

## Support

For AWS Amplify specific issues:
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [AWS Support](https://console.aws.amazon.com/support/)

For application issues, contact your development team.
