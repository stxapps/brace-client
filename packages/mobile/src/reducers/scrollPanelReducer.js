import { REHYDRATE } from 'redux-persist/constants';

import { UPDATE_SCROLL_PANEL } from '../types/actionTypes';

const initialState = {
  contentHeight: null,
  layoutHeight: null,
  pageYOffset: null,
};

const scrollPanelReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_SCROLL_PANEL) {
    return { ...state, ...action.payload };
  }

  return state;
};

export default scrollPanelReducer;
