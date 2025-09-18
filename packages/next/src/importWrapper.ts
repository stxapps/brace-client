let walletApi;
const importWalletApi = async () => {
  if (walletApi) return;
  walletApi = await import('./apis/wallet');
};

export const walletCreateAccount = async (appData) => {
  await importWalletApi();
  return walletApi.createAccount(appData);
};

export const walletRestoreAccount = async (appData, secretKey) => {
  await importWalletApi();
  return walletApi.restoreAccount(appData, secretKey);
};

export const walletChooseAccount = async (walletData, accountIndex) => {
  await importWalletApi();
  return walletApi.chooseAccount(walletData, accountIndex);
};

let blockstack;
const importBlockstack = async () => {
  if (blockstack) return;
  blockstack = await import('./apis/blockstack');
};

export const blockstackEffect = async (effectObj, _action) => {
  await importBlockstack();
  return blockstack.effect(effectObj, _action);
};

let actionChunk;
const importActionChunk = async () => {
  if (actionChunk) return;
  actionChunk = await import('./actions/chunk');
};

export const updateHubAddr = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.updateHubAddr());
};

export const tryUpdateFetched = (payload) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.tryUpdateFetched(payload));
};

export const tryUpdateFetchedMore = (payload) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.tryUpdateFetchedMore(payload));
};

export const cleanUpSslts = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.cleanUpSslts());
};

export const extractContents = (listNames, ids) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.extractContents(listNames, ids));
};

export const tryUpdateExtractedContents = (payload) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.tryUpdateExtractedContents(payload));
};

export const runAfterFetchTask = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.runAfterFetchTask());
};

export const updateStgsAndInfo = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.updateStgsAndInfo());
};

export const updateSettingsDeleteStep = (_settingsFPaths) => async (
  dispatch, getState
) => {
  await importActionChunk();
  dispatch(actionChunk.updateSettingsDeleteStep(_settingsFPaths));
};

export const mergeSettingsDeleteStep = (_settingsFPaths) => async (
  dispatch, getState
) => {
  await importActionChunk();
  dispatch(actionChunk.mergeSettingsDeleteStep(_settingsFPaths));
};

export const tryUpdateInfo = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.tryUpdateInfo());
};

export const updateInfoDeleteStep = (_infoFPath) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.updateInfoDeleteStep(_infoFPath));
};

export const unpinLinks = (ids) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.unpinLinks(ids));
};

export const cleanUpPins = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.cleanUpPins());
};

export const updateCustomDataDeleteStep = (
  listName, fromLink, toLink, serverUnusedFPaths, localUnusedFPaths
) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.updateCustomDataDeleteStep(
    listName, fromLink, toLink, serverUnusedFPaths, localUnusedFPaths
  ));
};

export const updateTagDataTStep = (ids, valuesPerId) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.updateTagDataTStep(ids, valuesPerId));
};

export const cleanUpTags = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.cleanUpTags());
};
