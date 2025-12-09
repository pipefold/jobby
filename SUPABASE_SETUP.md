# Supabase Setup Guide

This app has been integrated with Supabase for authentication, user profiles,
and file storage. Follow these steps to complete the setup.

## 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in your project details:
   - **Name**: Choose a name for your project
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click **"Create new project"** and wait for it to initialize

## 2. Set Up the Database Schema

1. In your Supabase Dashboard, go to the **SQL Editor** page
2. Click **"User Management Starter"** under **Community > Quickstarts**
3. Click **"Run"** to create the necessary tables and functions

This will create:

- A `profiles` table for user data
- An `avatars` storage bucket for profile photos
- Row Level Security policies to protect user data

## 3. Get Your API Credentials

1. In your Supabase Dashboard, go to **Settings** (gear icon in the sidebar)
2. Click on **API** in the settings menu
3. You'll need two values:

### Project URL

Copy the value under **"Project URL"** section

### API Key

- For **new projects**: Copy the **Publishable key** from the **API Keys** tab
- For **legacy projects**: Copy the **anon/public** key from the **Legacy API
  Keys** tab

## 4. Configure Your App

Create a `.env` file in the root of your project:

```bash
cp .env.example .env
```

Then edit `.env` and add your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

**⚠️ Important**: The `.env` file is already in `.gitignore` and should NEVER be
committed to version control.

## 5. Set Up Storage Bucket

To enable profile photo uploads:

1. In your Supabase Dashboard, go to **Storage**
2. You should see an `avatars` bucket already created by the quickstart
3. If not, create a new bucket named `avatars` and make it **public**

## 6. Test Your Setup

1. Start the development server:

   ```bash
   pnpm start
   ```

2. Open your app in Expo Go, iOS Simulator, or Android Emulator

3. Try the following:
   - Sign up with a new email and password
   - Check your email for verification (if enabled)
   - Sign in with your credentials
   - Update your profile (username, website)
   - Upload a profile photo

## Features Implemented

✅ **Authentication**

- Email/password sign up
- Email/password sign in
- Sign out
- Auto-refresh tokens
- Persistent sessions

✅ **User Profiles**

- View profile information
- Update username and website
- Email display (non-editable)

✅ **Avatar Upload**

- Upload profile photos from device
- Image cropping/editing before upload
- Automatic download and display
- Storage in Supabase Storage

## Project Structure

```
jobby/
├── app/
│   ├── _layout.tsx          # Root layout with auth state management
│   └── (tabs)/
│       └── index.tsx        # Home screen with user profile
├── components/
│   ├── Auth.tsx             # Login/signup form
│   ├── Account.tsx          # User profile management
│   └── Avatar.tsx           # Profile photo upload widget
├── lib/
│   └── supabase.ts          # Supabase client configuration
└── .env                     # Environment variables (not in git)
```

## Troubleshooting

### "Invalid API key" or "Project URL not found"

- Double-check your `.env` file has the correct credentials
- Make sure you're using the **Publishable key** (starts with `eyJ...`)
- Verify the URL format: `https://xxxxx.supabase.co`

### "Please check your inbox for email verification"

- By default, Supabase requires email verification
- Check your spam folder
- Or disable email confirmation in Supabase Dashboard: **Authentication >
  Settings > Enable email confirmations** (OFF)

### Profile not loading

- Make sure you ran the User Management Starter SQL script
- Check that Row Level Security is enabled on the `profiles` table
- Look for errors in the console/terminal

### Image upload not working

- Verify the `avatars` bucket exists in Storage
- Make sure the bucket is set to **public**
- Check that you have proper RLS policies on the storage bucket

## Next Steps

Now that authentication is set up, you can:

- Add more fields to the user profile
- Implement additional authentication methods (OAuth, magic links)
- Create protected routes that require authentication
- Build features specific to your app

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Expo Documentation](https://docs.expo.dev/)
