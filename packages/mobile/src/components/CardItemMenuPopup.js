import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  ScrollView, View, Text, Linking, LayoutAnimation, Platform,
} from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Svg, { Path } from 'react-native-svg'
import Clipboard from '@react-native-community/clipboard'

import { updatePopup, moveLinks } from '../actions';
import {
  MY_LIST, TRASH, ADDING, MOVING,
  OPEN, COPY_LINK, ARCHIVE, REMOVE, RESTORE, DELETE, MOVE_TO,
  CARD_ITEM_POPUP_MENU, CONFIRM_DELETE_POPUP,
} from '../types/const';
import { getListNameMap } from '../selectors';
import {
  ensureContainUrlProtocol, getListNameDisplayName, getLastHalfHeight,
} from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { withSafeAreaContext } from '.';
import MenuPopupRenderer from './MenuPopupRenderer';

class CardItemMenuPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.didClick = false;
  }

  populateMenu() {

    const { link, listName, listNameMap } = this.props;

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
      for (const listNameObj of listNameMap) {
        if ([TRASH, ARCHIVE].includes(listNameObj.listName)) continue;
        if (listName === listNameObj.listName) continue;

        moveTo.push(listNameObj);
      }
    }

    menu = menu.filter(text => text !== MOVE_TO);

    return { menu, moveTo };
  }

  onMenuBtnClick = () => {
    this.props.updatePopup(this.props.link.id, true, null);
    this.didClick = false;
  }

  onMenuPopupClick = (text) => {
    if (!text || this.didClick) return true;

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

    this.props.updatePopup(this.props.link.id, false);
    this.didClick = true;
    return true;
  }

  onMenuBackdropPress = () => {
    this.props.updatePopup(this.props.link.id, false);
  }

  renderMenu() {

    const { listNameMap } = this.props;
    const { menu, moveTo } = this.populateMenu();

    let _moveTo = null;
    if (moveTo && moveTo.length) {
      _moveTo = (
        <React.Fragment>
          <Text style={tailwind('py-2 pl-4 pr-4 w-full text-base text-gray-800 font-normal')}>Move to...</Text>
          {moveTo.map(listNameObj => {
            const key = MOVE_TO + ' ' + listNameObj.listName;
            return (
              <MenuOption key={key} onSelect={() => this.onMenuPopupClick(key)} customStyles={cache('CIMP_menuOption', { optionWrapper: { padding: 0 } })}>
                <Text style={tailwind('py-2 pl-8 pr-4 w-full text-base text-gray-800 font-normal')} numberOfLines={1} ellipsizeMode="tail">{listNameObj.displayName}</Text>
              </MenuOption>
            );
          })}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {menu.map(text => {
          let displayText = text;
          if (text === ARCHIVE) displayText = getListNameDisplayName(text, listNameMap);
          return (
            <MenuOption key={text} onSelect={() => this.onMenuPopupClick(text)} customStyles={cache('CIMP_menuOption', { optionWrapper: { padding: 0 } })}>
              <Text style={tailwind('py-2 pl-4 pr-4 w-full text-base text-gray-800 font-normal')} numberOfLines={1} ellipsizeMode="tail">{displayText}</Text>
            </MenuOption>
          );
        })}
        {_moveTo}
      </React.Fragment>
    );
  }

  render() {

    const { safeAreaHeight } = this.props;

    const textHeight = Platform.select({ ios: 36, android: 39 });
    const popupStyle = {
      maxHeight: getLastHalfHeight(Math.min(288, safeAreaHeight - 16), textHeight, 8, 8),
    };

    return (
      /* value of triggerOffsets needs to be aligned with paddings of the three dots */
      <Menu renderer={MenuPopupRenderer} rendererProps={cache('CIMP_menuRendererProps', { triggerOffsets: { x: 8, y: (16 - 4), width: -1 * (16 + 8 - 4), height: -6 } })} onOpen={this.onMenuBtnClick} onBackdropPress={this.onMenuBackdropPress}>
        <MenuTrigger>
          {/* View with paddingBottom is required because there is this space on the web. */}
          <View style={cache('CIMP_menuTriggerViewStyle', { paddingBottom: 6 })}>
            {/* Change the paddings here, need to change triggerOffsets too */}
            <View style={tailwind('pt-2 pb-0 pl-4 pr-2 flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('py-2 w-6 h-10 text-base text-gray-700 font-normal rounded-full')} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <Path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </View>
        </MenuTrigger>
        <MenuOptions customStyles={cache('CIMP_menuOptionsCustomStyles', { optionsContainer: [tailwind('py-2 min-w-32 max-w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-41'), popupStyle] }, safeAreaHeight)}>
          <ScrollView>
            {this.renderMenu()}
          </ScrollView>
        </MenuOptions>
      </Menu>
    );
  }
}

CardItemMenuPopup.propTypes = {
  link: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = { updatePopup, moveLinks };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(CardItemMenuPopup));
