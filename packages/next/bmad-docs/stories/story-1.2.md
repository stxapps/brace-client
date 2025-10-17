# Story 1.2: Implement state management for Advanced Mode

**Status:** Done

## Story

As **Olivia the Organizer**,
I want **the application to remember my choice of using the advanced link adding mode**,
so that **I don't have to click "More Options" every time I add a link**.

## Acceptance Criteria

1.  The `linkEditorReducer` is updated to store the current state of the advanced mode toggle (`isAdvanced`).
2.  The `linkEditorReducer` is updated to store the selected `listId` and `tags` when a user interacts with the advanced fields.
3.  The `UPDATE_LINK_EDITOR` action is used to update these new values in the reducer.
4.  The state of the "More Options" / "Less Options" button in `BottomBarAddPopup` and `TopBarAddPopup` is driven by the Redux state, not local component state.
5.  When the "Add Link" popup is opened, the visibility of the advanced options is correctly determined by the value in the Redux store.

## Tasks / Subtasks

- [ ] **Task 1: Update `linkEditorReducer`.** (AC: #1, #2)
    - [ ] Add `isAdvanced`, `listId`, and `tags` properties to the `linkEditor` slice of the Redux state.
    - [ ] Ensure the reducer correctly handles updates to these new properties.
- [ ] **Task 2: Update `UPDATE_LINK_EDITOR` action.** (AC: #3)
    - [ ] Ensure the action creator can accept and pass on the new `isAdvanced`, `listId`, and `tags` values.
- [ ] **Task 3: Refactor `BottomBarAddPopup.tsx`.** (AC: #4, #5)
    - [ ] Remove the local `isAdvanced` state.
    - [ ] Connect the component to the Redux store to get the `isAdvanced` value from `linkEditor`.
    - [ ] Dispatch the `updateLinkEditor` action to toggle the `isAdvanced` state.
- [ ] **Task 4: Refactor `TopBarAddPopup.tsx`.** (AC: #4, #5)
    - [ ] Remove the local `isAdvanced` state.
    - [ ] Connect the component to the Redux store to get the `isAdvanced` value from `linkEditor`.
    - [ ] Dispatch the `updateLinkEditor` action to toggle the `isAdvanced` state.

## Dev Notes

-   **Relevant Files:** `reducers/linkEditorReducer.ts`, `actions/chunk.ts`, `components/BottomBarAddPopup.tsx`, `components/TopBarAddPopup.tsx`
-   This story focuses solely on connecting the UI from Story 1.1 to the Redux store. The logic for *using* the `listId` and `tags` when creating the link will be handled in a subsequent story.

### References

-   [Tech Spec: State Management](tech-spec.md#54-state-management)
