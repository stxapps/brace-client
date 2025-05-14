import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import { connect, useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import {
  importAllData, updateImportAllDataProgress, exportAllData, updateExportAllDataProgress,
  deleteAllData, updateDeleteAllDataProgress,
} from '../actions/data';
import {
  DOMAIN_NAME, HASH_SUPPORT, SD_HUB_URL, SM_WIDTH, BLK_MODE,
} from '../types/const';
import { getThemeMode } from '../selectors';
import { isString } from '../utils';

import { useSafeAreaFrame, withTailwind, useTailwind } from '.';

class _SettingsPopupData extends React.PureComponent {

  render() {
    const { hubUrl, hubAddr, tailwind } = this.props;

    let [hubName, hubNameUrl] = ['hub.hiro.so', 'https://hub.hiro.so/hub_info'];
    let [hubProvider, hubProviderUrl] = ['Hiro Systems', 'https://www.hiro.so'];
    if (hubUrl === SD_HUB_URL) {
      hubName = 'hub.stacksdrive.com';
      hubNameUrl = 'https://hub.stacksdrive.com/hub_info';
      hubProvider = 'STX Apps';
      hubProviderUrl = 'https://www.stxapps.com';
    }

    return (
      <View style={tailwind('p-4 md:p-6')}>
        <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
          <TouchableOpacity onPress={this.props.onSidebarOpenBtnClick} style={tailwind('pb-1')}>
            <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Settings</Text></Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800 blk:text-gray-100')}>Data</Text>
        </View>
        <View style={tailwind('mt-6 md:mt-0')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Data Server</Text>
          <Text style={tailwind('mt-3.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Brace.to stores your data in a Stacks data server. You can specify which Stacks data server to store your data in. By default, your Stacks data server is at <Text onPress={() => Linking.openURL(hubNameUrl)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>{hubName}</Text>, provided by <Text onPress={() => Linking.openURL(hubProviderUrl)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>{hubProvider}</Text>. You can also deploy your own Stacks data server. To change your Stacks data server, you must record your server's information on the Stacks blockchain. Brace.to stores your data on the server specified in the blockchain. For more details, please visit <Text onPress={() => Linking.openURL('https://docs.stacks.co/concepts/gaia')} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Stacks Gaia</Text>.</Text>
          {isString(hubAddr) && <View style={tailwind('mt-6 sm:flex-row')}>
            <Text style={tailwind('flex-shrink-0 flex-grow-0 text-base font-normal text-gray-500 blk:text-gray-400')}>App hub address:</Text>
            <View style={tailwind('flex-shrink flex-grow pt-1 sm:pt-0 sm:pl-3')}>
              <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{hubAddr}</Text>
            </View>
          </View>}
        </View>
        <View style={tailwind('mt-8')}>
          <TouchableOpacity onPress={this.props.onToImportAllDataViewBtnClick}>
            <Text style={tailwind('text-base font-medium leading-4 text-gray-800 underline blk:text-gray-100')}>Import Data</Text>
          </TouchableOpacity>
          <Text style={tailwind('mt-3 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Import data from a text file. The file can be a plain text file containing a list of links or a file exported from some read-it-later apps, bookmark managers, or our website/app.</Text>
        </View>
        <View style={tailwind('mt-8')}>
          <TouchableOpacity onPress={this.props.onToExportAllDataViewBtnClick}>
            <Text style={tailwind('text-base font-medium leading-4 text-gray-800 underline blk:text-gray-100')}>Export All Data</Text>
          </TouchableOpacity>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Export all your data from the server to your device in a text file.</Text>
        </View>
        <View style={tailwind('mt-8 mb-4')}>
          <TouchableOpacity onPress={this.props.onToDeleteAllDataViewBtnClick}>
            <Text style={tailwind('text-base font-medium leading-4 text-gray-800 underline blk:text-gray-100')}>Delete All Data</Text>
          </TouchableOpacity>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Delete all your data, including but not limited to all your saved links in all lists, all your created lists, and all your settings.</Text>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    hubUrl: state.user.hubUrl,
    hubAddr: state.user.hubAddr,
    themeMode: getThemeMode(state),
  };
};

export const SettingsPopupData = connect(mapStateToProps)(withTailwind(_SettingsPopupData));

const _SettingsPopupDataImport = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const importAllDataProgress = useSelector(
    state => state.display.importAllDataProgress
  );
  const themeMode = useSelector(state => getThemeMode(state));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onImportAllDataBtnClick = () => {
    dispatch(importAllData());
  };

  useEffect(() => {
    return () => {
      if (importAllDataProgress) {
        const { total, done } = importAllDataProgress;
        if (total === done) dispatch(updateImportAllDataProgress(null));
      }
    };
  }, [importAllDataProgress, dispatch]);

  let actionPanel;
  if (!importAllDataProgress) {
    actionPanel = (
      <TouchableOpacity onPress={onImportAllDataBtnClick} style={tailwind('mt-7 mb-4 items-start justify-start')}>
        <View style={tailwind('rounded-full border border-gray-400 bg-white px-3.5 py-1.5 blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Choose a file</Text>
        </View>
      </TouchableOpacity>
    );
  } else if (importAllDataProgress.total === -1) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>{importAllDataProgress.error}</Text>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
      </View>
    );
  } else if (importAllDataProgress.total === 0) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>No data to import.</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</Text>
      </View>
    );
  } else if (importAllDataProgress.total === importAllDataProgress.done) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-green-500 blk:text-green-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Done</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</Text>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Importing...</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <TouchableOpacity onPress={onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800 blk:text-gray-100 md:pb-0')}>Import Data</Text>
      </View>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Import data from a text file.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>It may take several minutes to import data.</Text>
      {actionPanel}
    </View>
  );
};

export const SettingsPopupDataImport = React.memo(_SettingsPopupDataImport);

const _SettingsPopupDataExport = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const exportAllDataProgress = useSelector(
    state => state.display.exportAllDataProgress
  );
  const themeMode = useSelector(state => getThemeMode(state));
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onExportAllDataBtnClick = () => {
    if (didClick.current) return;
    dispatch(exportAllData());
    didClick.current = true;
  };

  useEffect(() => {
    return () => {
      if (exportAllDataProgress) {
        const { total, done } = exportAllDataProgress;
        if (total === done) dispatch(updateExportAllDataProgress(null));
      }
    };
  }, [exportAllDataProgress, dispatch]);

  let actionPanel;
  if (!exportAllDataProgress) {
    actionPanel = (
      <TouchableOpacity onPress={onExportAllDataBtnClick} style={tailwind('mt-7 mb-4 items-start justify-start')}>
        <View style={tailwind('rounded-full border border-gray-400 bg-white px-3.5 py-1.5 blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Export All My Data</Text>
        </View>
      </TouchableOpacity>
    );
  } else if (exportAllDataProgress.total === -1) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>{exportAllDataProgress.error}</Text>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
      </View>
    );
  } else if (exportAllDataProgress.total === 0) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>No data to export.</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
      </View>
    );
  } else if (exportAllDataProgress.total === exportAllDataProgress.done) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-green-500 blk:text-green-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Done</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Exporting...</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <TouchableOpacity onPress={onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800 blk:text-gray-100 md:pb-0')}>Export All Data</Text>
      </View>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Export all your data from the server to your device in a text file.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>It may take several minutes to export all your data.</Text>
      {actionPanel}
    </View>
  );
};

export const SettingsPopupDataExport = React.memo(_SettingsPopupDataExport);

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
  };

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
  };

  render() {
    const { deleteAllDataProgress, safeAreaWidth, themeMode, tailwind } = this.props;

    const switchThumbColorOn = 'rgb(59, 130, 246)';
    const switchThumbColorOff = 'rgb(229, 231, 235)';
    const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(191, 219, 254)' : 'rgb(59, 130, 246)';
    const switchTrackColorOff = 'rgb(156, 163, 175)';
    const switchIosTrackColorOff = themeMode === BLK_MODE ? 'rgb(55, 65, 81)' : 'rgb(243, 244, 246)';

    let actionPanel;
    if (!deleteAllDataProgress) {
      actionPanel = (
        <View style={tailwind('mt-7 mb-4')}>
          <TouchableOpacity onPress={this.onDeleteAllDataBtnClick} style={tailwind('items-start justify-start')}>
            <View style={tailwind('rounded-full border border-gray-400 bg-white px-3.5 py-1.5 blk:border-gray-400 blk:bg-gray-900')}>
              <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Delete All My Data</Text>
            </View>
          </TouchableOpacity>
          {this.state.isRequireConfirmShown && <Text style={tailwind('mt-2 text-base font-normal text-red-600 blk:text-red-500')}>Please confirm by checking the box above first.</Text>}
        </View>
      );
    } else if (deleteAllDataProgress.total === -1) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
          </View>
          <Text style={tailwind('text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>{deleteAllDataProgress.error}</Text>
          <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
        </View>
      );
    } else if (deleteAllDataProgress.total === 0) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>No data to delete.</Text>
          </View>
          <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
        </View>
      );
    } else if (deleteAllDataProgress.total === deleteAllDataProgress.done) {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-green-500 blk:text-green-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Done</Text>
          </View>
          <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
        </View>
      );
    } else {
      actionPanel = (
        <View style={tailwind('mt-6 mb-4')}>
          <View style={tailwind('flex-row items-center')}>
            <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
            <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Deleting...</Text>
          </View>
          <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
        </View>
      );
    }

    return (
      <View style={tailwind('p-4 md:p-6 md:pt-4')}>
        <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
          <TouchableOpacity onPress={this.props.onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0')}>
            <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800 blk:text-gray-100 md:pb-0')}>Delete All Data</Text>
        </View>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Delete all your data, including but not limited to all your saved links in all lists, all your created lists, and all your settings.</Text>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>This will only remove all your data, not your account. You will still be able to sign in.</Text>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>It may take several minutes to delete all your data.</Text>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>This action CANNOT be undone.</Text>
        <View style={tailwind('mt-6 flex-row items-center')}>
          <Switch onValueChange={this.onConfirmInputChange} value={this.state.didCheckConfirm} thumbColor={Platform.OS === 'android' ? this.state.didCheckConfirm ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} ios_backgroundColor={switchIosTrackColorOff} />
          <Text style={tailwind('ml-2 flex-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Yes, I'm absolutely sure I want to delete all my data.</Text>
        </View>
        {actionPanel}
      </View>
    );
  }
}

const mapStateToPropsDelete = (state) => {
  return {
    deleteAllDataProgress: state.display.deleteAllDataProgress,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToPropsDelete = {
  deleteAllData, updateDeleteAllDataProgress,
};

export const SettingsPopupDataDelete = connect(mapStateToPropsDelete, mapDispatchToPropsDelete)(withTailwind(_SettingsPopupDataDelete));
