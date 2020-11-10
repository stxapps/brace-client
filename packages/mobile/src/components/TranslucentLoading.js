import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { SHARE_BORDER_RADIUS } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

import logo from '../images/logo-short.svg';

class TranslucentLoading extends React.PureComponent {

  render() {

    if (!styles.view) styles.view = [tailwind('mb-8 justify-center items-center w-40 h-20 bg-white'), SHARE_BORDER_RADIUS];

    return (
      <View style={tailwind('flex-1 justify-end items-center')}>
        <View style={tailwind('absolute inset-0 bg-black opacity-50')}></View>
        <View style={styles.view}>
          <SvgXml width={39} height={44} xml={logo} />
        </View>
      </View>
    );
  }
}

const styles = {};

export default TranslucentLoading;
