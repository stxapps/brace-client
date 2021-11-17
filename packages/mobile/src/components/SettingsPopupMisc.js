import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Switch, Linking, Platform } from 'react-native';

import {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
} from '../actions';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

class SettingsPopupMisc extends React.PureComponent {

  onDoExtractBtnClick = () => {
    const { doExtractContents } = this.props;
    this.props.updateDoExtractContents(!doExtractContents);
  }

  onDoDeleteBtnClick = () => {
    const { doDeleteOldLinksInTrash } = this.props;
    this.props.updateDoDeleteOldLinksInTrash(!doDeleteOldLinksInTrash);
  }

  onDoDescendingInputChange = (value) => {

    let doDescendingOrder;

    if (value === 'ascending') doDescendingOrder = false;
    else if (value === 'descending') doDescendingOrder = true;
    else throw new Error(`Invalid value: ${value}`);

    this.props.updateDoDescendingOrder(doDescendingOrder);
  }

  render() {

    const {
      doExtractContents, doDeleteOldLinksInTrash, doDescendingOrder, safeAreaWidth,
    } = this.props;

    const ascendingBtnClassNames = !doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-blue-800' : 'text-gray-600';
    const ascendingRBtnClassNames = !doDescendingOrder ? 'border-blue-600' : 'border-gray-200';
    const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-blue-600' : 'bg-gray-200';

    const descendingBtnClassNames = doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const descendingBtnInnerClassNames = doDescendingOrder ? 'text-blue-800' : 'text-gray-600';
    const descendingRBtnClassNames = doDescendingOrder ? 'border-blue-600' : 'border-gray-200';
    const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-blue-600' : 'bg-gray-200';

    const switchThumbColorOn = 'rgb(59, 130, 246)';
    const switchThumbColorOff = 'rgb(229, 231, 235)';
    const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(191, 219, 254)' : 'rgb(59, 130, 246)';
    const switchTrackColorOff = 'rgb(156, 163, 175)';

    return (
      <View style={tailwind('p-4 relative md:p-6 md:pt-4', safeAreaWidth)}>
        <View style={tailwind('border-b border-gray-200 md:hidden', safeAreaWidth)}>
          <TouchableOpacity onPress={this.props.onSidebarOpenBtnClick} style={tailwind('pb-1')}>
            <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} <Text style={tailwind('text-sm text-gray-500 font-normal')}>Settings</Text></Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-5')}>Misc.</Text>
        </View>
        <View style={tailwind('mt-6 flex-row items-center justify-between md:mt-0', safeAreaWidth)}>
          <View style={tailwind('flex-grow flex-shrink')}>
            <Text style={tailwind('text-base text-gray-800 font-medium leading-4')}>Link Previews</Text>
            <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Allow your saved links to be sent to our server for extracting their representative title and image. No your personal information involved at all so there is no way to know who saves what links. These titles and images are used in our website and app for you to easily find and recognize your saved links. For more information, please visit <Text onPress={() => Linking.openURL('https://brace.to/#privacy')} style={tailwind('text-base text-gray-500 font-normal underline')}>our privacy policy page</Text></Text>
          </View>
          <View style={tailwind('ml-4 flex-grow-0 flex-shrink-0 w-11 h-6')}>
            <Switch onValueChange={this.onDoExtractBtnClick} value={doExtractContents} thumbColor={Platform.OS === 'android' ? doExtractContents ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
          </View>
        </View>
        <View style={tailwind('mt-10 flex-row items-center justify-between')}>
          <View style={tailwind('flex-grow flex-shrink')}>
            <Text style={tailwind('text-base text-gray-800 font-medium leading-4')}>Auto Cleanup</Text>
            <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Allow old removed links in Trash to be automatically deleted after 45 days</Text>
          </View>
          <View style={tailwind('ml-4 flex-grow-0 flex-shrink-0 w-11 h-6')}>
            <Switch onValueChange={this.onDoDeleteBtnClick} value={doDeleteOldLinksInTrash} thumbColor={Platform.OS === 'android' ? doDeleteOldLinksInTrash ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
          </View>
        </View>
        <View style={tailwind('mt-10 mb-4')}>
          <Text style={tailwind('text-base text-gray-800 font-medium leading-4')}>List Order</Text>
          <View style={tailwind('sm:flex-row sm:items-start sm:justify-between', safeAreaWidth)}>
            <View style={tailwind('mt-2.5 sm:flex-grow sm:flex-shrink', safeAreaWidth)}>
              <Text style={tailwind('text-base text-gray-500 font-normal leading-6.5')}>Allow old removed links in Trash to be automatically deleted after 45 days</Text>
            </View>
            <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-grow-0 sm:flex-shrink-0', safeAreaWidth)}>
              <View style={tailwind('w-full max-w-48 bg-white rounded-md shadow-sm sm:w-48', safeAreaWidth)}>
                <TouchableOpacity onPress={() => this.onDoDescendingInputChange('ascending')} style={tailwind('')}>
                  <View style={tailwind(`${ascendingBtnClassNames} p-4 flex-row border rounded-tl-md rounded-tr-md`)}>
                    <View style={tailwind('flex-row items-center h-5')}>
                      <View style={tailwind(`${ascendingRBtnClassNames} justify-center items-center h-4 w-4 bg-transparent border rounded-full`)}>
                        <View style={tailwind(`${ascendingRBtnInnerClassNames} h-3 w-3 rounded-full`)} />
                      </View>
                    </View>
                    <Text style={tailwind(`${ascendingBtnInnerClassNames} ml-3 text-sm leading-5 font-medium`)}>Ascending order</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onDoDescendingInputChange('descending')} style={tailwind('')}>
                  <View style={tailwind(`${descendingBtnClassNames} p-4 flex-row border rounded-bl-md rounded-br-md`)}>
                    <View style={tailwind('flex-row items-center h-5')}>
                      <View style={tailwind(`${descendingRBtnClassNames} justify-center items-center h-4 w-4 bg-transparent border rounded-full`)}>
                        <View style={tailwind(`${descendingRBtnInnerClassNames} h-3 w-3 rounded-full`)} />
                      </View>
                    </View>
                    <Text style={tailwind(`${descendingBtnInnerClassNames} ml-3 text-sm leading-5 font-medium`)}>Descending order</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    doExtractContents: state.settings.doExtractContents,
    doDeleteOldLinksInTrash: state.settings.doDeleteOldLinksInTrash,
    doDescendingOrder: state.settings.doDescendingOrder,
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(SettingsPopupMisc));
