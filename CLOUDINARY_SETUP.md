# Cloudinary Setup Guide

This project uses Cloudinary for image and file storage. Follow these steps to set up Cloudinary integration.

## 1. Get Cloudinary Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Sign in to your account
3. Copy your credentials from the dashboard:
   - **Cloud Name**: Found at the top of the dashboard
   - **API Key**: Found in the "Account Details" section
   - **API Secret**: Found in the "Account Details" section (click "Reveal" to see it)

## 2. Add Environment Variables

Add the following environment variables to your `.env.local` file in the root of the project:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important**: 
- Never commit your `.env.local` file to version control
- Keep your API Secret secure and never share it publicly
- The API Secret is used server-side only for uploads

## 3. File Storage Structure

Files are organized in Cloudinary with the following folder structure:
- `medhope/utility-bills/` - Utility bill uploads
- `medhope/documents/` - Medical documents and other files

## 4. Testing the Integration

After adding the environment variables:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try uploading a file through the registration form or case submission form

3. Check the server logs for Cloudinary upload confirmations

4. Verify files appear in your Cloudinary Media Library under the `medhope` folder

## 5. Troubleshooting

### Error: "Must supply cloud_name"
- Make sure `CLOUDINARY_CLOUD_NAME` is set in your `.env.local` file
- Restart your development server after adding environment variables

### Error: "Invalid API Key"
- Verify your API Key is correct in `.env.local`
- Make sure there are no extra spaces or quotes around the values

### Error: "Invalid signature"
- Verify your API Secret is correct
- Make sure you're using the API Secret (not the API Key)

### Files not uploading
- Check your Cloudinary account limits (free tier has limits)
- Verify your internet connection
- Check server logs for detailed error messages

## 6. Next.js Image Optimization

The project is configured to use Cloudinary images with Next.js Image component. Images from Cloudinary will be automatically optimized.

Make sure `next.config.js` includes `res.cloudinary.com` in the images domains (already configured).

