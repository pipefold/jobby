# Resume Onboarding Feature - Implementation Notes

## Overview

This implementation adds a complete resume onboarding and management flow to
Jobby. Users can either upload an existing resume or create one through a
conversational interview process.

## What Has Been Implemented

### 1. Database Schema

**Location**: `supabase/migrations/001_resume_tables.sql`

Created two main tables:

- `resumes` - Stores resume data in JSON Resume format along with original file
  references
- `onboarding_status` - Tracks whether users have completed the resume
  onboarding

Also includes:

- Row Level Security (RLS) policies for data protection
- Automatic triggers for timestamps and user creation
- Indexes for performance

**To Apply**: Follow instructions in `SUPABASE_MIGRATION.md`

### 2. TypeScript Types

**Location**: `types/resume.ts`

- Complete JSON Resume schema types (v1.0.0)
- Database model types
- Interview and document types
- Supported document formats enum

### 3. Utility Libraries

**Resume Utilities**:

- `lib/jsonResume.ts` - Create, validate, and manage JSON Resume objects
- `lib/resumeParser.ts` - Parse uploaded files (placeholder for future AI
  integration)
- `lib/resumeBuilder.ts` - Convert interview responses to JSON Resume format

**Supabase Integration**:

- `lib/supabase.ts` - Enhanced with resume API helpers:
  - `getOnboardingStatus()` - Check user's onboarding completion
  - `updateOnboardingStatus()` - Mark onboarding as complete/incomplete
  - `getBasisResume()` - Get user's primary resume
  - `upsertResume()` - Create or update resume data
  - `uploadResumeFile()` - Upload files to Supabase Storage
  - `getResumeFileUrl()` - Get signed URLs for private files

### 4. Onboarding Flow

**Location**: `app/(onboarding)/`

Six-screen onboarding flow:

1. **welcome.tsx** - Welcome message explaining the process
2. **resume-choice.tsx** - Choose between uploading or creating
3. **upload.tsx** - File upload screen with document picker
4. **interview-mode.tsx** - Choose text or voice interview (voice coming soon)
5. **interview.tsx** - Conversational interview screen
6. **review.tsx** - Review resume before completing

**Navigation Guard**: `app/_layout.tsx` now checks onboarding status and
automatically routes users:

- New users → Onboarding flow
- Completed users → Main app
- Shows loading state during auth/status check

### 5. Components

**ResumeUploader** (`components/ResumeUploader.tsx`):

- Supports PDF, DOCX, DOC, TXT, JPG, PNG
- 10MB file size limit
- Progress indicator
- Uploads to Supabase Storage
- Stores metadata in database

**InterviewChat** (`components/InterviewChat.tsx`):

- Chat-style UI for resume interview
- Hardcoded questions covering:
  - Basic information (name, email, phone, location, summary)
  - Work experience
  - Education
  - Skills
  - Projects
- Real-time response collection
- Smart navigation between sections
- Placeholder for voice mode

### 6. Resume Management

**Account Component** (`components/Account.tsx`):

- Added resume section showing:
  - Last update date
  - Basic resume info
  - Original filename if uploaded
- "Update Resume" button to restart onboarding

**Resume Tab** (`app/(tabs)/resume.tsx`):

- Dedicated screen for viewing full resume
- Displays all sections in formatted layout
- Update resume functionality
- Empty state for users without resumes

## How It Works

### User Flow

1. **New User Signup/Login**:

   - User creates account through Auth component
   - System creates `onboarding_status` record automatically
   - `app/_layout.tsx` detects incomplete onboarding
   - Redirects to `/(onboarding)/welcome`

2. **Onboarding - Upload Path**:

   - User chooses "I have a resume"
   - Selects file from device
   - File uploads to Supabase Storage under `resumes/{user_id}/`
   - System parses file (currently placeholder)
   - Resume data saved to database
   - Onboarding marked complete
   - Redirects to main app

3. **Onboarding - Interview Path**:

   - User chooses "Create a new resume"
   - Selects text interview mode
   - Chat interface asks questions section by section
   - Responses collected and stored
   - After all sections complete, responses converted to JSON Resume
   - Resume saved to database
   - Onboarding marked complete
   - Redirects to main app

4. **Existing User**:
   - Login automatically checks onboarding status
   - If complete, goes directly to main app
   - Can view/update resume from Account tab or Resume tab

### Data Flow

```
User Input (Upload/Interview)
        ↓
ResumeUploader / InterviewChat
        ↓
Supabase Storage (files) + Database (JSON Resume)
        ↓
resumeApi helpers
        ↓
Resume display in Account/Resume tabs
```

## What's Ready for Production

✅ Complete onboarding flow structure ✅ Database schema with RLS policies ✅
File upload with validation ✅ Interview question flow ✅ Resume storage and
retrieval ✅ Navigation guards ✅ Resume viewing and updating

## What Needs Future Implementation

### 1. Document Parsing (High Priority)

**Current State**: Placeholder functions that return empty resume templates

**Needed**:

- PDF parsing library (e.g., `react-native-pdf-lib`)
- DOCX parsing library (e.g., `mammoth`)
- OCR for images (e.g., Tesseract.js or cloud OCR service)
- AI-powered extraction for better accuracy

**Implementation Path**:

- Add parsing libraries to dependencies
- Implement parsers in `lib/resumeParser.ts`
- Optionally integrate OpenAI/Claude for structured extraction
- Update `ResumeUploader` to use real parsers

### 2. AI Integration for Interview

**Current State**: Hardcoded questions with basic parsing

**Needed**:

- OpenAI or Anthropic API integration
- Dynamic question generation based on user responses
- Better response interpretation
- Follow-up questions for clarity
- Voice transcription (Whisper API)

**Implementation Path**:

- Add API keys to environment variables
- Create AI service wrapper in `lib/ai.ts`
- Update `InterviewChat` to use AI responses
- Implement streaming for better UX
- Add voice recording and transcription

### 3. Resume Generation/Formatting

**Current State**: Basic JSON Resume storage

**Needed**:

- PDF generation from JSON Resume
- Multiple resume templates/themes
- Job-specific resume tailoring (main feature!)
- Export in various formats

**Implementation Path**:

- Integrate PDF generation library (e.g., `react-native-html-to-pdf`)
- Create resume templates
- Build resume customization engine
- Implement job matching and tailoring logic

### 4. Voice Interview Mode

**Current State**: UI placeholder only

**Needed**:

- Audio recording with `expo-av`
- Speech-to-text integration (Whisper API)
- Text-to-speech for questions (optional)
- Real-time transcription display

### 5. Enhanced Resume Features

- Resume versioning (track changes over time)
- Multiple resumes per user
- Resume analytics (what works, what doesn't)
- ATS (Applicant Tracking System) optimization
- Skills gap analysis
- Job matching based on resume

### 6. Storage Optimization

**Current State**: Public URL references, but bucket is private

**Consider**:

- Implement signed URLs properly for security
- Add file expiration/cleanup
- Optimize storage costs
- CDN integration for faster access

## Testing Checklist

Before considering this feature complete, test:

- [ ] New user signup flows to onboarding
- [ ] File upload with various formats
- [ ] File size validation (>10MB rejection)
- [ ] Interview completion flow
- [ ] Resume data saves correctly
- [ ] Onboarding status updates properly
- [ ] Navigation guards work correctly
- [ ] Resume viewing displays all sections
- [ ] Update resume restarts onboarding
- [ ] User can complete onboarding multiple times
- [ ] Storage RLS policies prevent unauthorized access
- [ ] Database RLS policies work correctly

## Known Limitations

1. **File Parsing**: Currently doesn't extract data from uploaded files
2. **Interview AI**: Uses hardcoded questions, not intelligent conversation
3. **Voice Mode**: Not implemented yet
4. **Resume Export**: Can't generate formatted PDF from JSON Resume yet
5. **Multi-Resume**: Each user has only one "basis" resume currently
6. **Validation**: Basic validation, could be more comprehensive
7. **Error Recovery**: Limited error handling in some flows

## Dependencies Added

```json
{
  "expo-document-picker": "^14.0.8"
}
```

**Already Present**:

- `expo-image-picker` (for future avatar/image uploads)
- `@supabase/supabase-js` (database and storage)
- `@react-native-async-storage/async-storage` (session persistence)

## Environment Variables Required

Make sure `.env` includes:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

For future AI features, add:

```
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
# or
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key
```

## Next Meaningful Commit

The feature is now ready for:

1. **Apply database migration** (see `SUPABASE_MIGRATION.md`)
2. **Test the onboarding flow** end-to-end
3. **Commit with message**:

   ```
   feat: Add resume onboarding and management flow

   - Implement database schema for resumes and onboarding status
   - Create 6-screen onboarding flow (upload or interview)
   - Add resume file upload with Supabase Storage
   - Build conversational interview for resume creation
   - Add resume viewing and updating in main app
   - Integrate navigation guards for onboarding enforcement

   Future work: AI integration, document parsing, voice mode
   ```

4. **Create GitHub issues** for future enhancements:
   - Document parsing implementation
   - AI-powered interview
   - Voice interview mode
   - Resume PDF generation
   - Job-specific resume tailoring

## Architecture Decisions

### Why JSON Resume Schema?

- Industry standard format
- Easy to transform into different layouts
- Supports all common resume sections
- Future-proof for integrations

### Why Onboarding Flow?

- Ensures all users have a resume before using the app
- Provides consistent user experience
- Gathers essential data upfront
- Can be skipped/updated later if needed

### Why Supabase Storage?

- Already using Supabase for auth and database
- Built-in RLS for security
- Cost-effective
- Easy signed URL generation

### Why Hardcoded Interview Questions?

- MVP approach - get UX right first
- AI integration can be added without changing UX
- Keeps costs low during development
- Predictable behavior for testing

## Support

For questions or issues:

1. Check `SUPABASE_MIGRATION.md` for setup instructions
2. Review TypeScript types in `types/resume.ts`
3. Examine API helpers in `lib/supabase.ts`
4. Test with example data before real users
