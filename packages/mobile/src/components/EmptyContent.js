import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updatePopup } from '../actions';
import { ADD_POPUP, MY_LIST, TRASH, ARCHIVE, BLK_MODE } from '../types/const';
import { getListNameMap, getThemeMode } from '../selectors';
import { getListNameDisplayName, getTagNameDisplayName } from '../utils';
import cache from '../utils/cache';

import { useTailwind } from '.';

import EmptyBox from '../images/empty-box-sided.svg';
import UndrawLink from '../images/undraw-link.svg';
import UndrawLinkBlk from '../images/undraw-link-blk.svg';
import SaveLinkOnIos from '../images/save-link-on-ios.svg';
import SaveLinkOnIosBlk from '../images/save-link-on-ios-blk.svg';
import SaveLinkOnAndroid from '../images/save-link-on-android.svg';
import SaveLinkOnAndroidBlk from '../images/save-link-on-android-blk.svg';

const BORDER_RADIUS = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  borderBottomRightRadius: 24,
  borderBottomLeftRadius: 24,
};

const EmptyContent = () => {

  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const listNameMap = useSelector(getListNameMap);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const searchString = useSelector(state => state.display.searchString);
  const themeMode = useSelector(state => getThemeMode(state));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onAddBtnClick = () => {
    dispatch(updatePopup(ADD_POPUP, true));
  };

  let displayName = getListNameDisplayName(listName, listNameMap);
  let textName = `"Move to -> ${displayName}"`;
  if (listName === ARCHIVE) textName = `"${displayName}"`;
  if (queryString) {
    // Only tag name for now
    const tagName = queryString.trim();
    displayName = getTagNameDisplayName(tagName, tagNameMap);
    textName = '"Add tags"';
  }

  if (searchString !== '') {
    return (
      <View style={tailwind('w-full px-4 pb-6 md:px-6 lg:px-8')}>
        <Text style={tailwind('text-base font-normal text-gray-600 blk:text-gray-300')}>Your search - <Text style={tailwind('text-lg font-medium text-gray-800 blk:text-gray-100')}>{searchString}</Text> - did not match any links.</Text>
        <Text style={tailwind('pt-4 text-base font-normal text-gray-500 blk:text-gray-400 md:pt-6')}>Suggestion:</Text>
        <View style={tailwind('pt-2 pl-2')}>
          <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{'\u2022'}  Make sure all words are spelled correctly.</Text>
          <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{'\u2022'}  Try different keywords.</Text>
          <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{'\u2022'}  Try more general keywords.</Text>
        </View>
      </View>
    );
  }

  if (queryString) {
    return (
      <View style={tailwind('w-full items-center px-4 pb-6 md:px-6 lg:px-8')}>
        <EmptyBox style={tailwind('mt-10')} width={160} height={146.66} />
        <Text style={tailwind('mt-6 text-center text-lg font-medium text-gray-800 blk:text-gray-200')}>No links in #{displayName}</Text>
        <Text style={tailwind('mt-2 max-w-md text-center text-base font-normal tracking-wide text-gray-500 blk:text-gray-400')}>Tap <Text style={tailwind('text-base font-semibold tracking-wide text-gray-500 blk:text-gray-400')}>{textName}</Text> from the menu to show links here.</Text>
      </View>
    );
  }

  if (listName === MY_LIST) {
    let or;
    if (Platform.OS === 'ios') {
      or = (
        <React.Fragment>
          <Text style={tailwind('mt-16 max-w-md text-center text-base font-normal text-gray-600 blk:text-gray-300')}>Or tap <Text style={tailwind('text-base font-semibold text-gray-600 blk:text-gray-300')}>Brace</Text> from Share menu</Text>
          {themeMode === BLK_MODE ? <SaveLinkOnIosBlk style={tailwind('mt-0 sm:mt-4')} width={'100%'} /> : <SaveLinkOnIos style={tailwind('mt-0 sm:mt-4')} width={'100%'} />}
        </React.Fragment>
      );
    } else {
      or = (
        <React.Fragment>
          <Text style={tailwind('mt-16 max-w-md text-center text-base font-normal text-gray-600 blk:text-gray-300')}>Or tap <Text style={tailwind('text-base font-semibold text-gray-600 blk:text-gray-300')}>Save to Brace</Text> from Share menu</Text>
          {themeMode === BLK_MODE ? <SaveLinkOnAndroidBlk style={tailwind('mt-0 sm:mt-4')} width={'100%'} /> : <SaveLinkOnAndroid style={tailwind('mt-0 sm:mt-4')} width={'100%'} />}
        </React.Fragment>
      );
    }

    return (
      <View style={tailwind('w-full items-center px-4 pb-6 md:px-6 lg:px-8')}>
        <View style={cache('CP_emptyMyListView', [tailwind('w-full max-w-md items-center bg-gray-50 px-4 pt-16 pb-8 blk:bg-gray-800'), BORDER_RADIUS], [tailwind])}>
          {themeMode === BLK_MODE ? <UndrawLinkBlk width={64} height={64} /> : <UndrawLink width={64} height={64} />}
          <Text style={tailwind('mt-6 text-center text-base font-normal text-gray-600 blk:text-gray-300')}>Get started saving links</Text>
          <TouchableOpacity onPress={onAddBtnClick} style={[tailwind('mt-4 flex-row items-center justify-center rounded-full bg-gray-800 blk:bg-gray-100'), { paddingTop: 7, paddingBottom: 7, paddingLeft: 10, paddingRight: 13 }]}>
            <Svg style={tailwind('font-normal text-white blk:text-gray-900')} width={12} height={10} viewBox="0 0 16 14" stroke="currentColor" fill="none">
              <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={tailwind('ml-1 text-base font-medium text-gray-50 blk:text-gray-800')}>Save link</Text>
          </TouchableOpacity>
          {or}
        </View>
      </View>
    );
  }

  if (listName === TRASH) {
    return (
      <View style={tailwind('w-full items-center px-4 pb-6 md:px-6 lg:px-8')}>
        <View style={tailwind('mt-6 h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={40} height={40} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-6 text-center text-lg font-medium text-gray-800 blk:text-gray-200')}>No links in {displayName}</Text>
        <Text style={tailwind('mt-4 max-w-md text-center text-base font-normal tracking-wide text-gray-500 blk:text-gray-400')}>Tap <Text style={tailwind('text-base font-semibold tracking-wide text-gray-500 blk:text-gray-400')}>"Remove"</Text> from the menu to move links you don't need anymore here.</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('w-full items-center px-4 pb-6 md:px-6 lg:px-8')}>
      <EmptyBox style={tailwind('mt-10')} width={160} height={146.66} />
      <Text style={tailwind('mt-6 text-center text-lg font-medium text-gray-800 blk:text-gray-200')}>No links in {displayName}</Text>
      <Text style={tailwind('mt-2 max-w-md text-center text-base font-normal tracking-wide text-gray-500 blk:text-gray-400')}>Tap <Text style={tailwind('text-base font-semibold tracking-wide text-gray-500 blk:text-gray-400')}>{textName}</Text> from the menu to move links here.</Text>
    </View>
  );
};

export default React.memo(EmptyContent);
