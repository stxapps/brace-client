// A first line mark for theDiff
import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import { saveAs } from 'file-saver';
import { LexoRank } from '@wewatch/lexorank';

import userSession from '../userSession';
import axios from '../axiosWrapper';
import dataApi from '../apis/blockstack';
import fileApi from '../apis/file';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_WINDOW_SIZE, UPDATE_VISUAL_SIZE,
  UPDATE_WINDOW, UPDATE_HISTORY_POSITION, UPDATE_STACKS_ACCESS, UPDATE_LIST_NAME,
  UPDATE_POPUP, UPDATE_SEARCH_STRING, UPDATE_LINK_EDITOR,
  UPDATE_STATUS, UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING,
  ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS, UPDATE_SELECTING_LINK_ID,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, CACHE_FETCHED, UPDATE_FETCHED,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK, CACHE_FETCHED_MORE,
  UPDATE_FETCHED_MORE, CANCEL_FETCHED_MORE, CLEAR_FETCHED_LIST_NAMES, REFRESH_FETCHED,
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
  UPDATE_DO_USE_LOCAL_LAYOUT, UPDATE_DEFAULT_LAYOUT_TYPE, UPDATE_LOCAL_LAYOUT_TYPE,
  UPDATE_DELETE_ACTION, UPDATE_LIST_NAMES_MODE, REQUEST_PURCHASE, RESTORE_PURCHASES,
  RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK, REFRESH_PURCHASES,
  REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK, UPDATE_IAP_PUBLIC_KEY,
  UPDATE_IAP_PRODUCT_STATUS, UPDATE_IAP_PURCHASE_STATUS, UPDATE_IAP_RESTORE_STATUS,
  UPDATE_IAP_REFRESH_STATUS, PIN_LINK, PIN_LINK_COMMIT, PIN_LINK_ROLLBACK, UNPIN_LINK,
  UNPIN_LINK_COMMIT, UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP,
  MOVE_PINNED_LINK_ADD_STEP_COMMIT, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
  CANCEL_DIED_PINS, UPDATE_SYSTEM_THEME_MODE, UPDATE_DO_USE_LOCAL_THEME,
  UPDATE_DEFAULT_THEME, UPDATE_LOCAL_THEME, UPDATE_UPDATING_THEME_MODE,
  UPDATE_TIME_PICK, UPDATE_IS_24H_FORMAT, UPDATE_CUSTOM_EDITOR, UPDATE_IMAGES,
  UPDATE_CUSTOM_DATA, UPDATE_CUSTOM_DATA_COMMIT, UPDATE_CUSTOM_DATA_ROLLBACK,
  REHYDRATE_STATIC_FILES, CLEAN_UP_STATIC_FILES, CLEAN_UP_STATIC_FILES_COMMIT,
  CLEAN_UP_STATIC_FILES_ROLLBACK, UPDATE_IMPORT_ALL_DATA_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  BACK_DECIDER, BACK_POPUP, ALL, HASH_BACK,
  SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  LIST_NAMES_POPUP, PIN_MENU_POPUP, CUSTOM_EDITOR_POPUP, PAYWALL_POPUP,
  CONFIRM_DELETE_POPUP, SETTINGS_POPUP, SETTINGS_LISTS_MENU_POPUP, TIME_PICK_POPUP, ID,
  STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK, MY_LIST, TRASH, ARCHIVE,
  N_LINKS, N_DAYS, CD_ROOT, LINKS, IMAGES, SETTINGS, PINS, DOT_JSON, BASE64, ADDED,
  DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING, DIED_UPDATING,
  BRACE_EXTRACT_URL, BRACE_PRE_EXTRACT_URL, EXTRACT_INIT, EXTRACT_EXCEEDING_N_URLS,
  IAP_STATUS_URL, COM_BRACEDOTTO, SIGNED_TEST_STRING, VALID, ACTIVE,
  SWAP_LEFT, SWAP_RIGHT, WHT_MODE, BLK_MODE, CUSTOM_MODE, FEATURE_PIN,
  FEATURE_APPEARANCE, FEATURE_CUSTOM,
} from '../types/const';
import {
  isEqual, isString, isObject, isNumber, throttle, sleep,
  randomString, rerandomRandomTerm, deleteRemovedDT, getMainId, getLinkMainIds,
  getUrlFirstChar, separateUrlAndParam, extractUrl, getUserImageUrl, randomDecor,
  isOfflineActionWithPayload, shouldDispatchFetch, getListNameObj, getAllListNames,
  doOutboxContainMethods, isDecorValid, isExtractedResultValid, isCustomValid,
  isListNameObjsValid, getLatestPurchase, getValidPurchase, doEnableExtraFeatures,
  createLinkFPath,
  getLinkFPaths, getStaticFPaths, extractPinFPath, getSortedLinks, getPinFPaths,
  getPins, separatePinnedValues, sortLinks, sortWithPins, getRawPins, getFormattedTime,
  get24HFormattedTime, extractFPath, getWindowSize,
} from '../utils';
import { _ } from '../utils/obj';
import {
  isUint8Array, isBlob, convertBlobToDataUrl, convertDataUrlToBlob,
} from '../utils/index-web';
import { initialSettingsState } from '../types/initialStates';
import vars from '../vars';

export const init = async (store) => {

  await handlePendingSignIn()(store.dispatch, store.getState);

  const isUserSignedIn = userSession.isUserSignedIn();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }

  const { windowWidth, windowHeight, visualWidth, visualHeight } = getWindowSize();

  const darkMatches = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const is24HFormat = null;

  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      username,
      userImage,
      href: window.location.href,
      windowWidth,
      windowHeight,
      visualWidth,
      visualHeight,
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
    },
  });

  popHistoryState(store);
  window.addEventListener('popstate', function () {
    popHistoryState(store);
  });

  window.addEventListener('resize', throttle(() => {
    store.dispatch({
      type: UPDATE_WINDOW_SIZE,
      payload: {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      },
    });
  }, 16));
  if (isObject(window.visualViewport)) {
    window.visualViewport.addEventListener('resize', throttle(() => {
      store.dispatch({
        type: UPDATE_VISUAL_SIZE,
        payload: {
          visualWidth: window.visualViewport.width,
          visualHeight: window.visualViewport.height,
        },
      });
    }, 16));
  }

  window.addEventListener('beforeunload', (e) => {
    const isUserSignedIn = userSession.isUserSignedIn();
    if (isUserSignedIn) {
      const { busy, online, outbox, retryScheduled } = store.getState().offline;
      if ((busy || (online && outbox.length > 0)) && !retryScheduled) {
        if (doOutboxContainMethods(outbox, [
          ADD_LINKS, DELETE_LINKS, UPDATE_SETTINGS, PIN_LINK, UNPIN_LINK,
        ])) {
          e.preventDefault();
          return e.returnValue = 'It looks like your changes is being saved to the server. Do you want to leave immediately and save your changes later?';
        }
      }

      const settings = store.getState().settings;
      const snapshotSettings = store.getState().snapshot.settings;
      if (!isEqual(settings, snapshotSettings)) {
        e.preventDefault();
        return e.returnValue = 'It looks like your changes to the settings hasn\'t been saved. Do you want to leave immediately and discard your changes?';
      }
    }
  }, { capture: true });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const systemThemeMode = e.matches ? BLK_MODE : WHT_MODE;
    store.dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
  });
};

const handlePendingSignIn = () => async (dispatch, getState) => {

  const { pathname } = extractUrl(window.location.href);
  if (!(pathname === '/' && userSession.isSignInPending())) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true,
  });

  try {
    await userSession.handlePendingSignIn();
  } catch (error) {
    console.log('Catched an error thrown by handlePendingSignIn', error);
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
  }

  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    dispatch({
      type: UPDATE_USER,
      payload: {
        isUserSignedIn: true,
        username: userData.username,
        image: getUserImageUrl(userData),
      },
    });
  }

  const { separatedUrl } = separateUrlAndParam(window.location.href, 'authResponse');
  window.history.replaceState(window.history.state, '', separatedUrl);

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false,
  });
};

const getPopupShownId = (state) => {

  // No SettingsErrorPopup and PinErrorPopup in displayReducer
  //   so no AccessErrorPopup here too.
  //if (state.display.isAccessErrorPopupShown) return ACCESS_ERROR_POPUP;
  if (state.display.isTimePickPopupShown) return TIME_PICK_POPUP;
  if (state.display.isConfirmDeletePopupShown) return CONFIRM_DELETE_POPUP;
  if (state.display.isPaywallPopupShown) return PAYWALL_POPUP;
  if (state.display.isCustomEditorPopupShown) return CUSTOM_EDITOR_POPUP;
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

const updatePopupAsBackPressed = (dispatch, getState) => {

  // Close other popups before search,
  //   this depends on getPopupShownId to return other ids before search id
  let id = getPopupShownId(getState());
  if (!id) {
    console.log('updatePopupAsBackPressed is called while no popup is shown.');
    id = ALL;
  }

  if (id === ADD_POPUP) {
    if (window.document.activeElement instanceof HTMLInputElement) {
      window.document.activeElement.blur();
    }
  }
  if (id === SEARCH_POPUP) {
    // Clear search string
    //   and need to defocus too to prevent keyboard appears on mobile
    dispatch(updateSearchString(''));

    if (window.document.activeElement instanceof HTMLInputElement) {
      window.document.activeElement.blur();
    }
  }

  dispatch(updatePopup(id, false));
};

export const popHistoryState = (store) => {

  let historyPosition = window.history.state;
  if (historyPosition === BACK_DECIDER &&
    store.getState().window.historyPosition === BACK_POPUP) {

    // if back button pressed and there is a popup shown
    if (isPopupShown(store.getState())) {
      // disable back button by forcing to go forward in history states
      // No need to update state here as window.history.go triggers popstate event
      updatePopupAsBackPressed(store.dispatch, store.getState);

      window.history.go(1);
      return
    }

    // if back button pressed and is bulk editing
    if (store.getState().display.isBulkEditing) {

      store.dispatch(updateBulkEdit(false));

      window.history.go(1);
      return
    }

    // No popup shown and no bulk editing, go back one more
    // need to update state first before going off so that when back know that back from somewhere else
    store.dispatch({
      type: UPDATE_WINDOW,
      payload: {
        href: window.location.href,
        historyPosition: null,
      },
    });

    // https://stackoverflow.com/questions/3588315/how-to-check-if-the-user-can-go-back-in-browser-history-or-not
    const href = window.location.href;
    window.history.go(-1);
    setTimeout(function () {
      // if location was not changed, then there is no history back
      if (href === window.location.href) {
        window.history.replaceState(null, '', HASH_BACK);
        window.history.pushState(null, '', href);
        window.history.go(-1);
      }
    }, 500);
    return;
  }

  if (historyPosition === BACK_DECIDER) {
    // A page forwards to BACK_DECIDER, forward one more to BACK_POPUP
    // No need to update state here as window.history.go triggers popstate event
    window.history.go(1);
    return;
  }

  store.dispatch({
    type: UPDATE_WINDOW,
    payload: {
      href: window.location.href,
      historyPosition: historyPosition,
    },
  });
};

export const updateHistoryPosition = historyPosition => {
  return {
    type: UPDATE_HISTORY_POSITION,
    payload: historyPosition,
  };
};

export const signOut = () => async (dispatch, getState) => {

  userSession.signUserOut();

  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  // clear file storage
  await fileApi.deleteAllFiles();

  // clear cached fpaths
  vars.cachedFPaths.fpaths = null;

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};

export const updateUserData = (data) => async (dispatch, getState) => {
  userSession.updateUserData(data);

  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
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
};

export const tryUpdateFetched = (payload, meta) => async (dispatch, getState) => {

  const { listName, doDescendingOrder, links } = payload;

  if (listName !== getState().display.listName) {
    dispatch(updateFetched(payload, meta));
    return;
  }

  if (listName in getState().refreshFetched) {
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
        link.id !== _link.id ||
        !isEqual(link.extractedResult, _link.extractedResult) ||
        !isEqual(link.custom, _link.custom)
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
    const pageYOffset = vars.scrollPanel.pageYOffset;
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
    const scrollHeight = vars.scrollPanel.contentHeight;
    const windowHeight = vars.scrollPanel.layoutHeight;
    const windowBottom = windowHeight + vars.scrollPanel.pageYOffset;

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

export const refreshFetched = () => async (dispatch, getState) => {
  const listName = getState().display.listName;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const payload = {
    listName, doDescendingOrder, doFetchSettings: true, shouldDispatchFetch: true,
  };

  // If there is already FETCH with the same list name, no need to dispatch a new one.
  if (!shouldDispatchFetch(getState().offline.outbox, payload)) {
    payload.shouldDispatchFetch = false;
  }

  dispatch({ type: REFRESH_FETCHED, payload });
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
    axios.post(BRACE_PRE_EXTRACT_URL, { urls: [url] })
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
    [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK]
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

export const deleteLinks = (ids, doDeleteStaticFiles = false) => async (
  dispatch, getState
) => {
  // Require doDeleteStaticFiles
  //   as maybe moving and calling this method for the delete step
  //   or retry died removing which can't delete static files.
  const listName = getState().display.listName;
  const payload = { listName, ids, doDeleteStaticFiles };

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
    // DIED_UPDAING -> try update this link again
    const link = getState().links[listName][id];

    const { status } = link;
    if (status === DIED_ADDING) {
      const _link = {};
      for (const attr in link) {
        if ([
          STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK,
        ].includes(attr)) continue;
        _link[attr] = link[attr];
      }
      const links = [_link];
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

    } else if (status === DIED_REMOVING) {
      dispatch(deleteLinks([id]));
    } else if (status === DIED_DELETING) {
      dispatch(deleteLinks([id], true));
    } else if (status === DIED_UPDATING) {
      const toLink = {};
      for (const attr in link) {
        if ([
          STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK,
        ].includes(attr)) continue;
        toLink[attr] = link[attr];
      }
      const payload = { listName, fromLink: link.fromLink, toLink };

      dispatch({
        type: UPDATE_CUSTOM_DATA,
        payload,
        meta: {
          offline: {
            effect: { method: UPDATE_CUSTOM_DATA, params: payload },
            commit: { type: UPDATE_CUSTOM_DATA_COMMIT },
            rollback: { type: UPDATE_CUSTOM_DATA_ROLLBACK, meta: payload },
          },
        },
      });
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

    let _links = _.ignore(
      obj, [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK]
    );
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
      [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK]
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
    res = await axios.post(BRACE_EXTRACT_URL, { urls: links.map(link => link.url) });
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
  const pageYOffset = vars.scrollPanel.pageYOffset;
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
    if (!didSidebarAnimEnd) {
      const { updateSettingsViewIdCount } = getState().display;
      payload.updateSettingsViewIdCount = updateSettingsViewIdCount + 1;
    }
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

export const updateDoUseLocalLayout = (doUse) => {
  return { type: UPDATE_DO_USE_LOCAL_LAYOUT, payload: doUse };
};

export const updateLayoutType = (layoutType) => async (dispatch, getState) => {
  const state = getState();
  const doUseLocalLayout = state.localSettings.doUseLocalLayout;

  const type = doUseLocalLayout ? UPDATE_LOCAL_LAYOUT_TYPE : UPDATE_DEFAULT_LAYOUT_TYPE;
  dispatch({ type, payload: layoutType });
};

export const updateDeleteAction = (deleteAction) => {
  return {
    type: UPDATE_DELETE_ACTION,
    payload: deleteAction,
  };
};

export const updateListNamesMode = (mode, animType) => {
  return {
    type: UPDATE_LIST_NAMES_MODE,
    payload: { listNamesMode: mode, listNamesAnimType: animType },
  };
};

const importAllDataLoop = async (dispatch, fpaths, contents) => {
  let total = fpaths.length, doneCount = 0;
  dispatch(updateImportAllDataProgress({ total, done: doneCount }));

  try {
    for (let i = 0; i < fpaths.length; i += N_LINKS) {
      const selectedFPaths = fpaths.slice(i, i + N_LINKS);
      const selectedContents = contents.slice(i, i + N_LINKS);
      await dataApi.batchPutFileWithRetry(selectedFPaths, selectedContents, 0);

      doneCount += selectedFPaths.length;
      dispatch(updateImportAllDataProgress({ total, done: doneCount }));

      await sleep(1000); // Make it slow to not overwhelm the server
    }
  } catch (error) {
    dispatch(updateImportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));

    if (doneCount < total) {
      let msg = 'There is an error while importing! Below are contents that have not been imported:\n';
      for (let i = doneCount; i < fpaths.length; i++) {
        const fpath = fpaths[i];
        const [fname] = fpath.split('/').slice(-1);
        if (fpath.startsWith(LINKS)) {
          msg += '    • ' + contents[i].url + '\n';
        }
        if (fpath.startsWith(IMAGES)) {
          msg += '    • Image of ' + fname + '\n';
        }
        if (fpath.startsWith(PINS)) {
          msg += '    • Pin on ' + fname + '\n';
        }
        if (fpath.startsWith(SETTINGS)) {
          msg += '    • Settings\n';
        }
      }
      window.alert(msg);
    }
  }
};

const parseImportedFile = async (dispatch, text) => {

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
          !(
            obj.path.startsWith(LINKS) ||
            obj.path.startsWith(IMAGES) ||
            obj.path.startsWith(PINS) ||
            obj.path.startsWith(SETTINGS)
          )
        ) continue;

        if (!obj.data) continue;
        if (obj.path.startsWith(IMAGES)) {
          if (!isString(obj.data)) continue;
        } else {
          if (!isObject(obj.data)) continue;
        }

        if (obj.path.startsWith(LINKS)) {
          if (
            !('id' in obj.data && 'url' in obj.data && 'addedDT' in obj.data)
          ) continue;

          if (!(isString(obj.data.id) && isString(obj.data.url))) continue;
          if (!isNumber(obj.data.addedDT)) continue;

          const arr = obj.path.split('/');
          if (arr.length !== 3) continue;
          if (arr[0] !== LINKS) continue;

          const listName = arr[1], fname = arr[2];
          if (!fname.endsWith(DOT_JSON)) continue;

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
              obj.data = { ...obj.data };
              delete obj.data.extractedResult;
            }
          }

          if ('custom' in obj.data) {
            if (!isCustomValid(obj.data)) {
              obj.data = { ...obj.data };
              delete obj.data.custom;
            }
          }
        }

        if (obj.path.startsWith(IMAGES)) {
          const arr = obj.path.split('/');
          if (arr.length !== 2) continue;

          if (!obj.data.startsWith('data:')) continue;

          const i = obj.data.indexOf(',');
          if (i === -1) continue;
          if (!obj.data.slice(0, i).includes(BASE64)) continue;

          obj.data = await convertDataUrlToBlob(obj.data);
        }

        if (obj.path.startsWith(PINS)) {
          const arr = obj.path.split('/');
          if (arr.length !== 5) continue;
          if (arr[0] !== PINS) continue;

          const updatedDT = arr[2], addedDT = arr[3], fname = arr[4];
          if (!(/^\d+$/.test(updatedDT))) continue;
          if (!(/^\d+$/.test(addedDT))) continue;
          if (!fname.endsWith(DOT_JSON)) continue;

          const id = fname.slice(0, -5);
          const tokens = id.split('-');
          if (tokens.length !== 3) continue;
          if (!(/^\d+$/.test(tokens[0]))) continue;
        }

        if (obj.path.startsWith(SETTINGS)) {
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
  } catch (error) {
    console.log('parseImportedFile: JSON.parse error: ', error);

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

const exportAllDataLoop = async (dispatch, fpaths, doneCount) => {

  if (fpaths.length === 0) throw new Error(`Invalid fpaths: ${fpaths}`);

  const selectedCount = Math.min(fpaths.length - doneCount, N_LINKS);
  const selectedFPaths = fpaths.slice(doneCount, doneCount + selectedCount);
  const responses = await dataApi.batchGetFileWithRetry(selectedFPaths, 0, true);
  const data = responses.filter(r => r.success).map((response) => {
    return { path: response.fpath, data: response.content };
  });

  doneCount = doneCount + selectedCount;
  if (doneCount > fpaths.length) {
    throw new Error(`Invalid doneCount: ${doneCount}, total: ${fpaths.length}`);
  }

  dispatch(updateExportAllDataProgress({
    total: fpaths.length,
    done: doneCount,
  }));

  if (doneCount < fpaths.length) {
    const remainingData = await exportAllDataLoop(dispatch, fpaths, doneCount);
    data.push(...remainingData);
  }

  return data;
};

export const exportAllData = () => async (dispatch, getState) => {

  dispatch(updateExportAllDataProgress({
    total: 'calculating...',
    done: 0,
  }));

  const fpaths = [];
  try {
    await userSession.listFiles((fpath) => {
      fpaths.push(fpath);
      return true;
    });
  } catch (error) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }

  dispatch(updateExportAllDataProgress({
    total: fpaths.length,
    done: 0,
  }));

  if (fpaths.length === 0) return;

  try {
    const data = await exportAllDataLoop(dispatch, fpaths, 0);

    for (const item of data) {
      if (isUint8Array(item.data)) item.data = new Blob([item.data]);
      if (isBlob(item.data)) {
        item.data = await convertBlobToDataUrl(item.data);
      }
    }

    var blob = new Blob([JSON.stringify(data)], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'brace-data.txt');
  } catch (error) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
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

const deleteAllDataLoop = async (dispatch, fpaths, doneCount) => {

  if (fpaths.length === 0) throw new Error(`Invalid fpaths: ${fpaths}`);

  const selectedCount = Math.min(fpaths.length - doneCount, N_LINKS);
  const selectedFPaths = fpaths.slice(doneCount, doneCount + selectedCount);
  const responses = await dataApi.batchDeleteFileWithRetry(selectedFPaths, 0);

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
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
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
    await fileApi.deleteAllFiles();

    dispatch({
      type: DELETE_ALL_DATA,
    });
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
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

const getIapStatus = async (doForce) => {
  const sigObj = userSession.signECDSA(SIGNED_TEST_STRING);
  const reqBody = {
    userId: sigObj.publicKey,
    signature: sigObj.signature,
    appId: COM_BRACEDOTTO,
    doForce: doForce,
  };

  const res = await axios.post(IAP_STATUS_URL, reqBody);
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

  dispatch({ type: commitAction, payload: statusResult });
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

export const updateIapPublicKey = () => async (dispatch, getState) => {
  const sigObj = userSession.signECDSA(SIGNED_TEST_STRING);
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
  const purchases = state.settings.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    vars.paywallFeature.feature = FEATURE_PIN;
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const pinFPaths = getPinFPaths(state);
  const pendingPins = state.pendingPins;

  const currentPins = getPins(pinFPaths, pendingPins, true);
  const currentRanks = Object.values(currentPins).map(pin => pin.rank).sort();

  let lexoRank;
  if (currentRanks.length > 0) {
    const rank = currentRanks[currentRanks.length - 1];
    lexoRank = LexoRank.parse(`0|${rank.replace('_', ':')}`).genNext();
  } else {
    lexoRank = LexoRank.middle();
  }

  let now = Date.now();
  const pins = [];
  for (const id of ids) {
    const nextRank = lexoRank.toString().slice(2).replace(':', '_');
    pins.push({ rank: nextRank, updatedDT: now, addedDT: now, id });

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

  const linkMainIds = ids.map(id => getMainId(id));

  // when move, old paths might not be deleted, so when unpin,
  //   need to delete them all, can't use getPins and no break here.
  const pins = [];
  for (const fpath of pinFPaths) {
    const { rank, updatedDT, addedDT, id } = extractPinFPath(fpath);
    const pinMainId = getMainId(id);
    if (linkMainIds.includes(pinMainId)) pins.push({ rank, updatedDT, addedDT, id });
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
    console.log('No links found for link id: ', id);
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

      const lexoRank = LexoRank.parse(`0|${pRank.replace('_', ':')}`);

      nextRank = lexoRank.genPrev().toString();
    } else {
      const pRank = pinnedValues[i - 1].pin.rank;
      const ppRank = pinnedValues[i - 2].pin.rank;

      const pLexoRank = LexoRank.parse(`0|${pRank.replace('_', ':')}`);
      const ppLexoRank = LexoRank.parse(`0|${ppRank.replace('_', ':')}`);

      nextRank = ppLexoRank.between(pLexoRank).toString();
    }
  } else if (direction === SWAP_RIGHT) {
    if (i === pinnedValues.length - 1) return;
    if (i === pinnedValues.length - 2) {
      const nRank = pinnedValues[i + 1].pin.rank;

      const lexoRank = LexoRank.parse(`0|${nRank.replace('_', ':')}`);

      nextRank = lexoRank.genNext().toString();
    } else {
      const nRank = pinnedValues[i + 1].pin.rank;
      const nnRank = pinnedValues[i + 2].pin.rank;

      const nLexoRank = LexoRank.parse(`0|${nRank.replace('_', ':')}`);
      const nnLexoRank = LexoRank.parse(`0|${nnRank.replace('_', ':')}`);

      nextRank = nLexoRank.between(nnLexoRank).toString();
    }
  } else {
    throw new Error(`Invalid direction: ${direction}`);
  }
  nextRank = nextRank.slice(2).replace(':', '_');

  const now = Date.now();
  const { addedDT } = pinnedValues[i].pin;

  const payload = { rank: nextRank, updatedDT: now, addedDT, id };
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

export const cancelDiedPins = () => {
  return { type: CANCEL_DIED_PINS };
};

export const cleanUpPins = () => async (dispatch, getState) => {
  const state = getState();
  const linkFPaths = getLinkFPaths(state);
  const pinFPaths = getPinFPaths(state);

  const linkMainIds = getLinkMainIds(linkFPaths);
  const pins = getRawPins(pinFPaths);

  const unusedPins = [];
  for (const fpath of pinFPaths) {
    const { rank, updatedDT, addedDT, id } = extractPinFPath(fpath);
    const pinMainId = getMainId(id);

    if (
      !isString(pinMainId) ||
      !linkMainIds.includes(pinMainId) ||
      !isObject(pins[pinMainId]) ||
      (
        rank !== pins[pinMainId].rank ||
        updatedDT !== pins[pinMainId].updatedDT ||
        addedDT !== pins[pinMainId].addedDT ||
        id !== pins[pinMainId].id
      )
    ) {
      unusedPins.push({ rank, updatedDT, addedDT, id });
    }
  }

  // Don't need offline, if no network or get killed, can do it later.
  try {
    dataApi.deletePins({ pins: unusedPins });
  } catch (error) {
    console.log('cleanUpPins error: ', error);
    // error in this step should be fine
  }
};

export const updateDoUseLocalTheme = (doUse) => {
  return { type: UPDATE_DO_USE_LOCAL_THEME, payload: doUse };
};

export const updateTheme = (mode, customOptions) => async (dispatch, getState) => {
  const state = getState();
  const purchases = state.settings.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    vars.paywallFeature.feature = FEATURE_APPEARANCE;
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const doUseLocalTheme = state.localSettings.doUseLocalTheme;
  const type = doUseLocalTheme ? UPDATE_LOCAL_THEME : UPDATE_DEFAULT_THEME;
  dispatch({ type, payload: { mode, customOptions } });
};

export const updateUpdatingThemeMode = (updatingThemeMode) => async (
  dispatch, getState
) => {
  const state = getState();
  const doUseLocalTheme = state.localSettings.doUseLocalTheme;
  const customOptions = doUseLocalTheme ?
    state.localSettings.themeCustomOptions : state.settings.themeCustomOptions;
  const is24HFormat = state.window.is24HFormat;

  let option;
  for (const opt of customOptions) {
    if (opt.mode === updatingThemeMode) {
      option = opt;
      break;
    }
  }
  if (!option) return;

  const { hour, minute, period } = getFormattedTime(option.startTime, is24HFormat);
  dispatch({
    type: UPDATE_UPDATING_THEME_MODE,
    payload: { updatingThemeMode, hour, minute, period },
  });
};

export const updateTimePick = (hour, minute, period) => {
  const timeObj = {};
  if (isString(hour) && hour.length > 0) timeObj.hour = hour;
  if (isString(minute) && minute.length > 0) timeObj.minute = minute;
  if (['AM', 'PM'].includes(period)) timeObj.period = period;

  return { type: UPDATE_TIME_PICK, payload: timeObj };
};

export const updateThemeCustomOptions = () => async (dispatch, getState) => {
  const state = getState();
  const doUseLocalTheme = state.localSettings.doUseLocalTheme;
  const customOptions = doUseLocalTheme ?
    state.localSettings.themeCustomOptions : state.settings.themeCustomOptions;

  const { updatingThemeMode, hour, minute, period } = state.timePick;

  const _themeMode = CUSTOM_MODE, _customOptions = [];

  let updatingOption;
  for (const opt of customOptions) {
    if (opt.mode === updatingThemeMode) updatingOption = opt;
    else _customOptions.push({ ...opt });
  }
  if (!updatingOption) return;

  const newStartTime = get24HFormattedTime(hour, minute, period);
  _customOptions.push({ ...updatingOption, startTime: newStartTime });

  dispatch(updateTheme(_themeMode, _customOptions));
};

export const updateIs24HFormat = (is24HFormat) => {
  return { type: UPDATE_IS_24H_FORMAT, payload: is24HFormat };
};

export const updateCustomEditorPopup = (isShown, id) => async (dispatch, getState) => {
  if (isShown) {
    const state = getState();
    const purchases = state.settings.purchases;

    if (!doEnableExtraFeatures(purchases)) {
      vars.paywallFeature.feature = FEATURE_CUSTOM;
      dispatch(updatePopup(PAYWALL_POPUP, true));
      return;
    }

    dispatch(updateSelectingLinkId(id));
  }

  dispatch(updatePopup(CUSTOM_EDITOR_POPUP, isShown));
};

export const updateCustomEditor = (
  title, image, rotate, translateX, translateY, zoom, doClearImage, msg,
) => {
  const payload = {};
  if (isString(title)) {
    payload.title = title;
    payload.didTitleEdit = true;
  }

  // image can be null, need to be able to clear the image.
  if (isObject(image)) {
    payload.image = image;
    payload.imageUrl = null;
    payload.didImageEdit = true;
  }
  if (doClearImage) {
    payload.image = null;
    payload.imageUrl = null;
    payload.didImageEdit = true;
  }

  if (isNumber(rotate)) {
    payload.rotate = rotate;
    payload.didImageEdit = true;
  }
  if (isNumber(translateX)) {
    payload.translateX = translateX;
    payload.didImageEdit = true;
  }
  if (isNumber(translateY)) {
    payload.translateY = translateY;
    payload.didImageEdit = true;
  }
  if (isNumber(zoom)) {
    payload.zoom = zoom;
    payload.didImageEdit = true;
  }

  if (isString(msg)) payload.msg = msg;
  else payload.msg = '';

  return { type: UPDATE_CUSTOM_EDITOR, payload };
};

export const updateImages = (name, content) => {
  return { type: UPDATE_IMAGES, payload: { [name]: content } };
};

export const updateCustomData = (title, image) => async (
  dispatch, getState
) => {
  const state = getState();
  const links = state.links;
  const listName = state.display.listName;
  const selectingLinkId = state.display.selectingLinkId;

  if (!isObject(links[listName]) || !isObject(links[listName][selectingLinkId])) {
    console.log('UpdateCustomData: No link found with selectingLinkId: ', selectingLinkId);
    return;
  }

  const _links = _.ignore(
    _.select(links[listName], ID, [selectingLinkId]),
    [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK]
  );
  const link = _links[selectingLinkId];

  const toLink = {};
  for (const attr in link) {
    if (attr === 'custom') continue;
    toLink[attr] = link[attr];
  }

  if (isString(title) && title.length > 0) {
    if (!('custom' in toLink)) toLink.custom = {};
    toLink.custom.title = title;
  }
  if (isString(image) && image.length > 0) {
    if (!('custom' in toLink)) toLink.custom = {};
    toLink.custom.image = image;
  }

  if (isEqual(link, toLink)) return;

  const payload = { listName: listName, fromLink: link, toLink };
  dispatch({
    type: UPDATE_CUSTOM_DATA,
    payload,
    meta: {
      offline: {
        effect: { method: UPDATE_CUSTOM_DATA, params: payload },
        commit: { type: UPDATE_CUSTOM_DATA_COMMIT },
        rollback: { type: UPDATE_CUSTOM_DATA_ROLLBACK, meta: payload },
      },
    },
  });
};

export const rehydrateStaticFiles = () => async (dispatch, getState) => {
  const state = getState();
  const listName = state.display.listName;
  const links = state.links;

  let fpaths = [];
  for (const id in links[listName]) {
    const link = links[listName][id];
    if (isObject(link.custom)) {
      const { image } = link.custom;
      if (isString(image) && image.startsWith(CD_ROOT + '/')) {
        if (!fpaths.includes(image)) fpaths.push(image);
      }
    }
  }

  const files = await fileApi.getFiles(fpaths);

  const images = {};
  for (let i = 0; i < files.fpaths.length; i++) {
    images[files.fpaths[i]] = files.contentUrls[i];
  }

  dispatch({
    type: REHYDRATE_STATIC_FILES, payload: { listName, images },
  });
};

const _cleanUpStaticFiles = async (linkFPaths, staticFPaths) => {
  // Delete unused static files in server
  const mainIds = getLinkMainIds(linkFPaths);

  let unusedIds = [], unusedFPaths = [];
  for (const fpath of staticFPaths) {
    const { id } = extractFPath(fpath);
    if (!mainIds.includes(getMainId(id))) {
      unusedIds.push(id);
      unusedFPaths.push(fpath);
    }
  }
  unusedFPaths = unusedFPaths.slice(0, N_LINKS);

  await dataApi.batchDeleteFileWithRetry(unusedFPaths, 0);
  await fileApi.deleteFiles(unusedFPaths);

  // Delete unused static files in local
  let localFPaths = await fileApi.listKeys();

  unusedFPaths = [];
  for (const fpath of localFPaths) {
    const { id } = extractFPath(fpath);
    if (!mainIds.includes(getMainId(id))) {
      unusedIds.push(id);
      unusedFPaths.push(fpath);
    }
  }

  await fileApi.deleteFiles(unusedFPaths);

  // If too many static files locally, delete some of them.
  // If 1 image is around 500 KB, with 500 MB limitation, we can store 1000 images,
  //   so might not need to do this.

  return unusedIds;
};

export const cleanUpStaticFiles = () => async (dispatch, getState) => {
  const state = getState();

  const { cleanUpStaticFilesDT } = state.localSettings;
  if (!cleanUpStaticFilesDT) return;

  const linkFPaths = getLinkFPaths(state);
  const staticFPaths = getStaticFPaths(state);

  const now = Date.now();
  let p = 1.0 / (N_DAYS * 24 * 60 * 60 * 1000) * Math.abs(now - cleanUpStaticFilesDT);
  p = Math.max(0.01, Math.min(p, 0.99));
  const doCheck = p > Math.random();

  if (!doCheck) return;

  // Don't need offline, if no network or get killed, can do it later.
  dispatch({ type: CLEAN_UP_STATIC_FILES });
  try {
    const ids = await _cleanUpStaticFiles(linkFPaths, staticFPaths);
    dispatch({ type: CLEAN_UP_STATIC_FILES_COMMIT, payload: { ids } });
  } catch (error) {
    console.log('Error when clean up static files: ', error);
    dispatch({ type: CLEAN_UP_STATIC_FILES_ROLLBACK });
  }
};
