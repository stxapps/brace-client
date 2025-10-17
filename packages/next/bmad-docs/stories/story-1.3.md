# Story 1.3: Implement "Add Link" action with advanced data

**Status:** Done

## Story

As **Olivia the Organizer**,
I want **to have my link saved with the correct list and tags when I use the advanced mode**,
so that **my link is fully organized in a single step**.

## Acceptance Criteria

1.  The `addLink` action creator in `actions/chunk.ts` is modified to accept `listId` and `tags` as optional parameters.
2.  When `addLink` is called with `listId` and `tags`, the new link is created with these associations.
3.  The `onAddOkBtnClick` method in `BottomBarAddPopup.tsx` and `TopBarAddPopup.tsx` is updated to pass the `listId` and `tags` from the Redux store to the `addLink` action.
4.  The `listId` and `tags` are correctly retrieved from the `linkEditor` state.

## Tasks / Subtasks

- [ ] **Task 1: Update `addLink` action.** (AC: #1, #2)
    - [ ] Modify the function signature to accept `listId` and `tags`.
    - [ ] Update the action's logic to include this data when creating the new link.
- [ ] **Task 2: Update `BottomBarAddPopup.tsx`.** (AC: #3, #4)
    - [ ] Connect the component to the Redux store to get `listId` and `tags` from `linkEditor`.
    - [ ] Update the `onAddOkBtnClick` method to pass these values to the `addLink` action.
- [ ] **Task 3: Update `TopBarAddPopup.tsx`.** (AC: #3, #4)
    - [ ] Connect the component to the Redux store to get `listId` and `tags` from `linkEditor`.
    - [ ] Update the `onAddOkBtnClick` method to pass these values to the `addLink` action.

## Dev Notes

-   **Relevant Files:** `actions/chunk.ts`, `components/BottomBarAddPopup.tsx`, `components/TopBarAddPopup.tsx`
-   This story builds directly on the state management work from Story 1.2.

### References

-   [Tech Spec: Action and Paywall Check](tech-spec.md#55-action-and-paywall-check)
