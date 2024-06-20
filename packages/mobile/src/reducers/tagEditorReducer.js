import { REHYDRATE } from 'redux-persist/constants';

import { UPDATE_TAG_EDITOR, DELETE_ALL_DATA, RESET_STATE } from '../types/actionTypes';
import { initialTagEditorState as initialState } from '../types/initialStates';

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

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default tagEditorReducer;
