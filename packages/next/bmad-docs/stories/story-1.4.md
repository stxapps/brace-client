# Story 1.4: Implement "Default Mode" user setting

**Status:** Done

## Story

As **Olivia the Organizer**,
I want **to set a default mode for adding links (e.g., "Advanced")**,
so that **the "Add Link" popup always opens in my preferred state, saving me time and clicks**.

## Acceptance Criteria

1.  A new UI section is added to `SettingsPopupMisc.tsx` that allows users to select their default "Add Link" mode.
2.  The available options are "Basic," "Advanced," and "Use Last Mode."
3.  The selected preference is saved to both `settingsReducer` (for cross-device sync) and `LocalSettingsReducer` (for local persistence).
4.  A new selector function is created in `selectors/index.ts` to calculate the initial mode for the "Add Link" popup.
5.  The selector's logic correctly prioritizes the user's subscription status, `linkEditor` state, and the new local/sync settings, as defined in the technical specification.
6.  The `addLink` action in `actions/chunk.ts` is updated to use this new selector to determine the initial mode when the popup is opened.

## Tasks / Subtasks

- [ ] **Task 1: Create UI for Default Mode setting.** (AC: #1, #2)
    - [ ] Implement the radio buttons or dropdown in `SettingsPopupMisc.tsx`.
- [ ] **Task 2: Update Reducers.** (AC: #3)
    - [ ] Add the necessary state and handlers to `settingsReducer.ts` and `LocalSettingsReducer.ts` to store the user's preference.
- [ ] **Task 3: Create Mode Calculation Selector.** (AC: #4, #5)
    - [ ] Implement the new selector function in `selectors/index.ts` with the logic from the tech spec.
- [ ] **Task 4: Update `addLink` action.** (AC: #6)
    - [ ] Modify the `addLink` action to call the new selector and set the initial `isAdvanced` state in `linkEditor` when opening the popup.

## Dev Notes

-   **Relevant Files:** `components/SettingsPopupMisc.tsx`, `reducers/settingsReducer.ts`, `reducers/LocalSettingsReducer.ts`, `selectors/index.ts`, `actions/chunk.ts`
-   Pay close attention to the logic hierarchy for the mode calculation in the tech spec to ensure the correct mode is displayed.

### References

-   [Tech Spec: Default Mode Setting](tech-spec.md#51-default-mode-setting)
-   [Tech Spec: Add Popup Mode Calculation](tech-spec.md#52-add-popup-mode-calculation)
