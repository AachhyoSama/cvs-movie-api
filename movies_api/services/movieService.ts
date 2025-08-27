import { Database } from 'sqlite';
import axios from 'axios';
import { Movie, Rating, MovieDetailsResponse, Genre, ProductionCompany } from '../types/movie';
import { parseJSON, formatBudget, paginate } from '../utils/helpers';

// Return only required fields for list endpoints
const mapMovieForList = (row: Movie) => ({
  movieId: row.movieId,
  imdbId: row.imdbId,
  title: row.title,
  genres: parseJSON<Genre[]>(typeof row.genres === 'string' ? row.genres : JSON.stringify(row.genres)),
  releaseDate: row.releaseDate,
  budget: row.budget,
  budgetFormatted: formatBudget(row.budget),
});

export const getAllMovies = async (db: Database, page: number = 1): Promise<any[]> => {
  try {
    const { offset, limit } = paginate(page);
    const rows = await db.all<Movie[]>(`SELECT * FROM movies LIMIT ? OFFSET ?`, [limit, offset]);
    return rows.map(mapMovieForList);
  } catch (err) {
    console.error('Error fetching movies:', err);
    throw new Error('Failed to fetch movies');
  }
};

export const getMovieById = async (
  db: Database,
  ratingsDB: Database,
  movieId: number,
  omdbKey: string
): Promise<MovieDetailsResponse | null> => {
  try {
    const row = await db.get<Movie>(`SELECT * FROM movies WHERE movieId = ?`, [movieId]);
    if (!row) return null;

    // Get ratings
    const averageRating = await getAverageRating(ratingsDB, movieId);
    const rottenRating = await getRottenTomatoesRating(row.imdbId, omdbKey);

    return {
      ...row,
      genres: parseJSON<Genre[]>(typeof row.genres === 'string' ? row.genres : JSON.stringify(row.genres)),
      productionCompanies: parseJSON<ProductionCompany[]>(typeof row.productionCompanies === 'string' ? row.productionCompanies : JSON.stringify(row.productionCompanies)),
      budgetFormatted: formatBudget(row.budget),
      ratings: [
        { source: 'User Ratings', value: averageRating },
        { source: 'Rotten Tomatoes', value: rottenRating }
      ],
    };
  } catch (err) {
    console.error(`Error fetching movie ${movieId}:`, err);
    throw new Error('Failed to fetch movie');
  }
};


export const getAverageRating = async (ratingsDB: Database, movieId: number): Promise<number | null> => {
  try {
    const ratings = await ratingsDB.all<Rating[]>(`SELECT rating FROM ratings WHERE movieId = ?`, [movieId]);
    if (!ratings.length) return null;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / ratings.length).toFixed(2));
  } catch (err) {
    console.error(`Error fetching ratings for movie ${movieId}:`, err);
    return null;
  }
};

export const getRottenTomatoesRating = async (imdbId: string, omdbKey: string): Promise<string | null> => {
  try {
    const res = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=${omdbKey}`);
    const ratingObj = res.data.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
    return ratingObj ? ratingObj.Value : null;
  } catch (err) {
    console.error(`OMDb API error for movie ${imdbId}:`, err);
    return null;
  }
};

export const getAllGenres = async (db: Database): Promise<Genre[]> => {
  const rows = await db.all<Movie[]>(`SELECT * FROM movies`);
  const genreMap: { [key: number]: Genre } = {};
  rows.forEach(row => {
    parseJSON<Genre[]>(typeof row.genres === 'string' ? row.genres : JSON.stringify(row.genres)).forEach(g => {
      genreMap[g.id] = g;
    });
  });
  return Object.values(genreMap);
};

export const getMoviesByYear = async (db: Database, year: number, page: number = 1, desc: boolean = false): Promise<any[]> => {
  const { offset, limit } = paginate(page);
  const sortOrder = desc ? 'DESC' : 'ASC';
  const rows = await db.all<Movie[]>(
    `SELECT * FROM movies WHERE strftime('%Y', releaseDate) = ? ORDER BY releaseDate ${sortOrder} LIMIT ? OFFSET ?`,
    [year.toString(), limit, offset]
  );
  return rows.map(mapMovieForList);
};

export const getMoviesByGenre = async (db: Database, genreId: number, page: number = 1): Promise<any[]> => {
  const { offset, limit } = paginate(page);
  const rows = await db.all<Movie[]>(`SELECT * FROM movies WHERE genres LIKE ? LIMIT ? OFFSET ?`, [`%${genreId}%`, limit, offset]);
  return rows.map(mapMovieForList);
};
