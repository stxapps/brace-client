import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopup, unpinLinks, movePinnedLink } from '../actions';
import {
  PIN_MENU_POPUP, PIN_LEFT, PIN_RIGHT, PIN_UP, PIN_DOWN, UNPIN,
  SWAP_LEFT, SWAP_RIGHT, LAYOUT_LIST, SM_WIDTH,
} from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';
import { useSafeAreaFrame } from '.';

const PinMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isPinMenuPopupShown);
  const anchorPosition = useSelector(
    state => state.display.pinMenuPopupPosition
  );
  const selectingLinkId = useSelector(state => state.display.selectingLinkId);
  const layoutType = useSelector(state => state.localSettings.layoutType);
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(PIN_MENU_POPUP, false, null));
    didClick.current = true;
  };

  const onMenuPopupClick = (text) => {
    if (!text || didClick.current) return;

    onCancelBtnClick();
    if ([PIN_LEFT, PIN_UP].includes(text)) {
      dispatch(movePinnedLink(selectingLinkId, SWAP_LEFT));
    } else if ([PIN_RIGHT, PIN_DOWN].includes(text)) {
      dispatch(movePinnedLink(selectingLinkId, SWAP_RIGHT));
    } else if ([UNPIN].includes(text)) {
      dispatch(unpinLinks([selectingLinkId]));
    } else {
      console.log(`In PinMenuPopup, invalid text: ${text}`);
    }

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
    <AnimatePresence key="AP_pinMenuPopup" />
  );

  let menu = [PIN_LEFT, PIN_RIGHT, UNPIN];
  if (layoutType === LAYOUT_LIST || safeAreaWidth < SM_WIDTH) {
    menu = [PIN_UP, PIN_DOWN, UNPIN];
  }

  const buttons = (
    <React.Fragment>
      <div className="pl-4 pr-4 pt-1 h-11 flex justify-start items-center">
        <p className={'text-sm text-gray-600 font-semibold font-left truncate'}>Manage pin</p>
      </div>
      {menu.map(text => {
        return <button key={text} onClick={() => onMenuPopupClick(text)} className="py-2.5 pl-4 pr-4 block w-full text-sm text-gray-700 text-left truncate rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset" role="menuitem">{text}</button>
      })}
    </React.Fragment>
  );

  let popupClassNames = 'pb-1 fixed min-w-32 max-w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-auto z-41';
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
      <motion.div key="PMP_popup" ref={popup} style={popupStyle} className={popupClassNames} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="PMP_popup" ref={popup} style={{ top: safeAreaHeight, left: safeAreaWidth }} className={popupClassNames} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_pinMenuPopup">
      <motion.button key="PMP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className="fixed inset-0 w-full h-full bg-black bg-opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(PinMenuPopup);
