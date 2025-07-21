import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Svg, Path } from 'react-native-svg';

import { useSelector } from '../store';
import {
  DOMAIN_NAME, HASH_LANDING, HASH_LANDING_HOW, HASH_LANDING_MOBILE, HASH_ABOUT,
  HASH_TERMS, HASH_PRIVACY, HASH_SUPPORT, BLK_MODE,
} from '../types/const';
import { getThemeMode } from '../selectors';

import { useTailwind } from '.';

import Logo from '../images/logo-short.svg';
import LogoBlk from '../images/logo-short-blk.svg';

const SettingsPopupAbout = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = useTailwind();

  return (
    <View style={tailwind('p-4 md:p-6')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100')}>About</Text>
      </View>
      <View style={tailwind('mt-5 md:mt-0')}>
        <View style={tailwind('hidden md:flex')}>
          {themeMode === BLK_MODE ? <LogoBlk width={36} height={36} /> : <Logo width={24.82} height={28} />}
        </View>
        <View style={tailwind('-ml-2 items-start justify-start md:flex-row md:pt-8')}>
          <View style={tailwind('py-2')}>
            <TouchableOpacity onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_LANDING)} style={tailwind('px-2 py-1')}>
              <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>Home page</Text>
            </TouchableOpacity>
          </View>
          <View style={tailwind('py-2 md:ml-10')}>
            <TouchableOpacity onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_LANDING_HOW)} style={tailwind('px-2 py-1')}>
              <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>How to</Text>
            </TouchableOpacity>
          </View>
          <View style={tailwind('py-2 md:ml-10')}>
            <TouchableOpacity onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_LANDING_MOBILE)} style={tailwind('px-2 py-1')}>
              <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>Mobile apps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={tailwind('-ml-2 items-start justify-start pt-8 md:flex-row')}>
        <View style={tailwind('py-2')}>
          <TouchableOpacity onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_ABOUT)} style={tailwind('px-2 py-1')}>
            <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>About</Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind('py-2 md:ml-10')}>
          <TouchableOpacity onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_TERMS)} style={tailwind('px-2 py-1')}>
            <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>Terms</Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind('py-2 md:ml-10')}>
          <TouchableOpacity onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_PRIVACY)} style={tailwind('px-2 py-1')}>
            <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>Privacy</Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind('py-2 md:ml-10')}>
          <TouchableOpacity onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('px-2 py-1')}>
            <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>Support</Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind('hidden py-2 md:ml-10 lg:flex')}>
          <TouchableOpacity onPress={() => Linking.openURL('https://docs.brace.to')} style={tailwind('px-2 py-1')}>
            <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>Docs</Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind('hidden py-2 md:ml-10 lg:flex')}>
          <TouchableOpacity onPress={() => Linking.openURL('https://medium.com/@stxapps')} style={tailwind('px-2 py-1')}>
            <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>Blog</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={tailwind('-ml-2 items-start justify-start pt-8 md:flex-row lg:hidden')}>
        <View style={tailwind('py-2')}>
          <TouchableOpacity onPress={() => Linking.openURL('https://docs.brace.to')} style={tailwind('px-2 py-1')}>
            <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>Docs</Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind('py-2 md:ml-10')}>
          <TouchableOpacity onPress={() => Linking.openURL('https://medium.com/@stxapps')} style={tailwind('px-2 py-1')}>
            <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>Blog</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={tailwind('flex-row items-center justify-start pt-14')}>
        <TouchableOpacity onPress={() => Linking.openURL('https://x.com/bracedotto')} style={tailwind('my-0.5')}>
          <Svg style={tailwind('font-normal text-gray-400 blk:text-gray-500')} width={33} height={26.4} viewBox="0 0 40 32" fill="currentColor">
            <Path d="M39.3698 3.78614C37.8984 4.44222 36.3353 4.8694 34.7347 5.05288C36.4236 4.04791 37.6878 2.46123 38.2902 0.59049C36.7003 1.529 34.9626 2.19096 33.1512 2.54819C32.0432 1.36791 30.6059 0.547927 29.0261 0.194638C27.4462 -0.158651 25.7966 -0.028933 24.2913 0.566959C22.7861 1.16285 21.4947 2.19741 20.5847 3.53637C19.6747 4.87533 19.1882 6.45689 19.1883 8.0758C19.1864 8.69639 19.2589 9.31498 19.4042 9.91833C16.1925 9.75558 13.0507 8.92071 10.1818 7.46769C7.31299 6.01467 4.78096 3.97583 2.74941 1.48297C1.71591 3.26124 1.39962 5.36677 1.86504 7.37021C2.33046 9.37365 3.54253 11.1241 5.25411 12.2647C3.9726 12.224 2.71923 11.8786 1.59782 11.2571V11.3578C1.59779 13.2224 2.24286 15.0295 3.42355 16.4726C4.60425 17.9156 6.24786 18.9058 8.07549 19.275C7.38151 19.4662 6.66491 19.5631 5.94506 19.5629C5.43327 19.5584 4.92279 19.5103 4.41921 19.4189C4.93557 21.0235 5.93989 22.4268 7.29207 23.4332C8.64425 24.4396 10.2768 24.9988 11.9621 25.0329C9.0986 27.2749 5.5657 28.4914 1.9289 28.4877C1.28428 28.4856 0.640289 28.4471 0 28.3725C3.69278 30.7449 7.99038 32.0042 12.3795 32C27.235 32 35.3537 19.6924 35.3537 9.02586C35.3537 8.68038 35.3393 8.32051 35.3249 7.97503C36.9116 6.83045 38.2814 5.41192 39.3698 3.78614Z" />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.threads.net/@brace.to')} style={tailwind('ml-8')}>
          <Svg style={tailwind('font-normal text-gray-400 blk:text-gray-500')} width={32} height={32} viewBox="0 0 192 192" fill="currentColor">
            <Path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/stxapps/brace-client')} style={tailwind('ml-8')}>
          <Svg style={tailwind('font-normal text-gray-400 blk:text-gray-500')} width={32} height={31.02} viewBox="0 0 33 32" fill="currentColor">
            <Path d="M16.3972 0C14.2439 0 12.1117 0.424127 10.1223 1.24817C8.13288 2.0722 6.32526 3.28001 4.80264 4.80264C1.72756 7.87772 0 12.0484 0 16.3972C0 23.6448 4.70601 29.7938 11.2157 31.9746C12.0356 32.1058 12.2979 31.5975 12.2979 31.1547V28.3836C7.75589 29.3674 6.78845 26.1864 6.78845 26.1864C6.03418 24.2843 4.96836 23.776 4.96836 23.776C3.47621 22.7594 5.08314 22.7922 5.08314 22.7922C6.72287 22.9069 7.59192 24.4811 7.59192 24.4811C9.01848 26.9734 11.4289 26.2356 12.3635 25.842C12.5111 24.7762 12.9374 24.0547 13.3965 23.6448C9.75635 23.2349 5.9358 21.8247 5.9358 15.5774C5.9358 13.7573 6.55889 12.2979 7.62471 11.1337C7.46074 10.7238 6.88684 9.01848 7.78869 6.80485C7.78869 6.80485 9.16605 6.36213 12.2979 8.47737C13.5933 8.11663 15.0035 7.93626 16.3972 7.93626C17.791 7.93626 19.2012 8.11663 20.4965 8.47737C23.6284 6.36213 25.0058 6.80485 25.0058 6.80485C25.9076 9.01848 25.3337 10.7238 25.1698 11.1337C26.2356 12.2979 26.8587 13.7573 26.8587 15.5774C26.8587 21.8411 23.0217 23.2185 19.3651 23.6284C19.9554 24.1367 20.4965 25.137 20.4965 26.6619V31.1547C20.4965 31.5975 20.7589 32.1222 21.5952 31.9746C28.1049 29.7774 32.7945 23.6448 32.7945 16.3972C32.7945 14.2439 32.3703 12.1117 31.5463 10.1223C30.7223 8.13288 29.5145 6.32526 27.9918 4.80264C26.4692 3.28001 24.6616 2.0722 22.6722 1.24817C20.6828 0.424127 18.5505 0 16.3972 0Z" />
          </Svg>
        </TouchableOpacity>
      </View>
      <View style={tailwind('items-start justify-start pt-16 lg:flex-row lg:justify-between')}>
        <Text style={tailwind('text-base font-normal text-gray-400 blk:text-gray-500')}>© {(new Date()).getFullYear()} <Text onPress={() => Linking.openURL('https://www.stxapps.com')} style={tailwind('text-base font-normal text-gray-400 blk:text-gray-500')}>STX Apps Co., Ltd.</Text></Text>
        <Text style={tailwind('text-base font-normal text-gray-400 blk:text-gray-500')}>Crafted with ❤ and ℅ for a better web</Text>
      </View>
    </View>
  );
};

export default React.memo(SettingsPopupAbout);
