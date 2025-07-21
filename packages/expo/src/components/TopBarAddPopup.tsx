import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, TextInput, Animated,
  BackHandler, Platform,
} from 'react-native';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import { updateLinkEditor, addLink } from '../actions/chunk';
import { ADD_POPUP, NO_URL, ASK_CONFIRM_URL, URL_MSGS, BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';
import { isObject, validateUrl, getRect } from '../utils';
import { popupFMV } from '../types/animConfigs';
import { computePositionTranslate } from '../utils/popup';

import { getTopBarSizes, useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const TopBarAddPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isAddPopupShown);
  const addAnchorPosition = useSelector(state => state.display.addPopupPosition);
  const url = useSelector(state => state.linkEditor.url);
  const msg = useSelector(state => state.linkEditor.msg);
  const isAskingConfirm = useSelector(state => state.linkEditor.isAskingConfirm);
  const themeMode = useSelector(state => getThemeMode(state));

  const anchorPosition = useMemo(() => {
    let pos = addAnchorPosition;
    if (isShown && !isObject(pos)) {
      const { headerPaddingX, commandsWidth } = getTopBarSizes(safeAreaWidth);

      const x = insets.left + safeAreaWidth - commandsWidth - (headerPaddingX / 2);
      const y = insets.top + 12 + 42;
      pos = getRect(x, y, 66, 32);
    }
    return pos;
  }, [safeAreaWidth, insets, isShown, addAnchorPosition]);

  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const addInput = useRef(null);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(ADD_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onOkBtnClick = () => {
    if (didClick.current) return;

    const tmUrl = url.trim();
    if (!isAskingConfirm) {
      const urlValidatedResult = validateUrl(tmUrl);
      if (urlValidatedResult === NO_URL) {
        dispatch(updateLinkEditor(
          { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: false }
        ));
        return;
      }
      if (urlValidatedResult === ASK_CONFIRM_URL) {
        dispatch(updateLinkEditor(
          { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: true }
        ));
        return;
      }
    }

    dispatch(addLink(tmUrl, null, null));
    dispatch(updatePopup(ADD_POPUP, false));
    didClick.current = true;
  };

  const onAddInputChange = (e) => {
    dispatch(updateLinkEditor(
      { url: e.nativeEvent.text, msg: '', isAskingConfirm: false }
    ));
  };

  const onAddInputKeyPress = () => {
    onOkBtnClick();
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
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start(() => {
        requestAnimationFrame(() => {
          if (addInput.current) addInput.current.focus();
        });
      });
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

  const inputClassNames = Platform.OS === 'ios' ? 'py-1.5 leading-5' : 'py-0.5';
  const content = (
    <View style={tailwind('w-72 px-4 pt-6 pb-5 md:w-96')}>
      <View style={tailwind('flex-row items-center justify-start')}>
        <Text style={tailwind('flex-none text-sm font-normal text-gray-500 blk:text-gray-300')}>Url:</Text>
        {/* onKeyPress event for Enter key only if there is multiline TextInput */}
        <TextInput ref={addInput} onChange={onAddInputChange} onSubmitEditing={onAddInputKeyPress} style={tailwind(`ml-3 flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-base font-normal text-gray-700 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 ${inputClassNames}`)} keyboardType="url" placeholder="https://" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={url} autoCapitalize="none" />
      </View>
      {msg !== '' && <Text style={tailwind('pt-3 text-sm font-normal text-red-500')}>{msg}</Text>}
      <View style={tailwind(`flex-row items-center justify-start ${msg !== '' ? 'pt-3' : 'pt-5'}`)}>
        <TouchableOpacity onPress={onOkBtnClick} style={[tailwind('items-center justify-center rounded-full bg-gray-800 px-4 blk:bg-gray-100'), { paddingTop: 7, paddingBottom: 7 }]}>
          <Text style={tailwind('text-sm font-medium text-gray-50 blk:text-gray-800')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancelBtnClick} style={tailwind('ml-2 rounded-md px-2.5 py-1.5')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const popupClassNames = 'absolute rounded-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800';

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
        {content}
      </Animated.View>
    );
  } else {
    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { top: safeAreaHeight + 256, left: safeAreaWidth + 256 }]}>
        {content}
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

export default React.memo(TopBarAddPopup);
