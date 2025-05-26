# Supabase Authentication Configuration

## Email Verification Redirect URLs

To fix the email verification redirect to localhost, you need to update your Supabase project settings:

### 1. Update Redirect URLs in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Update the following settings:

#### Site URL
Set this to your production URL:
```
https://vibe-dieting.vercel.app
```

#### Redirect URLs
Add all the URLs where users might need to be redirected after authentication:
```
https://vibe-dieting.vercel.app
https://vibe-dieting.vercel.app/auth/callback
http://localhost:3000
http://localhost:3000/auth/callback
```

### 2. Update Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. For the "Confirm signup" template, ensure the confirmation URL uses:
   ```
   {{ .SiteURL }}/auth/callback?token={{ .Token }}&type=signup
   ```

### 3. Environment Variables

Make sure your production environment has the correct `NEXT_PUBLIC_BASE_URL`:
```
NEXT_PUBLIC_BASE_URL=https://vibe-dieting.vercel.app
```

### How the Auth Flow Works

1. User signs up → Email is sent with verification link
2. User clicks link → Redirected to your site with auth tokens in URL
3. `/auth/callback` or home page handles the tokens
4. User is logged in and redirected to dashboard

### Testing Locally

When testing locally, the email will still redirect to localhost:3000, which is fine for development. The production emails will use the production URL once configured.

### Troubleshooting

If emails are still redirecting to localhost:
1. Clear your browser cache
2. Check that the Site URL is saved correctly in Supabase
3. Wait a few minutes for changes to propagate
4. Try signing up with a new email address