-- Add optional edition metadata without changing existing records.
ALTER TABLE books ADD COLUMN publisher TEXT CHECK (publisher IS NULL OR (length(trim(publisher)) BETWEEN 1 AND 250));
ALTER TABLE books ADD COLUMN page_count INTEGER CHECK (page_count IS NULL OR (typeof(page_count) = 'integer' AND page_count BETWEEN 1 AND 1000000));
