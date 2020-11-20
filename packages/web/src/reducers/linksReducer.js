import { REHYDRATE } from 'redux-persist/constants'
import { loop, Cmd } from 'redux-loop';

import {
  UPDATE_POPUP,
  FETCH_COMMIT, FETCH_MORE_COMMIT,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK,
  DELETE_LINKS, DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK,
  CANCEL_DIED_LINKS,
  DELETE_OLD_LINKS_IN_TRASH_COMMIT, EXTRACT_CONTENTS_COMMIT,
  DELETE_LIST_NAMES_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, ADD_POPUP, PROFILE_POPUP, LIST_NAME_POPUP,
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
  MY_LIST, TRASH, ARCHIVE,
  ID, STATUS,
  ADDED, ADDING, MOVING, REMOVING, DELETING,
  DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
} from '../types/const';
import { _, isEqual } from '../utils';
import { moveLinksDeleteStep, deleteOldLinksInTrash, extractContents } from '../actions';

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

  if (action.type === REHYDRATE) {
    const newState = { ...state };
    for (const listName in action.payload.links) {
      newState[listName] = _.update(
        action.payload.links[listName],
        null,
        null,
        [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION],
        [false, null]
      );
    }

    return newState;
  }

  if (action.type === FETCH_COMMIT) {
    const { listName, links, listNames } = action.payload;

    const processingLinks = _.exclude(state[listName], STATUS, ADDED);
    const fetchedLinks = _.copyAttr(
      toObjAndAddAttrs(links, ADDED, false, null),
      state[listName],
      [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]
    );

    const newState = { ...state };
    newState[listName] = { ...processingLinks, ...fetchedLinks };

    for (const name of listNames) {
      if (!(name in newState)) {
        newState[name] = null;
      }
    }

    const { doDeleteOldLinksInTrash, doExtractContents } = action.meta;
    if (doDeleteOldLinksInTrash) {
      return loop(
        newState,
        Cmd.run(
          deleteOldLinksInTrash(doExtractContents),
          { args: [Cmd.dispatch, Cmd.getState] })
      );
    }
    if (doExtractContents) {
      return loop(
        newState,
        Cmd.run(
          extractContents(null, null),
          { args: [Cmd.dispatch, Cmd.getState] })
      );
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

    const { doExtractContents } = action.meta;
    if (doExtractContents) {
      return loop(
        newState,
        Cmd.run(
          extractContents(null, null),
          { args: [Cmd.dispatch, Cmd.getState] })
      );
    }
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

    const { doExtractContents } = action.meta;
    if (doExtractContents) {
      return loop(
        newState,
        Cmd.run(
          extractContents(listName, _.extract(links, ID)),
          { args: [Cmd.dispatch, Cmd.getState] })
      );
    }
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

    const { fromListName, ids } = action.meta;

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

    for (const id of ids) {
      // DIED_ADDING -> remove this link
      // DIED_MOVING -> remove this link
      // DIED_REMOVING -> just set status to ADDED
      // DIED_DELETING -> just set status to ADDED
      const status = state[listName][id].status;
      if ([DIED_ADDING, DIED_MOVING].includes(status)) {
        continue;
      } else if ([DIED_REMOVING, DIED_DELETING].includes(status)) {
        newState[listName][id] = { ...state[listName][id], status: ADDED };
      } else {
        throw new Error(`Invalid status: ${status} of link id: ${id}`);
      }
    }

    return newState;
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(state[listName], ID, ids);

    const { doExtractContents } = action.meta;
    if (doExtractContents) {
      return loop(
        newState,
        Cmd.run(
          extractContents(null, null),
          { args: [Cmd.dispatch, Cmd.getState] })
      );
    }
    return newState;
  }

  if (action.type === EXTRACT_CONTENTS_COMMIT) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = { ...newState[listName] };
    for (const link of links) {
      newState[listName][link.id] = { ...newState[listName][link.id] };
      for (const key of ['extractedResult']) {
        newState[listName][link.id][key] = link[key];
      }
    }

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

  if (action.type === DELETE_LIST_NAMES_COMMIT) {

    const { listNames } = action.meta;

    const newState = {};
    for (const listName in state) {
      if (listNames.includes(listName)) {
        if (
          state[listName] !== undefined &&
          state[listName] !== null &&
          !isEqual(state[listName], {})
        ) {
          throw new Error(`links: ${listName} should be undefined, null, or an empty object.`);
        }
        continue;
      }
      newState[listName] = state[listName];
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = {};
    for (const k in initialState) {
      if (initialState.hasOwnProperty(k)) {
        newState[k] = {};
      }
    }
    return newState;
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
