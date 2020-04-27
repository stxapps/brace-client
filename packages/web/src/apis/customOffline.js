import {
  PUT_FILE, DELETE_FILE, GET_FILE, LIST_FILES,
} from '../types/const';
import { effect as blockstackEffect } from './blockstack';

export const effect = async (effectObj, _action) => {

  const { method } = effectObj;

  if ([PUT_FILE, DELETE_FILE, GET_FILE, LIST_FILES].includes(method)) {
    return await blockstackEffect(effectObj, _action);
  }

  throw new Error(`${method} is invalid for offline effect.`);
};

