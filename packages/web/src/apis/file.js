import idb from '../idbWrapper';
import { CD_ROOT } from '../types/const';
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

  let content = await idb.get(fpath);
  if (isUint8Array(content)) content = new Blob([content]);

  const cachedContent = { content };
  if (isBlob(content)) cachedContent.contentUrl = URL.createObjectURL(content);

  cachedContents[fpath] = cachedContent;
  return cachedContent;
};

const getFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  const contents = [], contentUrls = [];
  for (let fpath of fpaths) {
    const { content, contentUrl } = await getFile(fpath, dir);
    contents.push(content);
    contentUrls.push(contentUrl);
  }
  return { fpaths, contents, contentUrls };
};

const putFile = async (fpath, content, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);

  if (isUint8Array(content)) content = new Blob([content]);
  await idb.set(fpath, content);

  if (fpath in cachedContents && 'contentUrl' in cachedContents[fpath]) {
    URL.revokeObjectURL(cachedContents[fpath].contentUrl);
  }

  const cachedContent = { content };
  if (isBlob(content)) cachedContent.contentUrl = URL.createObjectURL(content);

  cachedContents[fpath] = cachedContent;
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
  await idb.del(fpath);

  if (fpath in cachedContents && 'contentUrl' in cachedContents[fpath]) {
    URL.revokeObjectURL(cachedContents[fpath].contentUrl);
  }
  delete cachedContents[fpath];
};

const deleteFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  for (let fpath of fpaths) {
    await deleteFile(fpath, dir);
  }
};

const deleteAllFiles = async () => {
  await idb.clear();

  for (const fpath in cachedContents) {
    if ('contentUrl' in cachedContents[fpath]) {
      URL.revokeObjectURL(cachedContents[fpath].contentUrl);
    }
  }
  cachedContents = {};
};

const listKeys = () => {
  return idb.keys();
};

const file = {
  getFile, getFiles, putFile, putFiles, deleteFile, deleteFiles, deleteAllFiles,
  listKeys,
};

export default file;
