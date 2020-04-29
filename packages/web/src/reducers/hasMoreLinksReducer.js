import { FETCH_COMMIT, FETCH_MORE_COMMIT } from '../types/actionTypes';
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

  return state;
};
