import { Book } from './book';

export interface Author {
  author_id: number;
  name: string;
  nationality?: string;
  birth_year?: number;
  death_year?: number;
  bio?: string;
  quote?: string;
  image_url?: string;
  website?: string;
  book_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthorWithBooks extends Author {
  books: Book[];
}
