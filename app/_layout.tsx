import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase, resumeApi } from '@/lib/supabase';
import Auth from '@/components/Auth';
import { OnboardingStatus } from '@/types/resume';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      } else {
        setOnboardingStatus(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await resumeApi.getOnboardingStatus(userId);
      if (error) {
        console.error('Error checking onboarding status:', error);
        // If error, assume onboarding not complete
        setOnboardingStatus({ user_id: userId, resume_completed: false, completed_at: null });
      } else if (data) {
        setOnboardingStatus(data);
      } else {
        // No status record yet, create one
        setOnboardingStatus({ user_id: userId, resume_completed: false, completed_at: null });
      }
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
      setOnboardingStatus({ user_id: userId, resume_completed: false, completed_at: null });
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation based on auth and onboarding status
  useEffect(() => {
    if (loading) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';

    if (!session) {
      // Not logged in - show auth screen
      return;
    }

    if (onboardingStatus && !onboardingStatus.resume_completed && !inOnboarding) {
      // Logged in but onboarding not complete - redirect to onboarding
      router.replace('/(onboarding)/welcome');
    } else if (onboardingStatus?.resume_completed && inOnboarding) {
      // Onboarding complete but still in onboarding flow - redirect to main app
      router.replace('/(tabs)');
    }
  }, [session, onboardingStatus, loading, segments]);

  // If not authenticated, show Auth screen
  if (!session) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Auth />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  // Show loading while checking onboarding status
  if (loading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  // If authenticated and status checked, show the appropriate screen
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
