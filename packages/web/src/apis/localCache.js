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

const getFiles = async (fpaths, dangerouslyIgnoreUndefined = false) => {
  const contents = [];
  for (const fpath of fpaths) {
    const content = await getFile(fpath, dangerouslyIgnoreUndefined);
    contents.push(content);
  }
  return { fpaths, contents };
};

const putFile = async (fpath, content) => {
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

  try {
    await idb.set(fpath, content);
  } catch (error) {
    console.log('In localCache.putFile, IndexedDB error:', error);
  }
};

const putFiles = async (fpaths, contents) => {
  for (let i = 0; i < fpaths.length; i++) {
    await putFile(fpaths[i], contents[i]);
  }
};

const deleteFile = async (fpath) => {
  try {
    await idb.del(fpath);
  } catch (error) {
    console.log('In localCache.deleteFile, IndexedDB error:', error);
  }
};

const deleteFiles = async (fpaths) => {
  for (const fpath of fpaths) {
    await deleteFile(fpath);
  }
};

const localCache = {
  getFile, getFiles, putFile, putFiles, deleteFile, deleteFiles,
};

export default localCache;
