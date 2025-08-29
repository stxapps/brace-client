import React from 'react';
import { useSelector } from 'react-redux';

import {
  TOP_HEADER_HEIGHT, TOP_LIST_NAME_HEIGHT,
  TOP_HEADER_LIST_NAME_SPACE, TOP_HEADER_LIST_NAME_SPACE_MD,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD,
  MD_WIDTH, LG_WIDTH,
} from '../types/const';
import { toPx } from '../utils';
import {
  getSafeAreaFrame, getSafeAreaInsets, getThemeMode, getTailwind,
} from '../selectors';

export const getTopBarSizes = (safeAreaWidth) => {

  const topBarHeight = toPx(safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD);
  const headerHeight = toPx(TOP_HEADER_HEIGHT);

  const listNameDistanceX = toPx('3rem');

  const LIST_NAME_START_Y = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE);
  const LIST_NAME_START_Y_MD = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE_MD);
  const listNameStartY = safeAreaWidth < MD_WIDTH ? LIST_NAME_START_Y : LIST_NAME_START_Y_MD;

  const LIST_NAME_END_Y = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);
  const LIST_NAME_END_Y_MD = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);
  const listNameEndY = safeAreaWidth < MD_WIDTH ? LIST_NAME_END_Y : LIST_NAME_END_Y_MD;

  const listNameDistanceY = Math.abs(listNameEndY - listNameStartY);

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
  return useSelector(state => getSafeAreaFrame(state));
};

export const useSafeAreaInsets = () => {
  return useSelector(state => getSafeAreaInsets(state));
};

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = getTailwind(safeAreaWidth, themeMode);
  return tailwind;
};

export const withTailwind = (Component) => {
  return React.forwardRef((props: any, ref) => {
    const { safeAreaWidth, themeMode } = props;
    const tailwind = getTailwind(safeAreaWidth, themeMode);
    return <Component {...props} tailwind={tailwind} ref={ref} />;
  });
};
