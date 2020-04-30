import { FETCH_COMMIT } from '../types/actionTypes';

const initialState = {
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
