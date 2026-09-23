# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Documentation Context & Non-Obvious Structure

- **Brand & Naming**: The platform is branded as **Book Worm** in UI screens and stored storage keys (`bw_*`).
- **Full-Screen Checkout Pages**: `PaymentPage` and `ConfirmationPage` break the common layout and render within an isolated illustrated frame (`BookIllustrationBackground`), omitting standard header/footer chrome.
- **Embedded Address Workflow**: The delivery address form is embedded directly within `CartPage`, not hosted as a separate route.
- **Backend Layout**: Fast-API backend lives under `bookstore-backend/` with separate Python dependencies, migrations (`alembic/`), database seeds (`seed/seed.py`), and test suite (`tests/`).
- **Axios Stale Token Handling**: `src/services/axiosClient.ts` automatically purges all `bw_*` keys on 401 errors, avoiding retry loops on expired sessions (bypassed only during `/auth/me` bootstrap checks).
