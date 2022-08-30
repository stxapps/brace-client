import { REHYDRATE } from 'redux-persist/constants';

import {
  INIT, UPDATE_WINDOW, UPDATE_HREF, UPDATE_HISTORY_POSITION, UPDATE_WINDOW_SIZE,
  UPDATE_SYSTEM_THEME_MODE,
} from '../types/actionTypes';
import { WHT_MODE } from '../types/const';
import { isNumber } from '../utils';

const initialState = {
  href: null,
  historyPosition: null,
  width: (window && isNumber(window.innerWidth)) ? window.innerWidth : null,
  height: (window && isNumber(window.innerHeight)) ? window.innerHeight : null,
  themeMode: WHT_MODE,
  is24HFormat: null,
};

const windowReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return {
      ...initialState,
      width: (window && isNumber(window.innerWidth)) ? window.innerWidth : null,
      height: (window && isNumber(window.innerHeight)) ? window.innerHeight : null,
      themeMode: action.payload.window.themeMode,
      is24HFormat: action.payload.window.is24HFormat,
    };
  }

  if (action.type === INIT) {
    return {
      ...state,
      href: action.payload.href,
      width: action.payload.windowWidth,
      height: action.payload.windowHeight,
      themeMode: action.payload.systemThemeMode,
      is24HFormat: action.payload.is24HFormat,
    };
  }

  if (action.type === UPDATE_WINDOW) {
    return {
      ...state,
      href: action.payload.href,
      historyPosition: action.payload.historyPosition,
    };
  }

  if (action.type === UPDATE_HREF) {
    return { ...state, href: action.payload };
  }

  if (action.type === UPDATE_HISTORY_POSITION) {
    return { ...state, historyPosition: action.payload };
  }

  if (action.type === UPDATE_WINDOW_SIZE) {
    return {
      ...state,
      width: action.payload.windowWidth,
      height: action.payload.windowHeight,
    };
  }

  if (action.type === UPDATE_SYSTEM_THEME_MODE) {
    return { ...state, themeMode: action.payload };
  }

  return state;
};

export default windowReducer;
