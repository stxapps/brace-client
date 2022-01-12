import { Linking, Dimensions, Platform } from 'react-native';
import { RESET_STATE as OFFLINE_RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import axios from 'axios';
//import RNFS from 'react-native-fs';

import userSession from '../userSession';
import {
  createLinkFPath, batchGetFileWithRetry, batchPutFileWithRetry,
  batchDeleteFileWithRetry,
} from '../apis/blockstack';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_WINDOW_SIZE, UPDATE_PAGE_Y_OFFSET,
  UPDATE_STACKS_ACCESS, UPDATE_LIST_NAME, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  UPDATE_STATUS, UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING,
  ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS, UPDATE_SELECTING_LINK_ID,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, CACHE_FETCHED, UPDATE_FETCHED,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  UPDATE_FETCHED_MORE, CANCEL_FETCHED_MORE, CLEAR_FETCHED_LIST_NAMES,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  UPDATE_LINKS, DELETE_LINKS, DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT,
  MOVE_LINKS_DELETE_STEP_ROLLBACK, CANCEL_DIED_LINKS,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_EXTRACTED_CONTENTS, UPDATE_FETCHED_SETTINGS,
  UPDATE_LIST_NAME_EDITORS, ADD_LIST_NAMES, UPDATE_LIST_NAMES, MOVE_LIST_NAME,
  MOVE_TO_LIST_NAME, DELETE_LIST_NAMES,
  UPDATE_SELECTING_LIST_NAME, UPDATE_DELETING_LIST_NAME,
  UPDATE_DO_EXTRACT_CONTENTS, UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH,
  UPDATE_DO_DESCENDING_ORDER, UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS, UPDATE_LAYOUT_TYPE,
  UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_URL_SCHEME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH,
  APP_GROUP_SHARE, APP_GROUP_SHARE_UKEY,
  SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  LIST_NAMES_POPUP, CONFIRM_DELETE_POPUP, SETTINGS_POPUP, SETTINGS_LISTS_MENU_POPUP,
  ID, STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
  MY_LIST, TRASH, ARCHIVE, N_LINKS, SETTINGS_FNAME,
  ADDED, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  BRACE_EXTRACT_URL, BRACE_PRE_EXTRACT_URL, EXTRACT_INIT, EXTRACT_EXCEEDING_N_URLS,
} from '../types/const';
import {
  _, isEqual, isString, isObject, isNumber, sleep,
  randomString, rerandomRandomTerm, deleteRemovedDT, getMainId,
  getUrlFirstChar, separateUrlAndParam, getUserImageUrl, randomDecor,
  isOfflineActionWithPayload, shouldDispatchFetch, getListNameObj, getAllListNames,
  isDecorValid, isExtractedResultValid, isListNameObjsValid,
} from '../utils';
import { initialSettingsState } from '../types/initialStates';

import DefaultPreference from 'react-native-default-preference';
if (Platform.OS === 'ios') DefaultPreference.setName(APP_GROUP_SHARE);

export const init = async (store) => {

  const hasSession = await userSession.hasSession();
  if (!hasSession) {
    const config = {
      appDomain: DOMAIN_NAME,
      scopes: ['store_write'],
      redirectUrl: BLOCKSTACK_AUTH,
      callbackUrlScheme: APP_URL_SCHEME,
    };
    await userSession.createSession(config);
  }

  const initialUrl = await Linking.getInitialURL();
  if (initialUrl) {
    await handlePendingSignIn(initialUrl)(store.dispatch, store.getState);
  }

  Linking.addEventListener('url', async (e) => {
    await handlePendingSignIn(e.url)(store.dispatch, store.getState);
  });

  Dimensions.addEventListener('change', ({ window }) => {
    store.dispatch({
      type: UPDATE_WINDOW_SIZE,
      payload: {
        windowWidth: window.width,
        windowHeight: window.height,
      },
    });
  });

  const isUserSignedIn = await userSession.isUserSignedIn();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }
  const href = DOMAIN_NAME + '/';
  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      username,
      userImage,
      href,
      windowWidth: Dimensions.get('window').width,
      windowHeight: Dimensions.get('window').height,
    },
  });
};

const handlePendingSignIn = (url) => async (dispatch, getState) => {

  if (!url.startsWith(DOMAIN_NAME + BLOCKSTACK_AUTH) &&
    !url.startsWith(APP_DOMAIN_NAME + BLOCKSTACK_AUTH)) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true,
  });

  const { param: { authResponse } } = separateUrlAndParam(url, 'authResponse');
  try {
    await userSession.handlePendingSignIn(authResponse);
  } catch (e) {
    console.log(`Catched an error thrown by handlePendingSignIn: ${e.message}`);
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    if (Platform.OS === 'ios') {
      await DefaultPreference.set(APP_GROUP_SHARE_UKEY, JSON.stringify(userData));
    }
    dispatch({
      type: UPDATE_USER,
      payload: {
        isUserSignedIn: true,
        username: userData.username,
        image: getUserImageUrl(userData),
      },
    });
  }

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false,
  });
};

const getPopupShownId = (state) => {

  if (state.display.isSignUpPopupShown) return SIGN_UP_POPUP;
  if (state.display.isSignInPopupShown) return SIGN_IN_POPUP;
  if (state.display.isAddPopupShown) return ADD_POPUP;
  if (state.display.isProfilePopupShown) return PROFILE_POPUP;
  if (state.display.isConfirmDeletePopupShown) return CONFIRM_DELETE_POPUP;
  if (state.display.isListNamesPopupShown) return LIST_NAMES_POPUP;
  if (state.display.isSettingsListsMenuPopupShown) return SETTINGS_LISTS_MENU_POPUP;
  if (state.display.isSettingsPopupShown) return SETTINGS_POPUP;

  for (const listName in state.links) {
    for (const id in state.links[listName]) {
      if (state.links[listName][id][IS_POPUP_SHOWN]) return id;
    }
  }

  // IMPORTANT that search is on the last as updatePopupAsBackPressed relies on this
  //   to close other popups before search (search is the last to be closed).
  if (state.display.isSearchPopupShown) return SEARCH_POPUP;

  return null;
};

const isPopupShown = (state) => {
  return getPopupShownId(state) !== null;
};

export const updateMenuPopupAsBackPressed = (menuProvider, dispatch, getState) => {

  if (menuProvider.isMenuOpen()) {
    const id = getPopupShownId(getState());
    if (id) {
      menuProvider.closeMenu();
      dispatch(updatePopup(id, false));
      return true;
    }
  }

  return false;
};

export const signOut = () => async (dispatch, getState) => {

  await userSession.signUserOut();
  if (Platform.OS === 'ios') await DefaultPreference.clearAll();

  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};

export const updateUserData = (data) => async (dispatch, getState) => {
  await userSession.updateUserData(data);

  const isUserSignedIn = await userSession.isUserSignedIn();
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    if (Platform.OS === 'ios') {
      await DefaultPreference.set(APP_GROUP_SHARE_UKEY, JSON.stringify(userData));
    }
    dispatch({
      type: UPDATE_USER,
      payload: {
        isUserSignedIn: true,
        username: userData.username,
        image: getUserImageUrl(userData),
      },
    });
  }
};

export const updatePageYOffset = (pageYOffset) => {
  return {
    type: UPDATE_PAGE_Y_OFFSET,
    payload: pageYOffset,
  };
};

export const updateStacksAccess = (data) => {
  return { type: UPDATE_STACKS_ACCESS, payload: data };
};

export const updatePopup = (id, isShown, anchorPosition = null) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
};

export const changeListName = (listName) => async (dispatch, getState) => {

  const _listName = getState().display.listName;

  dispatch({
    type: UPDATE_LIST_NAME,
    payload: listName,
  });

  dispatch(updateFetched(null, null, _listName));
};

export const updateSearchString = (searchString) => {
  return {
    type: UPDATE_SEARCH_STRING,
    payload: searchString,
  };
};

export const updateStatus = (status) => {
  return {
    type: UPDATE_STATUS,
    payload: status,
  };
};

export const updateHref = (href) => {
  return {
    type: UPDATE_HREF,
    payload: href,
  };
};

export const updateBulkEdit = (isBulkEditing) => {
  return {
    type: UPDATE_BULK_EDITING,
    payload: isBulkEditing,
  };
};

export const addSelectedLinkIds = (ids) => {
  return {
    type: ADD_SELECTED_LINK_IDS,
    payload: ids,
  };
};

export const deleteSelectedLinkIds = (ids) => {
  return {
    type: DELETE_SELECTED_LINK_IDS,
    payload: ids,
  };
};

export const updateSelectingLinkId = (id) => {
  return {
    type: UPDATE_SELECTING_LINK_ID,
    payload: id,
  };
};

export const fetch = (
  doDeleteOldLinksInTrash, doExtractContents, doFetchSettings = false
) => async (dispatch, getState) => {

  const listName = getState().display.listName;

  // Always call deleteOldlinksintrash and extractContents
  //   and check at that time to actually do it or not.
  // So it's real time with updated settings from fetch.
  /*if (doDeleteOldLinksInTrash === null) {
    doDeleteOldLinksInTrash = getState().settings.doDeleteOldLinksInTrash;
  }
  if (doExtractContents === null) {
    doExtractContents = getState().settings.doExtractContents;
  }*/
  const doDescendingOrder = getState().settings.doDescendingOrder;

  const payload = { listName, doDescendingOrder, doFetchSettings };

  // If there is already FETCH with the same list name, no need to dispatch a new one.
  if (!shouldDispatchFetch(getState().offline.outbox, payload)) return;

  dispatch({
    type: FETCH,
    meta: {
      offline: {
        effect: { method: FETCH, params: payload },
        commit: {
          type: FETCH_COMMIT,
          meta: { doDeleteOldLinksInTrash, doExtractContents },
        },
        rollback: { type: FETCH_ROLLBACK },
      },
    },
  });
};

export const tryUpdateFetched = (payload, meta) => async (dispatch, getState) => {

  const { listName, doDescendingOrder, links } = payload;

  if (listName !== getState().display.listName) {
    dispatch(updateFetched(payload, meta));
    return;
  }

  // If the links in state is undefined, null, or an empty object,
  //   just update the state as no scrolling or popup shown.
  let _links = getState().links[listName];
  if (_links === undefined || _links === null || isEqual(_links, {})) {
    dispatch(updateFetched(payload, meta));
    return;
  }
  _links = Object.values(_.select(_links, STATUS, ADDED));

  // If no links from fetching, they are all deleted,
  //   still process of updating is the same.
  /*if (links.length === 0) {
    const { doDeleteOldLinksInTrash, doExtractContents } = meta;
    dispatch(deleteOldLinksInTrash(doDeleteOldLinksInTrash, doExtractContents));
    return;
  }*/

  /*
    updateAction
    0. noNew: exactly the same, nothing new, no need to update
    1. limitedSame: partially the same, first N links are the same, the rest do not know so maybe can update it right away if it doesn't trigger rerender
       - In state has more links than fetch
       - User deletes some links or all links
    2. haveNew: not the same for sure, something new, update if not scroll or popup else show fetchedPopup
  */
  let updateAction;
  if (links.length > _links.length) updateAction = 2;
  else {
    const sortedLinks = links.sort((a, b) => b.addedDT - a.addedDT);
    if (!doDescendingOrder) sortedLinks.reverse();

    const _sortedLinks = _links.sort((a, b) => b.addedDT - a.addedDT);
    if (!doDescendingOrder) _sortedLinks.reverse();

    let found = false;
    for (let i = 0; i < sortedLinks.length; i++) {
      const [link, _link] = [sortedLinks[i], _sortedLinks[i]];
      if (
        link.id !== _link.id || !isEqual(link.extractedResult, _link.extractedResult)
      ) {
        found = true;
        break;
      }
    }

    updateAction = found ? 2 : links.length < _links.length ? 1 : 0;
  }

  if (updateAction === 0) {
    const { doDeleteOldLinksInTrash, doExtractContents } = meta;
    dispatch(deleteOldLinksInTrash(doDeleteOldLinksInTrash, doExtractContents));
    return;
  }

  const pageYOffset = getState().window.pageYOffset;
  if (
    (updateAction === 1 && pageYOffset < 64 / 10 * _links.length) ||
    (updateAction === 2 && pageYOffset === 0 && !isPopupShown(getState()))
  ) {
    dispatch(updateFetched(payload, meta));
    return;
  }

  dispatch({
    type: CACHE_FETCHED,
    payload,
    theMeta: meta,
  });
};

export const updateFetched = (payload, meta, listName = null, doChangeListCount = false) => async (dispatch, getState) => {

  if (!payload) {
    if (!listName) listName = getState().display.listName;

    const fetched = getState().fetched[listName];
    if (fetched) ({ payload, meta } = fetched);
  }
  if (!payload) return;

  dispatch({
    type: UPDATE_FETCHED,
    payload: { ...payload, doChangeListCount },
    theMeta: meta,
  });
};

export const fetchMore = () => async (dispatch, getState) => {

  const addedDT = Date.now();

  const fetchMoreId = `${addedDT}-${randomString(4)}`;
  const listName = getState().display.listName;
  const ids = Object.keys(getState().links[listName]);
  const doDescendingOrder = getState().settings.doDescendingOrder;

  // Always call extractContents
  //   and check at that time to actually do it or not.
  // So it's real time with updated settings from fetch.
  //const doExtractContents = getState().settings.doExtractContents;

  const payload = { fetchMoreId, listName, ids, doDescendingOrder };

  // If there is already FETCH with the same list name,
  //   this fetch more is invalid. Fetch more need to get ids after FETCH_COMMIT.
  // If there is already FETCH_MORE with the same payload,
  //   no need to dispatch a new one.
  const outbox = getState().offline.outbox;
  if (Array.isArray(outbox)) {
    for (const action of outbox) {
      // It's possible that FETCH is cached
      //   and user wants to fetch more continue from current state.
      //if (isOfflineAction(action, FETCH, listName)) return;
      if (isOfflineActionWithPayload(action, FETCH_MORE, payload)) return;
    }
  }

  dispatch({
    type: FETCH_MORE,
    payload,
    meta: {
      offline: {
        effect: { method: FETCH_MORE, params: payload },
        commit: { type: FETCH_MORE_COMMIT, meta: payload },
        rollback: { type: FETCH_MORE_ROLLBACK, meta: payload },
      },
    },
  });
};

export const tryUpdateFetchedMore = (payload, meta) => async (dispatch, getState) => {

  const { fetchMoreId, listName } = meta;

  let isInterrupted = false;
  for (const id in getState().isFetchMoreInterrupted[listName]) {
    if (id === fetchMoreId) {
      isInterrupted = getState().isFetchMoreInterrupted[listName][id];
      break;
    }
  }

  if (isInterrupted) {
    dispatch({
      type: CANCEL_FETCHED_MORE,
      payload,
      theMeta: meta,
    });
    return;
  }

  dispatch({
    type: UPDATE_FETCHED_MORE,
    payload,
    theMeta: meta,
  });
};

export const clearFetchedListNames = () => {
  return { type: CLEAR_FETCHED_LIST_NAMES };
};

export const addLink = (url, listName, doExtractContents) => async (dispatch, getState) => {

  if (listName === null) listName = getState().display.listName;
  if (listName === TRASH) listName = MY_LIST;

  // First 2 terms are main of an id, should always be unique.
  // The third term is changed when move around
  //   to avoid etags confusing treating a new file as an existing file
  //   in blockstack-js/storage.
  // Getting content, etags is updated with key as path and value as content hash
  //   this is for make sure no mid-air edit collisions.
  //   But when delete, etags isn't updated so when add a new file with the same path,
  //   old value in etags is used and create an error 412 Precondition Failed.
  const addedDT = Date.now();
  const id = `${addedDT}-${randomString(4)}-${randomString(4)}`;
  const decor = randomDecor(getUrlFirstChar(url));
  const link = { id, url, addedDT, decor };
  const links = [link];
  const payload = { listName, links };

  // Always call extractContents
  //   and check at that time to actually do it or not.
  // So it's real time with updated settings from fetch.
  //if (doExtractContents === null) doExtractContents = getState().settings.doExtractContents;

  // If doExtractContents is false but from settings is true, send pre-extract to server
  if (doExtractContents === false && getState().settings.doExtractContents === true) {
    axios.post(
      BRACE_PRE_EXTRACT_URL,
      { urls: [url] },
      { headers: { Referer: DOMAIN_NAME } }
    )
      .then(() => { })
      .catch((error) => {
        console.log('Error when contact Brace server to pre-extract contents with links: ', links, ' Error: ', error);
      });
  }

  dispatch({
    type: ADD_LINKS,
    payload,
    meta: {
      offline: {
        effect: { method: ADD_LINKS, params: payload },
        commit: { type: ADD_LINKS_COMMIT, meta: { doExtractContents } },
        rollback: { type: ADD_LINKS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const moveLinks = (toListName, ids, fromListName = null) => async (dispatch, getState) => {

  if (!fromListName) fromListName = getState().display.listName;

  let links = _.ignore(
    _.select(getState().links[fromListName], ID, ids),
    [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]
  );
  links = Object.values(links);

  const payload = { listName: toListName, links: links };
  payload.links = payload.links.map(link => {
    return { ...link, id: rerandomRandomTerm(link.id) };
  });
  if (fromListName === TRASH) {
    payload.links = payload.links.map(link => {
      return { ...link, id: deleteRemovedDT(link.id) };
    });
  }
  if (toListName === TRASH) {
    const removedDT = Date.now();
    payload.links = payload.links.map(link => {
      return { ...link, id: `${link.id}-${removedDT}` };
    });
  }

  dispatch({
    type: MOVE_LINKS_ADD_STEP,
    payload,
    meta: {
      offline: {
        effect: { method: ADD_LINKS, params: payload },
        commit: {
          type: MOVE_LINKS_ADD_STEP_COMMIT, meta: { fromListName, fromIds: ids },
        },
        rollback: { type: MOVE_LINKS_ADD_STEP_ROLLBACK, meta: payload },
      },
    },
  });
};

export const moveLinksDeleteStep = (listName, ids, toListName, toIds) => async (dispatch, getState) => {

  const payload = { listName, ids, toListName, toIds };

  dispatch({
    type: MOVE_LINKS_DELETE_STEP,
    payload,
    meta: {
      offline: {
        effect: { method: DELETE_LINKS, params: payload },
        commit: { type: MOVE_LINKS_DELETE_STEP_COMMIT },
        rollback: { type: MOVE_LINKS_DELETE_STEP_ROLLBACK, meta: payload },
      },
    },
  });
};

export const deleteLinks = (ids) => async (dispatch, getState) => {

  const listName = getState().display.listName;
  const payload = { listName, ids };

  dispatch({
    type: DELETE_LINKS,
    payload,
    meta: {
      offline: {
        effect: { method: DELETE_LINKS, params: payload },
        commit: { type: DELETE_LINKS_COMMIT },
        rollback: { type: DELETE_LINKS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const retryDiedLinks = (ids) => async (dispatch, getState) => {

  const listName = getState().display.listName;
  for (const id of ids) {
    // DIED_ADDING -> try add this link again
    // DIED_MOVING -> try move this link again
    // DIED_REMOVING -> try delete this link again
    // DIED_DELETING  -> try delete this link again
    const link = getState().links[listName][id];
    const { status } = link;
    if (status === DIED_ADDING) {
      const links = [link];
      const payload = { listName, links };

      dispatch({
        type: ADD_LINKS,
        payload,
        meta: {
          offline: {
            effect: { method: ADD_LINKS, params: payload },
            commit: { type: ADD_LINKS_COMMIT },
            rollback: { type: ADD_LINKS_ROLLBACK, meta: payload },
          },
        },
      });
    } else if (status === DIED_MOVING) {

      let fromListName = null, fromId = null;
      for (const _listName in getState().links) {
        for (const _id in getState().links[_listName]) {
          if (getMainId(id) === getMainId(_id)) {
            [fromListName, fromId] = [_listName, _id];
            break;
          }
        }
        if (fromId !== null) break;
      }
      if (fromId === null) throw new Error(`Could not find fromId for id: ${id}`);

      const payload = { listName, ids };
      dispatch({
        type: CANCEL_DIED_LINKS,
        payload,
      });

      dispatch(moveLinks(listName, [fromId], fromListName));

    } else if (status === DIED_REMOVING || status === DIED_DELETING) {
      dispatch(deleteLinks([id]));
    } else {
      throw new Error(`Invalid status: ${status} of id: ${id}`);
    }
  }
};

export const cancelDiedLinks = (ids, listName = null) => async (dispatch, getState) => {

  if (!listName) listName = getState().display.listName;
  const payload = { listName, ids };

  dispatch({
    type: CANCEL_DIED_LINKS,
    payload,
  });
};

export const deleteOldLinksInTrash = (doDeleteOldLinksInTrash, doExtractContents) => async (dispatch, getState) => {

  // If not specified, get from settings. Get it here so that it's the most updated.
  if (doDeleteOldLinksInTrash === null) {
    doDeleteOldLinksInTrash = getState().settings.doDeleteOldLinksInTrash;
  }
  if (!doDeleteOldLinksInTrash) {
    dispatch(extractContents(doExtractContents, null, null));
    return;
  }

  dispatch({
    type: DELETE_OLD_LINKS_IN_TRASH,
    meta: {
      offline: {
        effect: { method: DELETE_OLD_LINKS_IN_TRASH },
        commit: { type: DELETE_OLD_LINKS_IN_TRASH_COMMIT, meta: { doExtractContents } },
        rollback: { type: DELETE_OLD_LINKS_IN_TRASH_ROLLBACK },
      },
    },
  });
};

export const extractContents = (doExtractContents, listName, ids) => async (dispatch, getState) => {

  // If not specified, get from settings. Get it here so that it's the most updated.
  if (doExtractContents === null) {
    doExtractContents = getState().settings.doExtractContents;
  }
  if (!doExtractContents) return;

  // IMPORTANT: didBeautify is removed as it's not needed
  //   Legacy old link contains didBeautify

  let links;
  if (listName === null && ids === null) {
    // Need to fetch first before update the link so that etags are available.
    // Do extract contents only on the current list name
    //   and make sure it's already fetched.
    listName = getState().display.listName;
    if (listName === TRASH) return;

    const obj = getState().links[listName];
    if (!obj) return;

    let _links = _.ignore(obj, [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]);
    _links = Object.values(_links)
      .filter(link => {
        return !link.extractedResult || link.extractedResult.status === EXTRACT_INIT;
      })
      .sort((a, b) => b.addedDT - a.addedDT);
    if (_links.length > 0) links = _links.slice(0, N_LINKS);

    // No unextracted link found, return
    if (!links) return;
  } else if (listName !== null && ids !== null) {
    let _links = _.ignore(
      _.select(getState().links[listName], ID, ids),
      [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]
    );
    _links = Object.values(_links);
    if (_links.length > 0) links = _links.slice(0, N_LINKS);

    if (!links) {
      console.log(`Links not found: ${listName}, ${ids}`);
      return;
    }
  } else {
    throw new Error(`Invalid parameters: ${listName}, ${ids}`);
  }

  let res;
  try {
    res = await axios.post(
      BRACE_EXTRACT_URL,
      { urls: links.map(link => link.url) },
      { headers: { Referer: DOMAIN_NAME } }
    );
  } catch (error) {
    console.log('Error when contact Brace server to extract contents with links: ', links, ' Error: ', error);
    return;
  }

  const extractedResults = res.data.extractedResults;

  const extractedLinks = [];
  for (let i = 0; i < extractedResults.length; i++) {
    const extractedResult = extractedResults[i];
    if (
      extractedResult.status === EXTRACT_INIT ||
      extractedResult.status === EXTRACT_EXCEEDING_N_URLS
    ) continue;

    // Some links might be moved while extracting.
    // If that the case, ignore them.
    if (!getState().links[listName]) continue;
    if (!Object.keys(getState().links[listName]).includes(links[i][ID])) continue;

    links[i].extractedResult = extractedResult;
    extractedLinks.push(links[i]);
  }
  if (extractedLinks.length === 0) return;

  const payload = { listName: listName, links: extractedLinks };
  dispatch({
    type: EXTRACT_CONTENTS,
    payload,
    meta: {
      offline: {
        effect: { method: UPDATE_LINKS, params: payload },
        commit: { type: EXTRACT_CONTENTS_COMMIT },
        rollback: { type: EXTRACT_CONTENTS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const tryUpdateExtractedContents = (payload) => async (dispatch, getState) => {

  const pageYOffset = getState().window.pageYOffset;
  const canRerender = pageYOffset === 0 && !isPopupShown(getState());

  dispatch({
    type: UPDATE_EXTRACTED_CONTENTS,
    payload: { ...payload, canRerender },
  });
};

export const updateFetchedSettings = () => async (dispatch, getState) => {
  const settings = getState().settings;
  dispatch({ type: UPDATE_FETCHED_SETTINGS, payload: settings });
};

export const updateListNameEditors = (listNameEditors) => {
  return { type: UPDATE_LIST_NAME_EDITORS, payload: listNameEditors };
};

export const updateSettingsPopup = (isShown) => async (dispatch, getState) => {
  /*
    A settings snapshot is made when FETCH_COMMIT and UPDATE_SETTINGS_COMMIT
    For FETCH_COMMIT, use Redux Loop
    For UPDATE_SETTINGS_COMMIT, check action type in snapshotReducer
      as need settings that used to upload to the server, not the current in the state

    Can't make a snapshot when open the popup because
      1. FETCH_COMMIT might be after the popup is open
      2. user might open the popup while settings is being updated or rolled back
  */
  if (!isShown) dispatch(updateSettings());

  dispatch(updatePopup(SETTINGS_POPUP, isShown));
};

export const addListNames = (newNames) => {

  let i = 0;
  const addedDT = Date.now();

  const listNameObjs = [];
  for (const newName of newNames) {
    // If cpu is fast enough, addedDT will be the same for all new names!
    //    so use a predefined one with added loop index.
    const id = `${addedDT + i}-${randomString(4)}`;
    const listNameObj = { listName: id, displayName: newName };
    listNameObjs.push(listNameObj);

    i += 1;
  }

  return { type: ADD_LIST_NAMES, payload: listNameObjs };
};

export const updateListNames = (listNames, newNames) => {
  return { type: UPDATE_LIST_NAMES, payload: { listNames, newNames } };
};

export const moveListName = (listName, direction) => {
  return { type: MOVE_LIST_NAME, payload: { listName, direction } };
};

export const moveToListName = (listName, parent) => {
  return { type: MOVE_TO_LIST_NAME, payload: { listName, parent } };
};

export const deleteListNames = (listNames) => async (dispatch, getState) => {
  const { listNameMap } = getState().settings;

  const allListNames = [];
  for (const listName of listNames) {
    const { listNameObj } = getListNameObj(listName, listNameMap);
    allListNames.push(listNameObj.listName);
    allListNames.push(...getAllListNames(listNameObj.children));
  }

  dispatch({ type: DELETE_LIST_NAMES, payload: { listNames: allListNames } });
};

export const updateDoExtractContents = (doExtractContents) => {
  return { type: UPDATE_DO_EXTRACT_CONTENTS, payload: doExtractContents };
};

export const updateDoDeleteOldLinksInTrash = (doDeleteOldLinksInTrash) => {
  return {
    type: UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH, payload: doDeleteOldLinksInTrash,
  };
};

export const updateDoDescendingOrder = (doDescendingOrder) => {
  return { type: UPDATE_DO_DESCENDING_ORDER, payload: doDescendingOrder };
};

export const updateSelectingListName = (listName) => {
  return {
    type: UPDATE_SELECTING_LIST_NAME,
    payload: listName,
  };
};

export const updateDeletingListName = (listName) => {
  return {
    type: UPDATE_DELETING_LIST_NAME,
    payload: listName,
  };
};

export const updateSettings = () => async (dispatch, getState) => {

  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;
  if (isEqual(settings, snapshotSettings)) {
    dispatch(cancelDiedSettings());
    return;
  }

  const doFetch = settings.doDescendingOrder !== snapshotSettings.doDescendingOrder;
  const payload = { settings, doFetch };
  dispatch({
    type: UPDATE_SETTINGS,
    payload: payload,
    meta: {
      offline: {
        effect: { method: UPDATE_SETTINGS, params: settings },
        commit: { type: UPDATE_SETTINGS_COMMIT, meta: payload },
        rollback: { type: UPDATE_SETTINGS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const retryDiedSettings = () => async (dispatch, getState) => {
  dispatch(updateSettings());
};

export const cancelDiedSettings = () => async (dispatch, getState) => {
  const { settings } = getState().snapshot;
  const payload = { settings };
  dispatch({
    type: CANCEL_DIED_SETTINGS,
    payload: payload,
  });
};

export const updateLayoutType = (type) => {
  return { type: UPDATE_LAYOUT_TYPE, payload: type };
};

const importAllDataLoop = async (dispatch, fpaths, contents) => {
  let total = fpaths.length, doneCount = 0;
  dispatch(updateImportAllDataProgress({ total, done: doneCount }));

  try {
    for (let i = 0; i < fpaths.length; i += N_LINKS) {
      const selectedFPaths = fpaths.slice(i, i + N_LINKS);
      const selectedContents = contents.slice(i, i + N_LINKS).map(content => {
        return JSON.stringify(content);
      });
      await batchPutFileWithRetry(selectedFPaths, selectedContents, 0);

      doneCount += selectedFPaths.length;
      dispatch(updateImportAllDataProgress({ total, done: doneCount }));

      await sleep(1000); // Make it slow to not overwhelm the server
    }
  } catch (e) {
    dispatch(updateImportAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));

    if (doneCount < total) {
      let msg = 'There is an error while importing! Below are contents that have not been imported:\n';
      for (let i = doneCount; i < fpaths.length; i++) {
        const fpath = fpaths[i];
        if (fpath.startsWith('links')) {
          msg += '    • ' + contents[i].url + '\n';
        }
        if (fpath === SETTINGS_FNAME) {
          msg += '    • Settings\n';
        }
      }
      window.alert(msg);
    }
  }
};

const parseImportedFile = (dispatch, text) => {

  dispatch(updateImportAllDataProgress({
    total: 'calculating...',
    done: 0,
  }));

  // 3 formats: json, html, and plain text
  const fpaths = [], contents = [];
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      for (const obj of json) {
        if (
          !obj.path ||
          !isString(obj.path) ||
          !(obj.path.startsWith('links') || obj.path === SETTINGS_FNAME)
        ) continue;

        if (!obj.data || !isObject(obj.data)) continue;

        if (obj.path.startsWith('links')) {
          if (
            !('id' in obj.data && 'url' in obj.data && 'addedDT' in obj.data)
          ) continue;

          if (!(isString(obj.data.id) && isString(obj.data.url))) continue;
          if (!isNumber(obj.data.addedDT)) continue;

          const arr = obj.path.split('/');
          if (arr.length !== 3) continue;
          if (arr[0] !== 'links') continue;

          const listName = arr[1], fname = arr[2];
          if (!fname.endsWith('.json')) continue;

          const id = fname.slice(0, -5);
          if (id !== obj.data.id) continue;

          const tokens = id.split('-');
          if (listName === TRASH) {
            if (tokens.length !== 4) continue;
            if (!(/^\d+$/.test(tokens[0]) && /^\d+$/.test(tokens[3]))) continue;
          } else {
            if (tokens.length !== 3) continue;
            if (!(/^\d+$/.test(tokens[0]))) continue;
          }

          if (!isDecorValid(obj.data)) {
            obj.data.decor = randomDecor(getUrlFirstChar(obj.data.url));
          }

          if ('extractedResult' in obj.data) {
            if (!isExtractedResultValid(obj.data)) {
              obj.data.extractedResult = null;
            }
          }
        }

        if (obj.path === SETTINGS_FNAME) {
          const settings = { ...initialSettingsState };
          if ('doExtractContents' in obj.data) {
            settings.doExtractContents = obj.data.doExtractContents;
          }
          if ('doDeleteOldLinksInTrash' in obj.data) {
            settings.doDeleteOldLinksInTrash = obj.data.doDeleteOldLinksInTrash;
          }
          if ('doDescendingOrder' in obj.data) {
            settings.doDescendingOrder = obj.data.doDescendingOrder;
          }
          if ('listNameMap' in obj.data && isListNameObjsValid(obj.data.listNameMap)) {
            settings.listNameMap = obj.data.listNameMap;
          }
          obj.data = settings;
        }

        fpaths.push(obj.path);
        contents.push(obj.data);
      }
    }
  } catch (e) {
    console.log('parseImportedFile: JSON.parse error: ', e);

    let listName = MY_LIST;
    let now = Date.now();

    if (text.includes('</a>') || text.includes('</A>')) {
      let start, end;
      for (const match of text.matchAll(/<h[^<]*<\/h|<a[^<]*<\/a>/gi)) {
        const str = match[0];
        if (str.toLowerCase().startsWith('<h')) {
          start = str.indexOf('>');
          if (start < 0) {
            console.log(`Not found > from <h, str: ${str}`);
            continue;
          }
          start += 1;

          end = str.indexOf('<', start);
          if (end < 0) {
            console.log(`Not found < from <h, str: ${str}, start: ${start}`);
            continue;
          }

          const value = str.slice(start, end);
          if (value.toLowerCase().includes(ARCHIVE.toLowerCase())) listName = ARCHIVE;
          else listName = MY_LIST;
        }

        if (str.toLowerCase().startsWith('<a')) {
          start = str.toLowerCase().indexOf('href="');
          if (start < 0) {
            console.log(`Not found href= from <a, str: ${str}`);
            continue;
          }
          start += 6;

          end = str.indexOf('"', start);
          if (end < 0) {
            console.log(`Not found " from href, str: ${str}, start: ${start}`);
            continue;
          }

          const url = str.slice(start, end);
          if (url.length === 0) continue;

          let addDate;
          start = str.toLowerCase().indexOf('add_date="');
          if (start > 0) start += 10;
          else {
            start = str.toLowerCase().indexOf('time_added="');
            if (start > 0) start += 12;
          }
          if (start > 0) {
            end = str.indexOf('"', start);
            if (end < 0) {
              console.log(`Not found " from add_date, str: ${str}, start: ${start}`);
              continue;
            }

            addDate = str.slice(start, end);
          }

          let addedDT = now;
          if (addDate && /^\d+$/.test(addDate)) {
            if (addDate.length === 16) addDate = addDate.slice(0, 13);
            if (addDate.length === 10) addDate = addDate + '000';
            const dt = parseInt(addDate, 10);
            if (isNumber(dt)) addedDT = dt;
          }

          const id = `${addedDT}-${randomString(4)}-${randomString(4)}`;
          const decor = randomDecor(getUrlFirstChar(url));
          const link = { id, url, addedDT, decor };
          const fpath = createLinkFPath(listName, link.id);

          fpaths.push(fpath);
          contents.push(link);
          now += 1;
        }
      }
    } else {
      for (const match of text.matchAll(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi
      )) {
        const url = match[0];
        const addedDT = now;

        const id = `${addedDT}-${randomString(4)}-${randomString(4)}`;
        const decor = randomDecor(getUrlFirstChar(url));
        const link = { id, url, addedDT, decor };
        const fpath = createLinkFPath(listName, link.id);

        fpaths.push(fpath);
        contents.push(link);
        now += 1;
      }
    }
  }

  importAllDataLoop(dispatch, fpaths, contents);
};

export const importAllData = () => async (dispatch, getState) => {

  const onError = () => {
    window.alert('Read failed: could not read content in the file. Please recheck your file.');
  };

  const onReaderLoad = (e) => {
    parseImportedFile(dispatch, e.target.result);
  };

  const onInputChange = () => {
    if (input.files) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.onerror = onError;
      reader.readAsText(file);
    }
  };

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt, .html, .json';
  input.addEventListener('change', onInputChange);
  input.click();
};

export const updateImportAllDataProgress = (progress) => {
  return {
    type: UPDATE_IMPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const exportAllDataLoop = async (dispatch, fPaths, doneCount) => {

  if (fPaths.length === 0) throw new Error(`Invalid fPaths: ${fPaths}`);

  const selectedCount = Math.min(fPaths.length - doneCount, N_LINKS);
  const selectedFPaths = fPaths.slice(doneCount, doneCount + selectedCount);
  const responses = await batchGetFileWithRetry(selectedFPaths, 0, true);
  const data = responses.filter(r => r.success).map((response) => {
    return { path: response.fpath, data: JSON.parse(response.content) };
  });

  doneCount = doneCount + selectedCount;
  if (doneCount > fPaths.length) {
    throw new Error(`Invalid doneCount: ${doneCount}, total: ${fPaths.length}`);
  }

  dispatch(updateExportAllDataProgress({
    total: fPaths.length,
    done: doneCount,
  }));

  if (doneCount < fPaths.length) {
    const remainingData = await exportAllDataLoop(dispatch, fPaths, doneCount);
    data.push(...remainingData);
  }

  return data;
};

export const exportAllData = () => async (dispatch, getState) => {

  dispatch(updateExportAllDataProgress({
    total: 'calculating...',
    done: 0,
  }));

  const fPaths = [];
  try {
    await userSession.listFiles((fpath) => {
      fPaths.push(fpath);
      return true;
    });
  } catch (e) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));
    return;
  }

  dispatch(updateExportAllDataProgress({
    total: fPaths.length,
    done: 0,
  }));

  if (fPaths.length === 0) return;

  try {
    const data = await exportAllDataLoop(dispatch, fPaths, 0);

    // This will write the file to an app directory, not shared.
    // On Android, can get permission to write to external storage
    //   https://reactnative.dev/docs/permissionsandroid.
    // On iOS, there is no way that I know of
    //   so no export all data on mobile for now.
    //const path = RNFS.DocumentDirectoryPath + '/brace-data.txt';
    //await RNFS.writeFile(path, JSON.stringify(data), 'utf8');
  } catch (e) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));
    return;
  }
};

export const updateExportAllDataProgress = (progress) => {
  return {
    type: UPDATE_EXPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const deleteAllDataLoop = async (dispatch, fPaths, doneCount) => {

  if (fPaths.length === 0) throw new Error(`Invalid fPaths: ${fPaths}`);

  const selectedCount = Math.min(fPaths.length - doneCount, N_LINKS);
  const selectedFPaths = fPaths.slice(doneCount, doneCount + selectedCount);
  const responses = await batchDeleteFileWithRetry(selectedFPaths, 0);

  doneCount = doneCount + selectedCount;
  if (doneCount > fPaths.length) {
    throw new Error(`Invalid doneCount: ${doneCount}, total: ${fPaths.length}`);
  }

  dispatch(updateDeleteAllDataProgress({
    total: fPaths.length,
    done: doneCount,
  }));

  if (doneCount < fPaths.length) {
    const remainingResponses = await deleteAllDataLoop(dispatch, fPaths, doneCount);
    responses.push(...remainingResponses);
  }

  return responses;
};

export const deleteAllData = () => async (dispatch, getState) => {

  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  dispatch(updateDeleteAllDataProgress({
    total: 'calculating...',
    done: 0,
  }));

  const fPaths = [];
  try {
    await userSession.listFiles((fpath) => {
      fPaths.push(fpath);
      return true;
    });
  } catch (e) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));
    return;
  }

  dispatch(updateDeleteAllDataProgress({
    total: fPaths.length,
    done: 0,
  }));

  if (fPaths.length === 0) return;

  try {
    await deleteAllDataLoop(dispatch, fPaths, 0);

    dispatch({
      type: DELETE_ALL_DATA,
    });
  } catch (e) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));
    return;
  }
};

export const updateDeleteAllDataProgress = (progress) => {
  return {
    type: UPDATE_DELETE_ALL_DATA_PROGRESS,
    payload: progress,
  };
};
