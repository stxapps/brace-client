import { Dirs, FileSystem } from 'react-native-file-access';

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

  const cachedContent = { content: undefined }; // Use undefined the same as in web.
  if (doExist) {
    cachedContent.content = `file://${fpath}`;
    cachedContent.contentUrl = cachedContent.content;
  }

  return cachedContent;
};

const getFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  const contents = [], contentUrls = [];
  for (const fpath of fpaths) {
    const { content, contentUrl } = await getFile(fpath, dir);
    contents.push(content);
    contentUrls.push(contentUrl);
  }
  return { fpaths, contents, contentUrls };
};

const putFile = async (fpath, content, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);

  const doExist = await FileSystem.exists(fpath);

  const cachedContent = { content: undefined };
  if (doExist) {
    cachedContent.content = `file://${fpath}`;
    cachedContent.contentUrl = cachedContent.content;
  }

  return cachedContent;
};

const putFiles = async (fpaths, _contents, dir = Dirs.DocumentDir) => {
  const contents = [], contentUrls = [];
  for (let i = 0; i < fpaths.length; i++) {
    const { content, contentUrl } = await putFile(fpaths[i], _contents[i], dir);
    contents.push(content);
    contentUrls.push(contentUrl);
  }
  return { fpaths, contents, contentUrls };
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

    const fnames = await FileSystem.ls(ddpath);
    for (const fname of fnames) await FileSystem.unlink(ddpath + '/' + fname);
  }
};

const listKeys = async (dir = Dirs.DocumentDir) => {
  // Different from web as there might be some other files too,
  //   can't just list all files but need to specify dirs.
  const dpaths = [IMAGES];

  const keys = [];
  for (const dpath of dpaths) {
    const ddpath = deriveFPath(dpath, dir);

    const doExist = await FileSystem.exists(ddpath);
    if (!doExist) continue;

    const fnames = await FileSystem.ls(ddpath);
    const fpaths = fnames.map(fname => dpath + '/' + fname);
    keys.push(...fpaths);
  }

  return keys;
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
  await FileSystem.cp(source, fpath);

  const cachedContent = { content: `file://${fpath}` };
  cachedContent.contentUrl = cachedContent.content;

  return cachedContent;
};

const localFile = {
  getFile, getFiles, putFile, putFiles, deleteFile, deleteFiles, deleteAllFiles,
  listKeys, exists, mkdir, cp,
};

export default localFile;
