import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from '@/components/themed-text';
import { supabase, resumeApi } from '@/lib/supabase';
import { parseResumeFile } from '@/lib/resumeParser';

interface ResumeUploaderProps {
  onUploadSuccess?: (fileUrl: string, fileName: string) => void;
  onUploadError?: (error: Error) => void;
}

export default function ResumeUploader({
  onUploadSuccess,
  onUploadError,
}: ResumeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
          'image/jpeg',
          'image/png',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      if (!file) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      // Check file size (limit to 10MB)
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 10MB');
        return;
      }

      setSelectedFile(file.name);
      await uploadFile(file);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select file');
      onUploadError?.(error as Error);
    }
  };

  const uploadFile = async (file: DocumentPicker.DocumentPickerAsset) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Upload file to Supabase Storage
      setUploadProgress(30);
      const { data: uploadData, error: uploadError } = await resumeApi.uploadResumeFile(
        user.id,
        file.uri,
        file.name,
        file.mimeType || 'application/octet-stream'
      );

      if (uploadError) throw uploadError;
      if (!uploadData) throw new Error('Upload failed - no data returned');

      setUploadProgress(60);

      // Parse the resume file
      const resumeData = await parseResumeFile(
        file.uri,
        file.name,
        file.mimeType || 'application/octet-stream'
      );

      setUploadProgress(80);

      // Save to database
      const { error: saveError } = await resumeApi.upsertResume(
        user.id,
        resumeData,
        uploadData.path,
        file.name
      );

      if (saveError) throw saveError;

      setUploadProgress(100);
      
      Alert.alert(
        'Success!',
        'Your resume has been uploaded successfully.',
        [{ text: 'OK' }]
      );

      onUploadSuccess?.(uploadData.url, file.name);
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Failed', 'Failed to upload your resume. Please try again.');
      onUploadError?.(error as Error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      {selectedFile && (
        <View style={styles.fileInfo}>
          <ThemedText style={styles.fileName}>
            Selected: {selectedFile}
          </ThemedText>
        </View>
      )}

      {uploading && (
        <View style={styles.progressContainer}>
          <ThemedText>Uploading... {uploadProgress}%</ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${uploadProgress}%` },
              ]}
            />
          </View>
        </View>
      )}

      <Button
        title={uploading ? 'Uploading...' : 'Choose File'}
        onPress={pickDocument}
        disabled={uploading}
        size="lg"
        buttonStyle={styles.button}
        icon={{
          name: 'file-upload',
          type: 'material',
          color: 'white',
        }}
      />

      <View style={styles.supportedFormats}>
        <ThemedText style={styles.supportedText}>
          Supported formats: PDF, DOCX, DOC, TXT, JPG, PNG
        </ThemedText>
        <ThemedText style={styles.supportedText}>
          Maximum file size: 10MB
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  fileInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2089dc',
    borderRadius: 4,
  },
  button: {
    paddingVertical: 15,
  },
  supportedFormats: {
    marginTop: 20,
    alignItems: 'center',
  },
  supportedText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 5,
  },
});

