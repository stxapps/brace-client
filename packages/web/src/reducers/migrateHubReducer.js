import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_MIGRATE_HUB_STATE, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { initialMigrateHubState as initialState } from '../types/initialStates';

const migrateHubReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_MIGRATE_HUB_STATE) {
    return { ...state, ...action.payload };
  }

  if (action.type === DELETE_ALL_DATA) {
    return state;
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default migrateHubReducer;
