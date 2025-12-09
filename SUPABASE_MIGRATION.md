# Supabase Database Migration for Resume Feature

## Running the Migration

You need to run the SQL migration file in your Supabase project to set up the
database schema for the resume feature.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard:
   [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Copy the contents of `supabase/migrations/001_resume_tables.sql`
6. Paste into the SQL Editor
7. Click **"Run"** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (first time only)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Setting Up Storage Bucket

After running the SQL migration, create the storage bucket for resume files:

1. In your Supabase Dashboard, go to **Storage**
2. Click **"Create a new bucket"**
3. Name it `resumes`
4. Set it to **Private** (not public - we'll use signed URLs for access)
5. Click **"Create bucket"**

### Set Storage Policies

After creating the bucket, set up Row Level Security policies:

1. Click on the `resumes` bucket
2. Go to **Policies** tab
3. Click **"New Policy"**
4. Create the following policies:

**Policy 1: Users can upload their own resumes**

```sql
-- Policy name: Users can upload own resume files
-- Allowed operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Users can upload own resume files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Users can view their own resumes**

```sql
-- Policy name: Users can view own resume files
-- Allowed operation: SELECT
-- Target roles: authenticated

CREATE POLICY "Users can view own resume files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Users can update their own resumes**

```sql
-- Policy name: Users can update own resume files
-- Allowed operation: UPDATE
-- Target roles: authenticated

CREATE POLICY "Users can update own resume files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: Users can delete their own resumes**

```sql
-- Policy name: Users can delete own resume files
-- Allowed operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Users can delete own resume files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

## What This Migration Does

- Creates `resumes` table to store resume data in JSON Resume format
- Creates `onboarding_status` table to track user onboarding progress
- Sets up Row Level Security (RLS) policies to protect user data
- Creates indexes for better query performance
- Sets up automatic `updated_at` timestamp updates
- Automatically creates an onboarding_status entry when a new user signs up
- Creates storage bucket for uploaded resume files (PDF, DOCX, etc.)

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
