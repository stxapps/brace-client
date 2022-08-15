import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, updateListNamesMode } from '../actions';
import {
  LIST_NAMES_POPUP, SM_WIDTH, LG_WIDTH, LIST_NAMES_MODE_CHANGE_LIST_NAME,
  LIST_NAMES_ANIM_TYPE_POPUP,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName } from '../utils';
import cache from '../utils/cache';

import { getTopBarSizes, withTailwind } from '.';

class ListName extends React.PureComponent {

  constructor(props) {
    super(props);

    this.listNameBtn = React.createRef();
  }

  onListNameBtnClick = () => {
    this.listNameBtn.current.measure((_fx, _fy, width, height, x, y) => {
      this.props.updateListNamesMode(
        LIST_NAMES_MODE_CHANGE_LIST_NAME, LIST_NAMES_ANIM_TYPE_POPUP,
      );

      const rect = {
        x, y, width, height, top: y, right: x + width, bottom: y + height, left: x,
      };
      this.props.updatePopup(LIST_NAMES_POPUP, true, rect);
    });
  };

  render() {
    const { listName, listNameMap, updates, safeAreaWidth, tailwind } = this.props;
    const displayName = getListNameDisplayName(listName, listNameMap);

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
      <TouchableOpacity ref={this.listNameBtn} onPress={this.onListNameBtnClick} style={tailwind('flex-row items-center')}>
        <Text style={cache('LN_text', [tailwind('mr-1 text-lg font-medium leading-7 text-gray-900'), textStyle], [safeAreaWidth, updates])} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
        {listName in updates && <View style={tailwind('h-1.5 w-1.5 self-start rounded-full bg-blue-400')} />}
        <Svg style={tailwind('font-normal text-gray-900')} width={20} height={20} viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <Path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    updates: state.fetched,
  };
};

const mapDispatchToProps = { updatePopup, updateListNamesMode };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(ListName));
