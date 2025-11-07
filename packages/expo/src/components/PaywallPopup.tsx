import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import { updateSettingsPopup, updateSettingsViewId } from '../actions/chunk';
import {
  PAYWALL_POPUP, SETTINGS_VIEW_IAP, FEATURE_PIN, FEATURE_APPEARANCE, FEATURE_CUSTOM,
  FEATURE_LOCK, FEATURE_TAG, FEATURE_ADD,
} from '../types/const';
import { dialogFMV } from '../types/animConfigs';

import { useSafeAreaInsets, useTailwind } from '.';
import Text from './CustomText';

const PaywallPopup = () => {

  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isPaywallPopupShown);
  const feature = useSelector(state => state.display.paywallFeature);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(PAYWALL_POPUP, false));
    didClick.current = true;
  }, [dispatch]);

  const onOkBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();

    dispatch(updateSettingsViewId(SETTINGS_VIEW_IAP, false));
    dispatch(updateSettingsPopup(true));
    didClick.current = true;
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onCancelBtnClick();
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
  }, [onCancelBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...dialogFMV.visible }).start();
      didClick.current = false;
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...dialogFMV.hidden }).start(() => {
        requestAnimationFrame(() => {
          if (didMount) setDidCloseAnimEnd(true);
        });
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [isShown, popupAnim, registerPopupBackHandler]);

  if (derivedIsShown !== isShown) {
    if (derivedIsShown && !isShown) setDidCloseAnimEnd(false);
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  let featureText = 'This is an extra feature.';
  if (feature === FEATURE_PIN) {
    featureText = 'Pin to the top is an extra feature.';
  } else if (feature === FEATURE_APPEARANCE) {
    featureText = 'Dark appearance is an extra feature.';
  } else if (feature === FEATURE_CUSTOM) {
    featureText = 'Change title & image are an extra feature.';
  } else if (feature === FEATURE_LOCK) {
    featureText = 'Lock lists are an extra feature.';
  } else if (feature === FEATURE_TAG) {
    featureText = 'Tags are an extra feature.';
  } else if (feature === FEATURE_ADD) {
    featureText = 'Advanced mode is an extra feature.';
  }

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };
  const popupStyle = {
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ],
  };
  const bgStyle = { opacity: popupAnim };

  const cancelBtnStyle = { paddingTop: 7, paddingBottom: 7 };

  return (
    <View style={[tailwind('absolute inset-0 z-40'), canvasStyle]}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      <View style={tailwind('flex-1 items-center justify-end px-4 pt-4 pb-20 sm:justify-center sm:p-0')}>
        <Animated.View style={[tailwind('w-full max-w-lg rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl sm:my-8 sm:p-6'), popupStyle]}>
          <View style={tailwind('items-center justify-start')}>
            <View style={tailwind('h-12 w-12 items-center justify-center rounded-full bg-gray-100')}>
              <Svg width={24} height={24} style={tailwind('font-normal text-gray-600')} fill="currentColor" viewBox="0 0 20 20">
                <Path d="M3 1C2.73478 1 2.48043 1.10536 2.29289 1.29289C2.10536 1.48043 2 1.73478 2 2C2 2.26522 2.10536 2.51957 2.29289 2.70711C2.48043 2.89464 2.73478 3 3 3H4.22L4.525 4.222C4.52803 4.23607 4.53136 4.25007 4.535 4.264L5.893 9.694L5 10.586C3.74 11.846 4.632 14 6.414 14H15C15.2652 14 15.5196 13.8946 15.7071 13.7071C15.8946 13.5196 16 13.2652 16 13C16 12.7348 15.8946 12.4804 15.7071 12.2929C15.5196 12.1054 15.2652 12 15 12H6.414L7.414 11H14C14.1857 10.9999 14.3676 10.9481 14.5255 10.8504C14.6834 10.7528 14.811 10.6131 14.894 10.447L17.894 4.447C17.9702 4.29458 18.0061 4.12522 17.9985 3.95501C17.9908 3.78479 17.9398 3.61935 17.8502 3.47439C17.7606 3.32944 17.6355 3.20977 17.4867 3.12674C17.3379 3.04372 17.1704 3.00009 17 3H6.28L5.97 1.757C5.91583 1.54075 5.79095 1.34881 5.61521 1.21166C5.43946 1.0745 5.22293 1.00001 5 1H3ZM16 16.5C16 16.8978 15.842 17.2794 15.5607 17.5607C15.2794 17.842 14.8978 18 14.5 18C14.1022 18 13.7206 17.842 13.4393 17.5607C13.158 17.2794 13 16.8978 13 16.5C13 16.1022 13.158 15.7206 13.4393 15.4393C13.7206 15.158 14.1022 15 14.5 15C14.8978 15 15.2794 15.158 15.5607 15.4393C15.842 15.7206 16 16.1022 16 16.5ZM6.5 18C6.89782 18 7.27936 17.842 7.56066 17.5607C7.84196 17.2794 8 16.8978 8 16.5C8 16.1022 7.84196 15.7206 7.56066 15.4393C7.27936 15.158 6.89782 15 6.5 15C6.10218 15 5.72064 15.158 5.43934 15.4393C5.15804 15.7206 5 16.1022 5 16.5C5 16.8978 5.15804 17.2794 5.43934 17.5607C5.72064 17.842 6.10218 18 6.5 18Z" />
              </Svg>
            </View>
            <View style={tailwind('mt-3 sm:mt-5')}>
              <Text style={tailwind('text-center text-lg font-medium leading-6 text-gray-900')}>Purchase a subscription</Text>
              <View style={tailwind('mt-2')}>
                <Text style={tailwind('text-center text-sm font-normal text-gray-500')}>{featureText} Please purchase a subscription to support us and unlock all extra features.</Text>
              </View>
            </View>
          </View>
          <View style={tailwind('mt-5 sm:mt-6 sm:flex-row sm:items-center sm:justify-center')}>
            <TouchableOpacity onPress={onOkBtnClick} style={tailwind('w-full rounded-full border border-gray-800 bg-gray-800 py-2 sm:w-40')}>
              <Text style={tailwind('text-center text-base font-medium text-white sm:text-sm')}>More info</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancelBtnClick} style={[tailwind('mt-3 w-full rounded-full border border-gray-400 bg-white sm:mt-0 sm:ml-14 sm:w-40'), cancelBtnStyle]}>
              <Text style={tailwind('text-center text-base font-normal text-gray-500 sm:text-sm')}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

export default React.memo(PaywallPopup);
