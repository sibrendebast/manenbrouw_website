# AWS Amplify Deployment Checklist

## Before You Start
- [ ] All code is committed to GitHub
- [ ] You have an AWS account
- [ ] You have test API keys ready (Stripe, Resend, Cloudinary)

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for AWS Amplify deployment"
git push origin main
```

### 2. Set Up AWS Amplify
- [ ] Go to AWS Amplify Console
- [ ] Click "New app" → "Host web app"
- [ ] Connect to GitHub
- [ ] Select repository: `manenbrouw_website`
- [ ] Select branch: `main`

### 3. Add Environment Variables
Go to App settings → Environment variables and add:

- [ ] `DATABASE_URL` = `file:./dev.db`
- [ ] `STRIPE_SECRET_KEY` = (your test key)
- [ ] `STRIPE_PUBLISHABLE_KEY` = (your test key)
- [ ] `STRIPE_WEBHOOK_SECRET` = (get after webhook setup)
- [ ] `RESEND_API_KEY` = (your key)
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = (your cloud name)
- [ ] `CLOUDINARY_API_KEY` = (your API key)
- [ ] `CLOUDINARY_API_SECRET` = (your API secret)

See `ENV_VARIABLES.md` for details on getting these values.

### 4. Deploy
- [ ] Click "Save and deploy"
- [ ] Wait 3-5 minutes for build to complete
- [ ] Copy your Amplify URL

### 5. Set Up Stripe Webhook
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Add endpoint: `https://your-amplify-url.amplifyapp.com/api/stripe/webhook`
- [ ] Select event: `checkout.session.completed`
- [ ] Copy webhook signing secret
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Amplify environment variables
- [ ] Redeploy the app

### 6. Test Your Deployment
- [ ] Visit homepage
- [ ] Add product to cart
- [ ] Complete test checkout (card: 4242 4242 4242 4242)
- [ ] Verify cart clears after purchase
- [ ] Check email confirmation received
- [ ] Test admin panel

## Files Created
- `amplify.yml` - Build configuration
- `AWS_AMPLIFY_DEPLOYMENT.md` - Detailed deployment guide
- `ENV_VARIABLES.md` - Environment variables reference
- `DEPLOYMENT_CHECKLIST.md` - This file

## Need Help?
See `AWS_AMPLIFY_DEPLOYMENT.md` for detailed instructions and troubleshooting.
