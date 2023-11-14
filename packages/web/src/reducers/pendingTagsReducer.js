import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import { updateTagDataTStep, cleanUpTags } from '../actions';
import {
  UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_S_STEP_COMMIT, UPDATE_TAG_DATA_S_STEP_ROLLBACK,
  UPDATE_TAG_DATA_T_STEP, UPDATE_TAG_DATA_T_STEP_COMMIT, UPDATE_TAG_DATA_T_STEP_ROLLBACK,
  CANCEL_DIED_TAGS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

/* {
  [link-id-1]: {
    status,
    values: [{ tagName, rank, addedDT, id }, ...],
    newTagNameObjs: [],
  },
  [link-id-2]: {
    status,
    values: [{ tagName, rank, addedDT, id }, ...],
    newTagNameObjs: [],
  }
  ...
} */
const initialState = {};

const pendingTagsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.pendingTags };
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP) {
    const { id, values, newTagNameObjs } = action.payload;

    const newValues = [];
    for (const value of values) newValues.push({ ...value });

    const newNewTagNameObjs = [];
    for (const obj of newTagNameObjs) newNewTagNameObjs.push({ ...obj });

    const newState = { ...state };
    newState[id] = {
      status: action.type, values: newValues, newTagNameObjs: newNewTagNameObjs,
    };

    return newState;
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP_COMMIT) {
    const { id, values } = action.meta;

    const newState = { ...state, [id]: { ...state[id], status: action.type } };
    return loop(
      newState,
      Cmd.run(
        updateTagDataTStep(id, values), { args: [Cmd.dispatch, Cmd.getState] },
      )
    );
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP_ROLLBACK) {
    const { id } = action.meta;
    return { ...state, [id]: { ...state[id], status: action.type } };
  }

  if (action.type === UPDATE_TAG_DATA_T_STEP) {
    const { id } = action.payload;
    return { ...state, [id]: { ...state[id], status: action.type } };
  }

  if (action.type === UPDATE_TAG_DATA_T_STEP_COMMIT) {
    const { id } = action.payload;

    const newState = { ...state };
    delete newState[id];

    return loop(
      newState, Cmd.run(cleanUpTags(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_TAG_DATA_T_STEP_ROLLBACK) {
    const { id } = action.meta;
    return { ...state, [id]: { ...state[id], status: action.type } };
  }

  if (action.type === CANCEL_DIED_TAGS) {
    const { ids } = action.payload;

    const newState = {};
    for (const id in state) {
      if (ids.includes(id)) continue;
      newState[id] = { ...state[id] };
    }
    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default pendingTagsReducer;
