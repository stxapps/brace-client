import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
  Linking,
} from 'react-native';

import { useSelector, useDispatch } from '../store';
import { signOut, updatePopup, refreshFetched } from '../actions';
import {
  updateSettingsPopup, updateSettingsViewId, lockCurrentList,
} from '../actions/chunk';
import {
  DOMAIN_NAME, HASH_SUPPORT, PROFILE_POPUP, SETTINGS_VIEW_ACCOUNT, LOCK, UNLOCKED,
} from '../types/const';
import { getCurrentLockListStatus, getCanChangeListNames } from '../selectors';
import { popupFMV } from '../types/animConfigs';
import { computePositionTranslate } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const TopBarProfilePopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isProfilePopupShown);
  const anchorPosition = useSelector(state => state.display.profilePopupPosition);
  const lockStatus = useSelector(state => getCurrentLockListStatus(state));
  const canChangeListNames = useSelector(state => getCanChangeListNames(state));
  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(PROFILE_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onRefreshBtnClick = () => {
    dispatch(updatePopup(PROFILE_POPUP, false));
    dispatch(refreshFetched(true, true));
  };

  const onSettingsBtnClick = () => {
    dispatch(updatePopup(PROFILE_POPUP, false));

    dispatch(updateSettingsViewId(SETTINGS_VIEW_ACCOUNT, true));
    dispatch(updateSettingsPopup(true));
  };

  const onSupportBtnClick = () => {
    Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT);
    setTimeout(() => {
      dispatch(updatePopup(PROFILE_POPUP, false));
    }, 100);
  };

  const onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    //dispatch(updatePopup(PROFILE_POPUP, false));
    dispatch(signOut());
  };

  const onLockBtnClick = () => {
    dispatch(updatePopup(PROFILE_POPUP, false));
    // Wait for the close animation to finish first
    setTimeout(() => dispatch(lockCurrentList()), 100);
  };

  const onPopupLayout = (e) => {
    if (!popupSize) {
      setPopupSize(e.nativeEvent.layout);
    }
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
    if (isShown && popupSize) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
    }
  }, [isShown, popupSize, popupAnim]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      didClick.current = false;
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        requestAnimationFrame(() => {
          if (didMount) {
            setPopupSize(null);
            setDidCloseAnimEnd(true);
          }
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

  if (anchorPosition && anchorPosition !== derivedAnchorPosition) {
    setDerivedAnchorPosition(anchorPosition);
  }

  if (!derivedAnchorPosition) return null;

  const supportAndSignOutButtons = (
    <React.Fragment>
      <TouchableOpacity onPress={onSupportBtnClick} style={tailwind('w-full py-2.5 pl-4')}>
        <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>Support</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSignOutBtnClick} style={tailwind('w-full py-2.5 pl-4')}>
        <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>Sign out</Text>
      </TouchableOpacity>
    </React.Fragment>
  );

  let buttons;
  if (!canChangeListNames) {
    buttons = supportAndSignOutButtons;
  } else {
    buttons = (
      <React.Fragment>
        {lockStatus === UNLOCKED && <TouchableOpacity onPress={onLockBtnClick} style={tailwind('w-full py-2.5 pl-4')}>
          <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>{LOCK}</Text>
        </TouchableOpacity>}
        <TouchableOpacity onPress={onRefreshBtnClick} style={tailwind('w-full py-2.5 pl-4')}>
          <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettingsBtnClick} style={tailwind('w-full py-2.5 pl-4')}>
          <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>Settings</Text>
        </TouchableOpacity>
        {supportAndSignOutButtons}
      </React.Fragment>
    );
  }

  const popupClassNames = 'absolute min-w-28 rounded-lg bg-white py-2 shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800';

  let panel, bgStyle = { opacity: 0 };
  if (popupSize) {
    const posTrn = computePositionTranslate(
      derivedAnchorPosition,
      { width: popupSize.width, height: popupSize.height },
      { width: safeAreaWidth, height: safeAreaHeight },
      null,
      insets,
      8,
    );

    const popupStyle = {
      top: posTrn.top, left: posTrn.left, opacity: popupAnim, transform: [],
    };
    popupStyle.transform.push({
      translateX: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [posTrn.startX, 0],
      }),
    });
    popupStyle.transform.push({
      translateY: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [posTrn.startY, 0],
      }),
    });
    popupStyle.transform.push({
      scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
    });

    /* @ts-expect-error */
    bgStyle = { opacity: popupAnim };

    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), popupStyle]}>
        {buttons}
      </Animated.View>
    );
  } else {
    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { top: safeAreaHeight + 256, left: safeAreaWidth + 256 }]}>
        {buttons}
      </Animated.View>
    );
  }

  return (
    <View style={tailwind('absolute inset-0 z-40')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

export default React.memo(TopBarProfilePopup);
