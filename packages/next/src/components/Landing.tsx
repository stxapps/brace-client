import React from 'react';
import Image from 'next/image';
import { connect } from 'react-redux';
import Url from 'url-parse';

import { updatePopup } from '../actions';
import {
  HASH_LANDING_HOW, HASH_LANDING_MOBILE, SIGN_UP_POPUP, SHOW_BLANK, SHOW_SIGN_IN,
} from '../types/const';
import { getSafeAreaWidth, getThemeMode } from '../selectors';
import { isNumber, getOffsetTop } from '../utils';

import { withTailwind } from '.';
import TopBar from './TopBar';
import Footer from './Footer';
import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';

import playStore from '../images/play-store-icon.svg';
import appStore from '../images/app-store-icon.svg';
import chromeWebStore from '../images/chrome-web-store-icon.svg';
import firefoxAddons from '../images/firefox-addons-icon.svg';

import saveLinksToVisitLater from '../images/save-links-to-visit-later.svg';
import undrawLink from '../images/undraw-link.svg';
import saveLinkAtTheSite from '../images/save-link-at-the-site-dark.svg';
import saveLinkInUrlBar from '../images/save-link-in-url-bar-dark.svg';

import availableInChromeWebStore from '../images/available-in-chrome-web-store.svg';
import availableInFirefoxAddons from '../images/available-in-firefox-addons.svg';
import availableOnPlayStore from '../images/available-on-play-store.svg';
import availableOnAppStore from '../images/available-on-app-store.svg';

import stacksShort from '../images/stacks-short.svg';
import logoFullWhite from '../images/logo-full-white.svg';

import kindWordsBM from '../images/kind_words_bruno_mello.jpg';
import kindWordsBA from '../images/kind_words_btc_apostle.jpg';
import kindWordsGX from '../images/kind_words_godfred_xcuz.jpg';
import kindWordsMA from '../images/kind_words_moses_adang.jpg';
import kindWordsPF from '../images/kind_words_paul_f.jpg';
import kindWordsSR from '../images/kind_words_santiago_rivera.png';

class Landing extends React.PureComponent<any, any> {

  howSection: any;
  mobileSection: any;

  constructor(props) {
    super(props);

    this.howSection = React.createRef();
    this.mobileSection = React.createRef();
  }

  componentDidMount() {
    this.scrollWindow();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.href !== this.props.href) this.scrollWindow();
  }

  scrollWindow() {
    const hrefObj = new Url(this.props.href, {});
    if (hrefObj.hash === HASH_LANDING_HOW) {
      setTimeout(() => {
        if (this.howSection.current) {
          const top = getOffsetTop(this.howSection.current);
          if (isNumber(top)) window.scrollTo(0, top + 80);
        }
      }, 100);
      return;
    }
    if (hrefObj.hash === HASH_LANDING_MOBILE) {
      setTimeout(() => {
        if (this.mobileSection.current) {
          const top = getOffsetTop(this.mobileSection.current);
          if (isNumber(top)) window.scrollTo(0, top);
        }
      }, 100);
      return;
    }

    window.scrollTo(0, 0);
  }

  onSignUpBtnClick = () => {
    const { isUserSignedIn } = this.props;
    if (isUserSignedIn) {
      const urlObj = new Url(window.location.href, {});
      urlObj.set('pathname', '/');
      urlObj.set('hash', '');
      window.location.href = urlObj.toString();
      return;
    }

    this.props.updatePopup(SIGN_UP_POPUP, true);
  }

  render() {
    const { isUserSignedIn, tailwind } = this.props;

    return (
      <React.Fragment>
        <TopBar rightPane={isUserSignedIn ? SHOW_BLANK : SHOW_SIGN_IN} />
        <div className={tailwind('mx-auto flow-root w-full max-w-6xl bg-white')}>
          <section className={tailwind('flex items-center px-4 pt-16 pb-4 md:px-6 lg:px-8 lg:pt-12')}>
            <div className={tailwind('w-full md:w-55/100 lg:pt-10')}>
              <Image className={tailwind('mx-auto w-11/12 max-w-sm object-contain md:hidden')} src={saveLinksToVisitLater} alt="Save links to visit later" />
              <h1 className={tailwind('first-h1-text mt-16 font-bold leading-none text-gray-900 md:mt-0')}>Save links <br className={tailwind('inline sm:hidden md:inline lg:hidden')} />to visit later</h1>
              <p className={tailwind('mt-4 text-lg font-normal text-gray-500 md:pr-4')}>Your bookmark manager with privacy at heart. Brace.to helps you save links to everything and visit them later easily, anytime, on any of your devices. Powered by Stacks technology, all your saved links are encrypted, and only you can decrypt them and see the content inside.</p>
              <button onClick={this.onSignUpBtnClick} style={{ padding: '0.625rem 1.25rem' }} className={tailwind('mt-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring focus:ring-offset-2')}>
                <span className={tailwind('text-lg font-medium text-gray-50')}>Get Started</span>
                <svg className={tailwind('ml-2 w-2 text-gray-50')} viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
                </svg>
              </button>
              <div className={tailwind('mt-3 flex items-end md:mt-4')}>
                <a className={tailwind('group focus:outline-none')} href="https://play.google.com/store/apps/details?id=com.bracedotto" target="_blank" rel="noreferrer">
                  <Image className={tailwind('w-6 rounded-sm group-focus:ring md:w-8')} src={playStore} alt="Play store" />
                </a>
                <a className={tailwind('group focus:outline-none')} href="https://apps.apple.com/us/app/id1531456778" target="_blank" rel="noreferrer">
                  <Image className={tailwind('ml-4 w-6 rounded-sm group-focus:ring md:w-8')} src={appStore} alt="App store" />
                </a>
                <a className={tailwind('group focus:outline-none')} href="https://chrome.google.com/webstore/detail/brace/hennjddhjodlmdnopaggbjjkpokpbdnn" target="_blank" rel="noreferrer">
                  <Image className={tailwind('ml-4 w-6 rounded-sm group-focus:ring md:w-8')} src={chromeWebStore} alt="Chrome web store" />
                </a>
                <a className={tailwind('group focus:outline-none')} href="https://addons.mozilla.org/en-US/firefox/addon/brace/" target="_blank" rel="noreferrer">
                  <Image className={tailwind('ml-4 -mb-0.5 w-7 rounded-sm group-focus:ring md:w-10')} src={firefoxAddons} alt="Firefox addons" />
                </a>
              </div>
            </div>
            <div className={tailwind('hidden md:block md:w-45/100')}>
              <Image className={tailwind('ml-auto object-contain md:w-full lg:w-11/12')} src={saveLinksToVisitLater} alt="Save links to visit later" />
            </div>
          </section>
          <section className={tailwind('px-4 pt-24 pb-4 md:px-6 lg:px-8')}>
            <Image className={tailwind('mx-auto h-16')} src={undrawLink} alt="unDraw link icon" />
            <h2 className={tailwind('mt-4 text-center text-3xl font-semibold leading-none text-gray-900 md:text-4xl')}>Never miss a link <br className={tailwind('inline md:hidden')} />ever again</h2>
            <p className={tailwind('mt-4 text-lg font-normal text-gray-500 sm:text-center')}>Many interesting, useful, and important stuff is <br className={tailwind('hidden sm:inline md:hidden')} />on the internet. <br className={tailwind('hidden md:inline')} />Brace.to helps you save them so that you will never miss anything.</p>
            <div className={tailwind('mt-10 md:mt-12')}>
              <ul className={tailwind('md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10')}>
                <li>
                  <div className={tailwind('flex')}>
                    <div className={tailwind('flex-shrink-0')}>
                      <div className={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-gray-600')}>
                        <svg style={{ width: '18px' }} className={tailwind('text-white')} viewBox="0 0 47 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M29.325.175c5.138 2.74 13.856 11.394 17.342 16.056-3.001-2.1-9.436-3.867-14.213-2.751.518-3.426-.431-10.58-3.129-13.305zm17.342 25.492V56H0V0h19.621c11.333 0 7.782 18.667 7.782 18.667 7.02-1.739 19.264-.978 19.264 7zM9.333 37.333H21V28H9.333v9.333zm28 4.667h-28v2.333h28V42zm0-7H25.667v2.333h11.666V35zm0-7H25.667v2.333h11.666V28z" />
                        </svg>
                      </div>
                    </div>
                    <div className={tailwind('mt-0.5 ml-4')}>
                      <h3 className={tailwind('text-xl font-medium leading-none text-gray-900')}>Long useful articles</h3>
                      <p className={tailwind('mt-2 text-base text-gray-500')}>You found a long, useful, and important article but can't read it right now? Not a problem. Just save it to Brace.to to read later.</p>
                    </div>
                  </div>
                </li>
                <li className={tailwind('mt-10 md:mt-0')}>
                  <div className={tailwind('flex')}>
                    <div className={tailwind('flex-shrink-0')}>
                      <div className={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-blue-400')}>
                        <svg className={tailwind('w-5 text-white')} viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 4C0 1.79088 1.79088 0 4 0H52C54.2092 0 56 1.79088 56 4V12C56 14.2091 54.2092 16 52 16H4C1.79088 16 0 14.2091 0 12V4Z" />
                          <path d="M0 28C0 25.7908 1.79088 24 4 24H28C30.2092 24 32 25.7908 32 28V52C32 54.2092 30.2092 56 28 56H4C1.79088 56 0 54.2092 0 52V28Z" />
                          <path d="M44 24C41.7908 24 40 25.7908 40 28V52C40 54.2092 41.7908 56 44 56H52C54.2092 56 56 54.2092 56 52V28C56 25.7908 54.2092 24 52 24H44Z" />
                        </svg>
                      </div>
                    </div>
                    <div className={tailwind('mt-0.5 ml-4')}>
                      <h3 className={tailwind('text-xl font-medium leading-none text-gray-900')}>Interesting websites</h3>
                      <p className={tailwind('mt-2 text-base text-gray-500')}>You found a ridiculously cool and interesting website you want to check out later? Not a problem. Just save it to Brace.to to visit later.</p>
                    </div>
                  </div>
                </li>
                <li className={tailwind('mt-10 md:mt-0')}>
                  <div className={tailwind('flex')}>
                    <div className={tailwind('flex-shrink-0')}>
                      <div className={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-yellow-500')}>
                        <svg className={tailwind('w-7 text-white')} viewBox="0 0 75 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M31.111 51.333a4.666 4.666 0 11-9.333 0 4.666 4.666 0 019.333 0zM42 46.667a4.666 4.666 0 100 9.332 4.666 4.666 0 000-9.332zm4.157-15.556l6.15-21.778H0l9.14 21.778h37.017zM61.615 0L50.938 37.333h-39.19l2.61 6.223h41.188L66.354 6.222h6.001L74.667 0H61.616z" />
                        </svg>
                      </div>
                    </div>
                    <div className={tailwind('mt-0.5 ml-4')}>
                      <h3 className={tailwind('text-xl font-medium leading-none text-gray-900')}>Items on online shops</h3>
                      <p className={tailwind('mt-2 text-base text-gray-500')}>You found an item on an online shop you don't want now but might want to buy later? Not a problem. Just save it to Brace.to.</p>
                    </div>
                  </div>
                </li>
                <li className={tailwind('mt-10 md:mt-0')}>
                  <div className={tailwind('flex')}>
                    <div className={tailwind('flex-shrink-0')}>
                      <div className={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-red-500')}>
                        <svg className={tailwind('w-6 text-white')} viewBox="0 0 56 42" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M45.768.43C37.36-.144 18.63-.142 10.232.43 1.139 1.05.068 6.543 0 21c.068 14.432 1.13 19.948 10.232 20.571 8.4.572 27.127.574 35.536 0 9.093-.62 10.164-6.113 10.232-20.57C55.932 6.568 54.87 1.052 45.768.43zM21 30.334V11.667l18.667 9.317L21 30.334z" />
                        </svg>
                      </div>
                    </div>
                    <div className={tailwind('mt-0.5 ml-4')}>
                      <h3 className={tailwind('text-xl font-medium leading-none text-gray-900')}>Videos and music</h3>
                      <p className={tailwind('mt-2 text-base text-gray-500')}>Your friend shared a video with you, but you want to watch it tonight. Not a problem. Just save it to Brace.to to watch it whenever you want.</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </section>
          <section ref={this.howSection} className={tailwind('howitwork-pb pt-24')}>
            <div className={tailwind('bg-gray-900')}>
              <div className={tailwind('relative mx-auto max-w-6xl')}>
                <div style={{ top: '-0.75rem' }} className={tailwind('bookmark-icon-left absolute flex items-center')}>
                  <svg className={tailwind('h-16 w-10 text-yellow-300')} viewBox="0 0 55 88" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 11C0 4.92486 4.92486 0 11 0H44C50.0753 0 55 4.92486 55 11V88L27.5 74.25L0 88V11Z" />
                  </svg>
                </div>
                <h2 className={tailwind('px-4 pt-28 text-lg font-normal text-gray-200 md:px-6 md:leading-6 lg:px-8')}>There are several ways to save a link for your convenience. <br className={tailwind('hidden sm:inline')} />Just one or two clicks away to save any links on any of your devices.</h2>
                <div className={tailwind('px-4 pt-16 md:flex md:px-6 lg:px-8')}>
                  <div className={tailwind('md:flex-shrink-0')}>
                    <div className={tailwind('flex h-14 w-14 items-center justify-center rounded-full bg-gray-300')}>
                      <svg className={tailwind('w-5 text-gray-900')} viewBox="0 0 39 44" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32.5 20c6-6 4.404-16.954-4.058-20H4C2 0 0 1.595 0 4v36c0 2 1.6 4 4 4h25c13.558-5 10-21 3.5-24z" />
                        <circle cx="11" cy="17" r="4" fill="#ffffff" />
                        <circle cx="23" cy="17" r="4" fill="#ffffff" />
                        <circle cx="23" cy="29" r="4" fill="#ffffff" />
                        <circle cx="11" cy="29" r="4" fill="#ffffff" />
                      </svg>
                    </div>
                  </div>
                  <div className={tailwind('md:flex md:flex-grow md:items-start')}>
                    <div className={tailwind('md:mt-0.5 md:ml-4 md:w-1/2')}>
                      <h3 className={tailwind('mt-5 text-xl font-semibold leading-none text-white md:mt-0 lg:text-2xl-extra lg:leading-none')}>Save at Brace.to</h3>
                      <p className={tailwind('mt-2.5 text-base font-normal text-gray-300 md:pr-8 lg:text-lg lg:leading-6')}>Click the '+ add' button on our website.</p>
                    </div>
                    <Image className={tailwind('mx-auto mt-4 w-full max-w-md md:mt-0 md:mr-0 md:w-1/2')} src={saveLinkAtTheSite} alt="Save link at brace.to" />
                  </div>
                </div>
                <div className={tailwind('px-4 pt-16 md:flex md:px-6 lg:px-8')}>
                  <div className={tailwind('md:flex-shrink-0')}>
                    <div className={tailwind('flex h-14 w-14 items-center justify-center rounded-full bg-gray-300')}>
                      <svg className={tailwind('h-4 text-gray-900 lg:h-5')} viewBox="0 0 56 33" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0V32.6667H56V0H0ZM37.3333 7H42V11.6667H37.3333V7ZM30.3333 7H35V11.6667H30.3333V7ZM37.3333 14V18.6667H32.6667V14H37.3333ZM23.3333 7H28V11.6667H23.3333V7ZM30.3333 14V18.6667H25.6667V14H30.3333ZM16.3333 7H21V11.6667H16.3333V7ZM23.3333 14V18.6667H18.6667V14H23.3333ZM7 7H14V11.6667H7V7ZM7 14H16.3333V18.6667H7V14ZM39.6667 25.6667H16.3333V21H39.6667V25.6667ZM49 18.6667H39.6667V14H49V18.6667ZM49 11.6667H44.3333V7H49V11.6667Z" />
                      </svg>
                    </div>
                  </div>
                  <div className={tailwind('md:flex md:flex-grow md:items-start')}>
                    <div className={tailwind('md:mt-0.5 md:ml-4 md:w-1/2')}>
                      <h3 className={tailwind('mt-5 text-xl font-semibold leading-none text-white md:mt-0 lg:text-2xl-extra lg:leading-none')}>Save in Address Bar</h3>
                      <p className={tailwind('mt-2.5 text-base font-normal text-gray-300 md:pr-8 lg:text-lg lg:leading-6')}>Type 'brace.to' and '/' in front of any link in the web browser address bar.</p>
                    </div>
                    <Image className={tailwind('mx-auto mt-4 w-full max-w-md md:mt-0 md:mr-0 md:w-1/2')} src={saveLinkInUrlBar} alt="Save link in address bar" />
                  </div>
                </div>
                <div className={tailwind('px-4 pt-16 md:flex md:px-6 lg:px-8')}>
                  <div className={tailwind('md:flex-shrink-0')}>
                    <div className={tailwind('flex h-14 w-14 items-center justify-center rounded-full bg-gray-300')}>
                      <svg className={tailwind('w-6 text-gray-900')} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.479 18C3.457 18 3.788 17.476 4.187 17.078C5 16.262 6 16.609 6 17.925V24H12.075C13.39 24 13.738 23 12.922 22.187C12.524 21.788 12 21.457 12 20.479C12 19.392 13.108 18 15 18C16.892 18 18 19.392 18 20.479C18 21.457 17.476 21.788 17.078 22.187C16.262 23 16.609 24 17.925 24H24V17.925C24 16.61 23 16.262 22.187 17.078C21.788 17.476 21.457 18 20.479 18C19.392 18 18 16.892 18 15C18 13.108 19.392 12 20.479 12C21.457 12 21.788 12.524 22.187 12.922C23 13.738 24 13.391 24 12.075V6H17.925C16.61 6 16.262 5 17.078 4.187C17.476 3.788 18 3.457 18 2.479C18 1.392 16.892 0 15 0C13.108 0 12 1.392 12 2.479C12 3.457 12.524 3.788 12.922 4.187C13.738 5 13.391 6 12.075 6H6V12.075C6 13.39 5 13.738 4.187 12.922C3.788 12.524 3.457 12 2.479 12C1.392 12 0 13.108 0 15C0 16.892 1.392 18 2.479 18V18Z" />
                      </svg>
                    </div>
                  </div>
                  <div className={tailwind('md:flex md:flex-grow md:items-center lg:items-start')}>
                    <div className={tailwind('md:mt-0.5 md:ml-4 md:w-1/2')}>
                      <h3 className={tailwind('mt-5 text-xl font-semibold leading-none text-white md:mt-0 lg:text-2xl-extra lg:leading-none')}>Save with our Extension</h3>
                      <p className={tailwind('mt-2.5 text-base font-normal text-gray-300 md:pr-8 lg:text-lg lg:leading-6')}>Install our Chrome or Firefox web browser extension and just click on our extension icon next to the address bar.</p>
                      <a className={tailwind('group focus:outline-none')} href="https://chrome.google.com/webstore/detail/brace/hennjddhjodlmdnopaggbjjkpokpbdnn" target="_blank" rel="noreferrer">
                        <Image className={tailwind('mt-4 h-16 rounded group-hover:ring group-focus:ring')} src={availableInChromeWebStore} alt="Available in Chrome Web Store" />
                      </a>
                      <a className={tailwind('group focus:outline-none')} href="https://addons.mozilla.org/en-US/firefox/addon/brace/" target="_blank" rel="noreferrer">
                        <Image className={tailwind('mt-4 h-16 rounded group-hover:ring group-focus:ring')} src={availableInFirefoxAddons} alt="Available in Firefox Addons" />
                      </a>
                    </div>
                    <div className={tailwind('mx-auto mt-4 w-full max-w-sm md:mt-0 md:mr-0 md:w-1/2')}>
                      <img src="/images/save-with-extension.7a80634dc0c41346cfe4.png" srcSet="/images/save-with-extension.7a80634dc0c41346cfe4.png 1x, /images/save-with-extension@2x.96ffe7b05dffc9371cd5.png 2x, /images/save-with-extension@3x.534a356da96d5d0dfd5f.png 3x, /images/save-with-extension@4x.4df907894136a6e9eeb9.png 4x" alt="Brace.to web browser extension" loading='lazy' width={480} height={344} />
                    </div>
                  </div>
                </div>
                <div ref={this.mobileSection} className={tailwind('pt-16 md:flex')}>
                  <div className={tailwind('pl-4 md:flex-shrink-0 md:pl-6 lg:pl-8')}>
                    <div className={tailwind('flex h-14 w-14 items-center justify-center rounded-full bg-gray-300')}>
                      <svg className={tailwind('h-6 text-gray-900')} viewBox="0 0 14 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2C14 0.896 13.104 0 12 0H2C0.896 0 0 0.896 0 2V22C0 23.104 0.896 24 2 24H12C13.104 24 14 23.104 14 22V2ZM5.5 2H8.5C8.776 2 9 2.224 9 2.5C9 2.776 8.776 3 8.5 3H5.5C5.224 3 5 2.776 5 2.5C5 2.224 5.224 2 5.5 2ZM7 22C6.447 22 6 21.552 6 21C6 20.448 6.447 20 7 20C7.552 20 7.999 20.448 7.999 21C7.999 21.552 7.552 22 7 22ZM12 19H2V4.976H12V19Z" />
                      </svg>
                    </div>
                  </div>
                  <div className={tailwind('md:flex md:flex-grow md:items-start')}>
                    <div className={tailwind('px-4 md:mt-0.5 md:ml-4 md:w-1/2 md:px-0')}>
                      <h3 className={tailwind('mt-5 text-xl font-semibold leading-none text-white md:mt-0 lg:text-2xl-extra lg:leading-none')}>Save via our Mobile App</h3>
                      <p className={tailwind('mt-2.5 text-base font-normal text-gray-300 md:pr-8 lg:text-lg lg:leading-6')}>Install our app on your device and just share a link with it.</p>
                      <a className={tailwind('group focus:outline-none')} href="https://play.google.com/store/apps/details?id=com.bracedotto" target="_blank" rel="noreferrer">
                        <Image className={tailwind('available-on-size mx-auto mt-4 rounded-lg group-hover:ring group-focus:ring md:mx-0')} src={availableOnPlayStore} alt="Available on Google Play" />
                      </a>
                      <a className={tailwind('group focus:outline-none')} href="https://apps.apple.com/us/app/id1531456778" target="_blank" rel="noreferrer">
                        <Image className={tailwind('available-on-size mx-auto mt-4 rounded-lg group-hover:ring group-focus:ring md:mx-0')} src={availableOnAppStore} alt="Available on App Store" />
                      </a>
                    </div>
                    <div className={tailwind('mt-4 flex items-center justify-evenly md:mt-0 md:w-1/2 md:justify-end md:pr-6 lg:pr-8')}>
                      <img className={tailwind('share-android-w')} src="/images/share-on-google-pixel-4a.67e41aea98611fddc2e6.png" srcSet="/images/share-on-google-pixel-4a.67e41aea98611fddc2e6.png 1x, /images/share-on-google-pixel-4a@2x.79413e418c63cb635ec3.png 2x, /images/share-on-google-pixel-4a@3x.34e9a43c79685ba34054.png 3x, /images/share-on-google-pixel-4a@4x.77aae1c53310915fb7e1.png 4x" alt="A share screen on Google Pixel 4a" loading='lazy' width={233} height={480} />
                      <img className={tailwind('share-ios-w md:ml-4 lg:ml-8')} src="/images/share-on-iphone-11-pro.c7e2e1f3308f0cd32de2.png" srcSet="/images/share-on-iphone-11-pro.c7e2e1f3308f0cd32de2.png 1x, /images/share-on-iphone-11-pro@2x.7ed3d242876974f43de9.png 2x, /images/share-on-iphone-11-pro@3x.8daef795ccd9f3b584f5.png 3x, /images/share-on-iphone-11-pro@4x.7acf669140890f4b23ad.png 4x" alt="A share screen on iPhone 11 Pro" loading='lazy' width={239} height={480} />
                    </div>
                  </div>
                </div>
                <div className={tailwind('px-4 pt-16 md:px-6 lg:px-8')}>
                  <svg className={tailwind('h-14 w-14 md:mx-auto')} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 48c13.255 0 24-10.745 24-24S37.255 0 24 0 0 10.745 0 24s10.745 24 24 24zm11.121-27.879a3 3 0 00-4.242-4.242L21 25.757l-3.879-3.878a3 3 0 10-4.242 4.242l6 6a3 3 0 004.242 0l12-12z" fill="#4ADE80" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M35.121 20.121a3 3 0 00-4.242-4.242L21 25.757l-3.879-3.878a3 3 0 10-4.242 4.242l6 6a3 3 0 004.242 0l12-12z" fill="#166534" />
                  </svg>
                  <h3 className={tailwind('mt-5 text-xl font-semibold text-white sm:leading-none md:text-center lg:text-2xl-extra lg:leading-none')}>Visit Anytime <br className={tailwind('inline sm:hidden')} />on Any of your Devices</h3>
                  <p className={tailwind('mt-2.5 text-base font-normal text-gray-300 md:mt-3.5 md:text-center lg:text-lg lg:leading-6')}>Every link you save will be beautified with its representative image and title <br className={tailwind('hidden md:inline')} />so you can easily find and recognize it.</p>
                  <div className={tailwind('howitwork-gray-pb relative mt-4')}>
                    <img className={tailwind('absolute left-1/2 w-full max-w-lg -translate-x-1/2 transform md:max-w-lg lg:max-w-xl')} src="/images/visit-anywhere-ss.ec0465b8b40ce9c3db8f.png" srcSet="/images/visit-anywhere-ss.ec0465b8b40ce9c3db8f.png 1x, /images/visit-anywhere-ss@2x.479fbd2e7161dd62aece.png 2x, /images/visit-anywhere-ss@3x.14ecc542821e1461830f.png 3x, /images/visit-anywhere-ss@4x.4e9580b6d7f6c34b53a3.png 4x" alt="Visit anywhere, anytime" loading='lazy' width={640} height={383} />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className={tailwind('px-4 pt-24 pb-4 md:px-6 lg:px-8')}>
            <div className={tailwind('block md:flex md:flex-row md:items-center md:justify-center')}>
              <Image className={tailwind('h-16 md:mt-1 md:h-28 xl:mt-2')} src={stacksShort} alt="Stacks Logo" />
              <div className={tailwind('mt-4 md:mt-0 md:ml-3')}>
                <h2 className={tailwind('text-left text-3xl font-semibold leading-tight text-gray-900 md:text-center md:text-4xl')}>Your privacy at heart <br className={tailwind('hidden md:inline')} />powered by <a className={tailwind('rounded text-purple-blockstack hover:underline focus:outline-none focus:ring')} href="https://www.hiro.so/stacks-js" target="_blank" rel="noreferrer">Stacks</a></h2>
                <p className={tailwind('mt-4 text-left text-lg text-gray-500 md:mt-2 md:text-center')}>Your account is <span className={tailwind('inline md:hidden')}>truly</span> yours. <br className={tailwind('inline sm:hidden')} />Your data is <span className={tailwind('inline md:hidden')}>truly</span> yours.</p>
              </div>
            </div>
            <div className={tailwind('mt-12 block lg:flex lg:flex-row lg:justify-between xl:mt-20')}>
              <div className={tailwind('w-full lg:w-1/3')}>
                <div style={{ borderRadius: '0.75rem' }} className={tailwind('bg-gray-50 p-4 lg:mr-3 lg:h-full lg:max-w-md xl:mr-4')}>
                  <div className={tailwind('flex h-14 w-14 items-center justify-center rounded-full bg-purple-blockstack')}>
                    <svg className={tailwind('h-8 text-white')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M18 8.00001C18.0003 8.93719 17.781 9.86139 17.3598 10.6986C16.9386 11.5357 16.3271 12.2626 15.5744 12.8209C14.8216 13.3792 13.9486 13.7534 13.0252 13.9135C12.1018 14.0737 11.1538 14.0153 10.257 13.743L10 14L9 15L8 16H6V18H2V14L6.257 9.74301C6.00745 8.91803 5.93857 8.04896 6.05504 7.19496C6.17152 6.34096 6.47062 5.52208 6.93199 4.79406C7.39336 4.06604 8.00616 3.44596 8.72869 2.97603C9.45122 2.50611 10.2665 2.19736 11.1191 2.07082C11.9716 1.94427 12.8415 2.0029 13.6693 2.2427C14.4972 2.4825 15.2637 2.89785 15.9166 3.46048C16.5696 4.02311 17.0936 4.71981 17.4531 5.50315C17.8127 6.2865 17.9992 7.13811 18 8.00001ZM12 4.00001C11.7348 4.00001 11.4804 4.10537 11.2929 4.29291C11.1054 4.48044 11 4.7348 11 5.00001C11 5.26523 11.1054 5.51958 11.2929 5.70712C11.4804 5.89466 11.7348 6.00001 12 6.00001C12.5304 6.00001 13.0391 6.21073 13.4142 6.5858C13.7893 6.96087 14 7.46958 14 8.00001C14 8.26523 14.1054 8.51959 14.2929 8.70712C14.4804 8.89466 14.7348 9.00001 15 9.00001C15.2652 9.00001 15.5196 8.89466 15.7071 8.70712C15.8946 8.51959 16 8.26523 16 8.00001C16 6.93915 15.5786 5.92173 14.8284 5.17159C14.0783 4.42144 13.0609 4.00001 12 4.00001Z" />
                    </svg>
                  </div>
                  <h3 className={tailwind('mt-5 text-xl font-medium leading-none text-gray-900')}>Account</h3>
                  <p className={tailwind('mt-2.5 text-base font-normal text-gray-500')}><a className={tailwind('rounded font-medium text-purple-blockstack hover:underline focus:outline-none focus:ring')} href="https://docs.stacks.co/concepts/network-fundamentals/accounts" target="_blank" rel="noreferrer">Your account</a> is cryptographically generated; only you, with your Secret Key, can control it.</p>
                  <h4 className={tailwind('mt-5 text-base font-medium leading-snug text-gray-900')}>No ban on your owned account</h4>
                  <p className={tailwind('mt-2.5 text-base font-normal text-gray-500')}>Your account cannot be locked, banned, or deleted by anyone, as your Secret Key is required to access and modify your account.</p>
                </div>
              </div>
              <div className={tailwind('w-full lg:w-1/3')}>
                <div style={{ borderRadius: '0.75rem' }} className={tailwind('mt-8 bg-gray-50 p-4 lg:mt-0 lg:ml-3 lg:h-full lg:max-w-md xl:ml-4')}>
                  <svg className={tailwind('h-14')} viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="39" cy="39" r="39" fill="#211F6D" />
                    <path d="M39 31.2727C34.7392 31.2727 31.2727 34.7392 31.2727 39C31.2727 43.2608 34.7392 46.7273 39 46.7273C43.2608 46.7273 46.7273 43.2608 46.7273 39C46.7273 34.7392 43.2608 31.2727 39 31.2727ZM43.1047 34.3621C43.2917 34.529 43.471 34.7067 43.6364 34.8937L42.7369 35.7947L42.4804 35.5196L42.2037 35.2631L43.1047 34.3621V34.3621ZM41.0555 33.1566C41.2935 33.2401 41.5268 33.3375 41.7494 33.4487L41.2517 34.6233L40.8499 34.4378L40.5609 34.3312L41.0555 33.1566V33.1566ZM38.6245 32.8182H39.3755V34.0916L39 34.0777L38.6245 34.0916V32.8182ZM36.9816 33.1412L37.4685 34.3188L37.1485 34.4363L36.7745 34.6063L36.2893 33.4286C36.5118 33.3205 36.7452 33.2246 36.9816 33.1412ZM33.4487 36.2506L34.6233 36.7452L34.4394 37.147L34.3312 37.4375L33.1566 36.943C33.2401 36.7035 33.3375 36.4732 33.4487 36.2506ZM32.8182 38.6214H34.0916L34.0777 38.9969L34.0916 39.3725H32.8182V38.6214V38.6214ZM33.4302 41.7076C33.322 41.4835 33.2246 41.2517 33.1412 41.0122L34.3204 40.5254L34.4378 40.8468L34.6063 41.2177L33.4302 41.7076V41.7076ZM34.7886 43.7384L34.257 43.2083L35.2615 42.2006L35.5181 42.4757L35.7947 42.7323L34.7886 43.7384V43.7384ZM35.5196 35.5196L35.2631 35.7947L34.3636 34.8937C34.529 34.7067 34.7083 34.529 34.8953 34.3621L35.7963 35.2631L35.5196 35.5196V35.5196ZM36.9445 44.8434C36.7065 44.7599 36.4732 44.6625 36.2506 44.5513L36.7483 43.3767L37.1501 43.5622L37.4406 43.6704L36.9445 44.8434ZM39.3755 45.1818H38.6245V43.9068L39 43.9207L39.3755 43.9068V45.1818ZM41.0168 44.8573L40.5315 43.6781L40.8515 43.5606L41.2255 43.3906L41.7107 44.5683C41.4882 44.678 41.2548 44.7754 41.0168 44.8573V44.8573ZM39 42.0909C37.2923 42.0909 35.9091 40.7077 35.9091 39C35.9091 38.371 36.0961 37.7884 36.4175 37.3L37.5365 38.4189L38.3432 37.6122L37.2135 36.4794C37.7173 36.1208 38.3324 35.9091 39 35.9091C40.7077 35.9091 42.0909 37.2938 42.0909 39C42.0909 40.7062 40.7077 42.0909 39 42.0909V42.0909ZM43.1047 43.6317L42.2037 42.7307L42.4804 42.4742L42.7369 42.1991L43.6364 43.1001C43.471 43.2886 43.2917 43.4664 43.1047 43.6317V43.6317ZM44.5513 41.7447L43.3767 41.2486L43.5606 40.8484L43.6688 40.5563L44.8434 41.0524C44.7599 41.2888 44.6625 41.5222 44.5513 41.7447ZM45.1818 39.3725H43.9084L43.9223 38.9969L43.9084 38.6214H45.1818V39.3725ZM44.8573 36.9801L43.6781 37.4669L43.5606 37.1455L43.3922 36.7715L44.5698 36.2862C44.678 36.5103 44.7738 36.7436 44.8573 36.9801ZM45.1818 56H52.9091V59.0909H45.1818V56ZM25.0909 56H32.8182V59.0909H25.0909V56ZM22 22V54.4545H56V22H22ZM39 48.2727C33.8753 48.2727 29.7273 44.1247 29.7273 39C29.7273 33.8737 33.8753 29.7273 39 29.7273C44.1247 29.7273 48.2727 33.8753 48.2727 39C48.2727 44.1247 44.1247 48.2727 39 48.2727Z" fill="white" />
                  </svg>
                  <h3 className={tailwind('mt-5 text-xl font-medium leading-none text-gray-900')}>Encryption</h3>
                  <p className={tailwind('mt-2.5 text-base font-normal text-gray-500')}>Everything is encrypted; only you, with your Secret Key, can see the content inside.</p>
                  <h4 className={tailwind('mt-5 text-base font-medium leading-snug text-gray-900')}>No targeted ads and data breach</h4>
                  <p className={tailwind('mt-2.5 text-base font-normal text-gray-500')}>No one can see the content inside your data, so it cannot be used to create targeted ads. If your data is stolen, no information is leaked.</p>
                </div>
              </div>
              <div className={tailwind('w-full lg:w-1/3')}>
                <div style={{ borderRadius: '0.75rem' }} className={tailwind('mt-8 bg-gray-50 p-4 lg:mx-1.5 lg:mt-0 lg:h-full lg:max-w-md xl:mx-2')}>
                  <svg className={tailwind('h-14')} viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="39" cy="39" r="39" fill="#211F6D" />
                    <path d="M25.6452 31.7745L39 24.2261M25.6452 31.7745L39 39.3228M25.6452 31.7745V46.8712M39 24.2261L52.3548 31.7745M39 24.2261V39.3228M39 39.3228L52.3548 31.7745M39 39.3228L52.3548 46.8712M39 39.3228V54.4196M39 39.3228L25.6452 46.8712M52.3548 31.7745V46.8712M25.6452 46.8712L39 54.4196M39 54.4196L52.3548 46.8712" stroke="white" strokeWidth="1.69052" />
                    <path d="M47.7097 34.3875L52.3548 36.9279L57 34.315V29.1617M47.7097 34.3875V29.1617M47.7097 34.3875L52.3548 31.7746M57 29.1617L52.3548 31.7746M57 29.1617L52.3548 26.5488L47.7097 29.1617M47.7097 29.1617L52.3548 31.7746" stroke="white" strokeWidth="1.69052" />
                    <path d="M34.3548 26.8387L39 29.379L43.6452 26.8387V21.6129M34.3548 26.8387V21.6129M34.3548 26.8387L39 24.2258M43.6452 21.6129L39 24.2258M43.6452 21.6129L39 19L34.3548 21.6129M34.3548 21.6129L39 24.2258" stroke="white" strokeWidth="1.69052" />
                    <path d="M30.2903 29.1617V34.3875L25.6452 36.9279L21 34.3875V29.1617M30.2903 29.1617L25.6452 31.7746L21 29.1617M30.2903 29.1617L25.6452 26.5488L21 29.1617" stroke="white" strokeWidth="1.69052" />
                    <path d="M30.2903 44.2584V49.4842L25.6452 52.0245M30.2903 44.2584L25.6452 46.8713M30.2903 44.2584L25.6452 41.6455L21 44.2584M25.6452 52.0245L21 49.4842V44.2584M25.6452 52.0245V46.8713M21 44.2584L25.6452 46.8713" stroke="white" strokeWidth="1.69052" />
                    <path d="M43.6452 51.8063V57.0321L39 59.5724M43.6452 51.8063L39 54.4192M43.6452 51.8063L39 49.1934L34.3548 51.8063M39 59.5724L34.3548 57.0321V51.8063M39 59.5724V54.4192M34.3548 51.8063L39 54.4192" stroke="white" strokeWidth="1.69052" />
                    <path d="M57 44.2584V49.4842L52.3548 52.0245M57 44.2584L52.3548 46.8713M57 44.2584L52.3548 41.6455L47.7097 44.2584M52.3548 52.0245L47.7097 49.4842V44.2584M52.3548 52.0245V46.8713M47.7097 44.2584L52.3548 46.8713" stroke="white" strokeWidth="1.69052" />
                  </svg>
                  <h3 className={tailwind('mt-5 text-xl font-medium leading-none text-gray-900')}>Data Storage</h3>
                  <p className={tailwind('mt-2.5 text-base font-normal text-gray-500')}>Your data lives in <a className={tailwind('rounded font-medium text-purple-blockstack hover:underline focus:outline-none focus:ring')} href="https://docs.stacks.co/concepts/gaia" target="_blank" rel="noreferrer">a data server</a> of your choice; only you, with your Secret Key, can change it.</p>
                  <h4 className={tailwind('mt-5 text-base font-medium leading-snug text-gray-900')}>No lock out of your own data</h4>
                  <p className={tailwind('mt-2.5 text-base font-normal text-gray-500')}>You can manage your data and set permissions directly, as you can host your own data server or choose any data server provider.</p>
                </div>
              </div>
            </div>
          </section>
          <section className={tailwind('mt-20 flex flex-col items-center justify-center bg-purple-blockstack px-4 pt-24 pb-16 md:px-6 md:pt-32 md:pb-24 lg:px-8')}>
            <div className={tailwind('relative')}>
              <h2 className={tailwind('text-center text-4xl font-bold leading-none text-white md:text-5xl')}><span className={tailwind('line-through')}>Don't</span> Can't Be Evil</h2>
              <Image className={tailwind('absolute right-0 h-5 translate-x-0 translate-y-2 transform sm:translate-x-10')} src={logoFullWhite} alt="Brace logo" />
            </div>
            <p className={tailwind('mt-20 text-center text-lg font-normal leading-normal text-gray-200')}>Not only that Brace.to doesn't be evil; Brace.to can't be.</p>
          </section>
          <section className={tailwind('px-4 py-20 md:px-6 lg:px-8')}>
            <h2 className={tailwind('text-left text-3xl font-semibold leading-none text-gray-900 md:text-4xl')}>Some kind words...</h2>
            <p className={tailwind('mt-3 text-lg font-normal text-gray-500')}>Don't just take our word for it. Hear what real people say about us.</p>
            <ul className={tailwind('mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3')}>
              <li>
                <ul>
                  <li>
                    <figure className={tailwind('mx-auto max-w-2xl rounded-4xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                      <blockquote>
                        <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Great app, makes remembering useful websites a breeze. Developers are engaged and making useful improvements regularly.</p>
                      </blockquote>
                      <figcaption className={tailwind('mt-6 flex items-center')}>
                        <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                          <Image className={tailwind('h-12 w-12 object-cover')} src={kindWordsPF} alt="" />
                        </div>
                        <div className={tailwind('ml-4')}>
                          <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Paul F (GayNamedPaul)</div>
                          <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring')} href="https://play.google.com/store/apps/details?id=com.bracedotto&hl=en&gl=US" target="_blank" rel="noreferrer">Google Play Reviews</a>
                        </div>
                      </figcaption>
                    </figure>
                  </li>
                  <li className={tailwind('mt-8')}>
                    <figure className={tailwind('mx-auto max-w-2xl rounded-4xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                      <blockquote>
                        <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Love this! Beautiful minimal design with what you need and nothing more, what productivity apps should aim to be.</p>
                      </blockquote>
                      <figcaption className={tailwind('mt-6 flex items-center')}>
                        <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                          <Image className={tailwind('h-12 w-12 object-cover')} src={kindWordsSR} alt="" />
                        </div>
                        <div className={tailwind('ml-4')}>
                          <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Santiago Rivera</div>
                          <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring')} href="https://play.google.com/store/apps/details?id=com.bracedotto&hl=en&gl=US" target="_blank" rel="noreferrer">Google Play Reviews</a>
                        </div>
                      </figcaption>
                    </figure>
                  </li>
                </ul>
              </li>
              <li>
                <ul>
                  <li className={tailwind('hidden lg:list-item')}>
                    <figure className={tailwind('mx-auto max-w-2xl rounded-4xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                      <blockquote>
                        <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Definitely one of the best bookmarks manager.</p>
                      </blockquote>
                      <figcaption className={tailwind('mt-6 flex items-center')}>
                        <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                          <Image className={tailwind('h-12 w-12 object-cover')} src={kindWordsBM} alt="" />
                        </div>
                        <div className={tailwind('ml-4')}>
                          <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Bruno Mello</div>
                          <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring')} href="https://play.google.com/store/apps/details?id=com.bracedotto&hl=en&gl=US" target="_blank" rel="noreferrer">Google Play Reviews</a>
                        </div>
                      </figcaption>
                    </figure>
                  </li>
                  <li className={tailwind('lg:mt-8')}>
                    <figure className={tailwind('mx-auto max-w-2xl rounded-4xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                      <blockquote>
                        <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>I really adore this life improvement app called <a className={tailwind('rounded hover:underline focus:outline-none focus:ring')} href="https://x.com/bracedotto" target="_blank" rel="noreferrer">@bracedotto</a>. It's simple but easy to use, decentralized, and hassle-free. The essence of <a className={tailwind('rounded hover:underline focus:outline-none focus:ring')} href="https://x.com/hashtag/OwnYourInternet" target="_blank" rel="noreferrer">#OwnYourInternet</a> and <a className={tailwind('rounded hover:underline focus:outline-none focus:ring')} href="https://x.com/hashtag/CantBeEvil" target="_blank" rel="noreferrer">#CantBeEvil</a></p>
                      </blockquote>
                      <figcaption className={tailwind('mt-6 flex items-center')}>
                        <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                          <Image className={tailwind('h-12 w-12 object-cover')} src={kindWordsGX} alt="" />
                        </div>
                        <div className={tailwind('ml-4')}>
                          <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Algorithm.btc</div>
                          <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring')} href="https://x.com/godfred_xcuz/status/1623624956700401667" target="_blank" rel="noreferrer">@godfred_xcuz</a>
                        </div>
                      </figcaption>
                    </figure>
                  </li>
                </ul>
              </li>
              <li className={tailwind('hidden lg:list-item')}>
                <ul>
                  <li>
                    <figure className={tailwind('mx-auto max-w-2xl rounded-4xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                      <blockquote>
                        <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Allows me organize my links and sync them easily on any device. Great!</p>
                      </blockquote>
                      <figcaption className={tailwind('mt-6 flex items-center')}>
                        <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                          <Image className={tailwind('h-12 w-12 object-cover')} src={kindWordsMA} alt="" />
                        </div>
                        <div className={tailwind('ml-4')}>
                          <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Moses Adang</div>
                          <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring')} href="https://play.google.com/store/apps/details?id=com.bracedotto&hl=en&gl=US" target="_blank" rel="noreferrer">Google Play Reviews</a>
                        </div>
                      </figcaption>
                    </figure>
                  </li>
                  <li className={tailwind('lg:mt-8')}>
                    <figure className={tailwind('mx-auto max-w-2xl rounded-4xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                      <blockquote>
                        <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Save your articles, websites, and video links using <a className={tailwind('rounded hover:underline focus:outline-none focus:ring')} href="https://x.com/bracedotto" target="_blank" rel="noreferrer">@bracedotto</a> powered by <a className={tailwind('rounded hover:underline focus:outline-none focus:ring')} href="https://x.com/Stacks" target="_blank" rel="noreferrer">@Stacks</a>. Easy to use and secure. You can't beat that! <a className={tailwind('rounded hover:underline focus:outline-none focus:ring')} href="https://x.com/hashtag/Stacks" target="_blank" rel="noreferrer">#Stacks</a></p>
                      </blockquote>
                      <figcaption className={tailwind('mt-6 flex items-center')}>
                        <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                          <Image className={tailwind('h-12 w-12 object-cover')} src={kindWordsBA} alt="" />
                        </div>
                        <div className={tailwind('ml-4')}>
                          <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Bitcoin Apostle</div>
                          <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring')} href="https://x.com/BTC_Apostle/status/1698816615826227365" target="_blank" rel="noreferrer">@BTC_Apostle</a>
                        </div>
                      </figcaption>
                    </figure>
                  </li>
                </ul>
              </li>
            </ul>
          </section>
          <section className={tailwind('overflow-hidden')}>
            <div className={tailwind('relative mx-auto max-w-2xl px-4 pt-32 pb-24 md:px-6 lg:max-w-3xl lg:px-8 xl:max-w-4xl')}>
              <svg className={tailwind('absolute top-full left-0 translate-x-1/4 -translate-y-16 transform sm:translate-x-1/2 lg:hidden')} width="784" height="404" fill="none" viewBox="0 0 784 404">
                <defs>
                  <pattern id="e56e3f81-d9c1-4b83-a3ba-0d0ac8c32f32" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className={tailwind('text-gray-200')} fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="784" height="404" fill="url(#e56e3f81-d9c1-4b83-a3ba-0d0ac8c32f32)" />
              </svg>
              <svg className={tailwind('absolute right-full top-0 hidden lg:block')} width="404" height="784" fill="none" viewBox="0 0 404 784">
                <defs>
                  <pattern id="56409614-3d62-4985-9a10-7ca758a8f4f0" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className={tailwind('text-gray-200')} fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="784" fill="url(#56409614-3d62-4985-9a10-7ca758a8f4f0)" />
              </svg>
              <div className={tailwind('relative lg:ml-10')}>
                <svg className={tailwind('absolute top-0 left-0 h-36 w-36 -translate-x-8 -translate-y-24 transform text-indigo-200 opacity-50')} stroke="currentColor" fill="none" viewBox="0 0 144 144">
                  <path strokeWidth="2" d="M41.485 15C17.753 31.753 1 59.208 1 89.455c0 24.664 14.891 39.09 32.109 39.09 16.287 0 28.386-13.03 28.386-28.387 0-15.356-10.703-26.524-24.663-26.524-2.792 0-6.515.465-7.446.93 2.327-15.821 17.218-34.435 32.11-43.742L41.485 15zm80.04 0c-23.268 16.753-40.02 44.208-40.02 74.455 0 24.664 14.891 39.09 32.109 39.09 15.822 0 28.386-13.03 28.386-28.387 0-15.356-11.168-26.524-25.129-26.524-2.792 0-6.049.465-6.98.93 2.327-15.821 16.753-34.435 31.644-43.742L121.525 15z" />
                </svg>
                <p className={tailwind('text-2xl font-normal text-gray-900')}>Bring back control of your account and data one link at a time with Brace.to, powered by Web3 technology from Stacks, to ensure your privacy cannot be compromised.</p>
              </div>
            </div>
          </section>
          <section className={tailwind('mb-4 flex justify-center bg-gray-50 py-24 md:py-32')}>
            <div className={tailwind('relative')}>
              <Image className={tailwind('start-saving-links-img static mx-auto h-16 md:absolute md:top-0 md:left-0')} src={undrawLink} alt="unDraw link icon" />
              <h2 className={tailwind('first-h1-text mt-4 text-center font-bold leading-none text-gray-900')}>Start saving links</h2>
              <button onClick={this.onSignUpBtnClick} style={{ padding: '0.875rem 1.375rem' }} className={tailwind('mx-auto mt-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring focus:ring-offset-2')}>
                <span className={tailwind('text-lg font-medium text-gray-50')}>Get started now</span>
                <svg className={tailwind('ml-2 w-2 text-gray-50')} viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
                </svg>
              </button>
            </div>
          </section>
        </div>
        <Footer />
        <SignUpPopup />
        <SignInPopup />
      </React.Fragment >
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isUserSignedIn: state.user.isUserSignedIn,
    href: state.window.href,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

export default connect(mapStateToProps, { updatePopup })(withTailwind(Landing));
