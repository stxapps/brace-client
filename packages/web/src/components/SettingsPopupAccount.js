import React from 'react';
import { connect } from 'react-redux';

import { withTailwind } from '.';

class SettingsPopupAccount extends React.PureComponent {

  render() {
    const { tailwind } = this.props;

    return (
      <div className={tailwind('p-4 md:p-6')}>
        <div className={tailwind('border-b border-gray-200 md:hidden')}>
          <button onClick={this.props.onSidebarOpenBtnClick} className={tailwind('group pb-1 focus:outline-none')}>
            <span className={tailwind('rounded text-sm text-gray-500 group-focus:ring')}>{'<'} <span className={tailwind('group-hover:underline')}>Settings</span></span>
          </button>
          <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800')}>Account</h3>
        </div>
        <div className={tailwind('mt-6 md:mt-0')}>
          <h4 className={tailwind('text-base font-medium leading-none text-gray-800')}>Stacks Account</h4>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500')}>Your account is a <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring')} href="https://www.stacks.co" target="_blank" rel="noreferrer">Stacks</a> account and a Stacks account is used to access Stacks blockchain and Stacks data server. Stacks blockchain stores your account's information i.e. username, profile, and data server location. And Stacks data server stores your encrypted app data i.e. all your saved links.</p>
          <p className={tailwind('mt-4 text-base leading-relaxed text-gray-500')}>Your Secret Key is a password that is only known to you. If you lose it, there is no way to retrieve it back. You need to keep it safe.</p>
          <p className={tailwind('mt-4 text-base leading-relaxed text-gray-500')}>Your Secret Key cannot be changed or reset. As your Secret Key is used to encrypt your data, each file individually, if you change your Secret Key, every file needs to be decrypted with your old Secret Key and encrypted again with your new Secret Key.</p>
        </div>
        <div className={tailwind('mt-8 mb-4')}>
          <h4 className={tailwind('text-base font-medium leading-none text-red-600')}>Delete Account</h4>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500')}>As no one without your Secret Key can access your account or your data, you can just leave them as is. To delete all your data, please go to Settings -&gt; Data -&gt; Delete All Data.</p>
          <p className={tailwind('mt-4 text-base leading-relaxed text-gray-500')}>If you get started with us, currently we create your Stacks account without username, profile, and data server location. So there is no data stored in Stacks blockchain and your data server is automatically selected.</p>
          <p className={tailwind('mt-4 text-base leading-relaxed text-gray-500')}>After you delete all your data in Settings -&gt; Data -&gt; Delete All Data, there's nothing left. You can just forget your Secret Key. It's permanently deleting your account.</p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    safeAreaWidth: state.window.width,
  };
};

export default connect(mapStateToProps)(withTailwind(SettingsPopupAccount));
