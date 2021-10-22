import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, TouchableWithoutFeedback, BackHandler, Animated, Keyboard, Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';

import { updatePopup, updateUserData } from '../actions';
import {
  DOMAIN_NAME, APP_NAME, APP_ICON_NAME, APP_SCOPES, SIGN_UP_POPUP, SIGN_IN_POPUP,
} from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { popupOpenAnimConfig, popupCloseAnimConfig } from '../types/animConfigs';

const SignUpPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isSignUpPopupShown);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const appIconUrl = useMemo(() => {
    return DOMAIN_NAME + '/' + APP_ICON_NAME;
  }, []);
  const dispatch = useDispatch();

  const onPopupCloseBtnClick = useCallback(() => {
    dispatch(updatePopup(SIGN_UP_POPUP, false));
  }, [dispatch]);

  const onSignInBtnClick = () => {
    onPopupCloseBtnClick();
    dispatch(updatePopup(SIGN_IN_POPUP, true));
  };

  const onBackedUpBtnClick = (data) => {
    onPopupCloseBtnClick();
    dispatch(updateUserData(data));
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onPopupCloseBtnClick();
            return true;
          }
        );
      }
    } else {
      if (popupBackHandler.current) {
        popupBackHandler.current.remove();
        popupBackHandler.current = null;
      }
    }
  }, [onPopupCloseBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...popupOpenAnimConfig }).start();
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupCloseAnimConfig }).start(() => {
        if (didMount) setDidCloseAnimEnd(true);
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [isShown, popupAnim, registerPopupBackHandler]);

  if (derivedIsShown !== isShown) {
    if (derivedIsShown && !isShown) {
      if (didCloseAnimEnd) {
        setDidCloseAnimEnd(false);
      }
    }
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  const statusBarHeight = 24;
  const appHeight = safeAreaHeight - statusBarHeight;
  const panelHeight = appHeight * 0.9;

  const canvasStyle = { paddingLeft: 16 + insets.left, paddingRight: 16 + insets.right };
  const popupStyle = {
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ],
  };
  const bgStyle = { opacity: popupAnim };

  return (
    <View style={[tailwind('absolute inset-0 items-center justify-center'), canvasStyle]}>
      <TouchableWithoutFeedback onPress={onPopupCloseBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[tailwind('w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden'), popupStyle]}>
        <View style={{ height: panelHeight }}>

        </View>
      </Animated.View>
    </View>
  );
};

export default React.memo(SignUpPopup);
