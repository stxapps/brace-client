import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';

import { updatePopup } from '../actions';
import { SIGN_IN_POPUP, SHOW_BLANK, SHOW_SIGN_IN, SHOW_COMMANDS } from '../types/const';
import { getThemeMode } from '../selectors';
import cache from '../utils/cache';

import { getTopBarSizes, withTailwind } from '.';

import TopBarCommands from './TopBarCommands';
import TopBarBulkEditCommands from './TopBarBulkEditCommands';
import ListName from './ListName';
import StatusPopup from './StatusPopup';

import shortLogo from '../images/logo-short.svg';

class TopBar extends React.PureComponent {

  onSignInBtnClick = () => {
    this.props.updatePopup(SIGN_IN_POPUP, true);
  }

  renderSignInBtn() {
    const { tailwind } = this.props;

    return (
      <TouchableOpacity onPress={this.onSignInBtnClick} style={tailwind('h-14 items-center justify-center')}>
        <View style={cache('TB_signInBtnView', tailwind('rounded-full border border-gray-400 bg-white px-2.5 py-1.5 shadow-sm'))}>
          <Text style={tailwind('text-sm font-normal text-gray-500')}>Sign in</Text>
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

    let space4 = ((headerHeight - listNameHeight) / 2) + 3;

    const changingTranslateX = scrollY.interpolate({
      inputRange: [0, listNameDistanceY],
      outputRange: [0, listNameDistanceX],
      extrapolate: 'clamp',
    });
    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, listNameDistanceY],
      outputRange: [
        space1 * -1 - space2 + headerListNameSpace + (laidTopBarHeight - topBarHeight),
        space1 * -1 - space2 - space3 + space4 + (laidTopBarHeight - headerHeight),
      ],
      extrapolate: 'clamp',
    });

    const listNameStyle = {
      transform: [{ translateX: changingTranslateX }, { translateY: changingTranslateY }],
    };

    return (
      <Animated.View style={listNameStyle}>
        <ListName />
      </Animated.View>
    );
  }

  renderStatusPopup() {
    const { scrollY, safeAreaWidth } = this.props;
    const {
      topBarHeight, headerHeight, listNameHeight, statusPopupHeight, headerListNameSpace,
      laidStatusPopupHeight, laidTopBarHeight,
      statusPopupDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const space1 = ((laidStatusPopupHeight - statusPopupHeight) / 2) + 1.5;
    const space2 = listNameHeight - statusPopupHeight;

    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, statusPopupDistanceY],
      outputRange: [
        space1 * -1 + headerListNameSpace + space2 + (laidTopBarHeight - topBarHeight),
        space1 * -1 + headerListNameSpace + space2 + (laidTopBarHeight - headerHeight) - statusPopupDistanceY,
      ],
      extrapolate: 'clamp',
    });
    const changingOpacity = scrollY.interpolate({
      inputRange: [0, statusPopupDistanceY],
      outputRange: [1.0, 0.0],
      extrapolate: 'clamp',
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
        space1 * -1 - space2 - space3 + space4 + (laidTopBarHeight - headerHeight),
      ],
      extrapolate: 'clamp',
    });

    const commandsStyle = { transform: [{ translateY: changingTranslateY }] };
    return (
      <Animated.View style={commandsStyle}>
        {isBulkEditing ? <TopBarBulkEditCommands /> : <TopBarCommands />}
      </Animated.View>
    );
  }

  render() {
    const { tailwind } = this.props;
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
          headerHeight - laidTopBarHeight,
        ],
        extrapolate: 'clamp',
      });
      const changingHeaderTranslateY = scrollY.interpolate({
        inputRange: [0, listNameDistanceY],
        outputRange: [
          laidTopBarHeight - topBarHeight,
          laidTopBarHeight - headerHeight,
        ],
        extrapolate: 'clamp',
      });
      const changingHeaderBorderOpacity = scrollY.interpolate({
        inputRange: [0, listNameDistanceY - 1, listNameDistanceY],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp',
      });

      topBarStyleClasses = 'absolute inset-x-0 top-0 bg-white z-30';
      topBarStyle = { transform: [{ translateY: changingTopBarTranslateY }] };
      headerStyle = { transform: [{ translateY: changingHeaderTranslateY }] };
      headerBorderStyle = { opacity: changingHeaderBorderOpacity };

      listNamePane = (
        <React.Fragment>
          <View style={tailwind('h-7 flex-row items-center justify-end px-4 md:px-6 lg:px-8')}>
            {this.renderStatusPopup()}
          </View>
          <View style={[tailwind('flex-row items-center justify-between px-4 md:px-6 lg:px-8'), { height: laidListNameCommandsHeight }]}>
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
      <Animated.View style={[tailwind(`w-full items-center ${topBarStyleClasses}`), topBarStyle]}>
        <View style={tailwind('w-full max-w-6xl')}>
          <Animated.View style={headerStyle}>
            <View style={tailwind('h-14 flex-row items-center justify-between px-4 md:px-6 lg:px-8')}>
              <View>
                <SvgXml width={28.36} height={32} xml={shortLogo} />
              </View>
              {rightPane}
            </View>
            <Animated.View style={[tailwind('h-px w-full bg-gray-200'), headerBorderStyle]} />
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
};

const mapStateToProps = (state, props) => {
  return {
    isBulkEditing: state.display.isBulkEditing,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(TopBar));
