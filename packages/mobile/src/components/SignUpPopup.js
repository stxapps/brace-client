import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, TouchableWithoutFeedback, BackHandler, Animated, Linking,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { WebView } from 'react-native-webview';

import { updatePopup, updateStacksAccess, updateUserData } from '../actions';
import {
  DOMAIN_NAME, APP_NAME, APP_ICON_NAME, APP_SCOPES, SIGN_UP_POPUP, SIGN_IN_POPUP,
} from '../types/const';
import { splitOnFirst, escapeDoubleQuotes } from '../utils';
import cache from '../utils/cache';
import { dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const stacksAccessSignUp = require('../../stacks-access-sign-up');

const SignUpPopup = () => {

  // This height is different to state.window.height,
  //   it's SafeAreaView's height so it takes insets and keyboard into account already.
  // state.window.height is from Dimensions, need to manually calculate safe height.
  const { height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isSignUpPopupShown);
  const viewId = useSelector(state => state.stacksAccess.viewId);
  const walletData = useSelector(state => state.stacksAccess.walletData);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [terminateCount, setTerminateCount] = useState(0);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const webView = useRef(null);
  const appIconUrl = useMemo(() => {
    return DOMAIN_NAME + '/' + APP_ICON_NAME;
  }, []);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onPopupCloseBtnClick = useCallback(() => {
    dispatch(updatePopup(SIGN_UP_POPUP, false));
  }, [dispatch]);

  const onSignInBtnClick = useCallback(() => {
    onPopupCloseBtnClick();
    dispatch(updatePopup(SIGN_IN_POPUP, true));
  }, [onPopupCloseBtnClick, dispatch]);

  const onGetSecretKeyBtnClick = useCallback((_viewId, _walletData) => {
    dispatch(updateStacksAccess({ viewId: _viewId, walletData: _walletData }));
  }, [dispatch]);

  const onUpdateViewIdBtnClick = useCallback((_viewId) => {
    dispatch(updateStacksAccess({ viewId: _viewId }));
  }, [dispatch]);

  const onBackedUpBtnClick = useCallback((data) => {
    onPopupCloseBtnClick();
    dispatch(updateUserData(data));
  }, [onPopupCloseBtnClick, dispatch]);

  const onMessage = useCallback(async (e) => {
    const data = e.nativeEvent.data;
    const [change, rest1] = splitOnFirst(data, ':');
    const [to, value] = splitOnFirst(rest1, ':');

    if (change === 'update' && to === 'signUpPopup' && value === 'false') {
      onPopupCloseBtnClick();
    } else if (change === 'update' && to === 'signInPopup' && value === 'true') {
      onSignInBtnClick();
    } else if (change === 'update' && to === 'viewId&walletData') {
      const [_viewId, _walletData] = splitOnFirst(value, ':');
      onGetSecretKeyBtnClick(_viewId, _walletData);
    } else if (change === 'update' && to === 'viewId') {
      onUpdateViewIdBtnClick(value);
    } else if (change === 'update' && to === 'userData') {
      onBackedUpBtnClick(JSON.parse(value));
    } else if (change === 'editor' && to === 'isReady' && value === 'true') {
      const escapedDomainName = escapeDoubleQuotes(DOMAIN_NAME);
      const escapedAppName = escapeDoubleQuotes(APP_NAME);
      const escapedAppIconUrl = escapeDoubleQuotes(appIconUrl);
      const escapedAppScopes = escapeDoubleQuotes(APP_SCOPES.join(','));
      const escapedViewId = escapeDoubleQuotes(viewId);
      const escapedWalletData = escapeDoubleQuotes(walletData);
      webView.current.injectJavaScript('window.StacksAccessSignUp.updateSignUpProps("' + escapedDomainName + '", "' + escapedAppName + '", "' + escapedAppIconUrl + '", "' + escapedAppScopes + '", "' + escapedViewId + '", "' + escapedWalletData + '"); true;');
    } else throw new Error(`Invalid data: ${data}`);
  }, [
    appIconUrl, viewId, walletData, onPopupCloseBtnClick, onSignInBtnClick,
    onGetSecretKeyBtnClick, onUpdateViewIdBtnClick, onBackedUpBtnClick,
  ]);

  const onShouldStartLoadWithRequest = useCallback((e) => {
    if (e.url.slice(0, 4) === 'http') {
      Linking.openURL(e.url);
      return false;
    }
    return true;
  }, []);

  const onContentProcessDidTerminate = useCallback(() => {
    setTerminateCount(c => c + 1);
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
      Animated.timing(popupAnim, { toValue: 1, ...dialogFMV.visible }).start();
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...dialogFMV.hidden }).start(() => {
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

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };

  // safeAreaHeight doesn't include status bar height, but minus it anyway.
  const statusBarHeight = 24;
  let appHeight = safeAreaHeight - statusBarHeight;
  const panelHeight = Math.min(576 - 40, appHeight * 0.9);

  const popupStyle = {
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ],
  };
  const bgStyle = { opacity: popupAnim };

  return (
    <View style={[tailwind('absolute inset-0'), canvasStyle]}>
      {/* No cancel on background of SignUpPopup */}
      <TouchableWithoutFeedback>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      <View style={tailwind('flex-1 items-center justify-center p-4')}>
        <Animated.View style={[tailwind('w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl'), popupStyle]}>
          <View style={{ height: panelHeight }}>
            <WebView key={`SUP_webView_key_${terminateCount}`} ref={webView} style={tailwind('flex-1')} source={cache('SUP_webView_source', { baseUrl: '', html: stacksAccessSignUp })} originWhitelist={cache('SUP_webView_originWhitelist', ['*'])} onMessage={onMessage} keyboardDisplayRequiresUserAction={false} hideKeyboardAccessoryView={true} textZoom={100} androidLayerType="hardware" onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} onContentProcessDidTerminate={onContentProcessDidTerminate} onRenderProcessGone={onContentProcessDidTerminate} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

export default React.memo(SignUpPopup);
