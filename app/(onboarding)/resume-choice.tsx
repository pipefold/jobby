import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function ResumeChoiceScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Do you have a resume?
        </ThemedText>

        <ThemedText style={styles.description}>
          If you already have a resume, you can upload it and we&apos;ll help
          you format it.
        </ThemedText>

        <ThemedText style={styles.description}>
          Otherwise, we&apos;ll help you create one through a quick
          conversation.
        </ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="I have a resume - Upload it"
          onPress={() => router.push('/(onboarding)/upload')}
          size="lg"
          buttonStyle={styles.button}
        />

        <Button
          title="Create a new resume"
          onPress={() => router.push('/(onboarding)/interview-mode')}
          size="lg"
          buttonStyle={styles.button}
          type="outline"
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
