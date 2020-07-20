import { Linking, Dimensions } from 'react-native';
import { RESET_STATE as OFFLINE_RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import axios from 'axios';

import userSession from '../userSession';
import {
  INIT, UPDATE_WINDOW, UPDATE_HISTORY_POSITION, UPDATE_WINDOW_WIDTH, UPDATE_USER,
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
  UPDATE_STATUS, UPDATE_CARD_ITEM_MENU_POPUP_POSITION,
  RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, BLOCKSTACK_AUTH,
  BACK_DECIDER, BACK_POPUP,
  ALL, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, LIST_NAME_POPUP, CONFIRM_DELETE_POPUP,
  ID, STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
  MY_LIST, TRASH, ARCHIVE,
  DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  BRACE_EXTRACT_URL, EXTRACT_EXCEEDING_N_URLS,
} from '../types/const';
import { separateUrlAndParam } from '../utils';

export const init = async (store) => {

  const hasSession = await userSession.hasSession();
  if (!hasSession['hasSession']) {
    const config = {
      appDomain: DOMAIN_NAME,
      scopes: ['store_write'],
      redirectUrl: BLOCKSTACK_AUTH
    };
    await userSession.createSession(config);
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn: isUserSignedIn['signedIn'],
      href: DOMAIN_NAME + '/',
      windowWidth: Dimensions.get('window').width,
    }
  });

  // TODO: check if Linking.getInitialURL(url) is not null, handle it.
  //Linking.getInitialURL(url)

  Linking.addEventListener('url', async (e) => {
    console.log(`Linking called: ${e}`);

    if (e.url.startsWith(DOMAIN_NAME + BLOCKSTACK_AUTH)) {
      const { param: { authResponse } } = separateUrlAndParam(e.url, 'authResponse');
      try {
        const result = await userSession.handlePendingSignIn(authResponse);
        console.log(`Result of handlePendingSignIn: ${JSON.stringify(result)}`);

        const userData = await userSession.loadUserData();
        store.dispatch({
          type: UPDATE_USER,
          payload: {
            isUserSignedIn: true,
            username: userData.username,
            image: (userData && userData.profile && userData.profile.image) || null,
          }
        });
      } catch (e) {
        console.log(`Error in handlePendingSignIn: ${e}`);
      }
    }
  });

  Dimensions.addEventListener("change", ({ window }) => {
    store.dispatch({
      type: UPDATE_WINDOW_WIDTH,
      payload: window.width
    });
  });
};

export const signUp = () => async (dispatch, getState) => {
  console.log(`signUp called.`);
  signIn()(dispatch, getState);
};

export const signIn = () => async (dispatch, getState) => {
  console.log(`signIn called.`);
  const result = await userSession.signIn();
  console.log(JSON.stringify(result));
};

export const signOut = () => async (dispatch, getState) => {

  const result = userSession.signUserOut();
  console.log(JSON.stringify(result));

  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};
