import React from 'react';
import { Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import {
  useSafeAreaFrame as useWindowFrame, useSafeAreaInsets as useScreenInsets,
  SafeAreaFrameContext, SafeAreaInsetsContext,
} from 'react-native-safe-area-context';

import {
  TOP_HEADER_HEIGHT, TOP_LIST_NAME_HEIGHT,
  TOP_HEADER_LIST_NAME_SPACE, TOP_HEADER_LIST_NAME_SPACE_MD,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD,
  MD_WIDTH, LG_WIDTH,
} from '../types/const';
import {
  getSafeAreaFrame, getSafeAreaInsets, getThemeMode, getTailwind,
} from '../selectors';
import { toPx } from '../utils';

export const getTopBarSizes = (safeAreaWidth) => {

  const topBarHeight = toPx(safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD);
  const headerHeight = toPx(TOP_HEADER_HEIGHT);
  const listNameHeight = toPx(TOP_LIST_NAME_HEIGHT); // From ListName -> Text -> leading-7
  const statusPopupHeight = 20; // From StatusPopup -> AnimatedText -> text-sm
  const commandsHeight = 34; // From onLayout

  const headerListNameSpace = toPx(safeAreaWidth < MD_WIDTH ? TOP_HEADER_LIST_NAME_SPACE : TOP_HEADER_LIST_NAME_SPACE_MD);

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

  const LIST_NAME_END_Y = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);
  const LIST_NAME_END_Y_MD = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);

  const listNameDistanceY = safeAreaWidth < MD_WIDTH ? Math.abs(LIST_NAME_END_Y - LIST_NAME_START_Y) : Math.abs(LIST_NAME_END_Y_MD - LIST_NAME_START_Y_MD);

  const statusPopupDistanceY = 36;

  let headerPaddingX = 16 + 16; // From px-4 md:px-6 lg:px-8
  if (safeAreaWidth >= MD_WIDTH) headerPaddingX = 24 + 24;
  if (safeAreaWidth >= LG_WIDTH) headerPaddingX = 32 + 32;

  const listNameArrowWidth = 20; // From inspect
  const listNameArrowSpace = 4; // From inspect
  const commandsWidth = 422; // From inspect

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
  return React.forwardRef((props, ref) => (
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
};

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = getTailwind(safeAreaWidth, themeMode);
  return tailwind;
};

export const withTailwind = (Component) => {
  return withSafeAreaContext(React.forwardRef((props, ref) => {
    const { safeAreaWidth, themeMode } = /** @type any */(props);
    const tailwind = getTailwind(safeAreaWidth, themeMode);
    return <Component {...props} tailwind={tailwind} ref={ref} />;
  }));
};
