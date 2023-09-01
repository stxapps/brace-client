import platformWrapper from './platformWrapper';

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
  scrollY: 0,
};

const fetch = {
  dt: 0,
};

const randomHouseworkTasks = {
  dt: 0,
};

const iap = {
  didGetProducts: false,
  updatedEventEmitter: null,
  errorEventEmitter: null,
};

const platform = {
  isReactNative: platformWrapper.isReactNative,
};

export const getCachedFPaths = () => {
  return cachedServerFPaths;
};

const importAllData = {
  didPick: false,
};

const appState = {
  lastChangeDT: Date.now(),
};

const vars = {
  cachedServerFPaths, scrollPanel, fetch, randomHouseworkTasks, iap, platform,
  importAllData, appState,
};
export default vars;
