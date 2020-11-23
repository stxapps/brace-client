import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScrollView, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg'
import {
  Menu, MenuOptions, MenuOption, MenuTrigger,
} from 'react-native-popup-menu';

import {
  changeListName, updatePopup,
} from '../actions';
import {
  LIST_NAME_POPUP,
  SM_WIDTH, MD_WIDTH, LG_WIDTH,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName, getLongestListNameDisplayName } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext, getTopBarSizes } from '.';
import MenuPopupRenderer from './MenuPopupRenderer';

class ListName extends React.PureComponent {

  onListNameBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, true);
  };

  onListNamePopupClick = (newListName) => {

    this.props.changeListName(newListName, this.props.fetched);
    this.props.fetched.push(newListName);

    return true;
  };

  onListNameCancelBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, false);
  };

  renderListNamePopup() {

    const { listNameMap, safeAreaHeight } = this.props;

    const longestDisplayNameLength = getLongestListNameDisplayName(listNameMap).length;

    const popupScrollViewStyle = { width: 112, maxHeight: Math.min(256, safeAreaHeight) };
    if (longestDisplayNameLength > 7) {
      // Approx 8dp per additional character
      const width = Math.min(112 + 8 * (longestDisplayNameLength - 7), 256);
      popupScrollViewStyle.width = width;
    }

    return (
      <ScrollView style={cache('LN_scrollView', popupScrollViewStyle, [longestDisplayNameLength, safeAreaHeight])}>
        {listNameMap.map(listNameObj => {
          return (
            <MenuOption key={listNameObj.listName} onSelect={() => this.onListNamePopupClick(listNameObj.listName)} customStyles={cache('LN_menuOption', { optionWrapper: { padding: 0 } })}>
              <Text style={tailwind('py-2 pl-4 pr-2 w-full text-base text-gray-800 font-normal')} numberOfLines={1} ellipsizeMode="tail">{listNameObj.displayName}</Text>
            </MenuOption>
          );
        })}
      </ScrollView>
    );
  }

  render() {

    const { listName, listNameMap, safeAreaWidth } = this.props;

    const displayName = getListNameDisplayName(listName, listNameMap);

    // value of triggerOffsets needs to be aligned with paddings of the MenuTrigger
    const triggerOffsets = { x: 0, y: 0, width: 0, height: 0 };
    if (safeAreaWidth >= MD_WIDTH) {
      triggerOffsets.x = 0;
      triggerOffsets.y = 0;
    }
    if (safeAreaWidth >= LG_WIDTH) {
      triggerOffsets.x = 0;
      triggerOffsets.y = 0;
    }

    let textMaxWidth = 160;
    if (safeAreaWidth >= SM_WIDTH) textMaxWidth = 320;
    if (safeAreaWidth >= LG_WIDTH) textMaxWidth = 512;

    if (safeAreaWidth >= SM_WIDTH) {
      const {
        headerPaddingX, commandsWidth,
        listNameDistanceX, listNameArrowWidth, listNameArrowSpace,
      } = getTopBarSizes(safeAreaWidth);
      const headerSpaceLeftover = safeAreaWidth - headerPaddingX - listNameDistanceX - listNameArrowWidth - listNameArrowSpace - commandsWidth - 4;

      textMaxWidth = Math.min(textMaxWidth, headerSpaceLeftover)
    }
    const textStyle = { maxWidth: textMaxWidth };

    return (
      <React.Fragment>
        <Menu renderer={MenuPopupRenderer} rendererProps={cache('LN_rendererProps', { triggerOffsets: triggerOffsets, popupStyle: tailwind('py-2 bg-white border border-gray-200 rounded-lg shadow-xl') }, safeAreaWidth)} onOpen={this.onListNameBtnClick} onClose={this.onListNameCancelBtnClick}>
          <MenuTrigger>
            {/* Change the paddings here, need to change triggerOffsets too */}
            <View style={tailwind('flex-row items-center')}>
              <Text style={cache('LN_text', [tailwind('text-lg text-gray-900 font-semibold leading-7', safeAreaWidth), textStyle], safeAreaWidth)} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
              <Svg style={tailwind('ml-1 w-5 h-5 text-base text-black font-normal')} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <Path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </MenuTrigger>
          <MenuOptions>
            {this.renderListNamePopup()}
          </MenuOptions>
        </Menu>
      </React.Fragment>
    );
  }
}

ListName.propTypes = {
  fetched: PropTypes.arrayOf(PropTypes.string),
};

const mapStateToProps = (state, props) => {

  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  }
};

const mapDispatchToProps = {
  changeListName, updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(ListName));
