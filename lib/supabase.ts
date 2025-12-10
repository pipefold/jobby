import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { Resume, OnboardingStatus, JSONResume } from '@/types/resume';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Web-compatible storage adapter
const webStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return Promise.resolve(null);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

// Use localStorage for web, AsyncStorage for native
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Resume helper functions
export const resumeApi = {
  /**
   * Get user's onboarding status
   */
  async getOnboardingStatus(userId: string) {
    const { data, error } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // If no record exists, create one
    if (!data && !error) {
      const { data: newData, error: insertError } = await supabase
        .from('onboarding_status')
        .insert({ user_id: userId, resume_completed: false })
        .select()
        .single();

      return { data: newData as OnboardingStatus | null, error: insertError };
    }

    return { data: data as OnboardingStatus | null, error };
  },

  /**
   * Update onboarding status
   */
  async updateOnboardingStatus(userId: string, completed: boolean) {
    const updates: Partial<OnboardingStatus> = {
      resume_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('onboarding_status')
      .upsert({ user_id: userId, ...updates })
      .select()
      .single();

    return { data: data as OnboardingStatus | null, error };
  },

  /**
   * Get user's basis resume
   */
  async getBasisResume(userId: string) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_basis_resume', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return { data: data as Resume | null, error };
  },

  /**
   * Create or update resume
   */
  async upsertResume(
    userId: string,
    resumeData: JSONResume,
    fileUrl?: string,
    fileName?: string,
    isBasis: boolean = true
  ) {
    const resume: Partial<Resume> = {
      user_id: userId,
      resume_data: resumeData,
      original_file_url: fileUrl || null,
      original_file_name: fileName || null,
      is_basis_resume: isBasis,
      updated_at: new Date().toISOString(),
    };

    // Check if user already has a basis resume
    const { data: existing } = await this.getBasisResume(userId);

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('resumes')
        .update(resume)
        .eq('id', existing.id)
        .select()
        .single();

      return { data: data as Resume | null, error };
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('resumes')
        .insert(resume)
        .select()
        .single();

      return { data: data as Resume | null, error };
    }
  },

  /**
   * Upload resume file to storage
   */
  async uploadResumeFile(
    userId: string,
    fileUri: string,
    fileName: string,
    mimeType: string
  ) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = fileName.split('.').pop();
      const filePath = `${userId}/resume_${timestamp}.${fileExt}`;

      // Read file as blob (different for web vs native)
      let fileBlob: Blob;

      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        fileBlob = await response.blob();
      } else {
        // For React Native, we need to read the file
        const response = await fetch(fileUri);
        fileBlob = await response.blob();
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, fileBlob, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      return {
        data: {
          path: data.path,
          url: urlData.publicUrl,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get signed URL for private resume file
   */
  async getResumeFileUrl(filePath: string, expiresIn: number = 3600) {
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(filePath, expiresIn);

    return { data, error };
  },
};
