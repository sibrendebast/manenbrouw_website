# Local Environment Setup for Cloudinary

## Your Cloudinary Credentials

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=de4xdsv7p
CLOUDINARY_API_KEY=553996473685574
CLOUDINARY_API_SECRET=otZd2c59JGvHGZ4yDgrMgn_1-qw
```

## How to Set Up Locally

### Option 1: Create .env.local file (Recommended)

1. Create a file named `.env.local` in the root directory
2. Copy and paste the three variables above exactly as shown
3. Save the file
4. Restart your dev server: `npm run dev`

### Option 2: Add to existing .env file

If you already have a `.env` file, add these three lines to it.

## Testing Locally

After setting up the environment variables:

1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000/admin/login
3. Log in to the admin panel
4. Try uploading a product image or event image
5. The image should upload to Cloudinary
6. Check your Cloudinary dashboard to see the uploaded image

## For AWS Amplify Deployment

When deploying to AWS Amplify, add these same three variables to:
**AWS Amplify Console → App settings → Environment variables**

Copy the exact values from above.

---

**Note**: The `.env.local` file is gitignored for security - it won't be committed to GitHub.
