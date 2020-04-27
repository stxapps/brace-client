import userSession from '../userSession';
import {
  PUT_FILE, DELETE_FILE, GET_FILE, LIST_FILES,
} from '../types/const';

export const effect = async (effectObj, _action) => {

  const { method, path, content } = effectObj;

  if (method === PUT_FILE) {
    const results = await userSession.putFile(path, content);
  } else if (method === DELETE_FILE) {

  } else if (method === GET_FILE) {

  } else if (method === LIST_FILES) {

  } else {

  }

  // TODO: If error, network or not, if not, will discard immediately, not retry!
  // Need to throw NetworkError or override discard function!

};
