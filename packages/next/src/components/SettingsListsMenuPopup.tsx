import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  moveListName, updateListNameEditors, updateListNamesMode, updateLockAction,
  showAddLockEditorPopup,
} from '../actions/chunk';
import {
  SETTINGS_LISTS_MENU_POPUP, LIST_NAMES_POPUP, LOCK_EDITOR_POPUP, MY_LIST, TRASH,
  ARCHIVE, MODE_EDIT, SWAP_LEFT, SWAP_RIGHT, LIST_NAMES_MODE_MOVE_LIST_NAME,
  LIST_NAMES_ANIM_TYPE_POPUP, LOCK, REMOVE_LOCK, LOCK_ACTION_ADD_LOCK_LIST,
  LOCK_ACTION_REMOVE_LOCK_LIST,
} from '../types/const';
import { makeGetListNameEditor, makeGetLockListStatus } from '../selectors';
import { popupBgFMV, popupFMV } from '../types/animConfigs';
import { computePositionStyle } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const SettingsListsMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const getListNameEditor = useMemo(makeGetListNameEditor, []);
  const getLockListStatus = useMemo(makeGetLockListStatus, []);
  const isShown = useSelector(state => state.display.isSettingsListsMenuPopupShown);
  const anchorPosition = useSelector(
    state => state.display.settingsListsMenuPopupPosition
  );
  const selectingListName = useSelector(state => state.display.selectingListName);
  const listNameEditor = useSelector(s => getListNameEditor(s, selectingListName));
  const lockStatus = useSelector(state => getLockListStatus(state, selectingListName));
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(SETTINGS_LISTS_MENU_POPUP, false, null));
    didClick.current = true;
  };

  const onEditBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(updateListNameEditors({
      [selectingListName]: {
        mode: MODE_EDIT,
        msg: '',
        focusCount: listNameEditor.focusCount + 1,
      },
    }));
    didClick.current = true;
  };

  const onMoveUpBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(moveListName(selectingListName, SWAP_LEFT));
    didClick.current = true;
  };

  const onMoveDownBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(moveListName(selectingListName, SWAP_RIGHT));
    didClick.current = true;
  };

  const onMoveToBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();

    dispatch(updateListNamesMode(
      LIST_NAMES_MODE_MOVE_LIST_NAME, LIST_NAMES_ANIM_TYPE_POPUP,
    ));
    dispatch(updatePopup(LIST_NAMES_POPUP, true, anchorPosition));
    didClick.current = true;
  };

  const onDeleteBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(updateListNameEditors({
      [selectingListName]: { isCheckingCanDelete: true },
    }));
    didClick.current = true;
  };

  const onAddLockBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(showAddLockEditorPopup(LOCK_ACTION_ADD_LOCK_LIST));
    didClick.current = true;
  };

  const onRemoveLockBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(updateLockAction(LOCK_ACTION_REMOVE_LOCK_LIST));
    dispatch(updatePopup(LOCK_EDITOR_POPUP, true, null));
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
    <AnimatePresence key="AP_slmPopup" />
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
      <button onClick={onMoveToBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
        <svg className={tailwind('mr-3 w-4 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 16 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0H7L9 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V10C16 10.5304 15.7893 11.0391 15.4142 11.4142C15.0391 11.7893 14.5304 12 14 12H2C1.46957 12 0.960859 11.7893 0.585786 11.4142C0.210714 11.0391 0 10.5304 0 10V2Z" />
        </svg>
        Move to
      </button>
      {![MY_LIST, TRASH, ARCHIVE].includes(selectingListName) && <button onClick={onDeleteBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
        <svg className={tailwind('mr-3.5 w-3.5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 14 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M6 0C5.62123 0 5.27497 0.214 5.10557 0.55279L4.38197 2H1C0.44772 2 0 2.44772 0 3C0 3.55228 0.44772 4 1 4V14C1 15.1046 1.89543 16 3 16H11C12.1046 16 13 15.1046 13 14V4C13.5523 4 14 3.55228 14 3C14 2.44772 13.5523 2 13 2H9.618L8.8944 0.55279C8.725 0.214 8.3788 0 8 0H6ZM4 6C4 5.44772 4.44772 5 5 5C5.55228 5 6 5.44772 6 6V12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12V6ZM9 5C8.4477 5 8 5.44772 8 6V12C8 12.5523 8.4477 13 9 13C9.5523 13 10 12.5523 10 12V6C10 5.44772 9.5523 5 9 5Z" />
        </svg>
        Delete
      </button>}
      {lockStatus === null && <button onClick={onAddLockBtnClick} className={tailwind('group flex w-full items-center py-3 pl-3.5 pr-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
        <svg className={tailwind('mr-3 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M5 9V7C5 5.67392 5.52678 4.40215 6.46447 3.46447C7.40215 2.52678 8.67392 2 10 2C11.3261 2 12.5979 2.52678 13.5355 3.46447C14.4732 4.40215 15 5.67392 15 7V9C15.5304 9 16.0391 9.21071 16.4142 9.58579C16.7893 9.96086 17 10.4696 17 11V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V11C3 10.4696 3.21071 9.96086 3.58579 9.58579C3.96086 9.21071 4.46957 9 5 9ZM13 7V9H7V7C7 6.20435 7.31607 5.44129 7.87868 4.87868C8.44129 4.31607 9.20435 4 10 4C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7Z" />
        </svg>
        {LOCK}
      </button>}
      {lockStatus !== null && <button onClick={onRemoveLockBtnClick} className={tailwind('group flex w-full items-center py-3 pl-3.5 pr-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
        <svg className={tailwind('mr-2.5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2C8.67392 2 7.40215 2.52678 6.46447 3.46447C5.52678 4.40215 5 5.67392 5 7V9C4.46957 9 3.96086 9.21071 3.58579 9.58579C3.21071 9.96086 3 10.4696 3 11V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H15C15.5304 18 16.0391 17.7893 16.4142 17.4142C16.7893 17.0391 17 16.5304 17 16V11C17 10.4696 16.7893 9.96086 16.4142 9.58579C16.0391 9.21071 15.5304 9 15 9H7V7C6.99975 6.26964 7.26595 5.56428 7.74866 5.01618C8.23138 4.46809 8.89747 4.11491 9.622 4.02289C10.3465 3.93087 11.0798 4.10631 11.6842 4.51633C12.2886 4.92635 12.7227 5.54277 12.905 6.25C12.9713 6.50686 13.1369 6.72686 13.3654 6.86161C13.4786 6.92833 13.6038 6.97211 13.7338 6.99045C13.8639 7.00879 13.9963 7.00133 14.1235 6.9685C14.2507 6.93567 14.3702 6.87811 14.4751 6.79911C14.58 6.7201 14.6684 6.6212 14.7351 6.50806C14.8018 6.39491 14.8456 6.26973 14.8639 6.13966C14.8823 6.00959 14.8748 5.87719 14.842 5.75C14.5645 4.67676 13.9384 3.7261 13.062 3.04734C12.1856 2.36857 11.1085 2.00017 10 2Z" />
        </svg>
        {REMOVE_LOCK}
      </button>}
    </div>
  );

  const popupClassNames = 'fixed z-41 min-w-36 overflow-auto rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25';

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
      <motion.div key="SLMP_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="SLMP_popup" ref={popup} style={{ top: safeAreaHeight + 256, left: safeAreaWidth + 256 }} className={tailwind(popupClassNames)} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_slmPopup">
      <motion.button key="SLMP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 z-40 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(SettingsListsMenuPopup);
