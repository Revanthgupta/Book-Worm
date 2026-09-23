import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { removeFromCart, updateQuantity, upsertCartItemApi, removeCartItemApi } from './cartSlice';
import QuantityControl from '../../components/QuantityControl';
import type { CartItem } from './cartSlice';

interface CartItemCardProps {
  item: CartItem;
}

const CartItemCard = ({ item }: CartItemCardProps) => {
  const dispatch = useAppDispatch();
  const { book, quantity } = item;

  return (
    <div className="flex gap-4 p-4">
      {/* Cover image — large, matching screenshot */}
      <Link to={`/books/${book.id}`} className="shrink-0">
        <img
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          className="object-cover"
          style={{ width: '108px', height: '160px' }}
        />
      </Link>

      {/* Metadata */}
      <div className="flex flex-col min-w-0 flex-1">
        <Link
          to={`/books/${book.id}`}
          className="text-white font-semibold text-base hover:text-bw-accent transition-colors line-clamp-1"
        >
          {book.title}
        </Link>

        <p className="text-sm text-ink mt-0.5">
          by{' '}
          <span className="text-link underline hover:text-link-hover">
            {book.authorName}
          </span>
        </p>

        <p className="text-bw-muted text-xs mt-1 line-clamp-2 leading-relaxed">
          {book.synopsis}
        </p>

        <p className="text-bw-muted text-xs mt-1">{book.format}</p>

        {/* Category links */}
        <div className="flex flex-wrap gap-x-0.5 mt-1">
          {book.categories.slice(0, 2).map((cat, i) => (
            <span key={cat} className="text-xs text-link">
              {cat}{i < Math.min(book.categories.length, 2) - 1 ? ',' : ''}
            </span>
          ))}
        </div>

        <p className="text-white font-semibold text-lg mt-2">₹{book.price}</p>
        <p className="text-bw-muted text-xs">
          Delivery by <span className="font-semibold text-white">{book.deliveryDate}</span>
        </p>

        {/* Quantity control + remove */}
        <div className="flex items-center gap-4 mt-3">
          <QuantityControl
            quantity={quantity}
            onDecrease={() => {
              const newQty = quantity - 1;
              if (newQty < 1) return;
              dispatch(updateQuantity({ bookId: book.id, quantity: newQty }));
              dispatch(upsertCartItemApi({ isbn: book.id, quantity: newQty }));
            }}
            onIncrease={() => {
              const newQty = quantity + 1;
              dispatch(updateQuantity({ bookId: book.id, quantity: newQty }));
              dispatch(upsertCartItemApi({ isbn: book.id, quantity: newQty }));
            }}
          />
          <button
            onClick={() => {
              dispatch(removeFromCart(book.id));
              dispatch(removeCartItemApi(book.id));
            }}
            className="text-red-400 hover:text-red-300 text-xs transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
