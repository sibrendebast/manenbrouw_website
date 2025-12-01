# Cloudinary Setup Guide

Cloudinary is used to store product and event images in the cloud, making them persistent across deployments on AWS Amplify.

## Why Cloudinary?

- **Persistent Storage**: Images survive deployments (unlike local storage)
- **CDN**: Fast image delivery worldwide
- **Free Tier**: Generous free plan for testing
- **Easy Integration**: Simple API

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up for a free account
3. Verify your email

### 2. Get Your Credentials

After logging in, you'll see your dashboard with:

1. **Cloud Name** - Your unique identifier (e.g., `dxyz123abc`)
2. **API Key** - Public key for API access
3. **API Secret** - Click "Reveal" to see it (keep this secret!)

### 3. Copy Your Credentials

You'll need these three values:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### 4. Add to AWS Amplify

1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Click **Manage variables**
5. Add all three Cloudinary variables
6. Click **Save**
7. **Redeploy** your app

### 5. Test the Upload

1. Go to your deployed site's admin panel
2. Try uploading a product image or event image
3. The image should upload to Cloudinary
4. You can verify in Cloudinary Dashboard → Media Library

## Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Images**: Unlimited

This is more than enough for a test/small production site!

## Viewing Your Uploaded Images

1. Log in to Cloudinary Dashboard
2. Go to **Media Library**
3. You'll see a folder called `manenbrouw` with all your uploads
4. Click any image to see details, URL, and transformations

## Image URLs

Uploaded images will have URLs like:
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/manenbrouw/image-name.jpg
```

These URLs are:
- **Permanent**: Won't change or disappear
- **Fast**: Delivered via CDN
- **Optimized**: Automatically optimized for web

## Troubleshooting

### "Cloudinary is not configured" Error

**Cause**: Environment variables not set correctly

**Solution**:
1. Check all three variables are added in Amplify
2. Make sure there are no quotes around the values
3. Redeploy the app after adding variables

### Upload Fails with 401 Error

**Cause**: Invalid API credentials

**Solution**:
1. Double-check your API Key and Secret in Cloudinary Dashboard
2. Make sure you copied them correctly (no extra spaces)
3. Try revealing the API Secret again and re-copying

### Images Not Showing After Upload

**Cause**: CORS or URL issue

**Solution**:
1. Check the Cloudinary Media Library to confirm upload succeeded
2. Check browser console for errors
3. Verify the image URL is accessible in a new browser tab

## Security Notes

- ✅ **API Secret is safe**: It's only used server-side, never exposed to the browser
- ✅ **Cloud Name is public**: It's okay to expose this (it's in image URLs anyway)
- ✅ **API Key is public**: This is fine, it's used with the secret for authentication
- ⚠️ **Never commit secrets**: The `.gitignore` already excludes `.env*` files

## Advanced Features (Optional)

Once you're comfortable with basic uploads, you can explore:

- **Image Transformations**: Resize, crop, optimize on-the-fly
- **Automatic Format**: Serve WebP to supported browsers
- **Lazy Loading**: Built-in lazy loading support
- **Video Support**: Upload and stream videos

See [Cloudinary Documentation](https://cloudinary.com/documentation) for more.

## Cost Monitoring

To monitor your usage:
1. Go to Cloudinary Dashboard
2. Click on **Reports** → **Usage**
3. View your current storage and bandwidth usage
4. Set up alerts if you're approaching limits

## Support

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Support](https://support.cloudinary.com/)
- [Community Forum](https://community.cloudinary.com/)
