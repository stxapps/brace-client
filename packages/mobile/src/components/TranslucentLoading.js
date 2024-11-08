import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { SHARE_BORDER_RADIUS } from '../types/const';
import { getThemeMode } from '../selectors';
import cache from '../utils/cache';

import { withTailwind } from '.';

import Logo from '../images/logo-short.svg';

class TranslucentLoading extends React.PureComponent {

  render() {
    const { tailwind } = this.props;

    return (
      <View style={tailwind('flex-1 items-center justify-end sm:justify-center')}>
        <View style={tailwind('absolute inset-0 bg-black bg-opacity-50')} />
        <View style={cache('TL_view', [tailwind('mb-8 h-20 w-40 items-center justify-center bg-white shadow-sm sm:h-24 sm:w-48'), SHARE_BORDER_RADIUS], [tailwind])}>
          <Logo width={39} height={44} />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
  };
};

export default connect(mapStateToProps)(withTailwind(TranslucentLoading));
