import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 sütun için
const horizontalCardWidth = width * 0.4; // Horizontal scroll için

const MovieCard = ({ movie, onPress, isHorizontal = false, useBackdrop = false }) => {
  const handlePress = () => {
    if (onPress) {
      console.log('Film kartına tıklandı:', movie.movieName);
      onPress(movie);
    } else {
      Alert.alert('Film Detayları', `${movie.movieName} - ${movie.releaseYear}`);
    }
  };

  const containerStyle = [
    styles.container,
    { width: isHorizontal ? horizontalCardWidth : cardWidth }
  ];

  // Backdrop için farklı boyut oranı
  const aspectRatio = useBackdrop ? 1.78 : 1.5; // 16:9 için 1.78, poster için 1.5
  const imageContainerStyle = [
    styles.imageContainer,
    { height: (isHorizontal ? horizontalCardWidth : cardWidth) * aspectRatio }
  ];

  return (
    <TouchableOpacity 
      style={containerStyle} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={imageContainerStyle}>
        <Image
          source={{
            uri: useBackdrop 
              ? (movie.backdropUrl || movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image')
              : (movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image')
          }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            {movie.imdbRating ? movie.imdbRating.toFixed(1) : '-'}
          </Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.movieName}
        </Text>
        <Text style={styles.year}>
          {movie.releaseYear || 'Bilinmiyor'}
        </Text>
        <Text style={styles.genre} numberOfLines={1}>
          {movie.genre || 'Bilinmiyor'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#333333',
    transform: [{ scale: 1 }],
  },
  imageContainer: {
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rating: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 18,
  },
  year: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 2,
  },
  genre: {
    color: '#CCCCCC',
    fontSize: 11,
  },
});

export default MovieCard;
