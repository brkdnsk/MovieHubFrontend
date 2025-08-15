package com.moviehub.MovieHub.controller;


import com.moviehub.MovieHub.domain.Movie;
import com.moviehub.MovieHub.service.MovieService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @PostMapping
    public ResponseEntity<Map<String, String>> createMovie(@Valid @RequestBody Movie movie) {
        movieService.createNewMovie(movie);
        Map<String, String> map = new HashMap<>();
        map.put("message", "Film basariyla eklendi");
        map.put("status", "true");
        return new ResponseEntity<>(map, HttpStatus.CREATED);
    }

    @PostMapping("/movies")
    public ResponseEntity<Map<String, String>> createMovies(@Valid @RequestBody List<Movie> movie) {
        movieService.createNewMovie(movies);
        Map<String, String> map = new HashMap<>();
        map.put("message", "Filmler basariyla eklendi");
        map.put("status", "true");
        //HttpStatus Code = 201
        return new ResponseEntity<>(map, HttpStatus.CREATED);
    }
}
