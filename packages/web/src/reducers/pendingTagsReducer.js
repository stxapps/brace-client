import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import { updateTagDataTStep, cleanUpTags } from '../actions';
import {
  UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_S_STEP_COMMIT, UPDATE_TAG_DATA_S_STEP_ROLLBACK,
  UPDATE_TAG_DATA_T_STEP, UPDATE_TAG_DATA_T_STEP_COMMIT, UPDATE_TAG_DATA_T_STEP_ROLLBACK,
  CANCEL_DIED_TAGS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { isObject } from '../utils';

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
    let { ids, valuesPerId, newTagNameObjsPerId } = action.payload;
    if (!Array.isArray(ids)) ids = [action.payload.id];
    if (!isObject(valuesPerId)) {
      valuesPerId = { [action.payload.id]: action.payload.values };
    }
    if (!isObject(newTagNameObjsPerId)) {
      newTagNameObjsPerId = { [action.payload.id]: action.payload.newTagNameObjs }
    }

    const newState = { ...state };
    for (const id of ids) {
      const [values, newTagNameObjs] = [valuesPerId[id], newTagNameObjsPerId[id]];

      const newValues = [];
      for (const value of values) newValues.push({ ...value });

      const newNewTagNameObjs = [];
      for (const obj of newTagNameObjs) newNewTagNameObjs.push({ ...obj });

      newState[id] = {
        status: action.type, values: newValues, newTagNameObjs: newNewTagNameObjs,
      };
    }

    return newState;
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP_COMMIT) {
    let { ids, valuesPerId } = action.meta;
    if (!Array.isArray(ids)) ids = [action.meta.id]
    if (!isObject(valuesPerId)) {
      valuesPerId = { [action.meta.id]: action.meta.values };
    }

    const newState = { ...state };
    for (const id of ids) {
      newState[id] = { ...state[id], status: action.type };
    }

    return loop(
      newState,
      Cmd.run(
        updateTagDataTStep(ids, valuesPerId), { args: [Cmd.dispatch, Cmd.getState] },
      )
    );
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP_ROLLBACK) {
    let { ids } = action.meta;
    if (!Array.isArray(ids)) ids = [action.meta.id]

    const newState = { ...state };
    for (const id of ids) {
      newState[id] = { ...state[id], status: action.type };
    }
    return newState;
  }

  if (action.type === UPDATE_TAG_DATA_T_STEP) {
    let { ids } = action.payload;
    if (!Array.isArray(ids)) ids = [action.payload.id]

    const newState = { ...state };
    for (const id of ids) {
      newState[id] = { ...state[id], status: action.type };
    }
    return newState;
  }

  if (action.type === UPDATE_TAG_DATA_T_STEP_COMMIT) {
    let { ids } = action.payload;
    if (!Array.isArray(ids)) ids = [action.payload.id]

    const newState = {};
    for (const id in state) {
      if (ids.includes(id)) continue;
      newState[id] = { ...state[id] };
    }

    return loop(
      newState, Cmd.run(cleanUpTags(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_TAG_DATA_T_STEP_ROLLBACK) {
    let { ids } = action.meta;
    if (!Array.isArray(ids)) ids = [action.meta.id]

    const newState = { ...state };
    for (const id of ids) {
      newState[id] = { ...state[id], status: action.type };
    }
    return newState;
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
