package com.moviehub.MovieHub.domain;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;

    @NotBlank(message="Film Adı Boş Olamaz!")
    @Size(min= 2, max= 50 , message = "Film adı '${validatedValue}' {min} ve {max} aralığında olmalı!")
    @Column(nullable = false, length = 50)
    private String movieName;

    @NotBlank(message="Film Açıklaması Boş Olamaz!")
    @Size(min= 2, max= 300 , message = "Film açıklaması '${validatedValue}' {min} ve {max} aralığında olmalı!")
    @Column(nullable = false, length = 300)
    private String description;

    @NotBlank(message="Film Yılı Boş Olamaz!")
    @Size(min= 2, max= 25 , message = "Film yılı '${validatedValue}' {min} ve {max} aralığında olmalı!")
    @Column(nullable = false, length = 50)
    private String releaseYear;


    private Double imdbRating;

    @NotBlank(message="Film Yapımcısı Boş Olamaz!")
    @Size(min= 2, max= 25 , message = "Film yapımcısı '${validatedValue}' {min} ve {max} aralığında olmalı!")
    @Column(nullable = false, length = 25)
    private String producer;

    @NotBlank(message="Film Türü Boş Olamaz!")
    @Size(min= 2, max= 30 , message = "Film türü '${validatedValue}' {min} ve {max} aralığında olmalı!")
    @Column(nullable = false, length = 30)
    private String genre;
}
