-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resume_data JSONB,
    original_file_url TEXT,
    original_file_name TEXT,
    is_basis_resume BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create onboarding_status table
CREATE TABLE IF NOT EXISTS public.onboarding_status (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    resume_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for resumes table
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own resumes
CREATE POLICY "Users can view own resumes"
    ON public.resumes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own resumes
CREATE POLICY "Users can insert own resumes"
    ON public.resumes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own resumes
CREATE POLICY "Users can update own resumes"
    ON public.resumes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
    ON public.resumes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add RLS policies for onboarding_status table
ALTER TABLE public.onboarding_status ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own onboarding status
CREATE POLICY "Users can view own onboarding status"
    ON public.onboarding_status
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own onboarding status
CREATE POLICY "Users can insert own onboarding status"
    ON public.onboarding_status
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own onboarding status
CREATE POLICY "Users can update own onboarding status"
    ON public.onboarding_status
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_is_basis_resume_idx ON public.resumes(is_basis_resume);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on resumes table
CREATE TRIGGER handle_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to create onboarding_status entry on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.onboarding_status (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create onboarding_status on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


