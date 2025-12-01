# Deployment Guide for Man & Brouw Website

## Required Environment Variables

Before deploying, make sure to set the following environment variables in your deployment platform (Vercel, Netlify, etc.):

### Database
```
DATABASE_URL="file:./dev.db"  # For SQLite, or your production database URL
```

### Stripe (Payment Processing)
```
STRIPE_SECRET_KEY="sk_live_..."  # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET="whsec_..."  # Your Stripe webhook secret
```

### Resend (Email Service)
```
RESEND_API_KEY="re_..."  # Your Resend API key
```

### Cloudinary (Image Uploads)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Deployment Steps

### 1. Set Environment Variables
Add all the environment variables listed above to your deployment platform's environment variables section.

### 2. Database Setup
If using a production database (not SQLite), make sure to:
- Update `DATABASE_URL` to point to your production database
- Run migrations: `npx prisma migrate deploy`
- Generate Prisma client: `npx prisma generate`

### 3. Build the Application
The build process will now succeed even if some environment variables are missing (they'll be validated at runtime instead).

```bash
npm run build
```

### 4. Deploy
Deploy using your platform's deployment command or push to your connected Git repository.

## Important Notes

### Stripe Configuration
- Make sure to use **live mode** keys for production
- Set up webhooks in your Stripe dashboard pointing to: `https://yourdomain.com/api/stripe/webhook`
- The webhook should listen for `checkout.session.completed` events

### Email Configuration
- Update the `from` email address in `lib/email.ts` to use your verified domain
- Current placeholder: `onboarding@resend.dev`
- Should be: `noreply@manenbrouw.be` (or your verified domain)

### Database
- For production, consider using a proper database service (PostgreSQL, MySQL) instead of SQLite
- Update the Prisma schema provider if switching databases
- Run migrations before deploying

## Troubleshooting

### Build Fails with "STRIPE_SECRET_KEY is not set"
This should now be fixed. The application uses placeholder keys during build and validates at runtime.

### Hydration Errors
The hydration warning about `data-new-gr-c-s-check-loaded` is caused by browser extensions (Grammarly). This is harmless and doesn't affect functionality.

### Cart Not Clearing After Purchase
This has been fixed. The cart now clears automatically when the checkout success page loads.

## Post-Deployment Checklist

- [ ] Test product purchases
- [ ] Test event ticket purchases
- [ ] Verify email confirmations are sent
- [ ] Check Stripe webhook is receiving events
- [ ] Test cart functionality
- [ ] Verify admin panel access
- [ ] Test image uploads

## Support

For issues or questions, contact the development team.
