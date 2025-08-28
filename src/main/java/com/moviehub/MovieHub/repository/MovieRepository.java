package com.moviehub.MovieHub.repository;

import com.moviehub.MovieHub.domain.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, Long> {
}
