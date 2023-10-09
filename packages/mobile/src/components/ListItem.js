import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { retryDiedLinks, cancelDiedLinks } from '../actions';
import { ADDING, MOVING, UPDATING, SM_WIDTH, PINNED } from '../types/const';
import { makeGetPinStatus, makeGetTagStatus } from '../selectors';
import {
  ensureContainUrlProtocol, isDiedStatus, isPinningStatus, isTaggingStatus,
} from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';
import ListItemContent from './ListItemContent';
import ListItemSelector from './ListItemSelector';

const ListItem = (props) => {

  const { link } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const getTagStatus = useMemo(makeGetTagStatus, []);
  const pinStatus = useSelector(state => getPinStatus(state, link));
  const tagStatus = useSelector(state => getTagStatus(state, link));
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onRetryRetryBtnClick = () => {
    if (didClick.current) return;
    dispatch(retryDiedLinks([link.id]));
    didClick.current = true;
  };

  const onRetryCancelBtnClick = () => {
    dispatch(cancelDiedLinks([link.id]));
  };

  useEffect(() => {
    didClick.current = false;
  }, [link.status]);

  const renderRetry = () => {
    const { url } = link;
    const errMsg = safeAreaWidth < SM_WIDTH ? 'Something went wrong!' : 'Oops..., something went wrong!';

    return (
      <React.Fragment>
        <View style={tailwind('absolute inset-0 bg-black bg-opacity-75')} />
        <View style={tailwind('absolute inset-0 flex-row bg-transparent p-1')}>
          <View style={tailwind('min-w-0 flex-shrink flex-grow items-center justify-center')}>
            <Text style={tailwind('text-center text-base font-semibold leading-5 text-white')}>{errMsg}</Text>
            <Text onPress={() => Linking.openURL(ensureContainUrlProtocol(url))} style={tailwind('mt-1 px-2 text-center text-sm font-medium tracking-wide text-white')}>Go to the link</Text>
          </View>
          <View style={tailwind('flex-shrink-0 flex-grow-0 flex-row')}>
            <TouchableOpacity onPress={onRetryRetryBtnClick} style={tailwind('items-center justify-center')}>
              <View style={tailwind('rounded-full border border-white bg-white px-3 py-1')}>
                <Text style={tailwind('text-sm font-medium text-gray-500')}>Retry</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRetryCancelBtnClick} style={tailwind('items-center justify-center sm:px-2')}>
              <View style={tailwind('m-0.5 bg-transparent p-0.5')}>
                <Text style={tailwind('text-sm font-medium text-gray-100')}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </React.Fragment>
    );
  };

  const renderBusy = () => {
    const triangleStyle = {
      transform: [{ 'translateX': 20 }, { 'translateY': -20 }, { 'rotate': '45deg' }],
    };
    const svgStyle = {
      top: 42,
      left: 20,
      transform: [{ 'translateX': -8 }, { 'translateY': -16 }, { 'rotate': '-45deg' }],
    };

    return (
      <View style={tailwind('absolute top-0 right-0 h-10 w-10 overflow-hidden bg-transparent')}>
        <View style={[tailwind('h-10 w-10 overflow-hidden bg-gray-600 blk:bg-gray-300'), triangleStyle]}>
          <Svg style={[tailwind('font-normal text-gray-100 blk:text-gray-800'), svgStyle]} width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </Svg>
        </View>
      </View>
    );
  };

  const renderPinning = () => {
    const triangleStyle = {
      transform: [{ 'translateX': -20 }, { 'translateY': -20 }, { 'rotate': '45deg' }],
    };
    const svgStyle = {
      top: 28,
      left: 34,
      transform: [{ 'translateX': -8 }, { 'translateY': -16 }, { 'rotate': '-45deg' }],
    };

    return (
      <View style={tailwind('absolute top-0 left-0 h-10 w-10 overflow-hidden bg-transparent')}>
        <View style={[tailwind('h-10 w-10 overflow-hidden bg-gray-600 blk:bg-gray-300'), triangleStyle]}>
          <Svg style={[tailwind('font-normal text-gray-100 blk:text-gray-800'), svgStyle]} width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </Svg>
        </View>
      </View>
    );
  };

  const renderPin = () => {
    const triangleStyle = {
      transform: [{ 'translateX': -20 }, { 'translateY': -20 }, { 'rotate': '45deg' }],
    };
    const svgStyle = {
      top: 27,
      left: 32,
      transform: [{ 'translateX': -6 }, { 'translateY': -12 }, { 'rotate': '-45deg' }],
    };

    return (
      <View style={tailwind('absolute top-0 left-0 h-10 w-10 overflow-hidden bg-transparent')}>
        <View style={[tailwind('h-10 w-10 overflow-hidden bg-gray-600 blk:bg-gray-300'), triangleStyle]}>
          <Svg style={[tailwind('font-normal text-gray-100 blk:text-gray-600'), svgStyle]} width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M20.2349 14.61C19.8599 12.865 17.8929 11.104 16.2249 10.485L15.6809 5.53698L17.1759 3.29498C17.3329 3.05898 17.3479 2.75698 17.2129 2.50798C17.0789 2.25798 16.8209 2.10498 16.5379 2.10498H7.39792C7.11392 2.10498 6.85592 2.25898 6.72192 2.50798C6.58792 2.75798 6.60192 3.06098 6.75992 3.29598L8.25792 5.54298L7.77392 10.486C6.10592 11.106 4.14092 12.866 3.76992 14.602C3.72992 14.762 3.75392 15.006 3.90192 15.196C4.00492 15.328 4.20592 15.486 4.58192 15.486H8.63992L11.5439 22.198C11.6219 22.382 11.8039 22.5 12.0019 22.5C12.1999 22.5 12.3819 22.382 12.4619 22.198L15.3649 15.485H19.4219C19.7979 15.485 19.9979 15.329 20.1019 15.199C20.2479 15.011 20.2739 14.765 20.2369 14.609L20.2349 14.61Z" />
          </Svg>
        </View>
      </View>
    );
  };

  const { status } = link;

  const isPinning = isPinningStatus(pinStatus);
  const isTagging = isTaggingStatus(tagStatus);
  const canSelect = (
    ![ADDING, MOVING, UPDATING].includes(status) && !isPinning && !isTagging
  );

  return (
    <View style={tailwind('border-b border-gray-200 bg-white blk:border-gray-700 blk:bg-gray-900')}>
      <ListItemContent link={link} pinStatus={pinStatus} tagStatus={tagStatus} />
      {[ADDING, MOVING, UPDATING].includes(status) && renderBusy()}
      {isPinning && renderPinning()}
      {isTagging && renderBusy()}
      {[PINNED].includes(pinStatus) && renderPin()}
      {canSelect && <ListItemSelector linkId={link.id} />}
      {isDiedStatus(status) && renderRetry()}
    </View>
  );
};

export default React.memo(ListItem);
