export type BookFormat = 'Paperback' | 'Hard Cover' | 'eBook';

export type BookLanguage = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada';

export type Category =
  | 'All'
  | 'Romance'
  | 'Mystery'
  | 'Science Fiction'
  | 'Fantasy'
  | 'Historical'
  | 'Biography'
  | 'Self Help'
  | 'Memoir'
  | 'Travel'
  | 'Cooking'
  | "Children's"
  | 'Young Adult'
  | 'Comics & Graphic Novels'
  | 'Poetry'
  | 'Drama'
  | 'Science'
  | 'Philosophy'
  | 'Religion'
  | 'Language Learning'
  | 'Non-fiction'
  | 'Fiction'
  | 'Thriller'
  | 'Horror'
  | 'Love'
  | 'Business';

export interface Author {
  id: string;
  name: string;
  photo: string;
  bio: string;
}

export interface Book {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  publisher: string;
  format: BookFormat;
  categories: Category[];
  price: number;
  coverImage: string;
  /** Optional real cover photo URL; falls back to coverImage (generated placeholder) */
  coverUrl?: string;
  /** Optional real back cover photo URL; falls back to backCoverText panel */
  backCoverUrl?: string;
  synopsis: string;
  backCoverText: string;
  language: BookLanguage;
  rating: number;       // 1–5
  sells: number;
  deliveryDate: string; // e.g. "Mon, 21 Jul"
  isbn: string;
  featured?: boolean;   // appears in "Recommended for You"
  bestseller?: boolean; // appears in "Bestsellers this Month"
  newLaunch?: boolean;  // appears in "New Launches"
}

export interface BooksFilters {
  language: BookLanguage | 'All';
  format: BookFormat | 'All';
  priceRange: 'All' | 'Under ₹200' | '₹200–₹400' | 'Above ₹400';
  sortBy: 'Relevance' | 'Price: Low to High' | 'Price: High to Low' | 'Rating';
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number; // 1–5
  text: string;
  createdAt: number; // Date.now()
}
