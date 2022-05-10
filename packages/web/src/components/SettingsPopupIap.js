import React from 'react';

import { HASH_LANDING_MOBILE } from '../types/const';

const SettingsPopupIap = (props) => {

  const { onSidebarOpenBtnClick } = props;

  const onRestoreBtnClick = () => {

  };

  return (
    <div className="p-4 md:p-6">
      <div className="border-b border-gray-200 md:hidden">
        <button onClick={onSidebarOpenBtnClick} className="pb-1 group focus:outline-none">
          <span className="text-sm text-gray-500 rounded group-focus:ring">{'<'} <span className="group-hover:underline">Settings</span></span>
        </button>
        <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none">Subscription</h3>
      </div>
      <div className="mt-6 md:mt-0">
        <h4 className="text-base text-gray-800 font-medium leading-none">Subscription</h4>
        <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Brace.to is free and we offer a paid subscription for use of extra feature(s). It's our intention to never show advertisments and we don't rent, sell or share your information with other companies. Our optional paid subscription is the only way we make money.</p>
      </div>
      <div className="mt-8 mb-4">
        <h4 className="text-base text-gray-800 font-medium leading-none">Purchase</h4>
        <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Please support us and unlock extra feature: pin an item at the top. It's around $4.99 per year (may vary between countries depending on taxes and exchange rates). You can purchase a subscription in our <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href={'/' + HASH_LANDING_MOBILE} target="_blank" rel="noreferrer">Mobile apps</a>.</p>
        <p className="mt-4 text-base text-gray-500 leading-relaxed">If you've already purchased the subscription, try <button onClick={onRestoreBtnClick} className="underline rounded hover:text-gray-700 focus:outline-none focus:ring">Restore purchases</button>.</p>
      </div>
    </div>
  );
};

export default React.memo(SettingsPopupIap);
