import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { UPDATING, DIED_UPDATING, SM_WIDTH } from '../types/const';
import { updateSettings, updateUpdateSettingsProgress } from '../actions';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

class SettingsPopupMisc extends React.PureComponent {

  onDoExtractBtnClick = () => {
    const { doExtractContents, updateSettings } = this.props;
    updateSettings({ doExtractContents: !doExtractContents });
  }

  onDoDeleteBtnClick = () => {
    const { doDeleteOldLinksInTrash, updateSettings } = this.props;
    updateSettings({ doDeleteOldLinksInTrash: !doDeleteOldLinksInTrash });
  }

  onDoDescendingInputChange = (value) => {

    let doDescendingOrder;

    if (value === 'ascending') doDescendingOrder = false;
    else if (value === 'descending') doDescendingOrder = true;
    else throw new Error(`Invalid value: ${value}`);

    const { updateSettings } = this.props;
    updateSettings({ doDescendingOrder });
  }

  onDiedUpdatingCloseBtnClick = () => {
    this.props.updateUpdateSettingsProgress(null);
  }

  renderUpdateSettingsProgress() {

    const { updateSettingsProgress, safeAreaWidth } = this.props;

    if (!updateSettingsProgress) return null;
    if (updateSettingsProgress.status === UPDATING) return null;
    if (updateSettingsProgress.status === DIED_UPDATING) {
      return (
        <View style={tailwind('absolute top-0 inset-x-0 flex-row justify-center items-start')}>
          <View style={tailwind('m-4 p-4 bg-red-100 rounded-md shadow-lg')}>
            <View style={tailwind('flex-row')}>
              <View style={tailwind('flex-shrink-0')}>
                <Svg style={tailwind('text-red-600')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </Svg>
              </View>
              <View style={tailwind('ml-3')}>
                <Text style={tailwind('text-base text-red-800 font-medium text-left leading-5')}>Updating Error!</Text>
                <Text style={tailwind('mt-2 text-base text-red-800 font-normal')}>Please wait a moment and try again. {safeAreaWidth < SM_WIDTH ? '' : '\n'}If the problem persists, please <Text onPress={() => Linking.openURL('https://brace.to/#support')} style={tailwind('text-base text-red-800 font-normal underline')}>contact us</Text>
                  <Svg style={tailwind('mb-2 text-base text-red-800 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                    <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
                  </Svg>.
                </Text>
              </View>
              <View style={tailwind('pl-3')}>
                <View style={tailwind('-mx-1.5 -my-1.5')}>
                  <TouchableOpacity onPress={this.onDiedUpdatingCloseBtnClick} style={tailwind('p-1.5 justify-center items-center rounded-md')}>
                    <Svg style={tailwind('text-red-700')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                      <Path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }

    throw new Error(`Invalid updateSettingsProgress: ${updateSettingsProgress}`);
  }

  render() {

    const {
      doExtractContents, doDeleteOldLinksInTrash, doDescendingOrder, safeAreaWidth
    } = this.props;

    const ascendingBtnClassNames = !doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-blue-900' : 'text-gray-700';
    const ascendingRBtnClassNames = !doDescendingOrder ? 'border-blue-600' : 'border-gray-200';
    const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-blue-600' : 'bg-gray-200';

    const descendingBtnClassNames = doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const descendingBtnInnerClassNames = doDescendingOrder ? 'text-blue-900' : 'text-gray-700';
    const descendingRBtnClassNames = doDescendingOrder ? 'border-blue-600' : 'border-gray-200';
    const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-blue-600' : 'bg-gray-200';

    const switchThumbColorOn = 'rgba(49, 130, 206, 1)';
    const switchThumbColorOff = 'rgba(237, 242, 247, 1)';
    const switchTrackColorOn = 'rgba(190, 227, 248, 1)';
    const switchTrackColorOff = 'rgba(160, 174, 192, 1)';

    return (
      <View style={tailwind('p-4 relative md:p-6 md:pt-4 lg:p-8 lg:pt-6', safeAreaWidth)}>
        <View style={tailwind('border-b border-gray-400 md:hidden', safeAreaWidth)}>
          <TouchableOpacity onPress={this.props.onSidebarOpenBtnClick} style={tailwind('pb-1')}>
            <Text style={tailwind('text-sm text-gray-700 font-normal')}>{'<'} <Text style={tailwind('text-sm text-gray-700 font-normal')}>Settings</Text></Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-2xl text-gray-800 font-medium leading-6')}>Account</Text>
        </View>
        <View style={tailwind('mt-6 flex-row items-center justify-between md:mt-0', safeAreaWidth)}>
          <View style={tailwind('flex-grow flex-shrink')}>
            <Text style={tailwind('text-xl text-gray-800 font-medium leading-5')}>Link Previews</Text>
            <Text style={tailwind('mt-2 text-base text-gray-700 font-normal leading-6.5')}>Allow your saved links to be sent to our server for extracting their representative title and image. No your personal information involved at all so there is no way to know who saves what links. These titles and images are used in our website and app for you to easily find and recognize your saved links. For more information, please visit <Text onPress={() => Linking.openURL('https://brace.to/#privacy')} style={tailwind('text-base text-gray-700 font-normal underline')}>our privacy policy page</Text></Text>
          </View>
          <View style={tailwind('ml-4 flex-grow-0 flex-shrink-0 w-11 h-6')}>
            <Switch onValueChange={this.onDoExtractBtnClick} value={doExtractContents} thumbColor={Platform.OS === 'android' ? doExtractContents ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
          </View>
        </View>
        <View style={tailwind('mt-8 flex-row items-center justify-between')}>
          <View style={tailwind('flex-grow flex-shrink')}>
            <Text style={tailwind('text-xl text-gray-800 font-medium leading-5')}>Auto Cleanup</Text>
            <Text style={tailwind('mt-2 text-base text-gray-700 font-normal leading-6.5')}>Allow old removed links in Trash to be automatically deleted after 45 days</Text>
          </View>
          <View style={tailwind('ml-4 flex-grow-0 flex-shrink-0 w-11 h-6')}>
            <Switch onValueChange={this.onDoDeleteBtnClick} value={doDeleteOldLinksInTrash} thumbColor={Platform.OS === 'android' ? doDeleteOldLinksInTrash ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
          </View>
        </View>
        <View style={tailwind('mt-8 mb-4')}>
          <Text style={tailwind('text-xl text-gray-800 font-medium leading-5')}>List Order</Text>
          <View style={tailwind('sm:flex-row sm:items-start sm:justify-between', safeAreaWidth)}>
            <View style={tailwind('mt-2 sm:flex-grow sm:flex-shrink', safeAreaWidth)}>
              <Text style={tailwind('text-base text-gray-700 font-normal leading-6.5')}>Allow old removed links in Trash to be automatically deleted after 45 days</Text>
            </View>
            <View style={tailwind('mt-2 items-center sm:ml-4 sm:flex-grow-0 sm:flex-shrink-0', safeAreaWidth)}>
              <View style={tailwind('w-full max-w-48 bg-white rounded-md shadow-sm sm:w-48', safeAreaWidth)}>
                <TouchableOpacity onPress={() => this.onDoDescendingInputChange('ascending')} style={tailwind('')}>
                  <View style={tailwind(`${ascendingBtnClassNames} p-4 flex-row border rounded-tl-md rounded-tr-md`)}>
                    <View style={tailwind('flex-row items-center h-5')}>
                      <View style={tailwind(`${ascendingRBtnClassNames} justify-center items-center h-4 w-4 bg-transparent border rounded-full`)}>
                        <View style={tailwind(`${ascendingRBtnInnerClassNames} h-3 w-3 rounded-full`)}></View>
                      </View>
                    </View>
                    <Text style={tailwind(`${ascendingBtnInnerClassNames} ml-3 text-sm leading-5 font-medium`)}>Ascending order</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onDoDescendingInputChange('descending')} style={tailwind('')}>
                  <View style={tailwind(`${descendingBtnClassNames} p-4 flex-row border rounded-bl-md rounded-br-md`)}>
                    <View style={tailwind('flex-row items-center h-5')}>
                      <View style={tailwind(`${descendingRBtnClassNames} justify-center items-center h-4 w-4 bg-transparent border rounded-full`)}>
                        <View style={tailwind(`${descendingRBtnInnerClassNames} h-3 w-3 rounded-full`)}></View>
                      </View>
                    </View>
                    <Text style={tailwind(`${descendingBtnInnerClassNames} ml-3 text-sm leading-5 font-medium`)}>Descending order</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {this.renderUpdateSettingsProgress()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    doExtractContents: state.settings.doExtractContents,
    doDeleteOldLinksInTrash: state.settings.doDeleteOldLinksInTrash,
    doDescendingOrder: state.settings.doDescendingOrder,
    updateSettingsProgress: state.display.updateSettingsProgress,
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = {
  updateSettings, updateUpdateSettingsProgress,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(SettingsPopupMisc));
