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
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your_cloudinary_upload_preset>

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
2. Find your Cloud Name on the dashboard → Use for NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
3. Go to Settings → Upload → Upload presets
4. Create or use existing preset → Use for NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

---

## Important Notes

- Do NOT include quotes around the values in AWS Amplify
- These are TEST keys - use different keys for production
- After adding/changing environment variables, you must redeploy the app
- Keep these keys secure and never commit them to GitHub
