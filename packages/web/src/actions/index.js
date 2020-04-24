import { UserSession, AppConfig } from 'blockstack';

import { INIT, UPDATE_WINDOW, UPDATE_HISTORY_POSITION,
         UPDATE_USER,
         UPDATE_POPUP } from '../types/actions';
import { BACK_DECIDER, BACK_POPUP } from '../types/const';

const appConfig = new AppConfig()
const userSession = new UserSession({ appConfig: appConfig })

export const init = () => async (dispatch, getState) => {
  dispatch({
    type: INIT,
    payload: {
      isUserSignedIn: userSession.isUserSignedIn(),
      href: window.location.href,
    }
  });

  window.addEventListener('popstate', function(e) {
    dispatch(popHistoryState());
  });
};

export const updateHistoryPosition = historyPosition => {
  return {
    type: UPDATE_HISTORY_POSITION,
    payload: historyPosition,
  };
}

export const popHistoryState = (e) => async (dispatch, getState) => {

  let historyPosition = window.history.state;
  if (historyPosition === BACK_DECIDER &&
      getState().window.historyPosition === BACK_POPUP) {

    // if back button pressed and there is a popup shown
    if (getState().display.isPopupShown) {
      // disable back button by forcing to go forward in history states
      // No need to update state here as window.history.go triggers popstate event
      dispatch({
        type: 'UPDATE_POPUP',
        payload: false
      })

      window.history.go(1);
      return
    }

    // No popup shown, go back one more
    // need to update state first before going off so that when back know that back from somewhere else
    dispatch({
      type: UPDATE_WINDOW,
      payload: {
        href: window.location.href,
        historyPosition: null,
      },
    });

    window.history.go(-1);
    return;
  }

  if (historyPosition === BACK_DECIDER) {
    // A page forwards to BACK_DECIDER, forward one more to BACK_POPUP
    // No need to update state here as window.history.go triggers popstate event
    window.history.go(1);
    return;
  }

  dispatch({
    type: UPDATE_WINDOW,
    payload: {
      href: window.location.href,
      historyPosition: historyPosition,
    },
  });
};

export const signIn = () => {
  return {
    type: UPDATE_USER,
    payload: {
      isUserSignedIn: true,
    },
  };
}

export const signOut = () => {
  return {
    type: UPDATE_USER,
    payload: {
      isUserSignedIn: false,
    },
  };
}

export const updatePopup = isShown => {
  return {
    type: UPDATE_POPUP,
    payload: isShown,
  }
}
