import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopup, updateSettingsPopup, updateSettingsViewId } from '../actions';
import { PAYWALL_POPUP, SM_WIDTH, SETTINGS_VIEW_IAP } from '../types/const';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame } from '.';

const PaywallPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isPaywallPopupShown);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(PAYWALL_POPUP, false));
    didClick.current = true;
  };

  const onOkBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();

    dispatch(updateSettingsViewId(SETTINGS_VIEW_IAP, false));
    dispatch(updateSettingsPopup(true));
    didClick.current = true;
  };

  useEffect(() => {
    if (isShown) {
      cancelBtn.current.focus();
      didClick.current = false;
    }
  }, [isShown]);

  if (!isShown) return <AnimatePresence key="AP_PWP" />;

  const spanStyle = {};
  if (safeAreaWidth >= SM_WIDTH) spanStyle.height = safeAreaHeight;

  const cancelBtnStyle = { paddingTop: '0.44rem', paddingBottom: '0.44rem' };

  return (
    <AnimatePresence key="AP_PWP">
      <div className="fixed inset-0 overflow-y-auto z-40" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div style={{ minHeight: safeAreaHeight }} className="flex items-end justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0" aria-hidden="true">
            <motion.button ref={cancelBtn} onClick={onCancelBtnClick} className="absolute inset-0 w-full h-full bg-black bg-opacity-25 cursor-default focus:outline-none" variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <span style={spanStyle} className="hidden sm:inline-block sm:align-middle" aria-hidden="true">&#8203;</span>
          <motion.div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" variants={dialogFMV} initial="hidden" animate="visible" exit="hidden">
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <svg className="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 1C2.73478 1 2.48043 1.10536 2.29289 1.29289C2.10536 1.48043 2 1.73478 2 2C2 2.26522 2.10536 2.51957 2.29289 2.70711C2.48043 2.89464 2.73478 3 3 3H4.22L4.525 4.222C4.52803 4.23607 4.53136 4.25007 4.535 4.264L5.893 9.694L5 10.586C3.74 11.846 4.632 14 6.414 14H15C15.2652 14 15.5196 13.8946 15.7071 13.7071C15.8946 13.5196 16 13.2652 16 13C16 12.7348 15.8946 12.4804 15.7071 12.2929C15.5196 12.1054 15.2652 12 15 12H6.414L7.414 11H14C14.1857 10.9999 14.3676 10.9481 14.5255 10.8504C14.6834 10.7528 14.811 10.6131 14.894 10.447L17.894 4.447C17.9702 4.29458 18.0061 4.12522 17.9985 3.95501C17.9908 3.78479 17.9398 3.61935 17.8502 3.47439C17.7606 3.32944 17.6355 3.20977 17.4867 3.12674C17.3379 3.04372 17.1704 3.00009 17 3H6.28L5.97 1.757C5.91583 1.54075 5.79095 1.34881 5.61521 1.21166C5.43946 1.0745 5.22293 1.00001 5 1H3ZM16 16.5C16 16.8978 15.842 17.2794 15.5607 17.5607C15.2794 17.842 14.8978 18 14.5 18C14.1022 18 13.7206 17.842 13.4393 17.5607C13.158 17.2794 13 16.8978 13 16.5C13 16.1022 13.158 15.7206 13.4393 15.4393C13.7206 15.158 14.1022 15 14.5 15C14.8978 15 15.2794 15.158 15.5607 15.4393C15.842 15.7206 16 16.1022 16 16.5ZM6.5 18C6.89782 18 7.27936 17.842 7.56066 17.5607C7.84196 17.2794 8 16.8978 8 16.5C8 16.1022 7.84196 15.7206 7.56066 15.4393C7.27936 15.158 6.89782 15 6.5 15C6.10218 15 5.72064 15.158 5.43934 15.4393C5.15804 15.7206 5 16.1022 5 16.5C5 16.8978 5.15804 17.2794 5.43934 17.5607C5.72064 17.842 6.10218 18 6.5 18Z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Purchase a subscription</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Pin to the top is an extra feature. Please purchase a subscription to support us and unlock extra feature(s).</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:flex sm:justify-center sm:items-center">
              <button onClick={onOkBtnClick} className="w-full inline-flex justify-center rounded-full border border-gray-800 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring sm:w-40 sm:text-sm" type="button">More info</button>
              <button onClick={onCancelBtnClick} style={cancelBtnStyle} className="mt-3 w-full inline-flex justify-center rounded-full border border-gray-400 bg-white text-base font-normal text-gray-500 hover:text-gray-600 hover:border-gray-500 focus:outline-none focus:ring sm:mt-0 sm:ml-14 sm:w-40 sm:text-sm" type="button">Cancel</button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(PaywallPopup);
