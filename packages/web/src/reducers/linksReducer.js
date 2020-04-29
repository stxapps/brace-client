import {
  FETCH_COMMIT, FETCH_MORE_COMMIT,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK,
  DELETE_LINKS,
} from '../types/actionTypes';
import {
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

export default (state = initialState, action) => {

  if (action.type === FETCH_COMMIT) {
    const { listName, links, listNames } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(_.mapKeys(links, ID), null, null, STATUS, ADDED);

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
      ..._.update(_.mapKeys(links, ID), null, null, STATUS, ADDED),
    };

    return newState;
  }

  if (action.type === ADD_LINKS) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ..._.update(_.mapKeys(links, ID), null, null, STATUS, ADDING),
    };

    return newState;
  }

  if (action.type === ADD_LINKS_COMMIT) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ..._.update(_.mapKeys(links, ID), null, null, STATUS, ADDED),
    };

    return newState;
  }

  if (action.type === ADD_LINKS_ROLLBACK) {
    const { listName, links } = action.meta;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ..._.update(_.mapKeys(links, ID), null, null, STATUS, DIED_ADDING),
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

  return state;
};
