import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, updateBulkEdit } from '../actions';
import {
  ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, BOTTOM_BAR_HEIGHT,
} from '../types/const';
import { toPx } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

class BottomBarCommands extends React.PureComponent {

  onAddBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, true);
  }

  onSearchBtnClick = () => {
    this.props.updatePopup(SEARCH_POPUP, true);
  }

  onBulkEditBtnClick = () => {
    this.props.updateBulkEdit(true);
  }

  onProfileBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, true);
  }

  render() {
    return (
      <React.Fragment>
        <View style={cache('BBC_innerStyle', [tailwind('relative flex-row justify-evenly w-full overflow-hidden'), { height: toPx(BOTTOM_BAR_HEIGHT) }])}>
          <View style={tailwind('p-1 flex-1')}>
            <TouchableOpacity onPress={this.onAddBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
              <View style={tailwind('justify-center items-center w-6 h-6')}>
                <Svg style={tailwind('mb-0.5 text-gray-500 font-normal')} width={18} height={17} viewBox="0 0 13 12" stroke="currentColor">
                  <Path d="M6.5 1V10.4286M1 5.67609H12" strokeWidth="1.57143" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 text-xs text-gray-500 font-normal leading-4')}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={tailwind('p-1 flex-1')}>
            <TouchableOpacity onPress={this.onSearchBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
              <View style={tailwind('justify-center items-center w-6 h-6')}>
                <Svg style={tailwind('text-gray-500 font-normal')} width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
                  <Path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 text-xs text-gray-500 font-normal leading-4')}>Search</Text>
            </TouchableOpacity>
          </View>
          <View style={tailwind('p-1 flex-1')}>
            <TouchableOpacity onPress={this.onBulkEditBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
              <View style={tailwind('justify-center items-center w-6 h-6')}>
                <Svg style={tailwind('text-gray-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                  <Path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z" />
                  <Path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 text-xs text-gray-500 font-normal leading-4')}>Select</Text>
            </TouchableOpacity>
          </View>
          <View style={tailwind('p-1 flex-1')}>
            <TouchableOpacity onPress={this.onProfileBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
              <View style={tailwind('justify-center items-center w-6 h-6')}>
                <Svg style={tailwind('mt-1 text-gray-500 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                  <Path d="M6 10C6 10.5304 5.78929 11.0391 5.41421 11.4142C5.03914 11.7893 4.53043 12 4 12C3.46957 12 2.96086 11.7893 2.58579 11.4142C2.21071 11.0391 2 10.5304 2 10C2 9.46957 2.21071 8.96086 2.58579 8.58579C2.96086 8.21071 3.46957 8 4 8C4.53043 8 5.03914 8.21071 5.41421 8.58579C5.78929 8.96086 6 9.46957 6 10ZM12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10ZM16 12C16.5304 12 17.0391 11.7893 17.4142 11.4142C17.7893 11.0391 18 10.5304 18 10C18 9.46957 17.7893 8.96086 17.4142 8.58579C17.0391 8.21071 16.5304 8 16 8C15.4696 8 14.9609 8.21071 14.5858 8.58579C14.2107 8.96086 14 9.46957 14 10C14 10.5304 14.2107 11.0391 14.5858 11.4142C14.9609 11.7893 15.4696 12 16 12Z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 text-xs text-gray-500 font-normal leading-4')}>More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = { updatePopup, updateBulkEdit };

export default connect(null, mapDispatchToProps)(BottomBarCommands);
