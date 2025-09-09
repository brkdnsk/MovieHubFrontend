import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth servisleri
const authService = {
  // Kullanıcı girişi
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', {
        email,
        password
      });
      
      if (response.data) {
        // Backend'den gelen veriyi işle
        const userData = {
          id: response.data.id,
          name: response.data.displayName, // Backend'de displayName, frontend'de name olarak kullanıyoruz
          email: response.data.email,
          token: 'mock-token' // Backend token döndürmüyorsa mock token
        };
        
        await storeUserData(userData);
        return { success: true, user: userData };
      }
      
      return { success: false, message: 'Giriş başarısız' };
    } catch (error) {
      console.error('Giriş hatası:', error);
      console.log('Error response:', error.response);
      console.log('Error status:', error.response?.status);
      
      // HTTP status kodlarına göre hata mesajları
      if (error.response) {
        const status = error.response.status;
        console.log('Status code:', status);
        
        if (status === 401) {
          return { success: false, message: 'E-posta veya şifre hatalı' };
        } else if (status === 404) {
          return { success: false, message: 'Kullanıcı bulunamadı' };
        } else if (status === 500) {
          return { success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' };
        } else if (status === 400) {
          return { success: false, message: 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.' };
        }
        
        // Backend validation hatalarını parse et
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          return { success: false, message: errorData };
        } else if (errorData.message) {
          return { success: false, message: errorData.message };
        }
      }
      
      // Network hatası
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return { success: false, message: 'İnternet bağlantınızı kontrol edin' };
      }
      
      return { success: false, message: 'Giriş yapılırken bir hata oluştu' };
    }
  },

  // Kullanıcı kaydı
  register: async (displayName, email, password) => {
    try {
      const response = await api.post('/users/register', {
        displayName,
        email,
        password
      });
      
      if (response.data) {
        // Backend'den gelen veriyi işle
        const userData = {
          id: response.data.id,
          name: response.data.displayName, // Backend'de displayName, frontend'de name olarak kullanıyoruz
          email: response.data.email,
          token: 'mock-token' // Backend token döndürmüyorsa mock token
        };
        
        await storeUserData(userData);
        return { success: true, user: userData };
      }
      
      return { success: false, message: 'Kayıt başarısız' };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      
      // HTTP status kodlarına göre hata mesajları
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          return { success: false, message: 'Geçersiz bilgiler. Lütfen kontrol edin.' };
        } else if (status === 409) {
          return { success: false, message: 'Bu e-posta adresi zaten kullanılıyor' };
        } else if (status === 500) {
          return { success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' };
        }
        
        // Backend validation hatalarını parse et
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          return { success: false, message: errorData };
        } else if (errorData.message) {
          return { success: false, message: errorData.message };
        }
      }
      
      // Network hatası
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return { success: false, message: 'İnternet bağlantınızı kontrol edin' };
      }
      
      return { success: false, message: 'Kayıt olurken bir hata oluştu' };
    }
  },

  // Kullanıcı çıkışı
  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      // Hata olsa bile local data'yı temizle
      await clearUserData();
    }
  },

  // Kullanıcı profilini getir
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      throw error;
    }
  },

  // Kayıtlı kullanıcı verilerini getir
  getStoredUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Kullanıcı verisi okuma hatası:', error);
      return null;
    }
  },

  // Kullanıcının giriş yapıp yapmadığını kontrol et
  isAuthenticated: async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return false;
      
      const parsedData = JSON.parse(userData);
      return parsedData && parsedData.id && parsedData.email;
    } catch (error) {
      console.error('Auth kontrol hatası:', error);
      return false;
    }
  }
};

// Kullanıcı verilerini AsyncStorage'a kaydet
const storeUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Kullanıcı verisi kaydetme hatası:', error);
  }
};

// Kullanıcı verilerini AsyncStorage'dan temizle
const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Kullanıcı verisi temizleme hatası:', error);
  }
};

export default authService;
