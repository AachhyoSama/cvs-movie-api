import express, { Request, Response } from 'express';
import { openMoviesDB, openRatingsDB } from './db';
import { createMovieRoutes } from './routes/movieRoutes';

const PORT = process.env.PORT || 3000;

(async () => {
  const moviesDB = await openMoviesDB();
  const ratingsDB = await openRatingsDB();

  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send("Welcome to the Movie API!")
  })
  
  app.use('/movies', createMovieRoutes(moviesDB, ratingsDB));

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
