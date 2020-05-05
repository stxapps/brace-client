import { showBlockstackConnect } from '@blockstack/connect';

import userSession from '../userSession';
import {
  INIT, UPDATE_WINDOW, UPDATE_HISTORY_POSITION,
  UPDATE_USER,
  UPDATE_LIST_NAME, UPDATE_POPUP,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  ADD_LINKS, ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK,
  UPDATE_LINKS, UPDATE_LINKS_COMMIT, UPDATE_LINKS_ROLLBACK,
  DELETE_LINKS, DELETE_LINKS_COMMIT, DELETE_LINKS_ROLLBACK,
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT, MOVE_LINKS_DELETE_STEP_ROLLBACK,
} from '../types/actionTypes';
import {
  APP_NAME, APP_ICON_URL,
  BACK_DECIDER, BACK_POPUP,
  ALL, IS_POPUP_SHOWN,
  MY_LIST, TRASH, ARCHIVE,
} from '../types/const';
import { randomString, _ } from '../utils';

export const init = (store) => {
  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn: userSession.isUserSignedIn(),
      href: window.location.href,
    }
  });

  popHistoryState(store);
  window.addEventListener('popstate', function () {
    popHistoryState(store);
  });
};

const isPopupShown = (state) => {
  if (state.display.isAddPopupShown ||
    state.display.isProfilePopupShown || state.display.isListNamePopupShown) {
    return true;
  }

  for (const listName in state.links) {
    if (_.extract(state.links[listName], IS_POPUP_SHOWN).some(el => el === true)) {
      return true;
    }
  }

  return false;
};

export const popHistoryState = (store) => {

  let historyPosition = window.history.state;
  if (historyPosition === BACK_DECIDER &&
    store.getState().window.historyPosition === BACK_POPUP) {

    // if back button pressed and there is a popup shown
    if (isPopupShown(store.getState())) {
      // disable back button by forcing to go forward in history states
      // No need to update state here as window.history.go triggers popstate event
      store.dispatch(updatePopup(ALL, false))

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

    window.history.go(-1);
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
    redirectTo: '/',
    appDetails: {
      name: APP_NAME,
      icon: APP_ICON_URL,
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
    redirectTo: '/',
    appDetails: {
      name: APP_NAME,
      icon: APP_ICON_URL,
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
  dispatch({
    type: UPDATE_USER,
    payload: {
      isUserSignedIn: false,
      username: null,
    },
  });
};

export const updatePopup = (id, isShown, anchorPosition = null) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
};

export const fetch = () => async (dispatch, getState) => {

  const listName = getState().display.listName;
  dispatch({
    type: FETCH,
    meta: {
      offline: {
        effect: { method: FETCH, params: listName },
        commit: { type: FETCH_COMMIT },
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

export const addLink = (url) => async (dispatch, getState) => {

  let listName = getState().display.listName;
  if (listName === TRASH || listName === ARCHIVE) {
    listName = MY_LIST;
  }

  const added_dt = Date.now();
  const id = `${added_dt}-${randomString(4)}`;
  const link = { id, url, added_dt, did_beautify: false, };
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
};

export const moveLinks = (ids, toListName) => async (dispatch, getState) => {

  const fromListName = getState().display.listName;

  // _.ignore()

};

export const deleteLinks = (ids) => async (dispatch, getState) => {

  let listName = getState().display.listName;

};

export const changeListName = (listName, fetched) => async (dispatch, getState) => {

  dispatch({
    type: UPDATE_LIST_NAME,
    payload: listName,
  })

  if (!fetched.includes(listName)) {
    dispatch(fetch());
  }
};

export const searchLinks = () => {
  return null;
}
