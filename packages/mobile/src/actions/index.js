import { Linking, Dimensions } from 'react-native';
import { RESET_STATE as OFFLINE_RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import axios from 'axios';

import userSession from '../userSession';
import {
  INIT, UPDATE_WINDOW, UPDATE_HREF, UPDATE_HISTORY_POSITION, UPDATE_WINDOW_SIZE,
  UPDATE_USER,
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
import {
  _,
  randomString, rerandomRandomTerm, deleteRemovedDT, getMainId,
  getUrlFirstChar, separateUrlAndParam, extractUrl,
  getUrlPathQueryHash,
  randomDecor,
} from '../utils';

// BUG
//import testLinks from '../../links.json';

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

  // TODO: check if Linking.getInitialURL(url) is not null, handle it.
  //Linking.getInitialURL(url)

  Linking.addEventListener('url', async (e) => {
    console.log(`Linking called:`, e);

    if (e.url.startsWith(DOMAIN_NAME + BLOCKSTACK_AUTH)) {
      // As handle pending sign in takes time, show loading first.
      store.dispatch({
        type: UPDATE_HREF,
        payload: null
      });

      const { param: { authResponse } } = separateUrlAndParam(e.url, 'authResponse');
      const result = await userSession.handlePendingSignIn(authResponse);
      console.log(`Result of handlePendingSignIn: ${result}`);

      const userData = await userSession.loadUserData();
      store.dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: (userData && userData.profile && userData.profile.image) || null,
        }
      });

      // Update it back
      store.dispatch({
        type: UPDATE_HREF,
        payload: DOMAIN_NAME + '/'
      });
    }
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
  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn: isUserSignedIn,
      href: DOMAIN_NAME + '/',
      windowWidth: Dimensions.get('window').width,
      windowHeight: Dimensions.get('window').height,
    }
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
  console.log(`Result of signUserOut: ${result}`);

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

  // BUG
  /*dispatch({
    type: FETCH_COMMIT,
    payload: {
      listName,
      links: [],
      hasMore: false,
      listNames: ['My List', 'Archive', 'Trash'],
    },
    meta: {
      doDeleteOldLinks: false,
      doExtractContents: false,
    }
  });*/
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

  const res = await axios.post(BRACE_EXTRACT_URL, { urls: links.map(link => link.url) });
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
