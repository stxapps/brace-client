# Story 1.5: Implement paywall for non-paying users

**Status:** Done

## Story

As **a non-paying user**,
I want **to be informed about the benefits of a paid plan when I try to use advanced features**,
so that **I can decide whether to upgrade my account**.

## Acceptance Criteria

1.  When a non-paying user clicks the "Save" button in the "Add Link" popup with advanced options (a `listId` or `tags` selected), the `addLink` action is prevented.
2.  Instead of adding the link, the `PaywallPopup` is displayed.
3.  The `addLink` action in `actions/chunk.ts` contains logic to check the user's subscription status (e.g., from `state.user.isPaying`).
4.  The check is only performed when the user is attempting to use the advanced features (`listId` or `tags` are present).

## Tasks / Subtasks

- [ ] **Task 1: Update `addLink` action.** (AC: #1, #3, #4)
    - [ ] Add a check at the beginning of the action to verify the user's subscription status if `listId` or `tags` are provided.
    - [ ] If the user is not a paying user, dispatch an action to show the `PaywallPopup` and halt further execution.
- [ ] **Task 2: Verify `PaywallPopup` integration.** (AC: #2)
    - [ ] Ensure the `PaywallPopup` is correctly triggered from the `addLink` action.
    - [ ] No UI changes are required for the `PaywallPopup` itself in this story.

## Dev Notes

-   **Relevant Files:** `actions/chunk.ts`, `components/PaywallPopup.tsx`
-   This story focuses on enforcing the paywall for the advanced link adding feature. The `PaywallPopup` component is assumed to exist and be functional.

### References

-   [Tech Spec: Action and Paywall Check](tech-spec.md#55-action-and-paywall-check)
