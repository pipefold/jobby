import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { resumeApi, supabase } from '@/lib/supabase';
import { Resume } from '@/types/resume';
import { Button } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

export default function ReviewScreen() {
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await resumeApi.getBasisResume(user.id);
      if (error) throw error;

      setResume(data);
    } catch (error) {
      console.error('Error loading resume:', error);
      Alert.alert('Error', 'Failed to load your resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      await resumeApi.updateOnboardingStatus(user.id, true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    }
  };

  const handleEdit = () => {
    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText>Loading your resume...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!resume) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText>No resume found</ThemedText>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Review Your Resume</ThemedText>
        <ThemedText style={styles.subtitle}>
          Make sure everything looks good before continuing
        </ThemedText>
      </View>

      <ScrollView style={styles.content}>
        {resume.resume_data?.basics && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Basic Information
            </ThemedText>
            <ThemedText>Name: {resume.resume_data.basics.name}</ThemedText>
            <ThemedText>Email: {resume.resume_data.basics.email}</ThemedText>
            {resume.resume_data.basics.phone && (
              <ThemedText>Phone: {resume.resume_data.basics.phone}</ThemedText>
            )}
            {resume.resume_data.basics.summary && (
              <ThemedText>
                Summary: {resume.resume_data.basics.summary}
              </ThemedText>
            )}
          </View>
        )}

        {resume.resume_data?.work && resume.resume_data.work.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Work Experience
            </ThemedText>
            {resume.resume_data.work.map((job, index) => (
              <View key={index} style={styles.item}>
                <ThemedText style={styles.itemTitle}>{job.position}</ThemedText>
                <ThemedText>{job.name}</ThemedText>
                <ThemedText style={styles.dates}>
                  {job.startDate} - {job.endDate || 'Present'}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {resume.resume_data?.education &&
          resume.resume_data.education.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Education
              </ThemedText>
              {resume.resume_data.education.map((edu, index) => (
                <View key={index} style={styles.item}>
                  <ThemedText style={styles.itemTitle}>
                    {edu.studyType}
                  </ThemedText>
                  <ThemedText>{edu.institution}</ThemedText>
                  <ThemedText>{edu.area}</ThemedText>
                </View>
              ))}
            </View>
          )}

        {resume.resume_data?.skills && resume.resume_data.skills.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Skills
            </ThemedText>
            <View style={styles.skillsContainer}>
              {resume.resume_data.skills.map((skill, index) => (
                <ThemedText key={index} style={styles.skill}>
                  • {skill.name}
                </ThemedText>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Edit"
          onPress={handleEdit}
          type="outline"
          buttonStyle={styles.button}
        />
        <Button
          title="Looks Good - Continue"
          onPress={handleComplete}
          buttonStyle={styles.button}
        />
      </View>
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
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  item: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  dates: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 5,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skill: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});
