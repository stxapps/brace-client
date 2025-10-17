# Story 1.1: Implement UI for Advanced Link Adding Mode

**Status:** TODO

## Story

As **Olivia the Organizer**,
I want **to see and interact with the advanced options for adding a link**,
so that **I can begin the process of adding a link with a list and tags in a single step**.

## Acceptance Criteria

1.  When the "Add Link" popup is opened, a "More Options" button is visible.
2.  Clicking the "More Options" button reveals the "Choose List" button and the "Tags" input field.
3.  When the advanced options are visible, the "More Options" button changes to a "Less Options" button.
4.  Clicking the "Less Options" button hides the "Choose List" button and the "Tags" input field.
5.  The UI for the new elements is consistent with the existing Brace.to design system.
6.  The UI is fully responsive and adapts to mobile screen sizes.
7.  All new UI elements are keyboard accessible and meet WCAG 2.1 AA standards.

## Tasks / Subtasks

- [ ] **Task 1: Create the "More Options" / "Less Options" toggle button.** (AC: #1, #3, #4)
    - [ ] Implement the button component.
    - [ ] Add the logic to toggle the visibility of the advanced options.
- [ ] **Task 2: Create the "Choose List" button.** (AC: #2)
    - [ ] Implement the button component.
- [ ] **Task 3: Create the "Tags" input field.** (AC: #2)
    - [ ] Implement the tag input component with autocomplete functionality.
- [ ] **Task 4: Ensure UI Consistency.** (AC: #5)
    - [ ] Verify that all new components use the existing design system for colors, typography, and spacing.
- [ ] **Task 5: Implement Responsive Design.** (AC: #6)
    - [ ] Add responsive styles to ensure the layout adapts correctly on mobile devices.
- [ ] **Task 6: Ensure Accessibility.** (AC: #7)
    - [ ] Add ARIA attributes and keyboard navigation support.
    - [ ] Test with a screen reader.

## Dev Notes

-   **Relevant Files:** `BottomBarAddPopup.tsx`, `TopBarAddPopup.tsx`, `Adding.tsx`
-   **Design System:** Adhere strictly to the existing design system.
-   **Component Reusability:** The functionality of `ListNamesPopup` and `TagEditorPopup` should be reused.

### References

-   [Tech Spec: UI Toggle and Conditional Rendering](tech-spec.md#53-ui-toggle-and-conditional-rendering)
-   [UX Spec: Component Library and Design System](ux-spec.md#4-component-library-and-design-system)
