import { REHYDRATE } from 'redux-persist/constants';

import {
  ADD_LOCK_LIST, REMOVE_LOCK_LIST, LOCK_LIST, UNLOCK_LIST, CLEAN_UP_LOCKS,
  UPDATE_LOCKS_FOR_ACTIVE_APP, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { initialLockSettingsState as initialState } from '../types/initialStates';

/* {
  lockedLists: {
    listName: { password, canChangeListNames, canExport, unlockedDT },
  },
} */

const lockSettingsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    const { lockSettings } = action.payload;
    return { ...state, ...lockSettings };
  }

  if (action.type === ADD_LOCK_LIST) {
    const { listName, password, canChangeListNames, canExport } = action.payload;

    const newState = { ...state };
    newState.lockedLists = {
      ...newState.lockedLists, [listName]: { password, canChangeListNames, canExport },
    };

    return newState;
  }

  if (action.type === REMOVE_LOCK_LIST) {
    const { listName } = action.payload;

    const newState = { ...state, lockedLists: {} };
    for (const k in state.lockedLists) {
      if (k === listName) continue;
      newState.lockedLists[k] = state.lockedLists[k];
    }

    return newState;
  }

  if (action.type === LOCK_LIST) {
    const { listName } = action.payload;

    const newState = { ...state, lockedLists: {} };
    for (const k in state.lockedLists) {
      if (k === listName) {
        const value = {};
        for (const kk in state.lockedLists[k]) {
          if (kk === 'unlockedDT') continue;
          value[kk] = state.lockedLists[k][kk];
        }
        newState.lockedLists[k] = value;
        continue;
      }
      newState.lockedLists[k] = state.lockedLists[k];
    }

    return newState;
  }

  if (action.type === UNLOCK_LIST) {
    const { listName, unlockedDT } = action.payload;

    const newState = { ...state, lockedLists: {} };
    for (const k in state.lockedLists) {
      if (k === listName) {
        newState.lockedLists[k] = { ...state.lockedLists[k], unlockedDT };
        continue;
      }
      newState.lockedLists[k] = state.lockedLists[k];
    }

    return newState;
  }

  if (action.type === CLEAN_UP_LOCKS) {
    const { listNames } = action.payload;

    const newState = { ...state, lockedLists: {} };
    for (const k in state.lockedLists) {
      if (listNames.includes(k)) continue;
      newState.lockedLists[k] = state.lockedLists[k];
    }

    return newState;
  }

  if (action.type === UPDATE_LOCKS_FOR_ACTIVE_APP) {
    const { isLong } = action.payload;
    if (!isLong) return state;

    const newState = { ...state, lockedLists: {} };
    for (const k in state.lockedLists) {
      const value = {};
      for (const kk in state.lockedLists[k]) {
        if (kk === 'unlockedDT') continue;
        value[kk] = state.lockedLists[k][kk];
      }
      newState.lockedLists[k] = value;
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA) {
    return { ...initialState };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default lockSettingsReducer;
