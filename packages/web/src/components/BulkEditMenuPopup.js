import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  updatePopup, updateListNamesMode, pinLinks, unpinLinks, updateTagEditorPopup,
  updateBulkEdit,
} from '../actions';
import {
  BULK_EDIT_MENU_POPUP, LIST_NAMES_POPUP, BULK_EDIT_MENU_ANIM_TYPE_BMODAL, MOVE_TO, PIN,
  UNPIN, MANAGE_TAGS, MY_LIST, ARCHIVE, TRASH, LIST_NAMES_MODE_MOVE_LINKS,
  LIST_NAMES_ANIM_TYPE_POPUP, LIST_NAMES_ANIM_TYPE_BMODAL,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getAllListNames } from '../utils';
import { popupBgFMV, popupFMV, bModalBgFMV, bModalFMV } from '../types/animConfigs';

import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';
import { useSafeAreaFrame, useTailwind } from '.';

const ANIM_TYPE_BMODAL = BULK_EDIT_MENU_ANIM_TYPE_BMODAL;

const BulkEditMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isBulkEditMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.bulkEditMenuPopupPosition);
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const listNameMap = useSelector(state => getListNameMap(state));
  const selectedLinkIds = useSelector(state => state.display.selectedLinkIds);
  const animType = useSelector(state => state.display.bulkEditMenuAnimType);
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const isAnimTypeB = animType === ANIM_TYPE_BMODAL;

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(BULK_EDIT_MENU_POPUP, false, null));
    didClick.current = true;
  };

  const onMenuPopupClick = (text) => {
    if (!text || didClick.current) return;

    onCancelBtnClick();
    if (text === MOVE_TO) {
      let lnAnimType = LIST_NAMES_ANIM_TYPE_POPUP;
      if (isAnimTypeB) lnAnimType = LIST_NAMES_ANIM_TYPE_BMODAL;

      dispatch(updateListNamesMode(LIST_NAMES_MODE_MOVE_LINKS, lnAnimType));
      dispatch(updatePopup(LIST_NAMES_POPUP, true, anchorPosition));
    } else if (text === PIN) {
      dispatch(pinLinks(selectedLinkIds));
      dispatch(updateBulkEdit(false));
    } else if (text === UNPIN) {
      dispatch(unpinLinks(selectedLinkIds));
      dispatch(updateBulkEdit(false));
    } else if (text === MANAGE_TAGS) {
      dispatch(updateTagEditorPopup(true, true));
    } else {
      console.log(`In BulkEditMenuPopup, invalid text: ${text}`);
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
    <AnimatePresence key="AP_bulkEditMenuPopup" />
  );

  let menu = [];
  const rListName = [MY_LIST, ARCHIVE, TRASH].includes(listName) ? listName : MY_LIST;
  if (queryString === '') {
    if (rListName === MY_LIST && getAllListNames(listNameMap).length > 3) {
      menu.push(MOVE_TO);
    }
  }
  menu = [...menu, MANAGE_TAGS, PIN, UNPIN];

  const hdClassNames = isAnimTypeB ? 'h-14' : 'h-11';
  const btnClassNames = isAnimTypeB ? 'py-4' : 'py-2.5';
  const buttons = (
    <React.Fragment>
      <div className={tailwind(`flex items-center justify-start pl-4 pr-4 pt-1 ${hdClassNames}`)}>
        <p className={tailwind('truncate text-left text-sm font-semibold text-gray-600 blk:text-gray-200')}>Actions</p>
      </div>
      {menu.map(text => {
        return <button key={text} onClick={() => onMenuPopupClick(text)} className={tailwind(`block w-full truncate rounded-md pl-4 pr-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white ${btnClassNames}`)} role="menuitem">{text}</button>
      })}
    </React.Fragment>
  );

  let popupClassNames = 'fixed z-41 min-w-36 overflow-auto bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25';
  if (isAnimTypeB) popupClassNames += ' pb-2.5';
  else popupClassNames += ' pb-1';

  let panel;
  if (popupSize) {
    if (isAnimTypeB) {
      const popupStyle = { height: popupSize.height };
      popupClassNames += ' inset-x-0 bottom-0 rounded-t-lg';

      panel = (
        <motion.div key="BEMP_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={bModalFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {buttons}
        </motion.div>
      );
    } else {
      const maxHeight = safeAreaHeight - 16;
      const layouts = createLayouts(
        anchorPosition,
        { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
        { width: safeAreaWidth, height: safeAreaHeight },
      );
      const popupPosition = computePosition(layouts, null, 8);

      const { top, left, topOrigin, leftOrigin } = popupPosition;
      const popupStyle = { top, left, maxHeight };
      popupClassNames += ' rounded-lg ' + getOriginClassName(topOrigin, leftOrigin);

      panel = (
        <motion.div key="BEMP_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {buttons}
        </motion.div>
      );
    }
  } else {
    panel = (
      <div key="BEMP_popup" ref={popup} style={{ top: safeAreaHeight, left: safeAreaWidth }} className={tailwind(popupClassNames)} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  const bgFMV = isAnimTypeB ? bModalBgFMV : popupBgFMV;

  return (
    <AnimatePresence key="AP_bulkEditMenuPopup">
      <motion.button key="BEMP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 z-40 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={bgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(BulkEditMenuPopup);
