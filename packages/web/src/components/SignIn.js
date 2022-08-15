import React, { useState, useRef, useEffect } from 'react';
import GracefulImage from 'react-graceful-image';

import walletApi from '../apis/wallet';
import { HASH_SUPPORT } from '../types/const';
import { getUserImageUrl } from '../utils';

import { useTailwind } from '.';

const VIEW_YOUR = 1;
const VIEW_CHOOSE = 2;

const SignIn = (props) => {

  const { domainName, appName, appIconUrl, appScopes } = props;
  const [viewId, setViewId] = useState(VIEW_YOUR);
  const [isLoadingShown, setLoadingShown] = useState(false);
  const [isErrorShown, setErrorShown] = useState(false);
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const walletData = useRef(null);
  const scrollView = useRef(null);
  const textarea = useRef(null);
  const didClick = useRef(false);
  const tailwind = useTailwind();

  const onSecretKeyInputChange = (e) => {
    setSecretKeyInput(e.target.value);
    setErrMsg('');
  };

  const onContinueBtnClick = () => {
    if (didClick.current) return;

    didClick.current = true;
    setLoadingShown(true);
    setTimeout(() => {
      walletApi.restoreAccount(secretKeyInput.trim()).then((data) => {
        didClick.current = false;
        setLoadingShown(false);

        if (data.errMsg) {
          setErrMsg(data.errMsg);
          return;
        }

        walletData.current = data;
        if (walletData.current.wallet.accounts.length === 1) {
          onChooseAccount(0);
          return;
        }

        setViewId(VIEW_CHOOSE);
      }).catch((e) => {
        console.log('onContinueBtnClick error: ', e);
        didClick.current = false;
        setLoadingShown(false);
        setErrorShown(true);
      });
    }, 1);
  };

  const onChooseAccount = (accountIndex) => {
    if (didClick.current) return;

    didClick.current = true;
    setLoadingShown(true);
    setTimeout(() => {
      walletApi.chooseAccount(
        walletData.current, { domainName, appName, appIconUrl, appScopes }, accountIndex
      ).then((data) => {
        didClick.current = false;
        setLoadingShown(false);
        props.onChooseAccountBtnClick(data);
      }).catch((e) => {
        console.log('onChooseAccount error: ', e);
        didClick.current = false;
        setLoadingShown(false);
        setErrorShown(true);
      });
    }, 1);
  };

  useEffect(() => {
    if (viewId === VIEW_YOUR) {
      if (window.PasswordCredential) {
        const opts = { password: true, mediation: 'required' };
        navigator.credentials.get(opts).then((cred) => {
          if (cred && cred.password) setSecretKeyInput(cred.password);
        });
      }
    }
  }, [viewId]);

  useEffect(() => {
    if (window.document.activeElement instanceof HTMLButtonElement) {
      window.document.activeElement.blur();
    }

    if (scrollView.current) scrollView.current.scrollTo(0, 0);
    if (viewId === VIEW_YOUR) {
      setTimeout(() => {
        if (textarea.current) textarea.current.focus();
      }, 100);
    }
  }, [viewId]);

  const _render = (content) => {
    return (
      <React.Fragment>
        <div ref={scrollView} className={tailwind('relative flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6')}>
          {content}
          <div className={tailwind('absolute top-0 right-0 p-1')}>
            <button onClick={props.onPopupCloseBtnClick} className={tailwind('group flex h-7 w-7 items-center justify-center focus:outline-none')} aria-label="Close sign in popup">
              <svg className={tailwind('h-5 w-5 rounded text-gray-300 group-hover:text-gray-400 group-focus:ring-2 group-focus:ring-gray-300')} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {isLoadingShown && <div className={tailwind('absolute inset-0 flex items-center justify-center bg-white bg-opacity-25')}>
          <div className={tailwind('ball-clip-rotate')}>
            <div />
          </div>
        </div>}
        {isErrorShown && <ErrorAlert domainName={domainName} onCloseBtnClick={() => setErrorShown(false)} />}
      </React.Fragment>
    );
  };

  const renderYourView = () => {
    const content = (
      <React.Fragment>
        <h2 className={tailwind('mt-8 text-left text-xl font-semibold text-gray-900')}>Your Secret Key</h2>
        <p className={tailwind('mt-2 text-sm leading-6 text-gray-500')}>Enter your Secret Key below to sign in.</p>
        <div className={tailwind('pt-3.5')}>
          <label htmlFor="secret-key-input" className={tailwind('sr-only')}>Secret Key</label>
          <textarea ref={textarea} onChange={onSecretKeyInputChange} className={tailwind('block h-36 w-full resize-none rounded-md border border-gray-300 py-2.5 px-4 text-sm leading-6 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:h-32 sm:py-3')} value={secretKeyInput} id="secret-key-input" name="secret-key-input" autoCapitalize="none"></textarea>
        </div>
        <div className={tailwind(errMsg ? '' : 'pt-5')}>
          {errMsg && <p className={tailwind('py-2 text-sm text-red-600')}>{errMsg}</p>}
          <button onClick={onContinueBtnClick} className={tailwind('w-full rounded-md border border-transparent bg-blue-700 py-2 px-4 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2')} type="button">Continue</button>
          <p className={tailwind('mt-5 text-center text-sm text-gray-500')}>
            Or
            <button onClick={props.onSignInWithHiroWalletBtnClick} className={tailwind('ml-1 rounded-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1')} type="button">Sign in with Hiro Wallet</button>
          </p>
        </div>
        <div className={tailwind('mt-24 mb-1.5 flex pt-2 sm:mt-28 sm:pt-1')}>
          <button onClick={props.onSignUpBtnClick} className={tailwind('rounded-sm text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1')} type="button">Sign up</button>
        </div>
      </React.Fragment>
    );

    return _render(content);
  };

  const renderChooseView = () => {
    const content = (
      <React.Fragment>
        <h2 className={tailwind('mt-8 text-left text-xl font-semibold text-gray-900')}>Choose an account</h2>
        <p className={tailwind('mt-2 text-sm leading-6 text-gray-500')}>to use with {appName}</p>
        <ul className={tailwind('mt-5 divide-y divide-gray-200 border-t border-b border-gray-200')}>
          {walletData.current.wallet.accounts.map((account, i) => {
            let accountImage = (
              <svg className={tailwind('h-7 w-7 text-blue-100 group-hover:text-blue-200')} viewBox="0 0 28 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M14 12.6C15.1139 12.6 16.1821 12.1575 16.9698 11.3698C17.7575 10.5821 18.2 9.51386 18.2 8.39995C18.2 7.28604 17.7575 6.21776 16.9698 5.4301C16.1821 4.64245 15.1139 4.19995 14 4.19995C12.886 4.19995 11.8178 4.64245 11.0301 5.4301C10.2424 6.21776 9.79995 7.28604 9.79995 8.39995C9.79995 9.51386 10.2424 10.5821 11.0301 11.3698C11.8178 12.1575 12.886 12.6 14 12.6V12.6ZM4.19995 25.2C4.19995 23.913 4.45344 22.6386 4.94593 21.4497C5.43843 20.2607 6.16029 19.1803 7.0703 18.2703C7.98032 17.3603 9.06066 16.6384 10.2497 16.1459C11.4386 15.6534 12.713 15.4 14 15.4C15.2869 15.4 16.5613 15.6534 17.7502 16.1459C18.9392 16.6384 20.0196 17.3603 20.9296 18.2703C21.8396 19.1803 22.5615 20.2607 23.054 21.4497C23.5465 22.6386 23.8 23.913 23.8 25.2H4.19995Z" />
              </svg>
            );
            if (account.profile) {
              const userImageUrl = getUserImageUrl({ profile: account.profile });
              if (userImageUrl) {
                accountImage = (
                  <GracefulImage className={tailwind('h-full w-full bg-white object-cover')} src={userImageUrl} alt={`Profile ${i + 1}`} />
                );
              }
            }

            return (
              <li key={`account-${i}`}>
                <button onClick={() => onChooseAccount(i)} className={tailwind('group flex w-full items-center justify-start rounded-sm py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1')} aria-label={`Choose ${i + 1}`}>
                  <div className={tailwind('flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-300 group-hover:bg-blue-400')}>
                    {accountImage}
                  </div>
                  <div className={tailwind('ml-3.5 flex-shrink flex-grow')}>
                    <p className={tailwind('text-left text-sm text-gray-600 group-hover:text-gray-700')}>{account.username || `Account${i + 1}`}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </React.Fragment>
    );

    return _render(content);
  };

  if (viewId === VIEW_YOUR) return renderYourView();
  else if (viewId === VIEW_CHOOSE) return renderChooseView();
  else throw new Error(`Invalid viewId: ${viewId}`);
};

const ErrorAlert = (props) => {

  const tailwind = useTailwind();

  return (
    <div className={tailwind('absolute inset-x-0 top-5 flex items-start justify-center')}>
      <div className={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
        <div className={tailwind('flex')}>
          <div className={tailwind('flex-shrink-0')}>
            <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={tailwind('ml-3 lg:mt-0.5')}>
            <h3 className={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Oops..., something went wrong!</h3>
            <p className={tailwind('mt-2.5 text-sm text-red-700')}>Please wait a moment and try again. <br className={tailwind('hidden sm:inline')} />If the problem persists, please <a className={tailwind('rounded-sm underline hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700')} href={props.domainName + '/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
              <svg className={tailwind('mb-2 inline-block w-4')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
              </svg></a>.
            </p>
          </div>
          <div className={tailwind('ml-auto pl-3')}>
            <div className={tailwind('-mx-1.5 -my-1.5')}>
              <button onClick={props.onCloseBtnClick} className={tailwind('inline-flex rounded-md p-1.5 text-red-400 transition duration-150 ease-in-out hover:bg-red-100 focus:bg-red-100 focus:outline-none')} aria-label="Dismiss">
                <svg className={tailwind('h-4 w-4')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SignIn);
