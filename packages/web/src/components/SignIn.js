import React, { useState, useRef, useEffect } from 'react';

import { walletRestoreAccount, walletChooseAccount } from '../importWrapper';
import { HASH_SUPPORT } from '../types/const';
import { isIPadIPhoneIPod } from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';

const VIEW_YOUR = 1;

const SignIn = (props) => {

  const { domainName, appName, appIconUrl, appScopes } = props;
  const { height: safeAreaHeight } = useSafeAreaFrame();
  const [viewId] = useState(VIEW_YOUR);
  const [isLoadingShown, setLoadingShown] = useState(false);
  const [isErrorShown, setErrorShown] = useState(false);
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const walletData = useRef(null);
  const scrollView = useRef(null);
  const textarea = useRef(null);
  const prevSafeAreaHeight = useRef(safeAreaHeight);
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
      const secretKey = secretKeyInput.replace(/\s+/g, ' ').trim();
      walletRestoreAccount(
        { domainName, appName, appIconUrl, appScopes }, secretKey
      ).then((data) => {
        didClick.current = false;
        setLoadingShown(false);

        if (data.errMsg) {
          setErrMsg(data.errMsg);
          return;
        }

        walletData.current = data;
        onChooseAccount(0);
      }).catch((error) => {
        console.log('onContinueBtnClick error: ', error);
        didClick.current = false;
        setLoadingShown(false);
        setErrorShown(true);
      });
    }, 72);
  };

  const onChooseAccount = (accountIndex) => {
    if (didClick.current) return;

    didClick.current = true;
    setLoadingShown(true);
    setTimeout(() => {
      walletChooseAccount(walletData.current, accountIndex).then((data) => {
        didClick.current = false;
        setLoadingShown(false);
        props.onChooseAccountBtnClick(data);
      }).catch((error) => {
        console.log('onChooseAccount error: ', error);
        didClick.current = false;
        setLoadingShown(false);
        setErrorShown(true);
      });
    }, 72);
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

  useEffect(() => {
    const heightDiff = prevSafeAreaHeight.current - safeAreaHeight;
    if (isIPadIPhoneIPod() && heightDiff > 240) {
      setTimeout(() => {
        window.scrollBy({ top: heightDiff * -1, behavior: 'smooth' });
      }, 100);
    }

    prevSafeAreaHeight.current = safeAreaHeight;
  }, [safeAreaHeight]);

  const _render = (content) => {
    return (
      <React.Fragment>
        <div ref={scrollView} className={tailwind('relative flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6')}>
          {content}
          <div className={tailwind('absolute top-0 right-0 p-1')}>
            <button onClick={props.onPopupCloseBtnClick} className={tailwind('group flex h-7 w-7 items-center justify-center focus:outline-none')} aria-label="Close sign in popup">
              <svg className={tailwind('h-5 w-5 rounded text-gray-400 group-hover:text-gray-500 group-focus:ring-2 group-focus:ring-gray-400')} stroke="currentColor" fill="none" viewBox="0 0 24 24">
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
        </div>
        <div className={tailwind('mt-24 mb-1.5 flex pt-2 sm:mt-28 sm:pt-1')}>
          <button onClick={props.onSignUpBtnClick} className={tailwind('rounded-sm text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1')} type="button">Sign up</button>
        </div>
      </React.Fragment>
    );

    return _render(content);
  };

  return renderYourView();
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
            <p className={tailwind('mt-2.5 text-sm text-red-700')}>Please wait a moment and try again. <br className={tailwind('hidden sm:inline')} />If the problem persists, please <a className={tailwind('rounded-sm underline hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700')} href={props.domainName + '/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
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
