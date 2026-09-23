import { useAppSelector } from '../store/hooks';
import CategorySidebar, { MobileCategoryDrawer } from '../features/books/CategorySidebar';
import SearchBar from '../features/books/SearchBar';
import FilterBar from '../features/books/FilterBar';
import BookGrid from '../features/books/BookGrid';
import {
  selectRecommendedBooks,
  selectBestsellers,
  selectNewLaunches,
  selectFilteredBooks,
} from '../features/books/booksSlice';
import { selectOrdersByUser } from '../features/orders/ordersSlice';
import type { Category } from '../types/book';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <section className="mb-8">
    <h2 className="text-xl font-normal text-ink mb-4">{title}</h2>
    {children}
  </section>
);

const HomePage = () => {
  const userId = useAppSelector((s) => s.auth.user?.id ?? '');
  const userOrders = useAppSelector(selectOrdersByUser(userId));

  // Collect unique categories from the user's order history for personalised recommendations
  const orderedCategories: Category[] = [
    ...new Set(
      userOrders.flatMap((o) => (o.items ?? []).flatMap((i) => i.book.categories)),
    ),
  ];

  const recommended = useAppSelector((state) =>
    selectRecommendedBooks(state, orderedCategories.length > 0 ? orderedCategories : undefined),
  );
  const bestsellers = useAppSelector(selectBestsellers);
  const newLaunches = useAppSelector(selectNewLaunches);
  const allFiltered = useAppSelector(selectFilteredBooks);

  const selectedCategory = useAppSelector((s) => s.books.selectedCategory);
  const searchQuery = useAppSelector((s) => s.books.searchQuery);
  const isFiltering =
    selectedCategory !== 'All' || searchQuery.trim() !== '';

  return (
    <div className="flex min-h-screen bg-page">
      {/* Left sidebar — desktop only (md+) */}
      <CategorySidebar />

      {/* Main content */}
      <div className="flex-1 min-w-0 px-5 pt-5">
        {/* Mobile category drawer — below lg only */}
        <div className="lg:hidden mb-3">
          <MobileCategoryDrawer />
        </div>

        {/* Filter row: Search + Language + Format + Price Range + Sort by */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-[1.6fr_repeat(4,1fr)] mb-6">
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <SearchBar />
          </div>
          <FilterBar />
        </div>

        {/* When filtering: show one flat result list */}
        {isFiltering ? (
          <Section title={`Results for "${searchQuery || selectedCategory}"`}>
            <BookGrid
              books={allFiltered}
              emptyMessage="No books match your search. Try adjusting the filters."
            />
          </Section>
        ) : (
          <>
            <Section title="Recommended for You">
              <BookGrid
                books={recommended}
                emptyMessage="No recommendations yet."
              />
            </Section>

            <Section title="Bestsellers this Month">
              <BookGrid
                books={bestsellers}
                emptyMessage="No bestsellers available."
              />
            </Section>

            <Section title="New Launches">
              <BookGrid
                books={newLaunches}
                emptyMessage="No new launches available."
              />
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
