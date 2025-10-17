# Technical Specification: Advanced Link Adding Mode

**Project:** Brace.to
**Author:** John, Product Manager
**Date:** 2025-10-16
**Version:** 1.1

---

## 1. Overview

This document outlines the technical implementation for a new "Advanced Mode" within the link-adding feature. This mode will allow users to add a new link directly to a specific list and associate it with tags upon creation, streamlining the organization process.

- **Project Level:** 1 (Coherent Feature)
- **Related Epic:** `epic-advanced-add` (to be created)

---

## 2. Technical Approach

The implementation will focus on conditionally rendering new input fields within the existing "Add Link" UI. A state management mechanism (e.g., a React Redux reducer state) will control the visibility of the advanced options.

1.  **Default Mode Setting**: A new user setting will be introduced to control the initial state of the "Add Link" popup. This setting will be in `SettingsPopupMisc` and will allow users to choose between "basic," "advanced," or "last used" as the default.
2.  **Add Popup Mode Calculation**: The visibility of the advanced options will be calculated in `selectors/index.ts` based on the user's setting and current mode value.
3.  **UI Toggle and Conditional Rendering**: A "More Options" button will be added to the current "Add Link" component (`BottomBarAddPopup.tsx`, `TopBarAddPopup.tsx`, `Adding.tsx`) to allow users to toggle the advanced mode during their session. When the advanced mode is activated, two new fields will be rendered:
    *   List name
    *   Tags
4.  **State Management**: The Redux reducer (`linkEditorReducer`) will store the current mode and the selected list and entered tags updated through a Redux action (`UPDATE_LINK_EDITOR`).
5.  **Action and Paywall Check**: The existing action for adding a link will be extended or a new one created (`actions/chunk.ts`) to accept `listId` and `tags` as optional parameters. Before adding the link with advanced options, the system will check the user's subscription status. Non-paying users will be shown a paywall (`PaywallPopup.tsx`), and the add action will be prevented.

---

## 3. Source Tree and File Changes

The following files are expected to be modified or created:

```
src/
├── actions/
│   └── chunk.ts # MODIFY: Add/extend action to show an add popup based on the default mode and handle list and tags.
├── components/
│   └── SettingsPopupMisc.tsx # MODIFY/CREATE: Add UI for the new default mode setting.
│   └── BottomBarAddPopup.tsx # MODIFY: Add UI toggle, new input fields, and logic for initial mode.
│   └── TopBarAddPopup.tsx # MODIFY: Add UI toggle, new input fields, and logic for initial mode.
│   └── Adding.tsx # MODIFY: Add UI toggle, new input fields, and logic for initial mode.
└── reducers/
│   └── settingsReducer.ts # MODIFY/CREATE: Store the user's default mode preference for sync across devices.
│   └── LocalSettingsReducer.ts # MODIFY/CREATE: Store the user's default mode preference for local.
│   └── linkEditorReducer.ts # MODIFY: Update reducer to save mode, list and tag data with the new item.
└── selectors/
    └── index.ts # CREATE: A function to calculate the mode for an add popup.
```

---

## 4. Implementation Stack

No new technologies will be introduced. The implementation will use the existing project stack:

- **Language:** TypeScript
- **Framework:** React / Next.js
- **State Management:** Redux, Redux Thunk
- **Styling:** Tailwind CSS

---

## 5. Technical Details

### 5.1 Default Mode Setting (`SettingsPopupMisc.tsx`, `settingsReducer.ts`, `LocalSettingsReducer.ts`)

- A new UI will be added to `SettingsPopupMisc.tsx` to allow users to select their preferred default mode for the "Add Link" feature.
- The options will be "Basic," "Advanced," and "Use Last Mode."
- The selected value will be saved to the `settingsReducer` for synchronization across devices and to the `LocalSettingsReducer` for local persistence.

### 5.2 Add Popup Mode Calculation (`selectors/index.ts`)

- For rendering the add popups, the add popup mode will be calculated.
- The logic will be as follows:
    - First, check the user's subscription status. If they are a non-paying user, `mode` will be `basic`.
    - If mode in `linkEditorReducer` is not null, the mode will be as in it.
    - If mode in `linkEditorReducer` is null and local is selected, use mode in `localSettingsReducer`.
    - If mode in `linkEditorReducer` is null and sync is selected, use mode in `settingsReducer`.
    - If mode is "last used," the application will retrieve the most recent mode from the local storage.

### 5.3 UI Toggle and Conditional Rendering (`BottomBarAddPopup.tsx`, `TopBarAddPopup.tsx`, `Adding.tsx`)

- A "More Options" button will toggle this `mode` state.
- Based on the `mode` state, the component will conditionally render the list name button and the tag input field.
- The list name button to show `ListNamesPopup` to display the user's existing lists and choose.
- Tag input field can be a new tag or choose from existing ones like `TagEditorPopup`.

### 5.4 State Management (`reducers/linkEditorReducer.ts`)

- The `linkEditorReducer` will be updated to store the current state of the `isAdvanced` toggle whenever it is changed by the user. This is necessary for the "Use Last Mode" setting.
- The `UPDATE_LINK_EDITOR` action will be used to update the selected `listId` and `tags` in the `linkEditorReducer` state as the user interacts with the advanced fields.

### 5.5 Action and Paywall Check (`actions/chunk.ts`)

- The `add` action creator in `chunk.ts` will be modified to accept the `listId` and `tags` from the `linkEditorReducer` state.
- When the user clicks "OK" in advanced mode, the action will first check the user's subscription status (e.g., from `state.user.isPaying`).
- If the user is not a paying user, the action will dispatch another action to show the `PaywallPopup.tsx` and the process will stop.
- If the user is a paying user, the action will proceed to add the link with the additional data.

---

## 6. Testing Approach

No tests for now.

---

## 7. Deployment Strategy

No changes to the existing deployment strategy are required. The changes will be deployed as part of the standard `npm run build` and `deploy.sh` process.
