import { REHYDRATE } from 'redux-persist/constants'

import {
  UPDATE_LIST_NAME, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  UPDATE_STATUS,
  RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, LIST_NAME_POPUP, CONFIRM_DELETE_POPUP,
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
  isFetchingMore: false,
  status: null,
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
      status: null,
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

  if (action.type === UPDATE_STATUS) {
    return { ...state, status: action.payload };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
