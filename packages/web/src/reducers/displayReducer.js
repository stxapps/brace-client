import { REHYDRATE } from 'redux-persist/constants'

import { UPDATE_LIST_NAME, UPDATE_POPUP } from '../types/actionTypes';
import {
  ALL, ADD_POPUP, PROFILE_POPUP, LIST_NAME_POPUP,
  MY_LIST,
} from '../types/const';

const initialState = {
  listName: MY_LIST,
  searchString: '',
  isAddPopupShown: false,
  isProfilePopupShown: false,
  isListNamePopupShown: false,
};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...state, ...action.payload.display, isPopupShown: 0 };
  }

  if (action.type === UPDATE_LIST_NAME) {
    return { ...state, listName: action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    if (action.payload.id === ALL) {
      return {
        ...state,
        isAddPopupShown: action.payload.isShown,
        isProfilePopupShown: action.payload.isShown,
        isListNamePopupShown: action.payload.isShown,
      }
    }

    if (action.payload.id === ADD_POPUP) {
      return { ...state, isAddPopupShown: action.payload.isShown }
    }

    if (action.payload.id === PROFILE_POPUP) {
      return { ...state, isProfilePopupShown: action.payload.isShown }
    }

    if (action.payload.id === LIST_NAME_POPUP) {
      return { ...state, isListNamePopupShown: action.payload.isShown }
    }
  }

  return state;
};
