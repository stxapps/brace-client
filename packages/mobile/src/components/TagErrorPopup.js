import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { retryDiedTags, cancelDiedTags } from '../actions/chunk';
import {
  UPDATE_TAG_DATA_S_STEP_ROLLBACK, UPDATE_TAG_DATA_T_STEP_ROLLBACK,
} from '../types/actionTypes';
import { DOMAIN_NAME, HASH_SUPPORT, SM_WIDTH } from '../types/const';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const TagErrorPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const pendingTags = useSelector(state => state.pendingTags);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const haveDiedTags = useMemo(() => {
    for (const id in pendingTags) {
      if ([
        UPDATE_TAG_DATA_S_STEP_ROLLBACK, UPDATE_TAG_DATA_T_STEP_ROLLBACK,
      ].includes(pendingTags[id].status)) return true;
    }
    return false;
  }, [pendingTags]);

  const onRetryBtnClick = () => {
    if (didClick.current) return;
    dispatch(retryDiedTags());
    didClick.current = true;
  };

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(cancelDiedTags());
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [pendingTags]);

  if (!haveDiedTags) return null;

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
              <Text style={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Updating Tags Error!</Text>
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

export default React.memo(TagErrorPopup);
