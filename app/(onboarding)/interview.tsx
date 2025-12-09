import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button } from '@rneui/themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import InterviewChat from '@/components/InterviewChat';
import { InterviewResponse, JSONResume } from '@/types/resume';
import { buildResumeFromInterview } from '@/lib/resumeBuilder';
import { supabase, resumeApi } from '@/lib/supabase';

export default function InterviewScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInterviewComplete = (finalResponses: InterviewResponse[]) => {
    setResponses(finalResponses);
    setIsComplete(true);
  };

  const handleSaveResume = async () => {
    try {
      setSaving(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Build resume from interview responses
      const resumeData = buildResumeFromInterview(responses);
      
      // Save resume to database
      await resumeApi.upsertResume(user.id, resumeData);
      
      // Mark onboarding as complete
      await resumeApi.updateOnboardingStatus(user.id, true);
      
      // Navigate to review or main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving resume:', error);
      Alert.alert('Error', 'Failed to save your resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.headerText}>
          {mode === 'voice' ? 'Voice Interview' : 'Resume Interview'}
        </ThemedText>
        <ThemedText style={styles.headerSubtext}>
          Answer the questions to build your resume
        </ThemedText>
      </View>

      <View style={styles.chatContainer}>
        <InterviewChat
          mode={mode === 'voice' ? 'voice' : 'text'}
          onComplete={handleInterviewComplete}
        />
      </View>

      {isComplete && (
        <View style={styles.buttonContainer}>
          <Button
            title={saving ? 'Saving...' : 'Save & Continue'}
            onPress={handleSaveResume}
            disabled={saving}
            size="lg"
            buttonStyle={styles.button}
            icon={saving ? <ActivityIndicator color="white" /> : undefined}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtext: {
    fontSize: 14,
    marginTop: 5,
    opacity: 0.7,
  },
  chatContainer: {
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 15,
  },
});

