import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_LAYOUT_TYPE, UPDATE_THEME, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { LAYOUT_CARD, WHT_MODE, BLK_MODE, } from '../types/const';

const initialState = {
  layoutType: LAYOUT_CARD,
  themeMode: WHT_MODE,
  themeCustomOptions: [
    { mode: WHT_MODE, startTime: '06:00' },
    { mode: BLK_MODE, startTime: '18:00' },
  ],
};

const localSettingsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.localSettings };
  }

  if (action.type === UPDATE_LAYOUT_TYPE) {
    return { ...state, layoutType: action.payload };
  }

  if (action.type === UPDATE_THEME) {
    const { mode, customOptions } = action.payload;
    return { ...state, themeMode: mode, themeCustomOptions: customOptions };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default localSettingsReducer;
