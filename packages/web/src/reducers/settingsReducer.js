import { FETCH_COMMIT, RESET_STATE } from '../types/actionTypes';
import {
  MY_LIST,
} from '../types/const';

const initialState = {
  defaultListName: MY_LIST,
  doEncrypt: true,
  doBeautify: true,
  doDeleteOldLinksInTrash: true,
  doDescendingOrder: true,
  doRemoveAfterClick: false,
};

export default (state = initialState, action) => {

  if (action.type === FETCH_COMMIT) {
    const { settings } = action.payload;
    return settings ? settings : state;
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
