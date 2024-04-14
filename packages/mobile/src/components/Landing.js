import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Linking } from 'react-native';
import { connect } from 'react-redux';
import Swiper from 'react-native-swiper';
import Svg, { SvgXml, Path, Circle } from 'react-native-svg';

import { updatePopup } from '../actions';
import {
  SIGN_UP_POPUP, SHOW_SIGN_IN, SM_WIDTH, MD_WIDTH, LG_WIDTH,
} from '../types/const';
import { getThemeMode } from '../selectors';
import cache from '../utils/cache';

import { withTailwind } from '.';

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
    const { safeAreaWidth, safeAreaHeight, tailwind } = this.props;

    let saveLinksSvgWidth = 240;
    if (safeAreaWidth >= SM_WIDTH) saveLinksSvgWidth = 288;
    // iPhone 11 Pro Max landscape is wider than MD (414x896)
    if (safeAreaHeight >= (640 - 24)) {
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
        <View style={tailwind('h-full w-full items-center justify-center px-12')}>
          <SvgXml width={saveLinksSvgWidth} height={saveLinksSvgHeight} xml={saveLinksToVisitLater} />
          {/* From onLayout, text width is ~394 so when safe area width is wide enough, no line break. */}
          <Text style={tailwind('mt-5 text-center text-3xl font-bold text-gray-900 sm:mt-8 sm:text-4xl md:text-5xl')}>Save links {safeAreaWidth < 400 ? '\n' : ''}to visit later</Text>
        </View>
        <View style={tailwind('h-full w-full items-center justify-center px-4 md:px-6 lg:px-8')}>
          <SvgXml width={64} height={64} xml={undrawLink} />
          <Text style={tailwind('mt-4 text-center text-3xl font-semibold text-gray-900 md:text-4xl')}>Never miss a link ever again</Text>
          <Text style={tailwind('mt-4 text-center text-lg font-normal text-gray-500')}>Many interesting, useful, and important stuff is {safeAreaWidth >= SM_WIDTH && safeAreaWidth < MD_WIDTH ? '\n' : ''}on the internet. {safeAreaWidth >= MD_WIDTH ? '\n' : ''}Brace.to helps you save them so that you will never miss anything.</Text>
        </View>
        <View style={tailwind('h-full w-full items-center justify-center px-4 md:px-6 lg:px-8')}>
          <View style={tailwind('w-full max-w-md flex-row')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <View style={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-gray-600')}>
                <Svg style={tailwind('font-normal text-white')} width={18} height={21} viewBox="0 0 47 56" fill="currentColor">
                  <Path d="M29.325.175c5.138 2.74 13.856 11.394 17.342 16.056-3.001-2.1-9.436-3.867-14.213-2.751.518-3.426-.431-10.58-3.129-13.305zm17.342 25.492V56H0V0h19.621c11.333 0 7.782 18.667 7.782 18.667 7.02-1.739 19.264-.978 19.264 7zM9.333 37.333H21V28H9.333v9.333zm28 4.667h-28v2.333h28V42zm0-7H25.667v2.333h11.666V35zm0-7H25.667v2.333h11.666V28z" />
                </Svg>
              </View>
            </View>
            <View style={tailwind('mt-0.5 ml-4 flex-shrink flex-grow')}>
              <Text style={tailwind('text-xl font-medium leading-5 text-gray-900 md:text-2xl')}>Long useful articles</Text>
              <Text style={tailwind('mt-2 text-base font-normal text-gray-500 md:text-lg')}>You found a long, useful, and important article but can't read it right now? Not a problem. Just save it to Brace.to to read later.</Text>
            </View>
          </View>
          <View style={tailwind('mt-10 w-full max-w-md flex-row md:mt-12')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <View style={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-blue-400')}>
                <Svg style={tailwind('font-normal text-white')} width={20} height={20} viewBox="0 0 56 56" fill="currentColor">
                  <Path d="M0 4C0 1.79088 1.79088 0 4 0H52C54.2092 0 56 1.79088 56 4V12C56 14.2091 54.2092 16 52 16H4C1.79088 16 0 14.2091 0 12V4Z" />
                  <Path d="M0 28C0 25.7908 1.79088 24 4 24H28C30.2092 24 32 25.7908 32 28V52C32 54.2092 30.2092 56 28 56H4C1.79088 56 0 54.2092 0 52V28Z" />
                  <Path d="M44 24C41.7908 24 40 25.7908 40 28V52C40 54.2092 41.7908 56 44 56H52C54.2092 56 56 54.2092 56 52V28C56 25.7908 54.2092 24 52 24H44Z" />
                </Svg>
              </View>
            </View>
            <View style={tailwind('mt-0.5 ml-4 flex-shrink flex-grow')}>
              <Text style={tailwind('text-xl font-medium leading-5 text-gray-900 md:text-2xl')}>Interesting websites</Text>
              <Text style={tailwind('mt-2 text-base font-normal text-gray-500 md:text-lg')}>You found a ridiculously cool and interesting website you want to check out later? Not a problem. Just save it to Brace.to to visit later.</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('h-full w-full items-center justify-center px-4 md:px-6 lg:px-8')}>
          <View style={tailwind('w-full max-w-md flex-row')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <View style={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-yellow-500')}>
                <Svg style={tailwind('font-normal text-white')} width={28} height={21} viewBox="0 0 75 56" fill="currentColor">
                  <Path d="M31.111 51.333a4.666 4.666 0 11-9.333 0 4.666 4.666 0 019.333 0zM42 46.667a4.666 4.666 0 100 9.332 4.666 4.666 0 000-9.332zm4.157-15.556l6.15-21.778H0l9.14 21.778h37.017zM61.615 0L50.938 37.333h-39.19l2.61 6.223h41.188L66.354 6.222h6.001L74.667 0H61.616z" />
                </Svg>
              </View>
            </View>
            <View style={tailwind('mt-0.5 ml-4 flex-shrink flex-grow')}>
              <Text style={tailwind('text-xl font-medium leading-5 text-gray-900 md:text-2xl')}>Items on online shops</Text>
              <Text style={tailwind('mt-2 text-base font-normal text-gray-500 md:text-lg')}>You found an item on an online shop you don't want now but might want to buy later? Not a problem. Just save it to Brace.to.</Text>
            </View>
          </View>
          <View style={tailwind('mt-10 w-full max-w-md flex-row md:mt-12')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <View style={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-red-500')}>
                <Svg style={tailwind('text-base font-normal text-white')} width={24} height={18} viewBox="0 0 56 42" fill="currentColor">
                  <Path d="M45.768.43C37.36-.144 18.63-.142 10.232.43 1.139 1.05.068 6.543 0 21c.068 14.432 1.13 19.948 10.232 20.571 8.4.572 27.127.574 35.536 0 9.093-.62 10.164-6.113 10.232-20.57C55.932 6.568 54.87 1.052 45.768.43zM21 30.334V11.667l18.667 9.317L21 30.334z" />
                </Svg>
              </View>
            </View>
            <View style={tailwind('mt-0.5 ml-4 flex-shrink flex-grow')}>
              <Text style={tailwind('text-xl font-medium leading-5 text-gray-900 md:text-2xl')}>Videos and music</Text>
              <Text style={tailwind('mt-2 text-base font-normal text-gray-500 md:text-lg')}>Your friend shared a video with you, but you want to watch it tonight. Not a problem. Just save it to Brace.to to watch it whenever you want.</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('h-full w-full items-center justify-center px-4 md:px-6 lg:px-8')}>
          <SvgXml width={80} height={80} xml={stacksShort} />
          <Text style={tailwind('mt-4 text-center text-3xl font-semibold text-gray-900 md:text-4xl')}>Your privacy at heart powered by <Text onPress={() => Linking.openURL('https://www.hiro.so/stacks-js')} style={tailwind('text-3xl font-semibold text-purple-blockstack md:text-4xl')}>Stacks</Text></Text>
          <Text style={tailwind('mt-4 text-center text-lg font-normal text-gray-500 md:text-xl')}>Your account is truly yours. {safeAreaWidth >= SM_WIDTH ? '' : '\n'}Your data is truly yours.</Text>
        </View>
        <View style={tailwind('h-full w-full items-center justify-center px-4 md:px-6 lg:px-8')}>
          <View style={cache('L_blockstackGrayBox', [tailwind('max-w-sm bg-gray-50 p-4'), borderRadius], [tailwind])}>
            <View style={tailwind('flex h-14 w-14 items-center justify-center rounded-full bg-purple-blockstack')}>
              <Svg style={tailwind('font-normal text-white')} width={32} height={32} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" clipRule="evenodd" d="M18 8.00001C18.0003 8.93719 17.781 9.86139 17.3598 10.6986C16.9386 11.5357 16.3271 12.2626 15.5744 12.8209C14.8216 13.3792 13.9486 13.7534 13.0252 13.9135C12.1018 14.0737 11.1538 14.0153 10.257 13.743L10 14L9 15L8 16H6V18H2V14L6.257 9.74301C6.00745 8.91803 5.93857 8.04896 6.05504 7.19496C6.17152 6.34096 6.47062 5.52208 6.93199 4.79406C7.39336 4.06604 8.00616 3.44596 8.72869 2.97603C9.45122 2.50611 10.2665 2.19736 11.1191 2.07082C11.9716 1.94427 12.8415 2.0029 13.6693 2.2427C14.4972 2.4825 15.2637 2.89785 15.9166 3.46048C16.5696 4.02311 17.0936 4.71981 17.4531 5.50315C17.8127 6.2865 17.9992 7.13811 18 8.00001ZM12 4.00001C11.7348 4.00001 11.4804 4.10537 11.2929 4.29291C11.1054 4.48044 11 4.7348 11 5.00001C11 5.26523 11.1054 5.51958 11.2929 5.70712C11.4804 5.89466 11.7348 6.00001 12 6.00001C12.5304 6.00001 13.0391 6.21073 13.4142 6.5858C13.7893 6.96087 14 7.46958 14 8.00001C14 8.26523 14.1054 8.51959 14.2929 8.70712C14.4804 8.89466 14.7348 9.00001 15 9.00001C15.2652 9.00001 15.5196 8.89466 15.7071 8.70712C15.8946 8.51959 16 8.26523 16 8.00001C16 6.93915 15.5786 5.92173 14.8284 5.17159C14.0783 4.42144 13.0609 4.00001 12 4.00001Z" />
              </Svg>
            </View>
            <Text style={tailwind('mt-5 text-xl font-semibold leading-5 text-gray-900 md:text-2xl')}>Account</Text>
            <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 md:text-lg')}><Text style={tailwind('text-base font-medium text-purple-blockstack md:text-lg')} onPress={() => Linking.openURL('https://docs.stacks.co/stacks-101/accounts')}>Your account</Text> is cryptographically generated; only you, with your Secret Key, can control it.</Text>
            <Text style={tailwind('mt-5 text-base font-medium leading-5.5 text-gray-900 md:text-lg')}>No ban on your owned account</Text>
            <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 md:text-lg')}>Your account cannot be locked, banned, or deleted by anyone, as your Secret Key is required to access and modify your account.</Text>
          </View>
        </View>
        <View style={tailwind('h-full w-full items-center justify-center px-4 md:px-6 lg:px-8')}>
          <View style={cache('L_blockstackGrayBox', [tailwind('max-w-sm bg-gray-50 p-4'), borderRadius], [tailwind])}>
            <Svg width={56} height={56} viewBox="0 0 78 78" fill="none">
              <Circle cx="39" cy="39" r="39" fill="#211F6D" />
              <Path d="M39 31.2727C34.7392 31.2727 31.2727 34.7392 31.2727 39C31.2727 43.2608 34.7392 46.7273 39 46.7273C43.2608 46.7273 46.7273 43.2608 46.7273 39C46.7273 34.7392 43.2608 31.2727 39 31.2727ZM43.1047 34.3621C43.2917 34.529 43.471 34.7067 43.6364 34.8937L42.7369 35.7947L42.4804 35.5196L42.2037 35.2631L43.1047 34.3621V34.3621ZM41.0555 33.1566C41.2935 33.2401 41.5268 33.3375 41.7494 33.4487L41.2517 34.6233L40.8499 34.4378L40.5609 34.3312L41.0555 33.1566V33.1566ZM38.6245 32.8182H39.3755V34.0916L39 34.0777L38.6245 34.0916V32.8182ZM36.9816 33.1412L37.4685 34.3188L37.1485 34.4363L36.7745 34.6063L36.2893 33.4286C36.5118 33.3205 36.7452 33.2246 36.9816 33.1412ZM33.4487 36.2506L34.6233 36.7452L34.4394 37.147L34.3312 37.4375L33.1566 36.943C33.2401 36.7035 33.3375 36.4732 33.4487 36.2506ZM32.8182 38.6214H34.0916L34.0777 38.9969L34.0916 39.3725H32.8182V38.6214V38.6214ZM33.4302 41.7076C33.322 41.4835 33.2246 41.2517 33.1412 41.0122L34.3204 40.5254L34.4378 40.8468L34.6063 41.2177L33.4302 41.7076V41.7076ZM34.7886 43.7384L34.257 43.2083L35.2615 42.2006L35.5181 42.4757L35.7947 42.7323L34.7886 43.7384V43.7384ZM35.5196 35.5196L35.2631 35.7947L34.3636 34.8937C34.529 34.7067 34.7083 34.529 34.8953 34.3621L35.7963 35.2631L35.5196 35.5196V35.5196ZM36.9445 44.8434C36.7065 44.7599 36.4732 44.6625 36.2506 44.5513L36.7483 43.3767L37.1501 43.5622L37.4406 43.6704L36.9445 44.8434ZM39.3755 45.1818H38.6245V43.9068L39 43.9207L39.3755 43.9068V45.1818ZM41.0168 44.8573L40.5315 43.6781L40.8515 43.5606L41.2255 43.3906L41.7107 44.5683C41.4882 44.678 41.2548 44.7754 41.0168 44.8573V44.8573ZM39 42.0909C37.2923 42.0909 35.9091 40.7077 35.9091 39C35.9091 38.371 36.0961 37.7884 36.4175 37.3L37.5365 38.4189L38.3432 37.6122L37.2135 36.4794C37.7173 36.1208 38.3324 35.9091 39 35.9091C40.7077 35.9091 42.0909 37.2938 42.0909 39C42.0909 40.7062 40.7077 42.0909 39 42.0909V42.0909ZM43.1047 43.6317L42.2037 42.7307L42.4804 42.4742L42.7369 42.1991L43.6364 43.1001C43.471 43.2886 43.2917 43.4664 43.1047 43.6317V43.6317ZM44.5513 41.7447L43.3767 41.2486L43.5606 40.8484L43.6688 40.5563L44.8434 41.0524C44.7599 41.2888 44.6625 41.5222 44.5513 41.7447ZM45.1818 39.3725H43.9084L43.9223 38.9969L43.9084 38.6214H45.1818V39.3725ZM44.8573 36.9801L43.6781 37.4669L43.5606 37.1455L43.3922 36.7715L44.5698 36.2862C44.678 36.5103 44.7738 36.7436 44.8573 36.9801ZM45.1818 56H52.9091V59.0909H45.1818V56ZM25.0909 56H32.8182V59.0909H25.0909V56ZM22 22V54.4545H56V22H22ZM39 48.2727C33.8753 48.2727 29.7273 44.1247 29.7273 39C29.7273 33.8737 33.8753 29.7273 39 29.7273C44.1247 29.7273 48.2727 33.8753 48.2727 39C48.2727 44.1247 44.1247 48.2727 39 48.2727Z" fill="white" />
            </Svg>
            <Text style={tailwind('mt-5 text-xl font-semibold leading-5 text-gray-900 md:text-2xl')}>Encryption</Text>
            <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 md:text-lg')}>Everything is encrypted; only you, with your Secret Key, can see the content inside.</Text>
            <Text style={tailwind('mt-5 text-base font-medium leading-5.5 text-gray-900 md:text-lg')}>No targeted ads and data breach</Text>
            <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 md:text-lg')}>No one can see the content inside your data, so it cannot be used to create targeted ads. If your data is stolen, no information is leaked.</Text>
          </View>
        </View>
        <View style={tailwind('h-full w-full items-center justify-center px-4 md:px-6 lg:px-8')}>
          <View style={cache('L_blockstackGrayBox', [tailwind('max-w-sm bg-gray-50 p-4'), borderRadius], [tailwind])}>
            <Svg width={56} height={56} viewBox="0 0 78 78" fill="none">
              <Circle cx="39" cy="39" r="39" fill="#211F6D" />
              <Path d="M25.6452 31.7745L39 24.2261M25.6452 31.7745L39 39.3228M25.6452 31.7745V46.8712M39 24.2261L52.3548 31.7745M39 24.2261V39.3228M39 39.3228L52.3548 31.7745M39 39.3228L52.3548 46.8712M39 39.3228V54.4196M39 39.3228L25.6452 46.8712M52.3548 31.7745V46.8712M25.6452 46.8712L39 54.4196M39 54.4196L52.3548 46.8712" stroke="white" strokeWidth="1.69052" />
              <Path d="M47.7097 34.3875L52.3548 36.9279L57 34.315V29.1617M47.7097 34.3875V29.1617M47.7097 34.3875L52.3548 31.7746M57 29.1617L52.3548 31.7746M57 29.1617L52.3548 26.5488L47.7097 29.1617M47.7097 29.1617L52.3548 31.7746" stroke="white" strokeWidth="1.69052" />
              <Path d="M34.3548 26.8387L39 29.379L43.6452 26.8387V21.6129M34.3548 26.8387V21.6129M34.3548 26.8387L39 24.2258M43.6452 21.6129L39 24.2258M43.6452 21.6129L39 19L34.3548 21.6129M34.3548 21.6129L39 24.2258" stroke="white" strokeWidth="1.69052" />
              <Path d="M30.2903 29.1617V34.3875L25.6452 36.9279L21 34.3875V29.1617M30.2903 29.1617L25.6452 31.7746L21 29.1617M30.2903 29.1617L25.6452 26.5488L21 29.1617" stroke="white" strokeWidth="1.69052" />
              <Path d="M30.2903 44.2584V49.4842L25.6452 52.0245M30.2903 44.2584L25.6452 46.8713M30.2903 44.2584L25.6452 41.6455L21 44.2584M25.6452 52.0245L21 49.4842V44.2584M25.6452 52.0245V46.8713M21 44.2584L25.6452 46.8713" stroke="white" strokeWidth="1.69052" />
              <Path d="M43.6452 51.8063V57.0321L39 59.5724M43.6452 51.8063L39 54.4192M43.6452 51.8063L39 49.1934L34.3548 51.8063M39 59.5724L34.3548 57.0321V51.8063M39 59.5724V54.4192M34.3548 51.8063L39 54.4192" stroke="white" strokeWidth="1.69052" />
              <Path d="M57 44.2584V49.4842L52.3548 52.0245M57 44.2584L52.3548 46.8713M57 44.2584L52.3548 41.6455L47.7097 44.2584M52.3548 52.0245L47.7097 49.4842V44.2584M52.3548 52.0245V46.8713M47.7097 44.2584L52.3548 46.8713" stroke="white" strokeWidth="1.69052" />
            </Svg>
            <Text style={tailwind('mt-5 text-xl font-semibold leading-5 text-gray-900 md:text-2xl')}>Data Storage</Text>
            <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 md:text-lg')}>Your data lives in <Text style={tailwind('text-base font-medium text-purple-blockstack md:text-lg')} onPress={() => Linking.openURL('https://docs.stacks.co/stacks-in-depth/gaia')}>a data server</Text> of your choice; only you, with your Secret Key, can change it.</Text>
            <Text style={tailwind('mt-5 text-base font-medium leading-5.5 text-gray-900 md:text-lg')}>No lock out of your own data</Text>
            <Text style={tailwind('mt-2.5 text-base font-normal text-gray-500 md:text-lg')}>You can manage your data and set permissions directly, as you can host your own data server or choose any data server provider.</Text>
          </View>
        </View>
        <View style={tailwind('h-full w-full items-center justify-center bg-purple-blockstack px-4 md:px-6 lg:px-8')}>
          <View>
            {/* // From onLayout, Don't be evil text width is ~317 so when safe area width is wide enought (padding 48 + 48 + 317), no line break. */}
            <Text style={tailwind('text-center text-4xl font-bold text-white md:text-5xl')}><Text style={tailwind('text-4xl font-bold text-white line-through md:text-5xl')}>Don't</Text>{safeAreaWidth < 420 ? '\n' : ' '}Can't be Evil</Text>
            <SvgXml style={cache('L_logo', [tailwind('absolute right-0 bottom-0'), logoTranslate], [safeAreaWidth, tailwind])} width={91.66} height={20} xml={logoFullWhite} />
          </View>
          <Text style={tailwind('mt-20 text-center text-lg font-normal leading-6 text-gray-200 md:text-xl')}>Not just that Brace.to doesn't be evil; Brace.to can't be.</Text>
        </View>
      </Swiper >
    );
  }

  renderSignUp() {
    const { tailwind } = this.props;

    return (
      <TouchableOpacity onPress={this.onSignUpBtnClick} style={tailwind('items-center py-5')}>
        <View style={[tailwind('flex-row items-center justify-center rounded-full bg-gray-800'), { paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }]}>
          <Text style={tailwind('text-lg font-medium text-gray-50')}>Get Started</Text>
          <Svg style={tailwind('ml-2 text-base font-normal text-gray-50')} width={8} height={13} viewBox="0 0 6 10" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
          </Svg>
        </View>
      </TouchableOpacity >
    );
  }

  render() {
    const { safeAreaHeight, tailwind } = this.props;

    // Dangerous assumption that TopBar's height is 56-58 and the last view's height is 80.
    // if safeAreaHeight < ~56 + ~576 + ~80, fix height on Swiper and use ScrollView
    // else if safeAreaHeight < 900, expand Swiper so the content cover the screen
    // else center the content in the middle
    //
    // safeAreaHeight is not included status bar height
    //   so less than Dimensions.get('window').height around 24 pixels
    const SWIPER_HEIGHT = 536;
    if (safeAreaHeight < (640 - 24)) {
      return (
        <React.Fragment>
          <ScrollView>
            <TopBar rightPane={SHOW_SIGN_IN} />
            {this.renderSwiper(SWIPER_HEIGHT)}
            {this.renderSignUp()}
          </ScrollView>
          <SignUpPopup key="SignUpPopup" />
          <SignInPopup key="SignInPopup" />
        </React.Fragment>
      );
    } else if (safeAreaHeight < (900 - 24)) {
      return (
        <React.Fragment>
          <TopBar rightPane={SHOW_SIGN_IN} />
          <View style={tailwind('flex-grow')}>
            {this.renderSwiper(undefined)}
          </View>
          {this.renderSignUp()}
          <SignUpPopup key="SignUpPopup" />
          <SignInPopup key="SignInPopup" />
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
          <SignUpPopup key="SignUpPopup" />
          <SignInPopup key="SignInPopup" />
        </React.Fragment>
      );
    }
  }
}

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(Landing));
