import { Request, Response } from 'express';
import { Database } from 'sqlite';
import * as movieService from '../services/movieService';
import { buildResponse } from '../utils/helpers';

const OMDB_API_KEY = process.env.OMDB_API_KEY || "9614787b"; // Using my key for testing

export const listMovies = async (
  moviesDB: Database, 
  req: Request, 
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const movies = await movieService.getAllMovies(moviesDB, page);

    const totalMoviesRow = await moviesDB.get<{ count: number }>('SELECT COUNT(*) as count FROM movies');
    const total = totalMoviesRow?.count || movies.length;

    res.json(buildResponse(movies, 'Movies fetched successfully!', page, total));
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};


export const movieDetails = async (
  moviesDB: Database, 
  ratingsDB: Database, 
  req: Request, 
  res: Response
) => {
  try {
    const movieId = parseInt(req.params.movieId);
    const movie = await movieService.getMovieById(moviesDB, ratingsDB, movieId, OMDB_API_KEY);

    if (!movie)
      return res.status(404).json({ success: false, message: 'Movie not found', data: null });

    res.json(buildResponse(movie, 'Movie details fetched successfully'));
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};


export const listGenres = async (
  moviesDB: Database, 
  req: Request, 
  res: Response
) => {
  try {
    const genres = await movieService.getAllGenres(moviesDB);
    res.json(buildResponse(genres, 'Genres fetched successfully'));
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const moviesByYear = async (
  moviesDB: Database, 
  req: Request, 
  res: Response
) => {
  try {
    const year = parseInt(req.params.year);
    const page = parseInt(req.query.page as string) || 1;
    const desc = (req.query.sort as string) === 'desc';
    const movies = await movieService.getMoviesByYear(moviesDB, year, page, desc);

    const totalRow = await moviesDB.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM movies WHERE strftime('%Y', releaseDate) = ?`,
      [year.toString()]
    );
    const total = totalRow?.count || movies.length;
    const order = desc === false ? "ASCENDING" : "DESCENDING";

    res.json(buildResponse(movies, `Movies for year ${year}, sorted in ${order} order fetched successfully`, page, total));
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const moviesByGenreId = async (
  moviesDB: Database, 
  req: Request, 
  res: Response
) => {
  try {
    const genreId = parseInt(req.params.genreId);
    const page = parseInt(req.query.page as string) || 1;

    // Fetch movies by genre
    const movies = await movieService.getMoviesByGenreId(moviesDB, genreId, page);

    // Get total count of movies for this genre
    const totalRow = await moviesDB.get<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM movies
      WHERE EXISTS (
        SELECT 1
        FROM json_each(movies.genres)
        WHERE json_extract(value, '$.id') = ?
      )
      `,
      [genreId]
    );

    // Get genre name from one of the movies (or directly from DB query)
    const genreRow = await moviesDB.get<{ name: string }>(
      `
      SELECT json_extract(value, '$.name') as name
      FROM movies, json_each(movies.genres)
      WHERE json_extract(value, '$.id') = ?
      LIMIT 1
      `,
      [genreId]
    );

    const genreName = genreRow?.name || `Genre ${genreId}`;
    const total = totalRow?.count || movies.length;

    res.json(
      buildResponse(
        movies,
        `Movies for genre ${genreName} fetched successfully`,
        page,
        total
      )
    );
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
