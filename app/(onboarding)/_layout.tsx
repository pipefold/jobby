import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Prevent swiping back during onboarding
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="resume-choice" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="interview-mode" />
      <Stack.Screen name="interview" />
      <Stack.Screen name="review" />
    </Stack>
  );
}

