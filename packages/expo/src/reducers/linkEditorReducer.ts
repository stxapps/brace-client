import { REHYDRATE } from 'redux-persist/constants';

import { UPDATE_LINK_EDITOR, DELETE_ALL_DATA, RESET_STATE } from '../types/actionTypes';
import { initialLinkEditorState as initialState } from '../types/initialStates';
import { cloneDeep } from '../utils';

const linkEditorReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return cloneDeep(initialState);
  }

  if (action.type === UPDATE_LINK_EDITOR) {
    return cloneDeep({ ...state, ...action.payload });
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return cloneDeep(initialState);
  }

  return state;
};

export default linkEditorReducer;
