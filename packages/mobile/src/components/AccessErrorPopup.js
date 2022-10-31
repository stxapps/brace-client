import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, signOut } from '../actions';
import { DOMAIN_NAME, HASH_SUPPORT, ACCESS_ERROR_POPUP, SM_WIDTH } from '../types/const';

import { useSafeAreaFrame, useTailwind } from '.';

const AccessErrorPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isAccessErrorPopupShown);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onSignOutBtnClick = () => {
    if (didClick.current) return;
    dispatch(signOut());
    didClick.current = true;
  };

  const onCloseBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(ACCESS_ERROR_POPUP, false));
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [isShown]);

  if (!isShown) return null;

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
              <Text style={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Your access has expired!</Text>
              <Text style={tailwind('mt-2.5 text-sm font-normal leading-6 text-red-700')}>Please sign out and sign in again. {safeAreaWidth < SM_WIDTH ? '' : '\n'}If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-sm font-normal leading-6 text-red-700 underline')}>contact us</Text>.</Text>
              <View style={tailwind('mt-4')}>
                <View style={tailwind('-mx-2 -my-1.5 flex-row')}>
                  <TouchableOpacity onPress={onSignOutBtnClick} style={tailwind('rounded-md bg-red-50 px-2 py-1.5')}>
                    <Text style={tailwind('text-sm font-medium text-red-800')}>Sign out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={onCloseBtnClick} style={tailwind('absolute top-1 right-1 rounded-md bg-red-50 p-1')}>
            <Svg style={tailwind('font-normal text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default React.memo(AccessErrorPopup);
