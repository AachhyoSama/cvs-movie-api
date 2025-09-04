import { Router, Request, Response } from 'express';
import * as movieController from '../controllers/movieController';
import { Database } from 'sqlite';

export const createMovieRoutes = (moviesDB: Database, ratingsDB: Database) => {
  const router = Router();

  // all movies
  router.get('/', (req, res) => movieController.listMovies(moviesDB, req, res)); 
  
  // single movie accessed by Id
  router.get('/:movieId', async (req: Request, res: Response) => {
    await movieController.movieDetails(moviesDB, ratingsDB, req, res);
  });

  // movies by year, can be sorted ASCENDING or DESCENDING
  router.get('/year/:year', (req, res) => movieController.moviesByYear(moviesDB, req, res));

  // movies by genre
  router.get('/genre/:genreId', (req, res) => movieController.moviesByGenreId(moviesDB, req, res));

  // all genres
  router.get('/genres', (req, res) => movieController.listGenres(moviesDB, req, res));


  return router;
};
