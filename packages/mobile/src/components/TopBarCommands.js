import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { connect } from 'react-redux';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Svg, { Path } from 'react-native-svg';

import {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId, updateBulkEdit,
  refreshFetched,
} from '../actions';
import {
  DOMAIN_NAME, HASH_SUPPORT, PROFILE_POPUP, SETTINGS_VIEW_ACCOUNT,
} from '../types/const';
import { getThemeMode } from '../selectors';
import cache from '../utils/cache';

import MenuPopoverRenderers from './MenuPopoverRenderer';

import { withTailwind } from '.';
import TopBarAddPopup from './TopBarAddPopup';
import TopBarSearchInput from './TopBarSearchInput';

class TopBarCommands extends React.PureComponent {

  onBulkEditBtnClick = () => {
    this.props.updateBulkEdit(true);
  }

  onProfileBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, true);
  }

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onRefreshBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.refreshFetched();
  }

  onSettingsBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);

    this.props.updateSettingsViewId(SETTINGS_VIEW_ACCOUNT, true);
    this.props.updateSettingsPopup(true);
  }

  onSupportBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT);
  }

  onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut();
  }

  renderProfilePopup() {
    const { tailwind } = this.props;

    return (
      <React.Fragment>
        <MenuOption onSelect={this.onRefreshBtnClick} customStyles={cache('TBC_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2.5 pl-4 text-sm font-normal text-gray-700 blk:text-gray-200')}>Refresh</Text>
        </MenuOption>
        <MenuOption onSelect={this.onSettingsBtnClick} customStyles={cache('TBC_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2.5 pl-4 text-sm font-normal text-gray-700 blk:text-gray-200')}>Settings</Text>
        </MenuOption>
        <MenuOption onSelect={this.onSupportBtnClick} customStyles={cache('TBC_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2.5 pl-4 text-sm font-normal text-gray-700 blk:text-gray-200')}>Support</Text>
        </MenuOption>
        <MenuOption onSelect={this.onSignOutBtnClick} customStyles={cache('TBC_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2.5 pl-4 text-sm font-normal text-gray-700 blk:text-gray-200')}>Sign out</Text>
        </MenuOption>
      </React.Fragment>
    );
  }

  render() {
    const { tailwind } = this.props;

    return (
      <View style={tailwind('flex-row items-center justify-end')}>
        <TopBarAddPopup />
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
        <Menu renderer={MenuPopoverRenderers} rendererProps={cache('TBC_profileCommandMenuRendererProps', { preferredPlacement: 'bottom', anchorStyle: tailwind('bg-transparent') }, [tailwind])} onOpen={this.onProfileBtnClick} onClose={this.onProfileCancelBtnClick}>
          <MenuTrigger>
            <View style={tailwind('ml-4')}>
              <View style={tailwind('h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white blk:bg-gray-900')}>
                <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-300')} width={28} height={28} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <Path d="M5 12H5.01M12 12H12.01M19 12H19.01M6 12C6 12.2652 5.89464 12.5196 5.70711 12.7071C5.51957 12.8946 5.26522 13 5 13C4.73478 13 4.48043 12.8946 4.29289 12.7071C4.10536 12.5196 4 12.2652 4 12C4 11.7348 4.10536 11.4804 4.29289 11.2929C4.48043 11.1054 4.73478 11 5 11C5.26522 11 5.51957 11.1054 5.70711 11.2929C5.89464 11.4804 6 11.7348 6 12ZM13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8946 12.2652 13 12 13C11.7348 13 11.4804 12.8946 11.2929 12.7071C11.1054 12.5196 11 12.2652 11 12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11C12.2652 11 12.5196 11.1054 12.7071 11.2929C12.8946 11.4804 13 11.7348 13 12ZM20 12C20 12.2652 19.8946 12.5196 19.7071 12.7071C19.5196 12.8946 19.2652 13 19 13C18.7348 13 18.4804 12.8946 18.2929 12.7071C18.1054 12.5196 18 12.2652 18 12C18 11.7348 18.1054 11.4804 18.2929 11.2929C18.4804 11.1054 18.7348 11 19 11C19.2652 11 19.5196 11.1054 19.7071 11.2929C19.8946 11.4804 20 11.7348 20 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>
          </MenuTrigger>
          <MenuOptions customStyles={cache('TBC_profileCommandMenuOptions', { optionsContainer: tailwind('w-28 rounded-lg bg-white py-2 shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800') }, [tailwind])}>
            {this.renderProfilePopup()}
          </MenuOptions>
        </Menu>
      </View >
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId, updateBulkEdit,
  refreshFetched,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(TopBarCommands));
