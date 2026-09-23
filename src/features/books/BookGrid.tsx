import BookCard from '../../components/BookCard';
import type { Book } from '../../types/book';

interface BookGridProps {
  books: Book[];
  emptyMessage?: string;
}

const BookGrid = ({ books, emptyMessage = 'No books found.' }: BookGridProps) => {
  if (books.length === 0) {
    return (
      <p className="text-ink-soft text-sm py-4">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BookGrid;
