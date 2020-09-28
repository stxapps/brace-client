import React from 'react';
import { connect } from 'react-redux';
import {
  ScrollView, View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg'
import {
  Menu, MenuOptions, MenuOption, MenuTrigger,
} from 'react-native-popup-menu';

import {
  changeListName, updatePopup,
} from '../actions';
import {
  LIST_NAME_POPUP,
  MD_WIDTH, LG_WIDTH,
} from '../types/const';
import { getListNames } from '../selectors';
import { tailwind } from '../stylesheets/tailwind';

import { InterText as Text, withSafeAreaContext } from '.';
import MenuPopupRenderer from './MenuPopupRenderer';

import StatusPopup from './StatusPopup';

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
    return (
      this.props.listNames.map(listName => {
        return (
          <MenuOption key={listName} onSelect={() => this.onListNamePopupClick(listName)} customStyles={{ optionWrapper: { padding: 0 } }}>
            <Text style={tailwind('py-2 pl-4 pr-4 text-gray-800')}>{listName}</Text>
          </MenuOption>
        );
      })
    );
  }

  render() {

    const { listName, windowWidth, windowHeight } = this.props;

    // value of triggerOffsets needs to be aligned with paddings of the MenuTrigger
    const triggerOffsets = { x: 16, y: 16, width: 0, height: 0 };
    if (windowWidth >= MD_WIDTH) {
      triggerOffsets.x = 24;
      triggerOffsets.y = 24;
    }
    if (windowWidth >= LG_WIDTH) {
      triggerOffsets.x = 24;
      triggerOffsets.y = 24;
    }

    return (
      <React.Fragment>
        <Menu renderer={MenuPopupRenderer} rendererProps={{ triggerOffsets: triggerOffsets, popupStyle: tailwind('py-2 min-w-32 bg-white border border-gray-200 rounded-lg shadow-xl') }} onOpen={this.onListNameBtnClick} onClose={this.onListNameCancelBtnClick}>
          <MenuTrigger>
            {/* Change the paddings here, need to change triggerOffsets too */}
            <View style={tailwind('px-4 pt-4 pb-6 flex-row items-center w-full md:px-6 md:pt-6 md:pb-10 lg:px-8', windowWidth)}>
              <Text style={tailwind('text-lg text-gray-900 font-semibold')}>{listName}</Text>
              <Svg style={tailwind('ml-1 w-5 h-5 text-black')} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <Path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </MenuTrigger>
          <MenuOptions>
            <ScrollView style={{ maxHeight: windowHeight }}>
              {this.renderListNamePopup()}
            </ScrollView>
          </MenuOptions>
        </Menu>
        <StatusPopup />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {

  return {
    listName: state.display.listName,
    listNames: getListNames(state),
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  }
};

const mapDispatchToProps = {
  changeListName, updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(ListName));
