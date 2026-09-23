# Online Bookstore Frontend - Project Rules

## 1. Project Context

This is an Online Bookstore frontend for an IBM BOB capstone project.

The application allows customers to:

- Browse books
- Browse categories
- Search and filter books
- View book details
- View related/recommended books
- Add books to cart
- Manage the shopping cart
- Select delivery information
- Select payment options
- Redeem gift points
- Complete a simulated payment
- View purchase confirmation
- View order history
- Buy again from previous orders
- Cancel eligible orders within 48 hours
- Authenticate/login where required

The current milestone is FRONTEND ONLY.

Do not implement:

- Java backend
- PostgreSQL/database
- Real authentication
- Real payment gateway
- Production deployment
- Cloud infrastructure

Use mock data and localStorage for the current frontend milestone.

The architecture must remain ready for future backend integration.

---

## 2. Technology Stack

Use:

- React 18
- TypeScript
- Tailwind CSS
- Redux Toolkit
- React Redux
- Axios
- React Router
- localStorage

Use strict TypeScript.

Avoid unnecessary `any`.

---

## 3. UI Reference Screens

The project's supplied UI reference screenshots are located in:

screens/

The project root is:

C:\Users\JangalaSrinivasRevan\Desktop\Online_Bookstore

Therefore the UI references are available at:

C:\Users\JangalaSrinivasRevan\Desktop\Online_Bookstore\screens

The currently supplied reference screens include:

- HomepageScreen
- ProductDetailpageScreen
- CartpageScreen
- PaymentpageScreen
- PaymentConfirmationpageScreen

Before implementing or refining these screens, inspect the actual images in the `screens/` directory.

Use the supplied screenshots as the primary visual reference for:

- Layout
- Colors
- Typography
- Spacing
- Navigation
- Cards
- Buttons
- Forms
- Images
- Visual hierarchy
- Responsive behavior

Do not replace the supplied designs with generic bookstore templates.

---

## 4. Additional Screens

The five supplied screenshots do not necessarily represent every screen required by the capstone.

If the documented bookstore user journey requires additional screens, Bob may design and implement them.

Potential examples include:

- Login
- Authentication
- Catalogue/category browsing
- Delivery address
- Order history
- Buy Again
- Other checkout/supporting screens

Do not create additional screens unnecessarily.

Before creating a new screen:

1. Identify the business requirement that requires it.
2. Determine whether the functionality belongs in an existing page or needs a new page.
3. Reuse existing components wherever possible.
4. Follow the visual language of the supplied screenshots.
5. Keep the new screen consistent with the existing application.
6. Keep the design simple and appropriate for the capstone.

---

## 5. Architecture

Use feature-based architecture.

Preferred structure:

src/
├── components/
├── hooks/
├── utils/
├── features/
│   ├── authentication/
│   ├── books/
│   ├── cart/
│   ├── orders/
│   └── payment/
├── pages/
├── store/
├── types/
├── App.tsx
└── main.tsx

Global reusable components belong in:

src/components/

Feature-specific components belong inside their feature.

Do not place all business logic inside page components.

---

## 6. State Management

Use Redux Toolkit for application-level state such as:

- Authentication/user state
- Books/catalogue state where appropriate
- Cart state
- Order state
- Payment state where appropriate

Use local React state for local UI concerns such as:

- Form inputs
- Temporary filters
- Modal visibility
- Local UI state

Do not put every piece of UI state into Redux.

---

## 7. localStorage

Use localStorage for frontend persistence.

Centralize localStorage access.

Do not scatter direct localStorage calls throughout UI components.

Create a storage abstraction and centralized storage keys.

Potential persisted data includes:

- User/session information
- Cart
- Orders
- Gift points
- Relevant user preferences

Use typed serialization/deserialization.

---

## 8. Axios

Create an Axios client/service abstraction that can later connect to backend APIs.

Do not create unnecessary fake HTTP requests.

For the current frontend-only milestone:

- Use local mock data where appropriate.
- Use localStorage for persistence.
- Keep service boundaries ready for future APIs.

Future architecture should allow:

UI
→ Feature Hook
→ Redux/Service
→ Axios
→ Backend API

without requiring major UI changes.

---

## 9. Reusable Components

Create reusable components when they are used by multiple features.

Examples:

- Header
- Footer
- Button
- Input
- Search
- BookCard
- Modal
- Loading indicator
- Error message
- Pagination
- Form controls

Do not over-engineer components that are used only once.

Feature-specific components should remain inside their feature.

---

## 10. UI Quality

All pages must be:

- Responsive
- Accessible
- Consistent
- Visually aligned with the supplied screenshots
- Free from unnecessary duplication

Use Tailwind CSS consistently.

Avoid unnecessary custom CSS.

Maintain consistent:

- spacing
- typography
- buttons
- borders
- cards
- forms
- colors

---

## 11. Functional Quality

Every implemented user journey must work end-to-end within the frontend.

Examples:

Home
→ Product Details
→ Add to Cart
→ Cart
→ Payment
→ Payment Confirmation

If additional screens are required:

Login
→ Home
→ Catalogue
→ Product Details
→ Cart
→ Delivery
→ Payment
→ Confirmation
→ Orders

Use mock/local data where backend functionality is not yet available.

---

## 12. Validation

After every implementation milestone:

- Run the application.
- Run available tests/type checks/linting.
- Fix TypeScript errors.
- Fix build errors.
- Fix broken imports.
- Check browser console errors.
- Verify the implemented user flow.
- Verify responsive behavior.

Do not move to the next milestone if the current milestone has obvious build or runtime errors.

---

## 13. Implementation Strategy

Do not implement the entire application in one operation.

Work in small milestones.

Each milestone must be independently runnable and testable.

Before starting implementation of a milestone:

- understand the requirements
- inspect relevant existing code
- inspect relevant UI reference screenshots
- identify dependencies
- implement only the requested milestone

Do not modify unrelated features.

---

## 14. Code Quality

Prefer:

- small focused components
- clear naming
- typed props
- typed state
- reusable functions
- feature boundaries
- separation of UI and business logic

Avoid:

- unnecessary duplication
- unnecessary abstractions
- large monolithic components
- direct localStorage access inside many components
- unnecessary Redux state
- unnecessary dependencies
- unnecessary fake API calls

---

## 15. Capstone Scope

Prioritize the documented Online Bookstore capstone requirements.

Do not add unrelated features just because they are common in e-commerce applications.

Keep the implementation suitable for demonstrating:

- AI-assisted frontend development
- UI-to-code workflow
- reusable components
- responsive design
- state management
- local persistence
- validation
- refinement
- Git-ready code quality