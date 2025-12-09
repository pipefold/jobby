# Supabase Database Migration for Resume Feature

## Running the Migrations

You need to run the SQL migration files in your Supabase project to set up the
database schema and storage for the resume feature.

### Using Supabase CLI (Recommended)

```bash
# Link your project (first time only)
npx supabase link --project-ref your-project-ref

# Run all migrations (this will create tables, storage bucket, and policies)
npx supabase db push
```

This will automatically apply:

- Migration 001: Database tables (`resumes`, `onboarding_status`) with RLS
  policies
- Migration 002: Storage bucket (`resumes`) with access policies

### Alternative: Using Supabase Dashboard

If you prefer to run migrations manually:

1. Go to your Supabase Dashboard:
   [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Copy and run `supabase/migrations/001_resume_tables.sql`
6. Copy and run `supabase/migrations/002_resume_storage.sql`

## What These Migrations Do

### Migration 001: Database Tables

- Creates `resumes` table to store resume data in JSON Resume format
- Creates `onboarding_status` table to track user onboarding progress
- Sets up Row Level Security (RLS) policies to protect user data
- Creates indexes for better query performance
- Sets up automatic `updated_at` timestamp updates
- Automatically creates an onboarding_status entry when a new user signs up

### Migration 002: Storage Setup

- Creates `resumes` storage bucket (private)
- Sets up RLS policies for storage.objects to allow users to:
  - Upload their own resume files
  - View their own resume files
  - Update their own resume files
  - Delete their own resume files

## Verification

After running the migration, verify it worked:

1. Go to **Table Editor** in your Supabase Dashboard
2. You should see two new tables: `resumes` and `onboarding_status`
3. Go to **Storage** and verify the `resumes` bucket exists
4. Check that RLS is enabled on both tables (green shield icon)

## File Storage Structure

Resume files will be stored in the following structure:

```
resumes/
  ├── {user_id}/
  │   ├── resume_original_{timestamp}.pdf
  │   ├── resume_original_{timestamp}.docx
  │   └── ...
```

This ensures each user's files are isolated and can only be accessed by them.
