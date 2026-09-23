import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import auth as auth_router
from app.routers import books as books_router
from app.routers import authors as authors_router
from app.routers import categories as categories_router
from app.routers import cart as cart_router
from app.routers import addresses as addresses_router
from app.routers import wishlist as wishlist_router
from app.routers import checkout as checkout_router
from app.routers import orders as orders_router
from app.routers import gift_points as gift_points_router
from app.routers import followed_authors as followed_authors_router

logger = logging.getLogger(__name__)

app = FastAPI(title="Book Worm API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception for %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred."},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(books_router.router)
# NOTE: followed_authors must be registered BEFORE authors so that
# GET /api/authors/followed is not shadowed by GET /api/authors/{author_id}
app.include_router(followed_authors_router.router)
app.include_router(authors_router.router)
app.include_router(categories_router.router)
app.include_router(cart_router.router)
app.include_router(addresses_router.router)
app.include_router(wishlist_router.router)
app.include_router(checkout_router.router)
app.include_router(orders_router.router)
app.include_router(gift_points_router.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}
