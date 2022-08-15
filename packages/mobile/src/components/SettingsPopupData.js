import React from 'react';
import { View, Text, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import { connect } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import { deleteAllData, updateDeleteAllDataProgress } from '../actions';
import { DOMAIN_NAME, HASH_SUPPORT, SM_WIDTH } from '../types/const';

import { withTailwind } from '.';

class _SettingsPopupData extends React.PureComponent {

  render() {
    const { tailwind } = this.props;

    return (
      <View style={tailwind('p-4 md:p-6')}>
        <View style={tailwind('border-b border-gray-200 md:hidden')}>
          <TouchableOpacity onPress={this.props.onSidebarOpenBtnClick} style={tailwind('pb-1')}>
            <Text style={tailwind('text-sm font-normal text-gray-500')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500')}>Settings</Text></Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800')}>Data</Text>
        </View>
        <View style={tailwind('mt-6 md:mt-0')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800')}>Data Server</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 leading-6.5')}>Brace.to stores your data in a Stacks data server. You can specify which Stacks data server to store your data. By default, your Stacks data server is at <Text onPress={() => Linking.openURL('https://hub.blockstack.org/hub_info')} style={tailwind('text-base font-normal text-gray-500 underline leading-6.5')}>hub.blockstack.org</Text> provided by <Text onPress={() => Linking.openURL('https://www.hiro.so')} style={tailwind('text-base font-normal text-gray-500 underline leading-6.5')}>Hiro Systems</Text>. You can also deploy your own Stacks data server. To change your Stacks data server, you need to record your server’s information to Stacks blockchain. Brace.to stores your data to the server specified in the blockchain. For more details, please visit <Text onPress={() => Linking.openURL('https://docs.stacks.co/docs/gaia/')} style={tailwind('text-base font-normal text-gray-500 underline leading-6.5')}>Stacks Gaia</Text>.</Text>
        </View>
        <View style={tailwind('mt-8')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800')}>Import Data</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 leading-6.5')}>Import data from a text file. Please go to <Text onPress={() => Linking.openURL(DOMAIN_NAME)} style={tailwind('text-base font-normal text-gray-500 underline leading-6.5')}>Brace.to</Text> to take the action.</Text>
        </View>
        <View style={tailwind('mt-8')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800')}>Export All Data</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 leading-6.5')}>Export all your data from server to your device in a text file. Please go to <Text onPress={() => Linking.openURL(DOMAIN_NAME)} style={tailwind('text-base font-normal text-gray-500 underline leading-6.5')}>Brace.to</Text> to take the action.</Text>
        </View>
        <View style={tailwind('mt-8 mb-4')}>
          <TouchableOpacity onPress={this.props.onToDeleteAllDataViewBtnClick}>
            <Text style={tailwind('text-base font-medium leading-4 text-gray-800 underline')}>Delete All Data</Text>
          </TouchableOpacity>
          <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 leading-6.5')}>Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</Text>
        </View>
      </View>
    );
  }
}

export const SettingsPopupData = withTailwind(_SettingsPopupData);

class _SettingsPopupDataDelete extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      didCheckConfirm: false,
      isRequireConfirmShown: false,
    };

    this.didClick = false;
  }

  componentWillUnmount() {
    if (this.props.deleteAllDataProgress) {
      const { total, done } = this.props.deleteAllDataProgress;
      if (total === done) this.props.updateDeleteAllDataProgress(null);
    }
  }

  onConfirmInputChange = () => {
    this.setState({
      didCheckConfirm: !this.state.didCheckConfirm,
      isRequireConfirmShown: false,
    });
  }

  onDeleteAllDataBtnClick = () => {
    if (this.didClick) return;

    if (this.state.didCheckConfirm) {
      if (this.state.isRequireConfirmShown) {
        this.setState({ isRequireConfirmShown: false });
      }
      this.props.deleteAllData();
      this.didClick = true;
      return;
    }

    this.setState({ isRequireConfirmShown: true });
  }

  render() {
    const { deleteAllDataProgress, safeAreaWidth, tailwind } = this.props;

    const switchThumbColorOn = 'rgb(59, 130, 246)';
    const switchThumbColorOff = 'rgb(229, 231, 235)';
    const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(191, 219, 254)' : 'rgb(59, 130, 246)';
    const switchTrackColorOff = 'rgb(156, 163, 175)';

    let actionPanel;
    if (!deleteAllDataProgress) {
      actionPanel = (
        <View style={tailwind('mt-7 mb-4')}>
          <TouchableOpacity onPress={this.onDeleteAllDataBtnClick} style={tailwind('items-start justify-start')}>
            <View style={tailwind('rounded-full border border-gray-400 bg-white px-3.5 py-1.5')}>
              <Text style={tailwind('text-sm font-normal text-gray-500')}>Delete All My Data</Text>
            </View>
          </TouchableOpacity>
          {this.state.isRequireConfirmShown && <Text style={tailwind('mt-2 text-base font-normal text-red-600')}>Please confirm by checking the box above first.</Text>}
        </View>
      );
    } else if (deleteAllDataProgress.total === -1) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600')}>Oops..., something went wrong!</Text>
          </View>
          <Text style={tailwind('text-base font-normal text-red-600 leading-6.5')}>{deleteAllDataProgress.error}</Text>
          <Text style={tailwind('mt-6 text-base font-normal text-gray-500 leading-6.5')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal text-gray-500 underline leading-6.5')}>contact us</Text>
            <Svg style={tailwind('mb-2 font-normal text-gray-500')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
              <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
              <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
            </Svg>.
          </Text>
        </View>
      );
    } else if (deleteAllDataProgress.total === 0) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500')}>No data to delete.</Text>
          </View>
          <Text style={tailwind('text-base font-normal text-gray-500')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
        </View>
      );
    } else if (deleteAllDataProgress.total === deleteAllDataProgress.done) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-green-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500')}>Done</Text>
          </View>
          <Text style={tailwind('text-base font-normal text-gray-500')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
        </View>
      );
    } else {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Circle size={20} color="rgb(107, 114, 128)" />
            <Text style={tailwind('ml-1 text-base font-normal text-gray-500')}>Deleting...</Text>
          </View>
          <Text style={tailwind('text-base font-normal text-gray-500')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
        </View>
      );
    }

    return (
      <View style={tailwind('p-4 md:p-6 md:pt-4')}>
        <View style={tailwind('border-b border-gray-200 md:border-b-0')}>
          <TouchableOpacity onPress={this.props.onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0')}>
            <Text style={tailwind('text-sm font-normal text-gray-500')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800 md:pb-0')}>Delete All Data</Text>
        </View>
        <Text style={tailwind('mt-6 text-base font-normal text-gray-500 leading-6.5')}>Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</Text>
        <Text style={tailwind('mt-6 text-base font-normal text-gray-500 leading-6.5')}>This will only remove all your data, not your account. You will still be able to sign in.</Text>
        <Text style={tailwind('mt-6 text-base font-normal text-gray-500 leading-6.5')}>It may take several minutes to delete all your data.</Text>
        <Text style={tailwind('mt-6 text-base font-normal text-red-600 leading-6.5')}>This action CANNOT be undone.</Text>
        <View style={tailwind('mt-6 flex-row items-center')}>
          <Switch onValueChange={this.onConfirmInputChange} value={this.state.didCheckConfirm} thumbColor={Platform.OS === 'android' ? this.state.didCheckConfirm ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
          <Text style={tailwind('ml-2 flex-1 text-base font-normal text-gray-500')}>Yes, I’m absolutely sure I want to delete all my data.</Text>
        </View>
        {actionPanel}
      </View>
    );
  }
}

const mapStateToPropsDelete = (state) => {
  return {
    deleteAllDataProgress: state.display.deleteAllDataProgress,
  };
};

const mapDispatchToPropsDelete = {
  deleteAllData, updateDeleteAllDataProgress,
};

export const SettingsPopupDataDelete = connect(mapStateToPropsDelete, mapDispatchToPropsDelete)(withTailwind(_SettingsPopupDataDelete));
