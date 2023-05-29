import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import {
  updatePopup, updateBulkEdit, changeListName, moveLinks, moveToListName,
} from '../actions';
import {
  LIST_NAMES_POPUP, TRASH, LIST_NAMES_MODE_CHANGE_LIST_NAME,
  LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_MODE_MOVE_LIST_NAME,
  LIST_NAMES_ANIM_TYPE_BMODAL,
} from '../types/const';
import { getListNameMap } from '../selectors';
import {
  getLastHalfHeight, getListNameObj, getLongestListNameDisplayName,
  getMaxListNameChildrenSize,
} from '../utils';
import {
  popupFMV, bModalFMV, slideInPopupFMV, slideInModalFMV,
} from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import { computePosition, createLayouts, getOriginTranslate } from './MenuPopupRenderer';

const MODE_CHANGE_LIST_NAME = LIST_NAMES_MODE_CHANGE_LIST_NAME;
const MODE_MOVE_LINKS = LIST_NAMES_MODE_MOVE_LINKS;
const MODE_MOVE_LIST_NAME = LIST_NAMES_MODE_MOVE_LIST_NAME;

const ANIM_TYPE_BMODAL = LIST_NAMES_ANIM_TYPE_BMODAL;

const ListNamesPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isListNamesPopupShown);
  const anchorPosition = useSelector(state => state.display.listNamesPopupPosition);
  const mode = useSelector(state => state.display.listNamesMode);
  const animType = useSelector(state => state.display.listNamesAnimType);
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
  const [derivedListName, setDerivedListName] = useState(listName);
  const [derivedSelectingLinkId, setDerivedSelectingLinkId] = useState(selectingLinkId);
  const [derivedSelectedLinkIds, setDerivedSelectedLinkIds] = useState(selectedLinkIds);
  const [derivedSelectingListName, setDerivedSelectingListName] = useState(
    selectingListName
  );
  const [derivedListNameMap, setDerivedListNameMap] = useState(listNameMap);
  const [derivedUpdates, setDerivedUpdates] = useState(updates);

  const [forwardCount, setForwardCount] = useState(0);
  const [prevForwardCount, setPrevForwardCount] = useState(forwardCount);
  const [backCount, setBackCount] = useState(0);
  const [prevBackCount, setPrevBackCount] = useState(backCount);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const { listNameObj, parent, children } = useMemo(() => {
    const { listNameObj: obj, parent: p } = getListNameObj(
      currentListName, derivedListNameMap
    );
    const c = currentListName === null ? derivedListNameMap : obj.children;
    return { listNameObj: obj, parent: p, children: c };
  }, [currentListName, derivedListNameMap]);
  const longestDisplayName = useMemo(() => {
    return getLongestListNameDisplayName(derivedListNameMap);
  }, [derivedListNameMap]);
  const maxChildrenSize = useMemo(() => {
    return getMaxListNameChildrenSize(derivedListNameMap);
  }, [derivedListNameMap]);
  const slideFMV = useMemo(() => {
    if (animType === ANIM_TYPE_BMODAL) return slideInModalFMV;
    return slideInPopupFMV;
  }, [animType]);

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(LIST_NAMES_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onMoveToItemBtnClick = (selectedListName) => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (mode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(derivedSelectingListName, selectedListName));
    } else if (mode === MODE_MOVE_LINKS) {
      let ids = [derivedSelectingLinkId];
      if (derivedSelectedLinkIds.length > 0) ids = derivedSelectedLinkIds;

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
      dispatch(moveToListName(derivedSelectingListName, currentListName));
    } else if (mode === MODE_MOVE_LINKS) {
      if (!currentListName) {
        throw new Error(`Invalid currentListName: ${currentListName}`);
      }

      let ids = [derivedSelectingLinkId];
      if (derivedSelectedLinkIds.length > 0) ids = derivedSelectedLinkIds;
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
    Animated.timing(slideAnim, { toValue: 1, ...slideFMV }).start(() => {
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
    if (derivedIsShown) {
      didClick.current = false;

      let animConfig = popupFMV.visible;
      if (animType === ANIM_TYPE_BMODAL) animConfig = bModalFMV.visible;
      Animated.timing(popupAnim, { toValue: 1, ...animConfig }).start();
    } else {
      let animConfig = popupFMV.hidden;
      if (animType === ANIM_TYPE_BMODAL) animConfig = bModalFMV.hidden;
      Animated.timing(popupAnim, { toValue: 0, ...animConfig }).start(() => {
        if (didMount) {
          setDidCloseAnimEnd(true);
        }
      });
    }

    registerPopupBackHandler(derivedIsShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [derivedIsShown, popupAnim, animType, registerPopupBackHandler]);

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, ...slideFMV }).start();
  }, [backCount, slideFMV, slideAnim]);

  if (derivedIsShown !== isShown) {
    if (derivedIsShown && !isShown) setDidCloseAnimEnd(false);
    if (!derivedIsShown && isShown) {
      setDerivedAnchorPosition(anchorPosition);
      setDerivedListName(listName);
      setDerivedSelectingLinkId(selectingLinkId);
      setDerivedSelectedLinkIds(selectedLinkIds);
      setDerivedSelectingListName(selectingListName);
      setDerivedListNameMap(listNameMap);
      setDerivedUpdates(updates);

      if (mode === MODE_MOVE_LIST_NAME) {
        const { parent: p } = getListNameObj(selectingListName, listNameMap);
        setCurrentListName(p);
      } else {
        const { parent: p } = getListNameObj(listName, listNameMap);
        setCurrentListName(p);
      }
    }
    setDerivedIsShown(isShown);
  }

  if (!derivedIsShown && didCloseAnimEnd) return null;
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
    popupWidth = safeAreaWidth + insets.left + insets.right;

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

    return (
      <View style={tailwind(viewClassNames)}>
        {children.map(obj => {
          let btnClassNames = animType === ANIM_TYPE_BMODAL ? 'py-4' : 'py-3';
          if (!obj.children || obj.children.length === 0) btnClassNames += ' pr-4';

          let disabled = false, forwardDisabled = false;
          if (mode === MODE_MOVE_LIST_NAME) {
            const { parent: p } = getListNameObj(
              derivedSelectingListName, derivedListNameMap
            );
            disabled = [TRASH, derivedSelectingListName, p].includes(obj.listName);
            forwardDisabled = [TRASH, derivedSelectingListName].includes(obj.listName);
          } else if (mode === MODE_MOVE_LINKS) {
            disabled = [TRASH, derivedListName].includes(obj.listName);
            forwardDisabled = [TRASH].includes(obj.listName);
          }

          return (
            <View key={obj.listName} style={tailwind('w-full flex-row items-center justify-start')}>
              <TouchableOpacity onPress={() => onMoveToItemBtnClick(obj.listName)} style={tailwind(`flex-shrink flex-grow flex-row items-center pl-4 ${btnClassNames}`)} disabled={disabled}>
                <Text style={tailwind(`text-sm font-normal ${disabled ? 'text-gray-400 blk:text-gray-500' : 'text-gray-700 blk:text-gray-200'}`)} numberOfLines={1} ellipsizeMode="tail">{obj.displayName}</Text>
                {(mode === MODE_CHANGE_LIST_NAME && obj.listName in derivedUpdates) && <View style={tailwind('ml-1 h-1.5 w-1.5 flex-shrink-0 flex-grow-0 self-start rounded-full bg-blue-400')} />}
              </TouchableOpacity>
              {(obj.children && obj.children.length > 0) && <TouchableOpacity onPress={() => onForwardBtnClick(obj.listName)} style={tailwind('h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center')} disabled={forwardDisabled}>
                <Svg style={tailwind(`font-normal ${forwardDisabled ? 'text-gray-300 blk:text-gray-600' : 'text-gray-500 blk:text-gray-300'}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
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
      const { parent: p } = getListNameObj(derivedSelectingListName, derivedListNameMap);
      moveHereDisabled = [TRASH, p].includes(currentListName);
    } else if (mode === MODE_MOVE_LINKS) {
      moveHereDisabled = (
        !currentListName || [TRASH, derivedListName].includes(currentListName)
      );
    }

    const viewClassNames = animType === ANIM_TYPE_BMODAL ? 'h-14 pt-1' : 'h-11 pt-1';
    const moveHereClassNames = animType === ANIM_TYPE_BMODAL ? 'py-3' : 'py-2.5';

    return (
      <React.Fragment>
        <View style={tailwind(`flex-row items-center justify-start ${viewClassNames}`)}>
          {currentListName && <TouchableOpacity onPress={() => onBackBtnClick(parent)} style={tailwind('h-10 flex-shrink-0 flex-grow-0 items-center justify-center pl-2.5 pr-1')}>
            <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-300')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M12.707 5.29303C12.8945 5.48056 12.9998 5.73487 12.9998 6.00003C12.9998 6.26519 12.8945 6.5195 12.707 6.70703L9.41403 10L12.707 13.293C12.8892 13.4816 12.99 13.7342 12.9877 13.9964C12.9854 14.2586 12.8803 14.5094 12.6948 14.6948C12.5094 14.8803 12.2586 14.9854 11.9964 14.9877C11.7342 14.99 11.4816 14.8892 11.293 14.707L7.29303 10.707C7.10556 10.5195 7.00024 10.2652 7.00024 10C7.00024 9.73487 7.10556 9.48056 7.29303 9.29303L11.293 5.29303C11.4806 5.10556 11.7349 5.00024 12 5.00024C12.2652 5.00024 12.5195 5.10556 12.707 5.29303Z" />
            </Svg>
          </TouchableOpacity>}
          <Text style={tailwind(`flex-shrink flex-grow text-sm font-semibold text-gray-600 blk:text-gray-200 ${currentListName ? 'pr-4' : 'px-4'}`)} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
        </View>
        <View style={tailwind('flex-1 overflow-hidden')}>
          <Animated.View style={[tailwind('flex-1'), contentStyle]}>
            <ScrollView>{renderListNameBtns()}</ScrollView>
          </Animated.View>
        </View>
        {[MODE_MOVE_LINKS, MODE_MOVE_LIST_NAME].includes(mode) && <View style={tailwind(`flex-row items-center justify-end border-t border-gray-200 px-3 blk:border-gray-600 ${moveHereClassNames}`)}>
          <TouchableOpacity onPress={onMoveHereBtnClick} style={tailwind(`rounded-full border bg-white px-3 py-1.5 blk:bg-gray-800 ${moveHereDisabled ? 'border-gray-300 blk:border-gray-600' : 'border-gray-400 blk:border-gray-400'}`)} disabled={moveHereDisabled}>
            <Text style={tailwind(`text-xs font-normal ${moveHereDisabled ? 'text-gray-400 blk:text-gray-500' : 'text-gray-500 blk:text-gray-300'}`)}>{moveHereDisabled ? 'View only' : 'Move here'}</Text>
          </TouchableOpacity>
        </View>}
      </React.Fragment>
    );
  };

  let panel;
  if (animType === ANIM_TYPE_BMODAL) {
    popupHeight = popupHeight + insets.bottom;
    const popupStyle = {
      height: popupHeight,
      paddingBottom: insets.bottom,
      transform: [{
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [popupHeight, 0],
        }),
      }],
    };

    panel = (
      <Animated.View style={[tailwind('absolute inset-x-0 bottom-0 rounded-t-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800'), popupStyle]}>
        {_render()}
      </Animated.View>
    );
  } else {
    const layouts = createLayouts(
      derivedAnchorPosition,
      { width: popupWidth, height: popupHeight },
      { width: safeAreaWidth + insets.left, height: safeAreaHeight + insets.top },
    );
    const popupPosition = computePosition(layouts, null, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const { startX, startY } = getOriginTranslate(
      topOrigin, leftOrigin, popupWidth, popupHeight
    );

    const popupStyle = {
      top, left,
      width: popupWidth, height: popupHeight,
      opacity: popupAnim, transform: [],
    };
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

    panel = (
      <Animated.View style={[tailwind('absolute rounded-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800'), popupStyle]}>
        {_render()}
      </Animated.View>
    );
  }

  const bgStyle = { opacity: popupAnim };

  return (
    <View style={tailwind('absolute inset-0 z-40 elevation-xl')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

export default React.memo(ListNamesPopup);
