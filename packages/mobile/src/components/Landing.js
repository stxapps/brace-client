import React from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper'
import Svg, { SvgXml, Path, Circle } from 'react-native-svg'

import { signUp } from '../actions';
import { SHOW_SIGN_IN } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

import { InterText as Text } from '.';

import TopBar from './TopBar';

import saveLinksToVisitLater from '../images/save-links-to-visit-later.svg';
import undrawLink from '../images/undraw-link.svg';
import blockstackShort from '../images/blockstack-short.svg';
import logoFullWhite from '../images/logo-full-white.svg';

class Landing extends React.PureComponent {

  renderSwiper(swiperHeight, windowWidth) {

    const borderRadius = {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
    };
    const logoTranslate = {
      transform: [{ translateX: 0 }, { translateY: 30 }],
    };
    // From onLayout, Don't be evil text width is ~317 so when window width is wide enought (padding 48 + 48 + 317 + 45), move the logo to the right.
    if (windowWidth > 470) logoTranslate.transform[0].translateX = 45;

    return (
      <Swiper height={swiperHeight} showsPagination={true} showsButtons={false} activeDotStyle={tailwind('bg-gray-900')} paginationStyle={{ bottom: 10 }}>
        <View style={tailwind('px-12 justify-center items-center w-full h-full')}>
          <SvgXml width={'100%'} xml={saveLinksToVisitLater} />
          {/* From onLayout, text width is ~394 so when window width is wide enough, no line break. */}
          <Text style={tailwind('mt-2 text-3xl text-gray-900 font-bold text-center sm:mt-5 sm:text-4xl md:text-5xl', windowWidth)}>Save links {windowWidth < 400 ? '\n' : ''}to visit later</Text>
        </View>
        <View style={tailwind('px-12 justify-center items-center w-full h-full')}>
          <SvgXml width={64} height={64} xml={undrawLink} />
          <Text style={tailwind('mt-4 text-3xl text-gray-900 font-semibold text-center md:text-4xl', windowWidth)}>Never miss a link ever again</Text>
        </View>
        <View style={tailwind('px-12 justify-center items-center w-full h-full')}>
          <Svg style={tailwind('text-gray-600')} width={40} height={48} viewBox="0 0 47 56" fill="currentColor">
            <Path d="M29.325.175c5.138 2.74 13.856 11.394 17.342 16.056-3.001-2.1-9.436-3.867-14.213-2.751.518-3.426-.431-10.58-3.129-13.305zm17.342 25.492V56H0V0h19.621c11.333 0 7.782 18.667 7.782 18.667 7.02-1.739 19.264-.978 19.264 7zM9.333 37.333H21V28H9.333v9.333zm28 4.667h-28v2.333h28V42zm0-7H25.667v2.333h11.666V35zm0-7H25.667v2.333h11.666V28z" />
          </Svg>
          <Text style={tailwind('mt-2 w-48 text-xl text-gray-800 font-medium text-center')}>long useful articles to read later</Text>
          <Svg style={tailwind('mt-6 text-blue-400')} width={40} height={40} viewBox="0 0 56 56" fill="currentColor">
            <Path d="M0 4C0 1.79088 1.79088 0 4 0H52C54.2092 0 56 1.79088 56 4V12C56 14.2091 54.2092 16 52 16H4C1.79088 16 0 14.2091 0 12V4Z" />
            <Path d="M0 28C0 25.7908 1.79088 24 4 24H28C30.2092 24 32 25.7908 32 28V52C32 54.2092 30.2092 56 28 56H4C1.79088 56 0 54.2092 0 52V28Z" />
            <Path d="M44 24C41.7908 24 40 25.7908 40 28V52C40 54.2092 41.7908 56 44 56H52C54.2092 56 56 54.2092 56 52V28C56 25.7908 54.2092 24 52 24H44Z" />
          </Svg>
          <Text style={tailwind('mt-2 w-48 text-xl text-gray-800 font-medium text-center')}>interesting websites to check out later</Text>
          <Svg style={tailwind('mt-6 text-orange-500')} width={54} height={40} viewBox="0 0 75 56" fill="currentColor">
            <Path d="M31.111 51.333a4.666 4.666 0 11-9.333 0 4.666 4.666 0 019.333 0zM42 46.667a4.666 4.666 0 100 9.332 4.666 4.666 0 000-9.332zm4.157-15.556l6.15-21.778H0l9.14 21.778h37.017zM61.615 0L50.938 37.333h-39.19l2.61 6.223h41.188L66.354 6.222h6.001L74.667 0H61.616z" />
          </Svg>
          <Text style={tailwind('mt-2 w-48 text-xl text-gray-800 font-medium text-center')}>items on online shops to buy later</Text>
        </View>
        <View style={tailwind('px-12 justify-center items-center w-full h-full')}>
          <Svg style={tailwind('text-red-600')} width={54} height={40} viewBox="0 0 56 42" fill="currentColor">
            <Path d="M45.768.43C37.36-.144 18.63-.142 10.232.43 1.139 1.05.068 6.543 0 21c.068 14.432 1.13 19.948 10.232 20.571 8.4.572 27.127.574 35.536 0 9.093-.62 10.164-6.113 10.232-20.57C55.932 6.568 54.87 1.052 45.768.43zM21 30.334V11.667l18.667 9.317L21 30.334z" />
          </Svg>
          <Text style={tailwind('mt-2 w-48 text-xl text-gray-800 font-medium text-center')}>videos your friends just share to watch later</Text>
          <Svg style={tailwind('mt-8 text-pink-500')} width={54} height={56} viewBox="0 0 54 56" fill="currentColor">
            <Path d="M53.7143 48.416C53.7097 51.9703 51.04 53.7143 48.5943 53.7143C46.5303 53.7143 44.5714 52.4708 44.5714 50.0206C44.5714 47.4971 47.3165 45.1794 50.32 45.1794C50.688 45.1794 51.0583 45.2137 51.4285 45.2868V35.4308L37.7143 38.24V50.6971C37.7097 54.2537 35.0171 56 32.5531 56C30.4823 56 28.5714 54.7611 28.5714 52.32C28.5714 49.792 31.3165 47.4628 34.3268 47.4628C34.6925 47.4628 35.0628 47.4971 35.4331 47.5703V32.6674L53.7143 28.5714V48.416Z" />
            <Path fillRule="evenodd" clipRule="evenodd" d="M25.1429 29.3333C27.4539 29.3333 29.3333 27.4539 29.3333 25.1429C29.3333 22.8318 27.4539 20.9524 25.1429 20.9524C22.8318 20.9524 20.9524 22.8318 20.9524 25.1429C20.9524 27.4539 22.8318 29.3333 25.1429 29.3333ZM50.1278 27.9761C50.2321 27.0461 50.2857 26.1007 50.2857 25.1429C50.2857 11.2577 39.028 0 25.1429 0C11.2577 0 0 11.2577 0 25.1429C0 39.028 11.2577 50.2857 25.1429 50.2857C25.9625 50.2857 26.7729 50.2465 27.5725 50.1698C28.1743 48.0629 30.58 46.32 33.184 46.32C33.5497 46.32 33.92 46.3543 34.2903 46.4274V31.5246L50.1278 27.9761ZM14.8531 32.3526C15.6933 33.551 16.7368 34.5945 17.9352 35.4347L14.497 43.1682C11.4589 41.3684 8.91943 38.829 7.11962 35.7909L14.8531 32.3526ZM25.1429 16.7619C29.7712 16.7619 33.5238 20.5145 33.5238 25.1429C33.5238 29.7712 29.7712 33.5238 25.1429 33.5238C20.5145 33.5238 16.7619 29.7712 16.7619 25.1429C16.7619 20.5145 20.5145 16.7619 25.1429 16.7619ZM35.7888 7.11962C38.8289 8.91943 41.3684 11.4589 43.1682 14.499L35.4347 17.9352C34.5924 16.7368 33.549 15.6933 32.3505 14.8531L35.7888 7.11962Z" />
          </Svg>
          <Text style={tailwind('mt-2 w-48 text-xl text-gray-800 font-medium text-center')}>music you found in your feed to listen later</Text>
        </View>
        <View style={tailwind('px-12 justify-center items-center w-full h-full')}>
          <SvgXml width={64} height={64} xml={blockstackShort} />
          <Text style={tailwind('mt-4 text-3xl text-gray-900 font-semibold text-center')}>Your privacy at heart powered by <Text style={tailwind('text-3xl text-purple-blockstack font-semibold')}>Blockstack</Text></Text>
          <Text style={tailwind('mt-4 text-xl text-gray-700 text-center max-w-sm')}>Your identity is yours.{'\n'}Your data is yours.</Text>
        </View>
        <View style={tailwind('px-12 justify-center items-center w-full h-full')}>
          <View style={[tailwind('p-4 bg-gray-100 max-w-sm'), borderRadius]}>
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
            <Text style={tailwind('mt-4 text-2xl text-gray-800 font-semibold')}>User-owned Identity</Text>
            <Text style={tailwind('mt-3 text-lg text-gray-700 font-normal text-justify leading-7')}>Your identity <Text style={tailwind('text-lg text-gray-700 font-semibold')}>cannot</Text> be locked, banned, or deleted by Brace.to. Your identity lives in blockchain and only you who have the private key can access it and control it.</Text>
          </View>
        </View>
        <View style={tailwind('px-12 justify-center items-center w-full h-full')}>
          <View style={[tailwind('p-4 bg-gray-100 max-w-sm'), borderRadius]}>
            <Svg style={tailwind('text-purple-blockstack')} width={51} height={56} viewBox="0 0 72 79" fill="currentColor">
              <Path d="M36 19.6364C26.9771 19.6364 19.6364 26.9771 19.6364 36C19.6364 45.0229 26.9771 52.3636 36 52.3636C45.0229 52.3636 52.3636 45.0229 52.3636 36C52.3636 26.9771 45.0229 19.6364 36 19.6364ZM44.6924 26.1785C45.0884 26.532 45.468 26.9084 45.8182 27.3044L43.9135 29.2124L43.3702 28.6298L42.7844 28.0865L44.6924 26.1785ZM40.3527 23.6258C40.8567 23.8025 41.3509 24.0087 41.8222 24.2444L40.7684 26.7316L39.9175 26.3389L39.3055 26.1131L40.3527 23.6258ZM35.2047 22.9091H36.7953V25.6058L36 25.5764L35.2047 25.6058V22.9091ZM31.7258 23.5931L32.7567 26.0869L32.0793 26.3356L31.2873 26.6956L30.2596 24.2018C30.7309 23.9727 31.2251 23.7698 31.7258 23.5931ZM24.2444 30.1778L26.7316 31.2251L26.3422 32.076L26.1131 32.6913L23.6258 31.644C23.8025 31.1367 24.0087 30.6491 24.2444 30.1778ZM22.9091 35.1982H25.6058L25.5764 35.9935L25.6058 36.7887H22.9091V35.1982ZM24.2051 41.7338C23.976 41.2593 23.7698 40.7684 23.5931 40.2611L26.0902 39.2302L26.3389 39.9109L26.6956 40.6964L24.2051 41.7338ZM27.0818 46.0342L25.956 44.9116L28.0833 42.7778L28.6265 43.3604L29.2124 43.9036L27.0818 46.0342ZM28.6298 28.6298L28.0865 29.2124L26.1818 27.3044C26.532 26.9084 26.9116 26.532 27.3076 26.1785L29.2156 28.0865L28.6298 28.6298ZM31.6473 48.3742C31.1433 48.1975 30.6491 47.9913 30.1778 47.7556L31.2316 45.2684L32.0825 45.6611L32.6978 45.8902L31.6473 48.3742ZM36.7953 49.0909H35.2047V46.3909L36 46.4204L36.7953 46.3909V49.0909ZM40.2709 48.4036L39.2433 45.9065L39.9207 45.6578L40.7127 45.2978L41.7404 47.7916C41.2691 48.024 40.7749 48.2302 40.2709 48.4036ZM36 42.5455C32.3836 42.5455 29.4545 39.6164 29.4545 36C29.4545 34.668 29.8505 33.4342 30.5313 32.4L32.9007 34.7695L34.6091 33.0611L32.2167 30.6622C33.2836 29.9029 34.5862 29.4545 36 29.4545C39.6164 29.4545 42.5455 32.3869 42.5455 36C42.5455 39.6131 39.6164 42.5455 36 42.5455ZM44.6924 45.8084L42.7844 43.9004L43.3702 43.3571L43.9135 42.7745L45.8182 44.6825C45.468 45.0818 45.0884 45.4582 44.6924 45.8084ZM47.7556 41.8124L45.2684 40.7618L45.6578 39.9142L45.8869 39.2956L48.3742 40.3462C48.1975 40.8469 47.9913 41.3411 47.7556 41.8124ZM49.0909 36.7887H46.3942L46.4236 35.9935L46.3942 35.1982H49.0909V36.7887ZM48.4036 31.7225L45.9065 32.7535L45.6578 32.0727L45.3011 31.2807L47.7949 30.2531C48.024 30.7276 48.2269 31.2218 48.4036 31.7225ZM49.0909 72H65.4545V78.5455H49.0909V72ZM6.54545 72H22.9091V78.5455H6.54545V72ZM0 0V68.7273H72V0H0ZM36 55.6364C25.1476 55.6364 16.3636 46.8524 16.3636 36C16.3636 25.1444 25.1476 16.3636 36 16.3636C46.8524 16.3636 55.6364 25.1476 55.6364 36C55.6364 46.8524 46.8524 55.6364 36 55.6364Z" />
            </Svg>
            <Text style={tailwind('mt-4 text-2xl text-gray-800 font-semibold')}>True data ownership</Text>
            <Text style={tailwind('mt-3 text-lg text-gray-700 font-normal text-justify leading-7')}>All links at Brace.to are <Text style={tailwind('text-lg text-gray-700 font-semibold')}>encrypted</Text> in your browser before sending to save in server. No one can look in your links. Only you can decrypt them and see the content inside.</Text>
          </View>
        </View>
        <View style={tailwind('px-12 justify-center items-center w-full h-full bg-purple-blockstack')}>
          <View>
            {/* // From onLayout, Don't be evil text width is ~317 so when window width is wide enought (padding 48 + 48 + 317), no line break. */}
            <Text style={tailwind('text-4xl text-white font-bold text-center md:text-5xl', windowWidth)}><Text style={tailwind('text-4xl text-white font-bold line-through md:text-5xl', windowWidth)}>Don't</Text>{windowWidth < 420 ? '\n' : ' '}Can't be Evil</Text>
            <SvgXml style={[tailwind('absolute right-0 bottom-0'), logoTranslate]} width={91.66} height={20} xml={logoFullWhite} />
          </View>
        </View>
      </Swiper >
    );
  }

  renderSignUp() {
    return (
      <TouchableOpacity onPress={() => this.props.signUp()} style={tailwind('py-5 items-center')}>
        <View style={tailwind('px-6 justify-center items-center h-12 bg-gray-900 rounded-full shadow-lg')}>
          <Text style={tailwind('text-xl text-white font-semibold')}>Get Started</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const { windowWidth, windowHeight } = this.props;

    // Dangerous assumption that TopBar's height is 56-58 and the last view's height is 80.
    // if windowHeight < ~56 + ~576 + ~80, fix height on Swiper and use ScrollView
    // else if windowHeight < 900, expand Swiper so the content cover the screen
    // else center the content in the middle
    const SWIPER_HEIGHT = 502;
    if (windowHeight < 640) {
      return (
        <ScrollView>
          <TopBar rightPane={SHOW_SIGN_IN} />
          {this.renderSwiper(SWIPER_HEIGHT, windowWidth)}
          {this.renderSignUp()}
        </ScrollView>
      );
    } else if (windowHeight < 900) {
      return (
        <React.Fragment>
          <TopBar rightPane={SHOW_SIGN_IN} />
          <View style={tailwind('flex-grow')}>
            {this.renderSwiper(undefined, windowWidth)}
          </View>
          {this.renderSignUp()}
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <TopBar rightPane={SHOW_SIGN_IN} />
          <View style={tailwind('flex-1 justify-center')}>
            {this.renderSwiper(SWIPER_HEIGHT, windowWidth)}
            {this.renderSignUp()}
          </View>
        </React.Fragment>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

export default connect(mapStateToProps, { signUp })(Landing);
