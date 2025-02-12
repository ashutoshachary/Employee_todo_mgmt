// fileUploadUtils.js
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { API_URL111 as API_URL } from '../screens/SignupScreen';
export const uploadFileToS3 = async (uri, fileType) => {
  try {
    // Generate a unique filename
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileType}`;
    
    // If the uri starts with 'file://', we need to read it first
    let fileUri = uri;
    if (Platform.OS === 'ios' && uri.startsWith('file://')) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Create a temporary file with the base64 content
      const tempUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(tempUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      fileUri = tempUri;
    }

    // Instead of using presigned URL, we'll use the direct upload endpoint
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: fileType === 'pdf' ? 'application/pdf' : `image/${fileType}`,
      name: fileName,
    });

    const uploadResponse = await fetch(`${API_URL}/api/upload/direct`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    const result = await uploadResponse.json();
    return result.fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};