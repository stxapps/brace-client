import { showBlockstackConnect } from '@blockstack/connect';

import userSession from '../userSession';
import {
  INIT, UPDATE_WINDOW, UPDATE_HISTORY_POSITION,
  UPDATE_USER,
  UPDATE_POPUP,
  FETCH_LINKS, FETCH_LINKS_COMMIT, FETCH_LINKS_ROLLBACK,
} from '../types/actionTypes';
import {
  BACK_DECIDER, BACK_POPUP,
  APP_NAME, APP_ICON_URL,
  PUT_FILE, DELETE_FILE, GET_FILE, LIST_FILES,
} from '../types/const';
import { createPath } from '../utils';

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

export const popHistoryState = (store) => {

  let historyPosition = window.history.state;
  if (historyPosition === BACK_DECIDER &&
    store.getState().window.historyPosition === BACK_POPUP) {

    // if back button pressed and there is a popup shown
    if (store.getState().display.isPopupShown) {
      // disable back button by forcing to go forward in history states
      // No need to update state here as window.history.go triggers popstate event
      store.dispatch({
        type: 'UPDATE_POPUP',
        payload: false
      })

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

export const updatePopup = isShown => {
  return {
    type: UPDATE_POPUP,
    payload: isShown,
  };
};

export const fetchLinks = (listName) => {
  return {
    type: FETCH_LINKS,
    payload: { listName },
    meta: {
      offline: {
        effect: { method: LIST_FILES, path: createPath(listName) },
        commit: { type: FETCH_LINKS_COMMIT, meta: { listName } },
        rollback: { type: FETCH_LINKS_ROLLBACK, meta: { listName } }
      }
    },
  };
};
