import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import moviesService from '../services/movies';
import authService from '../services/auth';

const { width, height } = Dimensions.get('window');

const MovieDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { movie } = route.params || {};
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [movieRating, setMovieRating] = useState({ average: 0, count: 0 });
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [similarMovies, setSimilarMovies] = useState([]);

  useEffect(() => {
    if (movie) {
      checkMovieStatus();
      loadReviews();
      loadSimilarMovies();
    }
  }, [movie]);

  const loadReviews = async () => {
    if (!movie) return;
    
    try {
      const [reviewsData, ratingData] = await Promise.all([
        moviesService.getMovieReviews(movie.id),
        moviesService.getMovieRating(movie.id)
      ]);
      
      setReviews(reviewsData);
      setMovieRating(ratingData);
      
      // Kullanıcının kendi yorumunu bul
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const userData = await authService.getStoredUserData();
        if (userData && userData.id) {
          const userReview = reviewsData.find(review => review.userId === userData.id);
          setUserReview(userReview);
        }
      }
    } catch (error) {
      console.error('Reviews yükleme hatası:', error);
    }
  };

  const loadSimilarMovies = async () => {
    if (!movie || !movie.genre) return;
    
    try {
      // Film türünü al ve virgülle ayır
      const movieGenres = movie.genre.split(',').map(g => g.trim());
      
      // Tüm filmleri getir
      const allMovies = await moviesService.getAllMovies();
      
      // Aynı türdeki filmleri filtrele (mevcut film hariç)
      const similar = allMovies.filter(m => {
        if (!m || m.id === movie.id) return false;

        if (m.genre) {
          const otherGenres = m.genre.split(',').map(g => g.trim());
          // En az bir tür ortak olmalı
          return movieGenres.some(genre => otherGenres.includes(genre));
        }
        return false;
      });
      
      // İlk 6 filmi al
      setSimilarMovies(similar.slice(0, 6));
    } catch (error) {
      console.error('Benzer filmler yükleme hatası:', error);
      setSimilarMovies([]);
    }
  };

  const checkMovieStatus = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated || !movie) return;

      const userData = await authService.getStoredUserData();
      if (!userData || !userData.id) return;

      // Kullanıcının favori filmlerini getir
      const favoriteMovies = await moviesService.getUserFavorites(userData.id);
      const isMovieFavorite = favoriteMovies.some(favMovie => favMovie.id === movie.id);
      setIsFavorite(isMovieFavorite);

      // Kullanıcının izlediği filmleri kontrol et
      const isMovieWatched = await moviesService.isMovieWatched(userData.id, movie.id);
      setIsWatched(isMovieWatched);

    } catch (error) {
      console.error('Film durumu kontrol hatası:', error);
    }
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/);
    return match ? match[1] : null;
  };


  const handleGalleryPress = (index) => {
    setSelectedImageIndex(index);
    setShowGallery(true);
  };

  const handleBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const handleAddToFavorites = async () => {
    if (!movie) return;
    
    // Authentication kontrolü
    const isAuthenticated = await authService.isAuthenticated();
    console.log('Favori ekleme - Authentication durumu:', isAuthenticated);
    
    if (!isAuthenticated) {
      Alert.alert(
        'Giriş Gerekli',
        'Favorilere eklemek için giriş yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      setLoading(true);
      const userData = await authService.getStoredUserData();
      if (!userData || !userData.id) {
        Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı');
        return;
      }

      if (isFavorite) {
        // Favori çıkarma işlemi
        try {
          await moviesService.removeFromFavorites(userData.id, movie.id);
          setIsFavorite(false);
          Alert.alert('Başarılı', 'Film favorilerden çıkarıldı');
        } catch (removeError) {
          console.error('Remove error:', removeError);
          // Eğer remove endpoint'i yoksa, toggle endpoint'i dene
          try {
            await moviesService.addToFavorites(userData.id, movie.id);
            setIsFavorite(false);
            Alert.alert('Başarılı', 'Film favorilerden çıkarıldı');
          } catch (toggleError) {
            console.error('Toggle error:', toggleError);
            throw removeError; // İlk hatayı fırlat
          }
        }
      } else {
        await moviesService.addToFavorites(userData.id, movie.id);
        setIsFavorite(true);
        Alert.alert('Başarılı', 'Film favorilere eklendi');
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      let errorMessage = 'Favori işlemi başarısız oldu';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Film bulunamadı';
        } else if (error.response.status === 400) {
          errorMessage = 'Geçersiz istek';
        } else if (error.response.status === 500) {
          errorMessage = 'Sunucu hatası';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = (selectedMovie) => {
    // Aynı film detay sayfasına navigate et
    navigation.navigate('MovieDetails', { movie: selectedMovie });
  };

  const handleActorPress = async (actor) => {
    try {
      // Oyuncunun filmlerini getir
      const actorMovies = await moviesService.getMoviesByActor(actor.name);
      
      if (actorMovies.length === 0) {
        Alert.alert('Bilgi', `${actor.name} oyuncusunun başka filmi bulunamadı.`);
        return;
      }

      // Mevcut filmi listeden çıkar
      const otherMovies = actorMovies.filter(m => m.id !== movie.id);
      
      if (otherMovies.length === 0) {
        Alert.alert('Bilgi', `${actor.name} oyuncusunun sadece bu filmi var.`);
        return;
      }

      // Oyuncunun filmlerini göster
      Alert.alert(
        `${actor.name} Filmleri`, 
        `${actor.name} oyuncusunun ${otherMovies.length} filmi bulundu. Bu özellik yakında eklenecek!`
      );
    } catch (error) {
      console.error('Oyuncu filmleri yükleme hatası:', error);
      Alert.alert('Hata', 'Oyuncu filmleri yüklenirken bir hata oluştu.');
    }
  };

  const handleToggleWatched = async () => {
    if (!movie) return;
    
    // Authentication kontrolü
    const isAuthenticated = await authService.isAuthenticated();
    console.log('İzlendi toggle - Authentication durumu:', isAuthenticated);
    
    if (!isAuthenticated) {
      Alert.alert(
        'Giriş Gerekli',
        'Film izleme durumunu değiştirmek için giriş yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    
    try {
      setLoading(true);
      const userData = await authService.getStoredUserData();
      if (!userData || !userData.id) {
        Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı');
        return;
      }

      const result = await moviesService.toggleWatched(userData.id, movie.id);
      setIsWatched(result.watched);
      
      Alert.alert('Başarılı', result.message);
    } catch (error) {
      console.error('İzlendi toggle hatası:', error);
      let errorMessage = 'İzlendi durumu değiştirilemedi';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Film bulunamadı';
        } else if (error.response.status === 400) {
          errorMessage = 'Geçersiz istek';
        } else if (error.response.status === 500) {
          errorMessage = 'Sunucu hatası';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Hata', errorMessage);
      } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!movie || !reviewComment.trim()) {
      Alert.alert('Hata', 'Lütfen yorumunuzu yazın');
      return;
    }
    
    // Authentication kontrolü
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      Alert.alert(
        'Giriş Gerekli',
        'Yorum yapmak için giriş yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    
    try {
      setLoading(true);
      const userData = await authService.getStoredUserData();
      if (!userData || !userData.id) {
        Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı');
        return;
      }

      const reviewData = {
        rating: reviewRating,
        comment: reviewComment.trim()
      };

      await moviesService.upsertReview(movie.id, userData.id, reviewData);
      
      // Yorumları yeniden yükle
      await loadReviews();
      
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      
      Alert.alert('Başarılı', 'Yorumunuz kaydedildi');
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      Alert.alert('Hata', 'Yorum gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    console.log('handleDeleteReview çağrıldı');
    if (!movie) {
      console.log('Movie yok');
      return;
    }
    
    console.log('Alert gösteriliyor');
    Alert.alert(
      'Yorumu Sil',
      'Yorumunuzu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            console.log('Sil butonuna basıldı');
            try {
              setLoading(true);
              const userData = await authService.getStoredUserData();
              console.log('User data:', userData);
              if (!userData || !userData.id) {
                console.log('User data bulunamadı');
                return;
              }

              console.log('Review siliniyor:', movie.id, userData.id);
              await moviesService.deleteReview(movie.id, userData.id);
              
              // Yorumları yeniden yükle
              await loadReviews();
              
              Alert.alert('Başarılı', 'Yorumunuz silindi');
            } catch (error) {
              console.error('Yorum silme hatası:', error);
              Alert.alert('Hata', 'Yorum silinemedi');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderRatingSelector = (rating, onRatingChange = null) => {
    return (
      <View style={styles.ratingSelectorContainer}>
        <Text style={styles.ratingLabel}>Puanınız: {rating}/10</Text>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.ratingButton,
                rating === value && styles.ratingButtonSelected
              ]}
              onPress={onRatingChange ? () => onRatingChange(value) : null}
              disabled={!onRatingChange}
            >
              <Text style={[
                styles.ratingButtonText,
                rating === value && styles.ratingButtonTextSelected
              ]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Film bulunamadı</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Backdrop */}
      <View style={styles.headerContainer}>
        {movie.backdropUrl ? (
          <Image source={{ uri: movie.backdropUrl }} style={styles.backdrop} />
        ) : (
          <View style={styles.backdropPlaceholder}>
            <Text style={styles.backdropPlaceholderText}>Arka Plan Resmi Yok</Text>
          </View>
        )}
        
        <View style={styles.headerOverlay}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Geri</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Movie Info */}
      <View style={styles.contentContainer}>
        <View style={styles.movieHeader}>
          <View style={styles.posterContainer}>
            {movie.posterUrl ? (
              <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
            ) : (
              <View style={styles.posterPlaceholder}>
                <Text style={styles.posterPlaceholderText}>Poster Yok</Text>
              </View>
            )}
          </View>
          
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle}>{movie.movieName}</Text>
            <Text style={styles.movieYear}>{movie.releaseYear}</Text>
            <Text style={styles.movieGenre}>{movie.genre}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>IMDb:</Text>
              <Text style={styles.ratingValue}>{movie.imdbRating}/10</Text>
            </View>
          </View>
        </View>

        {/* Description - İlk sırada */}
        {movie.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Konu</Text>
            <Text style={styles.description}>{movie.description}</Text>
          </View>
        )}

        {/* Movie Details - İkinci sırada */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Film Detayları</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Yönetmen:</Text>
            <Text style={styles.detailValue}>{movie.producer || 'Bilinmiyor'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tür:</Text>
            <Text style={styles.detailValue}>{movie.genre || 'Bilinmiyor'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Yıl:</Text>
            <Text style={styles.detailValue}>{movie.releaseYear || 'Bilinmiyor'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>IMDb Puanı:</Text>
            <Text style={styles.detailValue}>{movie.imdbRating || 'Bilinmiyor'}/10</Text>
          </View>

          {/* Cast Section */}
          {movie.cast && movie.cast.length > 0 && (
            <View style={styles.castSection}>
              <Text style={styles.detailLabel}>Oyuncular:</Text>
              <View style={styles.castContainer}>
                {movie.cast.map((actor, index) => (
                  <TouchableOpacity
                    key={actor.id || index}
                    style={styles.castItem}
                    onPress={() => handleActorPress(actor)}
                  >
                    <Text style={styles.castName}>🎭 {actor.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Trailer Section - Üçüncü sırada */}
        {movie.trailerUrl && (
          <View style={styles.trailerSection}>
            <Text style={styles.sectionTitle}>Fragman</Text>
            <View style={styles.trailerContainer}>
              <YoutubePlayer
                height={200}
                width={width - 40}
                videoId={getYouTubeVideoId(movie.trailerUrl)}
                play={false}
                onChangeState={(state) => {
                  console.log('Video state:', state);
                }}
              />
            </View>
          </View>
        )}

        {/* Action Buttons - Dördüncü sırada */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, isFavorite && styles.activeButton]}
            onPress={handleAddToFavorites}
            disabled={loading}
          >
            <Text style={[styles.actionButtonText, isFavorite && styles.activeButtonText]}>
              {isFavorite ? '❤️ Favorilerden Çıkar' : '🤍 Favorilere Ekle'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, isWatched && styles.activeButton]}
            onPress={handleToggleWatched}
            disabled={loading}
          >
            <Text style={[styles.actionButtonText, isWatched && styles.activeButtonText]}>
              {isWatched ? '✅ İzlendi' : '👁️ İzlendi Olarak İşaretle'}
            </Text>
          </TouchableOpacity>
          
        </View>

        {/* Similar Movies Section - Yorumlardan önce */}
        {similarMovies.length > 0 && (
          <View style={styles.similarMoviesSection}>
            <Text style={styles.sectionTitle}>Benzer Filmler</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.similarMoviesScroll}
            >
              {similarMovies.map((similarMovie) => (
                <TouchableOpacity
                  key={similarMovie.id}
                  style={styles.similarMovieCard}
                  onPress={() => handleMoviePress(similarMovie)}
                >
                  <Image
                    source={{
                      uri: similarMovie.posterUrl || 'https://via.placeholder.com/150x225?text=No+Image'
                    }}
                    style={styles.similarMoviePoster}
                    resizeMode="cover"
                  />
                  <Text style={styles.similarMovieTitle} numberOfLines={2}>
                    {similarMovie.movieName}
                  </Text>
                  <Text style={styles.similarMovieYear}>
                    {similarMovie.releaseYear}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Reviews Section - Son sırada */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Yorumlar ve Puanlar</Text>
            <View style={styles.ratingSummary}>
              <Text style={styles.ratingText}>
                {movieRating.average.toFixed(1)}/10 ({movieRating.count} yorum)
              </Text>
            </View>
          </View>

          {/* User Review Form */}
          {userReview ? (
            <View style={styles.userReviewContainer}>
              <Text style={styles.userReviewTitle}>Sizin Yorumunuz</Text>
              <View style={styles.userReviewContent}>
                <Text style={styles.userReviewRating}>Puanınız: {userReview.rating}/10</Text>
                <Text style={styles.userReviewComment}>{userReview.comment}</Text>
                <TouchableOpacity 
                  style={styles.deleteReviewButton}
                  onPress={handleDeleteReview}
                  disabled={loading}
                >
                  <Text style={styles.deleteReviewButtonText}>
                    {loading ? 'Siliniyor...' : 'Yorumu Sil'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addReviewButton}
              onPress={() => setShowReviewForm(true)}
            >
              <Text style={styles.addReviewButtonText}>Yorum Yap</Text>
            </TouchableOpacity>
          )}

          {/* Review Form Modal */}
          {showReviewForm && (
            <View style={styles.reviewFormContainer}>
              <Text style={styles.reviewFormTitle}>Yorumunuzu Yazın</Text>
              
              {renderRatingSelector(reviewRating, setReviewRating)}
              
              <TextInput
                style={styles.reviewTextInput}
                placeholder="Yorumunuzu yazın..."
                placeholderTextColor="#666"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={4}
                maxLength={1000}
              />
              
              <View style={styles.reviewFormButtons}>
                <TouchableOpacity 
                  style={styles.cancelReviewButton}
                  onPress={() => {
                    setShowReviewForm(false);
                    setReviewComment('');
                    setReviewRating(5);
                  }}
                >
                  <Text style={styles.cancelReviewButtonText}>İptal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.submitReviewButton}
                  onPress={handleSubmitReview}
                  disabled={loading}
                >
                  <Text style={styles.submitReviewButtonText}>
                    {loading ? 'Gönderiliyor...' : 'Gönder'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reviews List */}
          {reviews.length > 0 && (
            <View style={styles.reviewsListContainer}>
              <Text style={styles.reviewsListTitle}>Diğer Yorumlar</Text>
              {reviews.slice(0, 5).map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.userDisplayName}</Text>
                    <Text style={styles.reviewRatingText}>{review.rating}/10</Text>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Gallery Section */}
        {movie.gallery && movie.gallery.length > 0 && (
          <View style={styles.gallerySection}>
            <Text style={styles.sectionTitle}>Galeri</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.galleryScroll}
            >
              {movie.gallery.map((imageUrl, index) => (
                  <TouchableOpacity
                  key={index} 
                  style={styles.galleryItem}
                  onPress={() => handleGalleryPress(index)}
                >
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </View>


      {/* Gallery Modal */}
      <Modal
        visible={showGallery}
        animationType="fade"
        presentationStyle="fullScreen"
      >
        <View style={styles.galleryModalContainer}>
          <View style={styles.galleryModalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowGallery(false)}
            >
              <Text style={styles.closeButtonText}>✕ Kapat</Text>
            </TouchableOpacity>
            <Text style={styles.galleryModalTitle}>
              {selectedImageIndex + 1} / {movie.gallery?.length || 0}
            </Text>
          </View>
          
          <FlatList
            data={movie.gallery || []}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <View style={styles.galleryModalItem}>
                <Image 
                  source={{ uri: item }} 
                  style={styles.galleryModalImage}
                  resizeMode="contain"
                />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  headerContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backdropPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPlaceholderText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingLeft: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
  },
  movieHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  posterContainer: {
    marginRight: 16,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  posterPlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  movieYear: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  movieGenre: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  actionButtons: {
    flexDirection: 'column',
    marginBottom: 30,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  activeButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  detailsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    width: 120,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  descriptionSection: {
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 50,
  },
  trailerSection: {
    marginBottom: 30,
  },
  trailerContainer: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  trailerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  trailerUrl: {
    color: '#FF6B6B',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  gallerySection: {
    marginBottom: 30,
  },
  galleryScroll: {
    paddingLeft: 0,
  },
  galleryItem: {
    marginRight: 12,
  },
  galleryImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  galleryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  galleryModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  galleryModalItem: {
    width: width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryModalImage: {
    width: width,
    height: height * 0.8,
  },
  
  // Review Styles
  reviewsSection: {
    marginBottom: 30,
  },
  reviewsHeader: {
    marginBottom: 20,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 15,
  },
  ratingSelectorContainer: {
    marginBottom: 15,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  ratingButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  ratingButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingButtonTextSelected: {
    color: '#FFFFFF',
  },
  userReviewContainer: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  userReviewTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  userReviewContent: {
    marginTop: 10,
  },
  userReviewRating: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  userReviewComment: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  deleteReviewButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  deleteReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addReviewButton: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewFormContainer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  reviewFormTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  ratingLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 10,
  },
  reviewTextInput: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    textAlignVertical: 'top',
    marginTop: 15,
    marginBottom: 15,
    minHeight: 80,
  },
  reviewFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelReviewButton: {
    flex: 1,
    backgroundColor: '#666666',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  submitReviewButton: {
    flex: 1,
    backgroundColor: '#E50914',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsListContainer: {
    marginTop: 20,
  },
  reviewsListTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  reviewItem: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewRatingText: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewComment: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    color: '#888888',
    fontSize: 12,
  },
  
  // Similar Movies Styles
  similarMoviesSection: {
    marginBottom: 30,
  },
  similarMoviesScroll: {
    marginTop: 15,
  },
  similarMovieCard: {
    width: 120,
    marginRight: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  similarMoviePoster: {
    width: 120,
    height: 180,
    backgroundColor: '#2A2A2A',
  },
  similarMovieTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    lineHeight: 16,
  },
  similarMovieYear: {
    color: '#CCCCCC',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  
  castName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Cast in Details Section Styles
  castContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  castItem: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
});

export default MovieDetails;
