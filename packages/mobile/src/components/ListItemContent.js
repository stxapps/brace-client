import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateBulkEdit, addSelectedLinkIds, moveLinks } from '../actions';
import {
  DOMAIN_NAME, COLOR, PATTERN, IMAGE, MY_LIST, ARCHIVE, TRASH, ADDING, MOVING, LG_WIDTH,
} from '../types/const';
import { makeGetPinStatus } from '../selectors';
import {
  removeTailingSlash, ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  extractUrl, isPinningStatus,
} from '../utils';
import cache from '../utils/cache';
import { PATTERN_MAP } from '../types/patternPaths';

import { useSafeAreaFrame, useTailwind } from '.';
import GracefulImage from './GracefulImage';
import CardItemMenuPopup from './CardItemMenuPopup';

const prependDomainName = (/** @type string */ value) => {
  if (value.startsWith('data:')) return value;
  return DOMAIN_NAME + value;
};

const ListItemContent = (props) => {

  const { link } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const listName = useSelector(state => state.display.listName);
  const pinStatus = useSelector(state => getPinStatus(state, link));
  const [extractedFaviconError, setExtractedFaviconError] = useState(false);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onLongPress = () => {
    dispatch(updateBulkEdit(true));
    dispatch(addSelectedLinkIds([link.id]));
  };

  const onArchiveBtnClick = () => {
    if (didClick.current) return;
    dispatch(moveLinks(ARCHIVE, [link.id]));
    didClick.current = true;
  };

  const onRemoveBtnClick = () => {
    if (didClick.current) return;
    dispatch(moveLinks(TRASH, [link.id]));
    didClick.current = true;
  };

  const onRestoreBtnClick = () => {
    if (didClick.current) return;
    dispatch(moveLinks(MY_LIST, [link.id]));
    didClick.current = true;
  };

  const onExtractedFaviconError = () => {
    setExtractedFaviconError(true);
  };

  useEffect(() => {
    didClick.current = false;
  }, [link.status]);

  const { url, decor, extractedResult } = link;
  const { host, origin } = extractUrl(url);

  const renderImage = () => {
    let image;
    if (extractedResult && extractedResult.image) image = extractedResult.image;

    if (image) {
      return <GracefulImage key="image-graceful-image-extracted-result" style={tailwind('w-full rounded bg-white aspect-7/12 shadow-xs blk:bg-gray-900')} contentStyle={tailwind('rounded')} source={cache(`CI_image_${image}`, { uri: image }, [image])} />;
    }

    // Only plain color background or plain color background with a letter
    if (decor.image.bg.type === COLOR) {
      return (
        <React.Fragment>
          <View style={tailwind(`w-full items-center justify-center rounded aspect-7/12 shadow-xs ${decor.image.bg.value}`)} />
        </React.Fragment>
      );
    }

    // Only pattern background or pattern background with a big letter
    if (decor.image.bg.type === PATTERN) {
      return (
        <View style={tailwind('w-full items-center justify-center rounded bg-white aspect-7/12 shadow-xs blk:bg-gray-900')}>
          <GracefulImage key="image-graceful-image-pattern" style={tailwind('absolute inset-0 rounded bg-white blk:bg-gray-900')} contentStyle={tailwind('rounded')} source={PATTERN_MAP[decor.image.bg.value]} />
        </View>
      );
    }

    // Random image
    if (decor.image.bg.type === IMAGE) {
      return <GracefulImage key="image-graceful-image-decor" style={tailwind('w-full rounded bg-white aspect-7/12 shadow-xs blk:bg-gray-900')} contentStyle={tailwind('rounded')} source={cache(`CI_decorImage_${decor.image.bg.value}`, { uri: prependDomainName(decor.image.bg.value) }, [decor.image.bg.value])} />;
    }

    throw new Error(`Invalid decor: ${JSON.stringify(decor)}`);
  };

  const renderFavicon = () => {

    const placeholder = () => {
      if (decor.favicon.bg.type === COLOR) {
        return <View style={tailwind(`h-4 w-4 flex-shrink-0 flex-grow-0 rounded-full ${decor.favicon.bg.value}`)} />;
      }

      if (decor.favicon.bg.type === PATTERN) {
        return (
          <GracefulImage key="favicon-graceful-image-pattern" style={tailwind('h-4 w-4 flex-shrink-0 flex-grow-0 rounded-full')} source={PATTERN_MAP[decor.favicon.bg.value]} />
        );
      }
    };

    let favicon;
    if (extractedResult && extractedResult.favicon) {
      favicon = ensureContainUrlSecureProtocol(extractedResult.favicon);
    }

    if (favicon && !extractedFaviconError) {
      return <GracefulImage key="favicon-graceful-image-extracted-result" style={tailwind('h-4 w-4 flex-shrink-0 flex-grow-0')} source={cache(`CI_favicon_${favicon}`, { uri: favicon }, [favicon])} customPlaceholder={placeholder} onError={onExtractedFaviconError} />;
    }

    favicon = removeTailingSlash(origin) + '/favicon.ico';
    favicon = ensureContainUrlSecureProtocol(favicon);

    return <GracefulImage key="favicon-graceful-image-ico" style={tailwind('h-4 w-4 flex-shrink-0 flex-grow-0')} source={cache(`CI_favicon_${favicon}`, { uri: favicon }, [favicon])} customPlaceholder={placeholder} />;
  };

  let title;
  if (extractedResult && extractedResult.title) {
    title = extractedResult.title;
  }
  if (!title) {
    title = url;
  }

  const isPinning = isPinningStatus(pinStatus);
  const canSelect = (
    safeAreaWidth >= LG_WIDTH && ![ADDING, MOVING].includes(link.status) && !isPinning
  );

  const canArchive = canSelect && ![ARCHIVE, TRASH].includes(listName);
  const canRemove = canSelect && listName !== TRASH;
  const canRestore = canSelect && listName === TRASH;

  return (
    <View style={tailwind('flex-row items-center')}>
      <View style={tailwind('w-16 flex-shrink-0 flex-grow-0 pl-px')}>
        <TouchableOpacity activeOpacity={1.0} onLongPress={onLongPress}>
          {renderImage()}
        </TouchableOpacity>
      </View>
      <View style={tailwind('min-w-0 flex-1 py-3.5 pl-3 sm:pl-4')}>
        <TouchableOpacity activeOpacity={1.0} onPress={() => Linking.openURL(ensureContainUrlProtocol(url))} >
          <Text style={tailwind('text-left text-sm font-semibold leading-5 text-gray-800 blk:text-gray-100')} numberOfLines={3} ellipsizeMode="tail">{title}</Text>
        </TouchableOpacity>
        <View style={tailwind('flex-row items-center justify-start pt-0.5')}>
          {renderFavicon()}
          <View style={tailwind('min-w-0 flex-shrink flex-grow')}>
            <TouchableOpacity activeOpacity={1.0} onPress={() => Linking.openURL(origin)} >
              <Text style={tailwind('pl-2 text-left text-sm font-normal text-gray-500 blk:text-gray-400')} numberOfLines={1} ellipsizeMode="tail">{host}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={tailwind('-mr-3 flex-shrink-0 flex-grow-0 flex-row items-center justify-end sm:-mr-1')}>
        {canArchive && <TouchableOpacity onPress={onArchiveBtnClick} style={tailwind('px-2.5 py-3.5')}>
          <Svg style={tailwind('font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M4 3C2.89543 3 2 3.89543 2 5C2 6.10457 2.89543 7 4 7H16C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3H4Z" />
            <Path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V8ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H9C8.44772 12 8 11.5523 8 11Z" />
          </Svg>
        </TouchableOpacity>}
        {canRemove && <TouchableOpacity onPress={onRemoveBtnClick} style={tailwind('px-2.5 py-3.5')}>
          <Svg style={tailwind('font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
          </Svg>
        </TouchableOpacity>}
        {canRestore && <TouchableOpacity onPress={onRestoreBtnClick} style={tailwind('px-2.5 py-3.5')}>
          <Svg style={tailwind('font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M14.8034 5.19398C11.9177 2.30766 7.26822 2.27141 4.33065 5.0721L3 3.66082V8.62218H7.6776L6.38633 7.25277C8.14886 5.56148 10.9471 5.58024 12.6821 7.31527C15.3953 10.0285 13.7677 14.9973 9.25014 14.9973V17.9974C11.5677 17.9974 13.384 17.2199 14.8034 15.8005C17.7322 12.8716 17.7322 8.12279 14.8034 5.19398V5.19398Z" />
          </Svg>
        </TouchableOpacity>}
        <CardItemMenuPopup link={link} />
      </View>
    </View>
  );
};

export default React.memo(ListItemContent);
