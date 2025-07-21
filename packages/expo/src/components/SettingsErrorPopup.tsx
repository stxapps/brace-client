import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import {
  retryDiedSettings, cancelDiedSettings, updateSettingsPopup,
} from '../actions/chunk';
import { DOMAIN_NAME, HASH_SUPPORT, DIED_UPDATING, SM_WIDTH } from '../types/const';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const InnerSettingsUpdateErrorPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const settingsStatus = useSelector(state => state.display.settingsStatus);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onRetryBtnClick = () => {
    if (didClick.current) return;
    dispatch(retryDiedSettings());
    didClick.current = true;
  };

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(cancelDiedSettings());
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [settingsStatus]);

  if (settingsStatus !== DIED_UPDATING) return null;

  const canvasStyle = {
    paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right,
  };

  return (
    <View style={[tailwind('absolute inset-x-0 top-14 z-40 flex-row items-start justify-center md:top-0'), canvasStyle]}>
      <View style={tailwind('w-full max-w-md')}>
        <View style={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
          <View style={tailwind('flex-row')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('font-normal text-red-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-shrink flex-grow lg:mt-0.5')}>
              <Text style={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Updating Settings Error!</Text>
              <Text style={tailwind('mt-2.5 text-sm font-normal leading-6 text-red-700')}>Please wait a moment and try again. {safeAreaWidth < SM_WIDTH ? '' : '\n'}If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-sm font-normal leading-6 text-red-700 underline')}>contact us</Text>.</Text>
              <View style={tailwind('mt-4')}>
                <View style={tailwind('-mx-2 -my-1.5 flex-row')}>
                  <TouchableOpacity onPress={onRetryBtnClick} style={tailwind('rounded-md bg-red-50 px-2 py-1.5')}>
                    <Text style={tailwind('text-sm font-medium text-red-800')}>Retry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onCancelBtnClick} style={tailwind('ml-3 rounded-md bg-red-50 px-2 py-1.5')}>
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

const InnerSettingsConflictErrorPopup = () => {

  const insets = useSafeAreaInsets();
  const isSettingsPopupShown = useSelector(state => state.display.isSettingsPopupShown);
  const conflictedSettingsContents = useSelector(
    state => state.conflictedSettings.contents
  );
  const [didClose, setDidClose] = useState(false);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onOpenBtnClick = () => {
    if (didClick.current) return;
    dispatch(updateSettingsPopup(true));
    didClick.current = true;
  };

  const onCloseBtnClick = () => {
    if (didClick.current) return;
    setDidClose(true);
    didClick.current = true;
  };

  useEffect(() => {
    if (
      Array.isArray(conflictedSettingsContents) &&
      conflictedSettingsContents.length > 0
    ) {
      setDidClose(false);
    }
    didClick.current = false;
  }, [isSettingsPopupShown, conflictedSettingsContents]);

  if (
    isSettingsPopupShown ||
    !Array.isArray(conflictedSettingsContents) ||
    conflictedSettingsContents.length === 0 ||
    didClose
  ) return null;

  const canvasStyle = {
    paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right,
  };

  return (
    <View style={[tailwind('absolute inset-x-0 top-14 z-40 flex-row items-start justify-center md:top-0'), canvasStyle]}>
      <View style={tailwind('w-full max-w-md')}>
        <View style={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
          <View style={tailwind('flex-row')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('font-normal text-red-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-shrink flex-grow lg:mt-0.5')}>
              <Text style={tailwind('mr-4 text-left text-base font-medium text-red-800 lg:text-sm')}>Settings version conflicts!</Text>
              <Text style={tailwind('mt-2.5 text-sm font-normal leading-6 text-red-700')}>Please go to Settings and manually choose the correct version.</Text>
              <View style={tailwind('mt-4')}>
                <View style={tailwind('-mx-2 -my-1.5 flex-row')}>
                  <TouchableOpacity onPress={onOpenBtnClick} style={tailwind('rounded-md bg-red-50 px-2 py-1.5')}>
                    <Text style={tailwind('text-sm font-medium text-red-800')}>Settings</Text>
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

export const SettingsUpdateErrorPopup = React.memo(InnerSettingsUpdateErrorPopup);
export const SettingsConflictErrorPopup = React.memo(InnerSettingsConflictErrorPopup);
