import { View, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome to Jobby! 🎉
        </ThemedText>

        <ThemedText style={styles.description}>
          Let&apos;s get you set up with a resume so you can start applying to
          jobs.
        </ThemedText>

        <ThemedText style={styles.description}>
          This will only take a few minutes, and you can update it anytime.
        </ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(onboarding)/resume-choice')}
          size="lg"
          buttonStyle={styles.button}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 15,
  },
});
