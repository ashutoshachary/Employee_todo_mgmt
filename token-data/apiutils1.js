import * as SecureStore from 'expo-secure-store';

// Store auth data securely
export const storeAuthData = async (token, userId) => {
  try {
    const authData = JSON.stringify({
      token,
      userId,
      timestamp: Date.now()
    });
    await SecureStore.setItemAsync('authData', authData);
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
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


// Get auth data
export const getAuthData = async () => {
  try {
    const authDataString = await SecureStore.getItemAsync('authData');
    if (authDataString) {
      const { token, userId } = JSON.parse(authDataString);
      return { token, userId };
    }
    return { token: null, userId: null };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return { token: null, userId: null };
  }
};

// Check if auth data exists
export const hasAuthData = async () => {
  try {
    const authData = await SecureStore.getItemAsync('authData');
    return authData !== null;
  } catch (error) {
    console.error('Error checking auth data:', error);
    return false;
  }
};

// Remove auth data (for logout)
export const removeAuthData = async () => {
  try {
    await SecureStore.deleteItemAsync('authData');
    return true;
  } catch (error) {
    console.error('Error removing auth data:', error);
    return false;
  }
};