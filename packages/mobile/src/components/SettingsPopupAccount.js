import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

import { withTailwind } from '.';

class SettingsPopupAccount extends React.PureComponent {

  render() {
    const { tailwind } = this.props;

    return (
      <View style={tailwind('p-4 md:p-6')}>
        <View style={tailwind('border-b border-gray-200 md:hidden')}>
          <TouchableOpacity onPress={this.props.onSidebarOpenBtnClick} style={tailwind('pb-1')}>
            <Text style={tailwind('text-sm font-normal text-gray-500')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500')}>Settings</Text></Text>
          </TouchableOpacity>
          <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800')}>Account</Text>
        </View>
        <View style={tailwind('mt-6 md:mt-0')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800')}>Stacks Account</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 leading-6.5')}>Your account is a <Text onPress={() => Linking.openURL('https://www.stacks.co')} style={tailwind('text-base font-normal text-gray-500 underline leading-6.5')}>Stacks</Text> account and a Stacks account is used to access Stacks blockchain and Stacks data server. Stacks blockchain stores your account's information i.e. username, profile, and data server location. And Stacks data server stores your encrypted app data i.e. all your saved links.</Text>
          <Text style={tailwind('mt-4 text-base font-normal text-gray-500 leading-6.5')}>Your Secret Key is a password that is only known to you. If you lose it, there is no way to retrieve it back. You need to keep it safe.</Text>
          <Text style={tailwind('mt-4 text-base font-normal text-gray-500 leading-6.5')}>Your Secret Key cannot be changed or reset. As your Secret Key is used to encrypt your data, each file individually, if you change your Secret Key, every file needs to be decrypted with your old Secret Key and encrypted again with your new Secret Key.</Text>
        </View>
        <View style={tailwind('mt-8 mb-4')}>
          <Text style={tailwind('text-base font-medium leading-4 text-red-600')}>Delete Account</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 leading-6.5')}>As no one without your Secret Key can access your account or your data, you can just leave them as is. To delete all your data, please go to Settings -&gt; Data -&gt; Delete All Data.</Text>
          <Text style={tailwind('mt-4 text-base font-normal text-gray-500 leading-6.5')}>If you get started with us, currently we create your Stacks account without username, profile, and data server location. So there is no data stored in Stacks blockchain and your data server is automatically selected.</Text>
          <Text style={tailwind('mt-4 text-base font-normal text-gray-500 leading-6.5')}>After you delete all your data in Settings -&gt; Data -&gt; Delete All Data, there's nothing left. You can just forget your Secret Key. It's permanently deleting your account.</Text>
        </View>
      </View>
    );
  }
}

export default withTailwind(SettingsPopupAccount);
