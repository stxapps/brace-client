import { REHYDRATE } from 'redux-persist/constants';

import {
  FETCH_COMMIT, UPDATE_SETTINGS_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { deriveSettingsState } from '../utils';
import { initialSettingsState } from '../types/initialStates';

const initialState = {
  settings: { ...initialSettingsState },
};

const snapshotReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.snapshot };
  }

  if (action.type === FETCH_COMMIT) {
    const { listNames, doFetchSettings, settings } = action.payload;
    if (!doFetchSettings) return state;

    const derivedSettings = deriveSettingsState(listNames, settings, initialState);
    const newState = { ...state, settings: { ...derivedSettings } };
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    return { ...state, settings: { ...action.meta.settings } };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default snapshotReducer;
