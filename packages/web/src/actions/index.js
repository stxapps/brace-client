import { showBlockstackConnect } from '@blockstack/connect';
import { RESET_STATE as OFFLINE_RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import axios from 'axios';

import userSession from '../userSession';
import {
  INIT, UPDATE_WINDOW, UPDATE_HISTORY_POSITION, UPDATE_USER,
  UPDATE_LIST_NAME, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  UPDATE_LINKS,
  DELETE_LINKS, DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK,
  CANCEL_DIED_LINKS,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_STATUS, UPDATE_CARD_ITEM_MENU_POPUP_POSITION, UPDATE_HANDLING_SIGN_IN,
  RESET_STATE,
} from '../types/actionTypes';
import {
  APP_NAME, APP_ICON_NAME,
  BACK_DECIDER, BACK_POPUP,
  ALL, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, LIST_NAME_POPUP, CONFIRM_DELETE_POPUP,
  ID, STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
  MY_LIST, TRASH, ARCHIVE,
  DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  BRACE_EXTRACT_URL, EXTRACT_EXCEEDING_N_URLS,
} from '../types/const';
import {
  _,
  randomString, rerandomRandomTerm, deleteRemovedDT, getMainId,
  getUrlFirstChar, separateUrlAndParam, extractUrl,
  getUrlPathQueryHash,
  randomDecor,
} from '../utils';

export const init = async (store) => {

  await handlePendingSignIn()(store.dispatch, store.getState);

  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn: userSession.isUserSignedIn(),
      href: window.location.href,
      windowWidth: null,
      windowHeight: null,
    }
  });

  popHistoryState(store);
  window.addEventListener('popstate', function () {
    popHistoryState(store);
  });
};

const handlePendingSignIn = () => async (dispatch, getState) => {

  const { pathname } = extractUrl(window.location.href);
  if (!(pathname === '/' && userSession.isSignInPending())) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true
  });

  try {
    await userSession.handlePendingSignIn();
  } catch (e) {
    console.log(`Catched an error thrown by handlePendingSignIn: ${e.message}`);
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
        image: (userData && userData.profile && userData.profile.image) || null,
      }
    });
  }

  const { separatedUrl } = separateUrlAndParam(window.location.href, 'authResponse');
  window.history.replaceState(window.history.state, '', separatedUrl);

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false
  });
};

const getPopupShownId = (state) => {
  if (state.display.isAddPopupShown) return ADD_POPUP;
  if (state.display.isProfilePopupShown) return PROFILE_POPUP;
  if (state.display.isListNamePopupShown) return LIST_NAME_POPUP;
  if (state.display.isConfirmDeletePopupShown) return CONFIRM_DELETE_POPUP;

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

  let id = ALL;
  if (getState().display.isConfirmDeletePopupShown) {
    id = CONFIRM_DELETE_POPUP;
  } else if (getState().display.isAddPopupShown) {
    id = ADD_POPUP;
  } else if (getState().display.isSearchPopupShown) {
    // Close other popups before search,
    //   this depends on getPopupShownId to return other ids before search id
    id = getPopupShownId(getState());
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

    // No popup shown, go back one more
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
        window.history.replaceState(null, '', '#back');
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

export const signUp = () => async (dispatch, getState) => {

  const authOptions = {
    redirectTo: '/' + getUrlPathQueryHash(window.location.href),
    appDetails: {
      name: APP_NAME,
      icon: extractUrl(window.location.href).origin + '/' + APP_ICON_NAME,
    },
    finished: ({ userSession }) => {

      const userData = userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: (userData && userData.profile && userData.profile.image) || null,
        },
      });
    },
    sendToSignIn: false,
    userSession: userSession,
  };

  showBlockstackConnect(authOptions);
};

export const signIn = () => async (dispatch, getState) => {

  const authOptions = {
    redirectTo: '/' + getUrlPathQueryHash(window.location.href),
    appDetails: {
      name: APP_NAME,
      icon: extractUrl(window.location.href).origin + '/' + APP_ICON_NAME,
    },
    finished: ({ userSession }) => {

      const userData = userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: (userData && userData.profile && userData.profile.image) || null,
        },
      });
    },
    sendToSignIn: true,
    userSession: userSession,
  };

  showBlockstackConnect(authOptions);
};

export const signOut = () => async (dispatch, getState) => {

  userSession.signUserOut();

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

export const fetch = (doDeleteOldLinks, doExtractContents) => async (dispatch, getState) => {

  const listName = getState().display.listName;
  dispatch({
    type: FETCH,
    meta: {
      offline: {
        effect: { method: FETCH, params: listName },
        commit: { type: FETCH_COMMIT, meta: { doDeleteOldLinks, doExtractContents } },
        rollback: { type: FETCH_ROLLBACK },
      }
    },
  });
};

export const fetchMore = () => async (dispatch, getState) => {

  const listName = getState().display.listName;
  const ids = Object.keys(getState().links[listName]);

  dispatch({
    type: FETCH_MORE,
    meta: {
      offline: {
        effect: { method: FETCH_MORE, params: { listName, ids } },
        commit: { type: FETCH_MORE_COMMIT },
        rollback: { type: FETCH_MORE_ROLLBACK },
      }
    },
  });
};

export const addLink = (url, doExtractContents = false) => async (dispatch, getState) => {

  let listName = getState().display.listName;
  if (listName === TRASH || listName === ARCHIVE) {
    listName = MY_LIST;
  }

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
        commit: { type: MOVE_LINKS_ADD_STEP_COMMIT, meta: { fromListName, ids } },
        rollback: { type: MOVE_LINKS_ADD_STEP_ROLLBACK, meta: payload },
      }
    },
  });
};

export const moveLinksDeleteStep = (listName, ids) => async (dispatch, getState) => {

  const payload = { listName, ids };

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

  dispatch({
    type: UPDATE_LIST_NAME,
    payload: listName,
  })

  if (!fetched.includes(listName)) {
    dispatch(fetch(false, true));
  }
};

export const updateSearchString = (searchString) => {
  return {
    type: UPDATE_SEARCH_STRING,
    payload: searchString,
  };
};

export const deleteOldLinksInTrash = (doExtractContents = false) => async (dispatch, getState) => {
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

export const updateCardItemMenuPopupPosition = (position) => {
  return {
    type: UPDATE_CARD_ITEM_MENU_POPUP_POSITION,
    payload: position,
  };
};

export const extractContents = (listName, ids) => async (dispatch, getState) => {

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
    if (!_links[0]) throw new Error(`Links not found: ${listName}, ${ids}`);
    links = [_links[0]];
  } else {
    throw new Error(`Invalid parameters: ${listName}, ${ids}`);
  }

  const res = await axios.post(
    BRACE_EXTRACT_URL,
    { urls: links.map(link => link.url) }
  );
  const extractedResults = res.data.extractedResults;

  const extractedLinks = [];
  for (let i = 0; i < extractedResults.length; i++) {
    const extractedResult = extractedResults[i];
    if (extractedResult.status === EXTRACT_EXCEEDING_N_URLS) continue;

    // Some links might be moved while extracting.
    // If that the case, ignore them.
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
