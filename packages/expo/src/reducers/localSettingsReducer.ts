import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_USER, UPDATE_DO_USE_LOCAL_LAYOUT, UPDATE_LOCAL_LAYOUT_TYPE,
  UPDATE_DO_USE_LOCAL_THEME, UPDATE_LOCAL_THEME, UPDATE_DO_USE_LOCAL_ADD_MODE,
  UPDATE_LOCAL_ADD_MODE, UPDATE_CUSTOM_DATA_COMMIT, CLEAN_UP_STATIC_FILES_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { initialLocalSettingsState as initialState } from '../types/initialStates';

const localSettingsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.localSettings };
  }

  if (action.type === UPDATE_USER) {
    return { ...state, signInDT: Date.now() };
  }

  if (action.type === UPDATE_DO_USE_LOCAL_LAYOUT) {
    return { ...state, doUseLocalLayout: action.payload };
  }

  if (action.type === UPDATE_LOCAL_LAYOUT_TYPE) {
    return { ...state, layoutType: action.payload };
  }

  if (action.type === UPDATE_DO_USE_LOCAL_THEME) {
    return { ...state, doUseLocalTheme: action.payload };
  }

  if (action.type === UPDATE_LOCAL_THEME) {
    const { mode, customOptions } = action.payload;
    return { ...state, themeMode: mode, themeCustomOptions: customOptions };
  }

  if (action.type === UPDATE_DO_USE_LOCAL_ADD_MODE) {
    return { ...state, doUseLocalAddMode: action.payload };
  }

  if (action.type === UPDATE_LOCAL_ADD_MODE) {
    return { ...state, addMode: action.payload };
  }

  if (action.type === UPDATE_CUSTOM_DATA_COMMIT) {
    if (state.cleanUpStaticFilesDT === null) {
      return { ...state, cleanUpStaticFilesDT: Date.now() };
    }
    return state;
  }

  if (action.type === CLEAN_UP_STATIC_FILES_COMMIT) {
    return { ...state, cleanUpStaticFilesDT: Date.now() };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default localSettingsReducer;
