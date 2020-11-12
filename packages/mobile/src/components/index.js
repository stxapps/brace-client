import React from 'react';
import { withSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TOP_HEADER_HEIGHT, TOP_LIST_NAME_HEIGHT,
  TOP_HEADER_LIST_NAME_SPACE, TOP_HEADER_LIST_NAME_SPACE_MD,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD,
  MD_WIDTH, LG_WIDTH,
} from '../types/const';
import { toPx } from '../utils';

const withSafeAreaSize = (Component) => {

  class SafeAreaSizeCompoment extends React.PureComponent {
    render() {
      const { forwardedRef, windowWidth, windowHeight, insets, ...rest } = this.props;
      if (!insets) throw new Error(`Illegal insets: ${insets}`);

      const props = { windowWidth, windowHeight, insets, ...rest };
      if (windowWidth) {
        const safeAreaWidth = windowWidth - insets.left - insets.right;
        props['safeAreaWidth'] = safeAreaWidth;
      }
      if (windowHeight) {
        const safeAreaHeight = windowHeight - insets.top - insets.bottom;
        props['safeAreaHeight'] = safeAreaHeight;
      }

      return <Component {...props} ref={forwardedRef} />;
    }
  }

  return React.forwardRef((props, ref) => {
    return <SafeAreaSizeCompoment {...props} forwardedRef={ref} />;
  });
};

export const withSafeAreaContext = (Component) => {
  return withSafeAreaInsets(withSafeAreaSize(Component));
};

export const getTopBarSizes = (safeAreaWidth) => {

  const topBarHeight = toPx(safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD);
  const headerHeight = toPx(TOP_HEADER_HEIGHT);
  const listNameHeight = toPx(TOP_LIST_NAME_HEIGHT); // From ListName -> Text -> leading-7
  const statusPopupHeight = 24; // From StatusPopup -> AnimatedText -> leading-6
  const commandsHeight = 38; // From onLayout

  const headerListNameSpace = toPx(safeAreaWidth < MD_WIDTH ? TOP_HEADER_LIST_NAME_SPACE : TOP_HEADER_LIST_NAME_SPACE_MD);

  const laidStatusPopupHeight = 28; // From render -> listNamePane -> View -> h-7
  const laidListNameCommandsHeight = 109; // From describe below

  // header: 56, border: 1, status: 28, list name + commands: 109
  // Touchable and TextInput work only within its parent's bound
  //   so height needs to be enough for translateY.
  //   56 (header) + 1 (borderBottom) + 24 (headerListNamespaceMd) + 28 (listName) = 109
  //   commands need to be translated from bottom to that height!
  const laidTopBarHeight = headerHeight + 1 + laidStatusPopupHeight + laidListNameCommandsHeight;

  const LIST_NAME_DISTANCE_X = toPx('3rem');
  const LIST_NAME_DISTANCE_X_MD = toPx('9rem');
  const listNameDistanceX = safeAreaWidth < MD_WIDTH ? LIST_NAME_DISTANCE_X : LIST_NAME_DISTANCE_X_MD;

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
  const commandsWidth = 434; // From inspect

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
