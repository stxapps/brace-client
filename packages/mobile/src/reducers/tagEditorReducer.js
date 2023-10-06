import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_TAG_EDITOR, UPDATE_POPUP, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { ALL, TAG_EDITOR_POPUP } from '../types/const';

const initialState = {
  values: [], // [{ tagName, displayName, color }, ...]
  hints: [], // [{ tagName, displayName, color, isShown }, ...]
  displayName: '',
  color: '',
  didValuesEdit: false,
  didHintsEdit: false,
  msg: '',
};

const tagEditorReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_TAG_EDITOR) {
    const { values } = action.payload;

    const newState = { ...state, ...action.payload };
    if (Array.isArray(values)) {
      newState.values = [];
      for (const value of values) newState.values.push({ ...value });
    }
    return newState;
  }

  if (action.type === UPDATE_POPUP) {
    const { id, isShown } = action.payload;

    if ([ALL, TAG_EDITOR_POPUP].includes(id) && isShown) return { ...initialState };
    return state;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default tagEditorReducer;
