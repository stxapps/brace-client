import * as idb from 'idb-keyval';

import { DOT_JSON } from '../types/const';

const getFile = async (fpath, dangerouslyIgnoreUndefined = false) => {
  let content; // If no key, val will be undefined.
  try {
    content = await idb.get(fpath);
  } catch (error) {
    console.log('In localCache.getFile, IndexedDB error:', error);
  }
  if (content === undefined && !dangerouslyIgnoreUndefined) {
    throw new Error(`DoesNotExist: localCache.getFile ${fpath} failed.`);
  }
  if (content !== undefined) {
    if (fpath.endsWith(DOT_JSON)) content = JSON.parse(content);
  }

  return content;
};

const putFile = async (fpath, content) => {
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

  try {
    await idb.set(fpath, content);
  } catch (error) {
    console.log('In localCache.putFile, IndexedDB error:', error);
  }
};

const deleteFile = async (fpath) => {
  try {
    await idb.del(fpath);
  } catch (error) {
    console.log('In localCache.deleteFile, IndexedDB error:', error);
  }
};

const localCache = { getFile, putFile, deleteFile };

export default localCache;
