import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import {
  exportAllData, updateExportAllDataProgress,
  deleteAllData, updateDeleteAllDataProgress,
} from '../actions';
import {
  SM_WIDTH,
} from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

class _SettingsPopupData extends React.PureComponent {

  render() {

    const { safeAreaWidth } = this.props;

    return (
      <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
        <View style={tailwind('border-b border-gray-200 md:hidden', safeAreaWidth)}>
          <TouchableOpacity onPress={this.props.onSidebarOpenBtnClick} style={tailwind('pb-1')}>
            <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} <Text style={tailwind('text-sm text-gray-500 font-normal')}>Settings</Text></Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-5')}>Data</Text>
        </View>
        <View style={tailwind('mt-6 md:mt-0', safeAreaWidth)}>
          <Text style={tailwind('text-base text-gray-800 font-medium leading-4')}>Data Server</Text>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>With your Stacks identity, you can have your own data server called Gaia to store all your data from apps you use with your Stacks identity. You just need to specify your server’s information in Stacks blockchain. Brace.to stores all your data in the server specified in the blockchain. For more details, please visit <Text onPress={() => Linking.openURL('https://docs.blockstack.org/data-storage/overview')} style={tailwind('text-base text-gray-500 font-normal underline')}>Stacks Gaia</Text> and <Text onPress={() => Linking.openURL('https://docs.blockstack.org/storage-hubs/overview')} style={tailwind('text-base text-gray-500 font-normal underline')}>Stacks Gaia hubs</Text>.</Text>
        </View>
        <View style={tailwind('mt-8')}>
          <Text style={tailwind('text-base text-gray-800 font-medium leading-4')}>Export All Data</Text>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Export all your data from server to your device in a text file. Please go to <Text onPress={() => Linking.openURL('https://brace.to')} style={tailwind('text-base text-gray-500 font-normal underline')}>Brace.to</Text> to take the action.</Text>
        </View>
        <View style={tailwind('mt-8 mb-4')}>
          <TouchableOpacity onPress={this.props.onToDeleteAllDataViewBtnClick}>
            <Text style={tailwind('text-base text-gray-800 font-medium leading-4 underline')}>Delete All Data</Text>
          </TouchableOpacity>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</Text>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    windowWidth: state.window.width,
  };
};

export const SettingsPopupData = connect(mapStateToProps)(withSafeAreaContext(_SettingsPopupData));

class _SettingsPopupDataExport extends React.PureComponent {

  constructor(props) {
    super(props);

    this.didClick = false;
  }

  componentWillUnmount() {
    if (this.props.exportAllDataProgress) {
      const { total, done } = this.props.exportAllDataProgress;
      if (total === done) this.props.updateExportAllDataProgress(null);
    }
  }

  onExportAllDataBtnClick = () => {
    if (this.didClick) return;
    this.props.exportAllData();
    this.didClick = true;
  }

  render() {
    const { exportAllDataProgress, safeAreaWidth } = this.props;

    let actionPanel;
    if (!exportAllDataProgress) {
      actionPanel = (
        <TouchableOpacity onPress={this.onExportAllDataBtnClick} style={tailwind('mt-7 mb-4 justify-start items-start')}>
          <Text style={tailwind('px-3.5 py-1.5 bg-white text-sm text-gray-500 font-normal border border-gray-400 rounded-full')}>Export All My Data</Text>
        </TouchableOpacity>
      );
    } else if (exportAllDataProgress.total === -1) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('text-red-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
            <Text style={tailwind('ml-1 text-base text-red-600 font-normal')}>Oops..., something went wrong!</Text>
          </View>
          <Text style={tailwind('text-base text-red-600 font-normal leading-6.5')}>{exportAllDataProgress.error}</Text>
          <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL('https://brace.to/#support')} style={tailwind('text-base text-gray-500 font-normal underline')}>contact us</Text>
            <Svg style={tailwind('mb-2 text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
              <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
              <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
            </Svg>.
          </Text>
        </View>
      );
    } else if (exportAllDataProgress.total === 0) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </Svg>
            <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>No data to export.</Text>
          </View>
          <Text style={tailwind('text-base text-gray-500 font-normal')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
        </View>
      );
    } else if (exportAllDataProgress.total === exportAllDataProgress.done) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('text-green-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </Svg>
            <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Done</Text>
          </View>
          <Text style={tailwind('text-base text-gray-500 font-normal')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
        </View>
      );
    } else {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Circle size={20} color="rgb(107, 114, 128)" />
            <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Exporting...</Text>
          </View>
          <Text style={tailwind('text-base text-gray-500 font-normal')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
        </View>
      );
    }

    return (
      <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
        <View style={tailwind('border-b border-gray-200 md:border-b-0', safeAreaWidth)}>
          <TouchableOpacity onPress={this.props.onBackToDataViewBtnClick} style={tailwind('mb-1 md:mb-0', safeAreaWidth)}>
            <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-5 md:pb-0', safeAreaWidth)}>Export All Data</Text>
        </View>
        <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>Export all your data from server to your device in a text file.</Text>
        <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>It may take several minutes to export all your data.</Text>
        {actionPanel}
      </View>
    );
  }
}

const mapStateToPropsExport = (state) => {
  return {
    exportAllDataProgress: state.display.exportAllDataProgress,
    windowWidth: state.window.width,
  };
};

const mapDispatchToPropsExport = {
  exportAllData, updateExportAllDataProgress,
};

export const SettingsPopupDataExport = connect(mapStateToPropsExport, mapDispatchToPropsExport)(withSafeAreaContext(_SettingsPopupDataExport));

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

    const { deleteAllDataProgress, safeAreaWidth } = this.props;

    const switchThumbColorOn = 'rgb(59, 130, 246)';
    const switchThumbColorOff = 'rgb(229, 231, 235)';
    const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(191, 219, 254)' : 'rgb(59, 130, 246)';
    const switchTrackColorOff = 'rgb(156, 163, 175)';

    let actionPanel;
    if (!deleteAllDataProgress) {
      actionPanel = (
        <View style={tailwind('mt-7 mb-4')}>
          <TouchableOpacity onPress={this.onDeleteAllDataBtnClick} style={tailwind('justify-start items-start')}>
            <View style={tailwind('px-3.5 py-1.5 bg-white border border-gray-400 rounded-full')}>
              <Text style={tailwind('text-sm text-gray-500 font-normal')}>Delete All My Data</Text>
            </View>
          </TouchableOpacity>
          {this.state.isRequireConfirmShown && <Text style={tailwind('mt-2 text-base text-red-600 font-normal')}>Please confirm by checking the box above first.</Text>}
        </View>
      );
    } else if (deleteAllDataProgress.total === -1) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('text-red-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
            <Text style={tailwind('ml-1 text-base text-red-600 font-normal')}>Oops..., something went wrong!</Text>
          </View>
          <Text style={tailwind('text-base text-red-600 font-normal leading-6.5')}>{deleteAllDataProgress.error}</Text>
          <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL('https://brace.to/#support')} style={tailwind('text-base text-gray-500 font-normal underline')}>contact us</Text>
            <Svg style={tailwind('mb-2 text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
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
            <Svg style={tailwind('text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </Svg>
            <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>No data to delete.</Text>
          </View>
          <Text style={tailwind('text-base text-gray-500 font-normal')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
        </View>
      );
    } else if (deleteAllDataProgress.total === deleteAllDataProgress.done) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('text-green-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </Svg>
            <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Done</Text>
          </View>
          <Text style={tailwind('text-base text-gray-500 font-normal')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
        </View>
      );
    } else {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Circle size={20} color="rgb(107, 114, 128)" />
            <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Deleting...</Text>
          </View>
          <Text style={tailwind('text-base text-gray-500 font-normal')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
        </View>
      );
    }

    return (
      <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
        <View style={tailwind('border-b border-gray-200 md:border-b-0', safeAreaWidth)}>
          <TouchableOpacity onPress={this.props.onBackToDataViewBtnClick} style={tailwind('mb-1 md:mb-0', safeAreaWidth)}>
            <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-5 md:pb-0', safeAreaWidth)}>Delete All Data</Text>
        </View>
        <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</Text>
        <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>This will only remove all your data, not your account. You will still be able to sign in.</Text>
        <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>It may take several minutes to delete all your data.</Text>
        <Text style={tailwind('mt-6 text-base text-red-600 font-normal leading-6.5')}>This action CANNOT be undone.</Text>
        <View style={tailwind('mt-6 flex-row items-center')}>
          <Switch onValueChange={this.onConfirmInputChange} value={this.state.didCheckConfirm} thumbColor={Platform.OS === 'android' ? this.state.didCheckConfirm ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
          <Text style={tailwind('ml-2 flex-1 text-base text-gray-500 font-normal')}>Yes, I’m absolutely sure I want to delete all my data.</Text>
        </View>
        {actionPanel}
      </View>
    );
  }
}

const mapStateToPropsDelete = (state) => {
  return {
    deleteAllDataProgress: state.display.deleteAllDataProgress,
    windowWidth: state.window.width,
  };
};

const mapDispatchToPropsDelete = {
  deleteAllData, updateDeleteAllDataProgress,
};

export const SettingsPopupDataDelete = connect(mapStateToPropsDelete, mapDispatchToPropsDelete)(withSafeAreaContext(_SettingsPopupDataDelete));
