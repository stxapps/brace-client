import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_LIST_NAME, UPDATE_POPUP, UPDATE_SEARCH_STRING, FETCH, FETCH_COMMIT,
  FETCH_ROLLBACK, UPDATE_FETCHED, CLEAR_FETCHED_LIST_NAMES, REFRESH_FETCHED,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK, EXTRACT_CONTENTS, EXTRACT_CONTENTS_ROLLBACK,
  EXTRACT_CONTENTS_COMMIT, UPDATE_STATUS, UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING,
  ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS, UPDATE_SELECTING_LINK_ID,
  UPDATE_SELECTING_LIST_NAME, UPDATE_DELETING_LIST_NAME, DELETE_LIST_NAMES,
  UPDATE_DELETE_ACTION, UPDATE_DISCARD_ACTION, UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS, MERGE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_VIEW_ID, UPDATE_LIST_NAMES_MODE, REHYDRATE_STATIC_FILES,
  UPDATE_PAYWALL_FEATURE, UPDATE_IMPORT_ALL_DATA_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA,
  RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  LIST_NAMES_POPUP, PIN_MENU_POPUP, CUSTOM_EDITOR_POPUP, PAYWALL_POPUP,
  CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP, SETTINGS_POPUP,
  SETTINGS_LISTS_MENU_POPUP, TIME_PICK_POPUP, ACCESS_ERROR_POPUP, MY_LIST, TRASH,
  ARCHIVE, UPDATING, DIED_UPDATING, SETTINGS_VIEW_ACCOUNT, DELETE_ACTION_LIST_NAME,
} from '../types/const';
import { doContainListName, getStatusCounts, isObject, isString } from '../utils';

const initialState = {
  listName: MY_LIST,
  searchString: '',
  isSignUpPopupShown: false,
  isSignInPopupShown: false,
  isAddPopupShown: false,
  isSearchPopupShown: false,
  isProfilePopupShown: false,
  isListNamesPopupShown: false,
  listNamesPopupPosition: null,
  isPinMenuPopupShown: false,
  pinMenuPopupPosition: null,
  isCustomEditorPopupShown: false,
  isPaywallPopupShown: false,
  isConfirmDeletePopupShown: false,
  isConfirmDiscardPopupShown: false,
  isSettingsPopupShown: false,
  isSettingsListsMenuPopupShown: false,
  settingsListsMenuPopupPosition: null,
  isTimePickPopupShown: false,
  timePickPopupPosition: null,
  isAccessErrorPopupShown: false,
  statuses: [],
  isHandlingSignIn: false,
  isBulkEditing: false,
  selectedLinkIds: [],
  selectingLinkId: null,
  selectingListName: null,
  deletingListName: null,
  rehydratedListNames: [],
  didFetch: false,
  didFetchSettings: false,
  fetchedListNames: [],
  listChangedCount: 0,
  deleteAction: null,
  discardAction: null,
  settingsStatus: null,
  settingsViewId: SETTINGS_VIEW_ACCOUNT,
  isSettingsSidebarShown: false,
  didSettingsCloseAnimEnd: true,
  didSettingsSidebarAnimEnd: true,
  updateSettingsViewIdCount: 0,
  listNamesMode: null,
  listNamesAnimType: null,
  paywallFeature: null,
  importAllDataProgress: null,
  exportAllDataProgress: null,
  deleteAllDataProgress: null,
};

const displayReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return {
      ...state,
      ...action.payload.display,
      searchString: '',
      isSignUpPopupShown: false,
      isSignInPopupShown: false,
      isAddPopupShown: false,
      isSearchPopupShown: false,
      isProfilePopupShown: false,
      isListNamesPopupShown: false,
      listNamesPopupPosition: null,
      isPinMenuPopupShown: false,
      pinMenuPopupPosition: null,
      isCustomEditorPopupShown: false,
      isPaywallPopupShown: false,
      isConfirmDeletePopupShown: false,
      isConfirmDiscardPopupShown: false,
      isSettingsPopupShown: false,
      isSettingsListsMenuPopupShown: false,
      settingsListsMenuPopupPosition: null,
      isTimePickPopupShown: false,
      timePickPopupPosition: null,
      isAccessErrorPopupShown: false,
      statuses: [],
      isHandlingSignIn: false,
      isBulkEditing: false,
      selectedLinkIds: [],
      selectingLinkId: null,
      selectingListName: null,
      deletingListName: null,
      rehydratedListNames: [],
      didFetch: false,
      didFetchSettings: false,
      fetchedListNames: [],
      listChangedCount: 0,
      deleteAction: null,
      discardAction: null,
      // If in outbox, continue after reload
      //settingsStatus: null,
      settingsViewId: SETTINGS_VIEW_ACCOUNT,
      isSettingsSidebarShown: false,
      didSettingsCloseAnimEnd: true,
      didSettingsSidebarAnimEnd: true,
      updateSettingsViewIdCount: 0,
      listNamesMode: null,
      listNamesAnimType: null,
      paywallFeature: null,
      importAllDataProgress: null,
      exportAllDataProgress: null,
      deleteAllDataProgress: null,
    };
  }

  if (action.type === UPDATE_LIST_NAME) {
    return {
      ...state,
      listName: action.payload,
      listChangedCount: state.listChangedCount + 1,
      selectedLinkIds: [],
    };
  }

  if (action.type === UPDATE_SEARCH_STRING) {
    return { ...state, searchString: action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    const { id, isShown, anchorPosition } = action.payload;

    if (id === ALL) {
      const newState = {
        ...state,
        isSignUpPopupShown: isShown,
        isSignInPopupShown: isShown,
        isAddPopupShown: isShown,
        isSearchPopupShown: isShown,
        isProfilePopupShown: isShown,
        isCustomEditorPopupShown: isShown,
        isPaywallPopupShown: isShown,
        isConfirmDeletePopupShown: isShown,
        isConfirmDiscardPopupShown: isShown,
        isSettingsPopupShown: isShown,
        //isAccessErrorPopupShown: isShown, // ErrorPopup should still be shown
      };
      if (!isShown) {
        newState.isListNamesPopupShown = false;
        newState.listNamesPopupPosition = null;
        newState.isPinMenuPopupShown = false;
        newState.pinMenuPopupPosition = null;
        newState.isSettingsListsMenuPopupShown = false;
        newState.settingsListsMenuPopupPosition = null;
        newState.isTimePickPopupShown = false;
        newState.timePickPopupPosition = null;
      }
      return newState;
    }

    if (id === SIGN_UP_POPUP) {
      return { ...state, isSignUpPopupShown: isShown };
    }

    if (id === SIGN_IN_POPUP) {
      return { ...state, isSignInPopupShown: isShown };
    }

    if (id === ADD_POPUP) {
      return { ...state, isAddPopupShown: isShown };
    }

    if (id === SEARCH_POPUP) {
      return { ...state, isSearchPopupShown: isShown };
    }

    if (id === PROFILE_POPUP) {
      return { ...state, isProfilePopupShown: isShown };
    }

    if (id === LIST_NAMES_POPUP) {
      const newState = {
        ...state,
        isListNamesPopupShown: isShown,
        listNamesPopupPosition: anchorPosition,
      };
      return newState;
    }

    if (id === PIN_MENU_POPUP) {
      const newState = {
        ...state,
        isPinMenuPopupShown: isShown,
        pinMenuPopupPosition: anchorPosition,
      };
      return newState;
    }

    if (id === CUSTOM_EDITOR_POPUP) {
      return { ...state, isCustomEditorPopupShown: isShown };
    }

    if (id === PAYWALL_POPUP) {
      return { ...state, isPaywallPopupShown: isShown };
    }

    if (id === CONFIRM_DELETE_POPUP) {
      const newState = { ...state, isConfirmDeletePopupShown: isShown };
      return newState;
    }

    if (id === CONFIRM_DISCARD_POPUP) {
      const newState = { ...state, isConfirmDiscardPopupShown: isShown };
      return newState;
    }

    if (id === SETTINGS_POPUP) {
      const newState = { ...state, isSettingsPopupShown: isShown };
      if (isShown) {
        newState.didSettingsCloseAnimEnd = false;
        newState.didSettingsSidebarAnimEnd = true;
      }
      return newState;
    }

    if (id === SETTINGS_LISTS_MENU_POPUP) {
      return {
        ...state,
        isSettingsListsMenuPopupShown: isShown,
        settingsListsMenuPopupPosition: anchorPosition,
      };
    }

    if (id === TIME_PICK_POPUP) {
      return {
        ...state,
        isTimePickPopupShown: isShown,
        timePickPopupPosition: anchorPosition,
      };
    }

    if (id === ACCESS_ERROR_POPUP) {
      const newState = { ...state, isAccessErrorPopupShown: isShown };
      return newState;
    }

    return state;
  }

  if (action.type === FETCH) {
    return { ...state, statuses: [...state.statuses, FETCH] };
  }

  if (action.type === FETCH_COMMIT) {
    const { listName } = action.payload;
    const newState = {
      ...state,
      isAccessErrorPopupShown: false,
      statuses: [...state.statuses, FETCH_COMMIT],
      didFetch: true,
      didFetchSettings: true,
      fetchedListNames: [...state.fetchedListNames, listName],
    };

    // Make sure listName is in listNameMap, if not, set to My List.
    const { listNames, doFetchStgsAndInfo, settings } = action.payload;
    if (!doFetchStgsAndInfo) return newState;

    newState.settingsStatus = null;

    if (listNames.includes(newState.listName)) return newState;
    if (settings) {
      if (!doContainListName(newState.listName, settings.listNameMap)) {
        newState.listName = MY_LIST;
      }
    } else {
      if (![MY_LIST, TRASH, ARCHIVE].includes(newState.listName)) {
        newState.listName = MY_LIST;
      }
    }

    return newState;
  }

  if (action.type === FETCH_ROLLBACK) {
    const newState = { ...state, statuses: [...state.statuses, FETCH_ROLLBACK] };
    if (
      (
        isObject(action.payload) &&
        isString(action.payload.message) &&
        (
          action.payload.message.includes('401') ||
          action.payload.message.includes('GaiaError error 7')
        )
      ) ||
      (
        isObject(action.payload) &&
        isObject(action.payload.hubError) &&
        action.payload.hubError.statusCode === 401
      )
    ) {
      newState.isAccessErrorPopupShown = true;
    }
    return newState;
  }

  if (action.type === UPDATE_FETCHED) {
    const { doChangeListCount } = action.payload;

    const newState = { ...state, selectedLinkIds: [] };
    if (doChangeListCount) newState.listChangedCount += 1;
    return newState;
  }

  if (action.type === CLEAR_FETCHED_LIST_NAMES) {
    return { ...state, didFetchSettings: false, fetchedListNames: [] };
  }

  if (action.type === REFRESH_FETCHED) {
    const { shouldDispatchFetch } = action.payload;

    const newState = { ...state, listChangedCount: state.listChangedCount + 1 };
    if (shouldDispatchFetch) {
      newState.didFetchSettings = false;
      newState.fetchedListNames = [];
    }

    return newState;
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH) {
    return { ...state, statuses: [...state.statuses, DELETE_OLD_LINKS_IN_TRASH] };
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT) {
    return { ...state, statuses: [...state.statuses, DELETE_OLD_LINKS_IN_TRASH_COMMIT] };
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH_ROLLBACK) {
    return {
      ...state, statuses: [...state.statuses, DELETE_OLD_LINKS_IN_TRASH_ROLLBACK],
    };
  }

  if (action.type === EXTRACT_CONTENTS) {
    return { ...state, statuses: [...state.statuses, EXTRACT_CONTENTS] };
  }

  if (action.type === EXTRACT_CONTENTS_COMMIT) {
    return { ...state, statuses: [...state.statuses, EXTRACT_CONTENTS_COMMIT] };
  }

  if (action.type === EXTRACT_CONTENTS_ROLLBACK) {
    return { ...state, statuses: [...state.statuses, EXTRACT_CONTENTS_ROLLBACK] };
  }

  if (action.type === UPDATE_STATUS) {
    if (action.payload === null) {
      const statusCounts = getStatusCounts(state.statuses);

      let isActive = false;
      for (const statusCount of statusCounts) {
        if (statusCount.count > 0) isActive = true;
      }
      if (!isActive) return { ...state, statuses: [] };
    }
    return { ...state, statuses: [...state.statuses, action.payload] };
  }

  if (action.type === UPDATE_HANDLING_SIGN_IN) {
    return { ...state, isHandlingSignIn: action.payload };
  }

  if (action.type === UPDATE_BULK_EDITING) {
    const newState = { ...state, isBulkEditing: action.payload };
    if (!action.payload) newState.selectedLinkIds = [];
    return newState;
  }

  if (action.type === ADD_SELECTED_LINK_IDS) {
    const selectedLinkIds = [...state.selectedLinkIds];
    for (const linkId of action.payload) {
      if (!selectedLinkIds.includes(linkId)) selectedLinkIds.push(linkId);
    }
    return { ...state, selectedLinkIds };
  }

  if (action.type === DELETE_SELECTED_LINK_IDS) {
    const selectedLinkIds = [];
    for (const linkId of state.selectedLinkIds) {
      if (!action.payload.includes(linkId)) selectedLinkIds.push(linkId);
    }
    return { ...state, selectedLinkIds };
  }

  if (action.type === UPDATE_SELECTING_LINK_ID) {
    return { ...state, selectingLinkId: action.payload };
  }

  if (action.type === UPDATE_SELECTING_LIST_NAME) {
    return { ...state, selectingListName: action.payload };
  }

  if (action.type === UPDATE_DELETING_LIST_NAME) {
    return {
      ...state, deletingListName: action.payload, deleteAction: DELETE_ACTION_LIST_NAME,
    };
  }

  if (action.type === DELETE_LIST_NAMES) {
    const { listNames } = action.payload;
    if (!listNames.includes(state.listName)) return state;
    return { ...state, listName: MY_LIST };
  }

  if (action.type === UPDATE_DELETE_ACTION) {
    return { ...state, deleteAction: action.payload };
  }

  if (action.type === UPDATE_DISCARD_ACTION) {
    return { ...state, discardAction: action.payload };
  }

  if (action.type === UPDATE_SETTINGS) {
    const { settings } = action.payload;
    const doContain = doContainListName(state.listName, settings.listNameMap);

    return {
      ...state,
      listName: doContain ? state.listName : MY_LIST,
      statuses: [...state.statuses, UPDATE_SETTINGS],
      settingsStatus: UPDATING,
    };
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    const { doFetch } = action.meta;

    const newState = {
      ...state,
      statuses: [...state.statuses, UPDATE_SETTINGS_COMMIT],
      settingsStatus: null,
    };
    if (doFetch) newState.fetchedListNames = [];
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_ROLLBACK) {
    return {
      ...state,
      statuses: [...state.statuses, UPDATE_SETTINGS_ROLLBACK],
      settingsStatus: DIED_UPDATING,
    };
  }

  if (action.type === CANCEL_DIED_SETTINGS || action.type === MERGE_SETTINGS_COMMIT) {
    const { settings } = action.payload;
    const doFetch = action.type === CANCEL_DIED_SETTINGS ?
      action.payload.doFetch : action.meta.doFetch;
    const doContain = doContainListName(state.listName, settings.listNameMap);

    let isActive = false;
    for (const statusCount of getStatusCounts(state.statuses)) {
      if (statusCount.count > 0) isActive = true;
    }

    const newState = {
      ...state,
      listName: doContain ? state.listName : MY_LIST,
      statuses: isActive ? [...state.statuses, null] : [],
      settingsStatus: null,
    };
    if (doFetch) newState.fetchedListNames = [];
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_VIEW_ID) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_LIST_NAMES_MODE) {
    return { ...state, ...action.payload };
  }

  if (action.type === REHYDRATE_STATIC_FILES) {
    const { listName } = action.payload;
    return {
      ...state,
      rehydratedListNames: [...state.rehydratedListNames, listName],
    };
  }

  if (action.type === UPDATE_PAYWALL_FEATURE) {
    return { ...state, paywallFeature: action.payload };
  }

  if (action.type === UPDATE_IMPORT_ALL_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    const newState = { ...state, importAllDataProgress: progress };
    if (isObject(progress) && progress.total && progress.done) {
      if (progress.total === progress.done) {
        newState.didFetchSettings = false;
        newState.fetchedListNames = [];
      }
    }
    return newState;
  }

  if (action.type === UPDATE_EXPORT_ALL_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    return { ...state, exportAllDataProgress: progress };
  }

  if (action.type === UPDATE_DELETE_ALL_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    return { ...state, deleteAllDataProgress: progress };
  }

  if (action.type === DELETE_ALL_DATA) {
    return {
      ...initialState,
      rehydratedListNames: [MY_LIST],
      didFetch: true, didFetchSettings: true, fetchedListNames: [MY_LIST],
    };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default displayReducer;
