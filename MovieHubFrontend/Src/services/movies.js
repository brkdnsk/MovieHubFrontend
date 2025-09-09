import api from './api';

const moviesService = {
  // Tüm filmleri getir
  async getAllMovies() {
    try {
      const response = await api.get('/movies');
      console.log('Movies response:', response.data);
      
      if (!response.data) {
        console.log('No data received from movies endpoint');
        return [];
      }
      
      // Backend'den gelen veri array değilse array'e çevir
      let movies = Array.isArray(response.data) ? response.data : [response.data];
      
      // Her film için gallery'yi JSON string'den array'e çevir
      movies = movies.map(movie => {
        if (movie && movie.gallery && typeof movie.gallery === 'string') {
          try {
            movie.gallery = JSON.parse(movie.gallery);
          } catch (e) {
            console.log('Gallery JSON parse error:', e);
            movie.gallery = [];
          }
        }
        
        // Gallery verisi yoksa boş array olarak ayarla
        if (!movie.gallery || !Array.isArray(movie.gallery)) {
          movie.gallery = [];
        }
        
        return movie;
      });
      
      return movies;
    } catch (error) {
      console.error('Movies fetch error:', error);
      return [];
    }
  },

  // Popüler filmleri getir (IMDb puanına göre sırala)
  async getPopularMovies() {
    try {
      const movies = await this.getAllMovies();
      return movies
        .filter(movie => movie && movie.imdbRating)
        .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
        .slice(0, 10);
    } catch (error) {
      console.error('Popular movies error:', error);
      return [];
    }
  },

  // En yeni filmleri getir (yıla göre sırala)
  async getLatestMovies() {
    try {
      const movies = await this.getAllMovies();
      return movies
        .filter(movie => movie && movie.releaseYear)
        .sort((a, b) => parseInt(b.releaseYear) - parseInt(a.releaseYear))
        .slice(0, 10);
    } catch (error) {
      console.error('Latest movies error:', error);
      return [];
    }
  },

  // Kategorilere göre filmleri getir
  async getMoviesByGenre(genre) {
    try {
      const movies = await this.getAllMovies();
      return movies.filter(movie => 
        movie && movie.genre && 
        movie.genre.toLowerCase().includes(genre.toLowerCase())
      );
    } catch (error) {
      console.error('Movies by genre error:', error);
      return [];
    }
  },

  // Film arama
  async searchMovies(query) {
    try {
      const movies = await this.getAllMovies();
      const searchTerm = query.toLowerCase();
      
      return movies.filter(movie => {
        if (!movie) return false;
        
        // Film adında arama
        const movieNameMatch = movie.movieName && 
          movie.movieName.toLowerCase().includes(searchTerm);
        
        // Yönetmen adında arama (producer field'ını yönetmen olarak kullan)
        const directorMatch = movie.producer && 
          movie.producer.toLowerCase().includes(searchTerm);
        
        // Tür adında arama
        const genreMatch = movie.genre && 
          movie.genre.toLowerCase().includes(searchTerm);
        
        // Oyuncu adında arama
        const actorMatch = movie.cast && Array.isArray(movie.cast) &&
          movie.cast.some(actor => 
            actor && actor.name && 
            actor.name.toLowerCase().includes(searchTerm)
          );
        
        return movieNameMatch || directorMatch || genreMatch || actorMatch;
      });
    } catch (error) {
      console.error('Search movies error:', error);
      return [];
    }
  },

  // Film detaylarını getir
  async getMovieDetails(movieId) {
    try {
      // Önce ID ile direkt endpoint'i dene
      try {
        const response = await api.get(`/movies/${movieId}`);
        if (response.data) {
          return response.data;
        }
      } catch (directError) {
        console.log('Direct movie endpoint failed, trying from all movies');
      }
      
      // Direkt endpoint çalışmazsa tüm filmlerden bul
      const movies = await this.getAllMovies();
      const movie = movies.find(m => m && m.id === movieId);
      return movie || null;
    } catch (error) {
      console.error('Movie details error:', error);
      return null;
    }
  },

  // Kullanıcının favori filmlerini getir
  async getUserFavorites(userId) {
    try {
      const response = await api.get(`/users/${userId}/favorites`);
      return response.data || [];
    } catch (error) {
      console.error('User favorites error:', error);
      return [];
    }
  },

  // Kullanıcının izleme listesini getir (şimdilik favorites kullanıyoruz)
  async getUserWatchlist(userId) {
    try {
      // Backend'de watchlist endpoint'i yok, favorites kullanıyoruz
      const response = await api.get(`/users/${userId}/favorites`);
      return response.data || [];
    } catch (error) {
      console.error('User watchlist error:', error);
      return [];
    }
  },

  // Filmi favorilere ekle
  async addToFavorites(userId, movieId) {
    try {
      console.log('Adding to favorites:', { userId, movieId });
      const response = await api.post(`/users/${userId}/favorites/${movieId}`);
      console.log('Add response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add to favorites error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  // Filmi favorilerden çıkar
  async removeFromFavorites(userId, movieId) {
    try {
      console.log('Removing from favorites:', { userId, movieId });
      const response = await api.delete(`/users/${userId}/favorites/${movieId}`);
      console.log('Remove response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Remove from favorites error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  // Filmi izleme listesine ekle (şimdilik favorites olarak kullanıyoruz)
  async addToWatchlist(userId, movieId) {
    try {
      // Backend'de watchlist endpoint'i yok, favorites kullanıyoruz
      // Aynı filmi hem favori hem izleme listesinde tutabiliriz
      const response = await api.post(`/users/${userId}/favorites/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Add to watchlist error:', error);
      throw error;
    }
  },

  // Filmi izleme listesinden çıkar (şimdilik favorites olarak kullanıyoruz)
  async removeFromWatchlist(userId, movieId) {
    try {
      // Backend'de watchlist endpoint'i yok, favorites kullanıyoruz
      // Bu durumda izleme listesinden çıkarmak için favorites'den de çıkarıyoruz
      const response = await api.delete(`/users/${userId}/favorites/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      throw error;
    }
  },

  // Tüm kategorileri getir
  async getCategories() {
    try {
      const movies = await this.getAllMovies();
      const genres = new Set();
      
      movies.forEach(movie => {
        if (movie && movie.genre) {
          // Genre string'ini virgülle ayır ve her birini ekle
          const movieGenres = movie.genre.split(',').map(g => g.trim());
          movieGenres.forEach(genre => {
            if (genre) genres.add(genre);
          });
        }
      });
      
      return Array.from(genres);
    } catch (error) {
      console.error('Categories error:', error);
      return [];
    }
  },

  // Yönetmenleri getir
  async getDirectors() {
    try {
      const movies = await this.getAllMovies();
      const directors = new Set();
      
      movies.forEach(movie => {
        if (movie && movie.producer && movie.producer.trim()) {
          // Producer field'ını yönetmen olarak kullan
          directors.add(movie.producer.trim());
        }
      });
      
      return Array.from(directors).sort();
    } catch (error) {
      console.error('Directors error:', error);
      return [];
    }
  },

  // Belirli bir yönetmenin filmlerini getir
  async getMoviesByDirector(directorName) {
    try {
      const movies = await this.getAllMovies();
      return movies.filter(movie => 
        movie && movie.producer && 
        movie.producer.toLowerCase().includes(directorName.toLowerCase())
      );
    } catch (error) {
      console.error('Movies by director error:', error);
      return [];
    }
  },

  // Oyuncuları getir
  async getActors() {
    try {
      const movies = await this.getAllMovies();
      const actors = new Set();
      
      movies.forEach(movie => {
        if (movie && movie.cast && Array.isArray(movie.cast)) {
          movie.cast.forEach(actor => {
            if (actor && actor.name && actor.name.trim()) {
              actors.add(actor.name.trim());
            }
          });
        }
      });
      
      return Array.from(actors).sort();
    } catch (error) {
      console.error('Actors error:', error);
      return [];
    }
  },

  // Belirli bir oyuncunun filmlerini getir
  async getMoviesByActor(actorName) {
    try {
      const movies = await this.getAllMovies();
      return movies.filter(movie => 
        movie && movie.cast && Array.isArray(movie.cast) &&
        movie.cast.some(actor => 
          actor && actor.name && 
          actor.name.toLowerCase().includes(actorName.toLowerCase())
        )
      );
    } catch (error) {
      console.error('Movies by actor error:', error);
      return [];
    }
  },

  // ---------- WATCHED (İZLENENLER) ----------
  
  // İzlendi olarak işaretle
  async addToWatched(userId, movieId) {
    try {
      console.log('Adding to watched:', { userId, movieId });
      const response = await api.post(`/users/${userId}/watched/${movieId}`);
      console.log('Add to watched response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add to watched error:', error);
      throw error;
    }
  },

  // İzlenen işaretini kaldır
  async removeFromWatched(userId, movieId) {
    try {
      console.log('Removing from watched:', { userId, movieId });
      const response = await api.delete(`/users/${userId}/watched/${movieId}`);
      console.log('Remove from watched response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Remove from watched error:', error);
      throw error;
    }
  },

  // Kullanıcının izledikleri listesi
  async getUserWatched(userId) {
    try {
      const response = await api.get(`/users/${userId}/watched`);
      return response.data || [];
    } catch (error) {
      console.error('User watched error:', error);
      return [];
    }
  },

  // Tek film izlenmiş mi?
  async isMovieWatched(userId, movieId) {
    try {
      const response = await api.get(`/users/${userId}/watched/${movieId}`);
      return response.data.watched || false;
    } catch (error) {
      console.error('Is movie watched error:', error);
      return false;
    }
  },

  // Toggle (buton için ideal)
  async toggleWatched(userId, movieId) {
    try {
      console.log('Toggling watched:', { userId, movieId });
      const response = await api.put(`/users/${userId}/watched/${movieId}/toggle`);
      console.log('Toggle watched response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Toggle watched error:', error);
      throw error;
    }
  },

  // ---------- REVIEWS (YORUMLAR) ----------
  
  // Bir filme ait yorumları getir
  async getMovieReviews(movieId) {
    try {
      const response = await api.get(`/movies/${movieId}/reviews`);
      return response.data || [];
    } catch (error) {
      console.error('Movie reviews error:', error);
      return [];
    }
  },

  // Filmin ortalama puanı ve yorum sayısı
  async getMovieRating(movieId) {
    try {
      const response = await api.get(`/movies/${movieId}/rating`);
      return response.data || { movieId, average: 0, count: 0 };
    } catch (error) {
      console.error('Movie rating error:', error);
      return { movieId, average: 0, count: 0 };
    }
  },

  // Yorum & puan oluştur/güncelle
  async upsertReview(movieId, userId, reviewData) {
    try {
      console.log('Upserting review:', { movieId, userId, reviewData });
      const response = await api.post(`/movies/${movieId}/reviews/${userId}`, reviewData);
      console.log('Upsert review response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Upsert review error:', error);
      throw error;
    }
  },

  // Yorum sil
  async deleteReview(movieId, userId) {
    try {
      console.log('Deleting review:', { movieId, userId });
      const response = await api.delete(`/movies/${movieId}/reviews/${userId}`);
      console.log('Delete review response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  }
};

export default moviesService;