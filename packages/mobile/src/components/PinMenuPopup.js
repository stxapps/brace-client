import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup, unpinLinks, movePinnedLink } from '../actions';
import {
  PIN_MENU_POPUP, PIN_LEFT, PIN_RIGHT, PIN_UP, PIN_DOWN, UNPIN,
  SWAP_LEFT, SWAP_RIGHT, LAYOUT_LIST, SM_WIDTH,
} from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets } from '.';
import { computePosition, createLayouts, getOriginTranslate } from './MenuPopupRenderer';

const PinMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isPinMenuPopupShown);
  const anchorPosition = useSelector(
    state => state.display.pinMenuPopupPosition
  );
  const selectingLinkId = useSelector(state => state.display.selectingLinkId);
  const layoutType = useSelector(state => state.localSettings.layoutType);
  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(PIN_MENU_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onMenuPopupClick = (text) => {
    if (!text || didClick.current) return;

    onCancelBtnClick();
    if ([PIN_LEFT, PIN_UP].includes(text)) {
      dispatch(movePinnedLink(selectingLinkId, SWAP_LEFT));
    } else if ([PIN_RIGHT, PIN_DOWN].includes(text)) {
      dispatch(movePinnedLink(selectingLinkId, SWAP_RIGHT));
    } else if ([UNPIN].includes(text)) {
      dispatch(unpinLinks([selectingLinkId]));
    } else {
      console.log(`In PinMenuPopup, invalid text: ${text}`);
    }

    didClick.current = true;
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
        if (didMount) {
          setPopupSize(null);
          setDidCloseAnimEnd(true);
        }
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

  let menu = [PIN_LEFT, PIN_RIGHT, UNPIN];
  if (layoutType === LAYOUT_LIST || safeAreaWidth < SM_WIDTH) {
    menu = [PIN_UP, PIN_DOWN, UNPIN];
  }

  const buttons = (
    <React.Fragment>
      <View style={tailwind('pl-4 pr-4 pt-1 h-11 flex-row justify-start items-center')}>
        <Text style={tailwind('text-sm text-gray-600 font-semibold text-left')} numberOfLines={1} ellipsizeMode="tail">Manage pin</Text>
      </View>
      {menu.map(text => {
        return (
          <TouchableOpacity key={text} onPress={() => onMenuPopupClick(text)} style={tailwind('py-2.5 pl-4 pr-4 w-full')}>
            <Text style={tailwind('text-sm text-gray-700 font-normal text-left')} numberOfLines={1} ellipsizeMode="tail">{text}</Text>
          </TouchableOpacity>
        );
      })}
    </React.Fragment>
  );

  let popupClassNames = 'pb-1 absolute min-w-32 max-w-64 bg-white border border-gray-100 rounded-lg shadow-xl';
  let panel;
  let bgStyle = { opacity: 0 };
  if (popupSize) {

    const layouts = createLayouts(
      derivedAnchorPosition,
      { width: popupSize.width, height: popupSize.height },
      { width: safeAreaWidth + insets.left, height: safeAreaHeight + insets.top },
    );
    const popupPosition = computePosition(layouts, null, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const { startX, startY } = getOriginTranslate(
      topOrigin, leftOrigin, popupSize.width, popupSize.height
    );

    const popupStyle = { top, left, opacity: popupAnim, transform: [] };
    popupStyle.transform.push({
      translateX: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [startX, 0],
      }),
    });
    popupStyle.transform.push({
      translateY: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [startY, 0],
      }),
    });
    popupStyle.transform.push({
      scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
    });
    /* @ts-ignore */
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
    <View style={tailwind('absolute inset-0 bg-transparent shadow-xl z-40')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

export default React.memo(PinMenuPopup);
