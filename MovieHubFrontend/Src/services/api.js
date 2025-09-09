import axios from 'axios';

// Backend API base URL - Android emulator için 10.0.2.2 kullanıyoruz
const BASE_URL = 'http://10.0.2.2:8080';

// Axios instance oluştur
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekleme
api.interceptors.request.use(
  async (config) => {
    try {
      // AsyncStorage'dan token al
      const token = await getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token alınırken hata:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz, kullanıcıyı login sayfasına yönlendir
      clearStoredToken();
      // Navigation logic burada olacak
    }
    return Promise.reject(error);
  }
);

// Token yönetimi fonksiyonları
const getStoredToken = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.token;
    }
    return null;
  } catch (error) {
    console.error('Token okuma hatası:', error);
    return null;
  }
};

const clearStoredToken = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Token temizleme hatası:', error);
  }
};

export default api;
