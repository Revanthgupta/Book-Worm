---
name: bookstore-review
description: Review and refine the Online Bookstore frontend for UI fidelity, responsive behavior, accessibility, React quality, TypeScript quality, state management, persistence, and functional correctness.
user-invocable: true
---

# Online Bookstore Review Skill

Review the Online Bookstore frontend systematically.

## 1. Functional Review

Check:

- navigation
- user flows
- book selection
- product details
- cart
- checkout
- payment
- confirmation
- order persistence
- required capstone functionality

## 2. UI Review

Compare supplied reference screens with the implementation.

Check:

- layout
- spacing
- typography
- colors
- cards
- buttons
- forms
- images
- alignment
- visual hierarchy

Reference images are located in:

screens/

## 3. Responsive Review

Check:

- desktop
- tablet
- mobile
- overflow
- wrapping
- navigation behavior
- card layouts
- forms

## 4. React Review

Check:

- component responsibilities
- unnecessary re-renders
- hooks usage
- effects
- keys
- component duplication
- unnecessary abstractions

## 5. TypeScript Review

Check:

- type safety
- unnecessary any
- props
- Redux types
- service types
- API types

## 6. Redux Review

Check:

- state boundaries
- unnecessary global state
- selectors
- actions
- reducers
- persistence

## 7. Persistence Review

Check:

- localStorage abstraction
- centralized keys
- serialization
- initialization
- data consistency

## 8. Accessibility Review

Check:

- semantic HTML
- labels
- keyboard accessibility
- buttons
- forms
- images/alt text
- focus behavior

## 9. Tailwind Review

Check:

- consistency
- duplicated classes
- unnecessary CSS
- responsive utilities
- maintainability

## 10. Final Review

Classify issues as:

- Critical
- Major
- Minor

Fix high-confidence issues that are within the current project scope.

Do not redesign working screens unnecessarily.

After the review:

- run validation
- fix identified issues
- summarize changes
- identify anything that remains