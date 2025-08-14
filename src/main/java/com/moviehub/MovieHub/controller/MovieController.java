package com.moviehub.MovieHub.controller;


import com.moviehub.MovieHub.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("movies")
@CrossOrigin(origins = "http://localhost:5500")
public class MovieController {
    @Autowired
    private MovieService movieService;


}
