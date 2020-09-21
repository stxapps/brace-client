import React from 'react';
import { connect } from 'react-redux';

import { signUp } from '../actions';
import { SHOW_SIGN_IN } from '../types/const';

import TopBar from './TopBar';
import Footer from './Footer';

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

import blockstackShort from '../images/blockstack-short.svg';
import logoFullWhite from '../images/logo-full-white.svg';

class Landing extends React.PureComponent {

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <React.Fragment>
        <TopBar rightPane={SHOW_SIGN_IN} />
        <section className="mx-auto px-4 pt-16 pb-4 flex items-center max-w-6xl md:px-6 lg:px-8 lg:pt-12">
          <div className="w-full md:w-55/100 lg:pt-10">
            <img className="mx-auto w-11/12 max-w-sm object-contain md:hidden" src={saveLinksToVisitLater} alt="Save links to visit later" />
            <h1 className="mt-16 first-h1-text text-gray-900 font-bold leading-none md:mt-0">Save links <br className="inline sm:hidden md:inline lg:hidden" />to visit later</h1>
            <p className="mt-4 text-lg text-gray-700 font-normal text-justify leading-normal md:pr-4">Yet another bookmark manager with privacy at heart. Brace.to helps you save links to everything and visit them later easily anytime on your any devices. Powered by Blockstack technology, all your saved links are encrypted and only you can decrypt them and see the content inside.</p>
            <button onClick={() => this.props.signUp()} className="mt-6 px-6 h-12 bg-gray-900 text-xl text-white font-semibold rounded-full shadow-lg hover:bg-gray-800 active:bg-black focus:outline-none focus:shadow-outline">Get Started</button>
            <div className="mt-3 flex items-end md:mt-4">
              <a className="focus:outline-none-outer" href="https://play.google.com/store/apps/details?id=com.bracedotto">
                <img className="w-6 focus:shadow-outline-inner md:w-8" src={playStore} alt="Play store" />
              </a>
              <a className="focus:outline-none-outer" href="https://apps.apple.com/us/app/id1531456778">
                <img className="ml-4 w-6 focus:shadow-outline-inner md:w-8" src={appStore} alt="App store" />
              </a>
              <a className="focus:outline-none-outer" href="https://chrome.google.com/webstore/detail/brace/hennjddhjodlmdnopaggbjjkpokpbdnn">
                <img className="ml-4 w-6 focus:shadow-outline-inner md:w-8" src={chromeWebStore} alt="Chrome web store" />
              </a>
              <a className="focus:outline-none-outer" href="https://addons.mozilla.org/en-US/firefox/addon/brace/">
                <img className="ml-4 -mb-2px w-7 focus:shadow-outline-inner md:w-10" src={firefoxAddons} alt="Firefox addons" />
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
          <p className="mt-4 text-lg text-gray-700 font-normal text-justify leading-normal sm:text-center">A lot of interesting, useful, and important stuff are <br className="hidden sm:inline md:hidden" />out there on the internet. <br className="hidden md:inline" />Brace.to helps you save them so that you will never miss anything.</p>
          <div className="mt-10">
            <ul className="md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <li>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 bg-gray-700 rounded-md">
                      <svg style={{ width: '18px' }} className="text-white" viewBox="0 0 47 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M29.325.175c5.138 2.74 13.856 11.394 17.342 16.056-3.001-2.1-9.436-3.867-14.213-2.751.518-3.426-.431-10.58-3.129-13.305zm17.342 25.492V56H0V0h19.621c11.333 0 7.782 18.667 7.782 18.667 7.02-1.739 19.264-.978 19.264 7zM9.333 37.333H21V28H9.333v9.333zm28 4.667h-28v2.333h28V42zm0-7H25.667v2.333h11.666V35zm0-7H25.667v2.333h11.666V28z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl text-gray-900 font-medium leading-tight">Long useful articles</h3>
                    <p className="mt-1.5 text-lg text-gray-700 text-justify">You found an interesting, long, useful article you can't read it right now? Not a problem. Just save to Brace.to to read it later.</p>
                  </div>
                </div>
              </li>
              <li className="mt-10 md:mt-0">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 bg-blue-500 rounded-md">
                      <svg className="w-5 text-white" viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 4C0 1.79088 1.79088 0 4 0H52C54.2092 0 56 1.79088 56 4V12C56 14.2091 54.2092 16 52 16H4C1.79088 16 0 14.2091 0 12V4Z" />
                        <path d="M0 28C0 25.7908 1.79088 24 4 24H28C30.2092 24 32 25.7908 32 28V52C32 54.2092 30.2092 56 28 56H4C1.79088 56 0 54.2092 0 52V28Z" />
                        <path d="M44 24C41.7908 24 40 25.7908 40 28V52C40 54.2092 41.7908 56 44 56H52C54.2092 56 56 54.2092 56 52V28C56 25.7908 54.2092 24 52 24H44Z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl text-gray-900 font-medium leading-tight">Interesting websites</h3>
                    <p className="mt-1.5 text-lg text-gray-700 text-justify">You found an interesting websites you want to check it out later? Not a problem. Just save to Brace.to to visit them later.</p>
                  </div>
                </div>
              </li>
              <li className="mt-10 md:mt-0">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 bg-orange-500 rounded-md">
                      <svg className="w-7 text-white" viewBox="0 0 75 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31.111 51.333a4.666 4.666 0 11-9.333 0 4.666 4.666 0 019.333 0zM42 46.667a4.666 4.666 0 100 9.332 4.666 4.666 0 000-9.332zm4.157-15.556l6.15-21.778H0l9.14 21.778h37.017zM61.615 0L50.938 37.333h-39.19l2.61 6.223h41.188L66.354 6.222h6.001L74.667 0H61.616z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl text-gray-900 font-medium leading-tight">Items on online shops</h3>
                    <p className="mt-1.5 text-lg text-gray-700 text-justify">You found an item on online shop you don’t want them now but might want to buy them later? Not a problem. Just save to Brace.to.</p>
                  </div>
                </div>
              </li>
              <li className="mt-10 md:mt-0">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 bg-red-600 rounded-md">
                      <svg className="w-6 text-white" viewBox="0 0 56 42" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M45.768.43C37.36-.144 18.63-.142 10.232.43 1.139 1.05.068 6.543 0 21c.068 14.432 1.13 19.948 10.232 20.571 8.4.572 27.127.574 35.536 0 9.093-.62 10.164-6.113 10.232-20.57C55.932 6.568 54.87 1.052 45.768.43zM21 30.334V11.667l18.667 9.317L21 30.334z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl text-gray-900 font-medium leading-tight">Videos and music</h3>
                    <p className="mt-1.5 text-lg text-gray-700 text-justify">Your friend’s just shared a video with you but you want to watch it tonight? Not a problem. Just save to Brace.to to watch it whenever you want.</p>
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
                <svg className="w-10 h-16 text-yellow-400" viewBox="0 0 55 88" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 11C0 4.92486 4.92486 0 11 0H44C50.0753 0 55 4.92486 55 11V88L27.5 74.25L0 88V11Z" />
                </svg>
              </div>
              <h2 className="pt-28 px-4 text-lg text-gray-300 font-normal text-justify md:px-6 lg:px-8">There are several ways to save a link for your convenience. <br className="hidden sm:inline" />Just one or two clicks away to save any links on your any devices.</h2>
              <div className="pt-16 px-4 md:px-6 md:flex lg:px-8">
                <div className="md:flex-shrink-0">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-500 rounded-full">
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
                  <div className="md:ml-4 md:w-1/2">
                    <h3 className="mt-3 text-2xl-extra text-white font-semibold leading-none md:mt-0 lg:text-3xl">Save at Brace.to</h3>
                    <p className="mt-2 text-base text-gray-400 font-normal text-justify leading-normal md:pr-8 lg:text-lg">Click the black button with a plus sign <br className="hidden lg:inline" />at our website.</p>
                  </div>
                  <img className="mt-4 mx-auto w-full max-w-md md:mt-0 md:mr-0 md:w-1/2" src={saveLinkAtTheSite} alt="Save link at brace.to" />
                </div>
              </div>
              <div className="pt-16 px-4 md:px-6 md:flex lg:px-8">
                <div className="md:flex-shrink-0">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-500 rounded-full">
                    <svg className="h-4 text-gray-900 lg:h-5" viewBox="0 0 56 33" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0V32.6667H56V0H0ZM37.3333 7H42V11.6667H37.3333V7ZM30.3333 7H35V11.6667H30.3333V7ZM37.3333 14V18.6667H32.6667V14H37.3333ZM23.3333 7H28V11.6667H23.3333V7ZM30.3333 14V18.6667H25.6667V14H30.3333ZM16.3333 7H21V11.6667H16.3333V7ZM23.3333 14V18.6667H18.6667V14H23.3333ZM7 7H14V11.6667H7V7ZM7 14H16.3333V18.6667H7V14ZM39.6667 25.6667H16.3333V21H39.6667V25.6667ZM49 18.6667H39.6667V14H49V18.6667ZM49 11.6667H44.3333V7H49V11.6667Z" />
                    </svg>
                  </div>
                </div>
                <div className="md:flex-grow md:flex md:items-start">
                  <div className="md:ml-4 md:w-1/2">
                    <h3 className="mt-3 text-2xl-extra text-white font-semibold leading-none md:mt-0 lg:text-3xl">Save in Address Bar</h3>
                    <p className="mt-2 text-base text-gray-400 font-normal text-justify leading-normal md:pr-8 lg:text-lg">Type ‘brace.to’ and ‘/’ in front of any link in web browser address bar.</p>
                  </div>
                  <img className="mt-4 mx-auto w-full max-w-md md:mt-0 md:mr-0 md:w-1/2" src={saveLinkInUrlBar} alt="Save link in address bar" />
                </div>
              </div>
              <div className="pt-16 px-4 md:px-6 md:flex lg:px-8">
                <div className="md:flex-shrink-0">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-500 rounded-full">
                    <svg className="w-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.479 18C3.457 18 3.788 17.476 4.187 17.078C5 16.262 6 16.609 6 17.925V24H12.075C13.39 24 13.738 23 12.922 22.187C12.524 21.788 12 21.457 12 20.479C12 19.392 13.108 18 15 18C16.892 18 18 19.392 18 20.479C18 21.457 17.476 21.788 17.078 22.187C16.262 23 16.609 24 17.925 24H24V17.925C24 16.61 23 16.262 22.187 17.078C21.788 17.476 21.457 18 20.479 18C19.392 18 18 16.892 18 15C18 13.108 19.392 12 20.479 12C21.457 12 21.788 12.524 22.187 12.922C23 13.738 24 13.391 24 12.075V6H17.925C16.61 6 16.262 5 17.078 4.187C17.476 3.788 18 3.457 18 2.479C18 1.392 16.892 0 15 0C13.108 0 12 1.392 12 2.479C12 3.457 12.524 3.788 12.922 4.187C13.738 5 13.391 6 12.075 6H6V12.075C6 13.39 5 13.738 4.187 12.922C3.788 12.524 3.457 12 2.479 12C1.392 12 0 13.108 0 15C0 16.892 1.392 18 2.479 18V18Z" />
                    </svg>
                  </div>
                </div>
                <div className="md:flex-grow md:flex md:items-center lg:items-start">
                  <div className="md:ml-4 md:w-1/2">
                    <h3 className="mt-3 text-2xl-extra text-white font-semibold leading-none md:mt-0 lg:text-3xl">Save with our Extension</h3>
                    <p className="mt-2 text-base text-gray-400 font-normal text-justify leading-normal md:pr-8 lg:text-lg">Install our Chrome or Firefox web browser extension and just click on our extension icon next to the address bar.</p>
                    <a className="focus:outline-none-outer" href="https://chrome.google.com/webstore/detail/brace/hennjddhjodlmdnopaggbjjkpokpbdnn">
                      <img className="mt-4 h-16 focus:shadow-outline-inner" src={availableInChromeWebStore} alt="Available in Chrome Web Store" />
                    </a>
                    <a className="focus:outline-none-outer" href="https://addons.mozilla.org/en-US/firefox/addon/brace/">
                      <img className="mt-4 h-16 focus:shadow-outline-inner" src={availableInFirefoxAddons} alt="Available in Firefox Addons" />
                    </a>
                  </div>
                  <div className="mt-4 mx-auto w-full max-w-sm md:mt-0 md:mr-0 md:w-1/2">
                    <img src={saveWithExtension} srcSet={`${saveWithExtension} 1x, ${saveWithExtension2x} 2x, ${saveWithExtension3x} 3x, ${saveWithExtension4x} 4x`} alt="Brace.to web browser extension" />
                  </div>
                </div>
              </div>
              <div className="pt-16 md:flex">
                <div className="pl-4 md:pl-6 md:flex-shrink-0 lg:pl-8">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-500 rounded-full">
                    <svg className="h-6 text-gray-900" viewBox="0 0 14 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2C14 0.896 13.104 0 12 0H2C0.896 0 0 0.896 0 2V22C0 23.104 0.896 24 2 24H12C13.104 24 14 23.104 14 22V2ZM5.5 2H8.5C8.776 2 9 2.224 9 2.5C9 2.776 8.776 3 8.5 3H5.5C5.224 3 5 2.776 5 2.5C5 2.224 5.224 2 5.5 2ZM7 22C6.447 22 6 21.552 6 21C6 20.448 6.447 20 7 20C7.552 20 7.999 20.448 7.999 21C7.999 21.552 7.552 22 7 22ZM12 19H2V4.976H12V19Z" />
                    </svg>
                  </div>
                </div>
                <div className="md:flex-grow md:flex md:items-start">
                  <div className="px-4 md:ml-4 md:px-0 md:w-1/2">
                    <h3 className="mt-3 text-2xl-extra text-white font-semibold leading-none md:mt-0 lg:text-3xl">Save via our Mobile App</h3>
                    <p className="mt-2 text-base text-gray-400 font-normal text-justify leading-normal md:pr-8 lg:text-lg">Install our Android or iOS app on your phone and just share a link with our app.</p>
                    <a className="focus:outline-none-outer" href="https://play.google.com/store/apps/details?id=com.bracedotto">
                      <img className="mx-auto mt-4 available-on-size rounded-lg focus:shadow-outline-inner md:mx-0" src={availableOnPlayStore} alt="Available on Google Play" />
                    </a>
                    <a className="focus:outline-none-outer" href="https://apps.apple.com/us/app/id1531456778">
                      <img className="mx-auto mt-4 available-on-size rounded-lg focus:shadow-outline-inner md:mx-0" src={availableOnAppStore} alt="Available on App Store" />
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
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 48c13.255 0 24-10.745 24-24S37.255 0 24 0 0 10.745 0 24s10.745 24 24 24zm11.121-27.879a3 3 0 00-4.242-4.242L21 25.757l-3.879-3.878a3 3 0 10-4.242 4.242l6 6a3 3 0 004.242 0l12-12z" fill="#68D391" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M35.121 20.121a3 3 0 00-4.242-4.242L21 25.757l-3.879-3.878a3 3 0 10-4.242 4.242l6 6a3 3 0 004.242 0l12-12z" fill="#22543D" />
                </svg>
                <h3 className="mt-3 text-2xl-extra text-white font-semibold leading-none md:text-center lg:text-3xl">Visit anytime <br className="inline sm:hidden" />on your any devices</h3>
                <p className="mt-2 text-base text-gray-400 font-normal text-justify leading-normal md:text-center">Every link you saved will be beautified with its representative image and title <br className="hidden md:inline" />so that you can easily find them and recognize them.</p>
                <div className="mt-3 relative howitwork-gray-pb">
                  <img className="pt-2 absolute left-1/2 transform -translate-x-1/2 w-full max-w-lg md:max-w-lg lg:max-w-xl" src={visitAnywhere} srcSet={`${visitAnywhere} 1x, ${visitAnywhere2x} 2x, ${visitAnywhere3x} 3x, ${visitAnywhere4x} 4x`} alt="Visit anywhere, anytime" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto px-4 pt-24 pb-4 max-w-6xl md:px-6 lg:px-8">
          <div className="block md:flex md:flex-row md:justify-center md:items-center">
            <img className="h-16 md:mt-1 md:h-28 xl:mt-2" src={blockstackShort} alt="Blockstack Logo" />
            <div className="mt-4 md:mt-0 md:ml-3">
              <h2 className="text-3xl text-gray-900 font-semibold text-left leading-tight md:text-4xl md:text-center">Your privacy at heart <br className="hidden md:inline" />powered by <a className="text-purple-blockstack focus:outline-none focus:shadow-outline" href="https://blockstack.org/">Blockstack</a></h2>
              <p className="mt-4 text-xl text-gray-700 leading-tight text-left md:mt-2 md:text-center">Your identity is <span className="inline md:hidden">truly</span> yours. <br className="inline sm:hidden" />Your data is <span className="inline md:hidden">truly</span> yours.</p>
            </div>
          </div>
          <div className="mt-12 block md:flex md:flex-row md:justify-between">
            <div className="w-full md:w-1/2">
              <div style={{ borderRadius: '0.75rem' }} className="p-4 bg-gray-100 md:mr-2 md:h-full lg:mx-auto lg:max-w-md">
                <svg className="h-14" viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="39" cy="39" r="39" fill="#211F6D" />
                  <path d="M22.5483 30.2583L38.5 21.2422M22.5483 30.2583L38.5 39.2744M22.5483 30.2583V48.2906M38.5 21.2422L54.4516 30.2583M38.5 21.2422V39.2744M38.5 39.2744L54.4516 30.2583M38.5 39.2744L54.4516 48.2906M38.5 39.2744V57.3067M38.5 39.2744L22.5483 48.2906M54.4516 30.2583V48.2906M22.5483 48.2906L38.5 57.3067M38.5 57.3067L54.4516 48.2906" stroke="white" strokeWidth="2.01924" />
                  <path d="M48.9032 33.379L54.4516 36.4133L60 33.2923V27.1371M48.9032 33.379V27.1371M48.9032 33.379L54.4516 30.258M60 27.1371L54.4516 30.258M60 27.1371L54.4516 24.0161L48.9032 27.1371M48.9032 27.1371L54.4516 30.258" stroke="white" strokeWidth="2.01924" />
                  <path d="M32.9517 24.3629L38.5 27.3972L44.0484 24.3629V18.121M32.9517 24.3629V18.121M32.9517 24.3629L38.5 21.2419M44.0484 18.121L38.5 21.2419M44.0484 18.121L38.5 15L32.9517 18.121M32.9517 18.121L38.5 21.2419" stroke="white" strokeWidth="2.01924" />
                  <path d="M28.0968 27.1371V33.379L22.5484 36.4133L17 33.379V27.1371M28.0968 27.1371L22.5484 30.258L17 27.1371M28.0968 27.1371L22.5484 24.0161L17 27.1371" stroke="white" strokeWidth="2.01924" />
                  <path d="M28.0968 45.1691V51.411L22.5484 54.4453M28.0968 45.1691L22.5484 48.29M28.0968 45.1691L22.5484 42.0481L17 45.1691M22.5484 54.4453L17 51.411V45.1691M22.5484 54.4453V48.29M17 45.1691L22.5484 48.29" stroke="white" strokeWidth="2.01924" />
                  <path d="M44.0484 54.1852V60.4271L38.5 63.4614M44.0484 54.1852L38.5 57.3061M44.0484 54.1852L38.5 51.0642L32.9517 54.1852M38.5 63.4614L32.9517 60.4271V54.1852M38.5 63.4614V57.3061M32.9517 54.1852L38.5 57.3061" stroke="white" strokeWidth="2.01924" />
                  <path d="M60 45.1691V51.411L54.4516 54.4453M60 45.1691L54.4516 48.29M60 45.1691L54.4516 42.0481L48.9032 45.1691M54.4516 54.4453L48.9032 51.411V45.1691M54.4516 54.4453V48.29M48.9032 45.1691L54.4516 48.29" stroke="white" strokeWidth="2.01924" />
                </svg>
                <h3 className="mt-4 text-2xl text-gray-800 font-semibold leading-none">User-owned Identity</h3>
                <p className="mt-3 text-lg text-gray-700 font-normal text-justify leading-normal">Your identity <span className="font-semibold">cannot</span> be locked, banned, or deleted by Brace.to or anyone. Your identity lives in blockchain. Only you with your password can access it and control it.</p>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div style={{ borderRadius: '0.75rem' }} className="mt-8 p-4 bg-gray-100 md:mt-0 md:ml-2 md:h-full lg:mx-auto lg:max-w-md">
                <svg className="h-14 text-purple-blockstack" viewBox="0 0 72 79" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M36 19.6364C26.9771 19.6364 19.6364 26.9771 19.6364 36C19.6364 45.0229 26.9771 52.3636 36 52.3636C45.0229 52.3636 52.3636 45.0229 52.3636 36C52.3636 26.9771 45.0229 19.6364 36 19.6364ZM44.6924 26.1785C45.0884 26.532 45.468 26.9084 45.8182 27.3044L43.9135 29.2124L43.3702 28.6298L42.7844 28.0865L44.6924 26.1785ZM40.3527 23.6258C40.8567 23.8025 41.3509 24.0087 41.8222 24.2444L40.7684 26.7316L39.9175 26.3389L39.3055 26.1131L40.3527 23.6258ZM35.2047 22.9091H36.7953V25.6058L36 25.5764L35.2047 25.6058V22.9091ZM31.7258 23.5931L32.7567 26.0869L32.0793 26.3356L31.2873 26.6956L30.2596 24.2018C30.7309 23.9727 31.2251 23.7698 31.7258 23.5931ZM24.2444 30.1778L26.7316 31.2251L26.3422 32.076L26.1131 32.6913L23.6258 31.644C23.8025 31.1367 24.0087 30.6491 24.2444 30.1778ZM22.9091 35.1982H25.6058L25.5764 35.9935L25.6058 36.7887H22.9091V35.1982ZM24.2051 41.7338C23.976 41.2593 23.7698 40.7684 23.5931 40.2611L26.0902 39.2302L26.3389 39.9109L26.6956 40.6964L24.2051 41.7338ZM27.0818 46.0342L25.956 44.9116L28.0833 42.7778L28.6265 43.3604L29.2124 43.9036L27.0818 46.0342ZM28.6298 28.6298L28.0865 29.2124L26.1818 27.3044C26.532 26.9084 26.9116 26.532 27.3076 26.1785L29.2156 28.0865L28.6298 28.6298ZM31.6473 48.3742C31.1433 48.1975 30.6491 47.9913 30.1778 47.7556L31.2316 45.2684L32.0825 45.6611L32.6978 45.8902L31.6473 48.3742ZM36.7953 49.0909H35.2047V46.3909L36 46.4204L36.7953 46.3909V49.0909ZM40.2709 48.4036L39.2433 45.9065L39.9207 45.6578L40.7127 45.2978L41.7404 47.7916C41.2691 48.024 40.7749 48.2302 40.2709 48.4036ZM36 42.5455C32.3836 42.5455 29.4545 39.6164 29.4545 36C29.4545 34.668 29.8505 33.4342 30.5313 32.4L32.9007 34.7695L34.6091 33.0611L32.2167 30.6622C33.2836 29.9029 34.5862 29.4545 36 29.4545C39.6164 29.4545 42.5455 32.3869 42.5455 36C42.5455 39.6131 39.6164 42.5455 36 42.5455ZM44.6924 45.8084L42.7844 43.9004L43.3702 43.3571L43.9135 42.7745L45.8182 44.6825C45.468 45.0818 45.0884 45.4582 44.6924 45.8084ZM47.7556 41.8124L45.2684 40.7618L45.6578 39.9142L45.8869 39.2956L48.3742 40.3462C48.1975 40.8469 47.9913 41.3411 47.7556 41.8124ZM49.0909 36.7887H46.3942L46.4236 35.9935L46.3942 35.1982H49.0909V36.7887ZM48.4036 31.7225L45.9065 32.7535L45.6578 32.0727L45.3011 31.2807L47.7949 30.2531C48.024 30.7276 48.2269 31.2218 48.4036 31.7225ZM49.0909 72H65.4545V78.5455H49.0909V72ZM6.54545 72H22.9091V78.5455H6.54545V72ZM0 0V68.7273H72V0H0ZM36 55.6364C25.1476 55.6364 16.3636 46.8524 16.3636 36C16.3636 25.1444 25.1476 16.3636 36 16.3636C46.8524 16.3636 55.6364 25.1476 55.6364 36C55.6364 46.8524 46.8524 55.6364 36 55.6364Z" />
                </svg>
                <h3 className="mt-4 text-2xl text-gray-800 font-semibold leading-none">True data ownership</h3>
                <p className="mt-3 text-lg text-gray-700 font-normal text-justify leading-normal">All your saved links are <span className="font-semibold">encrypted</span> at your device before uploading to the server. Only you with your password can decrypt them and see the content of your encrypted links.</p>
              </div>
            </div>
          </div>
        </section >
        <section className="mt-20 px-4 pt-24 pb-16 flex flex-col items-center justify-center bg-purple-blockstack md:px-6 md:pt-32 md:pb-24 lg:px-8">
          <div className="relative">
            <h2 className="text-4xl text-white font-bold leading-none text-center md:text-5xl"><span className="line-through">Don't</span> Can't Be Evil</h2>
            <img className="absolute right-0 h-5 transform translate-x-0 translate-y-2 sm:translate-x-10" src={logoFullWhite} alt="Brace logo" />
          </div>
          <p className="mt-20 text-lg text-gray-300 font-normal text-center leading-normal">Not just that Brace.to don't be evil, Brace.to can't be evil.</p>
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
              <p className="text-2xl text-gray-900 font-normal text-justify md:text-left">Bring back control of your identity and your data one link at a time with Brace.to, powered by web 3.0 technology from Blockstack to make sure that
your privacy cannot be compromised.</p>
            </div>
          </div>
        </section>
        <section className="mb-4 py-24 flex justify-center bg-gray-100 md:py-32">
          <div className="relative">
            <img className="mx-auto static h-16 start-saving-links-img md:absolute md:top-0 md:left-0" src={undrawLink} alt="unDraw link icon" />
            <h2 className="mt-4 text-4xl text-gray-900 font-bold leading-none text-center md:text-5xl">Start saving links</h2>
            <button onClick={() => this.props.signUp()} className="mt-4 mx-auto px-6 block h-12 bg-gray-900 text-xl text-white font-semibold rounded-full shadow-lg hover:bg-gray-800 active:bg-black focus:outline-none focus:shadow-outline">Get started now</button>
          </div>
        </section>
        <Footer />
      </React.Fragment >
    );
  }
}

export default connect(null, { signUp })(Landing);
