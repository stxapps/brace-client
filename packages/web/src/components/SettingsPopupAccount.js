import React from 'react';

class SettingsPopupAccount extends React.PureComponent {

  render() {
    return (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-200 md:hidden">
          <button onClick={this.props.onSidebarOpenBtnClick} className="pb-1 group focus:outline-none">
            <span className="text-sm text-gray-500 rounded group-focus:ring">{'<'} <span className="group-hover:underline">Settings</span></span>
          </button>
          <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none">Account</h3>
        </div>
        <div className="mt-6 md:mt-0">
          <h4 className="text-base text-gray-800 font-medium leading-none">Stacks Account</h4>
          <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Your account is a <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href="https://www.stacks.co">Stacks</a> account and a Stacks account is used to access Stacks blockchain and Stacks data server. Stacks blockchain stores your account's information i.e. username, profile, and data server location. And Stacks data server stores your encrypted app data i.e. all your saved links.</p>
          <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Your account is derived from your Secret Key. Your Secret Key is a password that is only known to you. If you lose it, there is no way to retrieve it back. You need to keep it safe.</p>
          <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Your Secret Key cannot be changed or reset. As your Secret Key is used to encrypt your data, each file individually, if you change your Secret Key, every file needs to be decrypted with your old Secret Key and encrypted again with your new Secret Key.</p>
        </div>
        <div className="mt-8 mb-4">
          <h4 className="text-base text-red-600 font-medium leading-none">Delete Account</h4>
          <p className="mt-2.5 text-base text-gray-500 leading-relaxed">As no one without your Secret Key can access your account or your data, you can just leave them as is. To delete all your data, please go to Settings -&gt; Data -&gt; Delete All Data.</p>
        </div>
      </div>
    );
  }
}

export default SettingsPopupAccount;
