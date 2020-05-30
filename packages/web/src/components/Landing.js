import React from 'react';
import { connect } from 'react-redux';

import { signUp } from '../actions';
import { SHOW_SIGN_IN } from '../types/const';

import TopBar from './TopBar';
import Footer from './Footer';

import saveLinksToVisitLater from '../images/save-links-to-visit-later.svg';
import undrawLink from '../images/undraw-link.svg';
import saveLinkAtTheSite from '../images/save-link-at-the-site-dark.svg';
import saveLinkAtUrlBar from '../images/save-link-at-url-bar-dark.svg';
import visitAnywhere from '../images/visit-anywhere.svg';
import blockstackShort from '../images/blockstack-short.svg';
import logoFullWhite from '../images/logo-full-white.svg';

class Landing extends React.Component {

  render() {
    return (
      <React.Fragment>
        <TopBar rightPane={SHOW_SIGN_IN} />
        <section className="mx-auto px-4 pt-16 pb-4 flex items-center max-w-6xl md:px-6 lg:px-8 lg:pt-12">
          <div className="w-full md:w-45/100 lg:w-55/100">
            <img className="mx-auto w-full max-w-sm object-contain md:hidden" src={saveLinksToVisitLater} alt="Save links to visit later" />
            <h1 className="mt-16 text-4xl text-gray-900 font-bold leading-none md:mt-0 md:text-5xl">Save links <br className="inline sm:hidden md:inline lg:hidden" />to visit later</h1>
            <button onClick={() => this.props.signUp()} className="mt-4 px-6 h-12 bg-gray-900 text-xl text-white font-semibold rounded-full shadow-lg hover:bg-gray-800 active:bg-black focus:outline-none focus:shadow-outline">Get Started</button>
          </div>
          <div className="hidden md:block md:w-55/100 lg:w-45/100">
            <img className="w-full object-contain" src={saveLinksToVisitLater} alt="Save links to visit later" />
          </div>
        </section>
        <section className="mx-auto px-4 pt-24 pb-4 max-w-6xl md:px-6 lg:px-8">
          <img className="mx-auto h-16" src={undrawLink} alt="unDraw link icon" />
          <h2 className="mt-4 text-3xl text-gray-900 font-semibold leading-none text-center md:text-4xl">Never miss a link <br className="inline md:hidden" />ever again</h2>
          <div className="flex flex-wrap">
            <div className="mt-16 w-full md:w-1/2 lg:w-1/3">
              <svg className="mx-auto h-12 text-gray-600" viewBox="0 0 47 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M29.325.175c5.138 2.74 13.856 11.394 17.342 16.056-3.001-2.1-9.436-3.867-14.213-2.751.518-3.426-.431-10.58-3.129-13.305zm17.342 25.492V56H0V0h19.621c11.333 0 7.782 18.667 7.782 18.667 7.02-1.739 19.264-.978 19.264 7zM9.333 37.333H21V28H9.333v9.333zm28 4.667h-28v2.333h28V42zm0-7H25.667v2.333h11.666V35zm0-7H25.667v2.333h11.666V28z" />
              </svg>
              <p className="mt-2 mx-auto w-48 text-2xl text-gray-800 font-medium leading-tight text-center">long useful articles to read later</p>
            </div>
            <div className="mt-16 w-full md:w-1/2 lg:w-1/3">
              <svg className="mx-auto h-10 text-blue-400 md:mt-2" viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 4C0 1.79088 1.79088 0 4 0H52C54.2092 0 56 1.79088 56 4V12C56 14.2091 54.2092 16 52 16H4C1.79088 16 0 14.2091 0 12V4Z" />
                <path d="M0 28C0 25.7908 1.79088 24 4 24H28C30.2092 24 32 25.7908 32 28V52C32 54.2092 30.2092 56 28 56H4C1.79088 56 0 54.2092 0 52V28Z" />
                <path d="M44 24C41.7908 24 40 25.7908 40 28V52C40 54.2092 41.7908 56 44 56H52C54.2092 56 56 54.2092 56 52V28C56 25.7908 54.2092 24 52 24H44Z" />
              </svg>
              <p style={{ width: '14rem' }} className="mt-2 mx-auto w-48 text-2xl text-gray-800 font-medium leading-tight text-center">interesting websites to check out later</p>
            </div>
            <div className="mt-16 w-full lg:w-1/3">
              <svg className="mx-auto h-10 text-orange-500 md:mt-2" viewBox="0 0 75 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M31.111 51.333a4.666 4.666 0 11-9.333 0 4.666 4.666 0 019.333 0zM42 46.667a4.666 4.666 0 100 9.332 4.666 4.666 0 000-9.332zm4.157-15.556l6.15-21.778H0l9.14 21.778h37.017zM61.615 0L50.938 37.333h-39.19l2.61 6.223h41.188L66.354 6.222h6.001L74.667 0H61.616z" />
              </svg>
              <p className="mt-2 mx-auto w-48 text-2xl text-gray-800 font-medium leading-tight text-center">items on online shops to buy later</p>
            </div>
            <div className="mt-16 w-full md:w-1/2 lg:pl-1/6">
              <svg className="mx-auto h-10 text-red-600 md:mt-2" viewBox="0 0 56 42" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M45.768.43C37.36-.144 18.63-.142 10.232.43 1.139 1.05.068 6.543 0 21c.068 14.432 1.13 19.948 10.232 20.571 8.4.572 27.127.574 35.536 0 9.093-.62 10.164-6.113 10.232-20.57C55.932 6.568 54.87 1.052 45.768.43zM21 30.334V11.667l18.667 9.317L21 30.334z" />
              </svg>
              <p style={{ width: '14rem' }} className="mt-2 mx-auto w-48 text-2xl text-gray-800 font-medium leading-tight text-center md:mt-4">videos your friends just share to watch later</p>
            </div>
            <div className="mt-16 w-full md:w-1/2 lg:pr-1/6">
              <svg className="mx-auto h-14 text-pink-500" viewBox="0 0 54 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M53.7143 48.416C53.7097 51.9703 51.04 53.7143 48.5943 53.7143C46.5303 53.7143 44.5714 52.4708 44.5714 50.0206C44.5714 47.4971 47.3165 45.1794 50.32 45.1794C50.688 45.1794 51.0583 45.2137 51.4285 45.2868V35.4308L37.7143 38.24V50.6971C37.7097 54.2537 35.0171 56 32.5531 56C30.4823 56 28.5714 54.7611 28.5714 52.32C28.5714 49.792 31.3165 47.4628 34.3268 47.4628C34.6925 47.4628 35.0628 47.4971 35.4331 47.5703V32.6674L53.7143 28.5714V48.416Z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M25.1429 29.3333C27.4539 29.3333 29.3333 27.4539 29.3333 25.1429C29.3333 22.8318 27.4539 20.9524 25.1429 20.9524C22.8318 20.9524 20.9524 22.8318 20.9524 25.1429C20.9524 27.4539 22.8318 29.3333 25.1429 29.3333ZM50.1278 27.9761C50.2321 27.0461 50.2857 26.1007 50.2857 25.1429C50.2857 11.2577 39.028 0 25.1429 0C11.2577 0 0 11.2577 0 25.1429C0 39.028 11.2577 50.2857 25.1429 50.2857C25.9625 50.2857 26.7729 50.2465 27.5725 50.1698C28.1743 48.0629 30.58 46.32 33.184 46.32C33.5497 46.32 33.92 46.3543 34.2903 46.4274V31.5246L50.1278 27.9761ZM14.8531 32.3526C15.6933 33.551 16.7368 34.5945 17.9352 35.4347L14.497 43.1682C11.4589 41.3684 8.91943 38.829 7.11962 35.7909L14.8531 32.3526ZM25.1429 16.7619C29.7712 16.7619 33.5238 20.5145 33.5238 25.1429C33.5238 29.7712 29.7712 33.5238 25.1429 33.5238C20.5145 33.5238 16.7619 29.7712 16.7619 25.1429C16.7619 20.5145 20.5145 16.7619 25.1429 16.7619ZM35.7888 7.11962C38.8289 8.91943 41.3684 11.4589 43.1682 14.499L35.4347 17.9352C34.5924 16.7368 33.549 15.6933 32.3505 14.8531L35.7888 7.11962Z" />
              </svg>
              <p className="mt-2 mx-auto w-48 text-2xl text-gray-800 font-medium leading-tight text-center">music you found in your feed to listen later</p>
            </div>
          </div>
        </section>
        <section className="pt-24 howitwork-pb">
          <div className="px-4 bg-gray-900 md:px-6 lg:px-8">
            <div className="mx-auto px-4 relative max-w-6xl md:px-6 lg:px-8">
              <div style={{ top: '-0.75rem' }} className="absolute flex items-center">
                <svg className="w-10 h-16 text-yellow-400" viewBox="0 0 55 88" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 11C0 4.92486 4.92486 0 11 0H44C50.0753 0 55 4.92486 55 11V88L27.5 74.25L0 88V11Z" />
                </svg>
                <h2 className="mt-3 ml-3 text-lg text-gray-500 font-semibold">Simple, Easy, Convenient</h2>
              </div>
              <div className="pt-24 md:flex md:items-start lg:pt-28">
                <div className="md:w-1/2">
                  <div className="md:flex md:items-baseline">
                    <svg className="h-5 text-gray-500 lg:h-6" viewBox="0 0 39 44" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32.5 20c6-6 4.404-16.954-4.058-20H4C2 0 0 1.595 0 4v36c0 2 1.6 4 4 4h25c13.558-5 10-21 3.5-24z" />
                      <circle cx="11" cy="17" r="4" fill="#2d3748" />
                      <circle cx="23" cy="17" r="4" fill="#2d3748" />
                      <circle cx="23" cy="29" r="4" fill="#2d3748" />
                      <circle cx="11" cy="29" r="4" fill="#2d3748" />
                    </svg>
                    <p className="mt-2 text-2xl-extra text-white font-semibold leading-none md:mt-0 md:ml-2 lg:text-3xl">Save at Brace.to</p>
                  </div>
                  <p className="mt-2 text-base text-gray-500 font-normal leading-tight md:pr-8 lg:text-lg">Click the black button with a plus sign at the top <br className="hidden lg:inline" />of the page</p>
                </div>
                <img className="mt-4 mx-auto w-full max-w-lg md:mt-0 md:w-1/2" src={saveLinkAtTheSite} alt="Save link at brace.to" />
              </div>
              <div className="pt-16 md:flex md:items-start">
                <div className="md:w-1/2">
                  <div className="md:flex md:items-baseline">
                    <svg className="h-4 text-gray-500 lg:h-5" viewBox="0 0 56 33" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0V32.6667H56V0H0ZM37.3333 7H42V11.6667H37.3333V7ZM30.3333 7H35V11.6667H30.3333V7ZM37.3333 14V18.6667H32.6667V14H37.3333ZM23.3333 7H28V11.6667H23.3333V7ZM30.3333 14V18.6667H25.6667V14H30.3333ZM16.3333 7H21V11.6667H16.3333V7ZM23.3333 14V18.6667H18.6667V14H23.3333ZM7 7H14V11.6667H7V7ZM7 14H16.3333V18.6667H7V14ZM39.6667 25.6667H16.3333V21H39.6667V25.6667ZM49 18.6667H39.6667V14H49V18.6667ZM49 11.6667H44.3333V7H49V11.6667Z" />
                    </svg>
                    <p className="mt-2 text-2xl-extra text-white font-semibold leading-none md:mt-0 md:ml-2 lg:text-3xl">Save at Address bar</p>
                  </div>
                  <p className="mt-2 text-base text-gray-500 font-normal leading-tight lg:text-lg">Type ‘brace.to/’ in front of any link</p>
                </div>
                <img className="mt-4 mx-auto w-full max-w-lg md:mt-0 md:w-1/2" src={saveLinkAtUrlBar} alt="Save link at address bar" />
              </div>
              <div className="pt-16">
                <svg className="h-6 md:mx-auto lg:h-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 48c13.255 0 24-10.745 24-24S37.255 0 24 0 0 10.745 0 24s10.745 24 24 24zm11.121-27.879a3 3 0 00-4.242-4.242L21 25.757l-3.879-3.878a3 3 0 10-4.242 4.242l6 6a3 3 0 004.242 0l12-12z" fill="#68D391" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M35.121 20.121a3 3 0 00-4.242-4.242L21 25.757l-3.879-3.878a3 3 0 10-4.242 4.242l6 6a3 3 0 004.242 0l12-12z" fill="#22543D" />
                </svg>
                <p className="mt-2 text-2xl-extra text-white font-semibold leading-none md:text-center lg:text-3xl">Visit <br className="md:hidden" />anywhere, anytime</p>
                <div className="mt-3 relative howitwork-gray-pb">
                  <img className="pt-2 absolute left-1/2 transform -translate-x-1/2 w-full max-w-md md:w-72 lg:w-96" src={visitAnywhere} alt="Visit anywhere, anytime" />
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
              <p className="mt-4 text-xl text-gray-700 leading-tight text-left md:mt-2 md:text-center">Your identity is yours. Your data is yours.</p>
            </div>
          </div>
          <div className="mt-12 block md:flex md:flex-row md:justify-between">
            <div className="w-full md:w-1/2">
              <div style={{ borderRadius: '0.75rem' }} className="p-4 bg-gray-100 md:mr-2 lg:mx-auto lg:max-w-md">
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
                <p className="mt-3 text-lg text-gray-700 font-normal leading-normal">Your identity <span className="font-semibold">cannot</span> be locked, banned, or deleted by Brace.to. Your identity lives in blockchain and only you who have the private key can access it and control it.</p>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div style={{ borderRadius: '0.75rem' }} className="mt-8 p-4 bg-gray-100 md:mt-0 md:ml-2 lg:mx-auto lg:max-w-md">
                <svg className="h-14 text-purple-blockstack" viewBox="0 0 72 79" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M36 19.6364C26.9771 19.6364 19.6364 26.9771 19.6364 36C19.6364 45.0229 26.9771 52.3636 36 52.3636C45.0229 52.3636 52.3636 45.0229 52.3636 36C52.3636 26.9771 45.0229 19.6364 36 19.6364ZM44.6924 26.1785C45.0884 26.532 45.468 26.9084 45.8182 27.3044L43.9135 29.2124L43.3702 28.6298L42.7844 28.0865L44.6924 26.1785ZM40.3527 23.6258C40.8567 23.8025 41.3509 24.0087 41.8222 24.2444L40.7684 26.7316L39.9175 26.3389L39.3055 26.1131L40.3527 23.6258ZM35.2047 22.9091H36.7953V25.6058L36 25.5764L35.2047 25.6058V22.9091ZM31.7258 23.5931L32.7567 26.0869L32.0793 26.3356L31.2873 26.6956L30.2596 24.2018C30.7309 23.9727 31.2251 23.7698 31.7258 23.5931ZM24.2444 30.1778L26.7316 31.2251L26.3422 32.076L26.1131 32.6913L23.6258 31.644C23.8025 31.1367 24.0087 30.6491 24.2444 30.1778ZM22.9091 35.1982H25.6058L25.5764 35.9935L25.6058 36.7887H22.9091V35.1982ZM24.2051 41.7338C23.976 41.2593 23.7698 40.7684 23.5931 40.2611L26.0902 39.2302L26.3389 39.9109L26.6956 40.6964L24.2051 41.7338ZM27.0818 46.0342L25.956 44.9116L28.0833 42.7778L28.6265 43.3604L29.2124 43.9036L27.0818 46.0342ZM28.6298 28.6298L28.0865 29.2124L26.1818 27.3044C26.532 26.9084 26.9116 26.532 27.3076 26.1785L29.2156 28.0865L28.6298 28.6298ZM31.6473 48.3742C31.1433 48.1975 30.6491 47.9913 30.1778 47.7556L31.2316 45.2684L32.0825 45.6611L32.6978 45.8902L31.6473 48.3742ZM36.7953 49.0909H35.2047V46.3909L36 46.4204L36.7953 46.3909V49.0909ZM40.2709 48.4036L39.2433 45.9065L39.9207 45.6578L40.7127 45.2978L41.7404 47.7916C41.2691 48.024 40.7749 48.2302 40.2709 48.4036ZM36 42.5455C32.3836 42.5455 29.4545 39.6164 29.4545 36C29.4545 34.668 29.8505 33.4342 30.5313 32.4L32.9007 34.7695L34.6091 33.0611L32.2167 30.6622C33.2836 29.9029 34.5862 29.4545 36 29.4545C39.6164 29.4545 42.5455 32.3869 42.5455 36C42.5455 39.6131 39.6164 42.5455 36 42.5455ZM44.6924 45.8084L42.7844 43.9004L43.3702 43.3571L43.9135 42.7745L45.8182 44.6825C45.468 45.0818 45.0884 45.4582 44.6924 45.8084ZM47.7556 41.8124L45.2684 40.7618L45.6578 39.9142L45.8869 39.2956L48.3742 40.3462C48.1975 40.8469 47.9913 41.3411 47.7556 41.8124ZM49.0909 36.7887H46.3942L46.4236 35.9935L46.3942 35.1982H49.0909V36.7887ZM48.4036 31.7225L45.9065 32.7535L45.6578 32.0727L45.3011 31.2807L47.7949 30.2531C48.024 30.7276 48.2269 31.2218 48.4036 31.7225ZM49.0909 72H65.4545V78.5455H49.0909V72ZM6.54545 72H22.9091V78.5455H6.54545V72ZM0 0V68.7273H72V0H0ZM36 55.6364C25.1476 55.6364 16.3636 46.8524 16.3636 36C16.3636 25.1444 25.1476 16.3636 36 16.3636C46.8524 16.3636 55.6364 25.1476 55.6364 36C55.6364 46.8524 46.8524 55.6364 36 55.6364Z" />
                </svg>
                <h3 className="mt-4 text-2xl text-gray-800 font-semibold leading-none">True data ownership</h3>
                <p className="mt-3 text-lg text-gray-700 font-normal leading-normal">All links at Brace.to are <span className="font-semibold">encrypted</span> in your browser before sending to save in server. No one can look in your links. Only you can decrypt them and see the content inside.</p>
              </div>
            </div>
          </div>
        </section >
        <section className="mt-20 px-4 pt-24 pb-32 flex justify-center bg-purple-blockstack md:px-6 md:py-32 md:pt-32 md:pb-40 lg:px-8">
          <div className="relative">
            <h2 className="text-4xl text-white font-bold leading-none text-center md:text-5xl"><span className="line-through">Don't</span> Can't Be Evil</h2>
            <img className="absolute right-0 h-5 transform translate-x-0 translate-y-2 sm:translate-x-10" src={logoFullWhite} alt="Brace logo" />
          </div>
        </section>
        <section className="mb-4 py-24 flex justify-center bg-gray-100 md:py-32">
          <div className="relative">
            <img style={{ transform: 'translateX(-4.5rem)' }} className="mx-auto static h-16 md:absolute md:top-0 md:left-0 md:transform" src={undrawLink} alt="unDraw link icon" />
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
