export const didChange = {
  doExtractContents: false,
  doDeleteOldLinksInTrash: false,
  doDescendingOrder: false,
  listNameMap: false,
  purchases: false,
};

export const cachedServerFPaths = {
  fpaths: null,
};

const scrollPanel = {
  contentHeight: 0,
  layoutHeight: 0,
  pageYOffset: 0,
};

const fetch = {
  dt: 0,
};

const randomHouseworkTasks = {
  dt: 0,
};

const platform = {
  isReactNative: false,
};

export const getCachedFPaths = () => {
  return cachedServerFPaths;
};

const vars = { cachedServerFPaths, scrollPanel, fetch, randomHouseworkTasks, platform };
export default vars;
