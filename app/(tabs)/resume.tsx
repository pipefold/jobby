import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, ActivityIndicator } from 'react-native';
import { Button } from '@rneui/themed';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase, resumeApi } from '@/lib/supabase';
import { Resume } from '@/types/resume';

export default function ResumeScreen() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await resumeApi.getBasisResume(user.id);
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setResume(data);
    } catch (error) {
      console.error('Error loading resume:', error);
      Alert.alert('Error', 'Failed to load your resume');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResume = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await resumeApi.updateOnboardingStatus(user.id, false);
      router.push('/(onboarding)/resume-choice');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      Alert.alert('Error', 'Failed to start resume update');
    }
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
        <View style={styles.emptyContainer}>
          <ThemedText type="title" style={styles.emptyTitle}>
            No Resume Found
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            You haven&apos;t created a resume yet. Let&apos;s get started!
          </ThemedText>
          <Button
            title="Create Resume"
            onPress={handleUpdateResume}
            buttonStyle={styles.button}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Your Resume</ThemedText>
        <ThemedText style={styles.subtitle}>
          Last updated: {new Date(resume.updated_at).toLocaleDateString()}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {resume.original_file_name && (
          <View style={styles.fileSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Original File
            </ThemedText>
            <ThemedText style={styles.fileName}>
              📄 {resume.original_file_name}
            </ThemedText>
          </View>
        )}

        {resume.resume_data?.basics && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Basic Information
            </ThemedText>
            
            {resume.resume_data.basics.name && (
              <View style={styles.field}>
                <ThemedText style={styles.label}>Name:</ThemedText>
                <ThemedText style={styles.value}>{resume.resume_data.basics.name}</ThemedText>
              </View>
            )}
            
            {resume.resume_data.basics.email && (
              <View style={styles.field}>
                <ThemedText style={styles.label}>Email:</ThemedText>
                <ThemedText style={styles.value}>{resume.resume_data.basics.email}</ThemedText>
              </View>
            )}
            
            {resume.resume_data.basics.phone && (
              <View style={styles.field}>
                <ThemedText style={styles.label}>Phone:</ThemedText>
                <ThemedText style={styles.value}>{resume.resume_data.basics.phone}</ThemedText>
              </View>
            )}
            
            {resume.resume_data.basics.location?.city && (
              <View style={styles.field}>
                <ThemedText style={styles.label}>Location:</ThemedText>
                <ThemedText style={styles.value}>{resume.resume_data.basics.location.city}</ThemedText>
              </View>
            )}
            
            {resume.resume_data.basics.summary && (
              <View style={styles.field}>
                <ThemedText style={styles.label}>Summary:</ThemedText>
                <ThemedText style={styles.value}>{resume.resume_data.basics.summary}</ThemedText>
              </View>
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
                <ThemedText style={styles.itemTitle}>{job.position || 'Position'}</ThemedText>
                <ThemedText style={styles.itemSubtitle}>{job.name || 'Company'}</ThemedText>
                <ThemedText style={styles.dates}>
                  {job.startDate} - {job.endDate || 'Present'}
                </ThemedText>
                {job.summary && (
                  <ThemedText style={styles.itemDescription}>{job.summary}</ThemedText>
                )}
                {job.highlights && job.highlights.length > 0 && (
                  <View style={styles.highlights}>
                    {job.highlights.map((highlight, idx) => (
                      <ThemedText key={idx} style={styles.highlight}>
                        • {highlight}
                      </ThemedText>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {resume.resume_data?.education && resume.resume_data.education.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Education
            </ThemedText>
            {resume.resume_data.education.map((edu, index) => (
              <View key={index} style={styles.item}>
                <ThemedText style={styles.itemTitle}>{edu.studyType || 'Degree'}</ThemedText>
                <ThemedText style={styles.itemSubtitle}>{edu.institution || 'Institution'}</ThemedText>
                {edu.area && <ThemedText style={styles.dates}>{edu.area}</ThemedText>}
                {edu.startDate && (
                  <ThemedText style={styles.dates}>
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </ThemedText>
                )}
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
                <View key={index} style={styles.skillBadge}>
                  <ThemedText style={styles.skillText}>{skill.name}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {resume.resume_data?.projects && resume.resume_data.projects.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Projects
            </ThemedText>
            {resume.resume_data.projects.map((project, index) => (
              <View key={index} style={styles.item}>
                <ThemedText style={styles.itemTitle}>{project.name || 'Project'}</ThemedText>
                {project.description && (
                  <ThemedText style={styles.itemDescription}>{project.description}</ThemedText>
                )}
                {project.url && (
                  <ThemedText style={styles.link}>{project.url}</ThemedText>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Update Resume"
            onPress={handleUpdateResume}
            buttonStyle={styles.button}
          />
        </View>
      </ThemedView>
    </ScrollView>
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
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  fileSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.6,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  item: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 15,
    marginBottom: 5,
  },
  dates: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 5,
  },
  itemDescription: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  highlights: {
    marginTop: 10,
  },
  highlight: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillBadge: {
    backgroundColor: '#2089dc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    color: '#fff',
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    color: '#2089dc',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
});

