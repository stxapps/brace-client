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

    const { listName, safeAreaWidth, safeAreaHeight } = this.props;

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

    return (
      <React.Fragment>
        <Menu renderer={MenuPopupRenderer} rendererProps={{ triggerOffsets: triggerOffsets, popupStyle: tailwind('py-2 min-w-32 bg-white border border-gray-200 rounded-lg shadow-xl') }} onOpen={this.onListNameBtnClick} onClose={this.onListNameCancelBtnClick}>
          <MenuTrigger>
            {/* Change the paddings here, need to change triggerOffsets too */}
            <View style={tailwind('flex-row items-center')}>
              <Text style={tailwind('text-lg text-gray-900 font-semibold leading-7')}>{listName}</Text>
              <Svg style={tailwind('ml-1 w-5 h-5 text-black')} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <Path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </MenuTrigger>
          <MenuOptions>
            <ScrollView style={{ maxHeight: safeAreaHeight }}>
              {this.renderListNamePopup()}
            </ScrollView>
          </MenuOptions>
        </Menu>
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
