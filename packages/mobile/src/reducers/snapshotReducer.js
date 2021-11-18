import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_FETCHED_SETTINGS, UPDATE_SETTINGS_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { initialSettingsState } from '../types/initialStates';

const initialState = {
  settings: { ...initialSettingsState },
};

const snapshotReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.snapshot };
  }

  if (action.type === UPDATE_FETCHED_SETTINGS) {
    return { ...state, settings: { ...action.payload } };
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
