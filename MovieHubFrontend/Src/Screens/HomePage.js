import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moviesService from '../services/movies';
import authService from '../services/auth';
import MovieCard from '../components/MovieCard';
import SectionHeader from '../components/SectionHeader';

const HomePage = ({ navigation }) => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [latestMovies, setLatestMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [categoryMovies, setCategoryMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPopularMovies(),
        loadLatestMovies(),
        loadCategories(),
      ]);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadPopularMovies = async () => {
    try {
      const data = await moviesService.getPopularMovies();
      setPopularMovies(data || []);
    } catch (error) {
      console.error('Popüler filmler yüklenemedi:', error);
      setPopularMovies([]);
    }
  };

  const loadLatestMovies = async () => {
    try {
      const data = await moviesService.getLatestMovies();
      setLatestMovies(data || []);
    } catch (error) {
      console.error('En yeni filmler yüklenemedi:', error);
      setLatestMovies([]);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await moviesService.getCategories();
      setCategories(['Tümü', ...data]);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      setCategories(['Tümü']);
    }
  };


  const handleCategoryPress = async (category) => {
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      Alert.alert(
        'Giriş Gerekli',
        'Kategorilere göre filmleri görmek için giriş yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    setSelectedCategory(category);
    if (category === 'Tümü') {
      setCategoryMovies([]);
    } else {
      try {
        const data = await moviesService.getMoviesByGenre(category);
        setCategoryMovies(data || []);
      } catch (error) {
        console.error('Kategori filmleri yüklenemedi:', error);
        setCategoryMovies([]);
      }
    }
  };


  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
    } else {
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        Alert.alert(
          'Giriş Gerekli',
          'Film aramak için giriş yapmanız gerekiyor.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
          ]
        );
        setSearchQuery('');
        return;
      }

      setIsSearching(true);
      try {
        const data = await moviesService.searchMovies(query);
        setSearchResults(data || []);
      } catch (error) {
        console.error('Arama hatası:', error);
        setSearchResults([]);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };


  const handleMoviePress = (movie) => {
    if (navigation && navigation.navigate) {
      console.log('Film seçildi:', movie.movieName);
      navigation.navigate('MovieDetails', { movie });
    }
  };

  if (loading) {
  return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Filmler yükleniyor...</Text>
    </View>
  );
}

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MovieHub</Text>
        <Text style={styles.headerSubtitle}>En iyi filmleri keşfedin</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
          <TextInput
          style={styles.searchInput}
          placeholder="Film veya tür ara..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Category Bar */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.selectedCategoryButton
              ]}
              onPress={() => handleCategoryPress(item)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === item && styles.selectedCategoryButtonText
              ]}>
                {item}
              </Text>
          </TouchableOpacity>
          )}
        />
        </View>


      {/* Search Results */}
      {isSearching && searchResults.length > 0 && (
        <>
          <SectionHeader 
            title={`"${searchQuery}" için sonuçlar (${searchResults.length})`}
            showViewAll={false}
          />
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {searchResults.map((movie) => (
              <TouchableOpacity
                key={movie.id}
                onPress={() => handleMoviePress(movie)}
                style={styles.searchResultCard}
              >
                <Image
                  source={{
                    uri: movie.posterUrl || 'https://via.placeholder.com/150x225?text=No+Image'
                  }}
                  style={styles.searchResultPoster}
                  resizeMode="cover"
                />
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultTitle} numberOfLines={2}>
                    {movie.movieName}
                  </Text>
                  <Text style={styles.searchResultDirector} numberOfLines={1}>
                    🎬 {movie.producer || 'Yönetmen bilgisi yok'}
                  </Text>
                  <Text style={styles.searchResultYear}>
                    📅 {movie.releaseYear || 'Yıl bilgisi yok'}
                  </Text>
                  <Text style={styles.searchResultGenre} numberOfLines={1}>
                    🎭 {movie.genre || 'Tür bilgisi yok'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
                </>
              )}

      {/* Category Movies */}
      {selectedCategory !== 'Tümü' && categoryMovies.length > 0 && (
        <>
          <SectionHeader 
            title={`${selectedCategory} Filmleri`}
            showViewAll={false}
          />
          <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {categoryMovies.map((movie) => (
              <TouchableOpacity
                key={movie.id}
                onPress={() => handleMoviePress(movie)}
                style={styles.movieCardContainer}
              >
                <MovieCard movie={movie} isHorizontal={true} useBackdrop={true} onPress={handleMoviePress} />
              </TouchableOpacity>
            ))}
          </ScrollView>
                </>
              )}


      {/* Popular Movies Section */}
      {!isSearching && selectedCategory === 'Tümü' && (
        <>
          <SectionHeader 
            title="Popüler Filmler" 
            showViewAll={false}
                  />
                </>
      )}
      
      {popularMovies.length > 0 ? (
        <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {popularMovies.map((movie) => (
            <TouchableOpacity
              key={movie.id}
              onPress={() => handleMoviePress(movie)}
              style={styles.movieCardContainer}
            >
              <MovieCard movie={movie} isHorizontal={true} onPress={handleMoviePress} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Popüler film bulunamadı</Text>
        </View>
      )}

      {/* Latest Movies Section */}
      {!isSearching && selectedCategory === 'Tümü' && (
        <>
          <SectionHeader 
            title="En Yeni Filmler" 
            showViewAll={false}
          />
        </>
      )}
      
      {latestMovies.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {latestMovies.map((movie) => (
            <TouchableOpacity
              key={movie.id}
              onPress={() => handleMoviePress(movie)}
              style={styles.movieCardContainer}
            >
              <MovieCard movie={movie} isHorizontal={true} onPress={handleMoviePress} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>En yeni film bulunamadı</Text>
        </View>
      )}

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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '400',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  movieCardContainer: {
    marginRight: 16,
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedCategoryButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
  
  // Search Result Styles
  searchResultCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchResultPoster: {
    width: 200,
    height: 120,
    backgroundColor: '#2A2A2A',
  },
  searchResultInfo: {
    padding: 12,
  },
  searchResultTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  searchResultDirector: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 4,
  },
  searchResultYear: {
    color: '#CCCCCC',
    fontSize: 11,
    marginBottom: 4,
  },
  searchResultGenre: {
    color: '#888888',
    fontSize: 11,
  },
});

export default HomePage;