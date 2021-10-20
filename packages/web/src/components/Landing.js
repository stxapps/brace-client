import React from 'react';
import { connect } from 'react-redux';

import { updatePopup } from '../actions';
import { SIGN_UP_POPUP, SHOW_SIGN_IN } from '../types/const';

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

import saveWithExtension from '../images/save-with-extension.png';
import saveWithExtension2x from '../images/save-with-extension@2x.png';
import saveWithExtension3x from '../images/save-with-extension@3x.png';
import saveWithExtension4x from '../images/save-with-extension@4x.png';

import shareOnPixel4a from '../images/share-on-google-pixel-4a.png';
import shareOnPixel4a2x from '../images/share-on-google-pixel-4a@2x.png';
import shareOnPixel4a3x from '../images/share-on-google-pixel-4a@3x.png';
import shareOnPixel4a4x from '../images/share-on-google-pixel-4a@4x.png';
import shareOnIPhone11Pro from '../images/share-on-iphone-11-pro.png';
import shareOnIPhone11Pro2x from '../images/share-on-iphone-11-pro@2x.png';
import shareOnIPhone11Pro3x from '../images/share-on-iphone-11-pro@3x.png';
import shareOnIPhone11Pro4x from '../images/share-on-iphone-11-pro@4x.png';

import visitAnywhere from '../images/visit-anywhere-ss.png';
import visitAnywhere2x from '../images/visit-anywhere-ss@2x.png';
import visitAnywhere3x from '../images/visit-anywhere-ss@3x.png';
import visitAnywhere4x from '../images/visit-anywhere-ss@4x.png';

import stacksShort from '../images/stacks-short.svg';
import logoFullWhite from '../images/logo-full-white.svg';

class Landing extends React.PureComponent {

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  onSignUpBtnClick = () => {
    this.props.updatePopup(SIGN_UP_POPUP, true);
  }

  render() {
    return (
      <React.Fragment>
        <TopBar rightPane={SHOW_SIGN_IN} />
        <section className="mx-auto px-4 pt-16 pb-4 flex items-center max-w-6xl md:px-6 lg:px-8 lg:pt-12">
          <div className="w-full md:w-55/100 lg:pt-10">
            <img className="mx-auto w-11/12 max-w-sm object-contain md:hidden" src={saveLinksToVisitLater} alt="Save links to visit later" />
            <h1 className="mt-16 first-h1-text text-gray-900 font-bold leading-none md:mt-0">Save links <br className="inline sm:hidden md:inline lg:hidden" />to visit later</h1>
            <p className="mt-4 text-lg text-gray-500 font-normal md:pr-4">Your bookmark manager with privacy at heart. Brace.to helps you save links to everything and visit them later easily anytime on your any devices. Powered by Stacks technology, all your saved links are encrypted and only you can decrypt them and see the content inside.</p>
            <button onClick={this.onSignUpBtnClick} style={{ padding: '0.625rem 1.25rem' }} className="mt-6 flex justify-center items-center bg-gray-800 rounded-full hover:bg-gray-900 focus:outline-none focus:ring">
              <span className="text-lg text-gray-50 font-medium">Get Started</span>
              <svg className="ml-2 w-2 text-gray-50" viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
              </svg>
            </button>
            <div className="mt-3 flex items-end md:mt-4">
              <a className="focus:outline-none group" href="https://play.google.com/store/apps/details?id=com.bracedotto" target="_blank" rel="noreferrer">
                <img className="w-6 rounded-sm group-focus:ring md:w-8" src={playStore} alt="Play store" />
              </a>
              <a className="focus:outline-none group" href="https://apps.apple.com/us/app/id1531456778" target="_blank" rel="noreferrer">
                <img className="ml-4 w-6 rounded-sm group-focus:ring md:w-8" src={appStore} alt="App store" />
              </a>
              <a className="focus:outline-none group" href="https://chrome.google.com/webstore/detail/brace/hennjddhjodlmdnopaggbjjkpokpbdnn" target="_blank" rel="noreferrer">
                <img className="ml-4 w-6 rounded-sm group-focus:ring md:w-8" src={chromeWebStore} alt="Chrome web store" />
              </a>
              <a className="focus:outline-none group" href="https://addons.mozilla.org/en-US/firefox/addon/brace/" target="_blank" rel="noreferrer">
                <img className="ml-4 -mb-2px w-7 rounded-sm group-focus:ring md:w-10" src={firefoxAddons} alt="Firefox addons" />
              </a>
            </div>
          </div>
          <div className="hidden md:block md:w-45/100">
            <img className="ml-auto md:w-full lg:w-11/12 object-contain" src={saveLinksToVisitLater} alt="Save links to visit later" />
          </div>
        </section>
        <section className="mx-auto px-4 pt-24 pb-4 max-w-6xl md:px-6 lg:px-8">
          <img className="mx-auto h-16" src={undrawLink} alt="unDraw link icon" />
          <h2 className="mt-4 text-3xl text-gray-900 font-semibold leading-none text-center md:text-4xl">Never miss a link <br className="inline md:hidden" />ever again</h2>
          <p className="mt-4 text-lg text-gray-500 font-normal sm:text-center">A lot of interesting, useful, and important stuff is <br className="hidden sm:inline md:hidden" />out there on the internet. <br className="hidden md:inline" />Brace.to helps you save them so that you will never miss anything.</p>
          <div className="mt-10 md:mt-12">
            <ul className="md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <li>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 bg-gray-600 rounded-md">
                      <svg style={{ width: '18px' }} className="text-white" viewBox="0 0 47 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M29.325.175c5.138 2.74 13.856 11.394 17.342 16.056-3.001-2.1-9.436-3.867-14.213-2.751.518-3.426-.431-10.58-3.129-13.305zm17.342 25.492V56H0V0h19.621c11.333 0 7.782 18.667 7.782 18.667 7.02-1.739 19.264-.978 19.264 7zM9.333 37.333H21V28H9.333v9.333zm28 4.667h-28v2.333h28V42zm0-7H25.667v2.333h11.666V35zm0-7H25.667v2.333h11.666V28z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-0.5 ml-4">
                    <h3 className="text-xl text-gray-900 font-medium leading-none">Long useful articles</h3>
                    <p className="mt-2 text-base text-gray-500">You found a long, useful, and important article you can't read it right now? Not a problem. Just save to Brace.to to read it later.</p>
                  </div>
                </div>
              </li>
              <li className="mt-10 md:mt-0">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 bg-blue-400 rounded-md">
                      <svg className="w-5 text-white" viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 4C0 1.79088 1.79088 0 4 0H52C54.2092 0 56 1.79088 56 4V12C56 14.2091 54.2092 16 52 16H4C1.79088 16 0 14.2091 0 12V4Z" />
                        <path d="M0 28C0 25.7908 1.79088 24 4 24H28C30.2092 24 32 25.7908 32 28V52C32 54.2092 30.2092 56 28 56H4C1.79088 56 0 54.2092 0 52V28Z" />
                        <path d="M44 24C41.7908 24 40 25.7908 40 28V52C40 54.2092 41.7908 56 44 56H52C54.2092 56 56 54.2092 56 52V28C56 25.7908 54.2092 24 52 24H44Z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-0.5 ml-4">
                    <h3 className="text-xl text-gray-900 font-medium leading-none">Interesting websites</h3>
                    <p className="mt-2 text-base text-gray-500">You found a ridiculously cool and interesting website you want to check it out later? Not a problem. Just save to Brace.to to visit it later.</p>
                  </div>
                </div>
              </li>
              <li className="mt-10 md:mt-0">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 bg-yellow-500 rounded-md">
                      <svg className="w-7 text-white" viewBox="0 0 75 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31.111 51.333a4.666 4.666 0 11-9.333 0 4.666 4.666 0 019.333 0zM42 46.667a4.666 4.666 0 100 9.332 4.666 4.666 0 000-9.332zm4.157-15.556l6.15-21.778H0l9.14 21.778h37.017zM61.615 0L50.938 37.333h-39.19l2.61 6.223h41.188L66.354 6.222h6.001L74.667 0H61.616z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-0.5 ml-4">
                    <h3 className="text-xl text-gray-900 font-medium leading-none">Items on online shops</h3>
                    <p className="mt-2 text-base text-gray-500">You found an item on online shop you don’t want it now but might want to buy it later? Not a problem. Just save to Brace.to.</p>
                  </div>
                </div>
              </li>
              <li className="mt-10 md:mt-0">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 bg-red-500 rounded-md">
                      <svg className="w-6 text-white" viewBox="0 0 56 42" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M45.768.43C37.36-.144 18.63-.142 10.232.43 1.139 1.05.068 6.543 0 21c.068 14.432 1.13 19.948 10.232 20.571 8.4.572 27.127.574 35.536 0 9.093-.62 10.164-6.113 10.232-20.57C55.932 6.568 54.87 1.052 45.768.43zM21 30.334V11.667l18.667 9.317L21 30.334z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-0.5 ml-4">
                    <h3 className="text-xl text-gray-900 font-medium leading-none">Videos and music</h3>
                    <p className="mt-2 text-base text-gray-500">Your friend’s just shared a video with you but you want to watch it tonight? Not a problem. Just save to Brace.to to watch it whenever you want.</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>
        <section className="pt-24 howitwork-pb">
          <div className="bg-gray-900">
            <div className="mx-auto relative max-w-6xl">
              <div style={{ top: '-0.75rem' }} className="absolute bookmark-icon-left flex items-center">
                <svg className="w-10 h-16 text-yellow-300" viewBox="0 0 55 88" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 11C0 4.92486 4.92486 0 11 0H44C50.0753 0 55 4.92486 55 11V88L27.5 74.25L0 88V11Z" />
                </svg>
              </div>
              <h2 className="pt-28 px-4 text-lg text-gray-200 font-normal md:px-6 md:leading-6 lg:px-8">There are several ways to save a link for your convenience. <br className="hidden sm:inline" />Just one or two clicks away to save any links on your any devices.</h2>
              <div className="pt-16 px-4 md:px-6 md:flex lg:px-8">
                <div className="md:flex-shrink-0">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-300 rounded-full">
                    <svg className="w-5 text-gray-900" viewBox="0 0 39 44" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32.5 20c6-6 4.404-16.954-4.058-20H4C2 0 0 1.595 0 4v36c0 2 1.6 4 4 4h25c13.558-5 10-21 3.5-24z" />
                      <circle cx="11" cy="17" r="4" fill="#ffffff" />
                      <circle cx="23" cy="17" r="4" fill="#ffffff" />
                      <circle cx="23" cy="29" r="4" fill="#ffffff" />
                      <circle cx="11" cy="29" r="4" fill="#ffffff" />
                    </svg>
                  </div>
                </div>
                <div className="md:flex-grow md:flex md:items-start">
                  <div className="md:mt-0.5 md:ml-4 md:w-1/2">
                    <h3 className="mt-5 text-xl text-white font-semibold leading-none md:mt-0 lg:text-2xl-extra lg:leading-none">Save at Brace.to</h3>
                    <p className="mt-2.5 text-base text-gray-300 font-normal md:pr-8 lg:text-lg lg:leading-6">Click the black button with a plus sign at our website.</p>
                  </div>
                  <img className="mt-4 mx-auto w-full max-w-md md:mt-0 md:mr-0 md:w-1/2" src={saveLinkAtTheSite} alt="Save link at brace.to" />
                </div>
              </div>
              <div className="pt-16 px-4 md:px-6 md:flex lg:px-8">
                <div className="md:flex-shrink-0">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-300 rounded-full">
                    <svg className="h-4 text-gray-900 lg:h-5" viewBox="0 0 56 33" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0V32.6667H56V0H0ZM37.3333 7H42V11.6667H37.3333V7ZM30.3333 7H35V11.6667H30.3333V7ZM37.3333 14V18.6667H32.6667V14H37.3333ZM23.3333 7H28V11.6667H23.3333V7ZM30.3333 14V18.6667H25.6667V14H30.3333ZM16.3333 7H21V11.6667H16.3333V7ZM23.3333 14V18.6667H18.6667V14H23.3333ZM7 7H14V11.6667H7V7ZM7 14H16.3333V18.6667H7V14ZM39.6667 25.6667H16.3333V21H39.6667V25.6667ZM49 18.6667H39.6667V14H49V18.6667ZM49 11.6667H44.3333V7H49V11.6667Z" />
                    </svg>
                  </div>
                </div>
                <div className="md:flex-grow md:flex md:items-start">
                  <div className="md:mt-0.5 md:ml-4 md:w-1/2">
                    <h3 className="mt-5 text-xl text-white font-semibold leading-none md:mt-0 lg:text-2xl-extra lg:leading-none">Save in Address Bar</h3>
                    <p className="mt-2.5 text-base text-gray-300 font-normal md:pr-8 lg:text-lg lg:leading-6">Type ‘brace.to’ and ‘/’ in front of any link in web browser address bar.</p>
                  </div>
                  <img className="mt-4 mx-auto w-full max-w-md md:mt-0 md:mr-0 md:w-1/2" src={saveLinkInUrlBar} alt="Save link in address bar" />
                </div>
              </div>
              <div className="pt-16 px-4 md:px-6 md:flex lg:px-8">
                <div className="md:flex-shrink-0">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-300 rounded-full">
                    <svg className="w-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.479 18C3.457 18 3.788 17.476 4.187 17.078C5 16.262 6 16.609 6 17.925V24H12.075C13.39 24 13.738 23 12.922 22.187C12.524 21.788 12 21.457 12 20.479C12 19.392 13.108 18 15 18C16.892 18 18 19.392 18 20.479C18 21.457 17.476 21.788 17.078 22.187C16.262 23 16.609 24 17.925 24H24V17.925C24 16.61 23 16.262 22.187 17.078C21.788 17.476 21.457 18 20.479 18C19.392 18 18 16.892 18 15C18 13.108 19.392 12 20.479 12C21.457 12 21.788 12.524 22.187 12.922C23 13.738 24 13.391 24 12.075V6H17.925C16.61 6 16.262 5 17.078 4.187C17.476 3.788 18 3.457 18 2.479C18 1.392 16.892 0 15 0C13.108 0 12 1.392 12 2.479C12 3.457 12.524 3.788 12.922 4.187C13.738 5 13.391 6 12.075 6H6V12.075C6 13.39 5 13.738 4.187 12.922C3.788 12.524 3.457 12 2.479 12C1.392 12 0 13.108 0 15C0 16.892 1.392 18 2.479 18V18Z" />
                    </svg>
                  </div>
                </div>
                <div className="md:flex-grow md:flex md:items-center lg:items-start">
                  <div className="md:mt-0.5 md:ml-4 md:w-1/2">
                    <h3 className="mt-5 text-xl text-white font-semibold leading-none md:mt-0 lg:text-2xl-extra lg:leading-none">Save with our Extension</h3>
                    <p className="mt-2.5 text-base text-gray-300 font-normal md:pr-8 lg:text-lg lg:leading-6">Install our Chrome or Firefox web browser extension and just click on our extension icon next to the address bar.</p>
                    <a className="focus:outline-none group" href="https://chrome.google.com/webstore/detail/brace/hennjddhjodlmdnopaggbjjkpokpbdnn" target="_blank" rel="noreferrer">
                      <img className="mt-4 h-16 rounded group-hover:ring group-focus:ring" src={availableInChromeWebStore} alt="Available in Chrome Web Store" />
                    </a>
                    <a className="focus:outline-none group" href="https://addons.mozilla.org/en-US/firefox/addon/brace/" target="_blank" rel="noreferrer">
                      <img className="mt-4 h-16 rounded group-hover:ring group-focus:ring" src={availableInFirefoxAddons} alt="Available in Firefox Addons" />
                    </a>
                  </div>
                  <div className="mt-4 mx-auto w-full max-w-sm md:mt-0 md:mr-0 md:w-1/2">
                    <img src={saveWithExtension} srcSet={`${saveWithExtension} 1x, ${saveWithExtension2x} 2x, ${saveWithExtension3x} 3x, ${saveWithExtension4x} 4x`} alt="Brace.to web browser extension" />
                  </div>
                </div>
              </div>
              <div className="pt-16 md:flex">
                <div className="pl-4 md:pl-6 md:flex-shrink-0 lg:pl-8">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-300 rounded-full">
                    <svg className="h-6 text-gray-900" viewBox="0 0 14 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2C14 0.896 13.104 0 12 0H2C0.896 0 0 0.896 0 2V22C0 23.104 0.896 24 2 24H12C13.104 24 14 23.104 14 22V2ZM5.5 2H8.5C8.776 2 9 2.224 9 2.5C9 2.776 8.776 3 8.5 3H5.5C5.224 3 5 2.776 5 2.5C5 2.224 5.224 2 5.5 2ZM7 22C6.447 22 6 21.552 6 21C6 20.448 6.447 20 7 20C7.552 20 7.999 20.448 7.999 21C7.999 21.552 7.552 22 7 22ZM12 19H2V4.976H12V19Z" />
                    </svg>
                  </div>
                </div>
                <div className="md:flex-grow md:flex md:items-start">
                  <div className="px-4 md:mt-0.5 md:ml-4 md:px-0 md:w-1/2">
                    <h3 className="mt-5 text-xl text-white font-semibold leading-none md:mt-0 lg:text-2xl-extra lg:leading-none">Save via our Mobile App</h3>
                    <p className="mt-2.5 text-base text-gray-300 font-normal md:pr-8 lg:text-lg lg:leading-6">Install our Android or iOS app on your phone and just share a link with our app.</p>
                    <a className="focus:outline-none group" href="https://play.google.com/store/apps/details?id=com.bracedotto" target="_blank" rel="noreferrer">
                      <img className="mx-auto mt-4 available-on-size rounded-lg group-hover:ring group-focus:ring md:mx-0" src={availableOnPlayStore} alt="Available on Google Play" />
                    </a>
                    <a className="focus:outline-none group" href="https://apps.apple.com/us/app/id1531456778" target="_blank" rel="noreferrer">
                      <img className="mx-auto mt-4 available-on-size rounded-lg group-hover:ring group-focus:ring md:mx-0" src={availableOnAppStore} alt="Available on App Store" />
                    </a>
                  </div>
                  <div className="mt-4 flex justify-evenly items-center md:mt-0 md:pr-6 md:justify-end md:w-1/2 lg:pr-8">
                    <img className="share-android-w" src={shareOnPixel4a} srcSet={`${shareOnPixel4a} 1x, ${shareOnPixel4a2x} 2x, ${shareOnPixel4a3x} 3x, ${shareOnPixel4a4x} 4x`} alt="A share screen on Google Pixel 4a" />
                    <img className="share-ios-w md:ml-4 lg:ml-8" src={shareOnIPhone11Pro} srcSet={`${shareOnIPhone11Pro} 1x, ${shareOnIPhone11Pro2x} 2x, ${shareOnIPhone11Pro3x} 3x, ${shareOnIPhone11Pro4x} 4x`} alt="A share screen on iPhone 11 Pro" />
                  </div>
                </div>
              </div>
              <div className="pt-16 px-4 md:px-6 lg:px-8">
                <svg className="w-14 h-14 md:mx-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 48c13.255 0 24-10.745 24-24S37.255 0 24 0 0 10.745 0 24s10.745 24 24 24zm11.121-27.879a3 3 0 00-4.242-4.242L21 25.757l-3.879-3.878a3 3 0 10-4.242 4.242l6 6a3 3 0 004.242 0l12-12z" fill="#4ADE80" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M35.121 20.121a3 3 0 00-4.242-4.242L21 25.757l-3.879-3.878a3 3 0 10-4.242 4.242l6 6a3 3 0 004.242 0l12-12z" fill="#166534" />
                </svg>
                <h3 className="mt-5 text-xl text-white font-semibold sm:leading-none md:text-center lg:text-2xl-extra lg:leading-none">Visit Anytime <br className="inline sm:hidden" />on your Any Devices</h3>
                <p className="mt-2.5 text-base text-gray-300 font-normal md:mt-3.5 md:text-center lg:text-lg lg:leading-6">Every link you saved will be beautified with its representative image and title <br className="hidden md:inline" />so that you can easily find it and recognize it.</p>
                <div className="mt-4 relative howitwork-gray-pb">
                  <img className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-lg md:max-w-lg lg:max-w-xl" src={visitAnywhere} srcSet={`${visitAnywhere} 1x, ${visitAnywhere2x} 2x, ${visitAnywhere3x} 3x, ${visitAnywhere4x} 4x`} alt="Visit anywhere, anytime" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto px-4 pt-24 pb-4 max-w-6xl md:px-6 lg:px-8">
          <div className="block md:flex md:flex-row md:justify-center md:items-center">
            <img className="h-16 md:mt-1 md:h-28 xl:mt-2" src={stacksShort} alt="Stacks Logo" />
            <div className="mt-4 md:mt-0 md:ml-3">
              <h2 className="text-3xl text-gray-900 font-semibold text-left leading-tight md:text-4xl md:text-center">Your privacy at heart <br className="hidden md:inline" />powered by <a className="text-purple-blockstack rounded hover:underline focus:outline-none focus:ring" href="https://www.stacks.co/" target="_blank" rel="noreferrer">Stacks</a></h2>
              <p className="mt-4 text-lg text-gray-500 text-left md:mt-2 md:text-center">Your identity is <span className="inline md:hidden">truly</span> yours. <br className="inline sm:hidden" />Your data is <span className="inline md:hidden">truly</span> yours.</p>
            </div>
          </div>
          <div className="mt-12 block lg:flex lg:flex-row lg:justify-between xl:mt-20">
            <div className="w-full lg:w-1/3">
              <div style={{ borderRadius: '0.75rem' }} className="p-4 bg-gray-50 lg:mr-3 lg:h-full lg:max-w-md xl:mr-4">
                <svg className="h-14" viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="39" cy="39" r="39" fill="#211F6D" />
                  <path d="M25.6452 31.7745L39 24.2261M25.6452 31.7745L39 39.3228M25.6452 31.7745V46.8712M39 24.2261L52.3548 31.7745M39 24.2261V39.3228M39 39.3228L52.3548 31.7745M39 39.3228L52.3548 46.8712M39 39.3228V54.4196M39 39.3228L25.6452 46.8712M52.3548 31.7745V46.8712M25.6452 46.8712L39 54.4196M39 54.4196L52.3548 46.8712" stroke="white" strokeWidth="1.69052" />
                  <path d="M47.7097 34.3875L52.3548 36.9279L57 34.315V29.1617M47.7097 34.3875V29.1617M47.7097 34.3875L52.3548 31.7746M57 29.1617L52.3548 31.7746M57 29.1617L52.3548 26.5488L47.7097 29.1617M47.7097 29.1617L52.3548 31.7746" stroke="white" strokeWidth="1.69052" />
                  <path d="M34.3548 26.8387L39 29.379L43.6452 26.8387V21.6129M34.3548 26.8387V21.6129M34.3548 26.8387L39 24.2258M43.6452 21.6129L39 24.2258M43.6452 21.6129L39 19L34.3548 21.6129M34.3548 21.6129L39 24.2258" stroke="white" strokeWidth="1.69052" />
                  <path d="M30.2903 29.1617V34.3875L25.6452 36.9279L21 34.3875V29.1617M30.2903 29.1617L25.6452 31.7746L21 29.1617M30.2903 29.1617L25.6452 26.5488L21 29.1617" stroke="white" strokeWidth="1.69052" />
                  <path d="M30.2903 44.2584V49.4842L25.6452 52.0245M30.2903 44.2584L25.6452 46.8713M30.2903 44.2584L25.6452 41.6455L21 44.2584M25.6452 52.0245L21 49.4842V44.2584M25.6452 52.0245V46.8713M21 44.2584L25.6452 46.8713" stroke="white" strokeWidth="1.69052" />
                  <path d="M43.6452 51.8063V57.0321L39 59.5724M43.6452 51.8063L39 54.4192M43.6452 51.8063L39 49.1934L34.3548 51.8063M39 59.5724L34.3548 57.0321V51.8063M39 59.5724V54.4192M34.3548 51.8063L39 54.4192" stroke="white" strokeWidth="1.69052" />
                  <path d="M57 44.2584V49.4842L52.3548 52.0245M57 44.2584L52.3548 46.8713M57 44.2584L52.3548 41.6455L47.7097 44.2584M52.3548 52.0245L47.7097 49.4842V44.2584M52.3548 52.0245V46.8713M47.7097 44.2584L52.3548 46.8713" stroke="white" strokeWidth="1.69052" />
                </svg>
                <h3 className="mt-5 text-xl text-gray-900 font-medium leading-none">Identity</h3>
                <p className="mt-2.5 text-base text-gray-500 font-normal">Your identity lives in blockchain and only you with your Secret Key can access it and control it.</p>
                <h4 className="mt-5 text-base text-gray-900 font-medium leading-snug">No ban on your owned identity</h4>
                <p className="mt-2.5 text-base text-gray-500 font-normal">Your identity cannot be locked, banned, or deleted by anyone as your Secret Key is required to make a change to your identity in the blockchain.</p>
              </div>
            </div>
            <div className="w-full lg:w-1/3">
              <div style={{ borderRadius: '0.75rem' }} className="mt-8 p-4 bg-gray-50 lg:mt-0 lg:mx-1.5 lg:h-full lg:max-w-md xl:mx-2">
                <svg className="h-14" viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="39" cy="39" r="39" fill="#211F6D" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M25 27C25 25.8954 25.8954 25 27 25H51C52.1046 25 53 25.8954 53 27C53 28.1046 52.1046 29 51 29H27C25.8954 29 25 28.1046 25 27ZM25 35C25 33.8954 25.8954 33 27 33H51C52.1046 33 53 33.8954 53 35C53 36.1046 52.1046 37 51 37H27C25.8954 37 25 36.1046 25 35ZM25 43C25 41.8954 25.8954 41 27 41H51C52.1046 41 53 41.8954 53 43C53 44.1046 52.1046 45 51 45H27C25.8954 45 25 44.1046 25 43ZM25 51C25 49.8954 25.8954 49 27 49H51C52.1046 49 53 49.8954 53 51C53 52.1046 52.1046 53 51 53H27C25.8954 53 25 52.1046 25 51Z" fill="white" />
                </svg>
                <h3 className="mt-5 text-xl text-gray-900 font-medium leading-none">Data Storage</h3>
                <p className="mt-2.5 text-base text-gray-500 font-normal">Your data lives in a storage of your choice and only you with your Secret Key can change it.</p>
                <h4 className="mt-5 text-base text-gray-900 font-medium leading-snug">No lock out from your own data</h4>
                <p className="mt-2.5 text-base text-gray-500 font-normal">You can always access your data directly whenever you want as you have full control of your data storage. Plus, you can manage who can access your data too.</p>
              </div>
            </div>
            <div className="w-full lg:w-1/3">
              <div style={{ borderRadius: '0.75rem' }} className="mt-8 p-4 bg-gray-50 lg:mt-0 lg:ml-3 lg:h-full lg:max-w-md xl:ml-4">
                <svg className="h-14" viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="39" cy="39" r="39" fill="#211F6D" />
                  <path d="M39 31.2727C34.7392 31.2727 31.2727 34.7392 31.2727 39C31.2727 43.2608 34.7392 46.7273 39 46.7273C43.2608 46.7273 46.7273 43.2608 46.7273 39C46.7273 34.7392 43.2608 31.2727 39 31.2727ZM43.1047 34.3621C43.2917 34.529 43.471 34.7067 43.6364 34.8937L42.7369 35.7947L42.4804 35.5196L42.2037 35.2631L43.1047 34.3621V34.3621ZM41.0555 33.1566C41.2935 33.2401 41.5268 33.3375 41.7494 33.4487L41.2517 34.6233L40.8499 34.4378L40.5609 34.3312L41.0555 33.1566V33.1566ZM38.6245 32.8182H39.3755V34.0916L39 34.0777L38.6245 34.0916V32.8182ZM36.9816 33.1412L37.4685 34.3188L37.1485 34.4363L36.7745 34.6063L36.2893 33.4286C36.5118 33.3205 36.7452 33.2246 36.9816 33.1412ZM33.4487 36.2506L34.6233 36.7452L34.4394 37.147L34.3312 37.4375L33.1566 36.943C33.2401 36.7035 33.3375 36.4732 33.4487 36.2506ZM32.8182 38.6214H34.0916L34.0777 38.9969L34.0916 39.3725H32.8182V38.6214V38.6214ZM33.4302 41.7076C33.322 41.4835 33.2246 41.2517 33.1412 41.0122L34.3204 40.5254L34.4378 40.8468L34.6063 41.2177L33.4302 41.7076V41.7076ZM34.7886 43.7384L34.257 43.2083L35.2615 42.2006L35.5181 42.4757L35.7947 42.7323L34.7886 43.7384V43.7384ZM35.5196 35.5196L35.2631 35.7947L34.3636 34.8937C34.529 34.7067 34.7083 34.529 34.8953 34.3621L35.7963 35.2631L35.5196 35.5196V35.5196ZM36.9445 44.8434C36.7065 44.7599 36.4732 44.6625 36.2506 44.5513L36.7483 43.3767L37.1501 43.5622L37.4406 43.6704L36.9445 44.8434ZM39.3755 45.1818H38.6245V43.9068L39 43.9207L39.3755 43.9068V45.1818ZM41.0168 44.8573L40.5315 43.6781L40.8515 43.5606L41.2255 43.3906L41.7107 44.5683C41.4882 44.678 41.2548 44.7754 41.0168 44.8573V44.8573ZM39 42.0909C37.2923 42.0909 35.9091 40.7077 35.9091 39C35.9091 38.371 36.0961 37.7884 36.4175 37.3L37.5365 38.4189L38.3432 37.6122L37.2135 36.4794C37.7173 36.1208 38.3324 35.9091 39 35.9091C40.7077 35.9091 42.0909 37.2938 42.0909 39C42.0909 40.7062 40.7077 42.0909 39 42.0909V42.0909ZM43.1047 43.6317L42.2037 42.7307L42.4804 42.4742L42.7369 42.1991L43.6364 43.1001C43.471 43.2886 43.2917 43.4664 43.1047 43.6317V43.6317ZM44.5513 41.7447L43.3767 41.2486L43.5606 40.8484L43.6688 40.5563L44.8434 41.0524C44.7599 41.2888 44.6625 41.5222 44.5513 41.7447ZM45.1818 39.3725H43.9084L43.9223 38.9969L43.9084 38.6214H45.1818V39.3725ZM44.8573 36.9801L43.6781 37.4669L43.5606 37.1455L43.3922 36.7715L44.5698 36.2862C44.678 36.5103 44.7738 36.7436 44.8573 36.9801ZM45.1818 56H52.9091V59.0909H45.1818V56ZM25.0909 56H32.8182V59.0909H25.0909V56ZM22 22V54.4545H56V22H22ZM39 48.2727C33.8753 48.2727 29.7273 44.1247 29.7273 39C29.7273 33.8737 33.8753 29.7273 39 29.7273C44.1247 29.7273 48.2727 33.8753 48.2727 39C48.2727 44.1247 44.1247 48.2727 39 48.2727Z" fill="white" />
                </svg>
                <h3 className="mt-5 text-xl text-gray-900 font-medium leading-none">Encryption</h3>
                <p className="mt-2.5 text-base text-gray-500 font-normal">Everything is encrypted  and only you with your Secret Key can see the content inside.</p>
                <h4 className="mt-5 text-base text-gray-900 font-medium leading-snug">No targeted ads and No data breach risk</h4>
                <p className="mt-2.5 text-base text-gray-500 font-normal">As no one can see the content inside your data, your data cannot be used to make targeted ads on you. Also, there is no risk, if your data is stolen.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-20 px-4 pt-24 pb-16 flex flex-col items-center justify-center bg-purple-blockstack md:px-6 md:pt-32 md:pb-24 lg:px-8">
          <div className="relative">
            <h2 className="text-4xl text-white font-bold leading-none text-center md:text-5xl"><span className="line-through">Don't</span> Can't Be Evil</h2>
            <img className="absolute right-0 h-5 transform translate-x-0 translate-y-2 sm:translate-x-10" src={logoFullWhite} alt="Brace logo" />
          </div>
          <p className="mt-20 text-lg text-gray-200 font-normal text-center leading-normal">Not just that Brace.to don't be evil, Brace.to can't be evil.</p>
        </section>
        <section className="mx-auto max-w-6xl overflow-hidden">
          <div className="mx-auto px-4 pt-32 pb-24 relative max-w-2xl md:px-6 lg:px-8 lg:max-w-3xl xl:max-w-4xl">
            <svg className="absolute top-full left-0 transform translate-x-1/4 -translate-y-16 sm:translate-x-1/2 lg:hidden" width="784" height="404" fill="none" viewBox="0 0 784 404">
              <defs>
                <pattern id="e56e3f81-d9c1-4b83-a3ba-0d0ac8c32f32" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="784" height="404" fill="url(#e56e3f81-d9c1-4b83-a3ba-0d0ac8c32f32)" />
            </svg>
            <svg className="hidden lg:block absolute right-full top-0 transform -translate-x-1/6" width="404" height="784" fill="none" viewBox="0 0 404 784">
              <defs>
                <pattern id="56409614-3d62-4985-9a10-7ca758a8f4f0" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="784" fill="url(#56409614-3d62-4985-9a10-7ca758a8f4f0)" />
            </svg>
            <div className="relative lg:ml-10">
              <svg className="absolute top-0 left-0 transform -translate-x-8 -translate-y-24 h-36 w-36 text-indigo-200 opacity-50" stroke="currentColor" fill="none" viewBox="0 0 144 144">
                <path strokeWidth="2" d="M41.485 15C17.753 31.753 1 59.208 1 89.455c0 24.664 14.891 39.09 32.109 39.09 16.287 0 28.386-13.03 28.386-28.387 0-15.356-10.703-26.524-24.663-26.524-2.792 0-6.515.465-7.446.93 2.327-15.821 17.218-34.435 32.11-43.742L41.485 15zm80.04 0c-23.268 16.753-40.02 44.208-40.02 74.455 0 24.664 14.891 39.09 32.109 39.09 15.822 0 28.386-13.03 28.386-28.387 0-15.356-11.168-26.524-25.129-26.524-2.792 0-6.049.465-6.98.93 2.327-15.821 16.753-34.435 31.644-43.742L121.525 15z" />
              </svg>
              <p className="text-2xl text-gray-900 font-normal">Bring back control of your identity and your data one link at a time with Brace.to, powered by web 3.0 technology from Stacks to make sure that your privacy cannot be compromised.</p>
            </div>
          </div>
        </section>
        <section className="mb-4 py-24 flex justify-center bg-gray-50 md:py-32">
          <div className="relative">
            <img className="mx-auto static h-16 start-saving-links-img md:absolute md:top-0 md:left-0" src={undrawLink} alt="unDraw link icon" />
            <h2 className="mt-4 first-h1-text text-gray-900 font-bold leading-none text-center">Start saving links</h2>
            <button onClick={() => this.props.signUp()} style={{ padding: '0.875rem 1.375rem' }} className="mt-6 mx-auto flex justify-center items-center bg-gray-800 rounded-full hover:bg-gray-900 focus:outline-none focus:ring">
              <span className="text-lg text-gray-50 font-medium">Get started now</span>
              <svg className="ml-2 w-2 text-gray-50" viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
              </svg>
            </button>
          </div>
        </section>
        <Footer />
        <SignUpPopup />
        <SignInPopup />
      </React.Fragment >
    );
  }
}

export default connect(null, { updatePopup })(Landing);
