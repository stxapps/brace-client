import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import { cleanUpTags } from '../actions';
import {
  UPDATE_TAG_DATA, UPDATE_TAG_DATA_COMMIT, UPDATE_TAG_DATA_ROLLBACK, CANCEL_DIED_TAGS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

/* {
  [link-id-1]: {
    status,
    values: [{ tagName, rank, addedDT, id }, ...],
  },
  [link-id-2]: {
    status,
    values: [{ status, tagName, rank, addedDT, id }, ...],
  }
  ...
} */
const initialState = {};

const pendingTagsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.pendingTags };
  }

  if (action.type === UPDATE_TAG_DATA) {
    const { id, values } = action.payload;

    const newValues = [];
    for (const value of values) newValues.push({ ...value });

    const newState = { ...state };
    newState[id] = { status: action.type, values: newValues };

    return newState;
  }

  if (action.type === UPDATE_TAG_DATA_COMMIT) {
    const { id } = action.meta;

    const newState = { ...state };
    delete newState[id];

    return loop(newState, Cmd.run(cleanUpTags(), { args: [Cmd.dispatch, Cmd.getState] }));
  }

  if (action.type === UPDATE_TAG_DATA_ROLLBACK) {
    const { id } = action.meta;
    return { ...state, [id]: { ...state[id], status: action.type } };
  }

  if (action.type === CANCEL_DIED_TAGS) {
    const { id } = action.payload;

    const newState = { ...state };
    delete newState[id];

    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default pendingTagsReducer;
