// A first line mark for theDiff
import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import Url from 'url-parse';

import userSession from '../userSession';
import cacheApi from '../apis/localCache';
import fileApi from '../apis/localFile';
import lsgApi from '../apis/localSg';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_WINDOW_SIZE, UPDATE_VISUAL_SIZE, UPDATE_WINDOW,
  UPDATE_HISTORY_POSITION, UPDATE_STACKS_ACCESS, UPDATE_SEARCH_STRING, UPDATE_POPUP,
  UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING, ADD_LINKS, DELETE_LINKS,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_DELETE_STEP, TRY_UPDATE_SETTINGS, MERGE_SETTINGS,
  PIN_LINK, UNPIN_LINK, MOVE_PINNED_LINK_ADD_STEP, UPDATE_SYSTEM_THEME_MODE,
  UPDATE_CUSTOM_DATA, UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_T_STEP, RESET_STATE,
} from '../types/actionTypes';
import {
  BACK_DECIDER, BACK_POPUP, ALL, HASH_BACK, SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP,
  SEARCH_POPUP, PROFILE_POPUP, CARD_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP,
  BULK_EDIT_MENU_POPUP, CUSTOM_EDITOR_POPUP, TAG_EDITOR_POPUP, PAYWALL_POPUP,
  CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP, SETTINGS_POPUP,
  SETTINGS_LISTS_MENU_POPUP, SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP,
  LOCK_EDITOR_POPUP, SWWU_POPUP, WHT_MODE, BLK_MODE, PADDLE_RANDOM_ID,
} from '../types/const';
import {
  isEqual, isObject, throttle, separateUrlAndParam, extractUrl, getUserUsername,
  getUserImageUrl, getWindowSize, getEditingListNameEditors, getEditingTagNameEditors,
} from '../utils';
import vars from '../vars';

export const init = async (store) => {

  await handlePendingSignIn()(store.dispatch, store.getState);

  const isUserSignedIn = userSession.isUserSignedIn();
  let username = null, userImage = null, userHubUrl = null;
  if (isUserSignedIn) {
    const userData = userSession.loadUserData();
    username = getUserUsername(userData);
    userImage = getUserImageUrl(userData);
    userHubUrl = userData.hubUrl;
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
      userHubUrl,
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
    if (!isUserSignedIn) return;

    const { busy, online, outbox, retryScheduled } = store.getState().offline;
    if ((busy || (online && outbox.length > 0)) && !retryScheduled) {
      const found = outbox.some(action => {
        if (!isObject(action)) return false;
        return [
          ADD_LINKS, MOVE_LINKS_ADD_STEP, MOVE_LINKS_DELETE_STEP, DELETE_LINKS,
          UPDATE_CUSTOM_DATA, TRY_UPDATE_SETTINGS, MERGE_SETTINGS, PIN_LINK,
          UNPIN_LINK, MOVE_PINNED_LINK_ADD_STEP, UPDATE_TAG_DATA_S_STEP,
          UPDATE_TAG_DATA_T_STEP,
        ].includes(action.type);
      });
      if (found) {
        e.preventDefault();
        return e.returnValue = 'It looks like your changes are being saved to the server. Do you want to leave immediately and save your changes later?';
      }
    }

    if (!store.getState().display.isSettingsPopupShown) return;

    const settings = store.getState().settings;
    const snapshotSettings = store.getState().snapshot.settings;
    if (!isEqual(settings, snapshotSettings)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the settings haven\'t been saved. Do you want to leave immediately and discard your changes?';
    }

    const listNameEditors = store.getState().listNameEditors;
    const listNameMap = store.getState().settings.listNameMap;
    const editingLNEs = getEditingListNameEditors(listNameEditors, listNameMap);
    if (isObject(editingLNEs)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the list names haven\'t been saved. Do you want to leave this site and discard your changes?';
    }

    const tagNameEditors = store.getState().tagNameEditors;
    const tagNameMap = store.getState().settings.tagNameMap;
    const editingTNEs = getEditingTagNameEditors(tagNameEditors, tagNameMap);
    if (isObject(editingTNEs)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the tag names haven\'t been saved. Do you want to leave this site and discard your changes?';
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

  const { separatedUrl } = separateUrlAndParam(window.location.href, 'authResponse');
  window.history.replaceState(window.history.state, '', separatedUrl);

  const isUserSignedIn = userSession.isUserSignedIn();
  if (isUserSignedIn) await resetState(dispatch);

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false,
  });
};

const getPopupShownId = (state) => {
  // No need these popups here:
  //   SettingsErrorPopup, PinErrorPopup, TagErrorPopup, AccessErrorPopup,
  //   and SWWUPopup.
  if (state.display.isLockEditorPopupShown) return LOCK_EDITOR_POPUP;
  if (state.display.isTimePickPopupShown) return TIME_PICK_POPUP;
  if (state.display.isConfirmDeletePopupShown) return CONFIRM_DELETE_POPUP;
  if (state.display.isConfirmDiscardPopupShown) return CONFIRM_DISCARD_POPUP;
  if (state.display.isPaywallPopupShown) return PAYWALL_POPUP;
  if (state.display.isTagEditorPopupShown) return TAG_EDITOR_POPUP;
  if (state.display.isCustomEditorPopupShown) return CUSTOM_EDITOR_POPUP;
  if (state.display.isBulkEditMenuPopupShown) return BULK_EDIT_MENU_POPUP;
  if (state.display.isPinMenuPopupShown) return PIN_MENU_POPUP;
  if (state.display.isListNamesPopupShown) return LIST_NAMES_POPUP;
  if (state.display.isCardItemMenuPopupShown) return CARD_ITEM_MENU_POPUP;
  if (state.display.isSettingsListsMenuPopupShown) return SETTINGS_LISTS_MENU_POPUP;
  if (state.display.isSettingsTagsMenuPopupShown) return SETTINGS_TAGS_MENU_POPUP;
  if (state.display.isSettingsPopupShown) return SETTINGS_POPUP;
  if (state.display.isProfilePopupShown) return PROFILE_POPUP;
  if (state.display.isAddPopupShown) return ADD_POPUP;
  if (state.display.isSignUpPopupShown) return SIGN_UP_POPUP;
  if (state.display.isSignInPopupShown) return SIGN_IN_POPUP;

  // IMPORTANT that search is on the last as updatePopupAsBackPressed relies on this
  //   to close other popups before search (search is the last to be closed).
  if (state.display.isSearchPopupShown) return SEARCH_POPUP;

  return null;
};

export const isPopupShown = (state) => {
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
  if (
    historyPosition === BACK_DECIDER &&
    store.getState().window.historyPosition === BACK_POPUP
  ) {

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
  return { type: UPDATE_HISTORY_POSITION, payload: historyPosition };
};

export const signOut = () => async (dispatch, getState) => {
  userSession.signUserOut();
  await resetState(dispatch);
};

export const updateUserData = (data) => async (dispatch, getState) => {
  try {
    userSession.updateUserData(data);
  } catch (error) {
    window.alert(`Update user data failed! Please refresh the page and try again. If the problem persists, please contact us.\n\n${error}`);
    return;
  }

  const isUserSignedIn = userSession.isUserSignedIn();
  if (isUserSignedIn) dispatch(updateUserSignedIn());
};

export const updateUserSignedIn = () => async (dispatch, getState) => {
  await resetState(dispatch);

  const userData = userSession.loadUserData();
  dispatch({
    type: UPDATE_USER,
    payload: {
      isUserSignedIn: true,
      username: getUserUsername(userData),
      image: getUserImageUrl(userData),
      hubUrl: userData.hubUrl,
    },
  });

  redirectToMain();
};

const resetState = async (dispatch) => {
  lsgApi.removeItemSync(PADDLE_RANDOM_ID);

  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  // clear file storage
  await cacheApi.deleteAllFiles();
  await fileApi.deleteAllFiles();

  // clear cached fpaths
  vars.cachedServerFPaths.fpaths = null;

  // clear vars
  vars.fetch.dt = 0;
  vars.randomHouseworkTasks.dt = 0;

  // clear all user data!
  dispatch({ type: RESET_STATE });
};

const redirectToMain = () => {
  // Need timeout for window.history.back() to update the href first.
  setTimeout(() => {
    const urlObj = new Url(window.location.href, {});
    if (urlObj.pathname === '/' && ['', '#'].includes(urlObj.hash)) return;

    // Empty hash like this, so no reload, popHistoryState is called,
    //   but # in the url. componentDidMount in Main will handle it.
    window.location.hash = '';
  }, 1);
};

export const updateDefaultPreference = async (doExtractContents) => {
  // Do nothing on web. This is for mobile.
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

export const updateSearchString = (searchString) => {
  return { type: UPDATE_SEARCH_STRING, payload: searchString };
};

export const updateHref = (href) => {
  return { type: UPDATE_HREF, payload: href };
};

export const updateBulkEdit = (isBulkEditing) => {
  return { type: UPDATE_BULK_EDITING, payload: isBulkEditing };
};

export const showSWWUPopup = () => async (dispatch, getState) => {
  dispatch(updatePopup(SWWU_POPUP, true));
};
