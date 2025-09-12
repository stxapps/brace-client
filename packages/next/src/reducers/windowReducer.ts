import { REHYDRATE } from 'redux-persist/constants';

import {
  INIT, UPDATE_WINDOW, UPDATE_HREF, UPDATE_SYSTEM_THEME_MODE, UPDATE_IS_24H_FORMAT,
} from '../types/actionTypes';
import { WHT_MODE } from '../types/const';
import { isObject, getWindowSize, getWindowInsets } from '../utils';

const [size, insets] = [getWindowSize(), getWindowInsets()];
const initialState = {
  href: null,
  width: size.width,
  height: size.height,
  visualWidth: size.visualWidth,
  visualHeight: size.visualHeight,
  insetTop: insets.top,
  insetRight: insets.right,
  insetBottom: insets.bottom,
  insetLeft: insets.left,
  themeMode: WHT_MODE,
  is24HFormat: null,
};

const windowReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    const newState = { ...initialState };
    if (isObject(action.payload.window) && 'themeMode' in action.payload.window) {
      newState.themeMode = action.payload.window.themeMode;
    }
    if (isObject(action.payload.window) && 'is24HFormat' in action.payload.window) {
      newState.is24HFormat = action.payload.window.is24HFormat;
    }
    return newState;
  }

  if (action.type === INIT) {
    return {
      ...state,
      themeMode: action.payload.systemThemeMode,
      is24HFormat: action.payload.is24HFormat,
    };
  }

  if (action.type === UPDATE_WINDOW) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_HREF) {
    return { ...state, href: action.payload };
  }

  if (action.type === UPDATE_SYSTEM_THEME_MODE) {
    return { ...state, themeMode: action.payload };
  }

  if (action.type === UPDATE_IS_24H_FORMAT) {
    return { ...state, is24HFormat: action.payload };
  }

  return state;
};

export default windowReducer;
