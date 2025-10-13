import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, AppState, AppStateStatus, Keyboard, Platform } from 'react-native';
import {
  useSafeAreaFrame as useWindowFrame, useSafeAreaInsets as useScreenInsets,
  SafeAreaFrameContext, SafeAreaInsetsContext,
} from 'react-native-safe-area-context';
import { useNavigationMode } from 'react-native-navigation-mode';

import { useSelector } from '../store';
import {
  TOP_HEADER_HEIGHT, TOP_LIST_NAME_HEIGHT, TOP_HEADER_LIST_NAME_SPACE,
  TOP_HEADER_LIST_NAME_SPACE_MD, TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, MD_WIDTH, LG_WIDTH,
} from '../types/const';
import {
  getSafeAreaFrame, getSafeAreaInsets, getThemeMode, getTailwind,
} from '../selectors';
import { isObject, isNumber, toPx } from '../utils';

export const getTopBarSizes = (safeAreaWidth) => {

  const topBarHeight = safeAreaWidth < toPx(MD_WIDTH) ? toPx(TOP_BAR_HEIGHT) : toPx(TOP_BAR_HEIGHT_MD);
  const headerHeight = toPx(TOP_HEADER_HEIGHT);
  const listNameHeight = toPx(TOP_LIST_NAME_HEIGHT); // From ListName -> Text -> leading-7
  const statusPopupHeight = 20; // From StatusPopup -> AnimatedText -> text-sm
  const commandsHeight = 34; // From onLayout

  const headerListNameSpace = safeAreaWidth < toPx(MD_WIDTH) ? toPx(TOP_HEADER_LIST_NAME_SPACE) : toPx(TOP_HEADER_LIST_NAME_SPACE_MD);

  const laidStatusPopupHeight = 28; // From render -> listNamePane -> View -> h-7
  const laidListNameCommandsHeight = 109; // From describe below

  // header: 56, border: 1, status: 28, list name + commands: 109
  // Touchable and TextInput work only within its parent's bound
  //   so height needs to be enough for translateY.
  //   56 (header) + 1 (borderBottom) + 24 (headerListNamespaceMd) + 28 (listName) = 109
  //   commands need to be translated from bottom to that height!
  const laidTopBarHeight = headerHeight + 1 + laidStatusPopupHeight + laidListNameCommandsHeight;

  const listNameDistanceX = toPx('3rem');

  const LIST_NAME_START_Y = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE);
  const LIST_NAME_START_Y_MD = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE_MD);
  const listNameStartY = safeAreaWidth < toPx(MD_WIDTH) ? LIST_NAME_START_Y : LIST_NAME_START_Y_MD;

  const LIST_NAME_END_Y = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);
  const LIST_NAME_END_Y_MD = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);
  const listNameEndY = safeAreaWidth < toPx(MD_WIDTH) ? LIST_NAME_END_Y : LIST_NAME_END_Y_MD;

  const listNameDistanceY = Math.abs(listNameEndY - listNameStartY);

  const statusPopupDistanceY = toPx('2.25rem'); // 36px

  let headerPaddingX = toPx('1rem') * 2; // From px-4 md:px-6 lg:px-8
  if (safeAreaWidth >= toPx(MD_WIDTH)) headerPaddingX = toPx('1.5rem') * 2;
  if (safeAreaWidth >= toPx(LG_WIDTH)) headerPaddingX = toPx('2rem') * 2;

  const listNameArrowWidth = toPx('1.25rem'); // From inspect
  const listNameArrowSpace = toPx('0.25rem'); // From inspect
  const commandsWidth = toPx('26.375rem'); // From inspect

  return {
    topBarHeight,
    headerHeight,
    listNameHeight,
    statusPopupHeight,
    commandsHeight,
    headerListNameSpace,
    laidStatusPopupHeight,
    laidListNameCommandsHeight,
    laidTopBarHeight,
    listNameDistanceX,
    listNameStartY,
    listNameEndY,
    listNameDistanceY,
    statusPopupDistanceY,
    headerPaddingX,
    listNameArrowWidth,
    listNameArrowSpace,
    commandsWidth,
  };
};

export const useSafeAreaFrame = () => {
  const {
    x: windowX, y: windowY, width: windowWidth, height: windowHeight,
  } = useWindowFrame();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  const screenInsets = useScreenInsets();

  const safeAreaInsets = getSafeAreaInsets(
    windowX, windowY, windowWidth, windowHeight,
    screenWidth, screenHeight, screenInsets,
  );

  return getSafeAreaFrame(windowWidth, windowHeight, safeAreaInsets);
};

export const useSafeAreaInsets = () => {
  const {
    x: windowX, y: windowY, width: windowWidth, height: windowHeight,
  } = useWindowFrame();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  const screenInsets = useScreenInsets();

  return getSafeAreaInsets(
    windowX, windowY, windowWidth, windowHeight,
    screenWidth, screenHeight, screenInsets,
  );
};

export const withSafeAreaContext = (Component) => {
  const hoc = React.forwardRef((props, ref) => (
    <SafeAreaFrameContext.Consumer>
      {(windowFrame) => <SafeAreaInsetsContext.Consumer>
        {(screenInsets) => {

          const {
            x: windowX, y: windowY, width: windowWidth, height: windowHeight,
          } = windowFrame;
          const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

          const safeAreaInsets = getSafeAreaInsets(
            windowX, windowY, windowWidth, windowHeight,
            screenWidth, screenHeight, screenInsets,
          );
          const safeAreaFrame = getSafeAreaFrame(
            windowWidth, windowHeight, safeAreaInsets
          );

          const safeAreaX = safeAreaFrame.x;
          const safeAreaY = safeAreaFrame.y;
          const safeAreaWidth = safeAreaFrame.width;
          const safeAreaHeight = safeAreaFrame.height;

          return <Component {...props} safeAreaX={safeAreaX} safeAreaY={safeAreaY} safeAreaWidth={safeAreaWidth} safeAreaHeight={safeAreaHeight} insets={safeAreaInsets} ref={ref} />;
        }}
      </SafeAreaInsetsContext.Consumer>}
    </SafeAreaFrameContext.Consumer>
  ));
  hoc.displayName = 'withSafeAreaContextComponent';
  return hoc;
};

const getKbHt = () => {
  const kbMtx = Keyboard.metrics();
  if (isObject(kbMtx) && isNumber(kbMtx.height)) return kbMtx.height;
  return 0;
};
export const useKeyboardHeight = (enabled = true) => {
  const [height, setHeight] = useState(enabled ? getKbHt() : 0);
  const heightRef = useRef(height);

  useEffect(() => {
    if (!enabled) return;

    const chkAndSetHeight = (e) => {
      const newHeight = e.endCoordinates.height;
      if (heightRef.current !== newHeight) setHeight(newHeight);
      heightRef.current = newHeight;
    };
    const resetHeight = () => {
      if (heightRef.current !== 0) setHeight(0);
      heightRef.current = 0;
    };

    const willShowSub = Keyboard.addListener('keyboardWillShow', chkAndSetHeight);
    const didShowSub = Keyboard.addListener('keyboardDidShow', chkAndSetHeight);
    const willChgSub = Keyboard.addListener('keyboardWillChangeFrame', chkAndSetHeight);
    const didChgSub = Keyboard.addListener('keyboardDidChangeFrame', chkAndSetHeight);
    const willHideSub = Keyboard.addListener('keyboardWillHide', resetHeight);
    const didHideSub = Keyboard.addListener('keyboardDidHide', resetHeight);

    return () => {
      if (!enabled) return;
      willShowSub.remove();
      didShowSub.remove();
      willChgSub.remove();
      didChgSub.remove();
      willHideSub.remove();
      didHideSub.remove();
    };
  }, [enabled]);

  return height;
};

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = getTailwind(safeAreaWidth, themeMode);
  return tailwind;
};

export const withTailwind = (Component) => {
  const hoc = React.forwardRef((props: any, ref) => {
    const tailwind = useTailwind();
    return <Component {...props} tailwind={tailwind} ref={ref} />;
  });
  hoc.displayName = 'withTailwindComponent';
  return withSafeAreaContext(hoc);
};

export const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    });

    return () => {
      sub.remove();
    };
  }, []);

  return appState;
};

export const useCanEdgeHorizontalSwipe = () => {
  const { navigationMode, loading, error } = useNavigationMode();

  if (Platform.OS !== 'android') return true;
  if (loading || error) return false;
  return !navigationMode.isGestureNavigation;
};
