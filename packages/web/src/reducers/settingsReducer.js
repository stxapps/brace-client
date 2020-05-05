import { FETCH_COMMIT } from '../types/actionTypes';
import {
  MY_LIST,
} from '../types/const';

const initialState = {
  defaultListName: MY_LIST,
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

  return state;
};
