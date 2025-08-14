package com.moviehub.MovieHub.service;


import com.moviehub.MovieHub.domain.Movie;
import com.moviehub.MovieHub.repository.MovieRepository;
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
}
