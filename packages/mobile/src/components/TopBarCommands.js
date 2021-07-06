import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Svg, { SvgXml, Path } from 'react-native-svg';
import jdenticon from 'jdenticon';

import { signOut, updatePopup, updateBulkEdit } from '../actions';
import { DOMAIN_NAME, PROFILE_POPUP, SETTINGS_POPUP } from '../types/const';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import GracefulImage from './GracefulImage';
import MenuPopoverRenderers from './MenuPopoverRenderer';

import TopBarAddPopup from './TopBarAddPopup';
import TopBarSearchInput from './TopBarSearchInput';

class TopBarCommands extends React.PureComponent {

  constructor(props) {
    super(props);

    if (props.userImage) {
      this.userImage = (
        <GracefulImage style={tailwind('w-full h-full')} source={cache('TBC_userImage', { uri: props.userImage }, props.userImage)} />
      );
      this.profileBtnStyleClasses = 'rounded-full';
    } else {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = (
        <SvgXml width={28} height={28} xml={svgString} />
      );
      this.profileBtnStyleClasses = 'rounded-lg';
    }
  }

  onBulkEditBtnClick = () => {
    this.props.updateBulkEdit(true);
  }

  onProfileBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, true);
  }

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSettingsBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.updatePopup(SETTINGS_POPUP, true);
  }

  onSupportBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    Linking.openURL(DOMAIN_NAME + '/#support');
  }

  onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut();
  }

  renderProfilePopup() {
    return (
      <React.Fragment>
        <MenuOption onSelect={this.onSettingsBtnClick} customStyles={cache('TBC_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2 pl-4 text-sm text-gray-700 font-normal')}>Settings</Text>
        </MenuOption>
        <MenuOption onSelect={this.onSupportBtnClick} customStyles={cache('TBC_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2 pl-4 text-sm text-gray-700 font-normal')}>Support</Text>
        </MenuOption>
        <MenuOption onSelect={this.onSignOutBtnClick} customStyles={cache('TBC_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2 pl-4 text-sm text-gray-700 font-normal')}>Sign out</Text>
        </MenuOption>
      </React.Fragment>
    );
  }

  render() {

    const anchorClasses = Platform.select({ ios: 'z-10', android: 'shadow-xl' });

    return (
      <View style={tailwind('flex-row justify-end items-center')}>
        <TopBarAddPopup />
        <TopBarSearchInput />
        <TouchableOpacity onPress={this.onBulkEditBtnClick} style={tailwind('ml-4')}>
          <View style={cache('TBC_bulkEditBtnView', [tailwind('px-3 flex-row justify-center items-center bg-white border border-gray-400 rounded-full'), { height: 32, paddingLeft: 10, paddingRight: 12 }])}>
            <Svg style={tailwind('text-gray-500 font-normal')} width={14} height={14} viewBox="0 0 20 20" fill="currentColor">
              <Path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z" />
              <Path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z" />
            </Svg>
            <Text style={tailwind('ml-1 text-sm text-gray-500 font-normal')}>Select</Text>
          </View>
        </TouchableOpacity>
        <Menu renderer={MenuPopoverRenderers} rendererProps={cache('TBC_profileCommandMenuRendererProps', { preferredPlacement: 'bottom', anchorStyle: tailwind(anchorClasses) })} onOpen={this.onProfileBtnClick} onClose={this.onProfileCancelBtnClick}>
          <MenuTrigger>
            <View style={tailwind('ml-4')}>
              <View style={tailwind(`justify-center items-center h-8 w-8 bg-white overflow-hidden border-2 border-gray-300 ${this.profileBtnStyleClasses}`)}>
                {this.userImage}
              </View>
            </View>
          </MenuTrigger>
          <MenuOptions customStyles={cache('TBC_profileCommandMenuOptions', { optionsContainer: tailwind('py-2 w-32 bg-white rounded-lg shadow-xl') })}>
            {this.renderProfilePopup()}
          </MenuOptions>
        </Menu>
      </View >
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    username: state.user.username,
    userImage: state.user.image,
  };
};

const mapDispatchToProps = { signOut, updatePopup, updateBulkEdit };

export default connect(mapStateToProps, mapDispatchToProps)(TopBarCommands);
