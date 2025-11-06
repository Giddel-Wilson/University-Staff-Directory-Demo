# Cloudinary Setup Guide

## Why Cloudinary?

Profile pictures need cloud storage because Vercel is serverless - uploaded files don't persist between deployments. Cloudinary provides:
- **Free tier**: 25GB storage, 25GB bandwidth/month
- **Automatic optimization**: Images are automatically compressed and formatted
- **CDN delivery**: Fast loading worldwide
- **Image transformations**: Auto-resize, crop, and optimize

## Setup Steps

### 1. Create Free Cloudinary Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up with your email (no credit card required)
3. Verify your email

### 2. Get Your Credentials
1. After login, you'll see your Dashboard
2. Copy these three values:
   - **Cloud Name** (e.g., `dxxxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123`)

### 3. Add to Local Environment
Update your `.env` file with your actual credentials:

```bash
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### 4. Add to Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these three variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Make sure to select **Production**, **Preview**, and **Development** for each

### 5. Redeploy
After adding environment variables to Vercel:
1. Go to **Deployments** tab
2. Click the three dots (...) on your latest deployment
3. Click **Redeploy**

## How It Works

When a user uploads a profile picture:
1. Image is validated (type, size)
2. Uploaded to Cloudinary (stored in cloud)
3. Cloudinary returns a secure HTTPS URL
4. URL is saved to user's database record
5. Image loads from Cloudinary CDN (not your server)

## Benefits

✅ **Works on Vercel** - Images persist across deployments  
✅ **Fast loading** - Served from CDN closest to user  
✅ **Auto-optimization** - Images compressed automatically  
✅ **No storage limits** - Files don't count against Vercel limits  
✅ **Free tier** - 25GB storage is enough for thousands of profile pictures

## Testing

After setup, test by:
1. Login to your staff dashboard
2. Upload a profile picture
3. Check that it displays correctly
4. Verify the URL starts with `https://res.cloudinary.com/`

## Troubleshooting

**Error: "Upload failed"**
- Check that all three environment variables are set correctly
- Verify credentials are from your Cloudinary dashboard
- Make sure you've redeployed after adding env variables

**Images not showing**
- Check browser console for errors
- Verify the photoUrl in database starts with `https://res.cloudinary.com`
- Ensure Cloudinary account is active

## Alternative Solutions

If you prefer not to use Cloudinary, other options include:
- **Uploadcare** - Similar service, free tier
- **ImageKit** - Another CDN with free tier
- **AWS S3** - More complex setup, pay-as-you-go
- **Vercel Blob** - Built-in solution, limited free tier
