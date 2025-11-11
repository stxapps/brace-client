import React, { useEffect, useCallback, useRef } from 'react';
import { ScrollView, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter, ExternalPathString } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import Svg, { Path } from 'react-native-svg';
import { Flow } from 'react-native-animated-spinkit';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  initLinkEditor, updateLinkEditor, addLinkFromAdding, cancelDiedLinks,
  updateSelectingListName, updateListNamesMode,
} from '../actions/chunk';
import {
  ADDED, DIED_ADDING, NO_URL, BLK_MODE, SHOW_BLANK, ADD_MODE_BASIC, ADD_MODE_ADVANCED,
  LIST_NAMES_POPUP, LIST_NAMES_MODE_ADD_LINK, LIST_NAMES_ANIM_TYPE_POPUP, URL_MSGS,
} from '../types/const';
import { getThemeMode } from '../selectors';
import {
  isObject, isString, isFldStr, validateUrl, getRect, adjustRect, toPx,
  getListNameDisplayName,
} from '../utils';
import { selectHint, deselectValue, addTagName, renameKeys } from '../utils/tag';

import { useSafeAreaFrame, useKeyboardHeight, useTailwind } from '.';
import TopBar from './TopBar';
import GlobalPopups from './GlobalPopups';
import Text from './CustomText';
import TextInput from './CustomTextInput';

const RENDER_ADDING = 'RENDER_ADDING';
const RENDER_ADDED = 'RENDER_ADDED';
const RENDER_NOT_SIGNED_IN = 'RENDER_NOT_SIGNED_IN';
const RENDER_INVALID = 'RENDER_INVALID';
const RENDER_ERROR = 'RENDER_ERROR';
const RENDER_EDITOR = 'RENDER_EDITOR';

const getText = (intent) => {
  if (!isObject(intent)) return '';

  if (isString(intent.webUrl)) return intent.webUrl.trim();
  if (isString(intent.text)) return intent.text.trim();

  return '';
};

const getLinkFromAddingUrl = (listName, addingUrl, linksPerLn) => {
  if (!isString(addingUrl)) return null;
  if (!isObject(linksPerLn[listName])) return null;

  for (const id in linksPerLn[listName]) {
    if (linksPerLn[listName][id].url === addingUrl) {
      return linksPerLn[listName][id];
    }
  }

  return null;
};

const Adding = () => {
  const {
    isReady, hasShareIntent, shareIntent, error, resetShareIntent,
  } = useShareIntentContext();
  const { height: safeAreaHeight } = useSafeAreaFrame();
  const keyboardHeight = useKeyboardHeight(Platform.OS === 'android');
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const linksPerLn = useSelector(state => state.links);
  const linkEditor = useSelector(state => state.linkEditor);
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const themeMode = useSelector(state => getThemeMode(state));
  const timeId = useRef(null);
  const intEdtLink = useRef(null);
  const rndEdtLink = useRef(null);
  const fnlEdtLink = useRef(null);
  const dpcdLinks = useRef([]);
  const listNameBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();
  const router = useRouter();

  const innerProcessLink = useCallback((linksPerLn, linkEditor, dispatch) => {
    const addingUrl = linkEditor.url;
    const listName = linkEditor.listName;

    let link = getLinkFromAddingUrl(listName, addingUrl, linksPerLn);
    if (isObject(link) && link.status === DIED_ADDING) {
      dispatch(cancelDiedLinks([link.id]));
      link = null;
    }
    if (!isObject(link)) {
      if (!dpcdLinks.current.includes(addingUrl)) {
        dispatch(addLinkFromAdding());
        dpcdLinks.current.push(addingUrl);
      }

      dispatch(updateLinkEditor({ addingType: RENDER_ADDING }, true));
      return;
    }

    if (link.status === ADDED) {
      dispatch(updateLinkEditor({ addingType: RENDER_ADDED }, true));
      return;
    }
    if (link.status === DIED_ADDING) {
      dispatch(updateLinkEditor({ addingType: RENDER_ERROR }, true));
      return;
    }
  }, []);

  const processLink = useCallback(async () => {
    if (![true, false].includes(isUserSignedIn)) return;

    if (isUserSignedIn === false) {
      const newValues = { addingType: RENDER_NOT_SIGNED_IN };
      dispatch(updateLinkEditor(newValues, true));
      return;
    }

    if (isReady !== true) return;
    if (error) {
      const newValues = { addingType: RENDER_ERROR };
      dispatch(updateLinkEditor(newValues, true));
      return;
    }

    const addingUrl = getText(shareIntent);
    if (addingUrl.length === 0) {
      timeId.current = setTimeout(() => {
        const newValues = { addingType: RENDER_INVALID };
        dispatch(updateLinkEditor(newValues, true));
      }, 3000);
      return;
    }

    if (intEdtLink.current !== addingUrl) {
      dispatch(initLinkEditor(true));
      dispatch(updateLinkEditor({ url: addingUrl }, true));
      intEdtLink.current = addingUrl;
      return;
    }
    if (linkEditor.mode === ADD_MODE_BASIC) {
      innerProcessLink(linksPerLn, linkEditor, dispatch);
      return;
    }
    if (linkEditor.mode === ADD_MODE_ADVANCED) {
      if (rndEdtLink.current !== addingUrl) {
        const newValues = { addingType: RENDER_EDITOR };
        dispatch(updateLinkEditor(newValues, true));
        rndEdtLink.current = addingUrl;
        return;
      }
      if (fnlEdtLink.current === linkEditor.url) {
        innerProcessLink(linksPerLn, linkEditor, dispatch);
        return;
      }
      return;
    }

    console.log('Invalid mode', linkEditor);
  }, [
    isReady, shareIntent, error, isUserSignedIn, linksPerLn, linkEditor,
    innerProcessLink, dispatch,
  ]);

  const onResetBtnClick = () => {
    if (hasShareIntent) resetShareIntent();
    else router.replace('/' as ExternalPathString);
  };

  const onAddInputChange = (e) => {
    dispatch(updateLinkEditor(
      { url: e.nativeEvent.text, isAskingConfirm: false }
    ));
  };

  const onAddInputKeyPress = () => {
    onAddOkBtnClick();
  };

  const onAddOkBtnClick = () => {
    const addingUrl = linkEditor.url.trim();
    const urlValidatedResult = validateUrl(addingUrl);
    if (urlValidatedResult === NO_URL) {
      dispatch(updateLinkEditor(
        { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: false }
      ));
      return;
    }

    fnlEdtLink.current = linkEditor.url;
    processLink();
  };

  const onListNameBtnClick = () => {
    listNameBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateSelectingListName(linkEditor.listName));
      dispatch(updateListNamesMode(
        LIST_NAMES_MODE_ADD_LINK, LIST_NAMES_ANIM_TYPE_POPUP,
      ));

      const rect = getRect(x, y, width, height);
      const nRect = adjustRect(
        rect, toPx('-0.25rem'), toPx('-0.25rem'), toPx('0.5rem'), toPx('0.5rem')
      );
      dispatch(updatePopup(LIST_NAMES_POPUP, true, nRect));
    });
  };

  const onTagHintSelect = (hint) => {
    if (didClick.current) return;
    didClick.current = true;

    const { tagValues, tagHints } = linkEditor;
    const payload = renameKeys(selectHint(tagValues, tagHints, hint));
    dispatch(updateLinkEditor(payload));
  };

  const onTagValueDeselect = (value) => {
    if (didClick.current) return;
    didClick.current = true;

    const { tagValues, tagHints } = linkEditor;
    const payload = renameKeys(deselectValue(tagValues, tagHints, value));
    dispatch(updateLinkEditor(payload));
  };

  const onTagDnInputChange = (e) => {
    dispatch(updateLinkEditor({ tagDisplayName: e.nativeEvent.text }));
  };

  const onTagDnInputKeyPress = () => {
    onTagAddBtnClick();
  };

  const onTagAddBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;

    const { tagValues, tagHints, tagDisplayName, tagColor } = linkEditor;
    const payload = renameKeys(addTagName(
      tagNameMap, tagValues, tagHints, tagDisplayName, tagColor
    ));
    dispatch(updateLinkEditor(payload));
  };

  useEffect(() => {
    processLink();

    return () => {
      clearTimeout(timeId.current);
    };
  }, [processLink]);

  useEffect(() => {
    didClick.current = false;
  }, [linkEditor]);

  const _render = (content) => {
    const canvasStyle = { paddingBottom: keyboardHeight };
    const style = { paddingTop: Math.max((safeAreaHeight - 48 - 280) / 2.5, 24) };

    return (
      <React.Fragment>
        <View style={[tailwind('flex-1 bg-white blk:bg-gray-900'), canvasStyle]}>
          <ScrollView style={tailwind('flex-1')} contentContainerStyle={[tailwind('flex-grow bg-white blk:bg-gray-900')]} automaticallyAdjustKeyboardInsets={true} keyboardShouldPersistTaps="handled">
            <TopBar rightPane={SHOW_BLANK} doSupportTheme={true} />
            <View style={[tailwind('items-center justify-start'), style]}>
              <View style={tailwind('w-full max-w-md items-center px-4 pb-8 md:px-6 lg:px-8')}>
                {content}
              </View>
            </View>
          </ScrollView>
        </View>
        <GlobalPopups />
      </React.Fragment>
    );
  };

  const renderNav = (doHide = false) => {
    let rightText = 'Go to Welcome >';
    if (isUserSignedIn) rightText = 'Go to My List >';
    if (doHide) rightText = '';

    let rightLink = (
      <TouchableOpacity onPress={onResetBtnClick} disabled={doHide}>
        <Text style={tailwind('text-right text-base font-medium text-gray-500 blk:text-gray-300')}>{rightText}</Text>
      </TouchableOpacity>
    );

    return (
      <View style={tailwind('mt-16 w-full items-end')}>
        {rightLink}
      </View>
    );
  };

  const renderAdding = () => {
    const text = getText(shareIntent);

    const content = (
      <>
        <View style={tailwind('h-24 w-full items-center justify-center')}>
          <Flow size={56} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(156, 163, 175)'} />
        </View>
        {text.length > 0 && <View style={tailwind('mt-5 w-full max-w-xs items-center')}>
          <Text style={tailwind('text-center text-base font-normal text-gray-500 blk:text-gray-400')} numberOfLines={3} ellipsizeMode="tail">{text}</Text>
          <Text style={tailwind('mt-1 text-lg font-semibold text-gray-900 blk:text-gray-50')}>is being saved.</Text>
        </View>}
        {renderNav(true)}
      </>
    );

    return _render(content);
  };

  const renderAdded = () => {
    const text = getText(shareIntent);

    const content = (
      <>
        <View style={tailwind('w-full items-center justify-center')}>
          <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="rgb(74, 222, 128)" />
            <Path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="rgb(20, 83, 45)" />
          </Svg>
        </View>
        <View style={tailwind('mt-5 w-full max-w-xs items-center')}>
          <Text style={tailwind('text-center text-base font-normal text-gray-500 blk:text-gray-400')} numberOfLines={3} ellipsizeMode="tail">{text}</Text>
          <Text style={tailwind('mt-1 text-lg font-semibold text-gray-900 blk:text-gray-50')}>has been saved.</Text>
        </View>
        {renderNav()}
      </>
    );

    return _render(content);
  };

  const renderNotSignedIn = () => {
    const content = (
      <>
        <View style={tailwind('w-full items-center justify-center')}>
          <Svg style={tailwind('font-normal text-yellow-400')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-5 w-full text-center text-base font-normal text-gray-500 blk:text-gray-400')}>Please sign in first</Text>
        {renderNav()}
      </>
    );

    return _render(content);
  };

  const renderInvalid = () => {
    const content = (
      <>
        <View style={tailwind('w-full items-center justify-center')}>
          <Svg style={tailwind('font-normal text-red-500')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-5 w-full text-center text-base font-normal text-gray-500 blk:text-gray-400')}>No link found to save to Brace</Text>
        {renderNav()}
      </>
    );

    return _render(content);
  };

  const renderError = () => {
    const content = (
      <>
        <View style={tailwind('w-full items-center justify-center')}>
          <Svg style={tailwind('font-normal text-red-500')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-2 w-full text-center text-lg font-semibold text-gray-800 blk:text-gray-100')}>Oops..., something went wrong!</Text>
        <Text style={tailwind('mt-4 w-full text-center text-base font-normal text-gray-500 blk:text-gray-400')}>Please wait for a moment and try again. If the problem persists, please contact us.</Text>
        {renderNav()}
      </>
    );

    return _render(content);
  };

  const renderEditor = () => {
    let displayName = null;
    if (isFldStr(linkEditor.listName)) {
      displayName = getListNameDisplayName(linkEditor.listName, listNameMap);
    }

    let tagDesc = null;
    if (linkEditor.tagHints.length === 0) {
      tagDesc = (
        <React.Fragment>Enter a new tag and press +Add.</React.Fragment>
      );
    } else {
      tagDesc = (
        <React.Fragment>Enter a new tag or select below.</React.Fragment>
      );
    }

    const inputClassNames = Platform.OS === 'ios' ? 'py-1.5 leading-5' : 'py-1';

    const tagInputStyle: any = { paddingVertical: Platform.OS === 'ios' ? 6 : 5.5 };
    if (Platform.OS === 'ios') tagInputStyle.lineHeight = 18;

    const content = (
      <View style={tailwind('w-full max-w-82 pb-38 md:pb-46')}>
        <View style={tailwind('w-full items-center justify-center')}>
          <View style={tailwind('h-24 w-24 flex items-center justify-center bg-gray-200 rounded-full blk:bg-gray-700')}>
            <Svg style={tailwind('font-normal text-gray-400 blk:text-gray-400')} width={40} height={40} viewBox="0 0 20 20" fill="currentColor">
              <Path d="M13.586 3.58601C13.7705 3.39499 13.9912 3.24262 14.2352 3.13781C14.4792 3.03299 14.7416 2.97782 15.0072 2.97551C15.2728 2.9732 15.5361 3.0238 15.7819 3.12437C16.0277 3.22493 16.251 3.37343 16.4388 3.56122C16.6266 3.74901 16.7751 3.97231 16.8756 4.2181C16.9762 4.46389 17.0268 4.72725 17.0245 4.99281C17.0222 5.25837 16.967 5.52081 16.8622 5.76482C16.7574 6.00883 16.605 6.22952 16.414 6.41401L15.621 7.20701L12.793 4.37901L13.586 3.58601ZM11.379 5.79301L3 14.172V17H5.828L14.208 8.62101L11.378 5.79301H11.379Z" />
            </Svg>
          </View>
        </View>
        <View style={tailwind('flex-row items-center justify-start pt-8')}>
          <Text style={tailwind('flex-none text-sm font-normal text-gray-500 blk:text-gray-300')}>Url:</Text>
          <TextInput onChange={onAddInputChange} onSubmitEditing={onAddInputKeyPress} style={tailwind(`ml-3 flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-base font-normal text-gray-700 blk:border-gray-600 blk:bg-gray-800 blk:text-gray-200 ${inputClassNames}`)} keyboardType="url" placeholder="https://" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={linkEditor.url} autoCapitalize="none" />
        </View>
        <View style={tailwind('mt-6 border-t border-gray-200 blk:border-gray-700')} />
        <View style={tailwind('flex-row items-center justify-start pt-3.5')}>
          <Text style={tailwind('w-12 flex-shrink-0 flex-grow-0 text-sm font-normal text-gray-500 blk:text-gray-300')}>List:</Text>
          <TouchableOpacity ref={listNameBtn} onPress={onListNameBtnClick} style={tailwind('flex-shrink flex-row items-center rounded-md bg-white py-1 blk:bg-gray-900')}>
            <Text style={tailwind('flex-shrink text-base font-normal text-gray-700 blk:text-gray-100')} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-600 blk:text-gray-200')} width={20} height={20} viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <Path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>
        <View style={tailwind('flex-row items-start justify-start pt-1')}>
          <View style={tailwind('flex-row items-center justify-start flex-shrink-0 flex-grow-0 h-13 w-12')}>
            <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Tags:</Text>
          </View>
          <View style={tailwind('flex-shrink flex-grow')}>
            {linkEditor.tagValues.length === 0 && <View style={tailwind('flex-row min-h-13 items-center justify-start')}>
              <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{tagDesc}</Text>
            </View>}
            {linkEditor.tagValues.length > 0 && <View style={tailwind('flex-row min-h-13 flex-wrap items-start justify-start pt-2.5')}>
              {linkEditor.tagValues.map((value, i) => {
                return (
                  <View key={`TagEditorValue-${value.tagName}`} style={tailwind(`mb-2 max-w-full flex-row items-center justify-start rounded-full bg-gray-100 pl-3 blk:bg-gray-700 ${i === 0 ? '' : 'ml-2'}`)}>
                    <Text style={tailwind('flex-shrink flex-grow-0 text-sm font-normal text-gray-600 blk:text-gray-300')} numberOfLines={1} ellipsizeMode="tail">{value.displayName}</Text>
                    <TouchableOpacity onPress={() => onTagValueDeselect(value)} style={tailwind('ml-1 flex-shrink-0 flex-grow-0 items-center justify-center rounded-full py-1.5 pr-1.5')}>
                      <Svg style={tailwind('rounded-full font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                        <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>}
            {linkEditor.tagMsg && <Text style={tailwind('text-sm font-normal text-red-500')}>{linkEditor.tagMsg}</Text>}
            <View style={tailwind(`flex-row items-center justify-start ${linkEditor.tagMsg ? 'pt-0.5' : 'pt-1'}`)}>
              <TextInput onChange={onTagDnInputChange} onSubmitEditing={onTagDnInputKeyPress} style={[tailwind('flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-sm font-normal text-gray-700 blk:border-gray-500 blk:bg-gray-900 blk:text-gray-200'), tagInputStyle]} placeholder="Add a new tag" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={linkEditor.tagDisplayName} />
              <TouchableOpacity onPress={onTagAddBtnClick} style={[tailwind('ml-2 flex-shrink-0 flex-grow-0 flex-row items-center rounded-full border border-gray-400 bg-white pl-1.5 pr-2.5 blk:border-gray-500 blk:bg-gray-900'), { paddingVertical: 5 }]}>
                <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
                  <Path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </Svg>
                <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Add</Text>
              </TouchableOpacity>
            </View>
            {linkEditor.tagHints.length > 0 && <View style={tailwind('flex-row flex-wrap items-center justify-start pt-3.5')}>
              <Text style={tailwind('mb-2 text-sm font-normal text-gray-500 blk:text-gray-400')}>Hint:</Text>
              {linkEditor.tagHints.map(hint => {
                return (
                  <TouchableOpacity key={`TagEditorHint-${hint.tagName}`} onPress={() => onTagHintSelect(hint)} style={tailwind('ml-2 mb-2 max-w-full rounded-full bg-gray-100 px-3 py-1.5 blk:bg-gray-700')} disabled={hint.isBlur}>
                    <Text style={tailwind(`text-sm font-normal ${hint.isBlur ? 'text-gray-400 blk:text-gray-500' : 'text-gray-600 blk:text-gray-300'}`)} numberOfLines={1} ellipsizeMode="tail">{hint.displayName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>}
          </View>
        </View>
        <View style={tailwind('mt-6 border-t border-gray-200 blk:border-gray-700')} />
        {linkEditor.msg !== '' && <Text style={tailwind('mt-2 text-sm font-normal text-red-500')}>{linkEditor.msg}</Text>}
        <View style={tailwind(`flex-row items-center justify-start ${linkEditor.msg !== '' ? 'pt-2' : 'pt-5'}`)}>
          <TouchableOpacity onPress={onAddOkBtnClick} style={[tailwind('items-center justify-center rounded-full bg-gray-800 px-4 blk:bg-gray-100'), { paddingTop: 7, paddingBottom: 7 }]}>
            <Text style={tailwind('text-sm font-medium text-gray-50 blk:text-gray-800')}>{linkEditor.isAskingConfirm ? 'Sure' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onResetBtnClick} style={tailwind('ml-2 rounded-md px-2.5 py-1.5')}>
            <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    return _render(content);
  };

  const { addingType } = linkEditor;
  if (addingType === RENDER_NOT_SIGNED_IN) return renderNotSignedIn();
  if (addingType === RENDER_INVALID) return renderInvalid();
  if (addingType === RENDER_ERROR) return renderError();
  if (addingType === RENDER_ADDED) return renderAdded();
  if (addingType === RENDER_ADDING) return renderAdding();
  if (addingType === RENDER_EDITOR) return renderEditor();
  return null;
};

export default React.memo(Adding);
