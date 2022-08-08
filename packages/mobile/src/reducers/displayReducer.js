import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_LIST_NAME, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, UPDATE_FETCHED, CLEAR_FETCHED_LIST_NAMES,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_ROLLBACK, EXTRACT_CONTENTS_COMMIT,
  UPDATE_STATUS, UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING,
  ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS, UPDATE_SELECTING_LINK_ID,
  UPDATE_SELECTING_LIST_NAME, UPDATE_DELETING_LIST_NAME, DELETE_LIST_NAMES,
  UPDATE_DELETE_ACTION, UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS, UPDATE_SETTINGS_VIEW_ID,
  UPDATE_LIST_NAMES_MODE, UPDATE_IMPORT_ALL_DATA_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  LIST_NAMES_POPUP, PIN_MENU_POPUP, PAYWALL_POPUP, CONFIRM_DELETE_POPUP, SETTINGS_POPUP,
  SETTINGS_LISTS_MENU_POPUP, MY_LIST, TRASH, ARCHIVE, UPDATING, DIED_UPDATING,
  SETTINGS_VIEW_ACCOUNT, DELETE_ACTION_LIST_NAME,
} from '../types/const';
import { doContainListName } from '../utils';

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
  isPaywallPopupShown: false,
  isConfirmDeletePopupShown: false,
  isSettingsPopupShown: false,
  isSettingsListsMenuPopupShown: false,
  settingsListsMenuPopupPosition: null,
  status: null,
  isHandlingSignIn: false,
  isBulkEditing: false,
  selectedLinkIds: [],
  selectingLinkId: null,
  selectingListName: null,
  deletingListName: null,
  didFetch: false,
  didFetchSettings: false,
  fetchedListNames: [],
  listChangedCount: 0,
  deleteAction: null,
  settingsStatus: null,
  settingsViewId: SETTINGS_VIEW_ACCOUNT,
  isSettingsSidebarShown: false,
  didSettingsCloseAnimEnd: true,
  didSettingsSidebarAnimEnd: true,
  updateSettingsViewIdCount: 0,
  listNamesMode: null,
  listNamesAnimType: null,
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
      isPaywallPopupShown: false,
      isConfirmDeletePopupShown: false,
      isSettingsPopupShown: false,
      isSettingsListsMenuPopupShown: false,
      settingsListsMenuPopupPosition: null,
      status: null,
      isHandlingSignIn: false,
      isBulkEditing: false,
      selectedLinkIds: [],
      selectingLinkId: null,
      selectingListName: null,
      deletingListName: null,
      didFetch: false,
      didFetchSettings: false,
      fetchedListNames: [],
      listChangedCount: 0,
      deleteAction: null,
      // If in outbox, continue after reload
      //settingsStatus: null,
      settingsViewId: SETTINGS_VIEW_ACCOUNT,
      isSettingsSidebarShown: false,
      didSettingsCloseAnimEnd: true,
      didSettingsSidebarAnimEnd: true,
      updateSettingsViewIdCount: 0,
      listNamesMode: null,
      listNamesAnimType: null,
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
        isPaywallPopupShown: isShown,
        isConfirmDeletePopupShown: isShown,
        isSettingsPopupShown: isShown,
      };
      if (!isShown) {
        newState.isListNamesPopupShown = false;
        newState.listNamesPopupPosition = null;
        newState.isPinMenuPopupShown = false;
        newState.pinMenuPopupPosition = null;
        newState.isSettingsListsMenuPopupShown = false;
        newState.settingsListsMenuPopupPosition = null;
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

    if (id === PAYWALL_POPUP) {
      return { ...state, isPaywallPopupShown: isShown };
    }

    if (id === CONFIRM_DELETE_POPUP) {
      const newState = { ...state, isConfirmDeletePopupShown: isShown };
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

    return state;
  }

  if (action.type === FETCH) {
    return { ...state, status: FETCH };
  }

  if (action.type === FETCH_COMMIT) {
    const { listName } = action.payload;
    const newState = {
      ...state,
      status: FETCH_COMMIT,
      didFetch: true,
      didFetchSettings: true,
      fetchedListNames: [...state.fetchedListNames, listName],
    };

    // Make sure listName is in listNameMap, if not, set to My List.
    const { listNames, doFetchSettings, settings } = action.payload;
    if (!doFetchSettings) return newState;

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
    return { ...state, status: FETCH_ROLLBACK };
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

  if (action.type === DELETE_OLD_LINKS_IN_TRASH) {
    return { ...state, status: DELETE_OLD_LINKS_IN_TRASH };
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT) {
    return { ...state, status: DELETE_OLD_LINKS_IN_TRASH_COMMIT };
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH_ROLLBACK) {
    return { ...state, status: DELETE_OLD_LINKS_IN_TRASH_ROLLBACK };
  }

  if (action.type === EXTRACT_CONTENTS) {
    return { ...state, status: EXTRACT_CONTENTS };
  }

  if (action.type === EXTRACT_CONTENTS_COMMIT) {
    return { ...state, status: EXTRACT_CONTENTS_COMMIT };
  }

  if (action.type === EXTRACT_CONTENTS_ROLLBACK) {
    return { ...state, status: EXTRACT_CONTENTS_ROLLBACK };
  }

  if (action.type === UPDATE_STATUS) {
    return { ...state, status: action.payload };
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

  if (action.type === UPDATE_SETTINGS) {
    const { settings } = action.payload;
    const doContain = doContainListName(state.listName, settings.listNameMap);

    return {
      ...state,
      listName: doContain ? state.listName : MY_LIST,
      status: UPDATE_SETTINGS,
      settingsStatus: UPDATING,
    };
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    const { doFetch } = action.meta;

    const newState = { ...state, status: UPDATE_SETTINGS_COMMIT, settingsStatus: null };
    if (doFetch) newState.fetchedListNames = [];
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_ROLLBACK) {
    return { ...state, status: UPDATE_SETTINGS_ROLLBACK, settingsStatus: DIED_UPDATING };
  }

  if (action.type === CANCEL_DIED_SETTINGS) {
    const { settings } = action.payload;
    const doContain = doContainListName(state.listName, settings.listNameMap);

    return {
      ...state,
      listName: doContain ? state.listName : MY_LIST,
      status: null,
      settingsStatus: null,
    };
  }

  if (action.type === UPDATE_SETTINGS_VIEW_ID) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_LIST_NAMES_MODE) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_IMPORT_ALL_DATA_PROGRESS) {
    const newState = { ...state, importAllDataProgress: action.payload };
    if (action.payload && action.payload.total && action.payload.done) {
      if (action.payload.total === action.payload.done) {
        newState.didFetchSettings = false;
        newState.fetchedListNames = [];
      }
    }
    return newState;
  }

  if (action.type === UPDATE_EXPORT_ALL_DATA_PROGRESS) {
    return { ...state, exportAllDataProgress: action.payload };
  }

  if (action.type === UPDATE_DELETE_ALL_DATA_PROGRESS) {
    return { ...state, deleteAllDataProgress: action.payload };
  }

  if (action.type === DELETE_ALL_DATA) {
    return {
      ...initialState,
      didFetch: true, didFetchSettings: true, fetchedListNames: [MY_LIST],
    };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default displayReducer;
