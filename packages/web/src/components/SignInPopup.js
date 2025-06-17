import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { m as motion, AnimatePresence } from 'framer-motion';

import userSession from '../userSession';
import { showConnect } from '../importWrapper';
import { updatePopup, updateUserData, updateUserSignedIn } from '../actions';
import {
  DOMAIN_NAME, APP_NAME, APP_ICON_NAME, APP_SCOPES, SIGN_UP_POPUP, SIGN_IN_POPUP,
} from '../types/const';
import { extractUrl, getUrlPathQueryHash } from '../utils';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import SignIn from './SignIn';

const SignInPopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isSignInPopupShown);
  const cancelBtn = useRef(null);
  const appIconUrl = useMemo(() => {
    return extractUrl(window.location.href).origin + '/' + APP_ICON_NAME;
  }, []);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onPopupCloseBtnClick = () => {
    dispatch(updatePopup(SIGN_IN_POPUP, false));
  };

  const onSignInWithHiroWalletBtnClick = () => {
    window.alert('Sign in with a Stacks wallet is deprecated and will be removed. Please sign in directly instead. For more information: http://bit.ly/3Sv6ebK');
    onPopupCloseBtnClick();

    const authOptions = {
      appDetails: { name: APP_NAME, icon: appIconUrl },
      redirectTo: '/' + getUrlPathQueryHash(window.location.href),
      onFinish: () => dispatch(updateUserSignedIn()),
      userSession: userSession._userSession,
      sendToSignIn: true,
    };
    showConnect(authOptions); // Bug alert: dynamic import should show loading.
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

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };
  const panelHeight = Math.min(480, safeAreaHeight * 0.9);

  return (
    <AnimatePresence key="AnimatePresence_SIP">
      <div style={canvasStyle} className={tailwind('fixed inset-0 z-30 overflow-hidden')}>
        <div className={tailwind('flex items-center justify-center p-4')} style={{ minHeight: safeAreaHeight }}>
          <div className={tailwind('fixed inset-0')}>
            {/* No cancel on background of SignInPopup */}
            <motion.button ref={cancelBtn} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <motion.div className={tailwind('w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div className={tailwind('relative flex flex-col overflow-hidden rounded-lg bg-white')} style={{ height: panelHeight }}>
              <SignIn domainName={DOMAIN_NAME} appName={APP_NAME} appIconUrl={appIconUrl} appScopes={APP_SCOPES} onPopupCloseBtnClick={onPopupCloseBtnClick} onSignInWithHiroWalletBtnClick={onSignInWithHiroWalletBtnClick} onSignUpBtnClick={onSignUpBtnClick} onChooseAccountBtnClick={onChooseAccountBtnClick} />
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(SignInPopup);
