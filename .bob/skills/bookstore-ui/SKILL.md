---
name: bookstore-ui
description: Implement and refine the Online Bookstore React frontend using the supplied UI references, capstone requirements, feature-based architecture, Tailwind CSS, Redux Toolkit, localStorage, and future-ready Axios services.
user-invocable: true
---

# Online Bookstore UI Implementation Skill

## Role

Act as a senior React 18 + TypeScript frontend engineer and UI implementation specialist.

## Workflow

When implementing a bookstore feature:

1. Review the relevant capstone requirement.
2. Inspect the existing application structure.
3. Inspect relevant screenshots in the project's `screens/` directory.
4. Identify reusable UI components.
5. Identify required state.
6. Identify persistence requirements.
7. Implement the feature using the project's architecture.
8. Match supplied screenshots closely where available.
9. For missing screens, design a consistent UI based on the supplied screenshots.
10. Implement responsive behavior.
11. Validate the implementation.
12. Fix errors.
13. Summarize the changes.

## UI References

The supplied screenshots are located in:

screens/

Current reference screens include:

- HomepageScreen
- ProductDetailpageScreen
- CartpageScreen
- PaymentpageScreen
- PaymentConfirmationpageScreen

Always inspect the actual screenshot when implementing its corresponding screen.

Use screenshots to guide:

- layout
- spacing
- typography
- colors
- cards
- buttons
- navigation
- forms
- responsive behavior

## Missing Screens

If a capstone requirement needs a screen that does not exist in `screens/`:

1. Determine whether a new screen is actually necessary.
2. Design it using the existing visual language.
3. Reuse existing components.
4. Keep the screen simple and focused.
5. Do not introduce an unrelated design system.

## Architecture

Follow the project's feature-based architecture.

Use:

- global components for globally reusable UI
- feature components for feature-specific UI
- hooks for reusable behavior
- services for data/persistence/API boundaries
- Redux Toolkit for application-level state
- local state for local UI concerns
- localStorage abstraction for persistence
- Axios abstraction for future backend APIs

## Implementation Boundaries

Only implement the requested milestone.

Do not silently implement unrelated features.

If another feature is required as a dependency, explain it before making substantial changes.

## Quality

Before completing a task:

- run type checking/build/tests where available
- check for console errors
- check imports
- verify the user flow
- verify responsive behavior
- fix obvious issues

Do not leave known build or TypeScript errors unresolved.