import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The path where the file should be stored (e.g. 'posts/userId/123.jpg')
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Get the download URL for a file
 * @param {string} path - The path to the file
 * @returns {Promise<string>} - The download URL
 */
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} path - The path to the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Upload a profile image
 * @param {File} file - The image file
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - The download URL
 */
export const uploadProfileImage = async (file, userId) => {
  const fileExtension = file.name.split('.').pop();
  const path = `users/${userId}/profile.${fileExtension}`;
  return await uploadFile(file, path);
};

/**
 * Upload a post image
 * @param {File} file - The image file
 * @param {string} userId - The user ID
 * @param {string} postId - The post ID
 * @returns {Promise<string>} - The download URL
 */
export const uploadPostImage = async (file, userId, postId) => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExtension}`;
  const path = `posts/${userId}/${postId}/${fileName}`;
  return await uploadFile(file, path);
}; 