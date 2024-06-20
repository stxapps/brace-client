import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import {
  updatePopup, updateListNamesMode, pinLinks, unpinLinks, updateTagEditorPopup,
  updateBulkEdit,
} from '../actions';
import {
  BULK_EDIT_MENU_POPUP, LIST_NAMES_POPUP, BULK_EDIT_MENU_ANIM_TYPE_BMODAL, MOVE_TO, PIN,
  UNPIN, MANAGE_TAGS, MY_LIST, ARCHIVE, TRASH, LIST_NAMES_MODE_MOVE_LINKS,
  LIST_NAMES_ANIM_TYPE_POPUP, LIST_NAMES_ANIM_TYPE_BMODAL,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getAllListNames } from '../utils';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import { computePosition, createLayouts, getOriginTranslate } from './MenuPopupRenderer';

const ANIM_TYPE_BMODAL = BULK_EDIT_MENU_ANIM_TYPE_BMODAL;

const BulkEditMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isBulkEditMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.bulkEditMenuPopupPosition);
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const listNameMap = useSelector(state => getListNameMap(state));
  const selectedLinkIds = useSelector(state => state.display.selectedLinkIds);
  const animType = useSelector(state => state.display.bulkEditMenuAnimType);
  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const isAnimTypeB = animType === ANIM_TYPE_BMODAL;

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(BULK_EDIT_MENU_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onMenuPopupClick = (text) => {
    if (!text || didClick.current) return;

    onCancelBtnClick();
    if (text === MOVE_TO) {
      let animType = LIST_NAMES_ANIM_TYPE_POPUP;
      if (isAnimTypeB) animType = LIST_NAMES_ANIM_TYPE_BMODAL;

      dispatch(updateListNamesMode(LIST_NAMES_MODE_MOVE_LINKS, animType));
      dispatch(updatePopup(LIST_NAMES_POPUP, true, anchorPosition));
    } else if (text === PIN) {
      dispatch(pinLinks(selectedLinkIds));
      dispatch(updateBulkEdit(false));
    } else if (text === UNPIN) {
      dispatch(unpinLinks(selectedLinkIds));
      dispatch(updateBulkEdit(false));
    } else if (text === MANAGE_TAGS) {
      dispatch(updateTagEditorPopup(true, true));
    } else {
      console.log(`In BulkEditMenuPopup, invalid text: ${text}`);
    }
    didClick.current = true;
  };

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
    if (isShown) {
      didClick.current = false;
    } else {
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

  let menu = [];
  const rListName = [MY_LIST, ARCHIVE, TRASH].includes(listName) ? listName : MY_LIST;
  if (queryString === '') {
    if (rListName === MY_LIST && getAllListNames(listNameMap).length > 3) {
      menu.push(MOVE_TO);
    }
  }
  menu = [...menu, MANAGE_TAGS, PIN, UNPIN]

  const hdClassNames = isAnimTypeB ? 'h-14' : 'h-11';
  const btnClassNames = isAnimTypeB ? 'py-4' : 'py-2.5';
  const buttons = (
    <React.Fragment>
      <View style={tailwind(`flex-row items-center justify-start pl-4 pr-4 pt-1 ${hdClassNames}`)}>
        <Text style={tailwind('text-left text-sm font-semibold text-gray-600 blk:text-gray-200')} numberOfLines={1} ellipsizeMode="tail">Actions</Text>
      </View>
      {menu.map(text => {
        return (
          <TouchableOpacity key={text} onPress={() => onMenuPopupClick(text)} style={tailwind(`w-full pl-4 pr-4 ${btnClassNames}`)}>
            <Text style={tailwind('text-left text-sm font-normal text-gray-700 blk:text-gray-200')} numberOfLines={1} ellipsizeMode="tail">{text}</Text>
          </TouchableOpacity>
        );
      })}
    </React.Fragment>
  );

  let popupClassNames = 'absolute z-41 min-w-36 bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800';
  if (isAnimTypeB) popupClassNames += ' pb-2.5';
  else popupClassNames += ' pb-1';

  let panel;
  let bgStyle = { opacity: 0 };
  if (popupSize) {
    if (isAnimTypeB) {
      const popupStyle = { height: popupSize.height };
      popupClassNames += ' inset-x-0 bottom-0 rounded-t-lg';

      panel = (
        <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), popupStyle]}>
          {buttons}
        </Animated.View>
      );
    } else {
      const maxHeight = safeAreaHeight - 16;
      const layouts = createLayouts(
        derivedAnchorPosition,
        { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
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
      /* @ts-expect-error */
      bgStyle = { opacity: popupAnim };

      panel = (
        <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), popupStyle]}>
          {buttons}
        </Animated.View>
      );
    }
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

export default React.memo(BulkEditMenuPopup);
