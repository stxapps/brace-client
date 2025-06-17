import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup } from '../actions';
import { updateSelectingListName, updateLockAction } from '../actions/chunk';
import {
  PC_100, TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  SM_WIDTH, MD_WIDTH, LOCK_EDITOR_POPUP, LOCK_ACTION_UNLOCK_LIST, LOCKED,
} from '../types/const';
import { getCurrentLockListStatus } from '../selectors';
import { addRem } from '../utils';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const LockPanel = (props) => {

  const { columnWidth } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const listName = useSelector(state => state.display.listName);
  const lockStatus = useSelector(state => getCurrentLockListStatus(state));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onLockBtnClick = () => {
    dispatch(updateSelectingListName(listName));
    dispatch(updateLockAction(LOCK_ACTION_UNLOCK_LIST));
    dispatch(updatePopup(LOCK_EDITOR_POPUP, true));
  };

  if (lockStatus !== LOCKED) return null;

  let pt = safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD;

  let pb = '1.5rem';
  if (columnWidth === PC_100) {
    pb = addRem(SEARCH_POPUP_HEIGHT, addRem(BOTTOM_BAR_HEIGHT, '1.5rem'));
  }

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };
  const style = { paddingTop: pt, paddingBottom: pb };
  const btnStyle = {
    height: safeAreaWidth < SM_WIDTH ? '2.5rem' : '2.125rem',
    paddingLeft: safeAreaWidth < SM_WIDTH ? '0.75rem' : '0.625rem',
    paddingRight: safeAreaWidth < SM_WIDTH ? '0.875rem' : '0.75rem',
  };

  return (
    <div style={canvasStyle} className={tailwind('fixed inset-0 bg-white blk:bg-gray-900')}>
      <div style={style} className={tailwind('mx-auto max-w-6xl px-4 md:px-6 lg:px-8')}>
        <div className={tailwind('pt-6 md:pt-10')}>
          <button onClick={onLockBtnClick} className={tailwind('group mx-auto mt-6 block w-full max-w-sm focus:outline-none')}>
            <div className={tailwind('mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
              <svg className={tailwind('h-10 w-10 text-gray-500 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M5 9V7C5 5.67392 5.52678 4.40215 6.46447 3.46447C7.40215 2.52678 8.67392 2 10 2C11.3261 2 12.5979 2.52678 13.5355 3.46447C14.4732 4.40215 15 5.67392 15 7V9C15.5304 9 16.0391 9.21071 16.4142 9.58579C16.7893 9.96086 17 10.4696 17 11V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V11C3 10.4696 3.21071 9.96086 3.58579 9.58579C3.96086 9.21071 4.46957 9 5 9ZM13 7V9H7V7C7 6.20435 7.31607 5.44129 7.87868 4.87868C8.44129 4.31607 9.20435 4 10 4C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7Z" />
              </svg>
            </div>
            <h3 className={tailwind('mt-6 text-center text-lg font-medium text-gray-800 blk:text-gray-200')}>This list is locked</h3>
            <div className={tailwind('mt-4 flex items-center justify-center')}>
              <div style={btnStyle} className={tailwind('flex items-center justify-center rounded-full border border-gray-400 bg-white text-sm leading-4 text-gray-500 hover:border-gray-500 hover:text-gray-600 group-focus-visible:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200')}>
                <svg className={tailwind('w-3.5')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2C8.67392 2 7.40215 2.52678 6.46447 3.46447C5.52678 4.40215 5 5.67392 5 7V9C4.46957 9 3.96086 9.21071 3.58579 9.58579C3.21071 9.96086 3 10.4696 3 11V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H15C15.5304 18 16.0391 17.7893 16.4142 17.4142C16.7893 17.0391 17 16.5304 17 16V11C17 10.4696 16.7893 9.96086 16.4142 9.58579C16.0391 9.21071 15.5304 9 15 9H7V7C6.99975 6.26964 7.26595 5.56428 7.74866 5.01618C8.23138 4.46809 8.89747 4.11491 9.622 4.02289C10.3465 3.93087 11.0798 4.10631 11.6842 4.51633C12.2886 4.92635 12.7227 5.54277 12.905 6.25C12.9713 6.50686 13.1369 6.72686 13.3654 6.86161C13.4786 6.92833 13.6038 6.97211 13.7338 6.99045C13.8639 7.00879 13.9963 7.00133 14.1235 6.9685C14.2507 6.93567 14.3702 6.87811 14.4751 6.79911C14.58 6.7201 14.6684 6.6212 14.7351 6.50806C14.8018 6.39491 14.8456 6.26973 14.8639 6.13966C14.8823 6.00959 14.8748 5.87719 14.842 5.75C14.5645 4.67676 13.9384 3.7261 13.062 3.04734C12.1856 2.36857 11.1085 2.00017 10 2Z" />
                </svg>
                <span className={tailwind('ml-1')}>Unlock</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LockPanel);
