package com.moviehub.MovieHub.service;


import com.moviehub.MovieHub.domain.Movie;
import com.moviehub.MovieHub.exception.ResourceNotFoundException;
import com.moviehub.MovieHub.repository.MovieRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public List<Movie> getAllMoives() {
        return movieRepository.findAll();
    }

    public void createNewMovie(@Valid Movie movie) {
        movieRepository.save(movie);
    }

    public Movie findMovie(Long id) {
        return movieRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException(id + "numaralı film bulunamadı.."));
    }
}
