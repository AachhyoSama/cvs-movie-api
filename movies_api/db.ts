import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export const openMoviesDB = async () => {
  return open({
    filename: path.join(__dirname, './db/movies.db'),
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });
};

export const openRatingsDB = async () => {
  return open({
    filename: path.join(__dirname, './db/ratings.db'),
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });
};
