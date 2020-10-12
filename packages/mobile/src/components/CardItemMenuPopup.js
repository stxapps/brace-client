import React from 'react';
import { connect } from 'react-redux';
import {
  ScrollView, View, Linking, LayoutAnimation,
} from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Svg, { Path } from 'react-native-svg'
import Clipboard from '@react-native-community/clipboard'

import {
  updatePopup, moveLinks,
} from '../actions';
import {
  MY_LIST, TRASH,
  ADDING, MOVING,
  OPEN, COPY_LINK, ARCHIVE, REMOVE, RESTORE, DELETE, MOVE_TO,
  CARD_ITEM_POPUP_MENU, CONFIRM_DELETE_POPUP,
} from '../types/const';
import { getListNames } from '../selectors';
import {
  ensureContainUrlProtocol,
} from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { InterText as Text, withSafeAreaContext } from '.';
import MenuPopupRenderer from './MenuPopupRenderer';

class CardItemMenuPopup extends React.PureComponent {

  populateMenu() {
    const { link, listName, listNames } = this.props;

    let menu = null;
    if (listName in CARD_ITEM_POPUP_MENU) {
      menu = CARD_ITEM_POPUP_MENU[listName];
    } else {
      menu = CARD_ITEM_POPUP_MENU[MY_LIST];
    }
    if ([ADDING, MOVING].includes(link.status)) {
      menu = menu.slice(0, 2);
    }

    const moveTo = [];
    if (menu.includes(MOVE_TO)) {
      for (const name of listNames) {
        if ([TRASH, ARCHIVE].includes(name)) continue;
        if (listName === name) continue;

        moveTo.push(name);
      }
    }

    menu = menu.filter(text => text !== MOVE_TO);

    return { menu, moveTo };
  }

  onMenuBtnClick = () => {
    this.props.updatePopup(this.props.link.id, true, null);
  }

  onMenuPopupClick = (text) => {

    if (text) {
      const { id, url } = this.props.link;
      const { safeAreaWidth } = this.props;
      const animConfig = cardItemAnimConfig(safeAreaWidth);

      if (text === OPEN) {
        Linking.openURL(ensureContainUrlProtocol(url));
      } else if (text === COPY_LINK) {
        Clipboard.setString(url);
      } else if (text === ARCHIVE) {
        LayoutAnimation.configureNext(animConfig);
        this.props.moveLinks(ARCHIVE, [id]);
      } else if (text === REMOVE) {
        LayoutAnimation.configureNext(animConfig);
        this.props.moveLinks(TRASH, [id]);
      } else if (text === RESTORE) {
        LayoutAnimation.configureNext(animConfig);
        this.props.moveLinks(MY_LIST, [id]);
      } else if (text.startsWith(MOVE_TO)) {
        LayoutAnimation.configureNext(animConfig);
        this.props.moveLinks(text.substring(MOVE_TO.length + 1), [id]);
      } else if (text === DELETE) {
        this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
        return false;
      } else {
        throw new Error(`Invalid text: ${text}`);
      }
    }

    this.props.updatePopup(this.props.link.id, false);
    return true;
  }

  onMenuBackdropPress = () => {
    this.props.updatePopup(this.props.link.id, false);
  }

  renderMenu() {
    const { menu: _menu, moveTo: _moveTo } = this.populateMenu();

    let moveTo = null;
    if (_moveTo && _moveTo.length) {
      moveTo = (
        <React.Fragment>
          <Text style={tailwind('py-2 pl-4 pr-4 text-gray-800')}>{MOVE_TO}</Text>
          {_moveTo.map(text => {
            const key = MOVE_TO + ' ' + text;
            return (
              <MenuOption key={key} onSelect={() => this.onMenuPopupClick(key)} customStyles={{ optionWrapper: { padding: 0 } }}>
                <Text style={tailwind('py-2 pl-6 pr-4 text-gray-800')}>{text}</Text>
              </MenuOption>
            );
          })}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {_menu.map(text => {
          return (
            <MenuOption key={text} onSelect={() => this.onMenuPopupClick(text)} customStyles={{ optionWrapper: { padding: 0 } }}>
              <Text style={tailwind('py-2 pl-4 pr-4 text-gray-800')}>{text}</Text>
            </MenuOption>
          );
        })}
        {moveTo && moveTo}
      </React.Fragment>
    );
  }

  render() {

    const { safeAreaHeight } = this.props;

    return (
      /* value of triggerOffsets needs to be aligned with paddings of the three dots */
      <Menu renderer={MenuPopupRenderer} rendererProps={{ triggerOffsets: { x: 8, y: (16 - 4), width: -1 * (16 + 8 - 4), height: -6 }, popupStyle: tailwind('py-2 min-w-32 bg-white border border-gray-200 rounded-lg shadow-xl') }} onOpen={this.onMenuBtnClick} onBackdropPress={this.onMenuBackdropPress}>
        <MenuTrigger>
          {/* View with paddingBottom is required because there is this space on the web. */}
          <View style={{ paddingBottom: 6 }}>
            {/* Change the paddings here, need to change triggerOffsets too */}
            <View style={tailwind('pt-2 pb-0 pl-4 pr-2 flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('py-2 w-6 h-10 text-gray-700 rounded-full')} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <Path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </View>
        </MenuTrigger>
        <MenuOptions>
          <ScrollView style={{ maxHeight: safeAreaHeight }}>
            {this.renderMenu()}
          </ScrollView>
        </MenuOptions>
      </Menu>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNames: getListNames(state),
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = {
  updatePopup, moveLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(CardItemMenuPopup));
