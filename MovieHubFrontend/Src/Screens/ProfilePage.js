import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import authService from '../services/auth';
import moviesService from '../services/movies';

const ProfilePage = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getStoredUserData();
      setUser(userData);
      
      // Eğer kullanıcı giriş yapmışsa istatistikleri yükle
      if (userData && userData.id) {
        try {
          const [favorites, watched] = await Promise.all([
            moviesService.getUserFavorites(userData.id),
            moviesService.getUserWatched(userData.id)
          ]);
          
          setFavoriteCount(favorites.length);
          setWatchedCount(watched.length);
          
          // Kullanıcı yorumlarını yükle
          await loadUserReviews(userData.id);
        } catch (error) {
          console.error('İstatistik yükleme hatası:', error);
          setFavoriteCount(0);
          setWatchedCount(0);
          setUserReviews([]);
          setReviewCount(0);
        }
      } else {
        setFavoriteCount(0);
        setWatchedCount(0);
        setUserReviews([]);
        setReviewCount(0);
      }
    } catch (error) {
      console.error('Kullanıcı profili yüklenemedi:', error);
      setUser(null);
      setFavoriteCount(0);
      setWatchedCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReviews = async (userId) => {
    try {
      // Tüm filmleri getir
      const allMovies = await moviesService.getAllMovies();
      const userReviewsList = [];
      
      // Her film için kullanıcının yorumunu kontrol et
      for (const movie of allMovies) {
        try {
          const reviews = await moviesService.getMovieReviews(movie.id);
          const userReview = reviews.find(review => review.userId === userId);
          
          if (userReview) {
            userReviewsList.push({
              ...userReview,
              movieName: movie.movieName,
              moviePoster: movie.posterUrl
            });
          }
        } catch (error) {
          // Bu film için yorum yok, devam et
          continue;
        }
      }
      
      setUserReviews(userReviewsList);
      setReviewCount(userReviewsList.length);
    } catch (error) {
      console.error('Kullanıcı yorumları yükleme hatası:', error);
      setUserReviews([]);
      setReviewCount(0);
    }
  };

  const handleLogin = () => {
    // HomeStack'e navigate et, oradan Login'e git
    navigation.navigate('Ana Sayfa', { screen: 'Login' });
  };

  const handleRegister = () => {
    // HomeStack'e navigate et, oradan Register'e git
    navigation.navigate('Ana Sayfa', { screen: 'Register' });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              setUser(null);
              Alert.alert('Başarılı', 'Çıkış yapıldı');
            } catch (error) {
              console.error('Çıkış hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const handleClearStorage = async () => {
    Alert.alert(
      'Storage Temizle',
      'Tüm kullanıcı verilerini temizlemek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              setUser(null);
              Alert.alert('Başarılı', 'Storage temizlendi');
            } catch (error) {
              console.error('Storage temizleme hatası:', error);
              Alert.alert('Hata', 'Storage temizlenirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };


  const handleMyFavorites = async () => {
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      Alert.alert(
        'Giriş Gerekli',
        'Favori filmlerinizi görmek için giriş yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    // MyList sayfasına git (favori filmler sekmesi ile)
    navigation.navigate('Listem', { initialTab: 'favorites' });
  };



  const handleMyReviews = () => {
    // Kullanıcı yorumlarını göster
    if (userReviews.length === 0) {
      Alert.alert('Bilgi', 'Henüz hiç yorum yapmamışsınız.');
      return;
    }
    
    // Yorumların detaylarını göster
    const reviewDetails = userReviews.map(review => 
      `• ${review.movieName}: ${review.rating}/10 - "${review.comment || 'Yorum yok'}"`
    ).join('\n');
    
    Alert.alert(
      'Yorumlarım', 
      `${reviewCount} yorum yapmışsınız:\n\n${reviewDetails}`,
      [{ text: 'Tamam' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Profil yükleniyor...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {/* Login Prompt */}
        <View style={styles.loginPrompt}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </View>
          
          <Text style={styles.userName}>Giriş Yapın</Text>
          <Text style={styles.userEmail}>Favorilerinizi ve izleme listenizi yönetmek için giriş yapın</Text>
          
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.displayName || user?.name)?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.userName}>
          {user?.displayName || user?.name || 'Kullanıcı'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email || 'email@example.com'}
        </Text>
        
        {/* Welcome Message */}
        <Text style={styles.welcomeMessage}>
          Hoş geldin, {user?.displayName || user?.name || 'Kullanıcı'}! 👋
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>Favori Film</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{watchedCount}</Text>
          <Text style={styles.statLabel}>İzlenen Film</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reviewCount}</Text>
          <Text style={styles.statLabel}>Yorum</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleMyFavorites}>
          <Text style={styles.menuIcon}>❤️</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Favori Filmlerim</Text>
            <Text style={styles.menuSubtext}>{favoriteCount} film</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleMyReviews}>
          <Text style={styles.menuIcon}>💬</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Yorumlarım</Text>
            <Text style={styles.menuSubtext}>{reviewCount} yorum</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Clear Storage Button */}
      <TouchableOpacity style={styles.clearStorageButton} onPress={handleClearStorage}>
        <Text style={styles.clearStorageButtonText}>Storage Temizle</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loginPrompt: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  authButtons: {
    width: '100%',
    marginTop: 30,
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  registerButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  menuArrow: {
    fontSize: 20,
    color: '#CCCCCC',
  },
  clearStorageButton: {
    backgroundColor: '#FF8800',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearStorageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default ProfilePage;
