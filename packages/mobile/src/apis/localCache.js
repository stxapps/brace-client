import { FileSystem, Dirs, Util } from 'react-native-file-access';

import { LINKS, SETTINGS, INFO, PINS, TAGS, DOT_JSON, UTF8 } from '../types/const';

const deriveFPath = (fpath) => {
  return Dirs.CacheDir + '/' + fpath;
};

const getFile = async (fpath, dangerouslyIgnoreUndefined = false) => {
  fpath = deriveFPath(fpath);

  let content; // If no key, val will be undefined.
  try {
    const doExist = await FileSystem.exists(fpath);
    if (doExist) content = await FileSystem.readFile(fpath, UTF8);
  } catch (error) {
    console.log('In localCache.getFile, error:', error);
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
  fpath = deriveFPath(fpath);
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

  try {
    const dpath = Util.dirname(fpath);
    let doExist = await FileSystem.exists(dpath);
    if (!doExist) await FileSystem.mkdir(dpath);

    doExist = await FileSystem.exists(fpath);
    if (doExist) await FileSystem.unlink(fpath);

    await FileSystem.writeFile(fpath, content, UTF8);
  } catch (error) {
    console.log('In localCache.putFile, error:', error);
  }
};

const deleteFile = async (fpath) => {
  fpath = deriveFPath(fpath);

  try {
    const doExist = await FileSystem.exists(fpath);
    if (doExist) await FileSystem.unlink(fpath);
  } catch (error) {
    console.log('In localCache.deleteFile, error:', error);
  }
};

const deleteAllFiles = async () => {
  // Different from web as there might be some other files too,
  //   can't just delete all files but need to specify dirs.
  const dpaths = [LINKS, PINS, TAGS];

  for (const dpath of dpaths) {
    const ddpath = deriveFPath(dpath);

    try {
      const doExist = await FileSystem.exists(ddpath);
      if (doExist) await FileSystem.unlink(ddpath);
    } catch (error) {
      console.log('In localCache.deleteAllFiles, error:', error);
    }
  }

  try {
    const dpath = Dirs.CacheDir;
    const fnames = await FileSystem.ls(dpath);
    for (const fname of fnames) {
      if (![SETTINGS, INFO].some(el => fname.startsWith(el))) continue;
      if (!fname.endsWith(DOT_JSON)) continue;

      const fpath = `${dpath}/${fname}`;
      await FileSystem.unlink(fpath);
    }
  } catch (error) {
    console.log('In localCache.deleteAllFiles, 2nd error:', error);
  }
};

const localCache = { getFile, putFile, deleteFile, deleteAllFiles };

export default localCache;
