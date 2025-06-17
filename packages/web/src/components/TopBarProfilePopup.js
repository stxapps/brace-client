import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Url from 'url-parse';

import { signOut, updatePopup } from '../actions';
import {
  updateSettingsPopup, updateSettingsViewId, lockCurrentList,
} from '../actions/chunk';
import {
  HASH_SUPPORT, PROFILE_POPUP, SETTINGS_VIEW_ACCOUNT, LOCK, UNLOCKED,
} from '../types/const';
import { getCurrentLockListStatus, getCanChangeListNames } from '../selectors';
import { popupBgFMV, popupFMV } from '../types/animConfigs';
import { computePositionStyle } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const TopBarProfilePopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isProfilePopupShown);
  const anchorPosition = useSelector(state => state.display.profilePopupPosition);
  const lockStatus = useSelector(state => getCurrentLockListStatus(state));
  const canChangeListNames = useSelector(state => getCanChangeListNames(state));
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(PROFILE_POPUP, false, null));
    didClick.current = true;
  };

  const onSettingsBtnClick = () => {
    dispatch(updatePopup(PROFILE_POPUP, false));

    dispatch(updateSettingsViewId(SETTINGS_VIEW_ACCOUNT, true));
    dispatch(updateSettingsPopup(true));
  };

  const onSupportBtnClick = () => {
    dispatch(updatePopup(PROFILE_POPUP, false));

    const urlObj = new Url(window.location.href, {});
    urlObj.set('pathname', '/');
    urlObj.set('hash', HASH_SUPPORT);
    window.location.href = urlObj.toString();
  };

  const onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    dispatch(signOut());
  }

  const onLockBtnClick = () => {
    dispatch(updatePopup(PROFILE_POPUP, false));
    // Wait for the close animation to finish first
    setTimeout(() => dispatch(lockCurrentList()), 100);
  }

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
    <AnimatePresence key="AP_topBarProfilePopup" />
  );

  const supportAndSignOutButtons = (
    <React.Fragment>
      <button onClick={onSupportBtnClick} className={tailwind('block w-full rounded-md py-2.5 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')}>Support</button>
      <button onClick={onSignOutBtnClick} className={tailwind('block w-full rounded-md py-2.5 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')}>Sign out</button>
    </React.Fragment>
  );

  let buttons;
  if (!canChangeListNames) {
    buttons = supportAndSignOutButtons;
  } else {
    buttons = (
      <React.Fragment>
        {lockStatus === UNLOCKED && <button onClick={onLockBtnClick} className={tailwind('block w-full rounded-md py-2.5 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')}>{LOCK}</button>}
        <button onClick={onSettingsBtnClick} className={tailwind('block w-full rounded-md py-2.5 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')}>Settings</button>
        {supportAndSignOutButtons}
      </React.Fragment>
    );
  }

  const popupClassNames = 'fixed z-41 w-28 overflow-auto rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25';

  let panel;
  if (popupSize) {
    const maxHeight = safeAreaHeight - 16;
    const posStyle = computePositionStyle(
      anchorPosition,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { width: safeAreaWidth, height: safeAreaHeight },
      null,
      insets,
      8,
    );
    const popupStyle = { ...posStyle, maxHeight };

    panel = (
      <motion.div key="TBPP_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="TBPP_popup" ref={popup} style={{ top: safeAreaHeight + 256, left: safeAreaWidth + 256 }} className={tailwind(popupClassNames)} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_topBarProfilePopup">
      <motion.button key="TBPP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 z-40 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(TopBarProfilePopup);
