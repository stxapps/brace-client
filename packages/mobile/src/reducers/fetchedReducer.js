import { REHYDRATE } from 'redux-persist/constants'

import {
  CACHE_FETCHED, UPDATE_FETCHED, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === CACHE_FETCHED) {
    const { payload, meta } = action;
    return { ...state, [payload.listName]: { payload, meta } };
  }

  if (action.type === UPDATE_FETCHED) {
    const { listName } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== listName) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
