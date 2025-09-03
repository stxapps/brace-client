import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import Url from 'url-parse';
import PQueue from 'p-queue';

import userSession from '../userSession';
import cacheApi from '../apis/localCache';
import fileApi from '../apis/localFile';
import lsgApi from '../apis/localSg';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_WINDOW, UPDATE_STACKS_ACCESS,
  UPDATE_SEARCH_STRING, UPDATE_POPUP, UPDATE_BULK_EDITING, REFRESH_FETCHED, ADD_LINKS,
  DELETE_LINKS, MOVE_LINKS_ADD_STEP, MOVE_LINKS_DELETE_STEP, TRY_UPDATE_SETTINGS,
  MERGE_SETTINGS, PIN_LINK, UNPIN_LINK, MOVE_PINNED_LINK_ADD_STEP,
  UPDATE_SYSTEM_THEME_MODE, UPDATE_IS_24H_FORMAT, UPDATE_CUSTOM_DATA,
  UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_T_STEP,
  INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT, RESET_STATE,
} from '../types/actionTypes';
import {
  SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  CARD_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP, BULK_EDIT_MENU_POPUP,
  CUSTOM_EDITOR_POPUP, TAG_EDITOR_POPUP, PAYWALL_POPUP, CONFIRM_DELETE_POPUP,
  CONFIRM_DISCARD_POPUP, SETTINGS_POPUP, SETTINGS_LISTS_MENU_POPUP,
  SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP, LOCK_EDITOR_POPUP, SWWU_POPUP, WHT_MODE,
  BLK_MODE, PADDLE_RANDOM_ID,
} from '../types/const';
import {
  isEqual, isObject, throttle, getUserUsername, getUserImageUrl, getWindowInsets,
  getEditingListNameEditors, getEditingTagNameEditors, randomString,
  getPopupHistoryStateIndex,
} from '../utils';
import vars from '../vars';

const taskQueue = new PQueue({ concurrency: 1 });

export const init = async (store) => {
  if (typeof window === 'undefined') return;

  const isUserSignedIn = userSession.isUserSignedIn();
  let username = null, userImage = null, userHubUrl = null;
  if (isUserSignedIn) {
    const userData = userSession.loadUserData();
    username = getUserUsername(userData);
    userImage = getUserImageUrl(userData);
    userHubUrl = userData.hubUrl;
  }

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
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
    },
  });

  window.addEventListener('popstate', function () {
    popHistoryState(store);
  });

  window.addEventListener('resize', throttle(() => {
    const insets = getWindowInsets();
    store.dispatch({
      type: UPDATE_WINDOW,
      payload: {
        width: window.innerWidth,
        height: window.innerHeight,
        insetTop: insets.top,
        insetRight: insets.right,
        insetBottom: insets.bottom,
        insetLeft: insets.left,
      },
    });
  }, 16));
  if (isObject(window.visualViewport)) {
    window.visualViewport.addEventListener('resize', throttle(() => {
      const insets = getWindowInsets();
      store.dispatch({
        type: UPDATE_WINDOW,
        payload: {
          visualWidth: window.visualViewport.width,
          visualHeight: window.visualViewport.height,
          insetTop: insets.top,
          insetRight: insets.right,
          insetBottom: insets.bottom,
          insetLeft: insets.left,
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

const getPopupShownId = (state) => {
  // No need these popups here:
  //   SettingsErrorPopup, PinErrorPopup, TagErrorPopup, AccessErrorPopup,
  //   SWWUPopup, and HubErrorPopup.
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

const getCanBckPopups = (getState) => {
  const state = getState();
  const canBckPopups = {
    [SIGN_UP_POPUP]: {
      canFwd: true, isShown: state.display.isSignUpPopupShown,
    },
    [SIGN_IN_POPUP]: {
      canFwd: true, isShown: state.display.isSignInPopupShown,
    },
    [ADD_POPUP]: {
      canFwd: true, isShown: state.display.isAddPopupShown,
    },
    [SEARCH_POPUP]: {
      canFwd: true, isShown: state.display.isSearchPopupShown,
    },
    [PROFILE_POPUP]: {
      canFwd: true, isShown: state.display.isProfilePopupShown,
    },
    [CARD_ITEM_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isCardItemMenuPopupShown,
    },
    [LIST_NAMES_POPUP]: {
      canFwd: false, isShown: state.display.isListNamesPopupShown,
    },
    [PIN_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isPinMenuPopupShown,
    },
    [BULK_EDIT_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isBulkEditMenuPopupShown,
    },
    [CUSTOM_EDITOR_POPUP]: {
      canFwd: false, isShown: state.display.isCustomEditorPopupShown,
    },
    [TAG_EDITOR_POPUP]: {
      canFwd: false, isShown: state.display.isTagEditorPopupShown,
    },
    [CONFIRM_DELETE_POPUP]: {
      canFwd: false, isShown: state.display.isConfirmDeletePopupShown,
    },
    [CONFIRM_DISCARD_POPUP]: {
      canFwd: false, isShown: state.display.isConfirmDiscardPopupShown,
    },
    [SETTINGS_POPUP]: {
      canFwd: true, isShown: state.display.isSettingsPopupShown,
    },
    [SETTINGS_LISTS_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isSettingsListsMenuPopupShown,
    },
    [SETTINGS_TAGS_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isSettingsTagsMenuPopupShown,
    },
    [TIME_PICK_POPUP]: {
      canFwd: false, isShown: state.display.isTimePickPopupShown,
    },
    [PAYWALL_POPUP]: {
      canFwd: false, isShown: state.display.isPaywallPopupShown,
    },
    [LOCK_EDITOR_POPUP]: {
      canFwd: false, isShown: state.display.isLockEditorPopupShown,
    },
  };
  return canBckPopups;
};

const canPopupBckBtn = (canBckPopups, id) => {
  if (isObject(canBckPopups[id])) return true;
  return false;
};

const canPopupFwdBtn = (canBckPopups, id) => {
  if (isObject(canBckPopups[id])) return canBckPopups[id].canFwd;
  return false;
};

const isPopupShownWthId = (canBckPopups, id) => {
  if (isObject(canBckPopups[id])) return canBckPopups[id].isShown;
  console.log('Called isPopupShownWthId with unsupported id:', id);
  return false;
};

export const popHistoryState = (store) => {
  const canBckPopups = getCanBckPopups(store.getState);

  const chs = window.history.state;
  const idx = getPopupHistoryStateIndex(vars.popupHistory.states, chs);

  const cPopupIds = vars.popupHistory.states.slice(idx + 1).map(s => s.id);
  for (const id of cPopupIds) {
    if (isPopupShownWthId(canBckPopups, id)) {
      store.dispatch({
        type: UPDATE_POPUP, payload: { id, isShown: false },
      });

      if (id === ADD_POPUP) {
        if (window.document.activeElement instanceof HTMLInputElement) {
          window.document.activeElement.blur();
        }
      }
      if (id === SEARCH_POPUP) {
        // Clear search string
        //   and need to defocus too to prevent keyboard appears on mobile
        store.dispatch(updateSearchString(''));

        if (window.document.activeElement instanceof HTMLInputElement) {
          window.document.activeElement.blur();
        }
      }
    }
  }

  if (idx >= 0) { // Support forward by open the current one if can.
    const phs = vars.popupHistory.states[idx];
    if (
      canPopupFwdBtn(canBckPopups, phs.id) && !isPopupShownWthId(canBckPopups, phs.id)
    ) {
      store.dispatch({
        type: UPDATE_POPUP, payload: { id: phs.id, isShown: true },
      });
    }
  }
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

export const updateStacksAccess = (data) => {
  return { type: UPDATE_STACKS_ACCESS, payload: data };
};

const updatePopupInQueue = (
  id, isShown, anchorPosition, dispatch, getState
) => () => {
  return new Promise<void>((resolve) => {
    dispatch({
      type: UPDATE_POPUP,
      payload: { id, isShown, anchorPosition },
    });

    const canBckPopups = getCanBckPopups(getState);
    if (!canPopupBckBtn(canBckPopups, id)) {
      resolve();
      return;
    }

    if (isShown) {
      const phs = { phsId: `${Date.now()}-${randomString(4)}`, id };

      const chs = window.history.state;
      const idx = getPopupHistoryStateIndex(vars.popupHistory.states, chs);
      if (idx >= 0) {
        vars.popupHistory.states = [
          ...vars.popupHistory.states.slice(0, idx + 1), phs,
        ];
      } else {
        vars.popupHistory.states.push(phs);
      }

      window.history.pushState(phs, '', window.location.href);
      resolve();
      return;
    }

    const onPopState = () => {
      window.removeEventListener('popstate', onPopState);
      resolve();
    };
    window.addEventListener('popstate', onPopState);
    window.history.back();
  });
};

export const updatePopup = (id, isShown, anchorPosition = null) => async (
  dispatch, getState
) => {
  const task = updatePopupInQueue(id, isShown, anchorPosition, dispatch, getState);
  taskQueue.add(task);
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

export const refreshFetched = (doShowLoading = false, doScrollTop = false) => async (
  dispatch, getState
) => {
  // No show loading refresh e.g., inactive to active
  //   - no show loading, no scroll top
  //   - fetch settings, fetch links, check and show fetchedPopup

  // Show loading refresh e.g., press refresh button
  //   - show loading, scroll top
  //   - fetch settings, fetch links, force update no cache

  const listName = getState().display.listName;
  const queryString = getState().display.queryString;
  const lnOrQt = queryString ? queryString : listName;

  const payload = { lnOrQt, doShowLoading, doScrollTop };
  dispatch({ type: REFRESH_FETCHED, payload });
};

export const updateIs24HFormat = (is24HFormat) => {
  return { type: UPDATE_IS_24H_FORMAT, payload: is24HFormat };
};

export const showSWWUPopup = () => async (dispatch, getState) => {
  dispatch(updatePopup(SWWU_POPUP, true));
};

export const increaseUpdateStatusBarStyleCount = () => {
  return { type: INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT };
};
