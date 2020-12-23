import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScrollView, View, Text, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg'
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import { changeListName, updatePopup } from '../actions';
import {
  LIST_NAME_POPUP, SM_WIDTH, MD_WIDTH, LG_WIDTH,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName, getLastHalfHeight } from '../utils';
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

  renderMenu() {

    const { listNameMap, updates } = this.props;

    return listNameMap.map(listNameObj => {
      return (
        <MenuOption key={listNameObj.listName} onSelect={() => this.onListNamePopupClick(listNameObj.listName)} customStyles={cache('LN_menuOption', { optionWrapper: { padding: 0 } })}>
          <View style={tailwind('py-2 pl-4 pr-4 flex-row items-center w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')} numberOfLines={1} ellipsizeMode="tail">{listNameObj.displayName}</Text>
            {listNameObj.listName in updates && <View style={tailwind('ml-1 flex-grow-0 flex-shrink-0 self-start w-2 h-2 bg-blue-500 rounded-full')}></View>}
          </View>
        </MenuOption>
      );
    });
  }

  renderListNamePopup() {

    const { safeAreaHeight } = this.props;

    const textHeight = Platform.select({ ios: 36, android: 39 });
    const popupStyle = {
      maxHeight: getLastHalfHeight(Math.min(256, safeAreaHeight - 16), textHeight, 8, 8),
    };

    return (
      <MenuOptions customStyles={cache('LN_menuOptionsCustomStyles', { optionsContainer: [tailwind('py-2 min-w-28 max-w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-41'), popupStyle] }, safeAreaHeight)}>
        <ScrollView>
          {this.renderMenu()}
        </ScrollView>
      </MenuOptions>
    );
  }

  render() {

    const { listName, listNameMap, updates, safeAreaWidth } = this.props;
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
      let headerSpaceLeftover = safeAreaWidth - headerPaddingX - listNameDistanceX - listNameArrowWidth - listNameArrowSpace - commandsWidth - 4;
      if (listName in updates) headerSpaceLeftover -= 8;

      textMaxWidth = Math.min(textMaxWidth, headerSpaceLeftover);
    }
    const textStyle = { maxWidth: textMaxWidth };

    return (
      <Menu renderer={MenuPopupRenderer} rendererProps={cache('LN_menuRendererProps', { triggerOffsets: triggerOffsets }, safeAreaWidth)} onOpen={this.onListNameBtnClick} onClose={this.onListNameCancelBtnClick}>
        <MenuTrigger>
          {/* Change the paddings here, need to change triggerOffsets too */}
          <View style={tailwind('flex-row items-center')}>
            <Text style={cache('LN_text', [tailwind('mr-1 text-lg text-gray-900 font-semibold leading-7', safeAreaWidth), textStyle], [safeAreaWidth, updates])} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
            {listName in updates && <View style={tailwind('self-start w-2 h-2 bg-blue-500 rounded-full')}></View>}
            <Svg style={tailwind('text-base text-black font-normal')} width={20} height={20} viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <Path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </MenuTrigger>
        {this.renderListNamePopup()}
      </Menu>
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
    updates: state.fetched,
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  }
};

const mapDispatchToProps = { changeListName, updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(ListName));
