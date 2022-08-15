import React from 'react';
import { View, Text, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import { connect } from 'react-redux';

import {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
  updateLayoutType,
} from '../actions';
import { DOMAIN_NAME, HASH_PRIVACY, LAYOUT_CARD, LAYOUT_LIST } from '../types/const';

import { withTailwind } from '.';

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

  onLayoutTypeInputChange = (value) => {
    this.props.updateLayoutType(value);
  }

  render() {
    const {
      doExtractContents, doDeleteOldLinksInTrash, doDescendingOrder, layoutType,
      tailwind,
    } = this.props;

    const ascendingBtnClassNames = !doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-blue-800' : 'text-gray-600';
    const ascendingRBtnClassNames = !doDescendingOrder ? 'border-blue-600' : 'border-gray-200';
    const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-blue-600' : 'bg-gray-200';

    const descendingBtnClassNames = doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const descendingBtnInnerClassNames = doDescendingOrder ? 'text-blue-800' : 'text-gray-600';
    const descendingRBtnClassNames = doDescendingOrder ? 'border-blue-600' : 'border-gray-200';
    const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-blue-600' : 'bg-gray-200';

    const layoutCardBtnClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const layoutCardBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'text-blue-800' : 'text-gray-600';
    const layoutCardRBtnClassNames = layoutType === LAYOUT_CARD ? 'border-blue-600' : 'border-gray-200';
    const layoutCardRBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-600' : 'bg-gray-200';

    const layoutListBtnClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const layoutListBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'text-blue-800' : 'text-gray-600';
    const layoutListRBtnClassNames = layoutType === LAYOUT_LIST ? 'border-blue-600' : 'border-gray-200';
    const layoutListRBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-600' : 'bg-gray-200';

    const switchThumbColorOn = 'rgb(59, 130, 246)';
    const switchThumbColorOff = 'rgb(229, 231, 235)';
    const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(191, 219, 254)' : 'rgb(59, 130, 246)';
    const switchTrackColorOff = 'rgb(156, 163, 175)';

    return (
      <View style={tailwind('relative p-4 md:p-6')}>
        <View style={tailwind('border-b border-gray-200 md:hidden')}>
          <TouchableOpacity onPress={this.props.onSidebarOpenBtnClick} style={tailwind('pb-1')}>
            <Text style={tailwind('text-sm font-normal text-gray-500')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500')}>Settings</Text></Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800')}>Misc.</Text>
        </View>
        <View style={tailwind('mt-6 flex-row items-center justify-between md:mt-0')}>
          <View style={tailwind('flex-shrink flex-grow')}>
            <Text style={tailwind('text-base font-medium leading-4 text-gray-800')}>Link Previews</Text>
            <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 leading-6.5')}>Allow your saved links to be sent to our server for extracting their representative title and image. No your personal information involved at all so there is no way to know who saves what links. These titles and images are used in our website and app for you to easily find and recognize your saved links. For more information, please visit <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_PRIVACY)} style={tailwind('text-base font-normal text-gray-500 underline leading-6.5')}>our privacy policy page</Text>.</Text>
          </View>
          <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
            <Switch onValueChange={this.onDoExtractBtnClick} value={doExtractContents} thumbColor={Platform.OS === 'android' ? doExtractContents ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
          </View>
        </View>
        <View style={tailwind('mt-10 flex-row items-center justify-between')}>
          <View style={tailwind('flex-shrink flex-grow')}>
            <Text style={tailwind('text-base font-medium leading-4 text-gray-800')}>Auto Cleanup</Text>
            <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 leading-6.5')}>Allow old removed links in Trash to be automatically deleted after 45 days.</Text>
          </View>
          <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
            <Switch onValueChange={this.onDoDeleteBtnClick} value={doDeleteOldLinksInTrash} thumbColor={Platform.OS === 'android' ? doDeleteOldLinksInTrash ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
          </View>
        </View>
        <View style={tailwind('mt-10 mb-4')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800')}>List Order</Text>
          <View style={tailwind('sm:flex-row sm:items-start sm:justify-between')}>
            <View style={tailwind('mt-2.5 sm:flex-shrink sm:flex-grow')}>
              <Text style={tailwind('text-base font-normal text-gray-500 leading-6.5')}>Choose whether your saved links are sorted by saved date in <Text style={tailwind('text-base font-semibold text-gray-500 leading-6.5')}>ascending order</Text> (links you save first appear first) or <Text style={tailwind('text-base font-semibold text-gray-500 leading-6.5')}>descending order</Text> (links you save last appear first) when you browse your saved links.</Text>
            </View>
            <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-shrink-0 sm:flex-grow-0')}>
              <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-sm sm:w-48')}>
                <TouchableOpacity onPress={() => this.onDoDescendingInputChange('ascending')} style={tailwind('')}>
                  <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${ascendingBtnClassNames}`)}>
                    <View style={tailwind('h-5 flex-row items-center')}>
                      <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${ascendingRBtnClassNames}`)}>
                        <View style={tailwind(`h-3 w-3 rounded-full ${ascendingRBtnInnerClassNames}`)} />
                      </View>
                    </View>
                    <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${ascendingBtnInnerClassNames}`)}>Ascending order</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onDoDescendingInputChange('descending')} style={tailwind('')}>
                  <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${descendingBtnClassNames}`)}>
                    <View style={tailwind('h-5 flex-row items-center')}>
                      <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${descendingRBtnClassNames}`)}>
                        <View style={tailwind(`h-3 w-3 rounded-full ${descendingRBtnInnerClassNames}`)} />
                      </View>
                    </View>
                    <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${descendingBtnInnerClassNames}`)}>Descending order</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View style={tailwind('mt-10 mb-4')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800')}>Layout View</Text>
          <View style={tailwind('sm:flex-row sm:items-start sm:justify-between')}>
            <View style={tailwind('mt-2.5 sm:flex-shrink sm:flex-grow')}>
              <Text style={tailwind('text-base font-normal text-gray-500 leading-6.5')}>Choose whether your saved links are displayed in Cards view or in List view. This setting is not synced so you can have a different layout for each of your devices.</Text>
            </View>
            <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-shrink-0 sm:flex-grow-0')}>
              <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-sm sm:w-48')}>
                <TouchableOpacity onPress={() => this.onLayoutTypeInputChange(LAYOUT_CARD)}>
                  <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${layoutCardBtnClassNames}`)}>
                    <View style={tailwind('h-5 flex-row items-center')}>
                      <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${layoutCardRBtnClassNames}`)}>
                        <View style={tailwind(`h-3 w-3 rounded-full ${layoutCardRBtnInnerClassNames}`)} />
                      </View>
                    </View>
                    <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${layoutCardBtnInnerClassNames}`)}>Cards view</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onLayoutTypeInputChange(LAYOUT_LIST)}>
                  <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${layoutListBtnClassNames}`)}>
                    <View style={tailwind('h-5 flex-row items-center')}>
                      <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${layoutListRBtnClassNames}`)}>
                        <View style={tailwind(`h-3 w-3 rounded-full ${layoutListRBtnInnerClassNames}`)} />
                      </View>
                    </View>
                    <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${layoutListBtnInnerClassNames}`)}>List View</Text>
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
    layoutType: state.localSettings.layoutType,
    safeAreaWidth: state.window.width,
  };
};

const mapDispatchToProps = {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
  updateLayoutType,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(SettingsPopupMisc));
