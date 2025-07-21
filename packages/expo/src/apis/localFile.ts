import { Dirs, FileSystem, Util } from 'react-native-file-access';

import { CD_ROOT, IMAGES } from '../types/const';

// getFile and putFile here just check if the file exists
//   and return the file url!!!
// The names are for consistency with web.

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

  const doExist = await FileSystem.exists(fpath);

  // Use undefined the same as in web.
  const cachedContent = { content: undefined, contentUrl: undefined };
  if (doExist) {
    cachedContent.content = `file://${fpath}`;
    cachedContent.contentUrl = cachedContent.content;
  }

  return cachedContent;
};

const putFile = async (fpath, content, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);

  const doExist = await FileSystem.exists(fpath);

  const cachedContent = { content: undefined, contentUrl: undefined };
  if (doExist) {
    cachedContent.content = `file://${fpath}`;
    cachedContent.contentUrl = cachedContent.content;
  }

  return cachedContent;
};

const deleteFile = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);

  try {
    await FileSystem.unlink(fpath);
  } catch (error) {
    // BUG ALERT
    // Treat not found error as not an error as local data might be out-dated.
    //   i.e. user tries to delete a not-existing file, it's ok.
    // Anyway, if the file should be there, this will hide the real error!
    console.log('In localFile.deleteFile, error: ', error);
  }
};

const deleteFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  for (const fpath of fpaths) {
    await deleteFile(fpath, dir);
  }
};

const deleteAllFiles = async (dir = Dirs.DocumentDir) => {
  // Different from web as there might be some other files too,
  //   can't just delete all files but need to specify dirs.
  const dpaths = [IMAGES];

  for (const dpath of dpaths) {
    const ddpath = deriveFPath(dpath, dir);

    const doExist = await FileSystem.exists(ddpath);
    if (!doExist) continue;

    await FileSystem.unlink(ddpath);
  }
};

const exists = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  return await FileSystem.exists(fpath);
};

const mkdir = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  await FileSystem.mkdir(fpath);
};

const cp = async (source, fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);

  let doExist = await FileSystem.exists(fpath);
  if (doExist) await FileSystem.unlink(fpath);

  const dpath = Util.dirname(fpath);
  doExist = await FileSystem.exists(dpath);
  if (!doExist) await FileSystem.mkdir(dpath);

  await FileSystem.cp(source, fpath);

  const cachedContent = { content: `file://${fpath}`, contentUrl: undefined };
  cachedContent.contentUrl = cachedContent.content;

  return cachedContent;
};

const _getFilePaths = async (dpath = Dirs.DocumentDir) => {
  const fpaths = [];

  const fnames = await FileSystem.ls(dpath);
  for (const fname of fnames) {
    const fpath = `${dpath}/${fname}`;
    const isDir = await FileSystem.isDir(fpath);

    if (isDir) {
      const _fpaths = await _getFilePaths(fpath);
      fpaths.push(..._fpaths);
      continue;
    }
    fpaths.push(fpath);
  }

  return fpaths;
};

const getStaticFPaths = async () => {
  const keys = await _getFilePaths();

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
  getFile, putFile, deleteFile, deleteFiles, deleteAllFiles, exists, mkdir, cp,
  getStaticFPaths,
};

export default localFile;
