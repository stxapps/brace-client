import defaultQueue from '@redux-offline/redux-offline/lib/defaults/queue';

import {
  GET_FILE, PUT_FILE, DELETE_FILE,
} from '../types/const';
import {
  FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS, DELETE_OLD_LINKS_IN_TRASH,
  UPDATE_SETTINGS,
} from '../types/actionTypes';
import userSession from '../userSession';
import { effect as blockstackEffect } from './blockstack';
import { isEqual } from '../utils';

const getMethod = action => action.meta.offline.effect.method;
const getParams = action => action.meta.offline.effect.params;

export const queue = {
  ...defaultQueue,
  enqueue(array, action) {

    // DO NOT touch action at index 0 as it's being processed
    //   there will be async function called updating that action.

    // Check if previous action is exactly the same, no need to add more
    //   i.e. user enters address bar again and again.

    // The same action FETCH might have different list name.
    // One action FETCH might be followed by other actions and others might not.

    // Also true for FETCH_MORE

    if (getMethod(action) === FETCH && array.length) {

      // If there is already FETCH with the same list name,
      //   no need to add the new action.
      const found = array.some(el => {
        if (getMethod(el) === FETCH && getParams(el) === getParams(action)) return true;
        return false;
      });
      if (found) return [...array];

      // Filter out FETCH_MORE with the same list name which is not at index 0
      let newArray = array.slice(1).filter(el => {
        if (getMethod(el) === FETCH_MORE) {
          if (getParams(el).listName === getParams(action)) return false;
        }
        return true
      });
      if (array[0]) newArray = [array[0], ...newArray];
      return [...newArray, action]
    }

    if (getMethod(action) === FETCH_MORE && array.length) {
      // If there is already FETCH_MORE with the same params,
      //   no need to add the new action.
      const found = array.some(el => {
        if (getMethod(el) === FETCH_MORE) {
          if (isEqual(getParams(el), getParams(action))) return true;
        }
        return false;
      });
      if (found) return [...array];
    }

    return [...array, action];
  },
  peek(array, item, context) {
    if (!userSession.didSessionCreate()) return undefined;
    return array[0];
  }
}

export const discard = (error, action, _retries) => {

  console.log(`redux-offline's discard called with error: ${error}!`);

  if (error && error.message && error.message.includes('Should be unreachable')) {
    return false;
  }
  if (error && error.code && error.code.includes('remote_service_error')) {
    return false;
  }
  if (error && error.hubError && error.hubError.statusCode && Number.isInteger(error.hubError.statusCode)) {
    const statusCode = error.hubError.statusCode;

    // discard http 4xx errors
    return statusCode >= 400 && statusCode < 500;
  }
  if (error && error.status && Number.isInteger(error.status)) {
    // discard http 4xx errors
    return error.status >= 400 && error.status < 500;
  }

  // not a network error -> discard
  return true;
};

export const effect = async (effectObj, _action) => {

  const { method } = effectObj;

  if ([
    GET_FILE, PUT_FILE, DELETE_FILE,
    FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS, DELETE_OLD_LINKS_IN_TRASH,
    UPDATE_SETTINGS,
  ].includes(method)) {
    return await blockstackEffect(effectObj, _action);
  }

  throw new Error(`${method} is invalid for offline effect.`);
};
