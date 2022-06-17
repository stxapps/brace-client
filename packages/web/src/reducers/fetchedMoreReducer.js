import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_FETCHED, CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {};

const fetchedMoreReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_FETCHED) {
    const { listName } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== listName) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === CACHE_FETCHED_MORE) {
    const { payload, theMeta: meta } = action;
    return { ...state, [payload.listName]: { payload, meta } };
  }

  // If dispatch CACHE_FETCHED_MORE, CANCEL_FETCHED_MORE won't be dispatched
  //  so no need to reset value for CANCEL_FETCHED_MORE here.
  if (action.type === UPDATE_FETCHED_MORE) {
    const { listName } = action.theMeta;

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

export default fetchedMoreReducer;
