import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

class SettingsPopupAccount extends React.PureComponent {

  render() {

    const { safeAreaWidth } = this.props;

    return (
      <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
        <View style={tailwind('border-b border-gray-200 md:hidden', safeAreaWidth)}>
          <TouchableOpacity onPress={this.props.onSidebarOpenBtnClick} style={tailwind('pb-1')}>
            <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} <Text style={tailwind('text-sm text-gray-500 font-normal')}>Settings</Text></Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-5')}>Account</Text>
        </View>
        <View style={tailwind('mt-6 md:mt-0', safeAreaWidth)}>
          <Text style={tailwind('text-base text-gray-800 font-medium leading-4')}>Stacks Account</Text>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Your account is a <Text onPress={() => Linking.openURL('https://www.stacks.co')} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>Stacks</Text> account and a Stacks account is used to access Stacks blockchain and Stacks data server. Stacks blockchain stores your account's information i.e. username, profile, and data server location. And Stacks data server stores your encrypted app data i.e. all your saved links.</Text>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Your account is derived from your Secret Key. Your Secret Key is a password that is only known to you. If you lose it, there is no way to retrieve it back. You need to keep it safe.</Text>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Your Secret Key cannot be changed or reset. As your Secret Key is used to encrypt your data, each file individually, if you change your Secret Key, every file needs to be decrypted with your old Secret Key and encrypted again with your new Secret Key.</Text>
        </View>
        <View style={tailwind('mt-8 mb-4')}>
          <Text style={tailwind('text-base text-red-600 font-medium leading-4')}>Delete Account</Text>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>As no one without your Secret Key can access your account or your data, you can just leave them as is. To delete all your data, please go to Settings -&gt; Data -&gt; Delete All Data.</Text>
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

export default connect(mapStateToProps)(withSafeAreaContext(SettingsPopupAccount));
