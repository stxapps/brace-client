import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Svg, { Path } from 'react-native-svg';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  updatePopup, updateSelectingLinkId, moveLinks, pinLinks, updateDeleteAction,
  updateListNamesMode, updateCustomEditorPopup,
} from '../actions';
import {
  MY_LIST, TRASH, ADDING, MOVING, UPDATING, COPY_LINK, ARCHIVE, REMOVE, RESTORE, DELETE,
  MOVE_TO, CHANGE, PIN, MANAGE_PIN, PINNED, CARD_ITEM_POPUP_MENU, LIST_NAMES_POPUP,
  PIN_MENU_POPUP, CONFIRM_DELETE_POPUP, LG_WIDTH, LAYOUT_LIST,
  DELETE_ACTION_LINK_COMMANDS, LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
} from '../types/const';
import {
  getListNameMap, getLayoutType, makeGetPinStatus, getThemeMode,
} from '../selectors';
import {
  getListNameDisplayName, getAllListNames, getLastHalfHeight,
} from '../utils';
import cache from '../utils/cache';

import { withTailwind } from '.';
import MenuPopupRenderer from './MenuPopupRenderer';

class CardItemMenuPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.menuBtn = React.createRef();
    this.didClick = false;
  }

  populateMenu() {

    const {
      listName, listNameMap, link, pinStatus, layoutType, safeAreaWidth,
    } = this.props;

    let menu = null;
    if (listName in CARD_ITEM_POPUP_MENU) {
      menu = CARD_ITEM_POPUP_MENU[listName];
    } else {
      menu = CARD_ITEM_POPUP_MENU[MY_LIST];
    }

    if (listName === MY_LIST && getAllListNames(listNameMap).length === 3) {
      menu = menu.slice(0, -1);
    }

    if (
      [ADDING, MOVING, UPDATING].includes(link.status) ||
      ![null, PINNED].includes(pinStatus)
    ) {
      menu = menu.slice(0, 1);
    } else if (listName !== TRASH) {
      // Only when no other pending actions and list name is not TRASH
      if (pinStatus === PINNED) menu = [...menu, MANAGE_PIN];
      else if (pinStatus === null) menu = [...menu, PIN];

      menu = [...menu, CHANGE];
    }

    if (layoutType === LAYOUT_LIST && safeAreaWidth >= LG_WIDTH) {
      menu = menu.filter(text => ![ARCHIVE, REMOVE, RESTORE].includes(text));
    }

    return { menu };
  }

  onMenuBtnClick = () => {
    this.props.updatePopup(this.props.link.id, true, null);
    this.didClick = false;
  }

  onMenuPopupClick = (text) => {
    if (!text || this.didClick) return true;

    const { id, url } = this.props.link;

    if (text === COPY_LINK) {
      Clipboard.setString(url);
    } else if (text === ARCHIVE) {
      this.props.moveLinks(ARCHIVE, [id]);
    } else if (text === REMOVE) {
      this.props.moveLinks(TRASH, [id]);
    } else if (text === RESTORE) {
      this.props.moveLinks(MY_LIST, [id]);
    } else if (text === DELETE) {
      this.props.updateDeleteAction(DELETE_ACTION_LINK_COMMANDS);
      this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
      return false;
    } else if (text === MOVE_TO) {
      this.menuBtn.current.measure((_fx, _fy, width, height, x, y) => {
        this.props.updateSelectingLinkId(id);
        this.props.updateListNamesMode(
          LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
        );

        const newX = x + 8;
        const newY = y + 12;
        const newWidth = width - 8 - 12;
        const newHeight = height - 12 - 0;
        const rect = {
          x: newX, y: newY, width: newWidth, height: newHeight,
          top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
        };
        this.props.updatePopup(LIST_NAMES_POPUP, true, rect);
        this.props.updatePopup(this.props.link.id, false);
      });

      this.didClick = true;
      return true;
    } else if (text === PIN) {
      this.props.pinLinks([id]);
    } else if (text === MANAGE_PIN) {
      this.menuBtn.current.measure((_fx, _fy, width, height, x, y) => {
        this.props.updateSelectingLinkId(id);

        const newX = x + 8;
        const newY = y + 12;
        const newWidth = width - 8 - 12;
        const newHeight = height - 12 - 0;
        const rect = {
          x: newX, y: newY, width: newWidth, height: newHeight,
          top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
        };
        this.props.updatePopup(PIN_MENU_POPUP, true, rect);
        this.props.updatePopup(this.props.link.id, false);
      });

      this.didClick = true;
      return true;
    } else if (text === CHANGE) {
      this.props.updateCustomEditorPopup(true, id);
    } else {
      console.log(`In CardItemMenuPopup, invalid text: ${text}`);
    }

    this.props.updatePopup(this.props.link.id, false);
    this.didClick = true;
    return true;
  }

  onMenuBackdropPress = () => {
    this.props.updatePopup(this.props.link.id, false);
  }

  renderMenu() {
    const { listNameMap, tailwind } = this.props;
    const { menu } = this.populateMenu();

    return (
      <React.Fragment>
        {menu.map(text => {
          let displayText = text;
          if (text === ARCHIVE) displayText = getListNameDisplayName(text, listNameMap);
          return (
            <MenuOption key={text} onSelect={() => this.onMenuPopupClick(text)} customStyles={cache('CIMP_menuOption', { optionWrapper: { padding: 0 } })}>
              <Text style={tailwind('w-full py-2.5 pl-4 pr-4 text-sm font-normal text-gray-700 blk:text-gray-200')} numberOfLines={1} ellipsizeMode="tail">{displayText}</Text>
            </MenuOption>
          );
        })}
      </React.Fragment>
    );
  }

  render() {
    const { layoutType, safeAreaHeight, tailwind } = this.props;
    const popupStyle = {
      maxHeight: getLastHalfHeight(Math.min(288, safeAreaHeight - 16), 40, 9, 9),
    };

    let menuTriggerView;
    if (layoutType === LAYOUT_LIST) {
      menuTriggerView = (
        <View ref={this.menuBtn} style={tailwind('px-2 py-1')} collapsable={false}>
          <Svg style={tailwind('rounded-full font-normal text-gray-400 blk:text-gray-400')} width={24} height={40} viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <Path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      );
    } else {
      menuTriggerView = (
        <View ref={this.menuBtn} style={[tailwind('flex-shrink-0 flex-grow-0 pt-2 pl-4 pr-2'), { paddingBottom: 6 }]} collapsable={false}>
          <Svg style={tailwind('rounded-full font-normal text-gray-400 blk:text-gray-400')} width={24} height={40} viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <Path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      );
    }

    return (
      /* value of triggerOffsets needs to be aligned with paddings of the three dots */
      <Menu renderer={MenuPopupRenderer} rendererProps={cache('CIMP_menuRendererProps', { triggerOffsets: { x: 8, y: 12, width: -20, height: -12 } })} onOpen={this.onMenuBtnClick} onBackdropPress={this.onMenuBackdropPress}>
        <MenuTrigger>
          {menuTriggerView}
        </MenuTrigger>
        <MenuOptions customStyles={cache('CIMP_menuOptionsCustomStyles', { optionsContainer: [tailwind('z-41 min-w-32 max-w-64 rounded-lg bg-white py-2 shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800'), popupStyle] }, [safeAreaHeight, tailwind])}>
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

const makeMapStateToProps = () => {

  const getPinStatus = makeGetPinStatus();

  const mapStateToProps = (state, props) => {
    const pinStatus = getPinStatus(state, props.link);

    return {
      listName: state.display.listName,
      listNameMap: getListNameMap(state),
      pinStatus,
      layoutType: getLayoutType(state),
      themeMode: getThemeMode(state),
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = {
  updatePopup, updateSelectingLinkId, moveLinks, pinLinks, updateDeleteAction,
  updateListNamesMode, updateCustomEditorPopup,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItemMenuPopup));
