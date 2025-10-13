import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import { addSelectedLinkIds, deleteSelectedLinkIds } from '../actions';
import {
  SD_HUB_URL, MAX_SELECTED_LINK_IDS, SD_MAX_SELECTED_LINK_IDS,
} from '../types/const';
import { makeIsLinkIdSelected, getSelectedLinkIdsLength } from '../selectors';
import { popupFMV } from '../types/animConfigs';

import { useTailwind } from '.';
import Text from './CustomText';

const ListItemSelector = (props) => {

  const { linkId } = props;
  const getIsLinkIdSelected = useMemo(makeIsLinkIdSelected, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isSelected = useSelector(state => getIsLinkIdSelected(state, props));
  const selectedLinkIdsLength = useSelector(state => getSelectedLinkIdsLength(state));
  const maxSelectedLinkIds = useSelector(state => {
    if (state.user.hubUrl === SD_HUB_URL) return SD_MAX_SELECTED_LINK_IDS;
    return MAX_SELECTED_LINK_IDS;
  });
  const [isMaxErrorShown, setIsMaxErrorShown] = useState(false);
  const [didMaxErrorCloseAnimEnd, setDidMaxErrorCloseAnimEnd] = useState(true);
  const maxErrorScale = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onSelectBtnClick = () => {
    if (!isSelected && selectedLinkIdsLength === maxSelectedLinkIds) {
      setIsMaxErrorShown(true);
      setDidMaxErrorCloseAnimEnd(false);
      return;
    }
    setIsMaxErrorShown(false);

    if (isSelected) dispatch(deleteSelectedLinkIds([linkId]));
    else dispatch(addSelectedLinkIds([linkId]));
  };

  const renderMaxError = () => {
    if (!isMaxErrorShown && didMaxErrorCloseAnimEnd) return null;

    const maxErrorStyle = {
      transform: [{
        scale: maxErrorScale.interpolate({
          inputRange: [0, 1], outputRange: [0.95, 1],
        }),
      }],
    };

    return (
      <Animated.View style={[tailwind('flex-row rounded-md bg-red-50 p-2 shadow'), maxErrorStyle]}>
        <View style={tailwind('flex-shrink-0')}>
          <Svg style={tailwind('font-normal text-red-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </Svg>
        </View>
        <View style={tailwind('ml-3 flex-shrink')}>
          <Text style={tailwind('text-left text-sm font-normal leading-5 text-red-800')}>To prevent network overload, up to {maxSelectedLinkIds} items can be selected.</Text>
        </View>
      </Animated.View>
    );
  };

  useEffect(() => {
    if (isMaxErrorShown) {
      Animated.timing(maxErrorScale, { toValue: 1, ...popupFMV.visible }).start();
    } else {
      Animated.timing(
        maxErrorScale, { toValue: 0, ...popupFMV.hidden }
      ).start(() => {
        requestAnimationFrame(() => {
          setDidMaxErrorCloseAnimEnd(true);
        });
      });
    }
  }, [isMaxErrorShown, maxErrorScale]);

  if (isMaxErrorShown && selectedLinkIdsLength < maxSelectedLinkIds) {
    setIsMaxErrorShown(false);
  }

  if (!isBulkEditing) return null;

  const circleClassNames = isSelected ? 'bg-gray-800 blk:border-gray-700' : 'bg-white blk:bg-gray-100';
  const svgClassNames = isSelected ? 'text-gray-50' : 'text-gray-400';

  return (
    <TouchableOpacity activeOpacity={1.0} onPress={onSelectBtnClick} style={tailwind('absolute inset-0 flex-row items-center bg-transparent')}>
      <View style={tailwind('h-full w-16 flex-shrink-0 flex-grow-0 items-center justify-center bg-white pl-px blk:bg-gray-900')}>
        <View style={tailwind(`h-10 w-10 items-center justify-center rounded-full border border-gray-200 ${circleClassNames}`)}>
          <Svg style={tailwind(`font-normal ${svgClassNames}`)} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
          </Svg>
        </View>
      </View>
      <View style={tailwind('h-full min-w-0 flex-1 flex-row items-center pl-3 sm:pl-4')}>
        {renderMaxError()}
      </View>
      <View style={tailwind('-mr-3 h-full w-3 flex-shrink-0 flex-grow-0 bg-transparent sm:-mr-1 sm:w-1')} />
    </TouchableOpacity>
  );
};

export default React.memo(ListItemSelector);
