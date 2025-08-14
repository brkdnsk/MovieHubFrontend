package com.moviehub.MovieHub.controller;


import com.moviehub.MovieHub.domain.Movie;
import com.moviehub.MovieHub.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("movies")
@CrossOrigin(origins = "http://localhost:5500")
public class MovieController {


    @Autowired
    private MovieService movieService;

    @GetMapping
    public ResponseEntity<List<Movie>> ListAllMovies(){

        List<Movie> movies=movieService.getAllMoives();

        return ResponseEntity.ok(movies);
        //new ResponseEntity(movies, HttpStatus.ACCEPTED);
    }

}
