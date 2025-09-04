var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var sqlite3 = require('sqlite3');
var openSqlite = require('sqlite').open;
var path = require('path');
function openMoviesDB() {
    return __awaiter(this, arguments, void 0, function (mode) {
        if (mode === void 0) { mode = sqlite3.OPEN_READWRITE; }
        return __generator(this, function (_a) {
            return [2 /*return*/, openSqlite({
                    filename: path.join(__dirname, '../movies_api/db/movies.db'),
                    driver: sqlite3.Database,
                    mode: mode,
                })];
        });
    });
}
function runMigration() {
    return __awaiter(this, void 0, void 0, function () {
        var db, movies, _i, movies_1, movie, companies, _a, companies_1, company;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, openMoviesDB()];
                case 1:
                    db = _b.sent();
                    // 1. Create production_companies table
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS production_companies (\n      id INTEGER PRIMARY KEY,\n      name TEXT NOT NULL UNIQUE\n    );\n  ")];
                case 2:
                    // 1. Create production_companies table
                    _b.sent();
                    // 2. Create movie_production_company join table
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS movie_production_company (\n      movie_id INTEGER NOT NULL,\n      company_id INTEGER NOT NULL,\n      PRIMARY KEY (movie_id, company_id),\n      FOREIGN KEY (movie_id) REFERENCES movies(id),\n      FOREIGN KEY (company_id) REFERENCES production_companies(id)\n    );\n  ")];
                case 3:
                    // 2. Create movie_production_company join table
                    _b.sent();
                    return [4 /*yield*/, db.all('SELECT movieId, productionCompanies FROM movies')];
                case 4:
                    movies = _b.sent();
                    _i = 0, movies_1 = movies;
                    _b.label = 5;
                case 5:
                    if (!(_i < movies_1.length)) return [3 /*break*/, 11];
                    movie = movies_1[_i];
                    if (!movie.productionCompanies)
                        return [3 /*break*/, 10];
                    companies = void 0;
                    try {
                        companies = JSON.parse(movie.productionCompanies);
                    }
                    catch (_c) {
                        return [3 /*break*/, 10];
                    }
                    _a = 0, companies_1 = companies;
                    _b.label = 6;
                case 6:
                    if (!(_a < companies_1.length)) return [3 /*break*/, 10];
                    company = companies_1[_a];
                    // Insert company if not exists (using provided id and name)
                    return [4 /*yield*/, db.run('INSERT OR IGNORE INTO production_companies (id, name) VALUES (?, ?)', [company.id, company.name])];
                case 7:
                    // Insert company if not exists (using provided id and name)
                    _b.sent();
                    // Insert into join table
                    return [4 /*yield*/, db.run('INSERT OR IGNORE INTO movie_production_company (movie_id, company_id) VALUES (?, ?)', [movie.movieId, company.id])];
                case 8:
                    // Insert into join table
                    _b.sent();
                    _b.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 6];
                case 10:
                    _i++;
                    return [3 /*break*/, 5];
                case 11: return [4 /*yield*/, db.close()];
                case 12:
                    _b.sent();
                    console.log('Migration complete!');
                    return [2 /*return*/];
            }
        });
    });
}
runMigration().catch(function (err) {
    console.error('Migration failed:', err);
});
