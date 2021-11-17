import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import {
  UPDATE_POPUP,
  FETCH_COMMIT, UPDATE_FETCHED, FETCH_MORE_COMMIT, UPDATE_FETCHED_MORE,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK,
  DELETE_LINKS, DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK,
  CANCEL_DIED_LINKS, DELETE_OLD_LINKS_IN_TRASH_COMMIT, EXTRACT_CONTENTS_COMMIT,
  UPDATE_EXTRACTED_CONTENTS, UPDATE_SETTINGS, CANCEL_DIED_SETTINGS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, ADD_POPUP, PROFILE_POPUP, LIST_NAME_POPUP,
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
  MY_LIST, TRASH, ARCHIVE,
  ID, STATUS, N_LINKS,
  ADDED, MOVED, ADDING, MOVING, REMOVING, DELETING,
  DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
} from '../types/const';
import { _, isEqual } from '../utils';
import {
  tryUpdateFetched, tryUpdateFetchedMore, moveLinksDeleteStep, deleteOldLinksInTrash,
  extractContents, tryUpdateExtractedContents,
} from '../actions';

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

const linksReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    const newState = { ...state };
    for (const listName in action.payload.links) {

      const processingLinks = _.update(
        _.exclude(action.payload.links[listName], STATUS, ADDED),
        null,
        null,
        [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION],
        [false, null]
      );
      const fetchedLinks = _.update(
        _.select(action.payload.links[listName], STATUS, ADDED),
        null,
        null,
        [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION],
        [false, null]
      );

      // Care only status ADDED.
      // Sort and get just first N based on doDescendingorder
      //   so be able to compare and do update or not.
      const ids = Object.keys(fetchedLinks).sort();
      if (action.payload.settings.doDescendingOrder) ids.reverse();

      const selectedIds = ids.slice(0, N_LINKS);
      const selectedLinks = {};
      for (const k in fetchedLinks) {
        if (selectedIds.includes(k)) selectedLinks[k] = fetchedLinks[k];
      }

      newState[listName] = { ...processingLinks, ...selectedLinks };
    }

    return newState;
  }

  if (action.type === FETCH_COMMIT) {
    const { listNames, doFetchSettings, settings } = action.payload;

    const newState = {};
    if (doFetchSettings) {
      if (settings) {
        for (const k of settings.listNameMap.map(obj => obj.listName)) {
          newState[k] = state[k] || null;
        }
      } else {
        for (const k of [MY_LIST, TRASH, ARCHIVE]) newState[k] = state[k];
      }
    } else {
      for (const k in state) newState[k] = state[k];
    }

    for (const name of listNames) {
      if (!(name in newState)) {
        newState[name] = null;
      }
    }

    return loop(
      newState,
      Cmd.run(
        tryUpdateFetched(action.payload, action.meta),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_FETCHED) {
    const { listName, links } = action.payload;

    let newState = state;
    if (listName in newState) { // Check here to not add already removed list name back

      const processingLinks = _.exclude(state[listName], STATUS, ADDED);
      const fetchedLinks = _.copyAttr(
        toObjAndAddAttrs(links, ADDED, false, null),
        state[listName],
        [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]
      );

      newState = { ...state };
      newState[listName] = { ...processingLinks, ...fetchedLinks };
    }

    const { doDeleteOldLinksInTrash, doExtractContents } = action.theMeta;

    return loop(
      newState,
      Cmd.run(
        deleteOldLinksInTrash(doDeleteOldLinksInTrash, doExtractContents),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === FETCH_MORE_COMMIT) {
    return loop(
      state,
      Cmd.run(
        tryUpdateFetchedMore(action.payload, action.meta),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_FETCHED_MORE) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs(links, ADDED, false, null),
    };

    return loop(
      newState,
      Cmd.run(
        extractContents(null, null, null),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === ADD_LINKS) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs(links, ADDING, false, null),
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
    return loop(
      newState,
      Cmd.run(
        extractContents(doExtractContents, listName, _.extract(links, ID)),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
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
      ...toObjAndAddAttrs(links, MOVING, false, null),
    };

    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP_COMMIT) {
    const { listName, links } = action.payload;
    const ids = _.extract(links, ID);

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, ids, STATUS, MOVED
    );

    const { fromListName, fromIds } = action.meta;

    return loop(
      newState,
      Cmd.run(
        moveLinksDeleteStep(fromListName, fromIds, listName, ids),
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
    const { listName, ids, toListName, toIds } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, ids, STATUS, REMOVING
    );
    newState[toListName] = _.update(
      state[toListName], ID, toIds, STATUS, ADDED
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

    let newState = state;
    if (state[listName]) {
      newState = { ...state };
      newState[listName] = _.exclude(state[listName], ID, ids);
    }

    const { doExtractContents } = action.meta;
    return loop(
      newState,
      Cmd.run(
        extractContents(doExtractContents, null, null),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === EXTRACT_CONTENTS_COMMIT) {
    return loop(
      state,
      Cmd.run(
        tryUpdateExtractedContents(action.payload),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_EXTRACTED_CONTENTS) {
    const { listName, links, canRerender } = action.payload;

    // Possible that the links and their listName are already deleted.
    // If that the case, ignore them.
    if (!(listName in state)) return state;

    if (canRerender) {
      const newState = { ...state };
      newState[listName] = { ...newState[listName] };
      for (const link of links) {
        // Some links might be moved while extracting.
        // If that the case, ignore them.
        if (!(link.id in newState[listName])) continue;
        newState[listName][link.id] = { ...newState[listName][link.id] };
        for (const key of ['extractedResult']) {
          newState[listName][link.id][key] = link[key];
        }
      }

      return newState;
    }

    // If should not update views (re-render), just update the state.
    for (const link of links) {
      // Some links might be moved while extracting.
      // If that the case, ignore them.
      if (!(link.id in state[listName])) continue;
      state[listName][link.id].extractedResult = link.extractedResult;
    }
    return state;
  }

  if (action.type === UPDATE_POPUP &&
    (action.payload.id === ALL ||
      ![ADD_POPUP, PROFILE_POPUP, LIST_NAME_POPUP].includes(action.payload.id))) {

    const newState = {};

    for (const listName in state) {
      // BUG ALERT
      // _.update return {} if links is null, maybe it's ok, maybe it's not.
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

  if (action.type === UPDATE_SETTINGS || action.type === CANCEL_DIED_SETTINGS) {
    const { settings } = action.payload;
    const listNames = settings.listNameMap.map(obj => obj.listName);

    const newState = {};
    for (const listName in state) {
      if (!listNames.includes(listName)) {
        if (
          state[listName] === undefined ||
          state[listName] === null ||
          isEqual(state[listName], {})
        ) continue;

        console.log(`links: ${listName} should be undefined, null, or an empty object.`);
      }
      newState[listName] = state[listName];
    }

    for (const k of listNames) {
      if (newState[k] === undefined) newState[k] = null;
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

export default linksReducer;
