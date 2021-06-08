import React from 'react';
import { connect } from 'react-redux';
import {
  ScrollView, Text, TouchableOpacity, Animated, BackHandler, Platform,
} from 'react-native';

import { updatePopup, updateBulkEdit, moveLinks } from '../actions';
import {
  BULK_EDIT_MOVE_TO_POPUP, ARCHIVE, TRASH, MOVE_TO,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getLastHalfHeight } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { bModalOpenAnimConfig, bModalCloseAnimConfig } from '../types/animConfigs';

class BottomBarBulkEditMoveToPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { didCloseAnimEnd: !props.isBulkEditMoveToPopupShown, popupSize: null };
    this.popuptranslateY = new Animated.Value(999);

    this.didClick = false;
  }

  componentDidMount() {
    this.registerPopupBackHandler(this.props.isBulkEditMoveToPopupShown);
  }

  componentDidUpdate(prevProps, prevState) {

    const { isBulkEditMoveToPopupShown } = this.props;
    if (prevProps.isBulkEditMoveToPopupShown !== isBulkEditMoveToPopupShown) {
      this.registerPopupBackHandler(isBulkEditMoveToPopupShown);
    }

    if (!prevState.popupSize && this.state.popupSize) {
      Animated.spring(
        this.popuptranslateY, { toValue: 0, ...bModalOpenAnimConfig }
      ).start();
    }

    if (prevProps.isBulkEditMoveToPopupShown && !isBulkEditMoveToPopupShown) {
      // There was an error about null has no some property
      //   when the move to popup is shown and rotate so guees it's here.
      const toValue = this.state.popupSize ? this.state.popupSize.height : 999;
      Animated.spring(
        this.popuptranslateY,
        { toValue, ...bModalCloseAnimConfig }
      ).start(() => {
        this.setState({ didCloseAnimEnd: true });;
      });
    }

    if (!prevProps.isBulkEditMoveToPopupShown && isBulkEditMoveToPopupShown) {
      this.didClick = false;
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isBulkEditMoveToPopupShown && nextProps.isBulkEditMoveToPopupShown) {
      if (this.state.didCloseAnimEnd) {
        this.setState({ didCloseAnimEnd: false, popupSize: null })
        this.popupTranslateY = new Animated.Value(999);
      }
    }
  }

  componentWillUnmount() {
    this.registerPopupBackHandler(false);
  }

  registerPopupBackHandler = (isPopupShown) => {
    if (isPopupShown) {
      if (!this.popupBackHandler) {
        this.popupBackHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            if (!this.props.isBulkEditMoveToPopupShown) return false;

            this.onBulkEditMoveToCancelBtnClick();
            return true;
          }
        );
      }
    } else {
      if (this.popupBackHandler) {
        this.popupBackHandler.remove();
        this.popupBackHandler = null;
      }
    }
  }

  onPopupLayout = (e) => {
    if (!this.state.popupSize) {
      const layout = e.nativeEvent.layout;
      this.popuptranslateY = new Animated.Value(layout.height);
      this.setState({ popupSize: layout });
    }
  }

  onBulkEditMoveToPopupClick = (text) => {
    if (!text || this.didClick) return;

    const { selectedLinkIds, moveLinks, updateBulkEdit } = this.props;

    if (text.startsWith(MOVE_TO)) {
      moveLinks(text.substring(MOVE_TO.length + 1), selectedLinkIds);
      updateBulkEdit(false);
    } else {
      throw new Error(`Invalid text: ${text}`);
    }

    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
    this.didClick = true;
  }

  onBulkEditMoveToCancelBtnClick = () => {
    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
  }

  renderMenu() {

    const moveTo = [];
    for (const listNameObj of this.props.listNameMap) {
      if ([TRASH, ARCHIVE].includes(listNameObj.listName)) continue;
      if (this.props.listName === listNameObj.listName) continue;

      moveTo.push(listNameObj);
    }

    return moveTo.map(listNameObj => {
      const key = MOVE_TO + ' ' + listNameObj.listName;
      return (
        <TouchableOpacity key={key} onPress={() => this.onBulkEditMoveToPopupClick(key)} style={tailwind('w-full')}>
          <Text style={tailwind('py-4 pl-8 pr-4 w-full text-base text-gray-800 font-normal')} numberOfLines={1} ellipsizeMode="tail">{listNameObj.displayName}</Text>
        </TouchableOpacity>
      );
    });
  }

  render() {

    if (!this.props.isBulkEditMoveToPopupShown && this.state.didCloseAnimEnd) return null;

    const textHeight = Platform.select({ ios: 52, android: 55 });
    const popupStyle = {
      maxHeight: getLastHalfHeight(384, textHeight, 16, 64),
      transform: [{ translateY: this.popuptranslateY }],
    };

    return (
      <React.Fragment>
        <TouchableOpacity onPress={this.onBulkEditMoveToCancelBtnClick} style={tailwind('absolute inset-0 bg-black opacity-25 z-40')}></TouchableOpacity>
        <Animated.View onLayout={this.onPopupLayout} style={[tailwind('pt-4 pb-16 absolute inset-x-0 -bottom-12 bg-white border border-gray-200 rounded-t-lg shadow-xl z-41'), popupStyle]}>
          <ScrollView>
            <Text style={tailwind('py-4 pl-4 pr-4 w-full text-base text-gray-800 font-normal')}>Move to...</Text>
            {this.renderMenu()}
          </ScrollView>
        </Animated.View>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    isBulkEditMoveToPopupShown: state.display.isBulkEditMoveToPopupShown,
    selectedLinkIds: state.display.selectedLinkIds,
  };
};

const mapDispatchToProps = { updatePopup, updateBulkEdit, moveLinks };

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarBulkEditMoveToPopup);
