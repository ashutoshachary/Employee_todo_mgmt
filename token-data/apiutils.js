import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  if (options.method === 'PUT') {
    return fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      body: options.body ? options.body : JSON.stringify(options.data),
    });
  }

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};

// Helper function specifically for PUT requests
export const makePutRequest = async (url, data) => {
  try {
    const response = await makeAuthenticatedRequest(url, {
      method: 'PUT',
      data: data, // Will be automatically stringified
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication expired');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('PUT request failed:', error);
    throw error;
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['token', 'userId']);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

export const getAuthData = async () => {
  try {
    const [[, token], [, userId]] = await AsyncStorage.multiGet(['token', 'userId']);
    return { token, userId };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return { token: null, userId: null };
  }
};