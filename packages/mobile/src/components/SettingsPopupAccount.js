import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { MD_WIDTH, LG_WIDTH } from '../types/const';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';
import GracefulImage from './GracefulImage';

class SettingsPopupAccount extends React.PureComponent {

  render() {

    const { safeAreaWidth } = this.props;

    let userImage;
    if (this.props.userImage) {
      userImage = (
        <GracefulImage style={tailwind('w-24 h-24 border-2 border-gray-200 rounded-full overflow-hidden')} source={cache('SPA_userImage', { uri: this.props.userImage }, this.props.userImage)} />
      );
    } else {
      userImage = (
        <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
          <Circle cx="48" cy="48" r="48" fill="#E2E8F0" />
          <Path d="M82.5302 81.3416C73.8015 90.3795 61.5571 96 47.9999 96C34.9627 96 23.1394 90.8024 14.4893 82.3663C18.2913 78.3397 22.7793 74.9996 27.7572 72.5098C34.3562 69.2093 41.6342 67.4938 49.0126 67.5C62.0922 67.5 73.9409 72.7881 82.5302 81.3416Z" fill="#A0AEC0" />
          <Path d="M57.9629 57.4535C60.3384 55.0781 61.6729 51.8562 61.6729 48.4968C61.6729 45.1374 60.3384 41.9156 57.9629 39.5401C55.5875 37.1647 52.3656 35.8302 49.0062 35.8302C45.6468 35.8302 42.425 37.1647 40.0495 39.5401C37.6741 41.9156 36.3396 45.1374 36.3396 48.4968C36.3396 51.8562 37.6741 55.0781 40.0495 57.4535C42.425 59.829 45.6468 61.1635 49.0062 61.1635C52.3656 61.1635 55.5875 59.829 57.9629 57.4535Z" fill="#A0AEC0" />
        </Svg>
      );
    }

    const profileFirstColWidth = safeAreaWidth < LG_WIDTH ? 72 : 160;
    const warningSvgSize = safeAreaWidth < MD_WIDTH ? 28 : 40;

    return (
      <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
        <View style={tailwind('border-b border-gray-200 md:hidden', safeAreaWidth)}>
          <TouchableOpacity onPress={this.props.onSidebarOpenBtnClick} style={tailwind('pb-1')}>
            <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} <Text style={tailwind('text-sm text-gray-500 font-normal')}>Settings</Text></Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-5')}>Account</Text>
        </View>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5 md:mt-0', safeAreaWidth)}>You sign in to Brace.to using your Stacks Identity. This is similar to some websites that allow you to use your Google, Facebook, or Twitter account to sign in to their websites. Not similarly, your Stacks Identity lives in blockchain and only you with your secret key can control it. If you want to change your Stacks Identity’s information i.e. your profile picture, please visit <Text onPress={() => Linking.openURL('https://browser.blockstack.org/profiles')} style={tailwind('text-base text-gray-500 font-normal underline')}>Blockstack Browser</Text>.</Text>
        <View style={tailwind('mt-8 md:flex-row-reverse md:items-start', safeAreaWidth)}>
          <View style={tailwind('justify-center items-center w-full md:justify-start md:items-end md:w-3/12', safeAreaWidth)}>
            {userImage}
          </View>
          <View style={tailwind('mt-4 self-stretch md:flex-1 md:mt-0', safeAreaWidth)}>
            <View style={tailwind('flex-row items-start')}>
              <View style={cache('SPA_profileFirstCol', { width: profileFirstColWidth }, safeAreaWidth)}>
                <Text style={tailwind('text-sm text-gray-500 font-normal text-right leading-6.5')}>ID:</Text>
              </View>
              <View style={tailwind('pl-2 flex-1')}>
                <Text style={tailwind('w-full text-base text-gray-500 font-normal leading-6.5')}>{this.props.username || 'N/A'}</Text>
              </View>
            </View>
            <View style={tailwind('flex-row items-start')}>
              <View style={cache('SPA_profileFirstCol', { width: profileFirstColWidth }, safeAreaWidth)}>
                <Text style={tailwind('text-sm text-gray-500 font-normal text-right leading-6.5')}>Password:</Text>
              </View>
              <View style={tailwind('pl-2 flex-1')}>
                <Text style={tailwind('w-full text-base text-gray-500 font-normal leading-6.5')}>Unlike traditional systems, your password cannot be reset. Your password is a 12-word secret key. It's only known to you. If you lose it, there is no way to retrieve it back. Keep it safe before you sign out. You can view it only when you sign in.</Text>
                <Text onPress={() => Linking.openURL('https://app.blockstack.org/#/settings/secret-key')} style={tailwind('pt-2 w-full text-base text-blue-500 font-normal leading-6.5 underline')}>View your 12-word secret key</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={tailwind('mt-4 p-4 rounded-md bg-yellow-50')}>
          <View style={tailwind('flex-row')}>
            <View style={tailwind('flex-shrink-0')}>
              <Svg style={tailwind('text-yellow-400 font-normal')} width={warningSvgSize} height={warningSvgSize} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-1')}>
              <Text style={tailwind('text-base text-yellow-700 font-normal leading-6.5')}>Signing out from Brace.to doesn’t sign out from Stacks. If you want to sign out from Stacks, especially when you use not-your-own devices, you need to go to <Text onPress={() => Linking.openURL('https://app.blockstack.org/')} style={tailwind('text-base text-yellow-800 font-normal underline')}>Stacks App</Text> and/or <Text onPress={() => Linking.openURL('https://browser.blockstack.org/account/delete')} style={tailwind('text-base text-yellow-800 font-normal underline')}>Blockstack Browser</Text> and sign out there.</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('mt-8 mb-4')}>
          <Text style={tailwind('text-base text-red-600 font-medium leading-4')}>Delete Account</Text>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Brace.to uses Stacks Identity to sign you in. If you want to delete your Stacks Identity, please send an email to support@blockstack.com. For more information, please visit <Text onPress={() => Linking.openURL('https://forum.stacks.org/t/is-blockstack-gdrp-compliant/10931/4')} style={tailwind('text-base text-gray-500 font-normal underline')}>here</Text>.</Text>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.user.username,
    userImage: state.user.image,
    windowWidth: state.window.width,
  };
};

export default connect(mapStateToProps)(withSafeAreaContext(SettingsPopupAccount));
