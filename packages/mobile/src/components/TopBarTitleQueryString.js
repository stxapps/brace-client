import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateQueryString } from '../actions';
import { SM_WIDTH, LG_WIDTH } from '../types/const';
import { getTagNameDisplayName } from '../utils';
import cache from '../utils/cache';

import { getTopBarSizes, useSafeAreaFrame, useTailwind } from '.';

const TopBarTitleQueryString = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const queryString = useSelector(state => state.display.queryString);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCloseBtnClick = () => {
    dispatch(updateQueryString(''));
  };

  // Only tag name for now
  const tagName = queryString.trim();
  const displayName = getTagNameDisplayName(tagName, tagNameMap);

  let textMaxWidth = 160;
  if (safeAreaWidth >= SM_WIDTH) textMaxWidth = 320;
  if (safeAreaWidth >= LG_WIDTH) textMaxWidth = 512;

  if (safeAreaWidth >= SM_WIDTH) {
    const {
      headerPaddingX, commandsWidth,
      listNameDistanceX, listNameArrowWidth, listNameArrowSpace,
    } = getTopBarSizes(safeAreaWidth);
    let headerSpaceLeftover = safeAreaWidth - headerPaddingX - listNameDistanceX - listNameArrowWidth - listNameArrowSpace - commandsWidth - 4;

    textMaxWidth = Math.min(textMaxWidth, headerSpaceLeftover);
  }
  const textStyle = { maxWidth: textMaxWidth };

  return (
    <TouchableOpacity onPress={onCloseBtnClick} style={tailwind('flex-row items-center bg-white blk:bg-gray-900')}>
      <Text style={cache('TBTQT_text', [tailwind('mr-1 text-lg font-medium leading-7 text-gray-900 blk:text-gray-50'), textStyle], [safeAreaWidth, tailwind])} numberOfLines={1} ellipsizeMode="tail">{`#${displayName}`}</Text>
      <Svg style={tailwind('mt-px font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 28 28" stroke="none" fill="currentColor">
        <Path fillRule="evenodd" clipRule="evenodd" d="M14 25.2001C20.1857 25.2001 25.2001 20.1857 25.2001 14C25.2001 7.81446 20.1857 2.80005 14 2.80005C7.81446 2.80005 2.80005 7.81446 2.80005 14C2.80005 20.1857 7.81446 25.2001 14 25.2001ZM12.19 10.2101C11.6433 9.66337 10.7568 9.66337 10.2101 10.2101C9.66337 10.7568 9.66337 11.6433 10.2101 12.19L12.0202 14L10.2101 15.8101C9.66337 16.3568 9.66337 17.2433 10.2101 17.79C10.7568 18.3367 11.6433 18.3367 12.19 17.79L14 15.9799L15.8101 17.79C16.3568 18.3367 17.2433 18.3367 17.79 17.79C18.3367 17.2433 18.3367 16.3568 17.79 15.8101L15.9799 14L17.79 12.19C18.3367 11.6433 18.3367 10.7568 17.79 10.2101C17.2433 9.66337 16.3568 9.66337 15.8101 10.2101L14 12.0202L12.19 10.2101Z" />
      </Svg>
    </TouchableOpacity>
  );
};

export default React.memo(TopBarTitleQueryString);
