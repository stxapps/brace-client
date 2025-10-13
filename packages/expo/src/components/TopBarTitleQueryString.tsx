import React, { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import { updateListNamesMode } from '../actions/chunk';
import {
  LIST_NAMES_POPUP, SM_WIDTH, LG_WIDTH, LIST_NAMES_MODE_CHANGE_TAG_NAME,
  LIST_NAMES_ANIM_TYPE_POPUP,
} from '../types/const';
import { getTagNameDisplayName, getRect, toPx } from '../utils';
import cache from '../utils/cache';

import { getTopBarSizes, useSafeAreaFrame, useTailwind } from '.';
import Text from './CustomText';

const TopBarTitleQueryString = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const queryString = useSelector(state => state.display.queryString);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const tagNameBtn = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onTagNameBtnClick = () => {
    if (!tagNameBtn.current) return;
    tagNameBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateListNamesMode(
        LIST_NAMES_MODE_CHANGE_TAG_NAME, LIST_NAMES_ANIM_TYPE_POPUP,
      ));

      const rect = getRect(x, y, width, height);
      dispatch(updatePopup(LIST_NAMES_POPUP, true, rect));
    });
  };

  // Only tag name for now
  const tagName = queryString.trim();
  const displayName = getTagNameDisplayName(tagName, tagNameMap);

  let textMaxWidth = 160;
  if (safeAreaWidth >= toPx(SM_WIDTH)) textMaxWidth = 320;
  if (safeAreaWidth >= toPx(LG_WIDTH)) textMaxWidth = 512;

  if (safeAreaWidth >= toPx(SM_WIDTH)) {
    const {
      headerPaddingX, commandsWidth,
      listNameDistanceX, listNameArrowWidth, listNameArrowSpace,
    } = getTopBarSizes(safeAreaWidth);
    let headerSpaceLeftover = (
      safeAreaWidth - headerPaddingX - listNameDistanceX - listNameArrowWidth -
      listNameArrowSpace - commandsWidth - 4
    );

    textMaxWidth = Math.min(textMaxWidth, headerSpaceLeftover);
  }
  const textStyle = { maxWidth: textMaxWidth };

  return (
    <TouchableOpacity ref={tagNameBtn} onPress={onTagNameBtnClick} style={tailwind('flex-row items-center bg-white blk:bg-gray-900')}>
      <Text style={cache('TBTQT_text', [tailwind('mr-1 text-lg font-medium leading-7 text-gray-900 blk:text-gray-50'), textStyle], [safeAreaWidth, tailwind])} numberOfLines={1} ellipsizeMode="tail">{`#${displayName}`}</Text>
      <Svg style={tailwind('font-normal text-gray-900 blk:text-white')} width={20} height={20} viewBox="0 0 24 24" stroke="currentColor" fill="none">
        <Path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </TouchableOpacity>
  );
};

export default React.memo(TopBarTitleQueryString);
