import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
//import { authenticate } from '@stacks/connect';
import { motion, AnimatePresence } from "framer-motion";

import { updatePopup, updateUserData } from '../actions';
import {
  DOMAIN_NAME, APP_NAME, APP_ICON_NAME, APP_SCOPES, SIGN_UP_POPUP, SIGN_IN_POPUP,
} from '../types/const';
import { extractUrl } from '../utils';
import { popupBgFMV, ccPopupFMV } from '../types/animConfigs';

import { useSafeAreaFrame } from '.';
import SignIn from './SignIn';

const SignInPopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isSignInPopupShown);
  const cancelBtn = useRef(null);
  const dispatch = useDispatch();

  const onPopupCloseBtnClick = () => {
    dispatch(updatePopup(SIGN_IN_POPUP, false));
  };

  const onSignInWithStacksWalletBtnClick = () => {

  };

  const onSignUpBtnClick = () => {
    onPopupCloseBtnClick();
    dispatch(updatePopup(SIGN_UP_POPUP, true));
  };

  const onChooseAccountBtnClick = (data) => {
    onPopupCloseBtnClick();
    dispatch(updateUserData(data));
  };

  useEffect(() => {
    if (isShown) cancelBtn.current.focus();
  }, [isShown]);

  if (!isShown) return <AnimatePresence key="AnimatePresence_SIP" />;

  const panelHeight = Math.min(480, safeAreaHeight * 0.9);
  const appIconUrl = extractUrl(window.location.href).origin + '/' + APP_ICON_NAME;

  return (
    <AnimatePresence key="AnimatePresence_SIP">
      <div className="fixed inset-0 overflow-hidden z-30">
        <div className="p-4 flex items-center justify-center" style={{ minHeight: safeAreaHeight }}>
          <div className={'fixed inset-0'}>
            <motion.button ref={cancelBtn} onClick={onPopupCloseBtnClick} className="absolute inset-0 w-full h-full bg-black opacity-25 cursor-default focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <motion.div className={'w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-xl'} variants={ccPopupFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div className="relative flex flex-col overflow-hidden bg-white rounded-lg" style={{ height: panelHeight }}>
              <SignIn domainName={DOMAIN_NAME} appName={APP_NAME} appIconUrl={appIconUrl} appScopes={APP_SCOPES} onPopupCloseBtnClick={onPopupCloseBtnClick} onSignInWithStacksWalletBtnClick={onSignInWithStacksWalletBtnClick} onSignUpBtnClick={onSignUpBtnClick} onChooseAccountBtnClick={onChooseAccountBtnClick} />
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(SignInPopup);
