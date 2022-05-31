import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_LINK_EDITOR, UPDATE_POPUP, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { ALL, ADD_POPUP } from '../types/const';

const initialState = {
  url: '',
  msg: '',
  isAskingConfirm: false,
};

const linkEditorReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_LINK_EDITOR) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    const { id, isShown } = action.payload;

    if ([ALL, ADD_POPUP].includes(id) && isShown) return { ...initialState };
    return state;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default linkEditorReducer;
