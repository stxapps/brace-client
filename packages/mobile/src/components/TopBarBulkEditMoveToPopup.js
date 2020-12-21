import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScrollView, View, Text, Platform } from 'react-native';
import {
  Menu, MenuOptions, MenuOption, MenuTrigger, withMenuContext,
} from 'react-native-popup-menu';
import Svg, { Path } from 'react-native-svg'

import {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
} from '../actions';
import { BULK_EDIT_MOVE_TO_POPUP, ARCHIVE, TRASH, MOVE_TO } from '../types/const';
import { getListNameMap } from '../selectors';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';
import MenuPopoverRenderers from './MenuPopoverRenderer';

class TopBarBulkEditMoveToPopup extends React.PureComponent {

  onBulkEditMoveToBtnClick = () => {
    if (this.props.checkNoLinkIdSelected()) {
      this.props.ctx.menuActions.closeMenu();
      return;
    }
    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, true);
  }

  onBulkEditMoveToPopupClick = (text) => {
    if (!text) return;

    const {
      selectedLinkIds, moveLinks, clearSelectedLinkIds, updateBulkEdit,
    } = this.props;

    if (text.startsWith(MOVE_TO)) {
      moveLinks(text.substring(MOVE_TO.length + 1), selectedLinkIds);
      clearSelectedLinkIds();
      updateBulkEdit(false);
    } else {
      throw new Error(`Invalid text: ${text}`);
    }

    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
  }

  onBulkEditMoveToCancelBtnClick = () => {
    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
  }

  renderMenu(moveTo) {

    return moveTo.map(listNameObj => {
      const key = MOVE_TO + ' ' + listNameObj.listName;
      return (
        <MenuOption key={key} onSelect={() => this.onBulkEditMoveToPopupClick(key)} customStyles={cache('TBBEMTP_menuOptionCustomStyles', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2 pl-4 pr-4 w-full text-base text-gray-800 font-normal')} numberOfLines={1} ellipsizeMode="tail">{listNameObj.displayName}</Text>
        </MenuOption>
      );
    });
  }

  renderBulkEditMoveToPopup() {

    const { safeAreaHeight } = this.props;

    const moveTo = [];
    for (const listNameObj of this.props.listNameMap) {
      if ([TRASH, ARCHIVE].includes(listNameObj.listName)) continue;
      if (this.props.listName === listNameObj.listName) continue;

      moveTo.push(listNameObj);
    }

    // As popover has an anchor laying out with flex (different to Popup),
    //   max height is used for height.
    // 39dp per row plus padding
    const textHeight = Platform.select({ ios: 36, android: 39 })
    const popupStyle = {
      height: Math.min((textHeight * moveTo.length) + 12, 256, safeAreaHeight - 16),
    };

    return (
      <MenuOptions customStyles={cache('TBBEMTP_menuOptionsCustomStyles', { optionsContainer: [tailwind('pt-2 pb-1 min-w-28 max-w-64 bg-white rounded-lg shadow-xl'), popupStyle] }, [moveTo.length, safeAreaHeight])}>
        <ScrollView>
          {this.renderMenu(moveTo)}
        </ScrollView>
      </MenuOptions>
    );
  }

  render() {

    let btnStyle = {
      height: 34,
      paddingLeft: 10,
      paddingRight: 12,
    };
    btnStyle = cache('TBBEMTP_btn', [tailwind('flex-row justify-center items-center bg-white border border-gray-700 rounded-full shadow-sm'), btnStyle]);
    const anchorClasses = Platform.select({ ios: 'z-10', android: 'shadow-xl' })

    return (
      <Menu renderer={MenuPopoverRenderers} rendererProps={cache('TBBEMTP_menuRendererProps', { preferredPlacement: 'bottom', anchorStyle: tailwind(anchorClasses) })} onOpen={this.onBulkEditMoveToBtnClick} onClose={this.onBulkEditMoveToCancelBtnClick}>
        <MenuTrigger>
          <View style={tailwind('ml-4')}>
            <View style={btnStyle}>
              <Svg style={tailwind('text-base text-gray-600 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                <Path d="M4 3C2.89543 3 2 3.89543 2 5C2 6.10457 2.89543 7 4 7H16C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3H4Z" />
                <Path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V8ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H9C8.44772 12 8 11.5523 8 11Z" />
              </Svg>
              <Text style={tailwind('ml-1 text-base text-gray-700 font-normal')}>Move to...</Text>
            </View>
          </View>
        </MenuTrigger>
        {this.renderBulkEditMoveToPopup()}
      </Menu>
    );
  }
}

TopBarBulkEditMoveToPopup.propTypes = {
  checkNoLinkIdSelected: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    selectedLinkIds: state.display.selectedLinkIds,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(withMenuContext(TopBarBulkEditMoveToPopup)));
