import ResumeUploader from "@/components/ResumeUploader";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { resumeApi, supabase } from "@/lib/supabase";
import { Button } from "@rneui/themed";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

export default function UploadScreen() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleUploadSuccess = async (fileUrl: string, fileName: string) => {
    setFileUploaded(true);
  };

  const handleContinue = async () => {
    try {
      setUploading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Mark onboarding as complete
      await resumeApi.updateOnboardingStatus(user.id, true);

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert("Error", "Failed to complete setup. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    router.push("/(onboarding)/interview-mode");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Upload Your Resume
        </ThemedText>

        <ThemedText style={styles.description}>
          Upload your resume in PDF, DOCX, or image format. We&apos;ll extract
          the information and format it for you.
        </ThemedText>

        <ResumeUploader onUploadSuccess={handleUploadSuccess} />
      </View>

      <View style={styles.buttonContainer}>
        {fileUploaded ? (
          <Button
            title={uploading ? "Completing..." : "Continue"}
            onPress={handleContinue}
            disabled={uploading}
            size="lg"
            buttonStyle={styles.button}
            icon={uploading ? <ActivityIndicator color="white" /> : undefined}
          />
        ) : (
          <Button
            title="Skip - Create from scratch"
            onPress={handleSkip}
            size="lg"
            buttonStyle={styles.button}
            type="outline"
          />
        )}
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
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 15,
  },
});
