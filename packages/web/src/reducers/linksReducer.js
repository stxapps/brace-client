import { loop, Cmd } from 'redux-loop';

import {
  UPDATE_POPUP,
  FETCH_COMMIT, FETCH_MORE_COMMIT,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK,
  DELETE_LINKS, DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK,
  CANCEL_DIED_LINKS,
  RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, ADD_POPUP, PROFILE_POPUP, LIST_NAME_POPUP,
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
  MY_LIST, TRASH, ARCHIVE,
  ID, STATUS,
  ADDING, ADDED, MOVING, REMOVING, DELETING,
  DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
} from '../types/const';
import { _ } from '../utils';
import { moveLinksDeleteStep } from '../actions';

const initialState = {
  [MY_LIST]: null,
  [TRASH]: null,
  [ARCHIVE]: null,
};

const toObjAndAddAttrs = (links, status, isPopupShown, popupAnchorPosition) => {
  let obj = _.mapKeys(links, ID);

  obj = _.update(
    obj,
    null,
    null,
    [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION],
    [status, isPopupShown, popupAnchorPosition]
  );

  return obj;
};

export default (state = initialState, action) => {

  if (action.type === FETCH_COMMIT) {
    const { listName, links, listNames } = action.payload;

    const newState = { ...state };
    newState[listName] = _.copyAttr(
      toObjAndAddAttrs(links, ADDED, false, null),
      state[listName],
      [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]
    );

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
      ...toObjAndAddAttrs(links, ADDED, false, null)
    };

    return newState;
  }

  if (action.type === ADD_LINKS) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs(links, ADDING, false, null)
    };

    return newState;
  }

  if (action.type === ADD_LINKS_COMMIT) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, _.extract(links, ID), STATUS, ADDED
    );

    return newState;
  }

  if (action.type === ADD_LINKS_ROLLBACK) {
    const { listName, links } = action.meta;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, _.extract(links, ID), STATUS, DIED_ADDING
    );

    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs(links, MOVING, false, null)
    };

    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP_COMMIT) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, _.extract(links, ID), STATUS, ADDED
    );

    const { fromListName } = action.meta;
    const ids = _.extract(links, ID);

    return loop(
      newState,
      Cmd.run(
        moveLinksDeleteStep(fromListName, ids),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === MOVE_LINKS_ADD_STEP_ROLLBACK) {
    const { listName, links } = action.meta;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, _.extract(links, ID), STATUS, DIED_MOVING
    );

    return newState;
  }

  if (action.type === MOVE_LINKS_DELETE_STEP) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, ids, STATUS, REMOVING
    );

    return newState;
  }

  if (action.type === MOVE_LINKS_DELETE_STEP_COMMIT) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(state[listName], ID, ids);

    return newState;
  }

  if (action.type === MOVE_LINKS_DELETE_STEP_ROLLBACK) {
    const { listName, ids } = action.meta;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, ids, STATUS, DIED_REMOVING
    );

    return newState;
  }

  if (action.type === DELETE_LINKS) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, ids, STATUS, DELETING
    );

    return newState;
  }

  if (action.type === DELETE_LINKS_COMMIT) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(state[listName], ID, ids);

    return newState;
  }

  if (action.type === DELETE_LINKS_ROLLBACK) {
    const { listName, ids } = action.meta;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, ids, STATUS, DIED_DELETING
    );

    return newState;
  }

  if (action.type === CANCEL_DIED_LINKS) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(state[listName], ID, ids);

    return newState;
  }

  if (action.type === UPDATE_POPUP &&
    (action.payload.id === ALL ||
      ![ADD_POPUP, PROFILE_POPUP, LIST_NAME_POPUP].includes(action.payload.id))) {

    const newState = {};

    for (const listName in state) {
      if (action.payload.id === ALL) {
        newState[listName] = _.update(
          state[listName], null, null, IS_POPUP_SHOWN, action.payload.isShown
        );
      } else {
        newState[listName] = _.update(
          state[listName],
          ID,
          action.payload.id,
          [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION],
          [action.payload.isShown, action.payload.anchorPosition]
        );
      }
    }

    return newState;
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
