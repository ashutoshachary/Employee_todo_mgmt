import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Using Expo icons instead

const CircularPhotoUpload = ({ photoUrl, onPress }) => {
  return (
    <View style={styles.container}>
      {photoUrl ? (
        <View style={styles.photoContainer}>
          <Image
            style={styles.photo}
            source={{ uri: photoUrl }}
          />
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={onPress}
          >
            <MaterialIcons name="edit" size={16} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.placeholderContainer} 
          onPress={onPress}
        >
          <View style={styles.placeholder}>
            <MaterialIcons name="add-a-photo" size={24} color="#666" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  photoContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#e1e1e1',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  placeholderContainer: {
    width: 120,
    height: 120,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e1e1e1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularPhotoUpload;