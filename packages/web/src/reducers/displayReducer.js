import { REHYDRATE } from 'redux-persist/constants'

import {
  UPDATE_LIST_NAME, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_ROLLBACK, EXTRACT_CONTENTS_COMMIT,
  UPDATE_STATUS, UPDATE_CARD_ITEM_MENU_POPUP_POSITION,
  UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING,
  ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS, CLEAR_SELECTED_LINK_IDS,
  UPDATE_DELETING_LIST_NAME,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, LIST_NAME_POPUP,
  CONFIRM_DELETE_POPUP, SETTINGS_POPUP,
  BULK_EDIT_MOVE_TO_POPUP,
  MY_LIST,
} from '../types/const';

const initialState = {
  listName: MY_LIST,
  searchString: '',
  isAddPopupShown: false,
  isSearchPopupShown: false,
  isProfilePopupShown: false,
  isListNamePopupShown: false,
  isConfirmDeletePopupShown: false,
  isSettingsPopupShown: false,
  isFetchingMore: false,
  status: null,
  cardItemMenuPopupPosition: null,
  isHandlingSignIn: false,
  isBulkEditing: false,
  selectedLinkIds: [],
  isBulkEditMoveToPopupShown: false,
  deletingListName: null,
  exportAllDataProgress: null,
  deleteAllDataProgress: null,
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
      cardItemMenuPopupPosition: null,
      isHandlingSignIn: false,
      isBulkEditing: false,
      selectedLinkIds: [],
      isBulkEditMoveToPopupShown: false,
      deletingListName: null,
      exportAllDataProgress: null,
      deleteAllDataProgress: null,
    };
  }

  if (action.type === UPDATE_LIST_NAME) {
    return { ...state, listName: action.payload };
  }

  if (action.type === UPDATE_SEARCH_STRING) {
    return { ...state, searchString: action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    if (action.payload.id === ALL) {
      return {
        ...state,
        isAddPopupShown: action.payload.isShown,
        isSearchPopupShown: action.payload.isShown,
        isProfilePopupShown: action.payload.isShown,
        isListNamePopupShown: action.payload.isShown,
        isConfirmDeletePopupShown: action.payload.isShown,
        isSettingsPopupShown: action.payload.isShown,
        isBulkEditMoveToPopupShown: action.payload.isShown,
      }
    }

    if (action.payload.id === ADD_POPUP) {
      return { ...state, isAddPopupShown: action.payload.isShown }
    }

    if (action.payload.id === SEARCH_POPUP) {
      return { ...state, isSearchPopupShown: action.payload.isShown }
    }

    if (action.payload.id === PROFILE_POPUP) {
      return { ...state, isProfilePopupShown: action.payload.isShown }
    }

    if (action.payload.id === LIST_NAME_POPUP) {
      return { ...state, isListNamePopupShown: action.payload.isShown }
    }

    if (action.payload.id === CONFIRM_DELETE_POPUP) {
      return { ...state, isConfirmDeletePopupShown: action.payload.isShown }
    }

    if (action.payload.id === SETTINGS_POPUP) {
      return { ...state, isSettingsPopupShown: action.payload.isShown }
    }

    if (action.payload.id === BULK_EDIT_MOVE_TO_POPUP) {
      return { ...state, isBulkEditMoveToPopupShown: action.payload.isShown }
    }
  }

  if (action.type === FETCH) {
    return { ...state, status: FETCH };
  }

  if (action.type === FETCH_COMMIT) {
    return { ...state, status: FETCH_COMMIT };
  }

  if (action.type === FETCH_ROLLBACK) {
    return { ...state, status: FETCH_ROLLBACK };
  }

  if (action.type === FETCH_MORE) {
    return { ...state, isFetchingMore: true };
  }

  if (action.type === FETCH_MORE_COMMIT || action.type === FETCH_MORE_ROLLBACK) {
    return { ...state, isFetchingMore: false };
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

  if (action.type === UPDATE_CARD_ITEM_MENU_POPUP_POSITION) {
    return { ...state, cardItemMenuPopupPosition: action.payload };
  }

  if (action.type === UPDATE_HANDLING_SIGN_IN) {
    return { ...state, isHandlingSignIn: action.payload };
  }

  if (action.type === UPDATE_BULK_EDITING) {
    return { ...state, isBulkEditing: action.payload };
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

  if (action.type === CLEAR_SELECTED_LINK_IDS) {
    return { ...state, selectedLinkIds: [] };
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

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
