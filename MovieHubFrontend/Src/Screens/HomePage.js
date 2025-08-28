import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  Pressable,
} from 'react-native'

const MOCK_TRENDING = [
  {
    id: 'tt0111161',
    title: 'The Shawshank Redemption',
    poster:
      'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  }, 
  {
    id: 'tt0068642',
    title: 'The Godfather',
    poster:
      'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  },
  {
    id: 'tt0068646',
    title: 'The Godfather',
    poster:
      'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  },
  {
    id: 'tt0468569',
    title: 'The Dark Knight',
    poster:
      'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  },
  {
    id: 'tt1375666',
    title: 'Inception',
    poster:
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
  },
]

const MOCK_CONTINUE_WATCHING = [
  {
    id: 'cw1',
    title: 'Extraction',
    poster:
      'https://image.tmdb.org/t/p/w500/wlfDxbGEsW58vGhFljKkcR5IxDj.jpg',
    progress: 0.35,
  },
  {
    id: 'cw2',
    title: 'The Gray Man',
    poster:
      'https://image.tmdb.org/t/p/w500/8cXbitsS6dWQ5gfMTZdorpAAzEH.jpg',
    progress: 0.6,
  },
  {
    id: 'cw3',
    title: 'Dune',
    poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    progress: 0.15,
  },
]

const CATEGORIES = [
  'Action',
  'Drama',
  'Comedy',
  'Sci‑Fi',
  'Horror',
  'Romance',
  'Thriller',
]

export default function HomePage() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header />
      <SearchBar />

      <Section title="Continue Watching" onPressViewAll={() => {}}>
        <FlatList
          data={MOCK_CONTINUE_WATCHING}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => <ContinueCard item={item} />}
        />
      </Section>

      <Section title="Top 10 Movies" onPressViewAll={() => {}}>
        <FlatList
          data={MOCK_TRENDING}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item, index }) => (
            <PosterCard item={item} rank={index + 1} />
          )}
        />
      </Section>

      <Section title="Categories" onPressViewAll={() => {}}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item }) => <Chip label={item} />}
        />
      </Section>

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

function Header() {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.brand}>MovieHub</Text>
      <View style={styles.avatar} />
    </View>
  )
}

function SearchBar() {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        placeholder="What do you want to watch today?"
        placeholderTextColor="#7a8290"
        style={styles.searchInput}
      />
      <Pressable style={styles.searchButton}>
        <Text style={styles.searchButtonText}>Search</Text>
      </Pressable>
    </View>
  )
}

function Section({ title, onPressViewAll, children }) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={onPressViewAll} hitSlop={8}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>
      {children}
    </View>
  )
}

function ContinueCard({ item }) {
  return (
    <View style={styles.continueCard}>
      <Image source={{ uri: item.poster }} style={styles.continueImage} />
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(1, item.progress)) * 100}%` }]} />
      </View>
      <Text numberOfLines={1} style={styles.cardTitle}>
        {item.title}
      </Text>
    </View>
  )
}

function PosterCard({ item, rank }) {
  return (
    <View style={styles.posterCard}>
      <Image source={{ uri: item.poster }} style={styles.posterImage} />
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <Text numberOfLines={1} style={styles.cardTitle}>
        {item.title}
      </Text>
    </View>
  )
}

function Chip({ label }) {
  return (
    <Pressable style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  )
}

const COLORS = {
  background: '#0b0f17',
  layer: '#131a24',
  textPrimary: '#ffffff',
  textSecondary: '#9aa4b2',
  accent: '#5b8cff',
  border: '#1f2a3b',
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContent: {
    paddingVertical: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.layer,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.layer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  searchButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  sectionContainer: {
    paddingTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  horizontalListContent: {
    paddingHorizontal: 16,
  },
  continueCard: {
    width: 180,
    backgroundColor: COLORS.layer,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  continueImage: {
    width: '100%',
    height: 110,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#2b3546',
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.accent,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  posterCard: {
    width: 110,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.layer,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  posterImage: {
    width: '100%',
    height: 160,
  },
  rankBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.layer,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
})