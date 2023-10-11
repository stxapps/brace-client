import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import {
  tryUpdateFetched, tryUpdateFetchedMore, moveLinksDeleteStep, extractContents,
  tryUpdateExtractedContents, runAfterFetchTask, unpinLinks, updateCustomDataDeleteStep,
} from '../actions';
import {
  FETCH_COMMIT, UPDATE_FETCHED, FETCH_MORE_COMMIT, UPDATE_FETCHED_MORE, ADD_LINKS,
  ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK, MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT,
  MOVE_LINKS_ADD_STEP_ROLLBACK, MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT,
  MOVE_LINKS_DELETE_STEP_ROLLBACK, DELETE_LINKS, DELETE_LINKS_COMMIT,
  DELETE_LINKS_ROLLBACK, CANCEL_DIED_LINKS, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  EXTRACT_CONTENTS_COMMIT, UPDATE_EXTRACTED_CONTENTS, UPDATE_CUSTOM_DATA,
  UPDATE_CUSTOM_DATA_COMMIT, UPDATE_CUSTOM_DATA_ROLLBACK, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, TRASH, ARCHIVE, ID, STATUS, ADDED, MOVED,
  ADDING, MOVING, REMOVING, DELETING, UPDATING, DIED_ADDING, DIED_MOVING, DIED_REMOVING,
  DIED_DELETING, DIED_UPDATING, PENDING_REMOVING,
} from '../types/const';
import { isObject, getArraysPerKey } from '../utils';
import { _ } from '../utils/obj';

const initialState = {};

const toObjAndAddAttrs = (links, status) => {
  let obj = _.mapKeys(links, ID);
  obj = _.update(obj, null, null, STATUS, status);
  return obj;
};

const linksReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    const newState = { ...initialState };
    for (const listName in action.payload.links) {
      const ridLinks = _.ignore(
        action.payload.links[listName], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]
      );
      newState[listName] = ridLinks;
    }
    return newState;
  }

  if (action.type === FETCH_COMMIT) {
    return loop(
      state,
      Cmd.run(
        tryUpdateFetched(action.payload),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
    );
  }

  if (action.type === UPDATE_FETCHED) {
    const { lnOrQt, links, keepIds } = action.payload;

    const newState = { ...state };
    if (isObject(links)) {
      for (const listName in links) {
        const processingLinks = _.exclude(state[listName], STATUS, ADDED);
        const fetchedLinks = _.update(links[listName], null, null, STATUS, ADDED);

        if (lnOrQt === listName) {
          newState[listName] = { ...fetchedLinks, ...processingLinks };
        } else {
          newState[listName] = {
            ...state[listName], ...fetchedLinks, ...processingLinks,
          };
        }
      }
    }
    if (Array.isArray(keepIds)) {
      for (const listName in state) {
        if (lnOrQt !== listName) continue;

        newState[listName] = {};
        for (const id in state[listName]) {
          if (!keepIds.includes(id)) continue;
          newState[listName][id] = { ...state[listName][id] };
        }

        const processingLinks = _.exclude(state[listName], STATUS, ADDED);
        newState[listName] = { ...newState[listName], ...processingLinks };
      }
    }

    return loop(
      newState, Cmd.run(extractContents(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === FETCH_MORE_COMMIT) {
    return loop(
      state,
      Cmd.run(
        tryUpdateFetchedMore(action.payload),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
    );
  }

  if (action.type === UPDATE_FETCHED_MORE) {
    const { lnOrQt, links, keepIds } = action.payload;

    const newState = { ...state };
    if (isObject(links)) {
      for (const listName in links) {
        const processingLinks = _.exclude(state[listName], STATUS, ADDED);
        const fetchedLinks = _.update(links[listName], null, null, STATUS, ADDED);

        newState[listName] = { ...state[listName], ...fetchedLinks, ...processingLinks };
      }
    }
    if (Array.isArray(keepIds)) {
      for (const listName in state) {
        if (lnOrQt !== listName) continue;

        newState[listName] = {};
        for (const id in state[listName]) {
          if (!keepIds.includes(id)) continue;
          newState[listName][id] = { ...state[listName][id] };
        }

        const processingLinks = _.exclude(state[listName], STATUS, ADDED);
        newState[listName] = { ...newState[listName], ...processingLinks };
      }
    }

    return loop(
      newState, Cmd.run(extractContents(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === ADD_LINKS) {
    const { listNames, links } = action.payload;

    const linksPerLn = getArraysPerKey(listNames, links);

    const newState = { ...state };
    for (const [listName, lnLinks] of Object.entries(linksPerLn)) {
      newState[listName] = {
        ...newState[listName], ...toObjAndAddAttrs(lnLinks, ADDING),
      };
    }

    return newState;
  }

  if (action.type === ADD_LINKS_COMMIT) {
    const { successListNames, successLinks } = action.payload;

    const linksPerLn = getArraysPerKey(successListNames, successLinks);

    const newState = { ...state };
    for (const [listName, lnLinks] of Object.entries(linksPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, _.extract(lnLinks, ID), STATUS, ADDED
      );
    }

    return loop(
      newState,
      Cmd.run(
        extractContents(successListNames, _.extract(successLinks, ID)),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
    );
  }

  if (action.type === ADD_LINKS_ROLLBACK) {
    const { listNames, links } = action.meta;

    const linksPerLn = getArraysPerKey(listNames, links);

    const newState = { ...state };
    for (const [listName, lnLinks] of Object.entries(linksPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, _.extract(lnLinks, ID), STATUS, DIED_ADDING
      );
    }

    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP) {
    const { listNames, links } = action.payload;

    const fromIdsPerLn = {};
    for (const link of links) {
      const { fromListName, fromId } = link;
      if (!Array.isArray(fromIdsPerLn[fromListName])) fromIdsPerLn[fromListName] = [];
      fromIdsPerLn[fromListName].push(fromId);
    }

    const linksPerLn = getArraysPerKey(listNames, links);

    const newState = { ...state };
    for (const [fromListName, fromIds] of Object.entries(fromIdsPerLn)) {
      newState[fromListName] = _.update(
        newState[fromListName], ID, fromIds, STATUS, PENDING_REMOVING
      );
    }
    for (const [listName, lnLinks] of Object.entries(linksPerLn)) {
      newState[listName] = {
        ...newState[listName], ...toObjAndAddAttrs(lnLinks, MOVING),
      };
    }

    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP_COMMIT) {
    const {
      successListNames, successLinks, errorListNames, errorLinks,
    } = action.payload;

    const successIds = _.extract(successLinks, ID);
    const errorIds = _.extract(errorLinks, ID);

    const successIdsPerLn = getArraysPerKey(successListNames, successIds);
    const errorIdsPerLn = getArraysPerKey(errorListNames, errorIds);

    // Doesn't remove fromListName and fromId here
    //   so need to exclude this attr elsewhere if not needed.
    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(successIdsPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, lnIds, STATUS, MOVED
      );
    }
    for (const [listName, lnIds] of Object.entries(errorIdsPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, lnIds, STATUS, DIED_MOVING
      );
    }

    return loop(
      newState,
      Cmd.run(
        moveLinksDeleteStep(successListNames, successIds),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
    );
  }

  if (action.type === MOVE_LINKS_ADD_STEP_ROLLBACK) {
    const { listNames, links } = action.meta;

    const linksPerLn = getArraysPerKey(listNames, links);

    const newState = { ...state };
    for (const [listName, lnLinks] of Object.entries(linksPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, _.extract(lnLinks, ID), STATUS, DIED_MOVING
      );
    }

    return newState;
  }

  if (action.type === MOVE_LINKS_DELETE_STEP) {
    const { listNames, ids, toListNames, toIds } = action.payload;

    const idsPerLn = getArraysPerKey(listNames, ids);
    const toIdsPerLn = getArraysPerKey(toListNames, toIds);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, lnIds, STATUS, REMOVING
      );
    }
    for (const [listName, lnIds] of Object.entries(toIdsPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, lnIds, STATUS, ADDED
      );
    }

    return newState;
  }

  if (action.type === MOVE_LINKS_DELETE_STEP_COMMIT) {
    const { successListNames, successIds, errorListNames, errorIds } = action.payload;

    const successIdsPerLn = getArraysPerKey(successListNames, successIds);
    const errorIdsPerLn = getArraysPerKey(errorListNames, errorIds);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(successIdsPerLn)) {
      newState[listName] = _.exclude(newState[listName], ID, lnIds);
    }
    for (const [listName, lnIds] of Object.entries(errorIdsPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, lnIds, STATUS, DIED_REMOVING
      );
    }

    const { toListNames, toIds } = action.meta;

    const toUnpinIds = [];
    for (let i = 0; i < toListNames.length; i++) {
      const [toListName, toId] = [toListNames[i], toIds[i]];

      if (![ARCHIVE, TRASH].includes(toListName)) continue;
      toUnpinIds.push(toId);
    }

    if (toUnpinIds.length > 0) {
      return loop(
        newState, Cmd.run(unpinLinks(toUnpinIds), { args: [Cmd.dispatch, Cmd.getState] })
      );
    }
    return newState;
  }

  if (action.type === MOVE_LINKS_DELETE_STEP_ROLLBACK) {
    const { listNames, ids } = action.meta;

    const idsPerLn = getArraysPerKey(listNames, ids);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, lnIds, STATUS, DIED_REMOVING
      );
    }

    return newState;
  }

  if (action.type === DELETE_LINKS) {
    const { listNames, ids } = action.payload;

    const idsPerLn = getArraysPerKey(listNames, ids);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, lnIds, STATUS, DELETING
      );
    }

    return newState;
  }

  if (action.type === DELETE_LINKS_COMMIT) {
    const { successListNames, successIds, errorListNames, errorIds } = action.payload;

    const successIdsPerLn = getArraysPerKey(successListNames, successIds);
    const errorIdsPerLn = getArraysPerKey(errorListNames, errorIds);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(successIdsPerLn)) {
      newState[listName] = _.exclude(newState[listName], ID, lnIds);
    }
    for (const [listName, lnIds] of Object.entries(errorIdsPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, lnIds, STATUS, DIED_DELETING
      );
    }

    return newState;
  }

  if (action.type === DELETE_LINKS_ROLLBACK) {
    const { listNames, ids } = action.meta;

    const idsPerLn = getArraysPerKey(listNames, ids);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, lnIds, STATUS, DIED_DELETING
      );
    }

    return newState;
  }

  if (action.type === CANCEL_DIED_LINKS) {
    const { listNames, ids } = action.payload;

    const idsPerLn = getArraysPerKey(listNames, ids);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      newState[listName] = _.exclude(state[listName], ID, lnIds);
    }

    for (let i = 0; i < listNames.length; i++) {
      const [listName, id] = [listNames[i], ids[i]];

      // DIED_ADDING -> remove this link
      // DIED_MOVING -> remove this link and set fromLink status to ADDED
      // DIED_REMOVING -> just set status to ADDED
      // DIED_DELETING -> just set status to ADDED
      // DIED_UPDATING -> replace with fromLink
      if (!isObject(state[listName][id])) continue;

      const { status } = state[listName][id];
      if ([DIED_ADDING].includes(status)) {
        continue;
      } else if ([DIED_MOVING].includes(status)) {
        const { fromListName, fromId } = state[listName][id];

        if (
          isObject(state[fromListName]) && isObject(state[fromListName][fromId])
        ) {
          const fromLink = state[fromListName][fromId];
          newState[fromListName][fromId] = { ...fromLink, status: ADDED };
        }
      } else if ([DIED_REMOVING, DIED_DELETING].includes(status)) {
        newState[listName][id] = { ...state[listName][id], status: ADDED };
      } else if ([DIED_UPDATING]) {
        newState[listName][id] = { ...state[listName][id].fromLink, status: ADDED };
      } else {
        console.log(`Invalid status: ${status} of link id: ${id}`);
      }
    }

    return newState;
  }

  if (action.type === EXTRACT_CONTENTS_COMMIT) {
    return loop(
      state,
      Cmd.run(
        tryUpdateExtractedContents(action.payload),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
    );
  }

  if (action.type === UPDATE_EXTRACTED_CONTENTS) {
    const { successListNames, successLinks, canRerender } = action.payload;

    const linksPerLn = getArraysPerKey(successListNames, successLinks);

    const newState = canRerender ? { ...state } : state;
    for (const [listName, lnLinks] of Object.entries(linksPerLn)) {
      // Possible that the links and their listName are already deleted.
      // If that the case, ignore them.
      if (!(listName in newState)) continue;

      if (canRerender) {
        newState[listName] = { ...newState[listName] };
        for (const link of lnLinks) {
          // Some links might be moved while extracting.
          // If that the case, ignore them.
          if (!(link.id in newState[listName])) continue;
          newState[listName][link.id] = { ...newState[listName][link.id] };
          for (const key of ['extractedResult']) {
            newState[listName][link.id][key] = link[key];
          }
        }
      } else {
        // If should not update views (re-render), just update the state.
        for (const link of lnLinks) {
          // Some links might be moved while extracting.
          // If that the case, ignore them.
          if (!(link.id in newState[listName])) continue;
          newState[listName][link.id].extractedResult = link.extractedResult;
        }
      }
    }

    return loop(
      newState, Cmd.run(runAfterFetchTask(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT) {
    const { successListNames, successIds } = action.payload;

    const idsPerLn = getArraysPerKey(successListNames, successIds);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      newState[listName] = _.exclude(newState[listName], ID, lnIds);
    }

    return newState;
  }

  if (action.type === UPDATE_CUSTOM_DATA) {
    const { listName, fromLink, toLink } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs([{ ...toLink, fromLink }], UPDATING),
    };

    return newState;
  }

  if (action.type === UPDATE_CUSTOM_DATA_COMMIT) {
    const { listName, toLink, serverUnusedFPaths, localUnusedFPaths } = action.payload;

    // Doesn't remove fromLink here
    //   so need to exclude this attr elsewhere if not needed.
    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, _.extract([toLink], ID), STATUS, ADDED
    );

    return loop(
      newState,
      Cmd.run(
        updateCustomDataDeleteStep(serverUnusedFPaths, localUnusedFPaths),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
    );
  }

  if (action.type === UPDATE_CUSTOM_DATA_ROLLBACK) {
    const { listName, toLink } = action.meta;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, _.extract([toLink], ID), STATUS, DIED_UPDATING
    );

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
