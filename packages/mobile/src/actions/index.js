import { Linking, AppState, Platform } from 'react-native';
import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import axios from 'axios';
//import RNFS from 'react-native-fs';
import * as RNIap from 'react-native-iap';
import { LexoRank } from "@wewatch/lexorank";

import userSession from '../userSession';
import {
  batchDeleteFileWithRetry,
} from '../apis/blockstack';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_STACKS_ACCESS, UPDATE_LIST_NAME,
  UPDATE_POPUP, UPDATE_SEARCH_STRING, UPDATE_LINK_EDITOR, UPDATE_SCROLL_PANEL,
  UPDATE_STATUS, UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING,
  ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS, UPDATE_SELECTING_LINK_ID,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, CACHE_FETCHED, UPDATE_FETCHED,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK, CACHE_FETCHED_MORE,
  UPDATE_FETCHED_MORE, CANCEL_FETCHED_MORE, CLEAR_FETCHED_LIST_NAMES,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  UPDATE_LINKS, DELETE_LINKS, DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT,
  MOVE_LINKS_DELETE_STEP_ROLLBACK, CANCEL_DIED_LINKS,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_EXTRACTED_CONTENTS, UPDATE_LIST_NAME_EDITORS, ADD_LIST_NAMES,
  UPDATE_LIST_NAMES, MOVE_LIST_NAME, MOVE_TO_LIST_NAME, DELETE_LIST_NAMES,
  UPDATE_SELECTING_LIST_NAME, UPDATE_DELETING_LIST_NAME,
  UPDATE_DO_EXTRACT_CONTENTS, UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH,
  UPDATE_DO_DESCENDING_ORDER, UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS, UPDATE_SETTINGS_VIEW_ID,
  UPDATE_LAYOUT_TYPE, GET_PRODUCTS, GET_PRODUCTS_COMMIT, GET_PRODUCTS_ROLLBACK,
  REQUEST_PURCHASE, REQUEST_PURCHASE_COMMIT, REQUEST_PURCHASE_ROLLBACK,
  RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK,
  REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
  UPDATE_IAP_PUBLIC_KEY, UPDATE_IAP_PRODUCT_STATUS, UPDATE_IAP_PURCHASE_STATUS,
  UPDATE_IAP_RESTORE_STATUS, UPDATE_IAP_REFRESH_STATUS,
  PIN_LINK, PIN_LINK_COMMIT, PIN_LINK_ROLLBACK, UNPIN_LINK, UNPIN_LINK_COMMIT,
  UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP, MOVE_PINNED_LINK_ADD_STEP_COMMIT,
  MOVE_PINNED_LINK_ADD_STEP_ROLLBACK, MOVE_PINNED_LINK_DELETE_STEP,
  MOVE_PINNED_LINK_DELETE_STEP_COMMIT, MOVE_PINNED_LINK_DELETE_STEP_ROLLBACK,
  CANCEL_DIED_PINS, UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_URL_SCHEME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH,
  APP_GROUP_SHARE, APP_GROUP_SHARE_UKEY,
  SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  LIST_NAMES_POPUP, PIN_MENU_POPUP, PAYWALL_POPUP, CONFIRM_DELETE_POPUP, SETTINGS_POPUP,
  SETTINGS_LISTS_MENU_POPUP, ID, STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
  MY_LIST, TRASH, N_LINKS, N_DAYS,
  ADDED, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  BRACE_EXTRACT_URL, BRACE_PRE_EXTRACT_URL, EXTRACT_INIT, EXTRACT_EXCEEDING_N_URLS,
  IAP_VERIFY_URL, IAP_STATUS_URL, APPSTORE, PLAYSTORE, COM_BRACEDOTTO,
  COM_BRACEDOTTO_SUPPORTER, SIGNED_TEST_STRING, VALID, INVALID, UNKNOWN, ERROR, ACTIVE,
  SWAP_LEFT, SWAP_RIGHT,
} from '../types/const';
import {
  isEqual, sleep,
  randomString, rerandomRandomTerm, deleteRemovedDT, getMainId,
  getUrlFirstChar, separateUrlAndParam, getUserImageUrl, randomDecor,
  isOfflineActionWithPayload, shouldDispatchFetch, getListNameObj, getAllListNames,
  getLatestPurchase, getValidPurchase, doEnableExtraFeatures,
  extractPinFPath, getSortedLinks, getPinFPaths, getPins, separatePinnedValues,
  sortLinks, sortWithPins,
} from '../utils';
import { _ } from '../utils/obj';

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

  AppState.addEventListener('change', async (nextAppState) => {
    if (nextAppState === 'active') {
      const isUserSignedIn = await userSession.isUserSignedIn();
      if (isUserSignedIn) {
        const { purchaseStatus } = store.getState().iap;
        if (purchaseStatus === REQUEST_PURCHASE) return;

        const interval = (Date.now() - _lastFetchDT) / 1000 / 60 / 60;
        //if (interval < 0.1) return;
        if (isPopupShown(store.getState()) && interval < 0.2) return;

        store.dispatch(clearFetchedListNames());
      }
    }
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
      windowWidth: null,
      windowHeight: null,
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

  if (state.display.isConfirmDeletePopupShown) return CONFIRM_DELETE_POPUP;
  if (state.display.isPaywallPopupShown) return PAYWALL_POPUP;
  if (state.display.isPinMenuPopupShown) return PIN_MENU_POPUP;
  if (state.display.isListNamesPopupShown) return LIST_NAMES_POPUP;
  if (state.display.isSettingsListsMenuPopupShown) return SETTINGS_LISTS_MENU_POPUP;
  if (state.display.isSettingsPopupShown) return SETTINGS_POPUP;
  if (state.display.isProfilePopupShown) return PROFILE_POPUP;
  if (state.display.isAddPopupShown) return ADD_POPUP;
  if (state.display.isSignUpPopupShown) return SIGN_UP_POPUP;
  if (state.display.isSignInPopupShown) return SIGN_IN_POPUP;

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

  // make sure dispatch updateFetched finishes before dispatch updateFetchedMore
  await updateFetched(null, null, _listName)(dispatch, getState);
  await updateFetchedMore(null, null, _listName)(dispatch, getState);
};

export const updateSearchString = (searchString) => {
  return {
    type: UPDATE_SEARCH_STRING,
    payload: searchString,
  };
};

export const updateLinkEditor = (values) => {
  return { type: UPDATE_LINK_EDITOR, payload: values };
};

export const updateScrollPanel = (contentHeight, layoutHeight, pageYOffset) => {
  return {
    type: UPDATE_SCROLL_PANEL,
    payload: { contentHeight, layoutHeight, pageYOffset },
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

let _lastFetchDT = 0;
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
  const pendingPins = getState().pendingPins;

  const payload = { listName, doDescendingOrder, doFetchSettings, pendingPins };

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

  if (doFetchSettings) _lastFetchDT = Date.now();
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
    const pinFPaths = getPinFPaths(getState());
    const pendingPins = getState().pendingPins;

    let sortedLinks = sortLinks(links, doDescendingOrder);
    sortedLinks = sortWithPins(sortedLinks, pinFPaths, pendingPins, (link) => {
      return getMainId(link.id);
    });

    let _sortedLinks = sortLinks(_links, doDescendingOrder);
    _sortedLinks = sortWithPins(_sortedLinks, pinFPaths, pendingPins, (link) => {
      return getMainId(link.id);
    });

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

  const isBulkEditing = getState().display.isBulkEditing;
  if (!isBulkEditing) {
    const pageYOffset = getState().scrollPanel.pageYOffset;
    if (
      (updateAction === 1 && pageYOffset < 64 / 10 * _links.length) ||
      (updateAction === 2 && pageYOffset === 0 && !isPopupShown(getState()))
    ) {
      dispatch(updateFetched(payload, meta));
      return;
    }
  }

  dispatch({
    type: CACHE_FETCHED,
    payload,
    theMeta: meta,
  });
};

export const updateFetched = (
  payload, meta, listName = null, doChangeListCount = false
) => async (dispatch, getState) => {

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
  const pendingPins = getState().pendingPins;

  const payload = { fetchMoreId, listName, ids, doDescendingOrder, pendingPins };

  // If there is already cached fetchedMore with the same list name, just return.
  const fetchedMore = getState().fetchedMore[listName];
  if (fetchedMore) return;

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

  const { hasDisorder } = payload;

  if (listName !== getState().display.listName || !hasDisorder) {
    dispatch(updateFetchedMore(payload, meta));
    return;
  }

  const isBulkEditing = getState().display.isBulkEditing;
  if (!isBulkEditing) {
    const scrollHeight = getState().scrollPanel.contentHeight;
    const windowHeight = getState().scrollPanel.layoutHeight;
    const windowBottom = windowHeight + getState().scrollPanel.pageYOffset;

    if (windowBottom > (scrollHeight * 0.96) && !isPopupShown(getState())) {
      dispatch(updateFetchedMore(payload, meta));
      return;
    }
  }

  dispatch({
    type: CACHE_FETCHED_MORE,
    payload,
    theMeta: meta,
  });
};

export const updateFetchedMore = (payload, meta, listName = null) => async (
  dispatch, getState
) => {

  if (!payload) {
    if (!listName) listName = getState().display.listName;

    const fetchedMore = getState().fetchedMore[listName];
    if (fetchedMore) ({ payload, meta } = fetchedMore);
  }
  if (!payload) return;

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
        commit: { type: MOVE_LINKS_DELETE_STEP_COMMIT, meta: payload },
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

      const payload = { listName, ids };
      dispatch({
        type: CANCEL_DIED_LINKS,
        payload,
      });

      let fromListName = null, fromId = null;
      for (const _listName in getState().links) {
        if (_listName === listName) continue;
        for (const _id in getState().links[_listName]) {
          if (getMainId(id) === getMainId(_id)) {
            [fromListName, fromId] = [_listName, _id];
            break;
          }
        }
        if (fromId !== null) break;
      }
      if (fromId === null) {
        console.log(`In retryDiedLinks, could not find fromId for id: ${id}`);
        return;
      }

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

export const deleteOldLinksInTrash = (
  doDeleteOldLinksInTrash, doExtractContents
) => async (dispatch, getState) => {

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
    if (_links.length > 0) {
      links = _links.slice(0, N_LINKS);
    } else {
      return; // No unextracted link found, return
    }
  } else if (listName !== null && ids !== null) {
    let _links = _.ignore(
      _.select(getState().links[listName], ID, ids),
      [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]
    );
    _links = Object.values(_links);
    if (_links.length > 0) {
      links = _links.slice(0, N_LINKS);
    } else {
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

  const isBulkEditing = getState().display.isBulkEditing;
  const pageYOffset = getState().scrollPanel.pageYOffset;
  const canRerender = !isBulkEditing && pageYOffset === 0 && !isPopupShown(getState());

  dispatch({
    type: UPDATE_EXTRACTED_CONTENTS,
    payload: { ...payload, canRerender },
  });
};

export const updateSettingsPopup = (isShown) => async (dispatch, getState) => {
  /*
    A settings snapshot is made when FETCH_COMMIT and UPDATE_SETTINGS_COMMIT
    For FETCH_COMMIT and UPDATE_SETTINGS_COMMIT, check action type in snapshotReducer
      as need settings that used to upload to the server, not the current in the state

    Can't make a snapshot when open the popup because
      1. FETCH_COMMIT might be after the popup is open
      2. user might open the popup while settings is being updated or rolled back
  */
  if (!isShown) dispatch(updateSettings());

  dispatch(updatePopup(SETTINGS_POPUP, isShown));
};

export const updateSettingsViewId = (
  viewId, isSidebarShown, didCloseAnimEnd, didSidebarAnimEnd
) => async (dispatch, getState) => {

  const payload = {};
  if (viewId) payload.settingsViewId = viewId;
  if ([true, false].includes(isSidebarShown)) {
    payload.isSettingsSidebarShown = isSidebarShown;
  }
  if ([true, false].includes(didCloseAnimEnd)) {
    payload.didSettingsCloseAnimEnd = didCloseAnimEnd;
  }
  if ([true, false].includes(didSidebarAnimEnd)) {
    payload.didSettingsSidebarAnimEnd = didSidebarAnimEnd;
  }

  dispatch({ type: UPDATE_SETTINGS_VIEW_ID, payload });
};

export const updateListNameEditors = (listNameEditors) => {
  return { type: UPDATE_LIST_NAME_EDITORS, payload: listNameEditors };
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

export const tryUpdateSettings = () => async (dispatch, getState) => {
  const isSettingsPopupShown = getState().display.isSettingsPopupShown;
  if (isSettingsPopupShown) return;

  dispatch(updateSettings());
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

export const importAllData = () => async (dispatch, getState) => {
  // Do nothing on mobile. This is for web.
};

export const updateImportAllDataProgress = (progress) => {
  return {
    type: UPDATE_IMPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

export const exportAllData = () => async (dispatch, getState) => {
  // Do nothing on mobile. This is for web.
};

export const updateExportAllDataProgress = (progress) => {
  return {
    type: UPDATE_EXPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const deleteAllDataLoop = async (dispatch, fpaths, doneCount) => {

  if (fpaths.length === 0) throw new Error(`Invalid fpaths: ${fpaths}`);

  const selectedCount = Math.min(fpaths.length - doneCount, N_LINKS);
  const selectedFPaths = fpaths.slice(doneCount, doneCount + selectedCount);
  const responses = await batchDeleteFileWithRetry(selectedFPaths, 0);

  doneCount = doneCount + selectedCount;
  if (doneCount > fpaths.length) {
    throw new Error(`Invalid doneCount: ${doneCount}, total: ${fpaths.length}`);
  }

  dispatch(updateDeleteAllDataProgress({
    total: fpaths.length,
    done: doneCount,
  }));

  if (doneCount < fpaths.length) {
    const remainingResponses = await deleteAllDataLoop(dispatch, fpaths, doneCount);
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

  const fpaths = [];
  try {
    await userSession.listFiles((fpath) => {
      fpaths.push(fpath);
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
    total: fpaths.length,
    done: 0,
  }));

  if (fpaths.length === 0) return;

  try {
    await deleteAllDataLoop(dispatch, fpaths, 0);

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

const verifyPurchase = async (rawPurchase) => {
  if (!rawPurchase) return { status: INVALID };
  if (Platform.OS === 'android' && rawPurchase.purchaseStateAndroid === 0) {
    return { status: INVALID };
  }

  let source;
  if (Platform.OS === 'ios') source = APPSTORE;
  else if (Platform.OS === 'android') source = PLAYSTORE;

  if (!source) {
    console.log(`Invalid Platform.OS: ${Platform.OS}`);
    return { status: ERROR };
  }

  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const userId = sigObj.publicKey;

  const productId = rawPurchase.productId;

  let token;
  if (Platform.OS === 'ios') token = rawPurchase.transactionReceipt;
  else if (Platform.OS === 'android') token = rawPurchase.purchaseToken;

  if (!token) {
    console.log('No purchaseToken in rawPurchase');
    return { status: INVALID };
  }

  const reqBody = { source, userId, productId, token };

  let verifyResult;
  try {
    const res = await axios.post(
      IAP_VERIFY_URL,
      reqBody,
      { headers: { Referer: DOMAIN_NAME } }
    );
    verifyResult = res.data;
  } catch (error) {
    console.log(`Error when contact IAP server to verify with reqBody: ${JSON.stringify(reqBody)}, Error: `, error);
    return { status: UNKNOWN };
  }

  try {
    if (Platform.OS !== 'android') {
      await RNIap.finishTransaction(rawPurchase, false);
    }
  } catch (error) {
    console.log('Error when finishTransaction: ', error);
  }

  return verifyResult;
};

const getIapStatus = async (doForce) => {
  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const reqBody = {
    userId: sigObj.publicKey,
    signature: sigObj.signature,
    appId: COM_BRACEDOTTO,
    doForce: doForce,
  };

  const res = await axios.post(
    IAP_STATUS_URL,
    reqBody,
    { headers: { Referer: DOMAIN_NAME } }
  );
  return res;
};

const getPurchases = (
  action, commitAction, rollbackAction, doForce, serverOnly
) => async (dispatch, getState) => {

  const { purchaseState, restoreStatus, refreshStatus } = getState().iap;
  if (
    purchaseState === REQUEST_PURCHASE ||
    restoreStatus === RESTORE_PURCHASES ||
    refreshStatus === REFRESH_PURCHASES
  ) return;

  dispatch({ type: action });

  let statusResult;
  try {
    const res = await getIapStatus(doForce);
    statusResult = res.data;

    if (serverOnly) {
      dispatch({ type: commitAction, payload: statusResult });
      return;
    }

    if (statusResult.status === VALID) {
      const purchase = getLatestPurchase(statusResult.purchases);
      if (purchase && purchase.status === ACTIVE) {
        dispatch({ type: commitAction, payload: statusResult });
        return;
      }
    }
  } catch (error) {
    console.log('Error when contact IAP server to get purchases: ', error);
    dispatch({ type: rollbackAction });
    return;
  }

  let isIap = false;
  let waits = [200, 500, 1000, 1500, 2000, 2500, 3000];
  for (const wait of waits) {
    if (getState().iap.productStatus === GET_PRODUCTS_COMMIT) {
      isIap = true;
      break;
    }
    await sleep(wait);
  }
  if (!isIap) {
    dispatch({ type: commitAction, payload: statusResult });
    return;
  }

  try {
    // As iapUpdatedListener can be missed, need to getAvailablePurchases
    const validPurchases = [], originalOrderIds = [];

    const rawPurchases = await RNIap.getAvailablePurchases();
    for (const rawPurchase of rawPurchases) {
      let originalOrderId;
      if (Platform.OS === 'ios') {
        originalOrderId = rawPurchase.originalTransactionIdentifierIOS;
      } else if (Platform.OS === 'android') {
        originalOrderId = rawPurchase.purchaseToken;
      }

      if (originalOrderIds.includes(originalOrderId)) continue;
      originalOrderIds.push(originalOrderId);

      const verifyResult = await verifyPurchase(rawPurchase);
      if (verifyResult.status === VALID) {
        validPurchases.push(verifyResult.purchase);
      }
    }

    if (validPurchases.length > 0) {
      statusResult.status = VALID;
      for (const purchase of statusResult.purchases) {
        const found = validPurchases.find(p => {
          return p.orderId === purchase.orderId;
        });
        if (!found) validPurchases.push(purchase);
      }
      statusResult.purchases = validPurchases;
    }

    dispatch({ type: commitAction, payload: statusResult });
  } catch (error) {
    console.log('Error when getAvailablePurchases to restore purchases: ', error);
    dispatch({ type: commitAction, payload: statusResult });
  }
};

const iapUpdatedListener = (dispatch, getState) => async (rawPurchase) => {
  const verifyResult = await verifyPurchase(rawPurchase);
  dispatch({
    type: REQUEST_PURCHASE_COMMIT,
    payload: { ...verifyResult, rawPurchase },
  });
};

const iapErrorListener = (dispatch, getState) => async (error) => {
  console.log('Error in iapErrorListener: ', error);
  if (error.code === 'E_USER_CANCELLED') {
    dispatch(updateIapPurchaseStatus(null, null));
  } else {
    dispatch({ type: REQUEST_PURCHASE_ROLLBACK });
  }
};

let iapUpdatedEventEmitter = null, iapErrorEventEmitter = null;
const registerIapListeners = (doRegister, dispatch, getState) => {
  if (doRegister) {
    if (!iapUpdatedEventEmitter) {
      iapUpdatedEventEmitter = RNIap.purchaseUpdatedListener(
        iapUpdatedListener(dispatch, getState)
      );
    }
    if (!iapErrorEventEmitter) {
      iapErrorEventEmitter = RNIap.purchaseErrorListener(
        iapErrorListener(dispatch, getState)
      );
    }
  } else {
    if (iapUpdatedEventEmitter) {
      iapUpdatedEventEmitter.remove();
      iapUpdatedEventEmitter = null;
    }
    if (iapErrorEventEmitter) {
      iapErrorEventEmitter.remove();
      iapErrorEventEmitter = null;
    }
  }
};

let didGetProducts = false;
export const endIapConnection = (isInit = false) => async (dispatch, getState) => {
  registerIapListeners(false, dispatch, getState);
  try {
    await RNIap.endConnection();
  } catch (e) {
    console.log('Error when end IAP connection: ', e);
  }

  if (!isInit) {
    didGetProducts = false;
    dispatch(updateIapProductStatus(null, null, null));
  }
};

export const initIapConnectionAndGetProducts = (doForce) => async (
  dispatch, getState
) => {
  if (didGetProducts && !doForce) return;
  didGetProducts = true;
  dispatch({ type: GET_PRODUCTS });

  if (doForce) await endIapConnection(true)(dispatch, getState);

  try {
    const canMakePayments = await RNIap.initConnection();
    registerIapListeners(true, dispatch, getState);

    let products = null;
    if (canMakePayments) {
      products = await RNIap.getSubscriptions([COM_BRACEDOTTO_SUPPORTER]);
    }

    dispatch({
      type: GET_PRODUCTS_COMMIT,
      payload: { canMakePayments, products },
    });
  } catch (e) {
    dispatch({ type: GET_PRODUCTS_ROLLBACK });
  }
};

export const requestPurchase = (product) => async (dispatch, getState) => {
  dispatch({ type: REQUEST_PURCHASE });
  try {
    await RNIap.requestSubscription(product.productId);
  } catch (error) {
    console.log('Error when request purchase: ', error);
    if (error.code === 'E_USER_CANCELLED') {
      dispatch(updateIapPurchaseStatus(null, null));
    } else {
      dispatch({ type: REQUEST_PURCHASE_ROLLBACK });
    }
  }
};

export const restorePurchases = () => async (dispatch, getState) => {
  await getPurchases(
    RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK,
    false, false
  )(dispatch, getState);
};

export const refreshPurchases = () => async (dispatch, getState) => {
  await getPurchases(
    REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
    true, false
  )(dispatch, getState);
};

export const checkPurchases = () => async (dispatch, getState) => {
  const { purchases, checkPurchasesDT } = getState().settings;

  const purchase = getValidPurchase(purchases);
  if (!purchase) return;

  const now = Date.now();
  const expiryDT = (new Date(purchase.expiryDate)).getTime();

  let doCheck = false;
  if (now >= expiryDT || !checkPurchasesDT) doCheck = true;
  else {
    let p = 1.0 / (N_DAYS * 24 * 60 * 60 * 1000) * Math.abs(now - checkPurchasesDT);
    p = Math.max(0.01, Math.min(p, 0.99));
    doCheck = p > Math.random();
  }
  if (!doCheck) return;

  await getPurchases(
    REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
    false, true
  )(dispatch, getState);
};

export const retryVerifyPurchase = () => async (dispatch, getState) => {
  dispatch({ type: REQUEST_PURCHASE });

  const rawPurchase = getState().iap.rawPurchase;
  const verifyResult = await verifyPurchase(rawPurchase);
  dispatch({
    type: REQUEST_PURCHASE_COMMIT,
    payload: { ...verifyResult, rawPurchase },
  });
};

export const updateIapPublicKey = () => async (dispatch, getState) => {
  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  dispatch({ type: UPDATE_IAP_PUBLIC_KEY, payload: sigObj.publicKey });
};

export const updateIapProductStatus = (status, canMakePayments, products) => {
  return {
    type: UPDATE_IAP_PRODUCT_STATUS,
    payload: { status, canMakePayments, products },
  };
};

export const updateIapPurchaseStatus = (status, rawPurchase) => {
  return {
    type: UPDATE_IAP_PURCHASE_STATUS,
    payload: { status, rawPurchase },
  };
};

export const updateIapRestoreStatus = (status) => {
  return {
    type: UPDATE_IAP_RESTORE_STATUS,
    payload: status,
  };
};

export const updateIapRefreshStatus = (status) => {
  return {
    type: UPDATE_IAP_REFRESH_STATUS,
    payload: status,
  };
};

export const pinLinks = (ids) => async (dispatch, getState) => {
  const state = getState();
  const purchases = getState().settings.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const pinFPaths = getPinFPaths(state);
  const pendingPins = state.pendingPins;

  let currentPins = getPins(pinFPaths, pendingPins, true);
  currentPins = Object.values(currentPins).map(pin => pin.rank).sort();

  let lexoRank;
  if (currentPins.length > 0) {
    const rank = currentPins[currentPins.length - 1];
    lexoRank = LexoRank.parse(`0|${rank.replace('_', ':')}`).genNext();
  } else {
    lexoRank = LexoRank.middle();
  }

  let now = Date.now();
  const pins = [];
  for (const id of ids) {
    const nextRank = lexoRank.toString().slice(2).replace(':', '_');
    pins.push({ rank: nextRank, addedDT: now, id });

    lexoRank = lexoRank.genNext();
    now += 1;
  }

  const payload = { pins };
  dispatch({
    type: PIN_LINK,
    payload,
    meta: {
      offline: {
        effect: { method: PIN_LINK, params: payload },
        commit: { type: PIN_LINK_COMMIT, meta: payload },
        rollback: { type: PIN_LINK_ROLLBACK, meta: payload },
      },
    },
  });
};

export const unpinLinks = (ids) => async (dispatch, getState) => {
  const state = getState();
  const pinFPaths = getPinFPaths(state);

  const pins = [];
  for (const id of ids) {
    const linkMainId = getMainId(id);

    // when move, old paths might not be delete, so when unpin,
    //   need to delete them all, can't use getPins and no break here.
    for (const fpath of pinFPaths) {
      const { rank, addedDT, id } = extractPinFPath(fpath);
      const pinMainId = getMainId(id);
      if (linkMainId === pinMainId) pins.push({ rank, addedDT, id });
    }
  }

  if (pins.length === 0) {
    // As for every move link to ARCHIVE and TRASH, will try to unpin the link too,
    //  if no pin to unpin, just return.
    console.log('In unpinLinks, no pin found for ids: ', ids);
    return;
  }

  const payload = { pins };
  dispatch({
    type: UNPIN_LINK,
    payload,
    meta: {
      offline: {
        effect: { method: UNPIN_LINK, params: payload },
        commit: { type: UNPIN_LINK_COMMIT, meta: payload },
        rollback: { type: UNPIN_LINK_ROLLBACK, meta: payload },
      },
    },
  });
};

export const movePinnedLink = (id, direction) => async (dispatch, getState) => {
  const state = getState();
  const links = state.links;
  const listName = state.display.listName;
  const doDescendingOrder = state.settings.doDescendingOrder;
  const pinFPaths = getPinFPaths(state);
  const pendingPins = state.pendingPins;

  const sortedLinks = getSortedLinks(links, listName, doDescendingOrder);
  if (!sortedLinks) {
    console.log(`No links found for link id: `, id);
    return;
  }

  let [pinnedValues] = separatePinnedValues(
    sortedLinks,
    pinFPaths,
    pendingPins,
    (link) => {
      return getMainId(link.id);
    }
  );

  const i = pinnedValues.findIndex(pinnedValue => pinnedValue.value.id === id);
  if (i < 0) {
    console.log('In movePinnedLink, no pin found for link id: ', id);
    return;
  }

  let nextRank;
  if (direction === SWAP_LEFT) {
    if (i === 0) return;
    if (i === 1) {
      const pRank = pinnedValues[i - 1].pin.rank;

      const lexoRank = LexoRank.parse(`0|${pRank.replace('_', ':')}`)

      nextRank = lexoRank.genPrev().toString();
    } else {
      const pRank = pinnedValues[i - 1].pin.rank;
      const ppRank = pinnedValues[i - 2].pin.rank;

      const pLexoRank = LexoRank.parse(`0|${pRank.replace('_', ':')}`)
      const ppLexoRank = LexoRank.parse(`0|${ppRank.replace('_', ':')}`)

      nextRank = ppLexoRank.between(pLexoRank).toString();
    }
  } else if (direction === SWAP_RIGHT) {
    if (i === pinnedValues.length - 1) return;
    if (i === pinnedValues.length - 2) {
      const nRank = pinnedValues[i + 1].pin.rank;

      const lexoRank = LexoRank.parse(`0|${nRank.replace('_', ':')}`)

      nextRank = lexoRank.genNext().toString();
    } else {
      const nRank = pinnedValues[i + 1].pin.rank;
      const nnRank = pinnedValues[i + 2].pin.rank;

      const nLexoRank = LexoRank.parse(`0|${nRank.replace('_', ':')}`)
      const nnLexoRank = LexoRank.parse(`0|${nnRank.replace('_', ':')}`)

      nextRank = nLexoRank.between(nnLexoRank).toString();
    }
  } else {
    throw new Error(`Invalid direction: ${direction}`);
  }
  nextRank = nextRank.slice(2).replace(':', '_');

  const { addedDT, rank: fromRank } = pinnedValues[i].pin;

  const payload = { rank: nextRank, addedDT, id, fromRank };
  dispatch({
    type: MOVE_PINNED_LINK_ADD_STEP,
    payload,
    meta: {
      offline: {
        effect: { method: PIN_LINK, params: { pins: [payload] } },
        commit: { type: MOVE_PINNED_LINK_ADD_STEP_COMMIT, meta: payload },
        rollback: { type: MOVE_PINNED_LINK_ADD_STEP_ROLLBACK, meta: payload },
      },
    },
  });
};

export const movePinnedLinkDeleteStep = (rank, addedDT, id) => async (
  dispatch, getState
) => {

  const payload = { rank, addedDT, id };

  dispatch({
    type: MOVE_PINNED_LINK_DELETE_STEP,
    meta: {
      offline: {
        effect: { method: UNPIN_LINK, params: { pins: [payload] } },
        commit: { type: MOVE_PINNED_LINK_DELETE_STEP_COMMIT },
        rollback: { type: MOVE_PINNED_LINK_DELETE_STEP_ROLLBACK },
      },
    },
  });
};

export const cancelDiedPins = () => {
  return { type: CANCEL_DIED_PINS };
};
