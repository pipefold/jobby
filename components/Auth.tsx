import { Button, Input } from '@rneui/themed';
import React, { useState } from 'react';
import { Alert, AppState, StyleSheet, View, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemedText } from './themed-text';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function signInWithEmail() {
    setLoading(true);
    setErrorMessage('');

    console.log('🔐 Attempting sign in with:', email);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('❌ Auth error:', error);
      const message = error.message;
      setErrorMessage(message);
      // Alert.alert still works on native
      if (Platform.OS !== 'web') {
        Alert.alert(message);
      }
    } else {
      console.log('✅ Sign in successful!');
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    setErrorMessage('');

    console.log('📝 Attempting sign up with:', email);

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error('❌ Sign up error:', error);
      const message = error.message;
      setErrorMessage(message);
      if (Platform.OS !== 'web') {
        Alert.alert(message);
      }
    } else if (!session) {
      const message = 'Please check your inbox for email verification!';
      setErrorMessage(message);
      if (Platform.OS !== 'web') {
        Alert.alert(message);
      }
    } else {
      console.log('✅ Sign up successful!');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>❌ {errorMessage}</ThemedText>
        </View>
      ) : null}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => signInWithEmail()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => signUpWithEmail()}
        />
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
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
});
