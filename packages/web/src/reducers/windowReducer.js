import {
  INIT,
  UPDATE_WINDOW, UPDATE_HREF, UPDATE_HISTORY_POSITION, UPDATE_WINDOW_SIZE,
  UPDATE_PAGE_Y_OFFSET,
} from '../types/actionTypes';
import { REHYDRATE } from 'redux-persist/constants';

const initialState = {
  href: null,
  historyPosition: null,
  width: null,
  height: null,
  pageYOffset: 0,
};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === INIT) {
    return {
      ...state,
      href: action.payload.href,
      width: action.payload.windowWidth,
      height: action.payload.windowHeight,
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

  if (action.type === UPDATE_PAGE_Y_OFFSET) {
    return { ...state, pageYOffset: action.payload };
  }

  return state;
};
