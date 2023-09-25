import defaultQueue from '@redux-offline/redux-offline/lib/defaults/queue';

import userSession from '../userSession';
import {
  FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS, TRY_UPDATE_SETTINGS,
  UPDATE_SETTINGS, TRY_UPDATE_INFO, UPDATE_INFO, PIN_LINK, UNPIN_LINK,
  UPDATE_CUSTOM_DATA, UPDATE_TAG_DATA,
} from '../types/actionTypes';
import { isObject, isString, isNumber } from '../utils';

import { effect as blockstackEffect } from './blockstack';

export const queue = {
  ...defaultQueue,
  enqueue(array, action) {

    // DO NOT touch action at index 0 as it's being processed
    //   there will be async function called updating that action.

    // Check if previous action is exactly the same, no need to add more
    //   i.e. user enters address bar again and again.
    // This should be done in actions
    //   so subsequence actions like COMMIT and ROLLBACK is dispatched appropriately.

    // The same action FETCH might have different list name.
    // One action FETCH might be followed by other actions and others might not.

    // Also true for FETCH_MORE

    // It's possible that FETCH is cached
    //   and user wants to fetch more continue from current state.
    /*if (getMethod(action) === FETCH && array.length) {

      // Filter out FETCH_MORE with the same list name which is not at index 0
      // This is dangerous as there will be no COMMIT or ROLLBACK dispatched!
      let newArray = array.slice(1).filter(el => {
        if (getMethod(el) === FETCH_MORE) {
          if (getParams(el).listName === getParams(action).listName) return false;
        }
        return true
      });
      if (array[0]) newArray = [array[0], ...newArray];
      return [...newArray, action]
    }*/

    return [...array, action];
  },
  peek(array, item, context) {
    if (!userSession.didSessionCreate()) return undefined;
    return array[0];
  },
};

export const discard = (error, action, _retries) => {

  console.log('redux-offline, discard called with error:', error);

  if (
    isObject(error) &&
    isString(error.message) &&
    error.message.includes('Should be unreachable')
  ) {
    return false;
  }
  if (
    isObject(error) &&
    isString(error.code) &&
    error.code.includes('remote_service_error')
  ) {
    return false;
  }
  if (
    isObject(error) &&
    isObject(error.hubError) &&
    isNumber(error.hubError.statusCode)
  ) {
    const statusCode = error.hubError.statusCode;

    // discard http 4xx errors
    return statusCode >= 400 && statusCode < 500;
  }
  if (isObject(error) && isNumber(error.status)) {
    // discard http 4xx errors
    return error.status >= 400 && error.status < 500;
  }

  // not a network error -> discard
  return true;
};

export const effect = async (effectObj, _action) => {

  const { method } = effectObj;

  if ([
    FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS, TRY_UPDATE_SETTINGS,
    UPDATE_SETTINGS, TRY_UPDATE_INFO, UPDATE_INFO, PIN_LINK, UNPIN_LINK,
    UPDATE_CUSTOM_DATA, UPDATE_TAG_DATA,
  ].includes(method)) {
    return await blockstackEffect(effectObj, _action);
  }

  throw new Error(`${method} is invalid for offline effect.`);
};
