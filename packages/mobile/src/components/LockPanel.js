import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, updateSelectingListName, updateLockAction } from '../actions';
import {
  PC_100, TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH, LOCK_EDITOR_POPUP, LOCK_ACTION_UNLOCK_LIST,
} from '../types/const';
import { addRem, toPx } from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';

const LockPanel = (props) => {

  const { columnWidth } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onLockBtnClick = () => {
    dispatch(updateSelectingListName(listName));
    dispatch(updateLockAction(LOCK_ACTION_UNLOCK_LIST));
    dispatch(updatePopup(LOCK_EDITOR_POPUP, true));
  };

  let pt = safeAreaWidth < MD_WIDTH ? toPx(TOP_BAR_HEIGHT) : toPx(TOP_BAR_HEIGHT_MD);
  pt += safeAreaWidth < MD_WIDTH ? toPx('1.5rem') : toPx('2.5rem');

  let pb = toPx('1.5rem');
  if (columnWidth === PC_100) {
    pb = toPx(addRem(SEARCH_POPUP_HEIGHT, addRem(BOTTOM_BAR_HEIGHT, '1.5rem')));
  }

  const style = { paddingTop: pt, paddingBottom: pb };

  return (
    <ScrollView>
      <View style={[tailwind('max-w-6xl items-center self-center px-4 md:px-6 lg:px-8'), style]}>
        <TouchableOpacity onPress={onLockBtnClick} style={tailwind('my-6 w-full max-w-sm items-center')}>
          <View style={tailwind('h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
            <Svg width={40} height={40} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M5 9V7C5 5.67392 5.52678 4.40215 6.46447 3.46447C7.40215 2.52678 8.67392 2 10 2C11.3261 2 12.5979 2.52678 13.5355 3.46447C14.4732 4.40215 15 5.67392 15 7V9C15.5304 9 16.0391 9.21071 16.4142 9.58579C16.7893 9.96086 17 10.4696 17 11V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V11C3 10.4696 3.21071 9.96086 3.58579 9.58579C3.96086 9.21071 4.46957 9 5 9ZM13 7V9H7V7C7 6.20435 7.31607 5.44129 7.87868 4.87868C8.44129 4.31607 9.20435 4 10 4C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7Z" />
            </Svg>
          </View>
          <Text style={tailwind('mt-6 text-center text-lg font-medium text-gray-800 blk:text-gray-200')}>This list is locked</Text>
          <View style={tailwind('mt-4 items-center justify-center')}>
            <View style={[tailwind('flex-row items-center justify-center rounded-full border border-gray-400 bg-white blk:border-gray-400 blk:bg-gray-900'), { height: 32, paddingLeft: 10, paddingRight: 12 }]}>
              <Svg width={14} height={14} style={tailwind('font-normal text-gray-500 blk:text-gray-300')} viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2C8.67392 2 7.40215 2.52678 6.46447 3.46447C5.52678 4.40215 5 5.67392 5 7V9C4.46957 9 3.96086 9.21071 3.58579 9.58579C3.21071 9.96086 3 10.4696 3 11V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H15C15.5304 18 16.0391 17.7893 16.4142 17.4142C16.7893 17.0391 17 16.5304 17 16V11C17 10.4696 16.7893 9.96086 16.4142 9.58579C16.0391 9.21071 15.5304 9 15 9H7V7C6.99975 6.26964 7.26595 5.56428 7.74866 5.01618C8.23138 4.46809 8.89747 4.11491 9.622 4.02289C10.3465 3.93087 11.0798 4.10631 11.6842 4.51633C12.2886 4.92635 12.7227 5.54277 12.905 6.25C12.9713 6.50686 13.1369 6.72686 13.3654 6.86161C13.4786 6.92833 13.6038 6.97211 13.7338 6.99045C13.8639 7.00879 13.9963 7.00133 14.1235 6.9685C14.2507 6.93567 14.3702 6.87811 14.4751 6.79911C14.58 6.7201 14.6684 6.6212 14.7351 6.50806C14.8018 6.39491 14.8456 6.26973 14.8639 6.13966C14.8823 6.00959 14.8748 5.87719 14.842 5.75C14.5645 4.67676 13.9384 3.7261 13.062 3.04734C12.1856 2.36857 11.1085 2.00017 10 2Z" />
              </Svg>
              <Text style={tailwind('ml-1 text-sm font-normal leading-3.5 text-gray-500 blk:text-gray-300')}>Unlock</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default React.memo(LockPanel);
