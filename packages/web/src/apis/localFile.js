import * as idb from 'idb-keyval';

import { CD_ROOT, IMAGES } from '../types/const';
import { isUint8Array, isBlob } from '../utils/index-web';

const Dirs = { DocumentDir: 'DocumentDir' };

// createObjectURL already holds files in memory so cache them doesn't require more.
// Also, need to call revokeObjectURL where appropriate.
let cachedContents = {};

const deriveFPath = (fpath, dir) => {
  if (fpath.includes(CD_ROOT + '/')) {
    fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
    fpath = fpath.replace(CD_ROOT + '/', dir + '/');
  } else {
    fpath = dir + '/' + fpath;
  }
  return fpath;
};

const getFile = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  if (fpath in cachedContents) return cachedContents[fpath];

  const cachedContent = { content: undefined }; // If no key, val will be undefined.
  try {
    cachedContent.content = await idb.get(fpath);
  } catch (error) {
    console.log('In localFile.getFile, IndexedDB error:', error);
    return cachedContent;
  }

  if (isUint8Array(cachedContent.content)) {
    cachedContent.content = new Blob([cachedContent.content]);
  }
  if (isBlob(cachedContent.content)) {
    cachedContent.contentUrl = URL.createObjectURL(cachedContent.content);
  }

  cachedContents[fpath] = cachedContent;
  return cachedContent;
};

const putFile = async (fpath, content, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  if (isUint8Array(content)) content = new Blob([content]);

  try {
    await idb.set(fpath, content);
  } catch (error) {
    console.log('In localFile.putFile, IndexedDB error:', error);
  }

  if (fpath in cachedContents && 'contentUrl' in cachedContents[fpath]) {
    URL.revokeObjectURL(cachedContents[fpath].contentUrl);
  }

  const cachedContent = { content };
  if (isBlob(content)) cachedContent.contentUrl = URL.createObjectURL(content);

  cachedContents[fpath] = cachedContent;
  return cachedContent;
};

const deleteFile = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);

  try {
    await idb.del(fpath);
  } catch (error) {
    console.log('In localFile.deleteFile, IndexedDB error:', error);
  }

  if (fpath in cachedContents && 'contentUrl' in cachedContents[fpath]) {
    URL.revokeObjectURL(cachedContents[fpath].contentUrl);
  }
  delete cachedContents[fpath];
};

const deleteFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  for (const fpath of fpaths) {
    await deleteFile(fpath, dir);
  }
};

const deleteAllFiles = async () => {
  // BUG Alert: localCache also uses IndexedDB too!
  try {
    await idb.clear();
  } catch (error) {
    console.log('In localFile.deleteAllFiles, IndexedDB error:', error);
  }

  for (const fpath in cachedContents) {
    if ('contentUrl' in cachedContents[fpath]) {
      URL.revokeObjectURL(cachedContents[fpath].contentUrl);
    }
  }
  cachedContents = {};
};

const getStaticFPaths = async () => {
  let keys;
  try {
    keys = await idb.keys();
  } catch (error) {
    console.log('In localFile.getStaticFPaths, IndexedDB error:', error);
    keys = Object.keys(cachedContents);
  }

  const fpaths = [];
  for (let key of keys) {
    key = `${key}`; // Force key to be only string, no number.
    if (key.startsWith(Dirs.DocumentDir)) {
      key = key.slice(Dirs.DocumentDir.length + 1);
      if (key.startsWith(IMAGES + '/')) fpaths.push(key);
    }
  }
  return fpaths;
};

const localFile = {
  getFile, putFile, deleteFile, deleteFiles, deleteAllFiles, getStaticFPaths,
};

export default localFile;
