import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SvgXml } from 'react-native-svg'

import { signIn } from '../actions';
import {
  SHOW_BLANK, SHOW_SIGN_IN, SHOW_COMMANDS,
  MD_WIDTH,
} from '../types/const';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext, getTopBarSizes } from '.';

import TopBarCommands from './TopBarCommands';
import TopBarBulkEditCommands from './TopBarBulkEditCommands';
import ListName from './ListName';
import StatusPopup from './StatusPopup';

import shortLogo from '../images/logo-short.svg';
import fullLogo from '../images/logo-full.svg';

class TopBar extends React.PureComponent {

  renderSignInBtn() {
    return (
      <TouchableOpacity onPress={() => this.props.signIn()} style={tailwind('justify-center items-center h-14')}>
        <View style={cache('TB_signInBtnView', [tailwind('bg-white border border-gray-700 rounded-full shadow-sm'), { paddingTop: 5, paddingBottom: 5, paddingLeft: 11, paddingRight: 11 }])}>
          <Text style={tailwind('text-base text-gray-700 font-normal')}>Sign in</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderListName() {

    const { scrollY, safeAreaWidth } = this.props;
    const {
      topBarHeight, headerHeight, listNameHeight, headerListNameSpace,
      laidStatusPopupHeight, laidListNameCommandsHeight, laidTopBarHeight,
      listNameDistanceX, listNameDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const space1 = (laidListNameCommandsHeight - listNameHeight) / 2;
    const space2 = laidStatusPopupHeight;
    const space3 = headerHeight;

    // Start from MD width, align baseline with Brace logo instead of align center
    let space4 = (headerHeight - listNameHeight) / 2;
    if (safeAreaWidth >= MD_WIDTH) space4 += 4;

    const changingTranslateX = scrollY.interpolate({
      inputRange: [0, listNameDistanceY],
      outputRange: [0, listNameDistanceX],
      extrapolate: 'clamp'
    });
    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, listNameDistanceY],
      outputRange: [
        space1 * -1 - space2 + headerListNameSpace + (laidTopBarHeight - topBarHeight),
        space1 * -1 - space2 - space3 + space4 + (laidTopBarHeight - headerHeight)
      ],
      extrapolate: 'clamp'
    });

    const listNameStyle = {
      transform: [{ translateX: changingTranslateX }, { translateY: changingTranslateY }]
    };

    return (
      <Animated.View style={listNameStyle}>
        <ListName />
      </Animated.View>
    );
  };

  renderStatusPopup() {

    const { scrollY, safeAreaWidth } = this.props;
    const {
      topBarHeight, headerHeight, listNameHeight, statusPopupHeight, headerListNameSpace,
      laidStatusPopupHeight, laidTopBarHeight,
      statusPopupDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const space1 = (laidStatusPopupHeight - statusPopupHeight) / 2;
    const space2 = listNameHeight - statusPopupHeight;

    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, statusPopupDistanceY],
      outputRange: [
        space1 * -1 + headerListNameSpace + space2 + (laidTopBarHeight - topBarHeight),
        space1 * -1 + headerListNameSpace + space2 + (laidTopBarHeight - headerHeight) - statusPopupDistanceY
      ],
      extrapolate: 'clamp'
    });
    const changingOpacity = scrollY.interpolate({
      inputRange: [0, statusPopupDistanceY],
      outputRange: [1.0, 0.0],
      extrapolate: 'clamp'
    });

    const statusPopupStyle = {
      transform: [{ translateY: changingTranslateY }],
      opacity: changingOpacity,
    };
    return (
      <Animated.View style={statusPopupStyle}>
        <StatusPopup />
      </Animated.View>
    );
  }

  renderCommands() {

    const { scrollY, safeAreaWidth, isBulkEditing } = this.props;
    const {
      topBarHeight, headerHeight, commandsHeight,
      laidStatusPopupHeight, laidListNameCommandsHeight, laidTopBarHeight,
      listNameDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const space1 = (laidListNameCommandsHeight - commandsHeight) / 2;
    const space2 = laidStatusPopupHeight;
    const space3 = headerHeight;
    const space4 = (headerHeight - commandsHeight) / 2;

    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, listNameDistanceY],
      outputRange: [
        space1 * -1 - space2 - space3 + space4 + (laidTopBarHeight - topBarHeight),
        space1 * -1 - space2 - space3 + space4 + (laidTopBarHeight - headerHeight)
      ],
      extrapolate: 'clamp'
    });

    const commandsStyle = { transform: [{ translateY: changingTranslateY }] };
    return (
      <Animated.View style={commandsStyle}>
        {isBulkEditing ? <TopBarBulkEditCommands /> : <TopBarCommands />}
      </Animated.View>
    )
  }

  render() {

    const rightPaneProp = this.props.rightPane;

    let rightPane;
    if (rightPaneProp === SHOW_BLANK) rightPane = null;
    else if (rightPaneProp === SHOW_SIGN_IN) rightPane = this.renderSignInBtn();
    else if (rightPaneProp === SHOW_COMMANDS) rightPane = null;
    else throw new Error(`Invalid rightPane: ${rightPaneProp}`);

    const { isListNameShown, scrollY, safeAreaWidth, insets } = this.props;

    let topBarStyleClasses, topBarStyle, headerStyle, headerBorderStyle, listNamePane;
    if (isListNameShown) {

      const {
        topBarHeight, headerHeight,
        laidTopBarHeight, laidListNameCommandsHeight,
        listNameDistanceY,
      } = getTopBarSizes(safeAreaWidth);

      const changingTopBarTranslateY = scrollY.interpolate({
        inputRange: [0, listNameDistanceY],
        outputRange: [
          topBarHeight - laidTopBarHeight,
          headerHeight - laidTopBarHeight
        ],
        extrapolate: 'clamp'
      });
      const changingHeaderTranslateY = scrollY.interpolate({
        inputRange: [0, listNameDistanceY],
        outputRange: [
          laidTopBarHeight - topBarHeight,
          laidTopBarHeight - headerHeight
        ],
        extrapolate: 'clamp'
      });
      const changingHeaderBorderOpacity = scrollY.interpolate({
        inputRange: [0, listNameDistanceY - 1, listNameDistanceY],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp'
      });

      topBarStyleClasses = 'absolute inset-x-0 top-0 bg-white border-gray-300 z-30';
      topBarStyle = { transform: [{ translateY: changingTopBarTranslateY }] };
      headerStyle = { transform: [{ translateY: changingHeaderTranslateY }] };
      headerBorderStyle = { opacity: changingHeaderBorderOpacity };

      listNamePane = (
        <React.Fragment>
          <View style={tailwind('px-4 flex-row justify-end items-center h-7 md:px-6 lg:px-8', safeAreaWidth)}>
            {this.renderStatusPopup()}
          </View>
          <View style={[tailwind('px-4 flex-row justify-between items-center md:px-6 lg:px-8', safeAreaWidth), { height: laidListNameCommandsHeight }]}>
            {this.renderListName()}
            {rightPaneProp === SHOW_COMMANDS && this.renderCommands()}
          </View>
        </React.Fragment>
      );

      topBarStyle['marginLeft'] = insets.left;
      topBarStyle['marginRight'] = insets.right;
      headerStyle['marginTop'] = insets.top;
    } else {
      topBarStyleClasses = '';
      topBarStyle = {};
      headerStyle = {};
      headerBorderStyle = { opacity: 0 };
      listNamePane = null;
    }

    return (
      <Animated.View style={[tailwind(`items-center w-full ${topBarStyleClasses}`), topBarStyle]}>
        <View style={tailwind('w-full max-w-6xl')}>
          <Animated.View style={headerStyle}>
            <View style={tailwind('px-4 flex-row justify-between items-center h-14 md:px-6 lg:px-8', safeAreaWidth)}>
              <View>
                <SvgXml style={tailwind('md:hidden', safeAreaWidth)} width={28.36} height={32} xml={shortLogo} />
                <SvgXml style={tailwind('hidden md:flex', safeAreaWidth)} width={109.63} height={24} xml={fullLogo} />
              </View>
              {rightPane}
            </View>
            <Animated.View style={[tailwind('w-full h-px bg-gray-300'), headerBorderStyle]}></Animated.View>
          </Animated.View>
          {listNamePane}
        </View>
      </Animated.View >
    );
  }
}

TopBar.propTypes = {
  rightPane: PropTypes.string.isRequired,
  isListNameShown: PropTypes.bool,
  scrollY: PropTypes.object,
};

TopBar.defaultProps = {
  isListNameShown: false,
  scrollY: null,
}

const mapStateToProps = (state, props) => {
  return {
    isBulkEditing: state.display.isBulkEditing,
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = { signIn };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(TopBar));
