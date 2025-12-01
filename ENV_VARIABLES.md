# Environment Variables for AWS Amplify (Test Environment)

Copy and paste these into AWS Amplify Console → Environment variables

## Database
DATABASE_URL=file:./dev.db

## Stripe (Test Mode)
STRIPE_SECRET_KEY=<your_stripe_test_secret_key>
STRIPE_PUBLISHABLE_KEY=<your_stripe_test_publishable_key>
STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>

## Resend (Email)
RESEND_API_KEY=<your_resend_api_key>

## Cloudinary (Image Uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

---

## How to Get These Values

### Stripe Keys (Test Mode)
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" → Use for STRIPE_PUBLISHABLE_KEY
3. Click "Reveal test key" for Secret key → Use for STRIPE_SECRET_KEY
4. For webhook secret, see AWS_AMPLIFY_DEPLOYMENT.md section "Set Up Stripe Webhook"

### Resend API Key
1. Go to https://resend.com/api-keys
2. Create a new API key
3. Copy the key → Use for RESEND_API_KEY

### Cloudinary Credentials
1. Go to https://console.cloudinary.com/
2. Find your **Cloud Name** on the dashboard → Use for NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
3. Find your **API Key** on the dashboard → Use for CLOUDINARY_API_KEY
4. Click "Reveal" next to API Secret → Use for CLOUDINARY_API_SECRET
5. Copy all three values

---

## Important Notes

- Do NOT include quotes around the values in AWS Amplify
- These are TEST keys - use different keys for production
- After adding/changing environment variables, you must redeploy the app
- Keep these keys secure and never commit them to GitHub
