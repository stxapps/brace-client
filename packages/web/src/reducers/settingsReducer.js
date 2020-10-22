import { FETCH_COMMIT, DELETE_ALL_DATA, RESET_STATE } from '../types/actionTypes';
import {
  MY_LIST,
} from '../types/const';

const initialState = {
  defaultListName: MY_LIST,
  doEncrypt: true,
  doExtractContent: true,
  doDeleteOldLinksInTrash: true,
  doDescendingOrder: true,
  doRemoveAfterClick: false,
  doExitBulkEditAfterAction: true,
};

export default (state = initialState, action) => {

  if (action.type === FETCH_COMMIT) {
    const { settings } = action.payload;
    return settings ? settings : state;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
