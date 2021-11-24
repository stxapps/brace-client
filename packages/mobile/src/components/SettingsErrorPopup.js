import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { retryDiedSettings, cancelDiedSettings } from '../actions';
import { DIED_UPDATING, SM_WIDTH } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

const SettingsErrorPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const settingsStatus = useSelector(state => state.display.settingsStatus);
  const dispatch = useDispatch();

  const onRetryBtnClick = () => {
    dispatch(retryDiedSettings());
  };

  const onCancelBtnClick = () => {
    dispatch(cancelDiedSettings());
  };

  if (settingsStatus !== DIED_UPDATING) return null;

  return (
    <View style={tailwind('absolute top-14 inset-x-0 flex-row justify-center items-start md:top-0 z-41', safeAreaWidth)}>
      <View style={tailwind('w-full max-w-md')}>
        <View style={tailwind('m-4 p-4 bg-red-50 rounded-md shadow-lg')}>
          <View style={tailwind('flex-row')}>
            <View style={tailwind('flex-grow-0 flex-shrink-0')}>
              <Svg style={tailwind('text-red-400 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-grow flex-shrink lg:mt-0.5', safeAreaWidth)}>
              <Text style={tailwind('text-base text-red-800 font-medium text-left lg:text-sm', safeAreaWidth)}>Updating Settings Error!</Text>
              <Text style={tailwind('mt-2.5 text-sm text-red-700 font-normal leading-6')}>Please wait a moment and try again. {safeAreaWidth < SM_WIDTH ? '' : '\n'}If the problem persists, please <Text onPress={() => Linking.openURL('https://brace.to/#support')} style={tailwind('text-sm text-red-700 font-normal leading-6 underline')}>contact us</Text>
                <Svg style={tailwind('mb-2 text-red-700 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
                  <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                  <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
                </Svg>.
              </Text>
              <View style={tailwind('mt-4')}>
                <View style={tailwind('-mx-2 -my-1.5 flex-row')}>
                  <TouchableOpacity onPress={onRetryBtnClick} style={tailwind('bg-red-50 px-2 py-1.5 rounded-md')}>
                    <Text style={tailwind('text-sm font-medium text-red-800')}>Retry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onCancelBtnClick} style={tailwind('ml-3 bg-red-50 px-2 py-1.5 rounded-md')}>
                    <Text style={tailwind('text-sm font-medium text-red-800')}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default React.memo(SettingsErrorPopup);
