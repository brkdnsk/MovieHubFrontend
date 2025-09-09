import React from 'react';
import {
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MovieCard from './MovieCard';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.4; // Horizontal scroll için daha küçük kartlar

const HorizontalList = ({ data, onMoviePress, onEndReached }) => {
  const renderMovie = ({ item }) => (
    <MovieCard
      movie={item}
      onPress={onMoviePress}
      isHorizontal={true}
    />
  );

  return (
    <FlatList
      data={data}
      renderItem={renderMovie}
      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});

export default HorizontalList;
