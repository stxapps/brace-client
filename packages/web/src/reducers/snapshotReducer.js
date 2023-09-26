import { REHYDRATE } from 'redux-persist/constants';

import {
  FETCH_COMMIT, UPDATE_SETTINGS_COMMIT, MERGE_SETTINGS_COMMIT, UPDATE_INFO_COMMIT,
  UPDATE_TAG_DATA_S_STEP_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { deriveSettingsState, deriveInfoState } from '../utils';
import { initialSettingsState, initialInfoState } from '../types/initialStates';

const initialState = {
  settings: { ...initialSettingsState },
  info: { ...initialInfoState },
};

const snapshotReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.snapshot };
  }

  if (action.type === FETCH_COMMIT) {
    const {
      doFetchStgsAndInfo, settings, conflictedSettings, info, listNames, tagNames
    } = action.payload;
    if (!doFetchStgsAndInfo) return state;

    let derivedSettings = deriveSettingsState(
      listNames, tagNames, settings, initialSettingsState
    );
    if (Array.isArray(conflictedSettings) && conflictedSettings.length > 0) {
      derivedSettings = { ...state.settings };
    }

    const derivedInfo = deriveInfoState(info, initialInfoState);

    const newState = {
      ...state, settings: { ...derivedSettings }, info: { ...derivedInfo },
    };
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_COMMIT || action.type === MERGE_SETTINGS_COMMIT) {
    return { ...state, settings: { ...action.payload.settings } };
  }

  if (action.type === UPDATE_INFO_COMMIT) {
    return { ...state, info: { ...action.payload.info } };
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP_COMMIT) {
    const { doUpdateSettings, settings } = action.payload;
    if (!doUpdateSettings) return state;

    return { ...state, settings: { ...settings } };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default snapshotReducer;
