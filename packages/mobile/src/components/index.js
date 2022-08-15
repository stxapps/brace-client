import React from 'react';
import { Dimensions } from 'react-native';
import { createSelector } from 'reselect';
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
import { toPx } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

const getSafeAreaInsets = (
  windowX, windowY, windowWidth, windowHeight, screenWidth, screenHeight, screenInsets,
) => {
  const left = Math.max(screenInsets.left - windowX, 0);
  const top = Math.max(screenInsets.top - windowY, 0);
  const right = Math.max(
    (windowX + windowWidth) - (screenWidth - screenInsets.right), 0
  );
  const bottom = Math.max(
    (windowY + windowHeight) - (screenHeight - screenInsets.bottom), 0
  );
  return { left, top, right, bottom };
};

export const useSafeAreaFrame = () => {
  const {
    x: windowX, y: windowY, width: windowWidth, height: windowHeight,
  } = useWindowFrame();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  const screenInsets = useScreenInsets();

  const safeAreaInsets = getSafeAreaInsets(
    windowX, windowY, windowWidth, windowHeight, screenWidth, screenHeight, screenInsets,
  );

  const safeAreaX = windowX + safeAreaInsets.left;
  const safeAreaY = windowY + safeAreaInsets.top;
  const safeAreaWidth = windowWidth - safeAreaInsets.left - safeAreaInsets.right;
  const safeAreaHeight = windowHeight - safeAreaInsets.top - safeAreaInsets.bottom;

  return { x: safeAreaX, y: safeAreaY, width: safeAreaWidth, height: safeAreaHeight };
};

export const useSafeAreaInsets = () => {

  const {
    x: windowX, y: windowY, width: windowWidth, height: windowHeight,
  } = useWindowFrame();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  const screenInsets = useScreenInsets();

  return getSafeAreaInsets(
    windowX, windowY, windowWidth, windowHeight, screenWidth, screenHeight, screenInsets,
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
            windowX, windowY, windowWidth, windowHeight, screenWidth, screenHeight, screenInsets,
          );

          const safeAreaX = windowX + safeAreaInsets.left;
          const safeAreaY = windowY + safeAreaInsets.top;
          const safeAreaWidth = windowWidth - safeAreaInsets.left - safeAreaInsets.right;
          const safeAreaHeight = windowHeight - safeAreaInsets.top - safeAreaInsets.bottom;

          return <Component {...props} safeAreaX={safeAreaX} safeAreaY={safeAreaY} safeAreaWidth={safeAreaWidth} safeAreaHeight={safeAreaHeight} insets={safeAreaInsets} ref={ref} />;
        }}
      </SafeAreaInsetsContext.Consumer>}
    </SafeAreaFrameContext.Consumer>
  ));
};

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
  const commandsWidth = 432; // From inspect

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

const getTwWrapper = createSelector(
  safeAreaWidth => safeAreaWidth,
  safeAreaWidth => {
    return (classStr) => {
      return tailwind(classStr, safeAreaWidth);
    };
  },
);

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const twWrapper = getTwWrapper(safeAreaWidth);
  return twWrapper;
};

export const withTailwind = (Component) => {
  return withSafeAreaContext(React.forwardRef((props, ref) => {
    /* @ts-ignore */
    const { safeAreaWidth } = props;
    const twWrapper = getTwWrapper(safeAreaWidth);
    return <Component {...props} tailwind={twWrapper} ref={ref} />;
  }));
};
