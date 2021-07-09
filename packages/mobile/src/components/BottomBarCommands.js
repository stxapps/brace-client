import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { SvgXml, Path } from 'react-native-svg';
import jdenticon from 'jdenticon';

import { updatePopup, updateBulkEdit } from '../actions';
import {
  ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, BOTTOM_BAR_HEIGHT,
} from '../types/const';
import { toPx } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import GracefulImage from './GracefulImage';

class BottomBarCommands extends React.PureComponent {

  constructor(props) {
    super(props);

    if (props.userImage) {
      this.userImage = (
        <GracefulImage style={tailwind('w-full h-full')} source={cache('BBC_userImage', { uri: props.userImage }, props.userImage)} />
      );
      this.profileBtnStyleClasses = 'rounded-full';
    } else {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = (
        <SvgXml width={36} height={36} xml={svgString} />
      );
      this.profileBtnStyleClasses = 'rounded-lg';
    }
  }

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
          <TouchableOpacity onPress={this.onProfileBtnClick} style={tailwind('flex-1 justify-center items-center')}>
            <View style={tailwind(`justify-center items-center h-10 w-10 bg-white overflow-hidden border-2 border-gray-300 ${this.profileBtnStyleClasses}`)}>
              {this.userImage}
            </View>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    username: state.user.username,
    userImage: state.user.image,
  };
};

const mapDispatchToProps = { updatePopup, updateBulkEdit };

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarCommands);
