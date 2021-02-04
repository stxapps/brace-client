import { Linking, Dimensions, Platform } from 'react-native';
import { RESET_STATE as OFFLINE_RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import axios from 'axios';
//import RNFS from 'react-native-fs';

import userSession from '../userSession';
import { batchGetFileWithRetry, batchDeleteFileWithRetry } from '../apis/blockstack';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_WINDOW_SIZE,
  UPDATE_LIST_NAME, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, CACHE_FETCHED, UPDATE_FETCHED,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  UPDATE_FETCHED_MORE, CANCEL_FETCHED_MORE,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  UPDATE_LINKS,
  DELETE_LINKS, DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK,
  CANCEL_DIED_LINKS,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_EXTRACTED_CONTENTS,
  UPDATE_STATUS, UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING,
  ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS, CLEAR_SELECTED_LINK_IDS,
  ADD_LIST_NAMES, ADD_LIST_NAMES_COMMIT, ADD_LIST_NAMES_ROLLBACK,
  UPDATE_LIST_NAMES, UPDATE_LIST_NAMES_COMMIT, UPDATE_LIST_NAMES_ROLLBACK,
  MOVE_LIST_NAME, MOVE_LIST_NAME_COMMIT, MOVE_LIST_NAME_ROLLBACK,
  DELETE_LIST_NAMES, DELETE_LIST_NAMES_COMMIT, DELETE_LIST_NAMES_ROLLBACK,
  UPDATE_DELETING_LIST_NAME,
  RETRY_ADD_LIST_NAMES, RETRY_UPDATE_LIST_NAMES, RETRY_MOVE_LIST_NAME,
  RETRY_DELETE_LIST_NAMES, CANCEL_DIED_LIST_NAMES,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
  UPDATE_UPDATE_SETTINGS_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  UPDATE_PAGE_Y_OFFSET,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH, SAVE_TO_BRACE,
  ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, LIST_NAME_POPUP,
  CONFIRM_DELETE_POPUP, SETTINGS_POPUP, BULK_EDIT_MOVE_TO_POPUP,
  ID, STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
  MY_LIST, TRASH,
  ADDED, DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  BRACE_EXTRACT_URL, EXTRACT_EXCEEDING_N_URLS,
  N_LINKS, SWAP_LEFT, SWAP_RIGHT,
} from '../types/const';
import {
  _, isEqual,
  randomString, rerandomRandomTerm, deleteRemovedDT, getMainId,
  getUrlFirstChar, separateUrlAndParam,
  getUserImageUrl, randomDecor, swapArrayElements,
  isOfflineActionWithPayload, shouldDispatchFetch,
} from '../utils';

export const init = async (store) => {

  const hasSession = await userSession.hasSession();
  if (!hasSession) {
    const config = {
      appDomain: DOMAIN_NAME,
      scopes: ['store_write'],
      redirectUrl: BLOCKSTACK_AUTH
    };
    await userSession.createSession(config);
  }

  const initialUrl = await Linking.getInitialURL();
  if (initialUrl) {
    await handlePendingSignIn(initialUrl)(store.dispatch, store.getState);
  }

  let saveToBraceUrl;
  if (initialUrl && initialUrl.startsWith(APP_DOMAIN_NAME + SAVE_TO_BRACE)) {
    saveToBraceUrl = initialUrl;
  }

  Linking.addEventListener('url', async (e) => {
    await handlePendingSignIn(e.url)(store.dispatch, store.getState);
    await handleSaveToBrace(e.url)(store.dispatch, store.getState);
  });

  Dimensions.addEventListener("change", ({ window }) => {
    store.dispatch({
      type: UPDATE_WINDOW_SIZE,
      payload: {
        windowWidth: window.width,
        windowHeight: window.height,
      }
    });
  });

  const isUserSignedIn = await userSession.isUserSignedIn();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }
  const href = saveToBraceUrl || DOMAIN_NAME + '/';
  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      username,
      userImage,
      href,
      windowWidth: Dimensions.get('window').width,
      windowHeight: Dimensions.get('window').height,
    }
  });
};

const handlePendingSignIn = (url) => async (dispatch, getState) => {

  if (!url.startsWith(DOMAIN_NAME + BLOCKSTACK_AUTH) &&
    !url.startsWith(APP_DOMAIN_NAME + BLOCKSTACK_AUTH)) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true
  });

  const { param: { authResponse } } = separateUrlAndParam(url, 'authResponse');
  try {
    await userSession.handlePendingSignIn(authResponse);
  } catch (e) {
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
    console.log('handlePendingSignIn throws an error!', e);
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    dispatch({
      type: UPDATE_USER,
      payload: {
        isUserSignedIn: true,
        username: userData.username,
        image: getUserImageUrl(userData),
      }
    });
  }

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false
  });
};

const handleSaveToBrace = (url) => async (dispatch, getState) => {

  if (!url.startsWith(APP_DOMAIN_NAME + SAVE_TO_BRACE)) return;

  dispatch({
    type: UPDATE_HREF,
    payload: url
  });
};

const getPopupShownId = (state) => {

  if (state.display.isAddPopupShown) return ADD_POPUP;
  if (state.display.isProfilePopupShown) return PROFILE_POPUP;
  if (state.display.isListNamePopupShown) return LIST_NAME_POPUP;
  if (state.display.isConfirmDeletePopupShown) return CONFIRM_DELETE_POPUP;
  if (state.display.isSettingsPopupShown) return SETTINGS_POPUP;
  if (state.display.isBulkEditMoveToPopupShown) return BULK_EDIT_MOVE_TO_POPUP;

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

export const signUp = () => async (dispatch, getState) => {
  // On Android, signUp and signIn will always lead to handlePendingSignIn.
  // On iOS, signUp and signIn will always return a promise.
  if (Platform.OS === 'android') {
    await userSession.signUp();
  } else if (Platform.OS === 'ios') {

    // As handle pending sign in takes time, show loading first.
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: true
    });

    try {
      await userSession.signUp();
    } catch (e) {
      // All errors thrown by signIn have the same next steps
      //   - Invalid token
      //   - Already signed in with the same account
      //   - Already signed in with different account
    }

    const isUserSignedIn = await userSession.isUserSignedIn();
    if (isUserSignedIn) {
      const userData = await userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: getUserImageUrl(userData),
        }
      });
    }

    // Stop show loading
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: false
    });
  } else {
    throw new Error(`Invalid Platform.OS: ${Platform.OS}`);
  }
};

export const signIn = () => async (dispatch, getState) => {

  if (Platform.OS === 'android') {
    await userSession.signIn();
  } else if (Platform.OS === 'ios') {

    // As handle pending sign in takes time, show loading first.
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: true
    });

    try {
      await userSession.signIn();
    } catch (e) {
      // All errors thrown by signIn have the same next steps
      //   - Invalid token
      //   - Already signed in with the same account
      //   - Already signed in with different account
    }

    const isUserSignedIn = await userSession.isUserSignedIn();
    if (isUserSignedIn) {
      const userData = await userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: getUserImageUrl(userData),
        }
      });
    }

    // Stop show loading
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: false
    });
  } else {
    throw new Error(`Invalid Platform.OS: ${Platform.OS}`);
  }
};

export const signOut = () => async (dispatch, getState) => {

  await userSession.signUserOut();

  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};

export const updatePopup = (id, isShown, anchorPosition = null) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
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
      }
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
    dispatch(clearSelectedLinkIds());
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
    dispatch(clearSelectedLinkIds());
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
      }
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
  const link = { id, url, addedDT, decor, };
  const links = [link];
  const payload = { listName, links };

  // Always call extractContents
  //   and check at that time to actually do it or not.
  // So it's real time with updated settings from fetch.
  //if (doExtractContents === null) doExtractContents = getState().settings.doExtractContents;

  dispatch({
    type: ADD_LINKS,
    payload,
    meta: {
      offline: {
        effect: { method: ADD_LINKS, params: payload },
        commit: { type: ADD_LINKS_COMMIT, meta: { doExtractContents } },
        rollback: { type: ADD_LINKS_ROLLBACK, meta: payload },
      }
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
          type: MOVE_LINKS_ADD_STEP_COMMIT, meta: { fromListName, fromIds: ids }
        },
        rollback: { type: MOVE_LINKS_ADD_STEP_ROLLBACK, meta: payload },
      }
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
      }
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
      }
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
          }
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

export const changeListName = (listName, fetched) => async (dispatch, getState) => {

  const _listName = getState().display.listName;

  dispatch({
    type: UPDATE_LIST_NAME,
    payload: listName,
  })
  if (!fetched.includes(listName)) {
    dispatch(fetch(false, null));
  }
  dispatch(clearSelectedLinkIds());

  dispatch(updateFetched(null, null, _listName));
};

export const updateSearchString = (searchString) => {
  return {
    type: UPDATE_SEARCH_STRING,
    payload: searchString,
  };
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
      }
    },
  });
};

export const updateStatus = (status) => {
  return {
    type: UPDATE_STATUS,
    payload: status,
  };
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
      .filter(link => !link.extractedResult)
      .sort((a, b) => b.addedDT - a.addedDT);

    // Allow just one link at a time for now
    if (_links[0]) {
      links = [_links[0]];
    }

    // No not extracted link found, return
    if (!links) return;
  } else if (listName !== null && ids !== null) {
    let _links = _.ignore(
      _.select(getState().links[listName], ID, ids),
      [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]
    );
    _links = Object.values(_links);

    // Allow just one link at a time for now
    if (!_links[0]) {
      console.log(`Links not found: ${listName}, ${ids}`);
      return;
    }
    links = [_links[0]];
  } else {
    throw new Error(`Invalid parameters: ${listName}, ${ids}`);
  }

  let res;
  try {
    res = await axios.post(
      BRACE_EXTRACT_URL,
      { urls: links.map(link => link.url) },
      { headers: { Referer: 'https://brace.to' } }
    );
  } catch (error) {
    console.log('Error when contact Brace server to extract contents with links: ', links, ' Error: ', error);
    return;
  }

  const extractedResults = res.data.extractedResults;

  const extractedLinks = [];
  for (let i = 0; i < extractedResults.length; i++) {
    const extractedResult = extractedResults[i];
    if (extractedResult.status === EXTRACT_EXCEEDING_N_URLS) continue;

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
      }
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

export const clearSelectedLinkIds = () => {
  return {
    type: CLEAR_SELECTED_LINK_IDS
  };
};

export const addListNames = (newNames) => async (dispatch, getState) => {

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

  const settings = { ...getState().settings };
  settings.listNameMap = [
    ...settings.listNameMap.map(listNameObj => {
      return { listName: listNameObj.listName, displayName: listNameObj.displayName };
    }),
    ...listNameObjs
  ];

  const payload = { listNameObjs };
  dispatch({
    type: ADD_LIST_NAMES,
    payload: payload,
    meta: {
      offline: {
        effect: { method: UPDATE_SETTINGS, params: settings },
        commit: { type: ADD_LIST_NAMES_COMMIT, meta: payload },
        rollback: { type: ADD_LIST_NAMES_ROLLBACK, meta: payload }
      }
    }
  });
};

export const updateListNames = (listNames, newNames) => async (dispatch, getState) => {

  const settings = { ...getState().settings };
  settings.listNameMap = settings.listNameMap.map(listNameObj => {

    const i = listNames.indexOf(listNameObj.listName);
    if (i >= 0) {
      return { listName: listNameObj.listName, displayName: newNames[i] };
    }

    return { listName: listNameObj.listName, displayName: listNameObj.displayName };
  });

  const payload = { listNames, newNames };
  dispatch({
    type: UPDATE_LIST_NAMES,
    payload: payload,
    meta: {
      offline: {
        effect: { method: UPDATE_SETTINGS, params: settings },
        commit: { type: UPDATE_LIST_NAMES_COMMIT, meta: payload },
        rollback: { type: UPDATE_LIST_NAMES_ROLLBACK, meta: payload }
      }
    }
  });
};

export const moveListName = (listName, direction) => async (dispatch, getState) => {

  const settings = { ...getState().settings };
  settings.listNameMap = settings.listNameMap.map(listNameObj => {
    return { listName: listNameObj.listName, displayName: listNameObj.displayName };
  });

  const i = settings.listNameMap.findIndex(listNameObj => {
    return listNameObj.listName === listName;
  });
  if (i < 0) throw new Error(`Invalid listName: ${listName} and listNameMap: ${settings.listNameMap}`);

  if (direction === SWAP_LEFT) {
    settings.listNameMap = swapArrayElements(settings.listNameMap, i - 1, i);
  } else if (direction === SWAP_RIGHT) {
    settings.listNameMap = swapArrayElements(settings.listNameMap, i, i + 1);
  } else {
    throw new Error(`Invalid direction: ${direction}`);
  }

  const payload = { listName, direction };
  dispatch({
    type: MOVE_LIST_NAME,
    payload: payload,
    meta: {
      offline: {
        effect: { method: UPDATE_SETTINGS, params: settings },
        commit: { type: MOVE_LIST_NAME_COMMIT, meta: payload },
        rollback: { type: MOVE_LIST_NAME_ROLLBACK, meta: payload }
      }
    }
  });
};

export const deleteListNames = (listNames) => async (dispatch, getState) => {

  const settings = { ...getState().settings };
  settings.listNameMap = settings.listNameMap.filter(listNameObj => {
    return !listNames.includes(listNameObj.listName);
  });
  settings.listNameMap = settings.listNameMap.map(listNameObj => {
    return { listName: listNameObj.listName, displayName: listNameObj.displayName };
  });

  const payload = { listNames };
  dispatch({
    type: DELETE_LIST_NAMES,
    payload: payload,
    meta: {
      offline: {
        effect: { method: UPDATE_SETTINGS, params: settings },
        commit: { type: DELETE_LIST_NAMES_COMMIT, meta: payload },
        rollback: { type: DELETE_LIST_NAMES_ROLLBACK, meta: payload }
      }
    }
  });
};

export const updateDeletingListName = (listName) => {
  return {
    type: UPDATE_DELETING_LIST_NAME,
    payload: listName,
  }
};

export const retryDiedListNames = (listNames) => async (dispatch, getState) => {

  const settings = { ...getState().settings };

  const listNameObjs = settings.listNameMap.filter(obj => {
    return listNames.includes(obj.listName)
  });

  settings.listNameMap = [
    ...settings.listNameMap.map(listNameObj => {
      return { listName: listNameObj.listName, displayName: listNameObj.displayName };
    })
  ];

  const diedAddingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_ADDING;
  });
  if (diedAddingListNameObjs.length > 0) {

    const payload = { listNameObjs: diedAddingListNameObjs };
    dispatch({
      type: RETRY_ADD_LIST_NAMES,
      payload: payload,
      meta: {
        offline: {
          effect: { method: UPDATE_SETTINGS, params: settings },
          commit: { type: ADD_LIST_NAMES_COMMIT, meta: payload },
          rollback: { type: ADD_LIST_NAMES_ROLLBACK, meta: payload }
        }
      }
    });
  }

  const diedUpdatingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_UPDATING;
  });
  if (diedUpdatingListNameObjs.length > 0) {

    const diedUpdatingListNames = diedUpdatingListNameObjs.map(obj => obj.listName);
    const payload = { listNames: diedUpdatingListNames };
    dispatch({
      type: RETRY_UPDATE_LIST_NAMES,
      payload: payload,
      meta: {
        offline: {
          effect: { method: UPDATE_SETTINGS, params: settings },
          commit: { type: UPDATE_LIST_NAMES_COMMIT, meta: payload },
          rollback: { type: UPDATE_LIST_NAMES_ROLLBACK, meta: payload }
        }
      }
    });
  }

  const diedMovingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_MOVING;
  });
  for (const diedMovingListNameObj of diedMovingListNameObjs) {

    const payload = { listName: diedMovingListNameObj.listName };
    dispatch({
      type: RETRY_MOVE_LIST_NAME,
      payload: payload,
      meta: {
        offline: {
          effect: { method: UPDATE_SETTINGS, params: settings },
          commit: { type: MOVE_LIST_NAME_COMMIT, meta: payload },
          rollback: { type: MOVE_LIST_NAME_ROLLBACK, meta: payload }
        }
      }
    });
  }

  const diedDeletingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_DELETING;
  });
  if (diedDeletingListNameObjs.length > 0) {

    const diedDeletingListNames = diedDeletingListNameObjs.map(obj => obj.listName);
    const payload = { listNames: diedDeletingListNames };
    dispatch({
      type: RETRY_DELETE_LIST_NAMES,
      payload: payload,
      meta: {
        offline: {
          effect: { method: UPDATE_SETTINGS, params: settings },
          commit: { type: DELETE_LIST_NAMES_COMMIT, meta: payload },
          rollback: { type: DELETE_LIST_NAMES_ROLLBACK, meta: payload }
        }
      }
    });
  }
};

export const cancelDiedListNames = (listNames) => {
  return {
    type: CANCEL_DIED_LIST_NAMES,
    payload: { listNames }
  };
};

export const updateSettings = (updatedValues) => async (dispatch, getState) => {

  const rollbackValues = {};
  for (const k of Object.keys(updatedValues)) {
    rollbackValues[k] = getState().settings[k];
  }

  const settings = { ...getState().settings, ...updatedValues };

  const payload = { settings, rollbackValues };
  dispatch({
    type: UPDATE_SETTINGS,
    payload: payload,
    meta: {
      offline: {
        effect: { method: UPDATE_SETTINGS, params: settings },
        commit: { type: UPDATE_SETTINGS_COMMIT, meta: payload },
        rollback: { type: UPDATE_SETTINGS_ROLLBACK, meta: payload }
      }
    }
  });
};

export const updateUpdateSettingsProgress = (progress) => {
  return {
    type: UPDATE_UPDATE_SETTINGS_PROGRESS,
    payload: progress
  };
};

export const updatePageYOffset = (pageYOffset) => {
  return {
    type: UPDATE_PAGE_Y_OFFSET,
    payload: pageYOffset
  };
};

const exportAllDataLoop = async (dispatch, fPaths, doneCount) => {

  if (fPaths.length === 0) throw new Error(`Invalid fPaths: ${fPaths}`);

  const selectedCount = Math.min(fPaths.length - doneCount, N_LINKS);
  const selectedFPaths = fPaths.slice(doneCount, doneCount + selectedCount);
  const responses = await batchGetFileWithRetry(selectedFPaths, 0);
  const data = responses.map((response, i) => {
    return { path: selectedFPaths[i], data: JSON.parse(response.content) };
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
    payload: progress
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
    payload: progress
  };
};
