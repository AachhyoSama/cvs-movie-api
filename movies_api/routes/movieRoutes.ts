import { Router, Request, Response } from 'express';
import * as movieController from '../controllers/movieController';
import { Database } from 'sqlite';

export const createMovieRoutes = (moviesDB: Database, ratingsDB: Database) => {
  const router = Router();

  router.get('/all', (req, res) => movieController.listMovies(moviesDB, req, res));
  router.get('/year/:year', (req, res) => movieController.moviesByYear(moviesDB, req, res));
  router.get('/genre/:genreId', (req, res) => movieController.moviesByGenre(moviesDB, req, res));
  router.get('/genres/all', (req, res) => movieController.listGenres(moviesDB, req, res));
  router.get('/:movieId', async (req: Request, res: Response) => {
    await movieController.movieDetails(moviesDB, ratingsDB, req, res);
  });

  return router;
};
