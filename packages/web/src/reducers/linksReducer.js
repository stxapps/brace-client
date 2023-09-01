import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import {
  tryUpdateFetched, tryUpdateFetchedMore, moveLinksDeleteStep, extractContents,
  tryUpdateExtractedContents, runAfterFetchTask, unpinLinks, updateCustomDataDeleteStep,
} from '../actions';
import {
  FETCH_COMMIT, UPDATE_FETCHED, FETCH_MORE_COMMIT, UPDATE_FETCHED_MORE, SET_LINKS,
  APPEND_LINKS, ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK, MOVE_LINKS_ADD_STEP,
  MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK, MOVE_LINKS_DELETE_STEP,
  MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK, DELETE_LINKS,
  DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK, CANCEL_DIED_LINKS,
  DELETE_OLD_LINKS_IN_TRASH_COMMIT, EXTRACT_CONTENTS_COMMIT, UPDATE_EXTRACTED_CONTENTS,
  UPDATE_CUSTOM_DATA, UPDATE_CUSTOM_DATA_COMMIT, UPDATE_CUSTOM_DATA_ROLLBACK,
  UPDATE_LOCKS_FOR_INACTIVE_APP, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, TRASH, ARCHIVE, ID, STATUS, ADDED, MOVED,
  ADDING, MOVING, REMOVING, DELETING, UPDATING, DIED_ADDING, DIED_MOVING, DIED_REMOVING,
  DIED_DELETING, DIED_UPDATING, PENDING_REMOVING,
} from '../types/const';
import { isObject } from '../utils';
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
    const { lnOrQt, links } = action.payload;

    const newState = { ...state };
    for (const listName in links) {
      const processingLinks = _.exclude(state[listName], STATUS, ADDED);
      const fetchedLinks = _.update(links[listName], null, null, STATUS, ADDED);

      if (lnOrQt === listName) {
        newState[listName] = { ...fetchedLinks, ...processingLinks };
      } else {
        newState[listName] = { ...state[listName], ...fetchedLinks, ...processingLinks };
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
    const { links } = action.payload;

    const newState = { ...state };
    for (const listName in links) {
      const processingLinks = _.exclude(state[listName], STATUS, ADDED);
      const fetchedLinks = _.update(links[listName], null, null, STATUS, ADDED);

      newState[listName] = { ...state[listName], ...fetchedLinks, ...processingLinks };
    }

    return loop(
      newState, Cmd.run(extractContents(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === SET_LINKS) {
    const { lnOrQt, links } = action.payload;

    const newState = { ...state };
    for (const listName in links) {
      const processingLinks = _.exclude(state[listName], STATUS, ADDED);
      const fetchedLinks = _.update(links[listName], null, null, STATUS, ADDED);

      if (lnOrQt === listName) {
        newState[listName] = { ...fetchedLinks, ...processingLinks };
      } else {
        newState[listName] = { ...state[listName], ...fetchedLinks, ...processingLinks };
      }
    }
    return newState;
  }

  if (action.type === APPEND_LINKS) {
    const { links } = action.payload;

    const newState = { ...state };
    for (const listName in links) {
      const processingLinks = _.exclude(state[listName], STATUS, ADDED);
      const fetchedLinks = _.update(links[listName], null, null, STATUS, ADDED);

      newState[listName] = { ...state[listName], ...fetchedLinks, ...processingLinks };
    }
    return newState;
  }

  if (action.type === ADD_LINKS) {
    const { listName, links } = action.payload;

    const newState = { ...state };
    newState[listName] = { ...state[listName], ...toObjAndAddAttrs(links, ADDING) };

    return newState;
  }

  if (action.type === ADD_LINKS_COMMIT) {
    const { listName, successLinks } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(
      state[listName], ID, _.extract(successLinks, ID), STATUS, ADDED
    );

    return loop(
      newState,
      Cmd.run(
        extractContents(listName, _.extract(successLinks, ID)),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
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

    const fromIds = {};
    for (const link of links) {
      const { fromListName, fromId } = link;
      if (!Array.isArray(fromIds[fromListName])) fromIds[fromListName] = [];
      fromIds[fromListName].push(fromId);
    }

    const newState = { ...state };
    newState[listName] = { ...state[listName], ...toObjAndAddAttrs(links, MOVING) };
    for (const fromListName in fromIds) {
      newState[fromListName] = _.update(
        newState[fromListName], ID, fromIds[fromListName], STATUS, PENDING_REMOVING
      );
    }

    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP_COMMIT) {
    const { listName, successLinks, errorLinks } = action.payload;

    const successIds = _.extract(successLinks, ID);

    // Doesn't remove fromListName and fromId here
    //   so need to exclude this attr elsewhere if not needed.
    const newState = { ...state };
    newState[listName] = _.update(
      newState[listName], ID, successIds, STATUS, MOVED
    );
    newState[listName] = _.update(
      newState[listName], ID, _.extract(errorLinks, ID), STATUS, DIED_MOVING
    );

    return loop(
      newState,
      Cmd.run(
        moveLinksDeleteStep(listName, successIds),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
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
      newState[listName], ID, ids, STATUS, REMOVING
    );
    newState[toListName] = _.update(
      newState[toListName], ID, toIds, STATUS, ADDED
    );

    return newState;
  }

  if (action.type === MOVE_LINKS_DELETE_STEP_COMMIT) {
    const { listName, successIds, errorIds } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(newState[listName], ID, successIds);
    newState[listName] = _.update(
      newState[listName], ID, errorIds, STATUS, DIED_REMOVING
    );

    const { toListName } = action.meta;

    if ([ARCHIVE, TRASH].includes(toListName)) {
      return loop(
        newState, Cmd.run(unpinLinks(successIds), { args: [Cmd.dispatch, Cmd.getState] })
      );
    }
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
    const { listName, successIds, errorIds } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(newState[listName], ID, successIds);
    newState[listName] = _.update(
      newState[listName], ID, errorIds, STATUS, DIED_DELETING
    );

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
    const { infos } = action.payload;

    const idsPerLn = {};
    for (const info of infos) {
      const { listName, id } = info;
      if (!Array.isArray(idsPerLn[listName])) idsPerLn[listName] = [];
      idsPerLn[listName].push(id);
    }

    const newState = { ...state };
    for (const listName in idsPerLn) {
      newState[listName] = _.exclude(state[listName], ID, idsPerLn[listName]);
    }

    for (const info of infos) {
      const { listName, id } = info;

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
        newState[listName][id] = {
          ...state[listName][id].fromLink,
          [STATUS]: ADDED,
          [IS_POPUP_SHOWN]: false,
          [POPUP_ANCHOR_POSITION]: null,
        };
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
    const { listName, successLinks, canRerender } = action.payload;

    // Possible that the links and their listName are already deleted.
    // If that the case, ignore them.
    if (!(listName in state)) return state;

    let newState = state;
    if (canRerender) {
      newState = { ...state };
      newState[listName] = { ...newState[listName] };
      for (const link of successLinks) {
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
      for (const link of successLinks) {
        // Some links might be moved while extracting.
        // If that the case, ignore them.
        if (!(link.id in newState[listName])) continue;
        newState[listName][link.id].extractedResult = link.extractedResult;
      }
    }

    return loop(
      newState, Cmd.run(runAfterFetchTask(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT) {
    const { listName, ids } = action.payload;

    let newState = state;
    if (state[listName]) {
      newState = { ...state };
      newState[listName] = _.exclude(state[listName], ID, ids);
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

  if (action.type === UPDATE_LOCKS_FOR_INACTIVE_APP) {
    const newState = {};
    for (const listName in state) {
      newState[listName] = _.update(
        state[listName],
        null,
        null,
        [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION],
        [false, null]
      );
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
