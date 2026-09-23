"""initial_schema

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(40), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("gift_points", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("gift_points >= 0", name="ck_users_gift_points_non_negative"),
    )

    # ── authors ───────────────────────────────────────────────────────────────
    op.create_table(
        "authors",
        sa.Column("id", sa.String(10), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("photo", sa.Text),
        sa.Column("bio", sa.Text),
    )

    # ── books ─────────────────────────────────────────────────────────────────
    op.create_table(
        "books",
        sa.Column("id", sa.String(25), primary_key=True),  # ISBN
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("author_id", sa.String(10), sa.ForeignKey("authors.id"), nullable=False),
        sa.Column("publisher", sa.String(200)),
        sa.Column("format", sa.String(20)),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("cover_image", sa.Text),
        sa.Column("synopsis", sa.Text),
        sa.Column("back_cover_text", sa.Text),
        sa.Column("language", sa.String(30)),
        sa.Column("rating", sa.Numeric(3, 2)),
        sa.Column("sells", sa.Integer, server_default="0"),
        sa.Column("featured", sa.Boolean, server_default="false"),
        sa.Column("bestseller", sa.Boolean, server_default="false"),
        sa.Column("new_launch", sa.Boolean, server_default="false"),
        sa.CheckConstraint("format IN ('Paperback', 'Hard Cover', 'eBook')", name="ck_books_format"),
        sa.CheckConstraint("rating >= 1.0 AND rating <= 5.0", name="ck_books_rating"),
    )

    # ── categories ────────────────────────────────────────────────────────────
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
    )

    # ── book_categories ───────────────────────────────────────────────────────
    op.create_table(
        "book_categories",
        sa.Column("book_id", sa.String(25), sa.ForeignKey("books.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("category_id", sa.Integer, sa.ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
    )

    # ── coupons ───────────────────────────────────────────────────────────────
    op.create_table(
        "coupons",
        sa.Column("code", sa.String(20), primary_key=True),
        sa.Column("discount_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
    )

    # ── carts ─────────────────────────────────────────────────────────────────
    op.create_table(
        "carts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(40), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("coupon_code", sa.String(20), sa.ForeignKey("coupons.code"), nullable=True),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # ── cart_items ────────────────────────────────────────────────────────────
    op.create_table(
        "cart_items",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("cart_id", sa.String(36), sa.ForeignKey("carts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("book_id", sa.String(25), sa.ForeignKey("books.id"), nullable=False),
        sa.Column("quantity", sa.Integer, nullable=False),
        sa.CheckConstraint("quantity >= 1", name="ck_cart_items_quantity"),
        sa.UniqueConstraint("cart_id", "book_id", name="uq_cart_items_cart_book"),
    )

    # ── addresses ─────────────────────────────────────────────────────────────
    op.create_table(
        "addresses",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(40), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("address_line", sa.String(500), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("pin", sa.String(6), nullable=False),
        sa.Column("phone_country_code", sa.String(10), nullable=False, server_default="'+91'"),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("state", sa.String(100), nullable=False),
        sa.Column("country", sa.String(100), nullable=False, server_default="'India'"),
        sa.Column("is_default", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # ── wishlists ─────────────────────────────────────────────────────────────
    op.create_table(
        "wishlists",
        sa.Column("user_id", sa.String(40), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("book_id", sa.String(25), sa.ForeignKey("books.id"), primary_key=True),
        sa.Column("added_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # ── reviews ───────────────────────────────────────────────────────────────
    op.create_table(
        "reviews",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("book_id", sa.String(25), sa.ForeignKey("books.id"), nullable=False),
        sa.Column("user_id", sa.String(40), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("rating", sa.SmallInteger, nullable=False),
        sa.Column("text", sa.String(100), nullable=False),
        sa.Column("user_name", sa.String(200), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating"),
        sa.CheckConstraint("length(trim(text)) >= 1", name="ck_reviews_text_nonempty"),
        sa.UniqueConstraint("user_id", "book_id", name="uq_reviews_user_book"),
    )

    # ── orders ────────────────────────────────────────────────────────────────
    op.create_table(
        "orders",
        sa.Column("id", sa.String(30), primary_key=True),  # ORD-{unix_ms}
        sa.Column("user_id", sa.String(40), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("tax", sa.Numeric(10, 2), nullable=False),
        sa.Column("discount", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("redeemed_points_amount", sa.Integer, nullable=False, server_default="0"),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="'Processing'"),
        sa.Column("payment_method", sa.String(20), nullable=False),
        sa.Column("coupon_code", sa.String(20), nullable=True),
        sa.Column("address_id", sa.String(36), sa.ForeignKey("addresses.id"), nullable=True),
        sa.Column("delivery_date", sa.Date, nullable=False),
        sa.Column("points_awarded", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint(
            "status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')",
            name="ck_orders_status",
        ),
    )

    # ── order_items ───────────────────────────────────────────────────────────
    op.create_table(
        "order_items",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("order_id", sa.String(30), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("book_id", sa.String(25), sa.ForeignKey("books.id"), nullable=True),
        sa.Column("book_title", sa.String(300), nullable=False),
        sa.Column("author_name", sa.String(200), nullable=False),
        sa.Column("price_at_purchase", sa.Numeric(10, 2), nullable=False),
        sa.Column("quantity", sa.Integer, nullable=False),
        sa.Column("format", sa.String(20), nullable=False),
        sa.Column("cover_image", sa.Text),
        sa.Column("delivery_date", sa.String(20), nullable=False),
        sa.CheckConstraint("quantity >= 1", name="ck_order_items_quantity"),
    )

    # ── payments ──────────────────────────────────────────────────────────────
    op.create_table(
        "payments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("order_id", sa.String(30), sa.ForeignKey("orders.id"), nullable=False, unique=True),
        sa.Column("method", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("transaction_id", sa.String(50)),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("status IN ('success', 'failed')", name="ck_payments_status"),
    )

    # ── gift_point_ledger ─────────────────────────────────────────────────────
    op.create_table(
        "gift_point_ledger",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(40), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("amount", sa.Integer, nullable=False),
        sa.Column("reason", sa.String(50), nullable=False),
        sa.Column("order_id", sa.String(30), sa.ForeignKey("orders.id"), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # ── followed_authors ──────────────────────────────────────────────────────
    op.create_table(
        "followed_authors",
        sa.Column("user_id", sa.String(40), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("author_id", sa.String(10), sa.ForeignKey("authors.id"), primary_key=True),
        sa.Column("followed_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("followed_authors")
    op.drop_table("gift_point_ledger")
    op.drop_table("payments")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("reviews")
    op.drop_table("wishlists")
    op.drop_table("addresses")
    op.drop_table("cart_items")
    op.drop_table("carts")
    op.drop_table("coupons")
    op.drop_table("book_categories")
    op.drop_table("categories")
    op.drop_table("books")
    op.drop_table("authors")
    op.drop_table("users")
