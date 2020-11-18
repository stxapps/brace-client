import {
  FETCH_COMMIT, FETCH_MORE_COMMIT,
  DELETE_LIST_NAMES_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  MY_LIST, TRASH, ARCHIVE,
} from '../types/const';

const initialState = {
  [MY_LIST]: null,
  [TRASH]: null,
  [ARCHIVE]: null,
};

export default (state = initialState, action) => {

  if (action.type === FETCH_COMMIT || action.type === FETCH_MORE_COMMIT) {
    const { listName, hasMore } = action.payload;
    return { ...state, [listName]: hasMore };
  }

  if (action.type === DELETE_LIST_NAMES_COMMIT) {

    const { listNames } = action.meta;

    const newState = {};
    for (const listName in state) {
      if (listNames.includes(listName)) continue;
      newState[listName] = state[listName];
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = {};
    for (const k in initialState) {
      if (initialState.hasOwnProperty(k)) {
        newState[k] = false;
      }
    }
    return newState;
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
