import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_CUSTOM_EDITOR, UPDATE_POPUP, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { ALL, CUSTOM_EDITOR_POPUP } from '../types/const';

const initialState = {
  title: '',
  image: null,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  zoom: 0,
  didTitleEdit: false,
  didImageEdit: false,
  msg: '',
};

const customEditorReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_CUSTOM_EDITOR) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    const { id, isShown } = action.payload;

    if ([ALL, CUSTOM_EDITOR_POPUP].includes(id) && isShown) return { ...initialState };
    return state;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default customEditorReducer;
