import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MovieCard from '../components/MovieCard';
import authService from '../services/auth';
import moviesService from '../services/movies';

const MyListPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'favorites'); // 'favorites' or 'watched'

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const authStatus = await authService.isAuthenticated();
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      loadUserLists();
    } else {
      setLoading(false);
    }
  };

  const loadUserLists = async () => {
    try {
      setLoading(true);
      const userData = await authService.getStoredUserData();
      
      if (userData && userData.id) {
        // Favori filmleri ve izlenen filmleri yükle
        const [favorites, watched] = await Promise.all([
          moviesService.getUserFavorites(userData.id),
          moviesService.getUserWatched(userData.id)
        ]);
        
        setFavoriteMovies(favorites || []);
        setWatchedMovies(watched || []);
      }
    } catch (error) {
      console.error('Liste yükleme hatası:', error);
      setFavoriteMovies([]);
      setWatchedMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkAuthentication();
    setRefreshing(false);
  };

  const handleMoviePress = (movie) => {
    if (navigation && navigation.navigate) {
      // HomeStack'e navigate et, oradan MovieDetails'e git
      navigation.navigate('Ana Sayfa', { 
        screen: 'MovieDetails', 
        params: { movie } 
      });
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

  const renderMovie = ({ item }) => (
    <View style={styles.movieItem}>
      <MovieCard movie={item} onPress={handleMoviePress} />
    </View>
  );

  const renderEmptyState = (message) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const renderUnauthenticatedView = () => (
    <View style={styles.unauthenticatedContainer}>
      <Text style={styles.unauthenticatedTitle}>Giriş Yapın</Text>
      <Text style={styles.unauthenticatedSubtitle}>
        Favori filmlerinizi ve izleme listenizi görmek için giriş yapmanız gerekiyor.
      </Text>
      
      <View style={styles.authButtons}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return renderUnauthenticatedView();
  }

  const currentMovies = activeTab === 'favorites' ? favoriteMovies : watchedMovies;
  const currentTitle = activeTab === 'favorites' ? 'Favori Filmlerim' : 'İzlediğim Filmler';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Listem</Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'favorites' && styles.activeTabButton]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'favorites' && styles.activeTabButtonText]}>
            Favoriler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'watched' && styles.activeTabButton]}
          onPress={() => setActiveTab('watched')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'watched' && styles.activeTabButtonText]}>
            İzlenenler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Message */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {activeTab === 'favorites' 
            ? 'Favori filmleriniz burada görüntülenir' 
            : 'İzlediğiniz filmler burada görüntülenir'}
        </Text>
      </View>

      {/* Movie List */}
      {currentMovies.length > 0 ? (
        <FlatList
          data={currentMovies}
          renderItem={renderMovie}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        renderEmptyState(
          activeTab === 'favorites' 
            ? 'Henüz favori filminiz yok' 
            : 'İzleme listeniz boş'
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FF6B6B',
  },
  tabButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listContainer: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  movieItem: {
    width: '48%',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#666666',
    fontSize: 18,
    textAlign: 'center',
  },
  unauthenticatedContainer: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  unauthenticatedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  unauthenticatedSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  authButtons: {
    width: '100%',
    maxWidth: 300,
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
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
});

export default MyListPage;
