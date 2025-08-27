export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
}

export interface Movie {
  movieId: number;
  imdbId: string;
  title: string;
  overview: string;
  productionCompanies: ProductionCompany[];
  releaseDate: string;
  budget: number;
  revenue: number;
  runtime: number;
  language: string | null;
  genres: Genre[];
  status: string;
}

export interface Rating {
  ratingId: number;
  userId: number;
  movieId: number;
  rating: number;
  timestamp: number;
}

export interface MovieDetailsResponse extends Movie {
  budgetFormatted?: string;
  ratings: { source: string; value: number | string | null }[];
}
