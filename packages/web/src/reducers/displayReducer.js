import { REHYDRATE } from 'redux-persist/constants'

import { UPDATE_POPUP } from '../types/actionTypes';
import {
  MY_LIST,
} from '../types/const';

const initialState = {
  listName: MY_LIST,
  searchString: '',
  isPopupShown: false,
};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...state, ...action.payload.display, isPopupShown: false };
  }

  if (action.type === UPDATE_POPUP) {
    return { ...state, isPopupShown: action.payload };
  }

  return state;
};
