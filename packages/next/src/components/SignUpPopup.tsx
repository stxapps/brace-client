import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { useSelector, useDispatch } from '../store';
import { updatePopup, updateUserData } from '../actions';
import {
  DOMAIN_NAME, APP_NAME, APP_ICON_NAME, APP_SCOPES, SIGN_UP_POPUP, SIGN_IN_POPUP,
} from '../types/const';
import { extractUrl } from '../utils';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import SignUp from './SignUp';

const SignUpPopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isSignUpPopupShown);
  const cancelBtn = useRef(null);
  const appIconUrl = useMemo(() => {
    return extractUrl(window.location.href).origin + '/' + APP_ICON_NAME;
  }, []);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onPopupCloseBtnClick = () => {
    dispatch(updatePopup(SIGN_UP_POPUP, false));
  };

  const onSignInBtnClick = () => {
    onPopupCloseBtnClick();
    dispatch(updatePopup(SIGN_IN_POPUP, true));
  };

  const onBackedUpBtnClick = (data) => {
    onPopupCloseBtnClick();
    dispatch(updateUserData(data));
  };

  useEffect(() => {
    if (isShown) cancelBtn.current.focus();
  }, [isShown]);

  if (!isShown) return <AnimatePresence key="AnimatePresence_SUP" />;

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };
  const panelHeight = Math.min(576 - 40, safeAreaHeight * 0.9);

  return (
    <AnimatePresence key="AnimatePresence_SUP">
      <div style={canvasStyle} className={tailwind('fixed inset-0 z-30 overflow-hidden')}>
        <div className={tailwind('flex items-center justify-center p-4')} style={{ minHeight: safeAreaHeight }}>
          <div className={tailwind('fixed inset-0')}>
            {/* No cancel on background of SignUpPopup */}
            <motion.button ref={cancelBtn} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black/25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <motion.div className={tailwind('w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div className={tailwind('relative flex flex-col overflow-hidden rounded-lg bg-white')} style={{ height: panelHeight }}>
              <SignUp domainName={DOMAIN_NAME} appName={APP_NAME} appIconUrl={appIconUrl} appScopes={APP_SCOPES} onPopupCloseBtnClick={onPopupCloseBtnClick} onSignInBtnClick={onSignInBtnClick} onBackedUpBtnClick={onBackedUpBtnClick} />
            </div>
          </motion.div>
        </div>
      </div >
    </AnimatePresence>
  );
};

export default React.memo(SignUpPopup);
