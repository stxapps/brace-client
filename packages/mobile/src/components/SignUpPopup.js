import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, TouchableWithoutFeedback, BackHandler, Animated, Keyboard, Platform, Linking,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { updatePopup, updateUserData } from '../actions';
import {
  DOMAIN_NAME, APP_NAME, APP_ICON_NAME, APP_SCOPES, SIGN_UP_POPUP, SIGN_IN_POPUP,
} from '../types/const';
import { splitOnFirst, escapeDoubleQuotes } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import cache from '../utils/cache';
import { popupOpenAnimConfig, popupCloseAnimConfig } from '../types/animConfigs';

const stacksAccessSignUp = require('../../stacks-access-sign-up');

const SignUpPopup = () => {

  // This height is different to state.window.height,
  //   it's SafeAreaView's height so it takes insets and keyboard into account already.
  // state.window.height is from Dimensions, need to manually calculate safe height.
  const { height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isSignUpPopupShown);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const webView = useRef(null);
  const keyboardHeight = useRef(0);
  const keyboardDidShowListener = useRef(null);
  const keyboardDidHideListener = useRef(null);
  const appIconUrl = useMemo(() => {
    return DOMAIN_NAME + '/' + APP_ICON_NAME;
  }, []);
  const dispatch = useDispatch();

  const onPopupCloseBtnClick = useCallback(() => {
    dispatch(updatePopup(SIGN_UP_POPUP, false));
  }, [dispatch]);

  const onSignInBtnClick = useCallback(() => {
    onPopupCloseBtnClick();
    dispatch(updatePopup(SIGN_IN_POPUP, true));
  }, [onPopupCloseBtnClick, dispatch]);

  const onBackedUpBtnClick = useCallback((data) => {
    onPopupCloseBtnClick();
    dispatch(updateUserData(data));
  }, [onPopupCloseBtnClick, dispatch]);

  const onMessage = useCallback(async (e) => {
    const data = e.nativeEvent.data;
    const [change, rest1] = splitOnFirst(data, ':');
    const [to, value] = splitOnFirst(rest1, ':');

    if (change === 'update' && to === 'SignUpPopup' && value === 'false') {
      onPopupCloseBtnClick();
    } else if (change === 'update' && to === 'SignInPopup' && value === 'true') {
      onSignInBtnClick();
    } else if (change === 'update' && to === 'UserData') {
      onBackedUpBtnClick(JSON.parse(value));
    } else if (change === 'editor' && to === 'isReady' && value === 'true') {
      const escapedDomainName = escapeDoubleQuotes(DOMAIN_NAME);
      const escapedAppName = escapeDoubleQuotes(APP_NAME);
      const escapedAppIconUrl = escapeDoubleQuotes(appIconUrl);
      const escapedAppScopes = escapeDoubleQuotes(APP_SCOPES.join(','));
      webView.current.injectJavaScript('window.StacksAccessSignUp.updateSignUpProps("' + escapedDomainName + '", "' + escapedAppName + '", "' + escapedAppIconUrl + '", "' + escapedAppScopes + '"); true;');
    } else throw new Error(`Invalid data: ${data}`);
  }, [appIconUrl, onPopupCloseBtnClick, onSignInBtnClick, onBackedUpBtnClick]);

  const onShouldStartLoadWithRequest = useCallback((e) => {
    if (e.url.slice(0, 4) === 'http') {
      Linking.openURL(e.url);
      return false;
    }
    return true;
  }, []);

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

  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardHeight.current = e.endCoordinates.height;
    });
    keyboardDidHideListener.current = Keyboard.addListener('keyboardDidHide', () => {
      keyboardHeight.current = 0;
    });

    return () => {
      keyboardDidShowListener.current.remove();
      keyboardDidHideListener.current.remove();
    };
  }, []);

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
  let appHeight = safeAreaHeight - statusBarHeight;
  if (Platform.OS === 'ios' && keyboardHeight.current > 0) {
    appHeight -= keyboardHeight.current;
  }
  const panelHeight = Math.min(576 - 40, appHeight * 0.9);

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
      <Animated.View style={[tailwind('w-full max-w-sm bg-white rounded-lg shadow-xl overflow-hidden'), popupStyle]}>
        <View style={{ height: panelHeight }}>
          <WebView ref={webView} style={tailwind('flex-1')} source={cache('SUP_webView_source', { baseUrl: '', html: stacksAccessSignUp })} originWhitelist={cache('SUP_webView_originWhitelist', ['*'])} onMessage={onMessage} keyboardDisplayRequiresUserAction={false} textZoom={100} androidLayerType="hardware" onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} />
        </View>
      </Animated.View>
    </View>
  );
};

export default React.memo(SignUpPopup);
