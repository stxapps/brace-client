import * as blockstack from './apis/blockstack';
import * as actionChunk from './actions/chunk';

export const blockstackEffect = async (effectObj, _action) => {
  const res = await blockstack.effect(effectObj, _action);
  return res;
};

export const updateHubAddr = () => async (dispatch, getState) => {
  dispatch(actionChunk.updateHubAddr());
};

export const tryUpdateFetched = (payload) => async (dispatch, getState) => {
  dispatch(actionChunk.tryUpdateFetched(payload));
};

export const tryUpdateFetchedMore = (payload) => async (dispatch, getState) => {
  dispatch(actionChunk.tryUpdateFetchedMore(payload));
};

export const cleanUpSslts = () => async (dispatch, getState) => {
  dispatch(actionChunk.cleanUpSslts());
};

export const extractContents = (listNames, ids) => async (dispatch, getState) => {
  dispatch(actionChunk.extractContents(listNames, ids));
};

export const tryUpdateExtractedContents = (payload) => async (dispatch, getState) => {
  dispatch(actionChunk.tryUpdateExtractedContents(payload));
};

export const runAfterFetchTask = () => async (dispatch, getState) => {
  dispatch(actionChunk.runAfterFetchTask());
};

export const updateSettingsPopup = (
  isShown, doCheckEditing = false, popupToReplace = null
) => async (dispatch, getState) => {
  dispatch(actionChunk.updateSettingsPopup(isShown, doCheckEditing, popupToReplace));
};

export const updateStgsAndInfo = () => async (dispatch, getState) => {
  dispatch(actionChunk.updateStgsAndInfo());
};

export const updateSettingsDeleteStep = (_settingsFPaths) => async (
  dispatch, getState
) => {
  dispatch(actionChunk.updateSettingsDeleteStep(_settingsFPaths));
};

export const mergeSettingsDeleteStep = (_settingsFPaths) => async (
  dispatch, getState
) => {
  dispatch(actionChunk.mergeSettingsDeleteStep(_settingsFPaths));
};

export const tryUpdateInfo = () => async (dispatch, getState) => {
  dispatch(actionChunk.tryUpdateInfo());
};

export const updateInfoDeleteStep = (_infoFPath) => async (dispatch, getState) => {
  dispatch(actionChunk.updateInfoDeleteStep(_infoFPath));
};

export const unpinLinks = (ids) => async (dispatch, getState) => {
  dispatch(actionChunk.unpinLinks(ids));
};

export const cleanUpPins = () => async (dispatch, getState) => {
  dispatch(actionChunk.cleanUpPins());
};

export const updateCustomDataDeleteStep = (
  listName, fromLink, toLink, serverUnusedFPaths, localUnusedFPaths
) => async (dispatch, getState) => {
  dispatch(actionChunk.updateCustomDataDeleteStep(
    listName, fromLink, toLink, serverUnusedFPaths, localUnusedFPaths
  ));
};

export const updateTagDataFromAddLinks = (successIds) => async (
  dispatch, getState
) => {
  dispatch(actionChunk.updateTagDataFromAddLinks(successIds));
};

export const updateTagDataTStep = (ids, valuesPerId) => async (dispatch, getState) => {
  dispatch(actionChunk.updateTagDataTStep(ids, valuesPerId));
};

export const cleanUpTags = () => async (dispatch, getState) => {
  dispatch(actionChunk.cleanUpTags());
};
