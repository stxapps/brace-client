import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopup } from '../actions';
import { moveTagName, updateTagNameEditors } from '../actions/chunk';
import {
  SETTINGS_TAGS_MENU_POPUP, MODE_EDIT, SWAP_LEFT, SWAP_RIGHT,
} from '../types/const';
import { makeGetTagNameEditor } from '../selectors';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';
import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';

const SettingsTagsMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const getTagNameEditor = useMemo(makeGetTagNameEditor, []);
  const isShown = useSelector(state => state.display.isSettingsTagsMenuPopupShown);
  const anchorPosition = useSelector(
    state => state.display.settingsTagsMenuPopupPosition
  );
  const selectingTagName = useSelector(state => state.display.selectingTagName);
  const tagNameEditor = useSelector(s => getTagNameEditor(s, selectingTagName));
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(SETTINGS_TAGS_MENU_POPUP, false, null));
    didClick.current = true;
  };

  const onEditBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(updateTagNameEditors({
      [selectingTagName]: {
        mode: MODE_EDIT,
        msg: '',
        focusCount: tagNameEditor.focusCount + 1,
      },
    }));
    didClick.current = true;
  };

  const onMoveUpBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(moveTagName(selectingTagName, SWAP_LEFT));
    didClick.current = true;
  };

  const onMoveDownBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(moveTagName(selectingTagName, SWAP_RIGHT));
    didClick.current = true;
  };

  const onDeleteBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(updateTagNameEditors({
      [selectingTagName]: { isCheckingCanDelete: true },
    }));
    didClick.current = true;
  };

  useEffect(() => {
    if (isShown) {
      const s = popup.current.getBoundingClientRect();
      setPopupSize(s);

      cancelBtn.current.focus();
      didClick.current = false;
    } else {
      setPopupSize(null);
    }
  }, [isShown]);

  if (!isShown) return (
    <AnimatePresence key="AP_stmPopup" />
  );

  const buttons = (
    <div className={tailwind('py-1')}>
      <button onClick={onEditBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white sm:hidden')} role="menuitem">
        <svg className={tailwind('mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M10.5859 0.585788C11.3669 -0.195262 12.6333 -0.195262 13.4143 0.585788C14.1954 1.36683 14.1954 2.63316 13.4143 3.41421L12.6214 4.20711L9.79297 1.37868L10.5859 0.585788Z" />
          <path d="M8.3787 2.79289L0 11.1716V14H2.82842L11.2071 5.62132L8.3787 2.79289Z" />
        </svg>
        Edit
      </button>
      <button onClick={onMoveUpBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white lg:hidden')} role="menuitem">
        <svg className={tailwind('mr-3 w-4 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 14 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 4.70711C2.90237 4.31658 2.90237 3.68342 3.29289 3.29289L6.29289 0.29289C6.48043 0.10536 6.73478 0 7 0C7.2652 0 7.5196 0.10536 7.7071 0.29289L10.7071 3.29289C11.0976 3.68342 11.0976 4.31658 10.7071 4.70711C10.3166 5.09763 9.6834 5.09763 9.2929 4.70711L8 3.41421V11C8 11.5523 7.5523 12 7 12C6.44771 12 6 11.5523 6 11V3.41421L4.70711 4.70711C4.31658 5.09763 3.68342 5.09763 3.29289 4.70711Z" />
        </svg>
        Move up
      </button>
      <button onClick={onMoveDownBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white lg:hidden')} role="menuitem">
        <svg className={tailwind('mr-3 w-4 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 14 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 7.29289C3.68342 6.90237 4.31658 6.90237 4.70711 7.29289L6 8.5858V1C6 0.44772 6.44771 0 7 0C7.5523 0 8 0.44771 8 1V8.5858L9.2929 7.29289C9.6834 6.90237 10.3166 6.90237 10.7071 7.29289C11.0976 7.68342 11.0976 8.3166 10.7071 8.7071L7.7071 11.7071C7.5196 11.8946 7.2652 12 7 12C6.73478 12 6.48043 11.8946 6.29289 11.7071L3.29289 8.7071C2.90237 8.3166 2.90237 7.68342 3.29289 7.29289Z" />
        </svg>
        Move down
      </button>
      <button onClick={onDeleteBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
        <svg className={tailwind('mr-3.5 w-3.5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 14 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M6 0C5.62123 0 5.27497 0.214 5.10557 0.55279L4.38197 2H1C0.44772 2 0 2.44772 0 3C0 3.55228 0.44772 4 1 4V14C1 15.1046 1.89543 16 3 16H11C12.1046 16 13 15.1046 13 14V4C13.5523 4 14 3.55228 14 3C14 2.44772 13.5523 2 13 2H9.618L8.8944 0.55279C8.725 0.214 8.3788 0 8 0H6ZM4 6C4 5.44772 4.44772 5 5 5C5.55228 5 6 5.44772 6 6V12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12V6ZM9 5C8.4477 5 8 5.44772 8 6V12C8 12.5523 8.4477 13 9 13C9.5523 13 10 12.5523 10 12V6C10 5.44772 9.5523 5 9 5Z" />
        </svg>
        Delete
      </button>
    </div>
  );

  let popupClassNames = 'fixed z-41 min-w-36 overflow-auto rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25';
  let panel;
  if (popupSize) {

    const maxHeight = safeAreaHeight - 16;
    const layouts = createLayouts(
      anchorPosition,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { width: safeAreaWidth, height: safeAreaHeight },
    );
    const popupPosition = computePosition(layouts, null, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const popupStyle = { top, left, maxHeight };
    popupClassNames += ' ' + getOriginClassName(topOrigin, leftOrigin);

    panel = (
      <motion.div key="STMP_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="STMP_popup" ref={popup} style={{ top: safeAreaHeight, left: safeAreaWidth }} className={tailwind(popupClassNames)} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_stmPopup">
      <motion.button key="STMP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 z-40 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(SettingsTagsMenuPopup);
