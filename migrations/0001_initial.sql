-- One row per edition; ISBN-13 is normalized before persistence.
CREATE TABLE books (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  author TEXT NOT NULL CHECK (length(trim(author)) > 0),
  isbn TEXT UNIQUE CHECK (isbn IS NULL OR (length(isbn) = 13 AND isbn NOT GLOB '*[^0-9]*')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (typeof(quantity) = 'integer' AND quantity > 0),
  status TEXT NOT NULL DEFAULT 'nao_lido' CHECK (status IN ('nao_lido', 'lendo', 'concluido', 'abandonado')),
  series_name TEXT,
  series_volume INTEGER CHECK (series_volume IS NULL OR (typeof(series_volume) = 'integer' AND series_volume > 0)),
  cover_url TEXT,
  rating INTEGER CHECK (rating IS NULL OR (typeof(rating) = 'integer' AND rating BETWEEN 1 AND 5)),
  review_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE genres (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(trim(name)) > 0)
);

CREATE TABLE book_genres (
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  genre_id TEXT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);
CREATE INDEX books_series_idx ON books(series_name, series_volume);
CREATE INDEX book_genres_genre_idx ON book_genres(genre_id);


