import defaultQueue from '@redux-offline/redux-offline/lib/defaults/queue';

import {
  GET_FILE, PUT_FILE, DELETE_FILE,
} from '../types/const';
import {
  FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS,
} from '../types/actionTypes';
import { effect as blockstackEffect } from './blockstack';

const getMethod = action => action.meta.offline.effect.method;

export const queue = {
  ...defaultQueue,
  enqueue(array, action) {

    if (getMethod(action) === FETCH) {
      const newArray = array.filter(item =>
        getMethod(item) !== FETCH && getMethod(item) !== FETCH_MORE
      );
      return [...newArray, action];
    }

    if (getMethod(action) === FETCH_MORE) {
      const found = array.some(item => getMethod(item) === FETCH);
      if (found) {
        return [...array];
      }

      const newArray = array.filter(item => getMethod(item) !== FETCH_MORE);
      return [...newArray, action];
    }

    return [...array, action];
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
    FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS
  ].includes(method)) {
    return await blockstackEffect(effectObj, _action);
  }

  throw new Error(`${method} is invalid for offline effect.`);
};
