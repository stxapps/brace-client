let files = {};

const readFile = async (path) => {
  return files[path];
};

const writeFile = async (path, content) => {
  files[path] = content;
};

const unlink = async (path) => {
  const newFiles = {}
  for (const k in files) {
    if (k === path) continue;
    newFiles[k] = files[k];
  }
  files = newFiles;
};

const unlinkAll = async () => {
  files = {};
};

export const Dirs = { DocumentDir: 'DocumentDir' };
export const FileSystem = { readFile, writeFile, unlink, unlinkAll };
