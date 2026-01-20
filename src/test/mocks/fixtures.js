// Sample movie data for tests

export const mockMovies = {
  // TMDB search result format
  searchResults: [
    {
      id: 550,
      title: 'Fight Club',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      release_date: '1999-10-15',
      overview: 'A depressed man suffering from insomnia meets a strange soap salesman.',
      vote_average: 8.4,
    },
    {
      id: 680,
      title: 'Pulp Fiction',
      poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      release_date: '1994-09-10',
      overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine.',
      vote_average: 8.5,
    },
  ],

  // Supabase movie format (what's stored in DB)
  toWatchList: [
    {
      id: 'uuid-1',
      tmdb_id: 550,
      title: 'Fight Club',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      release_date: '1999-10-15',
      vote_average: 8.4,
      list_type: 'to_watch',
      rating: null,
    },
  ],

  watchedList: [
    {
      id: 'uuid-2',
      tmdb_id: 680,
      title: 'Pulp Fiction',
      poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      release_date: '1994-09-10',
      vote_average: 8.5,
      list_type: 'watched',
      rating: 5,
    },
  ],
}
