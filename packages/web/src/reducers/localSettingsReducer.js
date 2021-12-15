import { REHYDRATE } from 'redux-persist/constants';

import { UPDATE_LAYOUT_TYPE, DELETE_ALL_DATA, RESET_STATE } from '../types/actionTypes';
import { LAYOUT_CARD } from '../types/const';

const initialState = {
  layoutType: LAYOUT_CARD,
};

const localSettingsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.localSettings };
  }

  if (action.type === UPDATE_LAYOUT_TYPE) {
    return { ...state, layoutType: action.payload };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default localSettingsReducer;
