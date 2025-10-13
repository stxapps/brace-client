import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, updateBulkEdit } from '../actions';
import { ADD_POPUP, PROFILE_POPUP } from '../types/const';
import { getThemeMode } from '../selectors';
import { getRect, adjustRect } from '../utils';
import cache from '../utils/cache';

import { withTailwind } from '.';
import TopBarSearchInput from './TopBarSearchInput';
import Text from './CustomText';

class TopBarCommands extends React.PureComponent<any, any> {

  addBtn: any;
  profileBtn: any;

  constructor(props) {
    super(props);

    this.addBtn = React.createRef();
    this.profileBtn = React.createRef();
  }

  onAddBtnClick = () => {
    this.addBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = getRect(x, y, width, height);
      const nRect = adjustRect(rect, 0, 42, 0, 0);
      this.props.updatePopup(ADD_POPUP, true, nRect);
    });
  };

  onBulkEditBtnClick = () => {
    this.props.updateBulkEdit(true);
  };

  onProfileBtnClick = () => {
    this.profileBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = getRect(x, y, width, height);
      const nRect = adjustRect(rect, -4, -4, 8, 8);
      this.props.updatePopup(PROFILE_POPUP, true, nRect);
    });
  };

  render() {
    const { tailwind } = this.props;

    return (
      <View style={tailwind('flex-row items-center justify-end')}>
        <TouchableOpacity ref={this.addBtn} onPress={this.onAddBtnClick}>
          <View style={cache('TBC_addBtnView', [tailwind('flex-row items-center justify-center rounded-full border border-gray-400 bg-white blk:border-gray-400 blk:bg-gray-900'), { height: 32, paddingLeft: 10, paddingRight: 12 }], [tailwind])}>
            <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-300')} width={12} height={11} viewBox="0 0 16 14" stroke="currentColor" fill="none">
              <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={tailwind('ml-1 text-sm font-normal text-gray-500 blk:text-gray-300')}>Add</Text>
          </View>
        </TouchableOpacity>
        <TopBarSearchInput />
        <TouchableOpacity onPress={this.onBulkEditBtnClick} style={tailwind('ml-4')}>
          <View style={cache('TBC_bulkEditBtnView', [tailwind('flex-row items-center justify-center rounded-full border border-gray-400 bg-white px-3 blk:border-gray-400 blk:bg-gray-900'), { height: 32, paddingLeft: 10, paddingRight: 12 }], [tailwind])}>
            <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-300')} width={14} height={14} viewBox="0 0 20 20" fill="currentColor">
              <Path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z" />
              <Path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z" />
            </Svg>
            <Text style={tailwind('ml-1 text-sm font-normal text-gray-500 blk:text-gray-300')}>Select</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity ref={this.profileBtn} onPress={this.onProfileBtnClick} style={tailwind('ml-4')}>
          <View style={tailwind('h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white blk:bg-gray-900')}>
            <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-300')} width={28} height={28} viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <Path d="M5 12H5.01M12 12H12.01M19 12H19.01M6 12C6 12.2652 5.89464 12.5196 5.70711 12.7071C5.51957 12.8946 5.26522 13 5 13C4.73478 13 4.48043 12.8946 4.29289 12.7071C4.10536 12.5196 4 12.2652 4 12C4 11.7348 4.10536 11.4804 4.29289 11.2929C4.48043 11.1054 4.73478 11 5 11C5.26522 11 5.51957 11.1054 5.70711 11.2929C5.89464 11.4804 6 11.7348 6 12ZM13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8946 12.2652 13 12 13C11.7348 13 11.4804 12.8946 11.2929 12.7071C11.1054 12.5196 11 12.2652 11 12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11C12.2652 11 12.5196 11.1054 12.7071 11.2929C12.8946 11.4804 13 11.7348 13 12ZM20 12C20 12.2652 19.8946 12.5196 19.7071 12.7071C19.5196 12.8946 19.2652 13 19 13C18.7348 13 18.4804 12.8946 18.2929 12.7071C18.1054 12.5196 18 12.2652 18 12C18 11.7348 18.1054 11.4804 18.2929 11.2929C18.4804 11.1054 18.7348 11 19 11C19.2652 11 19.5196 11.1054 19.7071 11.2929C19.8946 11.4804 20 11.7348 20 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </TouchableOpacity>
      </View >
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { updatePopup, updateBulkEdit };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(TopBarCommands));
