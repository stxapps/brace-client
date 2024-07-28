import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Linking,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import { Flow } from 'react-native-animated-spinkit';
import Svg, { Path } from 'react-native-svg';

import { addLink, cancelDiedLinks } from '../actions';
import {
  MY_LIST, ADDING, ADDED, DIED_ADDING, NO_URL, SHARE_BORDER_RADIUS, HTTP, HTTPS,
} from '../types/const';
import { isObject, isString, isArrayEqual, validateUrl, indexesOf } from '../utils';
import cache from '../utils/cache';

import { useSafeAreaFrame, useTailwind } from '.';

const MAX_ADDING_URLS = 3;

const RENDER_ADDING = 'RENDER_ADDING';
const RENDER_ADDED = 'RENDER_ADDED';
const RENDER_IN_OTHER_PROCESSING = 'RENDER_IN_OTHER_PROCESSING';
const RENDER_NOT_SIGNED_IN = 'RENDER_NOT_SIGNED_IN';
const RENDER_INVALID = 'RENDER_INVALID';
const RENDER_ERROR = 'RENDER_ERROR';

const getText = (files) => {
  if (!Array.isArray(files) || !isObject(files[0])) return '';

  const file = files[0];
  if (isString(file.weblink)) return file.weblink;
  if (isString(file.text)) return file.text;

  return '';
};

const getLinkFromAddingUrl = (addingUrl, links) => {
  if (!isString(addingUrl)) return null;

  for (const _id in links) {
    if (links[_id].url === addingUrl) {
      return links[_id];
    }
  }

  return null;
};

const TranslucentAdding = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const links = useSelector(state => state.links[MY_LIST]);
  const [type, setType] = useState(null);
  const [addingUrls, setAddingUrls] = useState(null);
  const didAddListener = useRef(false);
  const removeListener = useRef(null);
  const timeoutId = useRef(null);
  const tailwind = useTailwind();
  const dispatch = useDispatch();

  const updateType = useCallback((newType) => {
    if (newType !== type) setType(newType);
  }, [type, setType]);

  const updateAddingUrls = useCallback((newAddingUrls) => {
    if (!isArrayEqual(newAddingUrls, addingUrls)) setAddingUrls(newAddingUrls);
  }, [addingUrls, setAddingUrls]);

  const onReceivedFiles = useCallback((files) => {
    ReceiveSharingIntent.clearReceivedFiles();
    if (removeListener.current) {
      removeListener.current();
      removeListener.current = null;
    }

    // Strong assumption that this component is created to save links and then close,
    //  so ignore subsequent calls.
    if (Array.isArray(addingUrls)) return;

    let text = getText(files);
    text = text.trim();
    if (text.length === 0) {
      updateType(RENDER_INVALID);
      return;
    }

    const i1 = indexesOf(text, HTTP.slice(0, -1));
    const i2 = indexesOf(text, HTTPS.slice(0, -1));

    let indexes = [...new Set([...i1, ...i2])].sort();
    if (indexes[0] !== 0) indexes = [0, ...indexes];

    const pendingUrls = [];
    for (let i = 0; i < indexes.length; i++) {
      const s = indexes[i];
      const e = i + 1 < indexes.length ? indexes[i + 1] : text.length;
      const t = text.slice(s, e).trim();
      if (t.length > 0) pendingUrls.push(t);
    }

    const newAddingUrls = [];
    for (const pendingUrl of pendingUrls) {
      const urlValidateResult = validateUrl(pendingUrl);
      if (urlValidateResult === NO_URL) continue;

      newAddingUrls.push(pendingUrl);
      if (newAddingUrls.length >= MAX_ADDING_URLS) break;
    }

    let didDispatch = false, didExist = false;
    for (const addingUrl of newAddingUrls) {
      let link = getLinkFromAddingUrl(addingUrl, links);
      if (isObject(link) && link.status === DIED_ADDING) {
        dispatch(cancelDiedLinks([link.id]));
        link = null;
      }
      if (!isObject(link)) {
        dispatch(addLink(addingUrl, MY_LIST, false));
        didDispatch = true;
        continue;
      }

      didExist = true;
    }

    if (!didDispatch && !didExist) {
      updateType(RENDER_INVALID);
      return;
    }
    if (!didDispatch && didExist) {
      updateType(RENDER_IN_OTHER_PROCESSING);
      return;
    }

    updateType(RENDER_ADDING);
    updateAddingUrls(newAddingUrls);
  }, [links, addingUrls, updateType, updateAddingUrls, dispatch]);

  const onErrorReceivedFiles = useCallback(() => {
    updateType(RENDER_ERROR);
  }, [updateType]);

  const onBackgroundBtnClick = () => {
    if (type === RENDER_ADDED || type === RENDER_IN_OTHER_PROCESSING) {
      BackHandler.exitApp();
      return;
    }
  };

  useEffect(() => {
    return () => {
      ReceiveSharingIntent.clearReceivedFiles();
      if (removeListener.current) {
        removeListener.current();
        removeListener.current = null;
      }
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (![true, false].includes(isUserSignedIn)) return;

    if (isUserSignedIn === false) {
      updateType(RENDER_NOT_SIGNED_IN);
      return;
    }

    if (!Array.isArray(addingUrls)) {
      if (!didAddListener.current && !removeListener.current) {
        didAddListener.current = true;
        removeListener.current = ReceiveSharingIntent.getReceivedFiles(
          onReceivedFiles, onErrorReceivedFiles
        );
      }
      return;
    }

    for (const addingUrl of addingUrls) {
      const link = getLinkFromAddingUrl(addingUrl, links);
      if (!isObject(link)) {
        updateType(RENDER_ADDING);
        return;
      }
      if (link.status === ADDING) {
        updateType(RENDER_ADDING);
        return;
      }
      if (link.status === ADDED) {
        continue;
      }
      if (link.status === DIED_ADDING) {
        updateType(RENDER_ERROR);
        return;
      }
    }

    updateType(RENDER_ADDED);
    if (!timeoutId.current) {
      timeoutId.current = setTimeout(() => {
        BackHandler.exitApp();
      }, 2000);
    }
  }, [
    isUserSignedIn, links, addingUrls, updateType, onReceivedFiles, onErrorReceivedFiles,
  ]);

  const _render = (content) => {
    return (
      <View style={tailwind('flex-1 items-center justify-end sm:justify-center')}>
        <TouchableWithoutFeedback onPress={onBackgroundBtnClick}>
          <View style={tailwind('absolute inset-0 bg-black bg-opacity-50')} />
        </TouchableWithoutFeedback>
        {content}
      </View>
    );
  };

  const renderAdding = () => {
    const content = (
      <View style={cache('TA_addingView', [tailwind('mb-8 w-48 items-center bg-white p-4 shadow-sm'), SHARE_BORDER_RADIUS], [tailwind])}>
        <View style={tailwind('h-24 w-full items-center justify-center')}>
          <Flow size={56} color="rgb(156, 163, 175)" />
        </View>
        <Text style={tailwind('mt-2 w-full text-center text-base font-normal text-gray-600')}>Saving to <Text style={tailwind('text-lg font-semibold text-gray-800')}>Brace</Text></Text>
      </View>
    );

    return _render(content);
  };

  const renderAdded = () => {
    const content = (
      <View style={cache('TA_addedView', [tailwind('mb-8 w-48 items-center bg-white p-4 shadow-sm'), SHARE_BORDER_RADIUS], [tailwind])}>
        <View style={tailwind('h-24 w-full items-center justify-center')}>
          <Svg width={64} height={64} viewBox="0 0 96 96" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="rgb(74, 222, 128)" />
            <Path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="rgb(20, 83, 45)" />
          </Svg>
        </View>
        <Text style={tailwind('mt-2 w-full text-center text-base font-normal text-gray-600')}>Saved to <Text style={tailwind('text-lg font-semibold text-gray-800')}>Brace</Text></Text>
      </View>
    );

    return _render(content);
  };

  const renderInOtherProcessing = () => {
    const content = (
      <View style={cache('TA_inOtherProcessingView', [tailwind('mb-8 w-48 items-center bg-white p-4 shadow-sm'), SHARE_BORDER_RADIUS], [tailwind])}>
        <View style={tailwind('h-24 w-full items-center justify-center')}>
          <Svg width={64} height={64} viewBox="0 0 96 96" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="rgb(74, 222, 128)" />
            <Path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="rgb(20, 83, 45)" />
          </Svg>
        </View>
        <Text style={tailwind('mt-2 w-full text-center text-base font-normal text-gray-600')}>Already in <Text style={tailwind('text-lg font-semibold text-gray-800')}>Brace</Text></Text>
      </View>
    );

    return _render(content);
  };

  const renderNotSignedIn = () => {
    const content = (
      <View style={cache('TA_notSignedIn', [tailwind('mb-8 w-64 items-center bg-white p-4 shadow-sm'), SHARE_BORDER_RADIUS], [tailwind])}>
        <View style={tailwind('h-24 w-full items-center justify-center')}>
          <Svg style={tailwind('font-normal text-yellow-400')} width={64} height={64} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
          </Svg>
        </View>
        <Text style={tailwind('w-full text-center text-base font-normal text-gray-600')}>Please sign in first</Text>
        <TouchableOpacity onPress={() => Linking.openURL('bracedotto://app')} style={tailwind('mt-2 h-14 items-center justify-center')}>
          <View style={tailwind('items-center justify-center rounded-full border border-gray-400 bg-white px-4 py-2')}>
            <Text style={tailwind('text-sm font-normal text-gray-500')}>Sign in</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => BackHandler.exitApp()} style={tailwind('h-10 w-full items-center justify-end')}>
          <Text style={tailwind('text-sm font-normal text-gray-500')}>Close</Text>
        </TouchableOpacity>
      </View>
    );

    return _render(content);
  };

  const renderInvalid = () => {
    const content = (
      <View style={cache('TA_invalid', [tailwind('mb-8 w-72 items-center bg-white p-4 shadow-sm'), SHARE_BORDER_RADIUS], [tailwind])}>
        <View style={tailwind('h-24 w-full items-center justify-center')}>
          <Svg style={tailwind('font-normal text-red-500')} width={64} height={64} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
          </Svg>
        </View>
        <Text style={tailwind('w-full text-center text-base font-normal text-gray-600')}>No link found to save to Brace.</Text>
        <TouchableOpacity onPress={() => BackHandler.exitApp()} style={tailwind('mt-1 h-10 w-full items-center justify-end')}>
          <Text style={tailwind('text-sm font-normal text-gray-500')}>Close</Text>
        </TouchableOpacity>
      </View>
    );

    return _render(content);
  };

  const renderError = () => {
    const style = { height: Math.min(safeAreaHeight - 72, 336) };

    const content = (
      <View style={cache('TA_diedAdding', [tailwind('mb-8 bg-white shadow-sm'), style, SHARE_BORDER_RADIUS], [safeAreaHeight, tailwind])}>
        <ScrollView contentContainerStyle={tailwind('w-72 items-center p-4')}>
          <View style={tailwind('h-24 w-full items-center justify-center')}>
            <Svg style={tailwind('font-normal text-red-500')} width={64} height={64} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
          </View>
          <Text style={tailwind('mt-2 w-full text-center text-lg font-semibold text-gray-800')}>Oops..., something went wrong!</Text>
          <Text style={tailwind('mt-4 w-full text-center text-base font-normal text-gray-500')}>Please wait for a moment and try again. If the problem persists, please contact us.</Text>
          <TouchableOpacity onPress={() => BackHandler.exitApp()} style={tailwind('mt-3 h-10 w-full items-center justify-end')}>
            <Text style={tailwind('text-sm font-normal text-gray-500')}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );

    return _render(content);
  };

  if (type === RENDER_NOT_SIGNED_IN) return renderNotSignedIn();
  if (type === RENDER_INVALID) return renderInvalid();
  if (type === RENDER_ERROR) return renderError();
  if (type === RENDER_ADDED) return renderAdded();
  if (type === RENDER_IN_OTHER_PROCESSING) return renderInOtherProcessing();
  return renderAdding();
};

export default React.memo(TranslucentAdding);
