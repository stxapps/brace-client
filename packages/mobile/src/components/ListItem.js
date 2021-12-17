import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { retryDiedLinks, cancelDiedLinks } from '../actions';
import { ADDING, MOVING, SM_WIDTH } from '../types/const';
import { ensureContainUrlProtocol, isDiedStatus } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

import ListItemContent from './ListItemContent';
import ListItemSelector from './ListItemSelector';

const ListItem = (props) => {

  const { link } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const didClick = useRef(false);
  const dispatch = useDispatch();

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
        <View style={tailwind('absolute inset-0 bg-black opacity-75')} />
        <View style={tailwind('absolute inset-0 flex-row bg-transparent p-1')}>
          <View style={tailwind('flex-grow flex-shrink min-w-0 justify-center items-center')}>
            <Text style={tailwind('text-base text-white font-semibold text-center leading-5')}>{errMsg}</Text>
            <Text onPress={() => Linking.openURL(ensureContainUrlProtocol(url))} style={tailwind('mt-1 px-2 text-sm text-white font-medium text-center tracking-wide')}>Go to the link</Text>
          </View>
          <View style={tailwind('flex-grow-0 flex-shrink-0 flex-row')}>
            <TouchableOpacity onPress={onRetryRetryBtnClick} style={tailwind('justify-center items-center')}>
              <View style={tailwind('px-3 py-1 bg-white rounded-full border border-white')}>
                <Text style={tailwind('text-sm text-gray-500 font-medium')}>Retry</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRetryCancelBtnClick} style={tailwind('justify-center items-center sm:px-2', safeAreaWidth)}>
              <View style={tailwind('m-0.5 p-0.5 bg-tranparent')}>
                <Text style={tailwind('text-sm text-gray-100 font-medium')}>Cancel</Text>
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
      <View style={tailwind('absolute top-0 right-0 w-10 h-10 bg-transparent overflow-hidden')}>
        <View style={[tailwind('w-10 h-10 bg-gray-600 overflow-hidden'), triangleStyle]}>
          <Svg style={[tailwind('text-gray-100 font-normal'), svgStyle]} width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </Svg>
        </View>
      </View>
    );
  };

  const { status } = link;

  return (
    <View style={tailwind('bg-white border-b border-gray-200')}>
      <ListItemContent link={link} />
      {isDiedStatus(status) && renderRetry()}
      {[ADDING, MOVING].includes(status) && renderBusy()}
      {![ADDING, MOVING].includes(status) && <ListItemSelector linkId={link.id} />}
    </View>
  );
};

export default React.memo(ListItem);
