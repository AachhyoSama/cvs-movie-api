import { Request, Response } from 'express';
import { Database } from 'sqlite';
import * as movieService from '../services/movieService';
import { buildResponse } from '../utils/helpers';

const OMDB_API_KEY = process.env.OMDB_API_KEY || '9614787b'; // Using my key for testing

export const listMovies = async (moviesDB: Database, req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const movies = await movieService.getAllMovies(moviesDB, page);

    const totalMoviesRow = await moviesDB.get<{ count: number }>('SELECT COUNT(*) as count FROM movies');
    const total = totalMoviesRow?.count || movies.length;

    res.json(buildResponse(movies, 'Movies fetched successfully', page, total));
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const movieDetails = async (moviesDB: Database, ratingsDB: Database, req: Request, res: Response) => {
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


export const listGenres = async (moviesDB: Database, req: Request, res: Response) => {
  try {
    const genres = await movieService.getAllGenres(moviesDB);
    res.json(buildResponse(genres, 'Genres fetched successfully'));
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const moviesByYear = async (moviesDB: Database, req: Request, res: Response) => {
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

    res.json(buildResponse(movies, `Movies for year ${year} fetched successfully`, page, total));
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const moviesByGenre = async (moviesDB: Database, req: Request, res: Response) => {
  try {
    const genreId = parseInt(req.params.genreId);
    const page = parseInt(req.query.page as string) || 1;
    const movies = await movieService.getMoviesByGenre(moviesDB, genreId, page);

    const totalRow = await moviesDB.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM movies WHERE genres LIKE ?`,
      [`%${genreId}%`]
    );
    const total = totalRow?.count || movies.length;

    res.json(buildResponse(movies, `Movies for genre ${genreId} fetched successfully`, page, total));
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
