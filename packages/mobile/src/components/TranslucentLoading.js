import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { SHARE_BORDER_RADIUS } from '../types/const';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import logo from '../images/logo-short.svg';

class TranslucentLoading extends React.PureComponent {

  render() {

    return (
      <View style={tailwind('flex-1 justify-end items-center')}>
        <View style={tailwind('absolute inset-0 bg-black opacity-50')} />
        <View style={cache('TL_view', [tailwind('mb-8 justify-center items-center w-40 h-20 bg-white shadow-sm'), SHARE_BORDER_RADIUS])}>
          <SvgXml width={39} height={44} xml={logo} />
        </View>
      </View>
    );
  }
}

export default TranslucentLoading;
