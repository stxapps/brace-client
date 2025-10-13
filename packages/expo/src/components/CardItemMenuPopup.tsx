import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ScrollView, View, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  updateSelectingLinkId, moveLinks, pinLinks, updateDeleteAction, updateListNamesMode,
  updateCustomEditorPopup, updateTagEditorPopup,
} from '../actions/chunk';
import {
  MY_LIST, TRASH, ADDING, MOVING, UPDATING, EXTRD_UPDATING, COPY_LINK, ARCHIVE, REMOVE,
  RESTORE, DELETE, MOVE_TO, CHANGE, PIN, MANAGE_PIN, PINNED, CARD_ITEM_MENU_POPUP,
  LIST_NAMES_POPUP, PIN_MENU_POPUP, CONFIRM_DELETE_POPUP, LG_WIDTH, LAYOUT_LIST,
  DELETE_ACTION_LINK_ITEM_MENU, LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
  ADD_TAGS, MANAGE_TAGS, TAGGED,
} from '../types/const';
import {
  getLayoutType, makeGetPinStatus, makeGetTagStatus, getPopupLink,
} from '../selectors';
import { isObject, getListNameDisplayName, getLastHalfHeight, toPx } from '../utils';
import { popupFMV } from '../types/animConfigs';
import { computePositionTranslate } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import Text from './CustomText';

const CARD_ITEM_POPUP_MENU = {
  [MY_LIST]: [COPY_LINK, ARCHIVE, REMOVE, MOVE_TO],
  [TRASH]: [COPY_LINK, RESTORE, DELETE],
  [ARCHIVE]: [COPY_LINK, REMOVE, MOVE_TO],
};
const QUERY_STRING_MENU = [COPY_LINK, REMOVE];

const CardItemMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const getTagStatus = useMemo(makeGetTagStatus, []);
  const isShown = useSelector(state => state.display.isCardItemMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.cardItemMenuPopupPosition);
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const popupLink = useSelector(state => getPopupLink(state));
  const pinStatus = useSelector(state => getPinStatus(state, popupLink));
  const tagStatus = useSelector(state => getTagStatus(state, popupLink));
  const layoutType = useSelector(state => getLayoutType(state));
  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const populateMenu = () => {
    let menu = null;
    if (listName in CARD_ITEM_POPUP_MENU) {
      menu = CARD_ITEM_POPUP_MENU[listName];
    } else {
      menu = CARD_ITEM_POPUP_MENU[MY_LIST];
    }
    if (queryString) menu = QUERY_STRING_MENU;

    if (
      !isObject(popupLink) ||
      [ADDING, MOVING, UPDATING, EXTRD_UPDATING].includes(popupLink.status) ||
      ![null, PINNED].includes(pinStatus) ||
      ![null, TAGGED].includes(tagStatus)
    ) {
      menu = menu.slice(0, 1);
    } else if (listName !== TRASH || queryString) {
      if (tagStatus === TAGGED) menu = [...menu, MANAGE_TAGS];
      else if (tagStatus === null) menu = [...menu, ADD_TAGS];

      if (pinStatus === PINNED) menu = [...menu, MANAGE_PIN];
      else if (pinStatus === null) menu = [...menu, PIN];

      menu = [...menu, CHANGE];
    }

    if (layoutType === LAYOUT_LIST && safeAreaWidth >= toPx(LG_WIDTH)) {
      menu = menu.filter(text => ![ARCHIVE, REMOVE, RESTORE].includes(text));
    }

    return { menu };
  };

  const onMenuPopupClick = (text) => {
    if (!text || didClick.current || !isObject(popupLink)) return;

    const { id, url } = popupLink;

    if (text === COPY_LINK) {
      dispatch(updatePopup(CARD_ITEM_MENU_POPUP, false));
      Clipboard.setString(url);
    } else if (text === ARCHIVE) {
      dispatch(updatePopup(CARD_ITEM_MENU_POPUP, false));
      dispatch(moveLinks(ARCHIVE, [id]));
    } else if (text === REMOVE) {
      dispatch(updatePopup(CARD_ITEM_MENU_POPUP, false));
      dispatch(moveLinks(TRASH, [id]));
    } else if (text === RESTORE) {
      dispatch(updatePopup(CARD_ITEM_MENU_POPUP, false));
      dispatch(moveLinks(MY_LIST, [id]));
    } else if (text === DELETE) {
      dispatch(updateDeleteAction(DELETE_ACTION_LINK_ITEM_MENU));
      dispatch(updatePopup(CONFIRM_DELETE_POPUP, true));
      return;
    } else if (text === MOVE_TO) {
      dispatch(updateSelectingLinkId(id));
      dispatch(updateListNamesMode(
        LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
      ));
      dispatch(updatePopup(
        LIST_NAMES_POPUP, true, anchorPosition, CARD_ITEM_MENU_POPUP,
      ));
    } else if (text === PIN) {
      dispatch(pinLinks([id], CARD_ITEM_MENU_POPUP));
    } else if (text === MANAGE_PIN) {
      dispatch(updateSelectingLinkId(id));
      dispatch(updatePopup(
        PIN_MENU_POPUP, true, anchorPosition, CARD_ITEM_MENU_POPUP,
      ));
    } else if (text === ADD_TAGS || text === MANAGE_TAGS) {
      dispatch(updateSelectingLinkId(id));
      dispatch(updateTagEditorPopup(true, text === ADD_TAGS, CARD_ITEM_MENU_POPUP));
    } else if (text === CHANGE) {
      dispatch(updateCustomEditorPopup(true, id, CARD_ITEM_MENU_POPUP));
    } else {
      console.log(`In CardItemMenuPopup, invalid text: ${text}`);
    }

    didClick.current = true;
  };

  const onCancelBtnClick = useCallback(() => {
    dispatch(updatePopup(CARD_ITEM_MENU_POPUP, false));
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
    if (isShown) {
      didClick.current = false;
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        requestAnimationFrame(() => {
          if (didMount) {
            setPopupSize(null);
            setDidCloseAnimEnd(true);
          }
        });
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

  const { menu } = populateMenu();
  const buttons = (
    <ScrollView>
      <View style={tailwind('py-2')}>
        {menu.map(text => {
          let displayText = text;
          if (text === ARCHIVE) displayText = getListNameDisplayName(text, listNameMap);
          return (
            <TouchableOpacity key={text} onPress={() => onMenuPopupClick(text)} style={tailwind('h-10 w-full justify-center pl-4 pr-4')}>
              <Text style={tailwind('text-left text-sm font-normal text-gray-700 blk:text-gray-200')} numberOfLines={1} ellipsizeMode="tail">{displayText}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const popupClassNames = 'absolute z-41 min-w-32 max-w-64 overflow-hidden rounded-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800';

  let panel, bgStyle = { opacity: 0 };
  if (popupSize) {
    const maxHeight = getLastHalfHeight(safeAreaHeight - 16, 40, 8, 0, 0.55);
    const posTrn = computePositionTranslate(
      derivedAnchorPosition,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { width: safeAreaWidth, height: safeAreaHeight },
      null,
      insets,
      8,
    );

    const popupStyle = {
      top: posTrn.top, left: posTrn.left, maxHeight, opacity: popupAnim, transform: [],
    };
    popupStyle.transform.push({
      translateX: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [posTrn.startX, 0],
      }),
    });
    popupStyle.transform.push({
      translateY: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [posTrn.startY, 0],
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
  } else {
    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { top: safeAreaHeight + 256, left: safeAreaWidth + 256 }]}>
        {buttons}
      </Animated.View>
    );
  }

  return (
    <View style={tailwind('absolute inset-0 z-40')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

export default React.memo(CardItemMenuPopup);
