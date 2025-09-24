import platformWrapper from './platformWrapper';

const popupHistory = {
  states: [],
};

export const didChange = {
  doExtractContents: false,
  doDeleteOldLinksInTrash: false,
  doDescendingOrder: false,
  listNameMap: false,
  tagNameMap: false,
  purchases: false,
  newTagNameObjs: [],
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
  fetchedLnOrQts: [],
  fetchedLinkIds: [],
  doShowLoading: false,
  doForce: false,
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
  timeoutId: null,
  lastChangeDT: Date.now(),
};

const user = {
  hubUrl: null,
};

const vars = {
  popupHistory, cachedServerFPaths, scrollPanel, fetch, randomHouseworkTasks, iap,
  platform, importAllData, appState, user,
};
export default vars;
