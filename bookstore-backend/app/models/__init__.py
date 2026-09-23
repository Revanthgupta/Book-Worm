# Import all models here so that:
# 1. Alembic autogenerate can discover every table via Base.metadata
# 2. SQLAlchemy relationship resolution works at startup
from app.models.user import User  # noqa: F401
from app.models.author import Author  # noqa: F401
from app.models.book import Book  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.book_category import BookCategory  # noqa: F401
from app.models.coupon import Coupon  # noqa: F401
from app.models.cart import Cart  # noqa: F401
from app.models.cart_item import CartItem  # noqa: F401
from app.models.address import Address  # noqa: F401
from app.models.wishlist import Wishlist  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.order import Order  # noqa: F401
from app.models.order_item import OrderItem  # noqa: F401
from app.models.payment import Payment  # noqa: F401
from app.models.gift_point_ledger import GiftPointLedger  # noqa: F401
from app.models.followed_author import FollowedAuthor  # noqa: F401

__all__ = [
    "User", "Author", "Book", "Category", "BookCategory",
    "Coupon", "Cart", "CartItem", "Address", "Wishlist",
    "Review", "Order", "OrderItem", "Payment",
    "GiftPointLedger", "FollowedAuthor",
]
