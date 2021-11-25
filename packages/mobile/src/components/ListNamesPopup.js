import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  updatePopup, updateBulkEdit, changeListName, moveLinks, moveToListName,
} from '../actions';
import { LIST_NAMES_POPUP, SM_WIDTH } from '../types/const';
import { getListNameMap } from '../selectors';
import {
  getLastHalfHeight, getListNameObj, getLongestListNameDisplayName,
  getMaxListNameChildrenSize,
} from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';
import {
  popupOpenAnimConfig, popupCloseAnimConfig,
  bModalOpenAnimConfig, bModalCloseAnimConfig, slideAnimConfig,
} from '../types/animConfigs';

const MODE_CHANGE_LIST_NAME = 'MODE_CHANGE_LIST_NAME';
const MODE_MOVE_LINKS = 'MODE_MOVE_LINKS';
const MODE_MOVE_LIST_NAME = 'MODE_MOVE_LIST_NAME';

const ANIM_TYPE_POPUP = 'ANIM_TYPE_POPUP';
const ANIM_TYPE_BMODAL = 'ANIM_TYPE_BMODAL';

const ListNamesPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isListNamesPopupShown);
  const anchorPosition = useSelector(state => state.display.listNamesPopupPosition);

  const listName = useSelector(state => state.display.listName);
  const selectingLinkId = useSelector(state => state.display.selectingLinkId);
  const selectedLinkIds = useSelector(state => state.display.selectedLinkIds);
  const selectingListName = useSelector(state => state.display.selectingListName);
  const listNameMap = useSelector(getListNameMap);
  const updates = useSelector(state => state.fetched);

  const [currentListName, setCurrentListName] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const [forwardCount, setForwardCount] = useState(0);
  const [prevForwardCount, setPrevForwardCount] = useState(forwardCount);
  const [backCount, setBackCount] = useState(0);
  const [prevBackCount, setPrevBackCount] = useState(backCount);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const mode = useMemo(() => {
    if (selectingListName) return MODE_MOVE_LIST_NAME;
    if (selectedLinkIds.length > 0) return MODE_MOVE_LINKS;
    if (selectingLinkId) return MODE_MOVE_LINKS;
    return MODE_CHANGE_LIST_NAME;
  }, [selectingLinkId, selectedLinkIds, selectingListName]);
  const animType = useMemo(() => {
    if (selectedLinkIds.length > 0 && safeAreaWidth < SM_WIDTH) return ANIM_TYPE_BMODAL;
    return ANIM_TYPE_POPUP;
  }, [selectedLinkIds, safeAreaWidth]);
  const { listNameObj, parent, children } = useMemo(() => {
    const { listNameObj: obj, parent: p } = getListNameObj(currentListName, listNameMap);
    const c = currentListName === null ? listNameMap : obj.children;
    return { listNameObj: obj, parent: p, children: c };
  }, [currentListName, listNameMap]);
  const longestDisplayName = useMemo(() => {
    return getLongestListNameDisplayName(listNameMap);
  }, [listNameMap]);
  const maxChildrenSize = useMemo(() => {
    return getMaxListNameChildrenSize(listNameMap);
  }, [listNameMap]);

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(LIST_NAMES_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onMoveToItemBtnClick = (selectedListName) => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (mode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(selectingListName, selectedListName));
    } else if (mode === MODE_MOVE_LINKS) {
      const ids = selectedLinkIds.length > 0 ? selectedLinkIds : [selectingLinkId];
      dispatch(moveLinks(selectedListName, ids));
      dispatch(updateBulkEdit(false));
    } else if (mode === MODE_CHANGE_LIST_NAME) {
      dispatch(changeListName(selectedListName));
    } else throw new Error(`Invalid mode: ${mode}`);
    didClick.current = true;
  };

  const onMoveHereBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (mode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(selectingListName, currentListName));
    } else if (mode === MODE_MOVE_LINKS) {
      if (!currentListName) {
        throw new Error(`Invalid currentListName: ${currentListName}`);
      }
      const ids = selectedLinkIds.length > 0 ? selectedLinkIds : [selectingLinkId];
      dispatch(moveLinks(currentListName, ids));
      dispatch(updateBulkEdit(false));
    } else throw new Error(`Invalid mode: ${mode}`);
    didClick.current = true;
  };

  const onBackBtnClick = (selectedListName) => {
    setCurrentListName(selectedListName);
    setBackCount(backCount + 1);
  };

  const onForwardBtnClick = (selectedListName) => {
    Animated.timing(slideAnim, { toValue: 1, ...slideAnimConfig }).start(() => {
      setCurrentListName(selectedListName);
      setForwardCount(forwardCount + 1);
    });
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
    let didMount = true;
    if (isShown) {
      let animConfig = popupOpenAnimConfig;
      if (animType === ANIM_TYPE_BMODAL) animConfig = bModalOpenAnimConfig;
      Animated.spring(popupAnim, { toValue: 1, ...animConfig }).start(() => {
        if (didMount) {
          didClick.current = false;
        }
      });
    } else {
      let animConfig = popupCloseAnimConfig;
      if (animType === ANIM_TYPE_BMODAL) animConfig = bModalCloseAnimConfig;
      Animated.spring(popupAnim, { toValue: 0, ...animConfig }).start(() => {
        if (didMount) {
          setDidCloseAnimEnd(true);
        }
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [isShown, popupAnim, animType, registerPopupBackHandler]);

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, ...slideAnimConfig }).start();
  }, [backCount, slideAnim]);

  if (derivedIsShown !== isShown) {
    if (derivedIsShown && !isShown) setDidCloseAnimEnd(false);
    if (!derivedIsShown && isShown) {
      if (mode === MODE_MOVE_LIST_NAME) {
        const { parent: p } = getListNameObj(selectingListName, listNameMap);
        setCurrentListName(p);
      } else if ([MODE_MOVE_LINKS, MODE_CHANGE_LIST_NAME].includes(mode)) {
        const { parent: p } = getListNameObj(listName, listNameMap);
        setCurrentListName(p);
      } else throw new Error(`Invalid mode: ${mode}`);
    }
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  if (anchorPosition && anchorPosition !== derivedAnchorPosition) {
    setDerivedAnchorPosition(anchorPosition);
  }

  if (!derivedAnchorPosition) return null;

  if (forwardCount !== prevForwardCount) {
    slideAnim.setValue(0);
    setPrevForwardCount(forwardCount);
  }
  if (backCount !== prevBackCount) {
    slideAnim.setValue(1);
    setPrevBackCount(backCount);
  }

  let popupWidth, popupHeight;
  if (animType === ANIM_TYPE_BMODAL) {
    popupWidth = safeAreaWidth;

    popupHeight = Math.min(371, 52 * maxChildrenSize + 56 + 55);
    if (maxChildrenSize > 4) {
      popupHeight = getLastHalfHeight(
        Math.min(popupHeight, safeAreaHeight - 16), 52, 56, 55, 0.55
      );
    } else if (maxChildrenSize > 3) {
      popupHeight = Math.min(popupHeight, safeAreaHeight - 16);
    }
  } else {
    if (mode === MODE_CHANGE_LIST_NAME) {
      popupWidth = 160;
      if (longestDisplayName.length > 26) popupWidth = 256;
      else if (longestDisplayName.length > 14) popupWidth = 208;

      popupHeight = Math.min(268, 44 * (maxChildrenSize + 1) + 4);
      if (maxChildrenSize > 4) {
        popupHeight = getLastHalfHeight(
          Math.min(popupHeight, safeAreaHeight - 16), 44, 0, 0, 0.5
        );
      } else if (maxChildrenSize > 3) {
        popupHeight = Math.min(popupHeight, safeAreaHeight - 16);
      }
    } else if ([MODE_MOVE_LINKS, MODE_MOVE_LIST_NAME].includes(mode)) {
      popupWidth = 168;
      if (longestDisplayName.length > 26) popupWidth = 256;
      else if (longestDisplayName.length > 14) popupWidth = 208;

      popupHeight = Math.min(315, 44 * (maxChildrenSize + 1) + 51);
      if (maxChildrenSize > 4) {
        popupHeight = getLastHalfHeight(
          Math.min(popupHeight, safeAreaHeight - 16), 44, 0, 51, 0.5
        );
      } else if (maxChildrenSize > 3) {
        popupHeight = Math.min(popupHeight, safeAreaHeight - 16);
      }
    } else throw new Error(`Invalid mode: ${mode}`);
  }

  const renderListNameBtns = () => {
    const viewClassNames = animType === ANIM_TYPE_BMODAL ? '-mt-0.5' : '-mt-0.5';
    const btnClassNames = animType === ANIM_TYPE_BMODAL ? 'py-4' : 'py-3';

    return (
      <View style={tailwind(viewClassNames)}>
        {children.map(obj => {
          let disabled = false, forwardDisabled = false;
          if (mode === MODE_MOVE_LIST_NAME) {
            const { parent: p } = getListNameObj(selectingListName, listNameMap);
            disabled = (obj.listName === selectingListName || obj.listName === p);
            forwardDisabled = obj.listName === selectingListName;
          } else if (mode === MODE_MOVE_LINKS) {
            disabled = obj.listName === listName;
            forwardDisabled = false;
          }

          return (
            <View key={obj.listName} style={tailwind('w-full flex-row justify-start items-center')}>
              <TouchableOpacity onPress={() => onMoveToItemBtnClick(obj.listName)} style={tailwind(`flex-grow flex-shrink pl-4 ${btnClassNames} flex-row items-center`)} disabled={disabled}>
                <Text style={tailwind(`text-sm font-normal ${disabled ? 'text-gray-400' : 'text-gray-700'}`)} numberOfLines={1} ellipsizeMode="tail">{obj.displayName}</Text>
                {(mode === MODE_CHANGE_LIST_NAME && obj.listName in updates) && <View style={tailwind('ml-1 flex-grow-0 flex-shrink-0 self-start w-1.5 h-1.5 bg-blue-400 rounded-full')} />}
              </TouchableOpacity>
              {(obj.children && obj.children.length > 0) && <TouchableOpacity onPress={() => onForwardBtnClick(obj.listName)} style={tailwind('flex-grow-0 flex-shrink-0 w-10 h-10 justify-center items-center')} disabled={forwardDisabled}>
                <Svg style={tailwind(`${forwardDisabled ? 'text-gray-300' : 'text-gray-500'} font-normal`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M7.29303 14.7069C7.10556 14.5194 7.00024 14.2651 7.00024 13.9999C7.00024 13.7348 7.10556 13.4804 7.29303 13.2929L10.586 9.99992L7.29303 6.70692C7.11087 6.51832 7.01008 6.26571 7.01236 6.00352C7.01463 5.74132 7.1198 5.49051 7.30521 5.3051C7.49062 5.11969 7.74143 5.01452 8.00363 5.01224C8.26583 5.00997 8.51843 5.11076 8.70703 5.29292L12.707 9.29292C12.8945 9.48045 12.9998 9.73475 12.9998 9.99992C12.9998 10.2651 12.8945 10.5194 12.707 10.7069L8.70703 14.7069C8.5195 14.8944 8.26519 14.9997 8.00003 14.9997C7.73487 14.9997 7.48056 14.8944 7.29303 14.7069Z" />
                </Svg>
              </TouchableOpacity>}
            </View>
          );
        })}
      </View>
    );
  };

  const _render = () => {
    const rootName = mode === MODE_CHANGE_LIST_NAME ? 'Lists' : 'Move to';
    const displayName = currentListName ? listNameObj.displayName : rootName;
    const contentStyle = {
      transform: [
        {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1], outputRange: [0, -1 * popupWidth],
          }),
        },
      ],
    };

    let moveHereDisabled = false;
    if (mode === MODE_MOVE_LIST_NAME) {
      const { parent: p } = getListNameObj(selectingListName, listNameMap);
      moveHereDisabled = (currentListName === p);
    } else if (mode === MODE_MOVE_LINKS) {
      moveHereDisabled = currentListName === listName || !currentListName;
    }

    const viewClassNames = animType === ANIM_TYPE_BMODAL ? 'h-14 pt-1' : 'h-11 pt-1';
    const moveHereClassNames = animType === ANIM_TYPE_BMODAL ? 'py-3' : 'py-2.5';

    return (
      <React.Fragment>
        <View style={tailwind(`flex-row justify-start items-center ${viewClassNames}`)}>
          {currentListName && <TouchableOpacity onPress={() => onBackBtnClick(parent)} style={tailwind('pl-2.5 pr-1 h-10 flex-grow-0 flex-shrink-0 justify-center items-center')}>
            <Svg style={tailwind('text-gray-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M12.707 5.29303C12.8945 5.48056 12.9998 5.73487 12.9998 6.00003C12.9998 6.26519 12.8945 6.5195 12.707 6.70703L9.41403 10L12.707 13.293C12.8892 13.4816 12.99 13.7342 12.9877 13.9964C12.9854 14.2586 12.8803 14.5094 12.6948 14.6948C12.5094 14.8803 12.2586 14.9854 11.9964 14.9877C11.7342 14.99 11.4816 14.8892 11.293 14.707L7.29303 10.707C7.10556 10.5195 7.00024 10.2652 7.00024 10C7.00024 9.73487 7.10556 9.48056 7.29303 9.29303L11.293 5.29303C11.4806 5.10556 11.7349 5.00024 12 5.00024C12.2652 5.00024 12.5195 5.10556 12.707 5.29303Z" />
            </Svg>
          </TouchableOpacity>}
          <Text style={tailwind(`flex-grow flex-shrink text-gray-600 text-sm font-semibold ${currentListName ? 'pr-4' : 'px-4'}`)} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
        </View>
        <View style={tailwind('flex-1 overflow-hidden')}>
          <Animated.View style={[tailwind('flex-1'), contentStyle]}>
            <ScrollView>{renderListNameBtns()}</ScrollView>
          </Animated.View>
        </View>
        {[MODE_MOVE_LINKS, MODE_MOVE_LIST_NAME].includes(mode) && <View style={tailwind(`px-3 ${moveHereClassNames} border-t border-gray-200 flex-row justify-end items-center`)}>
          <TouchableOpacity onPress={onMoveHereBtnClick} style={tailwind(`px-3 py-1.5 bg-white border ${moveHereDisabled ? 'border-gray-300' : 'border-gray-400'} rounded-full`)} disabled={moveHereDisabled}>
            <Text style={tailwind(`text-xs ${moveHereDisabled ? 'text-gray-400' : 'text-gray-500'} font-normal`)}>{moveHereDisabled ? 'View only' : 'Move here'}</Text>
          </TouchableOpacity>
        </View>}
      </React.Fragment>
    );
  };

  let panel;
  if (animType === ANIM_TYPE_BMODAL) {
    popupHeight = popupHeight + insets.bottom + 64; // 64 for pb-16 and -bottom-12
    const popupStyle = {
      height: popupHeight,
      paddingBottom: insets.bottom + 64,
      transform: [{
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [popupHeight, 0],
        }),
      }],
    };

    panel = (
      <Animated.View style={[tailwind('absolute inset-x-0 -bottom-12 bg-white border border-gray-100 rounded-t-lg shadow-xl z-41'), popupStyle]}>
        {_render()}
      </Animated.View>
    );
  } else {
    const layouts = createLayouts(
      derivedAnchorPosition,
      { width: popupWidth, height: popupHeight },
      { width: safeAreaWidth, height: safeAreaHeight }
    );
    const popupPosition = computePosition(layouts, null, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const originClassName = getOriginClassName(topOrigin, leftOrigin);

    const popupStyle = {
      top, left,
      width: popupWidth, height: popupHeight,
      opacity: popupAnim, transform: [],
    };
    if (originClassName === 'origin-top-left') {
      popupStyle.transform.push({
        translateX: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * popupWidth / 2, 0],
        }),
      });
      popupStyle.transform.push({
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * popupHeight / 2, 0],
        }),
      });
    } else if (originClassName === 'origin-top-right') {
      popupStyle.transform.push({
        translateX: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [popupWidth / 2, 0],
        }),
      });
      popupStyle.transform.push({
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * popupHeight / 2, 0],
        }),
      });
    }
    popupStyle.transform.push({ scale: popupAnim });

    panel = (
      <Animated.View style={[tailwind('absolute mt-1 rounded-md shadow-lg bg-white z-41'), popupStyle]}>
        {_render()}
      </Animated.View>
    );
  }

  const bgStyle = { opacity: popupAnim };

  return (
    <React.Fragment>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25 z-40'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </React.Fragment >
  );
};

export default React.memo(ListNamesPopup);
