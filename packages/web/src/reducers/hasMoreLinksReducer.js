import { REHYDRATE } from 'redux-persist/constants';

const initialState = {};

const hasMoreLinksReducer = (state = initialState, action) => {

  // No longer used.

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  return state;
};

export default hasMoreLinksReducer;
