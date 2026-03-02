-- Cinema Roll - Supabase Schema
-- Run this SQL in your Supabase SQL Editor to set up the database from scratch.
-- For an existing installation, see the migration comment at the bottom.

-- ─────────────────────────────────────────────
-- 1. movies table
-- ─────────────────────────────────────────────
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_movies_list_type ON movies(list_type);
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX idx_movies_user_id ON movies(user_id);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own movies"
  ON movies FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own movies"
  ON movies FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own movies"
  ON movies FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own movies"
  ON movies FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 2. profiles table
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ─────────────────────────────────────────────
-- 3. Auto-create profile on signup
--    (email prefix becomes display name)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─────────────────────────────────────────────
-- Migration: adding auth to an existing install
-- ─────────────────────────────────────────────
-- If you already have a movies table, run this instead of creating from scratch:
--
-- ALTER TABLE movies
--   ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- CREATE INDEX idx_movies_user_id ON movies(user_id);
-- DROP POLICY IF EXISTS "Allow all operations" ON movies;
-- (then add the four user-scoped policies above)
--
-- After signing up, claim your existing rows:
-- UPDATE movies SET user_id = '<your-uuid-here>' WHERE user_id IS NULL;
