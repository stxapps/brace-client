import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { MAX_SELECTED_LINK_IDS } from '../types/const';
import { addSelectedLinkIds, deleteSelectedLinkIds } from '../actions';
import { makeIsLinkIdSelected, getSelectedLinkIdsLength } from '../selectors';
import { tailwind } from '../stylesheets/tailwind';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame } from '.';

const ListItemSelector = (props) => {

  const { linkId } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getIsLinkIdSelected = useMemo(makeIsLinkIdSelected, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isSelected = useSelector(state => getIsLinkIdSelected(state, props));
  const selectedLinkIdsLength = useSelector(state => getSelectedLinkIdsLength(state));
  const [isMaxErrorShown, setIsMaxErrorShown] = useState(false);
  const [didMaxErrorCloseAnimEnd, setDidMaxErrorCloseAnimEnd] = useState(true);
  const maxErrorScale = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  const onSelectBtnClick = () => {
    if (!isSelected && selectedLinkIdsLength === MAX_SELECTED_LINK_IDS) {
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
      <Animated.View style={[tailwind('flex-row bg-red-50 rounded-md p-2 shadow'), maxErrorStyle]}>
        <View style={tailwind('flex-shrink-0')}>
          <Svg style={tailwind('text-red-400 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </Svg>
        </View>
        <View style={tailwind('flex-shrink ml-3')}>
          <Text style={tailwind('text-sm text-red-800 font-normal text-left leading-5')}>To prevent network overload, up to {MAX_SELECTED_LINK_IDS} items can be selected.</Text>
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
        setDidMaxErrorCloseAnimEnd(true);
      });
    }
  }, [isMaxErrorShown, maxErrorScale]);

  if (isMaxErrorShown && selectedLinkIdsLength < MAX_SELECTED_LINK_IDS) {
    setIsMaxErrorShown(false);
  }

  if (!isBulkEditing) return null;

  const circleClassNames = isSelected ? 'bg-gray-800' : 'bg-white';
  const svgClassNames = isSelected ? 'text-gray-50' : 'text-gray-400';

  return (
    <TouchableOpacity activeOpacity={1.0} onPress={onSelectBtnClick} style={tailwind('absolute inset-0 flex-row items-center bg-transparent')}>
      <View style={tailwind('flex-grow-0 flex-shrink-0 w-16 h-full bg-white pl-px justify-center items-center')}>
        <View style={tailwind(`w-10 h-10 border border-gray-200 rounded-full justify-center items-center ${circleClassNames}`)}>
          <Svg style={tailwind(`${svgClassNames} font-normal`)} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
          </Svg>
        </View>
      </View>
      <View style={tailwind('flex-1 min-w-0 h-full pl-3 flex-row items-center sm:pl-4', safeAreaWidth)}>
        {renderMaxError()}
      </View>
      <View style={tailwind('flex-grow-0 flex-shrink-0 w-3 h-full bg-transparent -mr-3 sm:w-1 sm:-mr-1', safeAreaWidth)} />
    </TouchableOpacity>
  );
};

export default React.memo(ListItemSelector);
