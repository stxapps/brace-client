import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { SvgXml, Path } from 'react-native-svg';

import { updatePopup } from '../actions';
import { ADD_POPUP, MY_LIST, TRASH, ARCHIVE } from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import { useSafeAreaFrame } from '.';

import emptyBox from '../images/empty-box-sided.svg';
import undrawLink from '../images/undraw-link.svg';
import saveLinkOnIos from '../images/save-link-on-ios.svg';
import saveLinkOnAndroid from '../images/save-link-on-android.svg';

const BORDER_RADIUS = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  borderBottomRightRadius: 24,
  borderBottomLeftRadius: 24,
};

const EmptyContent = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const listNameMap = useSelector(getListNameMap);
  const searchString = useSelector(state => state.display.searchString);
  const dispatch = useDispatch();

  const onAddBtnClick = () => {
    dispatch(updatePopup(ADD_POPUP, true));
  };

  const displayName = getListNameDisplayName(listName, listNameMap);
  const textName = listName === ARCHIVE ? `"${displayName}"` : `"Move to -> ${displayName}"`;

  if (searchString !== '') {
    return (
      <View style={tailwind('px-4 pb-6 w-full md:px-6 lg:px-8', safeAreaWidth)}>
        <Text style={tailwind('text-base text-gray-600 font-normal')}>Your search - <Text style={tailwind('text-lg text-gray-800 font-medium')}>{searchString}</Text> - did not match any links.</Text>
        <Text style={tailwind('pt-4 text-base text-gray-500 font-normal md:pt-6', safeAreaWidth)}>Suggestion:</Text>
        <View style={tailwind('pt-2 pl-2')}>
          <Text style={tailwind('text-base text-gray-500 font-normal')}>{'\u2022'}  Make sure all words are spelled correctly.</Text>
          <Text style={tailwind('text-base text-gray-500 font-normal')}>{'\u2022'}  Try different keywords.</Text>
          <Text style={tailwind('text-base text-gray-500 font-normal')}>{'\u2022'}  Try more general keywords.</Text>
        </View>
      </View>
    );
  }

  if (listName === MY_LIST) {
    let or;
    if (Platform.OS === 'ios') {
      or = (
        <React.Fragment>
          <Text style={tailwind('mt-16 max-w-md text-base text-gray-600 font-normal text-center')}>Or tap <Text style={tailwind('text-base text-gray-600 font-semibold')}>Brace</Text> from Share menu</Text>
          <SvgXml style={tailwind('mt-0 sm:mt-4', safeAreaWidth)} width={'100%'} xml={saveLinkOnIos} />
        </React.Fragment>
      );
    } else {
      or = (
        <React.Fragment>
          <Text style={tailwind('mt-16 max-w-md text-base text-gray-600 font-normal text-center')}>Or tap <Text style={tailwind('text-base text-gray-600 font-semibold')}>Save to Brace</Text> from Share menu</Text>
          <SvgXml style={tailwind('mt-0 sm:mt-4', safeAreaWidth)} width={'100%'} xml={saveLinkOnAndroid} />
        </React.Fragment>
      );
    }

    return (
      <View style={tailwind('px-4 pb-6 items-center w-full md:px-6 lg:px-8', safeAreaWidth)}>
        <View style={cache('CP_emptyMyListView', [tailwind('px-4 pt-16 pb-8 items-center w-full max-w-md bg-gray-50'), BORDER_RADIUS])}>
          <SvgXml width={64} height={64} xml={undrawLink} />
          <Text style={tailwind('mt-6 text-base text-gray-600 font-normal text-center')}>Get started saving links</Text>
          <TouchableOpacity onPress={onAddBtnClick} style={[tailwind('mt-4 flex-row justify-center items-center bg-gray-800 rounded-full'), { paddingTop: 7, paddingBottom: 7, paddingLeft: 10, paddingRight: 13 }]}>
            <Svg style={tailwind('text-white font-normal')} width={12} height={10} viewBox="0 0 16 14" stroke="currentColor" fill="none">
              <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={tailwind('ml-1 text-base text-gray-50 font-medium')}>Save link</Text>
          </TouchableOpacity>
          {or}
        </View>
      </View>
    );
  }

  if (listName === TRASH) {
    return (
      <View style={tailwind('px-4 pb-6 items-center w-full md:px-6 lg:px-8', safeAreaWidth)}>
        <View style={tailwind('mt-6 justify-center items-center w-20 h-20 bg-gray-200 rounded-full')}>
          <Svg style={tailwind('text-gray-500 font-normal')} width={40} height={40} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-6 text-lg text-gray-800 font-medium text-center')}>No links in {displayName}</Text>
        <Text style={tailwind('mt-4 max-w-md text-base text-gray-500 font-normal text-center tracking-wide')}>Tap <Text style={tailwind('text-base text-gray-500 font-semibold')}>"Remove"</Text> from the menu to move links you don't need anymore here.</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('px-4 pb-6 items-center w-full md:px-6 lg:px-8', safeAreaWidth)}>
      <SvgXml style={tailwind('mt-10')} width={160} height={146.66} xml={emptyBox} />
      <Text style={tailwind('mt-6 text-lg text-gray-800 font-medium text-center')}>No links in {displayName}</Text>
      <Text style={tailwind('mt-2 max-w-md text-base text-gray-500 font-normal text-center tracking-wide')}>Tap <Text style={tailwind('text-base text-gray-500 font-semibold')}>{textName}</Text> from the menu to move links here.</Text>
    </View>
  );
};

export default React.memo(EmptyContent);
