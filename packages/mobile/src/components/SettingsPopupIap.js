import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

import { tailwind } from '../stylesheets/tailwind';

import { useSafeAreaFrame } from '.';

const _SettingsPopupIap = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
    </View >
  );
};

const _SettingsPopupIapRestore = (props) => {

  const { onBackToIapViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
    </View >
  );
};

export const SettingsPopupIap = React.memo(_SettingsPopupIap);
export const SettingsPopupIapRestore = React.memo(_SettingsPopupIapRestore);
