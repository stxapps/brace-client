import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FlatList, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup, updateTimePick, updateThemeCustomOptions } from '../actions';
import { TIME_PICK_POPUP } from '../types/const';
import {
  makeIsTimePickHourItemSelected, makeIsTimePickMinuteItemSelected,
} from '../selectors';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import { computePosition, createLayouts, getOriginTranslate } from './MenuPopupRenderer';

const ITEM_HEIGHT = 48;

const TimePickPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isTimePickPopupShown);
  const anchorPosition = useSelector(state => state.display.timePickPopupPosition);
  const period = useSelector(state => state.timePick.period);
  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = useCallback(() => {
    dispatch(updatePopup(TIME_PICK_POPUP, false, null));
    dispatch(updateThemeCustomOptions());
  }, [dispatch]);

  const onItemBtnClick = useCallback((value) => {
    dispatch(updateTimePick(null, null, value));
  }, [dispatch]);

  const onPopupLayout = (e) => {
    if (!popupSize) {
      setPopupSize(e.nativeEvent.layout);
    }
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onCancelBtnClick();
            return true;
          }
        );
      }
    } else {
      if (popupBackHandler.current) {
        popupBackHandler.current.remove();
        popupBackHandler.current = null;
      }
    }
  }, [onCancelBtnClick]);

  useEffect(() => {
    if (isShown && popupSize) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
    }
  }, [isShown, popupSize, popupAnim]);

  useEffect(() => {
    let didMount = true;
    if (!isShown) {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        if (didMount) {
          setPopupSize(null);
          setDidCloseAnimEnd(true);
        }
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [isShown, popupAnim, registerPopupBackHandler]);

  if (derivedIsShown !== isShown) {
    if (derivedIsShown && !isShown) setDidCloseAnimEnd(false);
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  if (anchorPosition && anchorPosition !== derivedAnchorPosition) {
    setDerivedAnchorPosition(anchorPosition);
  }

  if (!derivedAnchorPosition) return null;

  const popupHeight = Math.min(320, safeAreaHeight);
  const buttonsStyle = { height: popupHeight, paddingTop: 4, paddingBottom: 4 };
  const contentHeight = (
    buttonsStyle.height - buttonsStyle.paddingTop - buttonsStyle.paddingBottom
  );
  const buttons = (
    <View style={[tailwind('flex-row pl-1'), buttonsStyle]}>
      <TimePickHour contentHeight={contentHeight} />
      <TimePickMinute contentHeight={contentHeight} />
      {period && <View style={tailwind('pr-1')}>
        <TouchableOpacity onPress={() => onItemBtnClick('AM')} style={tailwind(`px-5 py-3.5 ${period === 'AM' ? 'bg-gray-100 blk:bg-gray-700' : ''}`)}>
          <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>AM</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onItemBtnClick('PM')} style={tailwind(`px-5 py-3.5 ${period === 'PM' ? 'bg-gray-100 blk:bg-gray-700' : ''}`)}>
          <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>PM</Text>
        </TouchableOpacity>
      </View>}
    </View>
  );

  let popupClassNames = 'absolute rounded-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800';
  let panel;
  let bgStyle = { opacity: 0 };
  if (popupSize) {

    const layouts = createLayouts(
      derivedAnchorPosition,
      { width: popupSize.width, height: popupSize.height },
      { width: safeAreaWidth + insets.left, height: safeAreaHeight + insets.top },
    );
    const popupPosition = computePosition(layouts, null, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const { startX, startY } = getOriginTranslate(
      topOrigin, leftOrigin, popupSize.width, popupSize.height
    );

    const popupStyle = { top, left, opacity: popupAnim, transform: [] };
    popupStyle.transform.push({
      translateX: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [startX, 0],
      }),
    });
    popupStyle.transform.push({
      translateY: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [startY, 0],
      }),
    });
    popupStyle.transform.push({
      scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
    });
    /* @ts-ignore */
    bgStyle = { opacity: popupAnim };

    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), popupStyle]}>
        {buttons}
      </Animated.View>
    );
  } else {
    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { top: safeAreaHeight + 256, left: safeAreaWidth + 256 }]}>
        {buttons}
      </Animated.View>
    );
  }

  return (
    <View style={tailwind('absolute inset-0 z-40 elevation-xl')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

const _TimePickHour = (props) => {

  const { contentHeight } = props;
  const hour = useSelector(state => state.timePick.hour);
  const is24HFormat = useSelector(state => state.window.is24HFormat);
  const flatList = useRef(null);
  const scrollToItemRef = useRef(null);
  const tailwind = useTailwind();

  const data = useMemo(() => {
    const hours = [];
    if (is24HFormat) {
      for (let i = 0; i < 24; i++) hours.push(String(i).padStart(2, '0'));
    } else {
      hours.push(String(12).padStart(2, '0'));
      for (let i = 1; i < 12; i++) hours.push(String(i).padStart(2, '0'));
    }
    return hours;
  }, [is24HFormat]);

  const getItemId = useCallback((item) => {
    return item;
  }, []);

  const getItemLayout = useCallback((_, index) => {
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index };
  }, []);

  const renderItem = useCallback(({ item }) => {
    return <TimePickHourItem item={item} />;
  }, []);

  useEffect(() => {
    const scrollToItem = () => {
      const num = parseInt(hour, 10);

      let offsetTop;
      if (is24HFormat) offsetTop = num * ITEM_HEIGHT;
      else offsetTop = num === 12 ? 0 : num * ITEM_HEIGHT;

      if (offsetTop > contentHeight - ITEM_HEIGHT) {
        offsetTop = offsetTop - (contentHeight / 2) + (ITEM_HEIGHT / 2);
      } else {
        offsetTop = 0;
      }

      flatList.current.scrollToOffset({ offset: offsetTop, animated: false });
    };

    scrollToItemRef.current = scrollToItem;
  });

  useEffect(() => {
    if (flatList.current && scrollToItemRef.current) {
      setTimeout(() => {
        if (flatList.current && scrollToItemRef.current) scrollToItemRef.current();
      }, 1);
    }
  }, []);

  return (
    <FlatList
      ref={flatList}
      contentContainerStyle={tailwind('pr-1')}
      data={data}
      keyExtractor={getItemId}
      getItemLayout={getItemLayout}
      renderItem={renderItem}
      removeClippedSubviews={false}
      overScrollMode="always" />
  );
};

const _TimePickHourItem = (props) => {

  const { item } = props;
  const getIsSelected = useMemo(makeIsTimePickHourItemSelected, []);
  const isSelected = useSelector(state => getIsSelected(state, item));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onItemBtnClick = useCallback((value) => {
    dispatch(updateTimePick(value));
  }, [dispatch]);

  // change button style, need to update ITEM_HEIGHT.
  return (
    <TouchableOpacity onPress={() => onItemBtnClick(item)} style={tailwind(`px-5 py-3.5 ${isSelected ? 'bg-gray-100 blk:bg-gray-700' : ''}`)}>
      <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>{item}</Text>
    </TouchableOpacity>
  );
};

const _TimePickMinute = (props) => {

  const { contentHeight } = props;
  const minute = useSelector(state => state.timePick.minute);
  const flatList = useRef(null);
  const scrollToItemRef = useRef(null);
  const tailwind = useTailwind();

  const data = useMemo(() => {
    const minutes = [];
    for (let i = 0; i < 60; i++) minutes.push(String(i).padStart(2, '0'));
    return minutes;
  }, []);

  const getItemId = useCallback((item) => {
    return item;
  }, []);

  const getItemLayout = useCallback((_, index) => {
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index };
  }, []);

  const renderItem = useCallback(({ item }) => {
    return <TimePickMinuteItem item={item} />;
  }, []);

  useEffect(() => {
    const scrollToItem = () => {
      const num = parseInt(minute, 10);

      let offsetTop = num * ITEM_HEIGHT;
      if (offsetTop > contentHeight - ITEM_HEIGHT) {
        offsetTop = offsetTop - (contentHeight / 2) + (ITEM_HEIGHT / 2);
      } else {
        offsetTop = 0;
      }

      flatList.current.scrollToOffset({ offset: offsetTop, animated: false });
    };

    scrollToItemRef.current = scrollToItem;
  });

  useEffect(() => {
    if (flatList.current && scrollToItemRef.current) {
      setTimeout(() => {
        if (flatList.current && scrollToItemRef.current) scrollToItemRef.current();
      }, 1);
    }
  }, []);

  return (
    <FlatList
      ref={flatList}
      contentContainerStyle={tailwind('pr-1')}
      data={data}
      keyExtractor={getItemId}
      getItemLayout={getItemLayout}
      renderItem={renderItem}
      removeClippedSubviews={false}
      overScrollMode="always" />
  );
};

const _TimePickMinuteItem = (props) => {

  const { item } = props;
  const getIsSelected = useMemo(makeIsTimePickMinuteItemSelected, []);
  const isSelected = useSelector(state => getIsSelected(state, item));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onItemBtnClick = useCallback((value) => {
    dispatch(updateTimePick(null, value));
  }, [dispatch]);

  // change button style, need to update ITEM_HEIGHT.
  return (
    <TouchableOpacity onPress={() => onItemBtnClick(item)} style={tailwind(`px-5 py-3.5 ${isSelected ? 'bg-gray-100 blk:bg-gray-700' : ''}`)}>
      <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>{item}</Text>
    </TouchableOpacity>
  );
};

const TimePickHour = React.memo(_TimePickHour);
const TimePickHourItem = React.memo(_TimePickHourItem);
const TimePickMinute = React.memo(_TimePickMinute);
const TimePickMinuteItem = React.memo(_TimePickMinuteItem);

export default React.memo(TimePickPopup);
