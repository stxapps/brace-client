import React from 'react';
import PropTypes from 'prop-types';
import { View, Animated } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';

import { SHOW_COMMANDS, BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';

import { getTopBarSizes, withTailwind } from '.';

import TopBarCommands from './TopBarCommands';
import TopBarBulkEditCommands from './TopBarBulkEditCommands';
import TopBarTitle from './TopBarTitle';
import StatusPopup from './StatusPopup';

import shortLogo from '../images/logo-short.svg';
import shortLogoBlk from '../images/logo-short-blk.svg';

class TopBarMain extends React.PureComponent {

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

    let space4 = ((headerHeight - listNameHeight) / 2);

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
        <TopBarTitle />
      </Animated.View>
    );
  }

  renderStatusPopup() {
    const { scrollY, safeAreaWidth } = this.props;
    const {
      topBarHeight, headerHeight, listNameHeight, statusPopupHeight, headerListNameSpace,
      laidStatusPopupHeight, laidTopBarHeight, statusPopupDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const space1 = ((laidStatusPopupHeight - statusPopupHeight) / 2) + 3;
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
    const {
      rightPane: rightPaneProp, themeMode, safeAreaWidth, insets, tailwind,
    } = this.props;

    let rightPane = null;
    if (rightPaneProp === SHOW_COMMANDS) rightPane = null;

    const { scrollY } = this.props;
    const {
      topBarHeight, headerHeight, laidTopBarHeight, laidListNameCommandsHeight,
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

    const topBarStyle = { transform: [{ translateY: changingTopBarTranslateY }] };
    const headerStyle = { transform: [{ translateY: changingHeaderTranslateY }] };
    const headerBorderStyle = { opacity: changingHeaderBorderOpacity };
    const topBarStyleClasses = 'absolute inset-x-0 top-0 z-30 bg-white blk:bg-gray-900';

    const listNamePane = (
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

    return (
      <Animated.View style={[tailwind(`w-full items-center ${topBarStyleClasses}`), topBarStyle]}>
        <View style={tailwind('w-full max-w-6xl')}>
          <Animated.View style={headerStyle}>
            <View style={tailwind('h-14 flex-row items-center justify-between px-4 md:px-6 lg:px-8')}>
              <View>
                <SvgXml width={28.36} height={32} xml={themeMode === BLK_MODE ? shortLogoBlk : shortLogo} />
              </View>
              {rightPane}
            </View>
            <Animated.View style={[tailwind('h-px w-full bg-gray-200 blk:bg-gray-700'), headerBorderStyle]} />
          </Animated.View>
          {listNamePane}
        </View>
      </Animated.View >
    );
  }
}

TopBarMain.propTypes = {
  rightPane: PropTypes.string.isRequired,
  scrollY: PropTypes.string.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    isBulkEditing: state.display.isBulkEditing,
    themeMode: getThemeMode(state),
  };
};

export default connect(mapStateToProps, null)(withTailwind(TopBarMain));
