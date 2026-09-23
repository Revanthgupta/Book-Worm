# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Commands

### Frontend (Root)
```bash
npm run dev           # Vite dev server (http://localhost:5173)
npm run build         # Production typecheck + build (`tsc -b && vite build`)
npm run lint          # oxlint (`.oxlintrc.json`)
npx tsc -b --noEmit   # Standalone TypeScript check
```

### Backend (`bookstore-backend/`)
```bash
# Activate venv: .venv\Scripts\activate (Windows) or source .venv/bin/activate (Unix)
pytest -v                                        # Run all backend tests
pytest tests/test_auth.py -v                     # Run single test file
pytest tests/test_auth.py::test_login_success -v # Run single test method
pytest --cov=app --cov-report=term-missing       # Coverage report
uvicorn app.main:app --reload                    # Run FastAPI server (http://localhost:8000)
alembic upgrade head                             # Run migrations
python -m seed.seed                              # Seed demo data
```

## Non-Obvious Code Style & Conventions

- **Frontend Storage**: Never invoke browser `localStorage` directly in components or slices. All persistence must go through `src/storage/storageService.ts` using `STORAGE_KEYS` constants (`bw_*` prefix) from `src/storage/storageKeys.ts`.
- **TypeScript Import Mode**: `tsconfig.app.json` has `verbatimModuleSyntax: true` and `erasableSyntaxOnly: true`. Type imports must explicitly use `import type { ... }` or `import { type ... }`.
- **Axios Client**: `src/services/axiosClient.ts` reads `VITE_API_BASE_URL` (defaults to `/api`), auto-injects bearer token from `bw_user`, and clears all `bw_*` storage on 401 (excluding `/auth/me`).
- **Feature Structure**: Place domain logic inside `src/features/<feature>/` (e.g. `booksService.ts`, `*Slice.ts`). Only promote components to `src/components/` if reused across 2+ features.
- **Single Source of Tokens**: Color tokens follow the dark design palette (`#111827`, `#1f2937`, `#374151`, `#3b82f6`, `#60a5fa`).
- **Backend Error Handling**: Use standard `HTTPException` with explicit status codes. `payment_service.simulate()` fails deterministically with `402` only if credit card ends in `0000`.
- **Order Cancellation**: 48-hour cancellation boundary is calculated as `Date.now() < order.createdAt + 48 * 60 * 60 * 1000` and scoped by `userId`.
