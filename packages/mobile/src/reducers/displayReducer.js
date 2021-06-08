import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_LIST_NAME, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, UPDATE_FETCHED, CLEAR_FETCHED_LIST_NAMES,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_ROLLBACK, EXTRACT_CONTENTS_COMMIT,
  UPDATE_STATUS, UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING,
  ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS,
  DELETE_LIST_NAMES, UPDATE_DELETING_LIST_NAME,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
  UPDATE_UPDATE_SETTINGS_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, LIST_NAME_POPUP,
  CONFIRM_DELETE_POPUP, SETTINGS_POPUP,
  BULK_EDIT_MOVE_TO_POPUP,
  MY_LIST, TRASH, ARCHIVE,
  UPDATING, DIED_UPDATING,
} from '../types/const';
import { doContainListName } from '../utils';

const initialState = {
  listName: MY_LIST,
  searchString: '',
  isAddPopupShown: false,
  isSearchPopupShown: false,
  isProfilePopupShown: false,
  isListNamePopupShown: false,
  isConfirmDeletePopupShown: false,
  isSettingsPopupShown: false,
  status: null,
  isHandlingSignIn: false,
  isBulkEditing: false,
  selectedLinkIds: [],
  isBulkEditMoveToPopupShown: false,
  deletingListName: null,
  fetchedListNames: [],
  listChangedCount: 0,
  exportAllDataProgress: null,
  deleteAllDataProgress: null,
  updateSettingsProgress: null,
};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return {
      ...state,
      ...action.payload.display,
      searchString: '',
      isAddPopupShown: false,
      isSearchPopupShown: false,
      isProfilePopupShown: false,
      isListNamePopupShown: false,
      isConfirmDeletePopupShown: false,
      isSettingsPopupShown: false,
      status: null,
      isHandlingSignIn: false,
      isBulkEditing: false,
      selectedLinkIds: [],
      isBulkEditMoveToPopupShown: false,
      deletingListName: null,
      fetchedListNames: [],
      listChangedCount: 0,
      exportAllDataProgress: null,
      deleteAllDataProgress: null,
      // If in outbox, continue after reload
      //updateSettingsProgress: null,
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

    const { id, isShown } = action.payload;

    if (id === ALL) {
      return {
        ...state,
        isAddPopupShown: isShown,
        isSearchPopupShown: isShown,
        isProfilePopupShown: isShown,
        isListNamePopupShown: isShown,
        isConfirmDeletePopupShown: isShown,
        isSettingsPopupShown: isShown,
        isBulkEditMoveToPopupShown: isShown,
      };
    }

    if (id === ADD_POPUP) {
      return { ...state, isAddPopupShown: isShown };
    }

    if (id === SEARCH_POPUP) {
      return { ...state, isSearchPopupShown: isShown, searchString: '' };
    }

    if (id === PROFILE_POPUP) {
      return { ...state, isProfilePopupShown: isShown };
    }

    if (id === LIST_NAME_POPUP) {
      return { ...state, isListNamePopupShown: isShown };
    }

    if (id === CONFIRM_DELETE_POPUP) {
      const newState = { ...state, isConfirmDeletePopupShown: isShown };
      if (!isShown) newState.deletingListName = null;
      return newState;
    }

    if (id === SETTINGS_POPUP) {
      return { ...state, isSettingsPopupShown: isShown };
    }

    if (id === BULK_EDIT_MOVE_TO_POPUP) {
      return { ...state, isBulkEditMoveToPopupShown: isShown };
    }

    throw new Error(`Invalid type: ${action.type} and payload: ${action.payload}`);
  }

  if (action.type === FETCH) {
    return { ...state, status: FETCH };
  }

  if (action.type === FETCH_COMMIT) {
    const { listName } = action.payload;
    const newState = {
      ...state,
      status: FETCH_COMMIT,
      selectedLinkIds: [],
      fetchedListNames: [...state.fetchedListNames, listName],
    };

    // Make sure listName is in listNameMap, if not, set to My List.
    const { listNames, doFetchSettings, settings } = action.payload;
    if (listNames.includes(newState.listName)) return newState;
    if (!doFetchSettings) return newState;

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
    return { ...state, fetchedListNames: [] };
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

  if (action.type === DELETE_LIST_NAMES) {
    const { listNames } = action.payload;
    if (listNames.includes(state.listName)) {
      return { ...state, listName: MY_LIST };
    }
  }

  if (action.type === UPDATE_DELETING_LIST_NAME) {
    return { ...state, deletingListName: action.payload };
  }

  if (action.type === UPDATE_EXPORT_ALL_DATA_PROGRESS) {
    return { ...state, exportAllDataProgress: action.payload };
  }

  if (action.type === UPDATE_DELETE_ALL_DATA_PROGRESS) {
    return { ...state, deleteAllDataProgress: action.payload };
  }

  if (action.type === UPDATE_SETTINGS) {
    return { ...state, updateSettingsProgress: { status: UPDATING } };
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    return { ...state, updateSettingsProgress: null };
  }

  if (action.type === UPDATE_SETTINGS_ROLLBACK) {
    return { ...state, updateSettingsProgress: { status: DIED_UPDATING } };
  }

  if (action.type === UPDATE_UPDATE_SETTINGS_PROGRESS) {
    return { ...state, updateSettingsProgress: action.payload };
  }

  if (action.type === DELETE_ALL_DATA) {
    return { ...initialState, fetchedListNames: [MY_LIST] };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
