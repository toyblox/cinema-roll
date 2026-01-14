-- Run this SQL in your Supabase SQL Editor to create the movies table

CREATE TABLE movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  release_date TEXT,
  overview TEXT,
  vote_average DECIMAL(3,1),
  list_type TEXT NOT NULL CHECK (list_type IN ('to_watch', 'watched')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_movies_list_type ON movies(list_type);
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (since we're not using auth)
CREATE POLICY "Allow all operations" ON movies
  FOR ALL
  USING (true)
  WITH CHECK (true);
