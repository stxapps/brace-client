import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import {
  tryUpdateFetched, tryUpdateFetchedMore, moveLinksDeleteStep, extractContents,
  tryUpdateExtractedContents, runAfterFetchTask, unpinLinks, updateCustomDataDeleteStep,
} from '../actions';
import {
  UPDATE_POPUP,
  FETCH_COMMIT, UPDATE_FETCHED, FETCH_MORE_COMMIT, UPDATE_FETCHED_MORE,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK,
  DELETE_LINKS, DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK,
  CANCEL_DIED_LINKS, DELETE_OLD_LINKS_IN_TRASH_COMMIT, EXTRACT_CONTENTS_COMMIT,
  UPDATE_EXTRACTED_CONTENTS, UPDATE_SETTINGS, CANCEL_DIED_SETTINGS,
  MERGE_SETTINGS_COMMIT, UPDATE_CUSTOM_DATA, UPDATE_CUSTOM_DATA_COMMIT,
  UPDATE_CUSTOM_DATA_ROLLBACK, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, ADD_POPUP, PROFILE_POPUP, LIST_NAMES_POPUP, IS_POPUP_SHOWN,
  POPUP_ANCHOR_POSITION, MY_LIST, TRASH, ARCHIVE, ID, STATUS, N_LINKS,
  ADDED, MOVED, ADDING, MOVING, REMOVING, DELETING, UPDATING,
  DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING, DIED_UPDATING,
} from '../types/const';
import {
  isEqual, isObject, getAllListNames, getMainId, getPinFPaths, sortFilteredLinks,
  sortWithPins,
} from '../utils';
import { initialSettingsState } from '../types/initialStates';
import { _ } from '../utils/obj';

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

    let doDescendingOrder = initialSettingsState.doDescendingOrder;
    if (
      isObject(action.payload.settings) &&
      'doDescendingOrder' in action.payload.settings
    ) {
      doDescendingOrder = action.payload.settings.doDescendingOrder;
    }
    const pinFPaths = getPinFPaths(action.payload);
    const pendingPins = action.payload.pendingPins;

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
      // Sort and get just first N based on doDescendingOrder
      //   so be able to compare and do update or not.
      let sortedLinks = sortFilteredLinks(fetchedLinks, doDescendingOrder);
      if (!sortedLinks) continue;

      sortedLinks = sortWithPins(sortedLinks, pinFPaths, pendingPins, (link) => {
        return getMainId(link.id);
      });

      const selectedLinks = sortedLinks.slice(0, N_LINKS);

      newState[listName] = {
        ...processingLinks,
        ...toObjAndAddAttrs(selectedLinks, ADDED, false, null),
      };
    }

    return newState;
  }

  if (action.type === FETCH_COMMIT) {
    const { listNames, doFetchStgsAndInfo, settings } = action.payload;

    const newState = {};
    if (doFetchStgsAndInfo) {
      if (settings) {
        for (const k of getAllListNames(settings.listNameMap)) {
          newState[k] = state[k] || null;
        }
      } else {
        for (const k of [MY_LIST, TRASH, ARCHIVE]) newState[k] = state[k];
      }
    } else {
      for (const k in state) newState[k] = state[k];
    }

    for (const name of listNames) {
      if (!(name in newState)) newState[name] = null;
    }
    for (const name of [MY_LIST, TRASH, ARCHIVE]) { // In case of invalid settings.
      if (!(name in newState)) newState[name] = null;
    }

    return loop(
      newState,
      Cmd.run(
        tryUpdateFetched(action.payload, action.meta),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
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

    return loop(
      newState,
      Cmd.run(extractContents(null, null), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === FETCH_MORE_COMMIT) {
    return loop(
      state,
      Cmd.run(
        tryUpdateFetchedMore(action.payload, action.meta),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
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
      Cmd.run(extractContents(null, null), { args: [Cmd.dispatch, Cmd.getState] })
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

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs(links, MOVING, false, null),
    };

    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP_COMMIT) {
    const { listName, successLinks, errorLinks } = action.payload;

    const successIds = _.extract(successLinks, ID);

    const newState = { ...state };
    newState[listName] = _.update(
      newState[listName], ID, successIds, STATUS, MOVED
    );
    newState[listName] = _.update(
      newState[listName], ID, _.extract(errorLinks, ID), STATUS, DIED_MOVING
    );

    const { fromListName, fromIdMap } = action.meta;
    const fromIds = successIds.map(id => fromIdMap[id]);

    return loop(
      newState,
      Cmd.run(
        moveLinksDeleteStep(fromListName, fromIds, listName, successIds),
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
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(state[listName], ID, ids);

    for (const id of ids) {
      // DIED_ADDING -> remove this link
      // DIED_MOVING -> remove this link
      // DIED_REMOVING -> just set status to ADDED
      // DIED_DELETING -> just set status to ADDED
      // DIED_UPDATING -> replace with fromLink
      const status = state[listName][id].status;
      if ([DIED_ADDING, DIED_MOVING].includes(status)) {
        continue;
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
        throw new Error(`Invalid status: ${status} of link id: ${id}`);
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

  if (action.type === UPDATE_POPUP) {
    const { id, isShown, anchorPosition } = action.payload;
    if ([ADD_POPUP, PROFILE_POPUP, LIST_NAMES_POPUP].includes(id)) return state;

    const newState = {};
    for (const listName in state) {
      // BUG ALERT
      // _.update return {} if links is null, maybe it's ok, maybe it's not.
      if (id === ALL) {
        newState[listName] = _.update(
          state[listName], null, null, IS_POPUP_SHOWN, isShown
        );
      } else {
        newState[listName] = _.update(
          state[listName],
          ID,
          id,
          [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION],
          [isShown, anchorPosition]
        );
      }
    }

    return newState;
  }

  if (
    action.type === UPDATE_SETTINGS ||
    action.type === CANCEL_DIED_SETTINGS ||
    action.type === MERGE_SETTINGS_COMMIT
  ) {
    const { settings } = action.payload;

    const listNames = getAllListNames(settings.listNameMap);
    if (action.type === CANCEL_DIED_SETTINGS) {
      listNames.push(...action.payload.listNames);
    } else if (action.type === MERGE_SETTINGS_COMMIT) {
      listNames.push(...action.meta.listNames);
    }

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

    for (const name of listNames) {
      if (!(name in newState)) newState[name] = null;
    }
    for (const name of [MY_LIST, TRASH, ARCHIVE]) { // Just to be safe.
      if (!(name in newState)) newState[name] = null;
    }

    return newState;
  }

  if (action.type === UPDATE_CUSTOM_DATA) {
    const { listName, fromLink, toLink } = action.payload;

    const newState = { ...state };
    newState[listName] = {
      ...state[listName],
      ...toObjAndAddAttrs([{ ...toLink, fromLink }], UPDATING, false, null),
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
