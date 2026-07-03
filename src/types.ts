export type TitleType = 'movie' | 'tv' | 'anime';
export type WatchStatus = 'to-watch' | 'watched';

export interface Title {
  tmdbId: number;
  name: string;
  type: TitleType;
  posterUrl: string | null;
  genres: string[];
  releaseYear: number | null;
  overview: string;
}

export interface WatchlistItem {
  id?: string; // firestore doc id
  userId: string;
  tmdbId: number;
  status: WatchStatus;
  addedAt: number; // timestamp
  addedBy: string;
}

export interface Rating {
  id?: string; // firestore doc id
  userId: string;
  tmdbId: number;
  rating: number; // 0.5 to 5
  note?: string;
  ratedAt: number; // timestamp
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
