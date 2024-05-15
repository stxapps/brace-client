import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup, updateListNamesMode } from '../actions';
import {
  LIST_NAMES_POPUP, SM_WIDTH, LG_WIDTH, LIST_NAMES_MODE_CHANGE_TAG_NAME,
  LIST_NAMES_ANIM_TYPE_POPUP,
} from '../types/const';
import { getTagNameDisplayName } from '../utils';

import { getTopBarSizes, useSafeAreaFrame, useTailwind } from '.';

const TopBarTitleQueryString = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const queryString = useSelector(state => state.display.queryString);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onTagNameBtnClick = (e) => {
    dispatch(updateListNamesMode(
      LIST_NAMES_MODE_CHANGE_TAG_NAME, LIST_NAMES_ANIM_TYPE_POPUP
    ));

    const rect = e.currentTarget.getBoundingClientRect();
    dispatch(updatePopup(LIST_NAMES_POPUP, true, rect));

    if (window.document.activeElement instanceof HTMLElement) {
      window.document.activeElement.blur();
    }
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
    <div className={tailwind('relative inline-block')}>
      <button onClick={onTagNameBtnClick} className={tailwind('flex items-center rounded-sm bg-white focus:outline-none focus:ring blk:bg-gray-900')}>
        <h2 style={textStyle} className={tailwind('mr-1 truncate text-lg font-medium leading-7 text-gray-900 blk:text-gray-50')}>{`#${displayName}`}</h2>
        <svg className={tailwind('w-5 text-gray-900 blk:text-white')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default React.memo(TopBarTitleQueryString);
