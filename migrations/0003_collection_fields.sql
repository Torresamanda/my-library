-- Existing books remain unfavorited, with type and possession unspecified.
ALTER TABLE books ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0 CHECK (favorite IN (0, 1));
ALTER TABLE books ADD COLUMN media_type TEXT CHECK (media_type IS NULL OR media_type IN ('livro', 'quadrinho', 'manga', 'outro'));
ALTER TABLE books ADD COLUMN ownership_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(ownership_json) AND json_type(ownership_json) = 'array');
