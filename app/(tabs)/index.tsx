import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Session } from '@supabase/supabase-js';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import Account from '@/components/Account';

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">User Profile</ThemedText>
      </ThemedView>
      {session && session.user ? (
        <Account key={session.user.id} session={session} />
      ) : (
        <ThemedView style={styles.messageContainer}>
          <ThemedText>Please log in to view your profile</ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 20,
    paddingTop: 40,
  },
  messageContainer: {
    padding: 20,
  },
});
