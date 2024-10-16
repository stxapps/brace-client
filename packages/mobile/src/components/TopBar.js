import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import { updatePopup } from '../actions';
import { SIGN_IN_POPUP, SHOW_SIGN_IN, BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';

import { withTailwind } from '.';

import Logo from '../images/logo-short.svg';
import LogoBlk from '../images/logo-short-blk.svg';

class TopBar extends React.PureComponent {

  onSignInBtnClick = () => {
    this.props.updatePopup(SIGN_IN_POPUP, true);
  }

  renderSignInBtn() {
    const { tailwind } = this.props;

    return (
      <TouchableOpacity onPress={this.onSignInBtnClick} style={tailwind('h-14 items-center justify-center')}>
        <View style={tailwind('rounded-full border border-gray-400 bg-white px-2.5 py-1.5')}>
          <Text style={tailwind('text-sm font-normal text-gray-500')}>Sign in</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const {
      rightPane: rightPaneProp, doSupportTheme, themeMode, tailwind,
    } = this.props;

    let rightPane = null;
    if (rightPaneProp === SHOW_SIGN_IN) rightPane = this.renderSignInBtn();

    let topBarStyleClasses = 'bg-white';
    if (doSupportTheme) topBarStyleClasses += ' blk:bg-gray-900';

    return (
      <View style={tailwind(`w-full items-center ${topBarStyleClasses}`)}>
        <View style={tailwind('w-full max-w-6xl')}>
          <View style={tailwind('h-14 flex-row items-center justify-between px-4 md:px-6 lg:px-8')}>
            <View>
              {doSupportTheme && themeMode === BLK_MODE ? <LogoBlk width={28.36} height={32} /> : <Logo width={28.36} height={32} />}
            </View>
            {rightPane}
          </View>
        </View>
      </View>
    );
  }
}

TopBar.propTypes = {
  rightPane: PropTypes.string.isRequired,
  doSupportTheme: PropTypes.bool,
};

TopBar.defaultProps = {
  doSupportTheme: false,
};

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(TopBar));
