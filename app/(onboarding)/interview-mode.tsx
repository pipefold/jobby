import { View, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function InterviewModeScreen() {
  const router = useRouter();

  const handleTextInterview = () => {
    router.push('/(onboarding)/interview?mode=text');
  };

  const handleVoiceInterview = () => {
    // Voice interview coming soon
    router.push('/(onboarding)/interview?mode=voice');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          How would you like to create your resume?
        </ThemedText>
        
        <ThemedText style={styles.description}>
          We&apos;ll ask you some questions to build your resume. You can type your answers or speak them.
        </ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Type my answers"
          onPress={handleTextInterview}
          size="lg"
          buttonStyle={styles.button}
        />
        
        <Button
          title="Speak my answers (Coming Soon)"
          onPress={handleVoiceInterview}
          size="lg"
          buttonStyle={styles.button}
          type="outline"
          disabled
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
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingBottom: 40,
    gap: 15,
  },
  button: {
    paddingVertical: 15,
  },
});

