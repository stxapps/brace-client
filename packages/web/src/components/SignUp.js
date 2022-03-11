import React, { useState, useRef, useEffect } from 'react';

import walletApi from '../apis/wallet';
import { HASH_SUPPORT } from '../types/const';
import { isString, randomString, copyTextToClipboard } from '../utils';

const VIEW_START = 1;
const VIEW_YOUR = 2;
const VIEW_SAVE = 3;

const faqs1 = [
  {
    key: 'faqs1-1',
    title: "What's a Secret Key?",
    body: "A Secret Key is a password. It's used to create your account and encrypt/decrypt your data. It's generated when you sign up. Nobody but you will have your Secret Key, to make sure that only you can decrypt your data and see the content inside.",
  },
  {
    key: 'faqs1-2',
    title: "Where should I save my Secret Key?",
    body: (
      <React.Fragment>
        <p className="text-sm text-gray-500 leading-6">Save your Secret Key in a place where only you can find it. For example:</p>
        <ul className="pt-2 pl-2.5 list-disc list-inside text-sm text-gray-500 leading-6">
          <li>A password manager such as 1Password</li>
          <li>Your notes app, protected with a password</li>
          <li>Written down and kept somewhere safe</li>
        </ul>
        <p className="pt-2 pb-3 text-sm text-gray-500 leading-6">Don't save it anywhere where others can find it, or on a website you do not trust. Anybody with your Secret Key will have access to your data.</p>
      </React.Fragment>
    ),
  },
  {
    key: 'faqs1-3',
    title: "Why don't I have a password?",
    body: "Your Secret Key is your password. It's needed to be multiple words for encryption mechanism and it's needed to be long to prevent brute force attacks.",
  },
];

const faqs2 = [
  {
    key: 'faqs2-1',
    title: "What if I lose my Secret Key?",
    body: "If you lose your Secret Key, it will be lost forever. Only you know your Secret Key, which means that no one can help you recover it.",
  },
  {
    key: 'faqs2-2',
    title: "When will I need my Secret Key?",
    body: "You'll need your Secret Key to prove it's you when you sign in on a new device such as a new phone or laptop.",
  },
  {
    key: 'faqs2-3',
    title: "Can I change or reset my Secret Key?",
    body: "Your Secret Key cannot be changed or reset. As your Secret Key is used to encrypt your data, each file individually, if you change your Secret Key, every file needs to be decrypted with your old Secret Key and encrypted again with your new Secret Key.",
  },
];

const SignUp = (props) => {

  const { domainName, appName, appIconUrl, appScopes } = props;
  const [viewId, setViewId] = useState(VIEW_START);
  const [isLoadingShown, setLoadingShown] = useState(false);
  const [isErrorShown, setErrorShown] = useState(false);
  const walletData = useRef(null);
  const scrollView = useRef(null);
  const prevViewId = useRef(viewId);
  const didClick = useRef(false);

  const onGetSecretKeyBtnClick = () => {
    if (didClick.current) return;

    didClick.current = true;
    setLoadingShown(true);
    setTimeout(() => {
      walletApi.createAccount().then((data) => {
        didClick.current = false;
        setLoadingShown(false);

        walletData.current = data;
        setViewId(VIEW_YOUR);
      }).catch((e) => {
        console.log('onGetSecretKeyBtnClick error: ', e);
        didClick.current = false;
        setLoadingShown(false);
        setErrorShown(true);
      });
    }, 1);
  };

  const onClipboardBtnClick = () => {
    copyTextToClipboard(walletData.current.secretKey);
  };

  const onSavedBtnClick = () => {
    setViewId(VIEW_SAVE);
  };

  const onAgainBtnClick = () => {
    setViewId(VIEW_YOUR);
  };

  const onBackedUpBtnClick = () => {
    if (didClick.current) return;

    didClick.current = true;
    setLoadingShown(true);
    setTimeout(() => {
      walletApi.chooseAccount(
        walletData.current, { domainName, appName, appIconUrl, appScopes }, 0
      ).then((data) => {
        didClick.current = false;
        setLoadingShown(false);
        props.onBackedUpBtnClick(data);
      }).catch((e) => {
        console.log('onBackedUpBtnClick error: ', e);
        didClick.current = false;
        setLoadingShown(false);
        setErrorShown(true);
      });
    }, 1);
  };

  useEffect(() => {
    if (viewId === VIEW_YOUR && prevViewId.current === VIEW_START) {
      if (window.PasswordCredential) {
        const data = {
          id: `U-${randomString(8)}`,
          password: walletData.current.secretKey,
        };
        const cred = new window.PasswordCredential(data);
        navigator.credentials.store(cred);
      }
    }
    prevViewId.current = viewId;
  }, [viewId]);

  useEffect(() => {
    if (window.document.activeElement instanceof HTMLButtonElement) {
      window.document.activeElement.blur();
    }

    if (scrollView.current) scrollView.current.scrollTo(0, 0);
  }, [viewId]);

  const _render = (content) => {
    return (
      <React.Fragment>
        <div ref={scrollView} className="relative flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-6">
          {content}
          <div className="absolute top-0 right-0 p-1">
            <button onClick={props.onPopupCloseBtnClick} className="flex items-center justify-center h-7 w-7 group focus:outline-none" aria-label="Close sign up popup">
              <svg className="h-5 w-5 text-gray-300 rounded group-hover:text-gray-400 group-focus:ring-2 group-focus:ring-gray-300" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {isLoadingShown && <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-25">
          <div className="ball-clip-rotate">
            <div />
          </div>
        </div>}
        {isErrorShown && <ErrorAlert domainName={domainName} onCloseBtnClick={() => setErrorShown(false)} />}
      </React.Fragment>
    );
  };

  const renderStartView = () => {
    const content = (
      <React.Fragment>
        <div className="pt-16 flex justify-center items-center">
          <div className="w-40 flex justify-between items-center relative">
            <img className="w-16 h-16" src={appIconUrl} alt="App logo" />
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex justify-center items-center">
              <svg className="w-9 h-9 text-blue-700" viewBox="0 0 36 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.9999 16.2V12.6C8.9999 10.213 9.94811 7.92384 11.6359 6.23601C13.3238 4.54819 15.613 3.59998 17.9999 3.59998C20.3869 3.59998 22.676 4.54819 24.3639 6.23601C26.0517 7.92384 26.9999 10.213 26.9999 12.6V16.2C27.9547 16.2 28.8704 16.5793 29.5455 17.2544C30.2206 17.9295 30.5999 18.8452 30.5999 19.8V28.8C30.5999 29.7548 30.2206 30.6704 29.5455 31.3456C28.8704 32.0207 27.9547 32.4 26.9999 32.4H8.9999C8.04512 32.4 7.12945 32.0207 6.45432 31.3456C5.77919 30.6704 5.3999 29.7548 5.3999 28.8V19.8C5.3999 18.8452 5.77919 17.9295 6.45432 17.2544C7.12945 16.5793 8.04512 16.2 8.9999 16.2ZM23.3999 12.6V16.2H12.5999V12.6C12.5999 11.1678 13.1688 9.7943 14.1815 8.7816C15.1942 7.7689 16.5677 7.19998 17.9999 7.19998C19.4321 7.19998 20.8056 7.7689 21.8183 8.7816C22.831 9.7943 23.3999 11.1678 23.3999 12.6Z" />
              </svg>
            </div>
            <svg style={{ width: '2.375rem', height: '0.3125rem' }} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" viewBox="0 0 38 5" stroke="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="38" height="5" rx="2.5" fill="white" />
              <path d="M1 2.5H37M35.5 1V4M2.5 1V4" stroke="rgb(17, 24, 39)" />
            </svg>
          </div>
        </div>
        <h2 className="mt-12 text-center text-xl font-semibold text-gray-900">{appName} guarantees your privacy by encrypting everything</h2>
        <ul className="mt-7 border-t border-b border-gray-200 divide-y divide-gray-200">
          <li className="py-4 flex justify-start items-center">
            <svg className="w-7 h-7 text-blue-700 flex-grow-0 flex-shrink-0" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.00005 14.4V11.2C8.00005 9.07822 8.8429 7.04339 10.3432 5.5431C11.8435 4.04281 13.8783 3.19995 16 3.19995C18.1218 3.19995 20.1566 4.04281 21.6569 5.5431C23.1572 7.04339 24 9.07822 24 11.2V14.4C24.8487 14.4 25.6627 14.7371 26.2628 15.3372C26.8629 15.9373 27.2 16.7513 27.2 17.6V25.6C27.2 26.4486 26.8629 27.2626 26.2628 27.8627C25.6627 28.4628 24.8487 28.8 24 28.8H8.00005C7.15136 28.8 6.33742 28.4628 5.73731 27.8627C5.13719 27.2626 4.80005 26.4486 4.80005 25.6V17.6C4.80005 16.7513 5.13719 15.9373 5.73731 15.3372C6.33742 14.7371 7.15136 14.4 8.00005 14.4ZM20.8 11.2V14.4H11.2V11.2C11.2 9.92691 11.7058 8.70601 12.6059 7.80584C13.5061 6.90566 14.727 6.39995 16 6.39995C17.2731 6.39995 18.494 6.90566 19.3942 7.80584C20.2943 8.70601 20.8 9.92691 20.8 11.2Z" />
            </svg>
            <div className="ml-3 flex-grow flex-shrink">
              <p className="text-sm text-gray-500 text-left">You'll get a Secret Key that automatically encrypts everything you do</p>
            </div>
          </li>
          <li className="py-4 flex justify-start items-center">
            <svg className="w-7 h-7 text-blue-700 flex-grow-0 flex-shrink-0" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.93127 3.66862C5.6295 3.37717 5.22534 3.2159 4.80582 3.21954C4.38631 3.22319 3.98501 3.39146 3.68836 3.68811C3.3917 3.98476 3.22343 4.38606 3.21979 4.80558C3.21614 5.22509 3.37741 5.62926 3.66887 5.93102L26.0689 28.331C26.3706 28.6225 26.7748 28.7837 27.1943 28.7801C27.6138 28.7765 28.0151 28.6082 28.3118 28.3115C28.6084 28.0149 28.7767 27.6136 28.7803 27.1941C28.784 26.7745 28.6227 26.3704 28.3313 26.0686L25.9745 23.7118C28.4665 21.7248 30.3093 19.0397 31.2673 15.9998C29.2289 9.50862 23.1649 4.79982 16.0001 4.79982C13.492 4.79642 11.0185 5.38519 8.78087 6.51822L5.93287 3.66862H5.93127ZM12.7489 10.4846L15.1713 12.9086C15.7138 12.7645 16.2847 12.7655 16.8267 12.9114C17.3688 13.0573 17.863 13.343 18.26 13.7399C18.6569 14.1369 18.9426 14.6311 19.0885 15.1731C19.2344 15.7152 19.2353 16.2861 19.0913 16.8286L21.5137 19.251C22.2352 18.0287 22.53 16.6011 22.3515 15.1929C22.173 13.7847 21.5315 12.4758 20.5278 11.4721C19.5241 10.4684 18.2152 9.82685 16.807 9.64838C15.3988 9.46991 13.9712 9.76464 12.7489 10.4862V10.4846Z" />
              <path d="M19.9265 26.7151L15.6001 22.3871C14.0444 22.2896 12.5778 21.6277 11.4754 20.5257C10.3731 19.4236 9.71079 17.9571 9.61291 16.4015L3.73611 10.5247C2.38445 12.1343 1.36387 13.9949 0.73291 15.9999C2.77131 22.4911 8.83691 27.1999 16.0001 27.1999C17.3553 27.1999 18.6705 27.0319 19.9265 26.7151Z" />
            </svg>
            <div className="ml-3 flex-grow flex-shrink">
              <p className="text-sm text-gray-500 text-left">{appName} won't be able to see, access, or track your activity</p>
            </div>
          </li>
        </ul>
        <div className="pt-5">
          <button onClick={onGetSecretKeyBtnClick} className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600" type="button">Get your Secret Key</button>
          <p className="mt-5 text-center text-sm text-gray-500">
            Or
            <button onClick={props.onSignUpWithHiroWalletBtnClick} className="ml-1 font-medium text-blue-700 rounded-sm hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-600" type="button">Sign up with Hiro Wallet</button>
          </p>
        </div>
        <div className="flex mt-10 pt-1 mb-1.5">
          <button onClick={props.onSignInBtnClick} className="text-sm font-medium text-blue-700 rounded-sm hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-600" type="button">Sign in</button>
          <a className="ml-3 text-sm font-medium text-blue-700 rounded-sm hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-600" href="https://docs.stacks.co/build-apps/references/authentication#how-it-works" target="_blank" rel="noreferrer">How it works</a>
        </div>
      </React.Fragment>
    );

    return _render(content);
  };

  const renderYourView = () => {
    const content = (
      <React.Fragment>
        <h2 className="mt-8 text-left text-xl font-semibold text-gray-900">Your Secret Key</h2>
        <p className="mt-3 text-sm text-gray-500 leading-6">These 24 words are your Secret Key. They create your account, and you sign in on different devices with them. Make sure to save these somewhere safe. If you lose these words, you lose your account.</p>
        <div className="mt-5 border border-gray-200 rounded-md">
          <p className="py-1 text-base font-medium text-gray-400 text-center border-b border-gray-200">Your Secret Key</p>
          <p className="p-3 text-sm text-gray-700 text-center leading-6">{walletData.current.secretKey}</p>
        </div>
        <div className="pt-5">
          <button onClick={onClipboardBtnClick} className="w-full py-2 px-4 border border-gray-200 text-sm font-medium rounded-md text-blue-700 bg-white hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600" type="button">Copy to clipboard</button>
          <button onClick={onSavedBtnClick} className="mt-3.5 w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600" type="button">I've saved it</button>
        </div>
        <ul className="mt-7 mb-5 border-t border-b border-gray-200 divide-y divide-gray-200">
          {faqs1.map(faq => <ExpListItem key={faq.key} title={faq.title} body={faq.body} />)}
        </ul>
      </React.Fragment>
    );

    return _render(content);
  };

  const renderSaveView = () => {
    const content = (
      <React.Fragment>
        <h2 className="mt-8 text-left text-xl font-semibold text-gray-900">Save your Secret Key</h2>
        <p className="mt-3 text-sm text-gray-500 leading-6">Paste your Secret Key wherever you keep critical, private information such as passwords.</p>
        <p className="mt-3 text-sm text-gray-500 leading-6">Once lost, it's lost forever. So save it somewhere you won't forget.</p>
        <div className="pt-6">
          <button onClick={onBackedUpBtnClick} className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600" type="button">I've backed up my Secret Key</button>
          <button onClick={onAgainBtnClick} className="mt-2 w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-white hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600" type="button">View Secret Key again</button>
        </div>
        <ul className="mt-32 mb-8 border-t border-b border-gray-200 divide-y divide-gray-200">
          {faqs2.map(faq => <ExpListItem key={faq.key} title={faq.title} body={faq.body} />)}
        </ul>
      </React.Fragment>
    );

    return _render(content);
  };

  if (viewId === VIEW_START) return renderStartView();
  else if (viewId === VIEW_YOUR) return renderYourView();
  else if (viewId === VIEW_SAVE) return renderSaveView();
  else throw new Error(`Invalid viewId: ${viewId}`);
};

const ExpListItem = (props) => {

  const { title, body } = props;
  const [isOpen, setIsOpen] = useState(false);

  const onOpenBtnClick = () => {
    setIsOpen(!isOpen);
  };

  let arrowSvg;
  if (isOpen) {
    arrowSvg = (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M14.7069 12.707C14.5194 12.8945 14.2651 12.9998 13.9999 12.9998C13.7348 12.9998 13.4804 12.8945 13.2929 12.707L9.99992 9.41403L6.70692 12.707C6.51832 12.8892 6.26571 12.99 6.00352 12.9877C5.74132 12.9854 5.49051 12.8803 5.3051 12.6948C5.11969 12.5094 5.01452 12.2586 5.01224 11.9964C5.00997 11.7342 5.11076 11.4816 5.29292 11.293L9.29292 7.29303C9.48045 7.10556 9.73475 7.00024 9.99992 7.00024C10.2651 7.00024 10.5194 7.10556 10.7069 7.29303L14.7069 11.293C14.8944 11.4806 14.9997 11.7349 14.9997 12C14.9997 12.2652 14.8944 12.5195 14.7069 12.707Z" />
      </svg>
    );
  } else {
    arrowSvg = (
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M5.29303 7.29308C5.48056 7.10561 5.73487 7.00029 6.00003 7.00029C6.26519 7.00029 6.5195 7.10561 6.70703 7.29308L10 10.5861L13.293 7.29308C13.3853 7.19757 13.4956 7.12139 13.6176 7.06898C13.7396 7.01657 13.8709 6.98898 14.0036 6.98783C14.1364 6.98668 14.2681 7.01198 14.391 7.06226C14.5139 7.11254 14.6255 7.18679 14.7194 7.28069C14.8133 7.37458 14.8876 7.48623 14.9379 7.60913C14.9881 7.73202 15.0134 7.8637 15.0123 7.99648C15.0111 8.12926 14.9835 8.26048 14.9311 8.38249C14.8787 8.50449 14.8025 8.61483 14.707 8.70708L10.707 12.7071C10.5195 12.8946 10.2652 12.9999 10 12.9999C9.73487 12.9999 9.48056 12.8946 9.29303 12.7071L5.29303 8.70708C5.10556 8.51955 5.00024 8.26525 5.00024 8.00008C5.00024 7.73492 5.10556 7.48061 5.29303 7.29308Z" />
      </svg>
    );
  }

  let _body;
  if (isOpen) {
    if (isString(body)) {
      _body = <p className="pb-3 text-sm text-gray-500 leading-6">{body}</p>;
    } else _body = body;
  }

  return (
    <li>
      <button onClick={onOpenBtnClick} className="w-full flex justify-between items-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-600" type="button">
        <p className="flex-grow flex-shrink text-sm text-gray-500 text-left py-3">{title}</p>
        <div className="ml-3 flex-grow-0 flex-shrink-0">
          {arrowSvg}
        </div>
      </button>
      {_body}
    </li>
  );
};

const ErrorAlert = (props) => {
  return (
    <div className="absolute top-5 inset-x-0 flex justify-center items-start">
      <div className="m-4 p-4 bg-red-50 rounded-md shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 lg:mt-0.5">
            <h3 className="text-base text-red-800 font-medium text-left lg:text-sm">Oops..., something went wrong!</h3>
            <p className="mt-2.5 text-sm text-red-700">Please wait a moment and try again. <br className="hidden sm:inline" />If the problem persists, please <a className="underline rounded-sm hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700" href={props.domainName + '/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
              <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
              </svg></a>.
            </p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button onClick={props.onCloseBtnClick} className="p-1.5 inline-flex text-red-400 rounded-md hover:bg-red-100 focus:outline-none focus:bg-red-100 transition ease-in-out duration-150" aria-label="Dismiss">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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

export default React.memo(SignUp);
