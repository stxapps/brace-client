import { REHYDRATE } from 'redux-persist/constants';

/* {
  [list-name-1]: {
    [fetch-more-id-1]: false,
    [fetch-more-id-2]: false,
    ...
  },
  [list-name-2]: {
    ...
  },
  ...
} */
const initialState = {};

const isFetchMoreInterrupted = (state = initialState, action) => {

  // No longer used.

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  return state;
};

export default isFetchMoreInterrupted;
