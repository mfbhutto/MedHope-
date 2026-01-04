# Email Setup for Contact Form

The contact form is now configured to send emails to `medhope74@gmail.com` when users submit the form.

## Environment Variables Required

Make sure you have the following environment variables set in your `.env.local` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=medhope74@gmail.com
SMTP_APP_PASSWORD=your_gmail_app_password_here
```

## Gmail App Password Setup

If you haven't created a Gmail App Password yet:

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification (must be enabled)
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password and use it as `SMTP_APP_PASSWORD`

## Files Created

1. **`lib/email.ts`** - Email utility functions using nodemailer
2. **`app/api/contact/route.ts`** - API endpoint that handles contact form submissions
3. **`app/medhope/pages/contact/page.tsx`** - Updated to send data to the API

## How It Works

1. User fills out the contact form on `/contact` page
2. Form data is sent to `/api/contact` endpoint
3. API validates the data and sends an email to `medhope74@gmail.com`
4. The email includes:
   - Sender's name and email
   - The message content
   - Reply-to is set to the sender's email (so you can reply directly)

## Testing

After setting up your environment variables, restart your Next.js dev server and test the contact form. You should receive emails at `medhope74@gmail.com` when the form is submitted.

