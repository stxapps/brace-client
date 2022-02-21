import React from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import Svg, { SvgXml, Path, Circle } from 'react-native-svg';

import { updatePopup } from '../actions';
import {
  SIGN_UP_POPUP, SHOW_SIGN_IN, SM_WIDTH, MD_WIDTH, LG_WIDTH,
} from '../types/const';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

import TopBar from './TopBar';
import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';

import saveLinksToVisitLater from '../images/save-links-to-visit-later.svg';
import undrawLink from '../images/undraw-link.svg';
import stacksShort from '../images/stacks-short.svg';
import logoFullWhite from '../images/logo-full-white.svg';

class Landing extends React.PureComponent {

  onSignUpBtnClick = () => {
    this.props.updatePopup(SIGN_UP_POPUP, true);
  }

  renderSwiper(swiperHeight) {
    const { safeAreaWidth, safeAreaHeight } = this.props;

    let saveLinksSvgWidth = 240;
    if (safeAreaWidth >= SM_WIDTH) saveLinksSvgWidth = 288;
    // iPhone 11 Pro Max landscape is wider than MD (414x896)
    if (safeAreaHeight >= 640) {
      if (safeAreaWidth >= MD_WIDTH) saveLinksSvgWidth = 432;
      if (safeAreaWidth >= LG_WIDTH) saveLinksSvgWidth = 384;
    }

    const saveLinksSvgHeight = saveLinksSvgWidth * 270 / 232;

    const borderRadius = {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
    };

    const logoTranslate = {
      transform: [{ translateX: 0 }, { translateY: 30 }],
    };
    // From onLayout, Don't be evil text width is ~317 so when safe area width is wide enought (padding 48 + 48 + 317 + 45), move the logo to the right.
    if (safeAreaWidth > 470) logoTranslate.transform[0].translateX = 45;

    return (
      <Swiper height={swiperHeight} showsPagination={true} showsButtons={false} activeDotStyle={tailwind('bg-gray-500')} paginationStyle={cache('L_pagination', { bottom: 10 })} loop={false}>
        <View style={tailwind('px-12 justify-center items-center w-full h-full')}>
          <SvgXml width={saveLinksSvgWidth} height={saveLinksSvgHeight} xml={saveLinksToVisitLater} />
          {/* From onLayout, text width is ~394 so when safe area width is wide enough, no line break. */}
          <Text style={tailwind('mt-5 text-3xl text-gray-900 font-bold text-center sm:mt-8 sm:text-4xl md:text-5xl', safeAreaWidth)}>Save links {safeAreaWidth < 400 ? '\n' : ''}to visit later</Text>
        </View>
        <View style={tailwind('px-4 justify-center items-center w-full h-full md:px-6 lg:px-8', safeAreaWidth)}>
          <SvgXml width={64} height={64} xml={undrawLink} />
          <Text style={tailwind('mt-4 text-3xl text-gray-900 font-semibold text-center md:text-4xl', safeAreaWidth)}>Never miss a link ever again</Text>
          <Text style={tailwind('mt-4 text-lg text-gray-500 font-normal text-center')}>A lot of interesting, useful, and important stuff is {safeAreaWidth >= SM_WIDTH && safeAreaWidth < MD_WIDTH ? '\n' : ''}out there on the internet. {safeAreaWidth >= MD_WIDTH ? '\n' : ''}Brace.to helps you save them so that you will never miss anything.</Text>
        </View>
        <View style={tailwind('px-4 justify-center items-center w-full h-full md:px-6 lg:px-8', safeAreaWidth)}>
          <View style={tailwind('flex-row max-w-md')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <View style={tailwind('flex items-center justify-center h-12 w-12 bg-gray-600 rounded-md')}>
                <Svg style={tailwind('text-white font-normal')} width={18} height={21} viewBox="0 0 47 56" fill="currentColor">
                  <Path d="M29.325.175c5.138 2.74 13.856 11.394 17.342 16.056-3.001-2.1-9.436-3.867-14.213-2.751.518-3.426-.431-10.58-3.129-13.305zm17.342 25.492V56H0V0h19.621c11.333 0 7.782 18.667 7.782 18.667 7.02-1.739 19.264-.978 19.264 7zM9.333 37.333H21V28H9.333v9.333zm28 4.667h-28v2.333h28V42zm0-7H25.667v2.333h11.666V35zm0-7H25.667v2.333h11.666V28z" />
                </Svg>
              </View>
            </View>
            <View style={tailwind('mt-0.5 ml-4 flex-shrink flex-grow')}>
              <Text style={tailwind('text-xl text-gray-900 font-medium leading-5 md:text-2xl', safeAreaWidth)}>Long useful articles</Text>
              <Text style={tailwind('mt-2 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>You found a long, useful, and important article you can't read it right now? Not a problem. Just save to Brace.to to read it later.</Text>
            </View>
          </View>
          <View style={tailwind('mt-10 flex-row max-w-md md:mt-12', safeAreaWidth)}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <View style={tailwind('flex items-center justify-center h-12 w-12 bg-blue-400 rounded-md')}>
                <Svg style={tailwind('text-white font-normal')} width={20} height={20} viewBox="0 0 56 56" fill="currentColor">
                  <Path d="M0 4C0 1.79088 1.79088 0 4 0H52C54.2092 0 56 1.79088 56 4V12C56 14.2091 54.2092 16 52 16H4C1.79088 16 0 14.2091 0 12V4Z" />
                  <Path d="M0 28C0 25.7908 1.79088 24 4 24H28C30.2092 24 32 25.7908 32 28V52C32 54.2092 30.2092 56 28 56H4C1.79088 56 0 54.2092 0 52V28Z" />
                  <Path d="M44 24C41.7908 24 40 25.7908 40 28V52C40 54.2092 41.7908 56 44 56H52C54.2092 56 56 54.2092 56 52V28C56 25.7908 54.2092 24 52 24H44Z" />
                </Svg>
              </View>
            </View>
            <View style={tailwind('mt-0.5 ml-4 flex-shrink flex-grow')}>
              <Text style={tailwind('text-xl text-gray-900 font-medium leading-5 md:text-2xl', safeAreaWidth)}>Interesting websites</Text>
              <Text style={tailwind('mt-2 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>You found a ridiculously cool and interesting website you want to check it out later? Not a problem. Just save to Brace.to to visit it later.</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('px-4 justify-center items-center w-full h-full md:px-6 lg:px-8', safeAreaWidth)}>
          <View style={tailwind('flex-row max-w-md')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <View style={tailwind('flex items-center justify-center h-12 w-12 bg-yellow-500 rounded-md')}>
                <Svg style={tailwind('text-white font-normal')} width={28} height={21} viewBox="0 0 75 56" fill="currentColor">
                  <Path d="M31.111 51.333a4.666 4.666 0 11-9.333 0 4.666 4.666 0 019.333 0zM42 46.667a4.666 4.666 0 100 9.332 4.666 4.666 0 000-9.332zm4.157-15.556l6.15-21.778H0l9.14 21.778h37.017zM61.615 0L50.938 37.333h-39.19l2.61 6.223h41.188L66.354 6.222h6.001L74.667 0H61.616z" />
                </Svg>
              </View>
            </View>
            <View style={tailwind('mt-0.5 ml-4 flex-shrink flex-grow')}>
              <Text style={tailwind('text-xl text-gray-900 font-medium leading-5 md:text-2xl', safeAreaWidth)}>Items on online shops</Text>
              <Text style={tailwind('mt-2 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>You found an item on online shop you don’t want it now but might want to buy it later? Not a problem. Just save to Brace.to.</Text>
            </View>
          </View>
          <View style={tailwind('mt-10 flex-row max-w-md md:mt-12', safeAreaWidth)}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <View style={tailwind('flex items-center justify-center h-12 w-12 bg-red-500 rounded-md')}>
                <Svg style={tailwind('text-base text-white font-normal')} width={24} height={18} viewBox="0 0 56 42" fill="currentColor">
                  <Path d="M45.768.43C37.36-.144 18.63-.142 10.232.43 1.139 1.05.068 6.543 0 21c.068 14.432 1.13 19.948 10.232 20.571 8.4.572 27.127.574 35.536 0 9.093-.62 10.164-6.113 10.232-20.57C55.932 6.568 54.87 1.052 45.768.43zM21 30.334V11.667l18.667 9.317L21 30.334z" />
                </Svg>
              </View>
            </View>
            <View style={tailwind('mt-0.5 ml-4 flex-shrink flex-grow')}>
              <Text style={tailwind('text-xl text-gray-900 font-medium leading-5 md:text-2xl', safeAreaWidth)}>Videos and music</Text>
              <Text style={tailwind('mt-2 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>Your friend’s just shared a video with you but you want to watch it tonight? Not a problem. Just save to Brace.to to watch it whenever you want.</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('px-4 justify-center items-center w-full h-full md:px-6 lg:px-8', safeAreaWidth)}>
          <SvgXml width={80} height={80} xml={stacksShort} />
          <Text style={tailwind('mt-4 text-3xl text-gray-900 font-semibold text-center md:text-4xl', safeAreaWidth)}>Your privacy at heart powered by <Text style={tailwind('text-3xl text-purple-blockstack font-semibold md:text-4xl', safeAreaWidth)}>Stacks</Text></Text>
          <Text style={tailwind('mt-4 text-lg text-gray-500 font-normal text-center md:text-xl', safeAreaWidth)}>Your identity is truly yours. {safeAreaWidth >= SM_WIDTH ? '' : '\n'}Your data is truly yours.</Text>
        </View>
        <View style={tailwind('px-4 justify-center items-center w-full h-full md:px-6 lg:px-8', safeAreaWidth)}>
          <View style={cache('L_blockstackGrayBox', [tailwind('p-4 bg-gray-50 max-w-sm'), borderRadius])}>
            <Svg width={56} height={56} viewBox="0 0 78 78" fill="none">
              <Circle cx="39" cy="39" r="39" fill="#211F6D" />
              <Path d="M22.5483 30.2583L38.5 21.2422M22.5483 30.2583L38.5 39.2744M22.5483 30.2583V48.2906M38.5 21.2422L54.4516 30.2583M38.5 21.2422V39.2744M38.5 39.2744L54.4516 30.2583M38.5 39.2744L54.4516 48.2906M38.5 39.2744V57.3067M38.5 39.2744L22.5483 48.2906M54.4516 30.2583V48.2906M22.5483 48.2906L38.5 57.3067M38.5 57.3067L54.4516 48.2906" stroke="white" strokeWidth="2.01924" />
              <Path d="M48.9032 33.379L54.4516 36.4133L60 33.2923V27.1371M48.9032 33.379V27.1371M48.9032 33.379L54.4516 30.258M60 27.1371L54.4516 30.258M60 27.1371L54.4516 24.0161L48.9032 27.1371M48.9032 27.1371L54.4516 30.258" stroke="white" strokeWidth="2.01924" />
              <Path d="M32.9517 24.3629L38.5 27.3972L44.0484 24.3629V18.121M32.9517 24.3629V18.121M32.9517 24.3629L38.5 21.2419M44.0484 18.121L38.5 21.2419M44.0484 18.121L38.5 15L32.9517 18.121M32.9517 18.121L38.5 21.2419" stroke="white" strokeWidth="2.01924" />
              <Path d="M28.0968 27.1371V33.379L22.5484 36.4133L17 33.379V27.1371M28.0968 27.1371L22.5484 30.258L17 27.1371M28.0968 27.1371L22.5484 24.0161L17 27.1371" stroke="white" strokeWidth="2.01924" />
              <Path d="M28.0968 45.1691V51.411L22.5484 54.4453M28.0968 45.1691L22.5484 48.29M28.0968 45.1691L22.5484 42.0481L17 45.1691M22.5484 54.4453L17 51.411V45.1691M22.5484 54.4453V48.29M17 45.1691L22.5484 48.29" stroke="white" strokeWidth="2.01924" />
              <Path d="M44.0484 54.1852V60.4271L38.5 63.4614M44.0484 54.1852L38.5 57.3061M44.0484 54.1852L38.5 51.0642L32.9517 54.1852M38.5 63.4614L32.9517 60.4271V54.1852M38.5 63.4614V57.3061M32.9517 54.1852L38.5 57.3061" stroke="white" strokeWidth="2.01924" />
              <Path d="M60 45.1691V51.411L54.4516 54.4453M60 45.1691L54.4516 48.29M60 45.1691L54.4516 42.0481L48.9032 45.1691M54.4516 54.4453L48.9032 51.411V45.1691M54.4516 54.4453V48.29M48.9032 45.1691L54.4516 48.29" stroke="white" strokeWidth="2.01924" />
            </Svg>
            <Text style={tailwind('mt-5 text-xl text-gray-900 font-semibold leading-5 md:text-2xl', safeAreaWidth)}>Identity</Text>
            <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>Your identity lives in blockchain and only you with your secret key can access it and control it.</Text>
            <Text style={tailwind('mt-5 text-base text-gray-900 font-medium leading-5.5 md:text-lg', safeAreaWidth)}>No ban on your owned identity</Text>
            <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>Your identity cannot be locked, banned, or deleted by anyone as your secret key is required.</Text>
          </View>
        </View>
        <View style={tailwind('px-4 justify-center items-center w-full h-full md:px-6 lg:px-8', safeAreaWidth)}>
          <View style={cache('L_blockstackGrayBox', [tailwind('p-4 bg-gray-50 max-w-sm'), borderRadius])}>
            <Svg width={56} height={56} viewBox="0 0 78 78" fill="none">
              <Circle cx="39" cy="39" r="39" fill="#211F6D" />
              <Path fillRule="evenodd" clipRule="evenodd" d="M25 27C25 25.8954 25.8954 25 27 25H51C52.1046 25 53 25.8954 53 27C53 28.1046 52.1046 29 51 29H27C25.8954 29 25 28.1046 25 27ZM25 35C25 33.8954 25.8954 33 27 33H51C52.1046 33 53 33.8954 53 35C53 36.1046 52.1046 37 51 37H27C25.8954 37 25 36.1046 25 35ZM25 43C25 41.8954 25.8954 41 27 41H51C52.1046 41 53 41.8954 53 43C53 44.1046 52.1046 45 51 45H27C25.8954 45 25 44.1046 25 43ZM25 51C25 49.8954 25.8954 49 27 49H51C52.1046 49 53 49.8954 53 51C53 52.1046 52.1046 53 51 53H27C25.8954 53 25 52.1046 25 51Z" fill="white" />
            </Svg>
            <Text style={tailwind('mt-5 text-xl text-gray-900 font-semibold leading-5 md:text-2xl', safeAreaWidth)}>Data Storage</Text>
            <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>Your data lives in a storage of your choice and only you with your secret key can change it.</Text>
            <Text style={tailwind('mt-5 text-base text-gray-900 font-medium leading-5.5 md:text-lg', safeAreaWidth)}>No lock out from your own data</Text>
            <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>You can access your data directly whenever you want as you have full control of your data storage.</Text>
          </View>
        </View>
        <View style={tailwind('px-4 justify-center items-center w-full h-full md:px-6 lg:px-8', safeAreaWidth)}>
          <View style={cache('L_blockstackGrayBox', [tailwind('p-4 bg-gray-50 max-w-sm'), borderRadius])}>
            <Svg width={56} height={56} viewBox="0 0 78 78" fill="none">
              <Circle cx="39" cy="39" r="39" fill="#211F6D" />
              <Path d="M39 31.2727C34.7392 31.2727 31.2727 34.7392 31.2727 39C31.2727 43.2608 34.7392 46.7273 39 46.7273C43.2608 46.7273 46.7273 43.2608 46.7273 39C46.7273 34.7392 43.2608 31.2727 39 31.2727ZM43.1047 34.3621C43.2917 34.529 43.471 34.7067 43.6364 34.8937L42.7369 35.7947L42.4804 35.5196L42.2037 35.2631L43.1047 34.3621V34.3621ZM41.0555 33.1566C41.2935 33.2401 41.5268 33.3375 41.7494 33.4487L41.2517 34.6233L40.8499 34.4378L40.5609 34.3312L41.0555 33.1566V33.1566ZM38.6245 32.8182H39.3755V34.0916L39 34.0777L38.6245 34.0916V32.8182ZM36.9816 33.1412L37.4685 34.3188L37.1485 34.4363L36.7745 34.6063L36.2893 33.4286C36.5118 33.3205 36.7452 33.2246 36.9816 33.1412ZM33.4487 36.2506L34.6233 36.7452L34.4394 37.147L34.3312 37.4375L33.1566 36.943C33.2401 36.7035 33.3375 36.4732 33.4487 36.2506ZM32.8182 38.6214H34.0916L34.0777 38.9969L34.0916 39.3725H32.8182V38.6214V38.6214ZM33.4302 41.7076C33.322 41.4835 33.2246 41.2517 33.1412 41.0122L34.3204 40.5254L34.4378 40.8468L34.6063 41.2177L33.4302 41.7076V41.7076ZM34.7886 43.7384L34.257 43.2083L35.2615 42.2006L35.5181 42.4757L35.7947 42.7323L34.7886 43.7384V43.7384ZM35.5196 35.5196L35.2631 35.7947L34.3636 34.8937C34.529 34.7067 34.7083 34.529 34.8953 34.3621L35.7963 35.2631L35.5196 35.5196V35.5196ZM36.9445 44.8434C36.7065 44.7599 36.4732 44.6625 36.2506 44.5513L36.7483 43.3767L37.1501 43.5622L37.4406 43.6704L36.9445 44.8434ZM39.3755 45.1818H38.6245V43.9068L39 43.9207L39.3755 43.9068V45.1818ZM41.0168 44.8573L40.5315 43.6781L40.8515 43.5606L41.2255 43.3906L41.7107 44.5683C41.4882 44.678 41.2548 44.7754 41.0168 44.8573V44.8573ZM39 42.0909C37.2923 42.0909 35.9091 40.7077 35.9091 39C35.9091 38.371 36.0961 37.7884 36.4175 37.3L37.5365 38.4189L38.3432 37.6122L37.2135 36.4794C37.7173 36.1208 38.3324 35.9091 39 35.9091C40.7077 35.9091 42.0909 37.2938 42.0909 39C42.0909 40.7062 40.7077 42.0909 39 42.0909V42.0909ZM43.1047 43.6317L42.2037 42.7307L42.4804 42.4742L42.7369 42.1991L43.6364 43.1001C43.471 43.2886 43.2917 43.4664 43.1047 43.6317V43.6317ZM44.5513 41.7447L43.3767 41.2486L43.5606 40.8484L43.6688 40.5563L44.8434 41.0524C44.7599 41.2888 44.6625 41.5222 44.5513 41.7447ZM45.1818 39.3725H43.9084L43.9223 38.9969L43.9084 38.6214H45.1818V39.3725ZM44.8573 36.9801L43.6781 37.4669L43.5606 37.1455L43.3922 36.7715L44.5698 36.2862C44.678 36.5103 44.7738 36.7436 44.8573 36.9801ZM45.1818 56H52.9091V59.0909H45.1818V56ZM25.0909 56H32.8182V59.0909H25.0909V56ZM22 22V54.4545H56V22H22ZM39 48.2727C33.8753 48.2727 29.7273 44.1247 29.7273 39C29.7273 33.8737 33.8753 29.7273 39 29.7273C44.1247 29.7273 48.2727 33.8753 48.2727 39C48.2727 44.1247 44.1247 48.2727 39 48.2727Z" fill="white" />
            </Svg>
            <Text style={tailwind('mt-5 text-xl text-gray-900 font-semibold leading-5 md:text-2xl', safeAreaWidth)}>Encryption</Text>
            <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>Everything is encrypted and only you with your secret key can see the content inside.</Text>
            <Text style={tailwind('mt-5 text-base text-gray-900 font-medium leading-5.5 md:text-lg', safeAreaWidth)}>No targeted ads and No data breach risk</Text>
            <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal md:text-lg', safeAreaWidth)}>Your data cannot be used to make targeted ads on you and there is no risk, if your data is stolen.</Text>
          </View>
        </View>
        <View style={tailwind('px-4 justify-center items-center w-full h-full bg-purple-blockstack md:px-6 lg:px-8', safeAreaWidth)}>
          <View>
            {/* // From onLayout, Don't be evil text width is ~317 so when safe area width is wide enought (padding 48 + 48 + 317), no line break. */}
            <Text style={tailwind('text-4xl text-white font-bold text-center md:text-5xl', safeAreaWidth)}><Text style={tailwind('text-4xl text-white font-bold line-through md:text-5xl', safeAreaWidth)}>Don't</Text>{safeAreaWidth < 420 ? '\n' : ' '}Can't be Evil</Text>
            <SvgXml style={cache('L_logo', [tailwind('absolute right-0 bottom-0'), logoTranslate], safeAreaWidth)} width={91.66} height={20} xml={logoFullWhite} />
          </View>
          <Text style={tailwind('mt-20 text-lg text-gray-200 font-normal text-center leading-6 md:text-xl', safeAreaWidth)}>Not just that Brace.to don't be evil, Brace.to can't be evil.</Text>
        </View>
      </Swiper >
    );
  }

  renderSignUp() {
    return (
      <TouchableOpacity onPress={this.onSignUpBtnClick} style={tailwind('py-5 items-center')}>
        <View style={[tailwind('flex-row justify-center items-center bg-gray-800 rounded-full'), { paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }]}>
          <Text style={tailwind('text-lg text-gray-50 font-medium')}>Get Started</Text>
          <Svg style={tailwind('ml-2 text-base text-gray-50 font-normal')} width={8} height={13} viewBox="0 0 6 10" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
          </Svg>
        </View>
      </TouchableOpacity >
    );
  }

  render() {
    const { safeAreaHeight } = this.props;

    // Dangerous assumption that TopBar's height is 56-58 and the last view's height is 80.
    // if safeAreaHeight < ~56 + ~576 + ~80, fix height on Swiper and use ScrollView
    // else if safeAreaHeight < 900, expand Swiper so the content cover the screen
    // else center the content in the middle
    const SWIPER_HEIGHT = 536;
    if (safeAreaHeight < 640) {
      return (
        <React.Fragment>
          <ScrollView>
            <TopBar rightPane={SHOW_SIGN_IN} />
            {this.renderSwiper(SWIPER_HEIGHT)}
            {this.renderSignUp()}
          </ScrollView>
          <SignUpPopup />
          <SignInPopup />
        </React.Fragment>
      );
    } else if (safeAreaHeight < 900) {
      return (
        <React.Fragment>
          <TopBar rightPane={SHOW_SIGN_IN} />
          <View style={tailwind('flex-grow')}>
            {this.renderSwiper(undefined)}
          </View>
          {this.renderSignUp()}
          <SignUpPopup />
          <SignInPopup />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <TopBar rightPane={SHOW_SIGN_IN} />
          <View style={tailwind('flex-1 justify-center')}>
            {this.renderSwiper(undefined)}
            {this.renderSignUp()}
          </View>
          <SignUpPopup />
          <SignInPopup />
        </React.Fragment>
      );
    }
  }
}

const mapDispatchToProps = { updatePopup };

export default connect(null, mapDispatchToProps)(withSafeAreaContext(Landing));
