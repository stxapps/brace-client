import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { cancelDiedPins } from '../actions';
import {
  PIN_LINK_ROLLBACK, UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
} from '../types/actionTypes';
import { DOMAIN_NAME, HASH_SUPPORT, SM_WIDTH } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

import { useSafeAreaFrame } from '.';

const PinErrorPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const pendingPins = useSelector(state => state.pendingPins);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const haveDiedPins = useMemo(() => {
    for (const id in pendingPins) {
      if ([
        PIN_LINK_ROLLBACK, UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
      ].includes(pendingPins[id].status)) return true;
    }
    return false;
  }, [pendingPins]);

  const onCloseBtnClick = () => {
    if (didClick.current) return;
    dispatch(cancelDiedPins());
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [haveDiedPins]);

  if (!haveDiedPins) return null;

  return (
    <View style={tailwind('absolute top-14 inset-x-0 flex-row justify-center items-start bg-transparent shadow-xl z-40 md:top-0', safeAreaWidth)}>
      <View style={tailwind('w-full max-w-md')}>
        <View style={tailwind('m-4 p-4 bg-red-50 rounded-md shadow-lg')}>
          <View style={tailwind('flex-row')}>
            <View style={tailwind('flex-grow-0 flex-shrink-0')}>
              <Svg style={tailwind('text-red-400 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-grow flex-shrink lg:mt-0.5', safeAreaWidth)}>
              <Text style={tailwind('text-base text-red-800 font-medium text-left lg:text-sm', safeAreaWidth)}>Updating Pins Error!</Text>
              <Text style={tailwind('mt-2.5 text-sm text-red-700 font-normal leading-6')}>Please wait a moment and try again. {safeAreaWidth < SM_WIDTH ? '' : '\n'}If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-sm text-red-700 font-normal leading-6 underline')}>contact us</Text>
                <Svg style={tailwind('mb-2 text-red-700 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
                  <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                  <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
                </Svg>.
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onCloseBtnClick} style={tailwind('absolute top-1 right-1 bg-red-50 rounded-md p-1.5')}>
            <Svg style={tailwind('text-red-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default React.memo(PinErrorPopup);
