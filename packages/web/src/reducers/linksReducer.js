import {
  UPDATE_POPUP,
  FETCH_COMMIT, FETCH_MORE_COMMIT,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK,
  DELETE_LINKS,
} from '../types/actionTypes';
import {
  ALL, ADD_POPUP, PROFILE_POPUP, LIST_NAME_POPUP, IS_POPUP_SHOWN,
  MY_LIST, TRASH, ARCHIVE,
  ID, STATUS,
  ADDING, ADDED, REMOVING, DIED_ADDING, DIED_REMOVING,
} from '../types/const';
import { _ } from '../utils';

const initialState = {
  [MY_LIST]: null,
  [TRASH]: null,
  [ARCHIVE]: null,
};

const toObjAndAddAttrs = (links, status, isShown) => {
  let obj = _.mapKeys(links, ID);

  if (status !== undefined && status !== null) {
    obj = _.update(obj, null, null, STATUS, status);
  }
  if (isShown !== undefined && isShown !== null) {
    obj = _.update(obj, null, null, IS_POPUP_SHOWN, isShown);
  }

  return obj;
};

export default (state = initialState, action) => {

  if (action.type === FETCH_COMMIT) {
    const { listName, links, listNames } = action.payload;

    const newState = { ...state };
    newState[listName] = toObjAndAddAttrs(links, ADDED, false);

    for (const name of listNames) {
      if (!(name in newState)) {
        newState[name] = null;
      }
    }

    return newState;
  }

  if (action.type === FETCH_MORE_COMMIT) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs(links, ADDED, false)
    };

    return newState;
  }

  if (action.type === ADD_LINKS) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs(links, ADDING, false)
    };

    return newState;
  }

  if (action.type === ADD_LINKS_COMMIT) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs(links, ADDED, null),
    };

    return newState;
  }

  if (action.type === ADD_LINKS_ROLLBACK) {
    const { listName, links } = action.meta;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs(links, DIED_ADDING, null)
    };

    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP) {

  }

  if (action.type === MOVE_LINKS_ADD_STEP_COMMIT) {

  }

  if (action.type === MOVE_LINKS_ADD_STEP_ROLLBACK) {

  }

  if (action.type === MOVE_LINKS_DELETE_STEP) {

  }

  if (action.type === MOVE_LINKS_DELETE_STEP_COMMIT) {

  }

  if (action.type === MOVE_LINKS_DELETE_STEP_ROLLBACK) {

  }

  if (action.type === DELETE_LINKS) {

  }

  if (action.type === UPDATE_POPUP &&
    (action.payload.id === ALL ||
      ![ADD_POPUP, PROFILE_POPUP, LIST_NAME_POPUP].includes(action.payload.id))) {

    const newState = {};

    for (const listName in state) {
      if (action.payload.id === ALL) {
        newState[listName] = _.update(state[listName], null, null, IS_POPUP_SHOWN, action.payload.isShown);
      } else {
        newState[listName] = _.update(state[listName], ID, action.payload.id, IS_POPUP_SHOWN, action.payload.isShown);
      }
    }

    return newState;
  }

  return state;
};
