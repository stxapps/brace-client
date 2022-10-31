import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { cancelDiedPins } from '../actions';
import {
  PIN_LINK_ROLLBACK, UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
} from '../types/actionTypes';
import { DOMAIN_NAME, HASH_SUPPORT, SM_WIDTH } from '../types/const';

import { useSafeAreaFrame, useTailwind } from '.';

const PinErrorPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const pendingPins = useSelector(state => state.pendingPins);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

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
    <View style={tailwind('absolute inset-x-0 top-14 z-40 flex-row items-start justify-center bg-transparent shadow-xl md:top-0')}>
      <View style={tailwind('w-full max-w-md')}>
        <View style={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
          <View style={tailwind('flex-row')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('font-normal text-red-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-shrink flex-grow lg:mt-0.5')}>
              <Text style={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Updating Pins Error!</Text>
              <Text style={tailwind('mt-2.5 text-sm font-normal leading-6 text-red-700')}>Please wait a moment and try again. {safeAreaWidth < SM_WIDTH ? '' : '\n'}If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-sm font-normal leading-6 text-red-700 underline')}>contact us</Text>.</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onCloseBtnClick} style={tailwind('absolute top-1 right-1 rounded-md bg-red-50 p-1.5')}>
            <Svg style={tailwind('font-normal text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default React.memo(PinErrorPopup);
