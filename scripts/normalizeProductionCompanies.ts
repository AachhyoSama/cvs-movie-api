
const sqlite3 = require('sqlite3');
const { open: openSqlite } = require('sqlite');
const path = require('path');


async function openMoviesDB(mode = sqlite3.OPEN_READWRITE) {
  return openSqlite({
    filename: path.join(__dirname, '../movies_api/db/movies.db'),
    driver: sqlite3.Database,
    mode,
  });
}

async function runMigration() {
  const db = await openMoviesDB();

  // 1. Create production_companies table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS production_companies (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
  `);

  // 2. Create movie_production_company join table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS movie_production_company (
      movie_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      PRIMARY KEY (movie_id, company_id),
      FOREIGN KEY (movie_id) REFERENCES movies(id),
      FOREIGN KEY (company_id) REFERENCES production_companies(id)
    );
  `);

  // 3. Migrate data from movies.productionCompanies
  const movies = await db.all('SELECT movieId, productionCompanies FROM movies');

  for (const movie of movies) {
    if (!movie.productionCompanies) continue;
    let companies;
    try {
      companies = JSON.parse(movie.productionCompanies);
    } catch {
      continue;
    }
    for (const company of companies) {
      // Insert company if not exists (using provided id and name)
      await db.run(
        'INSERT OR IGNORE INTO production_companies (id, name) VALUES (?, ?)',
        [company.id, company.name]
      );
      // Insert into join table
      await db.run(
        'INSERT OR IGNORE INTO movie_production_company (movie_id, company_id) VALUES (?, ?)',
        [movie.movieId, company.id]
      );
    }
  }

  await db.close();
  console.log('Migration complete!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
});
