import { REHYDRATE } from 'redux-persist/constants'

import {
  FETCH_COMMIT, FETCH_MORE, FETCH_MORE_ROLLBACK, UPDATE_FETCHED_MORE, CANCEL_FETCHED_MORE,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

/* {
  [list-name-1]: {
    [fetch-more-id-1]: false,
    [fetch-more-id-2]: false,
    ...
  },
  [list-name-2]: {
    ...
  },
  ...
} */
const initialState = {};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.isFetchMoreInterrupted };
  }

  if (action.type === FETCH_COMMIT) {
    const { listName } = action.payload;

    const newObj = {};
    for (const id in state[listName]) {
      newObj[id] = true;
    }

    return { ...state, [listName]: newObj };
  }

  if (action.type === FETCH_MORE) {
    const { fetchMoreId, listName } = action.payload;

    const newState = { ...state };
    newState[listName] = { ...state[listName], [fetchMoreId]: false };
    return newState;
  }

  if (action.type === FETCH_MORE_ROLLBACK) {
    const { fetchMoreId, listName } = action.meta;

    const newObj = {};
    for (const id in state[listName]) {
      if (id === fetchMoreId) continue;
      newObj[id] = state[listName][id];
    }

    return { ...state, [listName]: newObj };
  }

  if (action.type === UPDATE_FETCHED_MORE || action.type === CANCEL_FETCHED_MORE) {
    const { fetchMoreId, listName } = action.theMeta;

    const newObj = {};
    for (const id in state[listName]) {
      if (id === fetchMoreId) continue;
      newObj[id] = state[listName][id];
    }

    return { ...state, [listName]: newObj };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
