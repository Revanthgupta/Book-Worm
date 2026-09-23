import axiosClient from '../../services/axiosClient';
import type { Book } from '../../types/book';

/**
 * Books API service — wraps all /api/books endpoints.
 */

interface ApiBookResponse {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  publisher: string;
  format: Book['format'];
  categories: Book['categories'];
  price: number;
  cover_image: string;
  synopsis: string;
  back_cover_text: string;
  language: Book['language'];
  rating: number;
  sells: number;
  delivery_date: string;
  featured?: boolean;
  bestseller?: boolean;
  new_launch?: boolean;
}

function mapBook(b: ApiBookResponse): Book {
  return {
    id: b.id,
    title: b.title,
    authorId: b.author_id,
    authorName: b.author_name,
    publisher: b.publisher,
    format: b.format,
    categories: b.categories,
    price: b.price,
    coverImage: b.cover_image,
    synopsis: b.synopsis,
    backCoverText: b.back_cover_text,
    language: b.language,
    rating: b.rating,
    sells: b.sells,
    deliveryDate: b.delivery_date,
    isbn: b.id,
    featured: b.featured,
    bestseller: b.bestseller,
    newLaunch: b.new_launch,
  };
}

export async function fetchAllBooks(): Promise<Book[]> {
  const res = await axiosClient.get<{ items: ApiBookResponse[]; total: number }>(
    '/books',
    { params: { page_size: 100 } },
  );
  return res.data.items.map(mapBook);
}

export async function fetchBookById(isbn: string): Promise<Book | null> {
  try {
    const res = await axiosClient.get<ApiBookResponse>(`/books/${isbn}`);
    return mapBook(res.data);
  } catch {
    return null;
  }
}

export async function fetchRelatedBooks(isbn: string): Promise<Book[]> {
  try {
    const res = await axiosClient.get<ApiBookResponse[]>(`/books/${isbn}/related`);
    return res.data.map(mapBook);
  } catch {
    return [];
  }
}

export async function fetchFeaturedBooks(): Promise<Book[]> {
  const res = await axiosClient.get<ApiBookResponse[]>('/books/featured');
  return res.data.map(mapBook);
}

export async function fetchBestsellers(): Promise<Book[]> {
  const res = await axiosClient.get<ApiBookResponse[]>('/books/bestsellers');
  return res.data.map(mapBook);
}

export async function fetchNewLaunches(): Promise<Book[]> {
  const res = await axiosClient.get<ApiBookResponse[]>('/books/new-launches');
  return res.data.map(mapBook);
}
