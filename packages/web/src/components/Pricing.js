import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup, updateSettingsPopup, updateSettingsViewId } from '../actions';
import { SHOW_BLANK, SIGN_UP_POPUP, SETTINGS_VIEW_IAP } from '../types/const';
import { getValidPurchase } from '../selectors';
import { isObject } from '../utils';

import { useTailwind } from '.';
import TopBar from './TopBar';
import Footer from './Footer';
import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';

const Pricing = () => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const purchase = useSelector(state => getValidPurchase(state));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onGetStartedBtnClick = () => {
    if (isUserSignedIn) {
      // Empty hash like this, so no reload, popHistoryState is called,
      //   but # in the url. componentDidMount in Main will handle it.
      window.location.hash = '';

      dispatch(updateSettingsViewId(SETTINGS_VIEW_IAP, false));
      dispatch(updateSettingsPopup(true));
      return;
    }

    dispatch(updatePopup(SIGN_UP_POPUP, true));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  let btnText = 'Get Started';
  if (isUserSignedIn) btnText = isObject(purchase) ? 'View' : 'Subscribe';

  return (
    <React.Fragment>
      <TopBar rightPane={SHOW_BLANK} />
      <div className={tailwind('mx-auto w-full max-w-4xl bg-white px-4 pt-16 pb-4 md:px-6 lg:px-8')}>
        <h1 className={tailwind('text-center text-3xl font-extrabold text-gray-900 sm:text-4xl')}>Pricing</h1>
        <p className={tailwind('mt-5 text-center leading-7 text-gray-500')}>One simple no-tricks subscription plan to unlock all extra features</p>
        <div className={tailwind('pt-10 md:flex md:items-center')}>
          <div className={tailwind('')}>
            <p className={tailwind('leading-7 text-gray-500')}>Brace.to is free, and we offer a paid subscription for using extra features. It's our intention to never show advertisements, and we don't rent, sell, or share your information with other companies. Our optional paid subscription is the only way we make money.</p>
            <p className={tailwind('pt-6 leading-7 text-gray-500')}>Please support us and unlock all extra features:</p>
            <div className={tailwind('pt-3 lg:flex lg:justify-between lg:pt-5')}>
              <div className={tailwind('flex')}>
                <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                </svg>
                <span className={tailwind('ml-3 font-medium text-gray-500')}>Tags</span>
              </div>
              <div className={tailwind('flex pt-2 lg:pt-0')}>
                <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                </svg>
                <span className={tailwind('ml-3 font-medium text-gray-500')}>Lock lists</span>
              </div>
              <div className={tailwind('flex pt-2 lg:pt-0')}>
                <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                </svg>
                <span className={tailwind('ml-3 font-medium text-gray-500')}>Change title & image</span>
              </div>
            </div>
            <div className={tailwind('lg:flex lg:justify-evenly lg:pt-5')}>
              <div className={tailwind('flex pt-2 lg:pt-0')}>
                <span className={tailwind('hidden lg:inline')}>&nbsp;&nbsp;</span>
                <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                </svg>
                <span className={tailwind('ml-3 font-medium text-gray-500')}>Dark appearance</span>
              </div>
              <div className={tailwind('flex pt-2 lg:pt-0')}>
                <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                </svg>
                <span className={tailwind('ml-3 font-medium text-gray-500')}>Pin to the top&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
            </div>
          </div>
          <div className={tailwind('mx-auto mt-10 max-w-sm rounded-4xl bg-gray-50 p-4 md:mt-0 md:ml-8 md:max-w-xs md:flex-shrink-0')}>
            <p className={tailwind('text-center text-gray-500')}>Start with a 14-day free trial.</p>
            <p className={tailwind('mt-6 flex items-baseline justify-center gap-x-2')}>
              <span className={tailwind('text-5xl font-bold tracking-tight text-gray-900')}>$4.99</span>
              <span className={tailwind('text-xl font-semibold leading-6 tracking-wide text-gray-600')}>/ year</span>
            </p>
            <div className={tailwind('flex items-center justify-center')}>
              <button onClick={onGetStartedBtnClick} style={{ padding: '0.625rem 1.25rem' }} className={tailwind('mt-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring focus:ring-offset-2')}>
                <span className={tailwind('text-lg font-medium text-gray-50')}>{btnText}</span>
                <svg className={tailwind('ml-2 w-2 text-gray-50')} viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
                </svg>
              </button>
            </div>
            <p className={tailwind('mt-6 text-center text-sm leading-relaxed text-gray-500 blk:text-gray-500')}>Final price may vary based on current exchange rates and taxes at checkout.</p>
          </div>
        </div>
        <div className={tailwind('pt-12 text-right')}>
          <a className={tailwind('group mt-2 inline-block rounded-sm focus:outline-none focus:ring')} href="/">
            <span className={tailwind('pl-0.5 text-gray-500 group-hover:text-gray-600')}>Go home</span>
            <svg className={tailwind('mb-1 ml-1 inline-block w-5 text-gray-400 group-hover:text-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7071 2.29289C10.3166 1.90237 9.68342 1.90237 9.29289 2.29289L2.29289 9.29289C1.90237 9.68342 1.90237 10.3166 2.29289 10.7071C2.68342 11.0976 3.31658 11.0976 3.70711 10.7071L4 10.4142V17C4 17.5523 4.44772 18 5 18H7C7.55228 18 8 17.5523 8 17V15C8 14.4477 8.44772 14 9 14H11C11.5523 14 12 14.4477 12 15V17C12 17.5523 12.4477 18 13 18H15C15.5523 18 16 17.5523 16 17V10.4142L16.2929 10.7071C16.6834 11.0976 17.3166 11.0976 17.7071 10.7071C18.0976 10.3166 18.0976 9.68342 17.7071 9.29289L10.7071 2.29289Z" />
            </svg>
          </a>
        </div>
      </div>
      <Footer />
      <SignUpPopup />
      <SignInPopup />
    </React.Fragment>
  );
};

export default React.memo(Pricing);
