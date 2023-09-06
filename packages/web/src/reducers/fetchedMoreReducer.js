import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_FETCHED, CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, REFRESH_FETCHED,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {};

const fetchedMoreReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_FETCHED) {
    const { lnOrQt } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== lnOrQt) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === CACHE_FETCHED_MORE) {
    const { payload } = action;
    return { ...state, [payload.lnOrQt]: { payload } };
  }

  if (action.type === UPDATE_FETCHED_MORE || action.type === REFRESH_FETCHED) {
    const { lnOrQt } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== lnOrQt) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default fetchedMoreReducer;
