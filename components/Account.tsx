import { useState, useEffect, useCallback } from 'react';
import { supabase, resumeApi } from '../lib/supabase';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import Avatar from './Avatar';
import { Resume } from '@/types/resume';
import { ThemedText } from './themed-text';

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [resume, setResume] = useState<Resume | null>(null);
  const router = useRouter();

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  const loadResume = useCallback(async () => {
    try {
      if (!session?.user) return;

      const { data, error } = await resumeApi.getBasisResume(session.user.id);
      if (error && error.code !== 'PGRST116') {
        // Ignore "not found" error
        console.error('Error loading resume:', error);
      }

      setResume(data);
    } catch (error) {
      console.error('Error in loadResume:', error);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session) {
      getProfile();
      loadResume();
    }
  }, [session, getProfile, loadResume]);

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateResume = async () => {
    try {
      // Reset onboarding status to restart the flow
      if (!session?.user) return;

      await resumeApi.updateOnboardingStatus(session.user.id, false);

      // Navigate to onboarding
      router.push('/(onboarding)/resume-choice');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      Alert.alert('Error', 'Failed to start resume update');
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ username, website, avatar_url: url });
          }}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          value={username || ''}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Website"
          value={website || ''}
          onChangeText={(text) => setWebsite(text)}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update Profile'}
          onPress={() =>
            updateProfile({ username, website, avatar_url: avatarUrl })
          }
          disabled={loading}
        />
      </View>

      {/* Resume Section */}
      <View style={[styles.resumeSection, styles.mt20]}>
        <ThemedText type="subtitle" style={styles.resumeTitle}>
          Your Resume
        </ThemedText>

        {resume ? (
          <View>
            <ThemedText style={styles.resumeInfo}>
              Last updated: {new Date(resume.updated_at).toLocaleDateString()}
            </ThemedText>
            {resume.resume_data?.basics?.name && (
              <ThemedText style={styles.resumeInfo}>
                Name: {resume.resume_data.basics.name}
              </ThemedText>
            )}
            {resume.original_file_name && (
              <ThemedText style={styles.resumeInfo}>
                Uploaded: {resume.original_file_name}
              </ThemedText>
            )}
          </View>
        ) : (
          <ThemedText style={styles.noResume}>No resume found</ThemedText>
        )}

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={resume ? 'Update Resume' : 'Create Resume'}
            onPress={handleUpdateResume}
            type="outline"
          />
        </View>
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  resumeSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  resumeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resumeInfo: {
    fontSize: 14,
    marginBottom: 5,
    opacity: 0.8,
  },
  noResume: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
