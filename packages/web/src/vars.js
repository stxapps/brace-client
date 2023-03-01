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

const runAfterFetchTask = {
  didRun: false,
};

const randomHouseworkTasks = {
  dt: 0,
};

export const getCachedFPaths = () => {
  return cachedServerFPaths;
};

const vars = {
  cachedServerFPaths, scrollPanel, runAfterFetchTask, randomHouseworkTasks,
};
export default vars;
