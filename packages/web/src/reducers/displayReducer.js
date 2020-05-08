import { REHYDRATE } from 'redux-persist/constants'

import {
  UPDATE_LIST_NAME, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
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
};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return {
      ...state,
      ...action.payload.display,
      isAddPopupShown: false,
      isSearchPopupShown: false,
      isProfilePopupShown: false,
      isListNamePopupShown: false,
      isConfirmDeletePopupShown: false,
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

  if (action.type === FETCH_MORE) {
    return { ...state, isFetchingMore: true };
  }

  if (action.type === FETCH_MORE_COMMIT || action.type === FETCH_MORE_ROLLBACK) {
    return { ...state, isFetchingMore: false };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
