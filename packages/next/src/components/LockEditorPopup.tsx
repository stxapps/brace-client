import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  updateLockEditor, addLockList, removeLockList, unlockList,
} from '../actions/chunk';
import {
  MY_LIST, LOCK_EDITOR_POPUP, LOCK_ACTION_ADD_LOCK_LIST, LOCK_ACTION_REMOVE_LOCK_LIST,
  LOCK_ACTION_UNLOCK_LIST,
} from '../types/const';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const LockEditorPopup = () => {
  // Use windowHeight to move along with a virtual keyboard.
  const { windowHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isLockEditorPopupShown);
  const lockAction = useSelector(state => state.display.lockAction);
  const selectingListName = useSelector(state => state.display.selectingListName);
  // errMsg might be the same and didClick not reset! So need the whole state.
  const lockEditorState = useSelector(state => state.lockEditor);
  // Naked password not in reducer to avoid storing to storage.
  const [passwordInputValue, setPasswordInputValue] = useState('');
  const [doShowPassword, setDoShowPassword] = useState(false);
  const [canChangeListNames, setCanChangeListNames] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const passwordInput = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const { isLoadingShown, errMsg } = lockEditorState;

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(LOCK_EDITOR_POPUP, false));
    didClick.current = true;
  };

  const onPasswordInputChange = (e) => {
    setPasswordInputValue(e.target.value);
    if (errMsg) dispatch(updateLockEditor({ errMsg: '' }));
  };

  const onChangeListNamesInputChange = (e) => {
    setCanChangeListNames(e.target.checked);
  };

  const onExportInputChange = (e) => {
    setCanExport(e.target.checked);
  };

  const onOkBtnClick = () => {
    if (didClick.current) return;

    if (lockAction === LOCK_ACTION_ADD_LOCK_LIST) {
      dispatch(addLockList(
        selectingListName, passwordInputValue, canChangeListNames, canExport
      ));
    } else if (lockAction === LOCK_ACTION_REMOVE_LOCK_LIST) {
      dispatch(removeLockList(selectingListName, passwordInputValue));
    } else if (lockAction === LOCK_ACTION_UNLOCK_LIST) {
      dispatch(unlockList(selectingListName, passwordInputValue));
    } else {
      console.log(`In LockEditorPopup, invalid lockAction: ${lockAction}`);
      return; // Don't set didClick to true
    }

    didClick.current = true;
  };

  useEffect(() => {
    if (isShown) {
      setTimeout(() => {
        if (passwordInput.current) passwordInput.current.focus();
      }, 100);
    }
  }, [isShown]);

  useEffect(() => {
    if (isShown) didClick.current = false;
  }, [isShown, lockEditorState]);

  if (derivedIsShown !== isShown) {
    if (!derivedIsShown && isShown) {
      setPasswordInputValue('');
      setDoShowPassword(false);
      setCanChangeListNames(false);
      setCanExport(false);
    }
    setDerivedIsShown(isShown);
  }

  if (!isShown) return <AnimatePresence key="AP_LockP" />;

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };

  const panelHeight = Math.min(480, windowHeight * 0.9);

  let title, desc, exportText, btnText;
  if (lockAction === LOCK_ACTION_ADD_LOCK_LIST) {
    title = 'Lock List';
    desc = (
      <React.Fragment>
        <p className={tailwind('mt-3 text-sm leading-6 text-gray-500 blk:text-gray-400')}>This list will be locked on this device only. If you forget your locked password, you can sign out to remove all locks.</p>
        <p className={tailwind('mt-3.5 text-sm leading-6 text-gray-500 blk:text-gray-400')}>Create a password for locking this list.</p>
      </React.Fragment>
    );
    exportText = 'When locked, allow this list to be exported';
    btnText = 'Lock';
  } else if (lockAction === LOCK_ACTION_REMOVE_LOCK_LIST) {
    title = 'Remove Lock';
    desc = (
      <p className={tailwind('mt-2 text-sm leading-6 text-gray-500 blk:text-gray-400')}>Enter your password to remove the lock.</p>
    );
    btnText = 'Remove';
  } else if (lockAction === LOCK_ACTION_UNLOCK_LIST) {
    title = 'Unlock List';
    desc = (
      <p className={tailwind('mt-2 text-sm leading-6 text-gray-500 blk:text-gray-400')}>Enter your password to unlock this list.</p>
    );
    btnText = 'Unlock';
  }

  const isAddLockList = lockAction === LOCK_ACTION_ADD_LOCK_LIST;
  const isAddLockMyList = (
    lockAction === LOCK_ACTION_ADD_LOCK_LIST && selectingListName === MY_LIST
  );

  return (
    <AnimatePresence key="AP_LockP">
      <div style={canvasStyle} className={tailwind('fixed inset-0 z-30 overflow-hidden')}>
        <div className={tailwind('flex items-center justify-center p-4')} style={{ minHeight: windowHeight }}>
          <div className={tailwind('fixed inset-0')}>
            <motion.button onClick={onCancelBtnClick} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <motion.div className={tailwind('w-full max-w-[23rem] overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-1 blk:ring-white blk:ring-opacity-25 lg:mb-20')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div className={tailwind('relative flex flex-col overflow-hidden rounded-lg bg-white blk:bg-gray-800')} style={{ maxHeight: panelHeight }}>
              <div className={tailwind('relative flex-1 overflow-y-auto overflow-x-hidden px-4 pt-8 pb-4 sm:px-6 sm:pb-6')}>
                <h2 className={tailwind('text-left text-xl font-semibold text-gray-800 blk:text-gray-100')}>{title}</h2>
                {desc}
                <div className={tailwind([LOCK_ACTION_ADD_LOCK_LIST].includes(lockAction) ? 'pt-1' : 'pt-3.5')}>
                  <label htmlFor="password-input" className={tailwind('sr-only')}>Password</label>
                  <div className={tailwind('relative mt-1 bg-white blk:bg-gray-800')}>
                    <input ref={passwordInput} onChange={onPasswordInputChange} className={tailwind('block w-full rounded-full border border-gray-400 bg-white py-[0.5625rem] pl-4 pr-6 text-sm text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 blk:placeholder:text-gray-400 blk:focus:border-transparent sm:py-[0.4375rem]')} placeholder="Password" value={passwordInputValue} id="password-input" name="password-input" autoCapitalize="none" type={doShowPassword ? 'text' : 'password'}></input>
                    <button onClick={() => setDoShowPassword(!doShowPassword)} className={tailwind('group absolute inset-y-0 right-0 flex items-center pr-2 focus:outline-none')} >
                      <svg className={tailwind('h-4 w-4 cursor-pointer rounded text-gray-400 group-hover:text-gray-500 group-focus-visible:text-gray-500 group-focus-visible:ring blk:text-gray-500 blk:group-hover:text-gray-400 blk:group-focus-visible:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        {doShowPassword && <React.Fragment>
                          <path d="M10 12C10.5304 12 11.0391 11.7893 11.4142 11.4142C11.7893 11.0391 12 10.5304 12 10C12 9.46957 11.7893 8.96086 11.4142 8.58579C11.0391 8.21071 10.5304 8 10 8C9.46957 8 8.96086 8.21071 8.58579 8.58579C8.21071 8.96086 8 9.46957 8 10C8 10.5304 8.21071 11.0391 8.58579 11.4142C8.96086 11.7893 9.46957 12 10 12Z" />
                          <path fillRule="evenodd" clipRule="evenodd" d="M0.458008 10C1.73201 5.943 5.52201 3 10 3C14.478 3 18.268 5.943 19.542 10C18.268 14.057 14.478 17 10 17C5.52201 17 1.73201 14.057 0.458008 10ZM14 10C14 11.0609 13.5786 12.0783 12.8284 12.8284C12.0783 13.5786 11.0609 14 10 14C8.93914 14 7.92173 13.5786 7.17158 12.8284C6.42143 12.0783 6.00001 11.0609 6.00001 10C6.00001 8.93913 6.42143 7.92172 7.17158 7.17157C7.92173 6.42143 8.93914 6 10 6C11.0609 6 12.0783 6.42143 12.8284 7.17157C13.5786 7.92172 14 8.93913 14 10Z" />
                        </React.Fragment>}
                        {!doShowPassword && <React.Fragment>
                          <path fillRule="evenodd" clipRule="evenodd" d="M3.70692 2.29298C3.51832 2.11082 3.26571 2.01003 3.00352 2.01231C2.74132 2.01458 2.49051 2.11975 2.3051 2.30516C2.11969 2.49057 2.01452 2.74138 2.01224 3.00358C2.00997 3.26578 2.11076 3.51838 2.29292 3.70698L16.2929 17.707C16.4815 17.8891 16.7341 17.9899 16.9963 17.9877C17.2585 17.9854 17.5093 17.8802 17.6947 17.6948C17.8801 17.5094 17.9853 17.2586 17.9876 16.9964C17.9899 16.7342 17.8891 16.4816 17.7069 16.293L16.2339 14.82C17.7914 13.5781 18.9432 11.8999 19.5419 9.99998C18.2679 5.94298 14.4779 2.99998 9.99992 2.99998C8.43235 2.99785 6.88642 3.36583 5.48792 4.07398L3.70792 2.29298H3.70692ZM7.96792 6.55298L9.48192 8.06798C9.82101 7.97793 10.1778 7.97853 10.5166 8.06971C10.8554 8.16089 11.1643 8.33946 11.4124 8.58755C11.6604 8.83563 11.839 9.14452 11.9302 9.48331C12.0214 9.8221 12.022 10.1789 11.9319 10.518L13.4459 12.032C13.8969 11.268 14.0811 10.3758 13.9696 9.49566C13.858 8.61554 13.4571 7.79747 12.8297 7.17016C12.2024 6.54284 11.3844 6.14187 10.5042 6.03033C9.62412 5.91878 8.7319 6.10299 7.96792 6.55398V6.55298Z" />
                          <path d="M12.454 16.697L9.75001 13.992C8.77769 13.9311 7.86103 13.5174 7.17206 12.8286C6.4831 12.1398 6.06918 11.2233 6.00801 10.251L2.33501 6.578C1.49022 7.58402 0.852357 8.74692 0.458008 10C1.73201 14.057 5.52301 17 10 17C10.847 17 11.669 16.895 12.454 16.697Z" />
                        </React.Fragment>}
                      </svg>
                    </button>
                  </div>
                </div>
                {isAddLockMyList && <div className={tailwind('mt-5 flex items-center')}>
                  <input onChange={onChangeListNamesInputChange} checked={canChangeListNames} className={tailwind('h-4 w-4 cursor-pointer rounded border-gray-400 bg-white text-blue-500 transition duration-150 ease-in-out focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-400 blk:bg-gray-800 blk:focus:ring-offset-gray-800')} id="change-list-names-input" name="change-list-names-input" type="checkbox" />
                  <label htmlFor="change-list-names-input" className={tailwind('ml-2.5 block cursor-pointer text-sm text-gray-500 blk:text-gray-400')}>When locked, allow to change to other lists</label>
                </div>}
                {isAddLockList && <div className={tailwind(`flex items-center ${isAddLockMyList ? 'mt-3.5' : 'mt-5'}`)}>
                  <input onChange={onExportInputChange} checked={canExport} className={tailwind('h-4 w-4 cursor-pointer rounded border-gray-400 bg-white text-blue-500 transition duration-150 ease-in-out focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-400 blk:bg-gray-800 blk:focus:ring-offset-gray-800')} id="in-export-input" name="in-export-input" type="checkbox" />
                  <label htmlFor="in-export-input" className={tailwind('ml-2.5 block cursor-pointer text-sm text-gray-500 blk:text-gray-400')}>{exportText}</label>
                </div>}
                <div className={tailwind(errMsg ? '' : isAddLockList ? 'pt-5' : 'pt-3.5')}>
                  {errMsg && <p className={tailwind('py-2 text-sm text-red-500')}>{errMsg}</p>}
                  <button onClick={onOkBtnClick} className={tailwind('w-full rounded-full border border-gray-800 bg-gray-800 py-2 text-base font-medium text-gray-50 hover:bg-gray-900 focus:outline-none focus:ring blk:border-gray-500 blk:bg-gray-500 blk:hover:border-gray-400 blk:hover:bg-gray-400 sm:text-sm')} type="button">{btnText}</button>
                </div>
                <div className={tailwind('absolute top-0 right-0 p-1')}>
                  <button onClick={onCancelBtnClick} className={tailwind('group flex h-7 w-7 items-center justify-center focus:outline-none')} aria-label="Close lock editor popup">
                    <svg className={tailwind('h-5 w-5 rounded text-gray-400 group-hover:text-gray-500 group-focus:ring blk:text-gray-500 blk:group-hover:text-gray-400')} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              {isLoadingShown && <div className={tailwind('absolute inset-0 flex items-center justify-center bg-white bg-opacity-25 blk:bg-gray-800 blk:bg-opacity-25')}>
                <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
                  <div />
                </div>
              </div>}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(LockEditorPopup);
