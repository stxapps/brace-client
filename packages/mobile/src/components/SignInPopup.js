import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { updatePopup, updateUserData } from '../actions';
import {
  DOMAIN_NAME, APP_NAME, APP_ICON_NAME, APP_SCOPES, SIGN_UP_POPUP, SIGN_IN_POPUP,
} from '../types/const';

const SignInPopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isSignInPopupShown);
  const appIconUrl = useMemo(() => {
    return DOMAIN_NAME + '/' + APP_ICON_NAME;
  }, []);
  const dispatch = useDispatch();

  const onPopupCloseBtnClick = () => {
    dispatch(updatePopup(SIGN_IN_POPUP, false));
  };

  const onSignUpBtnClick = () => {
    onPopupCloseBtnClick();
    dispatch(updatePopup(SIGN_UP_POPUP, true));
  };

  const onChooseAccountBtnClick = (data) => {
    onPopupCloseBtnClick();
    dispatch(updateUserData(data));
  };

  if (!isShown) return null;

  const panelHeight = Math.min(576, safeAreaHeight * 0.9);

  return (
    <React.Fragment>

    </React.Fragment>
  );
};

export default React.memo(SignInPopup);
