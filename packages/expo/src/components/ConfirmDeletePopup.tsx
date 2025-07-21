import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import { updatePopup, updateBulkEdit } from '../actions';
import { deleteLinks, deleteListNames, deleteTagNames } from '../actions/chunk';
import {
  CARD_ITEM_MENU_POPUP, CONFIRM_DELETE_POPUP, DELETE_ACTION_LINK_COMMANDS,
  DELETE_ACTION_LINK_ITEM_MENU, DELETE_ACTION_LIST_NAME, DELETE_ACTION_TAG_NAME,
  SM_WIDTH,
} from '../types/const';
import { dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const ConfirmDeletePopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isConfirmDeletePopupShown);
  const deleteAction = useSelector(state => state.display.deleteAction);
  const selectedLinkIds = useSelector(state => state.display.selectedLinkIds);
  const selectingLinkId = useSelector(state => state.display.selectingLinkId);
  const selectingListName = useSelector(state => state.display.selectingListName);
  const selectingTagName = useSelector(state => state.display.selectingTagName);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onConfirmDeleteCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(CONFIRM_DELETE_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onConfirmDeleteOkBtnClick = () => {
    if (didClick.current) return;

    if (deleteAction === DELETE_ACTION_LINK_COMMANDS) {
      dispatch(deleteLinks(selectedLinkIds));
      dispatch(updatePopup(CONFIRM_DELETE_POPUP, false));
      dispatch(updateBulkEdit(false));
    } else if (deleteAction === DELETE_ACTION_LINK_ITEM_MENU) {
      dispatch(deleteLinks([selectingLinkId]));
      dispatch(updatePopup(CONFIRM_DELETE_POPUP, false));
      dispatch(updatePopup(CARD_ITEM_MENU_POPUP, false));
    } else if (deleteAction === DELETE_ACTION_LIST_NAME) {
      dispatch(deleteListNames([selectingListName]));
      dispatch(updatePopup(CONFIRM_DELETE_POPUP, false));
    } else if (deleteAction === DELETE_ACTION_TAG_NAME) {
      dispatch(deleteTagNames([selectingTagName]));
      dispatch(updatePopup(CONFIRM_DELETE_POPUP, false));
    } else {
      console.log('In ConfirmDeletePopup, invalid deleteAction: ', deleteAction);
      return; // Don't set didClick to true
    }

    didClick.current = true;
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onConfirmDeleteCancelBtnClick();
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
  }, [onConfirmDeleteCancelBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...dialogFMV.visible }).start();
      didClick.current = false;
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...dialogFMV.hidden }).start(() => {
        requestAnimationFrame(() => {
          if (didMount) setDidCloseAnimEnd(true);
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

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };
  const popupStyle = {
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ],
  };
  const bgStyle = { opacity: popupAnim };

  const cancelBtnStyle: any = {};
  if (safeAreaWidth < SM_WIDTH) {
    cancelBtnStyle.paddingTop = 7;
    cancelBtnStyle.paddingBottom = 7;
  }

  return (
    <View style={[tailwind('absolute inset-0 z-50'), canvasStyle]}>
      <TouchableWithoutFeedback onPress={onConfirmDeleteCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      <View style={tailwind('flex-1 items-center justify-end px-4 pt-4 pb-20 sm:justify-center sm:p-0')}>
        <Animated.View style={[tailwind('w-full max-w-lg rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800 sm:my-8 sm:p-6'), popupStyle]}>
          <View style={tailwind('items-center sm:flex-row sm:items-start')}>
            <View style={tailwind('h-12 w-12 flex-shrink-0 flex-grow-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10')}>
              <Svg width={24} height={24} style={tailwind('font-normal text-red-600')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </Svg>
            </View>
            <View style={tailwind('mt-3 flex-shrink flex-grow sm:mt-0 sm:ml-4')}>
              <Text style={tailwind('text-center text-lg font-medium leading-6 text-gray-900 blk:text-white sm:text-left')}>Confirm delete?</Text>
              <View style={tailwind('mt-2')}>
                <Text style={tailwind('text-center text-sm font-normal text-gray-500 blk:text-gray-400 sm:text-left')}>Are you sure you want to permanently delete? This action cannot be undone.</Text>
              </View>
            </View>
          </View>
          <View style={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:flex-row sm:pl-4')}>
            <TouchableOpacity onPress={onConfirmDeleteOkBtnClick} style={tailwind('w-full rounded-full border border-red-600 bg-red-600 py-2 blk:border-red-500 blk:bg-red-500 sm:w-auto sm:px-3.5 sm:py-1.5')}>
              <Text style={tailwind('text-center text-base font-medium text-white sm:rounded-full sm:text-sm')}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirmDeleteCancelBtnClick} style={[tailwind('mt-3 w-full rounded-full border border-gray-400 bg-white blk:border-gray-400 blk:bg-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:px-3 sm:py-1.5'), cancelBtnStyle]}>
              <Text style={tailwind('text-center text-base font-normal text-gray-500 blk:text-gray-300 sm:text-sm')}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

export default React.memo(ConfirmDeletePopup);
