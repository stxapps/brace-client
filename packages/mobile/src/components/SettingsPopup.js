import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
  BackHandler, PanResponder, Linking, Platform, Keyboard,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import { updateSettingsPopup, updateSettingsViewId } from '../actions/chunk';
import {
  SETTINGS_VIEW_ACCOUNT, SETTINGS_VIEW_IAP, SETTINGS_VIEW_IAP_RESTORE,
  SETTINGS_VIEW_DATA, SETTINGS_VIEW_DATA_IMPORT, SETTINGS_VIEW_DATA_EXPORT,
  SETTINGS_VIEW_DATA_DELETE, SETTINGS_VIEW_LISTS, SETTINGS_VIEW_TAGS, SETTINGS_VIEW_MISC,
  SETTINGS_VIEW_ABOUT, DOMAIN_NAME, HASH_SUPPORT, MD_WIDTH, LG_WIDTH, MERGING,
  DIED_MERGING, BLK_MODE,
} from '../types/const';
import { getThemeMode } from '../selectors';
import { dialogFMV, sidebarFMV, popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

import SettingsPopupAccount from './SettingsPopupAccount';
import { SettingsPopupIap, SettingsPopupIapRestore } from './SettingsPopupIap';
import {
  SettingsPopupData, SettingsPopupDataImport, SettingsPopupDataExport,
  SettingsPopupDataDelete,
} from './SettingsPopupData';
import SettingsPopupLists from './SettingsPopupLists';
import SettingsPopupTags from './SettingsPopupTags';
import SettingsPopupMisc from './SettingsPopupMisc';
import SettingsPopupAbout from './SettingsPopupAbout';
import SettingsPopupConflict from './SettingsPopupConflict';

const VIEW_ACCOUNT = SETTINGS_VIEW_ACCOUNT;
const VIEW_IAP = SETTINGS_VIEW_IAP;
const VIEW_IAP_RESTORE = SETTINGS_VIEW_IAP_RESTORE;
const VIEW_DATA = SETTINGS_VIEW_DATA;
const VIEW_DATA_IMPORT = SETTINGS_VIEW_DATA_IMPORT;
const VIEW_DATA_EXPORT = SETTINGS_VIEW_DATA_EXPORT;
const VIEW_DATA_DELETE = SETTINGS_VIEW_DATA_DELETE;
const VIEW_LISTS = SETTINGS_VIEW_LISTS;
const VIEW_TAGS = SETTINGS_VIEW_TAGS;
const VIEW_MISC = SETTINGS_VIEW_MISC;
const VIEW_ABOUT = SETTINGS_VIEW_ABOUT;

const SettingsPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isSettingsPopupShown);
  const viewId = useSelector(state => state.display.settingsViewId);
  const isSidebarShown = useSelector(state => state.display.isSettingsSidebarShown);
  const didCloseAnimEnd = useSelector(state => state.display.didSettingsCloseAnimEnd);
  const didSidebarAnimEnd = useSelector(
    state => state.display.didSettingsSidebarAnimEnd
  );
  const updateSettingsViewIdCount = useSelector(
    state => state.display.updateSettingsViewIdCount
  );
  const conflictedSettings = useSelector(state => state.conflictedSettings);
  const themeMode = useSelector(state => getThemeMode(state));
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const sidebarAnim = useRef(new Animated.Value(0)).current;
  const mergeErrorAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const panelContent = useRef(null);
  const didSwipeToOpenSidebar = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const shouldSetPanResponder = useCallback((_, gestureState) => {
    if (gestureState.numberActiveTouches > 1) return false;

    const maxX = (safeAreaWidth + insets.left + insets.right) * 0.25;
    const isSwipingX = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;

    didSwipeToOpenSidebar.current = false;
    if (!isSidebarShown) {
      if (gestureState.moveX > maxX) return false;
      if (isSwipingX && gestureState.dx > 5) {
        didSwipeToOpenSidebar.current = true;
        dispatch(updateSettingsViewId(null, true, null, false));
        return true;
      }
      return false;
    } else if (isSidebarShown) {
      return isSwipingX && gestureState.dx < -1;
    }

    return false;
  }, [isSidebarShown, safeAreaWidth, insets, dispatch]);

  const onPanResponderMove = useCallback((_, gestureState) => {
    const width = safeAreaWidth + insets.left + insets.right;

    if (isSidebarShown && !didSwipeToOpenSidebar.current) {
      const moveRatio = Math.abs(Math.min(0, gestureState.dx) / width);
      sidebarAnim.setValue(1.0 - moveRatio);
    }
  }, [isSidebarShown, safeAreaWidth, insets, sidebarAnim]);

  const onPanResponderRelease = useCallback((_, gestureState) => {
    if (isSidebarShown && !didSwipeToOpenSidebar.current) {
      if (gestureState.dx > -40) {
        Animated.timing(
          sidebarAnim, { toValue: 1, ...sidebarFMV.visible, duration: 200 }
        ).start();
      } else {
        Animated.timing(
          sidebarAnim, { toValue: 0, ...sidebarFMV.visible, duration: 200 }
        ).start(() => {
          dispatch(updateSettingsViewId(null, false, null, true));
        });
      }
    }
  }, [isSidebarShown, dispatch, sidebarAnim]);

  const viewPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: shouldSetPanResponder,
      onMoveShouldSetPanResponder: shouldSetPanResponder,
      onPanResponderMove: onPanResponderMove,
      onPanResponderRelease: onPanResponderRelease,
      onPanResponderTerminate: onPanResponderRelease,
    });
  }, [shouldSetPanResponder, onPanResponderMove, onPanResponderRelease]);

  const isViewSelected = (refViewId) => {
    const dataViews = [VIEW_DATA, VIEW_DATA_IMPORT, VIEW_DATA_EXPORT, VIEW_DATA_DELETE];
    if (refViewId === VIEW_DATA) {
      return dataViews.includes(viewId);
    }

    const iapViews = [VIEW_IAP, VIEW_IAP_RESTORE];
    if (refViewId === VIEW_IAP) return iapViews.includes(viewId);

    return refViewId === viewId;
  };

  const onPopupCloseBtnClick = useCallback(() => {
    dispatch(updateSettingsPopup(false, true));
  }, [dispatch]);

  const onSidebarOpenBtnClick = () => {
    dispatch(updateSettingsViewId(null, true, null, false));
  };

  const onSidebarCloseBtnClick = () => {
    dispatch(updateSettingsViewId(null, false, null, false));
  };

  const onAccountBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_ACCOUNT, false, null, false));
  };

  const onIapBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_IAP, false, null, false));
  };

  const onDataBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA, false, null, false));
  };

  const onListsBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_LISTS, false, null, false));
  };

  const onTagsBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_TAGS, false, null, false));
  };

  const onMiscBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_MISC, false, null, false));
  };

  const onAboutBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_ABOUT, false, null, false));
  };

  const onToRestoreIapViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_IAP_RESTORE));
  };

  const onBackToIapViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_IAP, false, null, true));
  };

  const onToImportAllDataViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA_IMPORT, null));
  };

  const onToExportAllDataViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA_EXPORT, null));
  };

  const onToDeleteAllDataViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA_DELETE));
  };

  const onBackToDataViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA, false, null, true));
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onPopupCloseBtnClick();
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
  }, [onPopupCloseBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...dialogFMV.visible }).start();
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...dialogFMV.hidden }).start(() => {
        if (didMount) {
          dispatch(updateSettingsViewId(null, null, true));
        }
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [isShown, popupAnim, registerPopupBackHandler, dispatch]);

  useEffect(() => {
    // updateSettingsViewIdCount makes sure this useEffect is called every time,
    //   i.e. when click and click make didSidebarAnimEnd: false -> true -> false.
    let didMount = true;
    if (isSidebarShown) {
      Animated.timing(sidebarAnim, { toValue: 1, ...sidebarFMV.visible }).start(() => {
        if (didMount) dispatch(updateSettingsViewId(null, null, null, true));
      });
      Keyboard.dismiss();
    } else {
      Animated.timing(sidebarAnim, { toValue: 0, ...sidebarFMV.hidden }).start(() => {
        if (didMount) dispatch(updateSettingsViewId(null, null, null, true));
      });
    }

    return () => {
      didMount = false;
    };
  }, [isSidebarShown, updateSettingsViewIdCount, sidebarAnim, dispatch]);

  useEffect(() => {
    if (conflictedSettings.status === DIED_MERGING) {
      Animated.timing(mergeErrorAnim, { toValue: 1, ...popupFMV.visible }).start();
    } else {
      Animated.timing(mergeErrorAnim, { toValue: 0, ...popupFMV.visible }).start();
    }
  }, [conflictedSettings.status, mergeErrorAnim]);

  useEffect(() => {
    if (panelContent.current) {
      setTimeout(() => {
        if (panelContent.current) {
          panelContent.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      }, 1);
    }
  }, [viewId]);

  if (derivedIsShown !== isShown) {
    if (!derivedIsShown && isShown) {
      if (isSidebarShown) sidebarAnim.setValue(1);
      else sidebarAnim.setValue(0);
    }
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };

  const _renderPanelCloseBtn = () => {
    const MAX_W_6XL = 1152; // If change max-w-6xl below, need to update this too.
    const closeBtnStyle = { top: 0, right: 0 };
    if (safeAreaWidth >= LG_WIDTH) closeBtnStyle.right = 6;
    if (safeAreaWidth >= MAX_W_6XL) {
      closeBtnStyle.right = 6 + ((safeAreaWidth - MAX_W_6XL) / 2);
    }
    const closeBtnSvgWidth = safeAreaWidth < MD_WIDTH ? 20 : 28;

    return (
      <View style={[tailwind('absolute'), closeBtnStyle]}>
        <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('h-12 w-12 items-center justify-center')}>
          <View style={tailwind('rounded-full bg-white blk:bg-gray-900')}>
            <Svg style={tailwind('font-normal text-gray-300 blk:text-gray-600')} width={closeBtnSvgWidth} height={closeBtnSvgWidth} stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </Svg>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const _renderPanel = (content) => {
    return (
      <ScrollView ref={panelContent} style={tailwind('flex-1')} automaticallyAdjustKeyboardInsets={true} keyboardShouldPersistTaps="handled">
        <View style={tailwind('items-center justify-start')}>
          <View style={tailwind('w-full max-w-6xl items-center justify-start')}>
            {content}
          </View>
        </View>
      </ScrollView>
    );
  };

  const _render = (content) => {
    let reviewUrl = DOMAIN_NAME + '/' + HASH_SUPPORT;
    if (Platform.OS === 'ios') reviewUrl = 'https://apps.apple.com/app/id1531456778?action=write-review';
    else if (Platform.OS === 'android') reviewUrl = 'https://play.google.com/store/apps/details?id=com.bracedotto';

    const sidebarCanvasStyleClasses = !isSidebarShown && didSidebarAnimEnd ? 'hidden relative' : 'absolute inset-0';
    const sidebarStyle = {
      transform: [{
        translateX: sidebarAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-1 * (224 /* (max-w-56) */ + insets.left), 0],
          extrapolate: 'clamp',
        }),
      }],
    };
    const sidebarCloseBtnStyle = { opacity: sidebarAnim };

    const selectedMenuBtnStyleClasses = 'bg-gray-100 blk:bg-gray-800';
    const menuBtnStyleClasses = '';

    const selectedMenuTextStyleClasses = 'text-gray-800 blk:text-gray-100';
    const menuTextStyleClasses = 'text-gray-500 blk:text-gray-400';

    const selectedMenuSvgStyleClasses = 'text-gray-500 blk:text-gray-200';
    const menuSvgStyleClasses = 'text-gray-400 blk:text-gray-400';

    const contentWithSidebar = (
      <View key="panel-with-sidebar" style={tailwind('w-full max-w-4xl px-0 md:px-6 lg:px-8')}>
        <View style={tailwind('hidden border-b border-gray-200 blk:border-gray-700 md:flex md:pt-12')}>
          <Text style={tailwind('pb-4 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100')}>Settings</Text>
        </View>
        <View style={tailwind('flex-1 flex-row')}>
          {/* Sidebar for desktop */}
          <View key="sidebar-for-desktop" style={tailwind('hidden md:flex md:flex-shrink-0 md:flex-grow-0')}>
            <View style={tailwind('mt-2 mb-6 min-h-xl w-48 border-r border-gray-200 blk:border-gray-700')}>
              <View style={tailwind('mt-2 pr-2')}>
                <TouchableOpacity onPress={onAccountBtnClick} style={tailwind(`w-full flex-row items-center rounded-md px-2 py-2 ${isViewSelected(VIEW_ACCOUNT) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_ACCOUNT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_ACCOUNT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onIapBtnClick} style={tailwind(`mt-2 w-full flex-row items-center rounded-md px-2 py-2 ${isViewSelected(VIEW_IAP) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_IAP) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M5 2C5.26522 2 5.51957 2.10536 5.70711 2.29289C5.89464 2.48043 6 2.73478 6 3V4H7C7.26522 4 7.51957 4.10536 7.70711 4.29289C7.89464 4.48043 8 4.73478 8 5C8 5.26522 7.89464 5.51957 7.70711 5.70711C7.51957 5.89464 7.26522 6 7 6H6V7C6 7.26522 5.89464 7.51957 5.70711 7.70711C5.51957 7.89464 5.26522 8 5 8C4.73478 8 4.48043 7.89464 4.29289 7.70711C4.10536 7.51957 4 7.26522 4 7V6H3C2.73478 6 2.48043 5.89464 2.29289 5.70711C2.10536 5.51957 2 5.26522 2 5C2 4.73478 2.10536 4.48043 2.29289 4.29289C2.48043 4.10536 2.73478 4 3 4H4V3C4 2.73478 4.10536 2.48043 4.29289 2.29289C4.48043 2.10536 4.73478 2 5 2ZM5 12C5.26522 12 5.51957 12.1054 5.70711 12.2929C5.89464 12.4804 6 12.7348 6 13V14H7C7.26522 14 7.51957 14.1054 7.70711 14.2929C7.89464 14.4804 8 14.7348 8 15C8 15.2652 7.89464 15.5196 7.70711 15.7071C7.51957 15.8946 7.26522 16 7 16H6V17C6 17.2652 5.89464 17.5196 5.70711 17.7071C5.51957 17.8946 5.26522 18 5 18C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V16H3C2.73478 16 2.48043 15.8946 2.29289 15.7071C2.10536 15.5196 2 15.2652 2 15C2 14.7348 2.10536 14.4804 2.29289 14.2929C2.48043 14.1054 2.73478 14 3 14H4V13C4 12.7348 4.10536 12.4804 4.29289 12.2929C4.48043 12.1054 4.73478 12 5 12ZM12 2C12.2207 1.99993 12.4352 2.07286 12.6101 2.20744C12.785 2.34201 12.9105 2.53066 12.967 2.744L14.146 7.2L17.5 9.134C17.652 9.22177 17.7782 9.34801 17.866 9.50002C17.9538 9.65204 18 9.82447 18 10C18 10.1755 17.9538 10.348 17.866 10.5C17.7782 10.652 17.652 10.7782 17.5 10.866L14.146 12.801L12.966 17.256C12.9094 17.4691 12.7839 17.6576 12.6091 17.792C12.4343 17.9264 12.22 17.9993 11.9995 17.9993C11.779 17.9993 11.5647 17.9264 11.3899 17.792C11.2151 17.6576 11.0896 17.4691 11.033 17.256L9.854 12.8L6.5 10.866C6.34799 10.7782 6.22177 10.652 6.13401 10.5C6.04625 10.348 6.00004 10.1755 6.00004 10C6.00004 9.82447 6.04625 9.65204 6.13401 9.50002C6.22177 9.34801 6.34799 9.22177 6.5 9.134L9.854 7.199L11.034 2.744C11.0905 2.53083 11.2158 2.3423 11.3905 2.20774C11.5652 2.07318 11.7795 2.00015 12 2Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_IAP) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Subscription</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDataBtnClick} style={tailwind(`mt-2 w-full flex-row items-center rounded-md px-2 py-2 ${isViewSelected(VIEW_DATA) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_DATA) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_DATA) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onListsBtnClick} style={tailwind(`mt-2 w-full flex-row items-center rounded-md px-2 py-2 ${isViewSelected(VIEW_LISTS) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_LISTS) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_LISTS) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Lists</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onTagsBtnClick} style={tailwind(`mt-2 w-full flex-row items-center rounded-md px-2 py-2 ${isViewSelected(VIEW_TAGS) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_TAGS) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M17.707 9.293C17.8945 9.48053 17.9998 9.73484 17.9998 10C17.9998 10.2652 17.8945 10.5195 17.707 10.707L10.707 17.707C10.5195 17.8945 10.2652 17.9998 10 17.9998C9.73484 17.9998 9.48053 17.8945 9.293 17.707L2.293 10.707C2.2 10.6143 2.12624 10.5041 2.07596 10.3827C2.02568 10.2614 1.99986 10.1313 2 10V5C2 4.20435 2.31607 3.44129 2.87868 2.87868C3.44129 2.31607 4.20435 2 5 2H10C10.256 2 10.512 2.098 10.707 2.293L17.707 9.293ZM5 6C5.26522 6 5.51957 5.89464 5.70711 5.70711C5.89464 5.51957 6 5.26522 6 5C6 4.73478 5.89464 4.48043 5.70711 4.29289C5.51957 4.10536 5.26522 4 5 4C4.73478 4 4.48043 4.10536 4.29289 4.29289C4.10536 4.48043 4 4.73478 4 5C4 5.26522 4.10536 5.51957 4.29289 5.70711C4.48043 5.89464 4.73478 6 5 6Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_TAGS) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Tags</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onMiscBtnClick} style={tailwind(`mt-2 w-full flex-row items-center rounded-md px-2 py-2 ${isViewSelected(VIEW_MISC) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_MISC) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                    <Path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                    <Path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_MISC) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Misc.</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onAboutBtnClick} style={tailwind(`mt-2 w-full flex-row items-center rounded-md px-2 py-2 ${isViewSelected(VIEW_ABOUT) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_ABOUT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10ZM11 6C11 6.26522 10.8946 6.51957 10.7071 6.70711C10.5196 6.89464 10.2652 7 10 7C9.73478 7 9.48043 6.89464 9.29289 6.70711C9.10536 6.51957 9 6.26522 9 6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6ZM9 9C8.73478 9 8.48043 9.10536 8.29289 9.29289C8.10536 9.48043 8 9.73478 8 10C8 10.2652 8.10536 10.5196 8.29289 10.7071C8.48043 10.8946 8.73478 11 9 11V14C9 14.2652 9.10536 14.5196 9.29289 14.7071C9.48043 14.8946 9.73478 15 10 15H11C11.2652 15 11.5196 14.8946 11.7071 14.7071C11.8946 14.5196 12 14.2652 12 14C12 13.7348 11.8946 13.4804 11.7071 13.2929C11.5196 13.1054 11.2652 13 11 13V10C11 9.73478 10.8946 9.48043 10.7071 9.29289C10.5196 9.10536 10.2652 9 10 9H9Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_ABOUT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>About</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL(reviewUrl)} style={tailwind(`mt-2 w-full flex-row items-center rounded-md px-2 py-2 ${menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M9.04897 2.927C9.34897 2.006 10.652 2.006 10.951 2.927L12.021 6.219C12.0863 6.41949 12.2134 6.59418 12.384 6.71811C12.5547 6.84203 12.7601 6.90885 12.971 6.909H16.433C17.402 6.909 17.804 8.149 17.021 8.719L14.221 10.753C14.05 10.877 13.9227 11.052 13.8573 11.2529C13.7919 11.4537 13.7918 11.6701 13.857 11.871L14.927 15.163C15.227 16.084 14.172 16.851 13.387 16.281L10.587 14.247C10.4162 14.123 10.2105 14.0562 9.99947 14.0562C9.78842 14.0562 9.58277 14.123 9.41197 14.247L6.61197 16.281C5.82797 16.851 4.77397 16.084 5.07297 15.163L6.14297 11.871C6.20815 11.6701 6.20803 11.4537 6.14264 11.2529C6.07725 11.052 5.94994 10.877 5.77897 10.753L2.97997 8.72C2.19697 8.15 2.59997 6.91 3.56797 6.91H7.02897C7.24002 6.91006 7.44568 6.84334 7.6165 6.7194C7.78732 6.59546 7.91455 6.42065 7.97997 6.22L9.04997 2.928L9.04897 2.927Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${menuTextStyleClasses}`)}>Review us</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* Main panel */}
          <View key="panel-content" style={tailwind('flex-shrink flex-grow')}>
            {content}
          </View>
        </View>
      </View>
    );

    return (
      <View {...viewPanResponder.panHandlers} style={[tailwind('absolute inset-0 z-30 bg-white blk:bg-gray-900'), canvasStyle]}>
        <View style={tailwind('flex-1')}>
          {_renderPanel(contentWithSidebar)}
          {_renderPanelCloseBtn()}
          {/* Sidebar for mobile */}
          <View key="sidebar-for-mobile" style={tailwind(`md:relative md:hidden ${sidebarCanvasStyleClasses}`)}>
            <View style={tailwind('flex h-full flex-row')}>
              <TouchableWithoutFeedback onPress={onSidebarCloseBtnClick}>
                <Animated.View style={[tailwind('absolute inset-0 bg-gray-100 blk:bg-gray-800'), sidebarCloseBtnStyle]} />
              </TouchableWithoutFeedback>
              <Animated.View style={[tailwind('w-full max-w-56 flex-1 bg-white blk:bg-gray-900'), sidebarStyle]}>
                <ScrollView style={tailwind('flex-1')}>
                  <View style={tailwind('pt-8 pb-4')}>
                    <View style={tailwind('flex-shrink-0 flex-row items-center px-4')}>
                      <Text style={tailwind('text-xl font-medium leading-6 text-gray-800 blk:text-gray-100')}>Settings</Text>
                    </View>
                    <View style={tailwind('mt-6 px-2')}>
                      <TouchableOpacity onPress={onAccountBtnClick} style={tailwind('w-full flex-row items-center rounded-md px-2 py-2.5')}>
                        <Svg style={tailwind('mr-2 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                          <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                        </Svg>
                        <Text style={tailwind('text-base font-medium leading-5 text-gray-500 blk:text-gray-400')}>Account</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onIapBtnClick} style={tailwind('mt-2 w-full flex-row items-center rounded-md px-2 py-2.5')}>
                        <Svg style={tailwind('mr-2 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                          <Path fillRule="evenodd" clipRule="evenodd" d="M5 2C5.26522 2 5.51957 2.10536 5.70711 2.29289C5.89464 2.48043 6 2.73478 6 3V4H7C7.26522 4 7.51957 4.10536 7.70711 4.29289C7.89464 4.48043 8 4.73478 8 5C8 5.26522 7.89464 5.51957 7.70711 5.70711C7.51957 5.89464 7.26522 6 7 6H6V7C6 7.26522 5.89464 7.51957 5.70711 7.70711C5.51957 7.89464 5.26522 8 5 8C4.73478 8 4.48043 7.89464 4.29289 7.70711C4.10536 7.51957 4 7.26522 4 7V6H3C2.73478 6 2.48043 5.89464 2.29289 5.70711C2.10536 5.51957 2 5.26522 2 5C2 4.73478 2.10536 4.48043 2.29289 4.29289C2.48043 4.10536 2.73478 4 3 4H4V3C4 2.73478 4.10536 2.48043 4.29289 2.29289C4.48043 2.10536 4.73478 2 5 2ZM5 12C5.26522 12 5.51957 12.1054 5.70711 12.2929C5.89464 12.4804 6 12.7348 6 13V14H7C7.26522 14 7.51957 14.1054 7.70711 14.2929C7.89464 14.4804 8 14.7348 8 15C8 15.2652 7.89464 15.5196 7.70711 15.7071C7.51957 15.8946 7.26522 16 7 16H6V17C6 17.2652 5.89464 17.5196 5.70711 17.7071C5.51957 17.8946 5.26522 18 5 18C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V16H3C2.73478 16 2.48043 15.8946 2.29289 15.7071C2.10536 15.5196 2 15.2652 2 15C2 14.7348 2.10536 14.4804 2.29289 14.2929C2.48043 14.1054 2.73478 14 3 14H4V13C4 12.7348 4.10536 12.4804 4.29289 12.2929C4.48043 12.1054 4.73478 12 5 12ZM12 2C12.2207 1.99993 12.4352 2.07286 12.6101 2.20744C12.785 2.34201 12.9105 2.53066 12.967 2.744L14.146 7.2L17.5 9.134C17.652 9.22177 17.7782 9.34801 17.866 9.50002C17.9538 9.65204 18 9.82447 18 10C18 10.1755 17.9538 10.348 17.866 10.5C17.7782 10.652 17.652 10.7782 17.5 10.866L14.146 12.801L12.966 17.256C12.9094 17.4691 12.7839 17.6576 12.6091 17.792C12.4343 17.9264 12.22 17.9993 11.9995 17.9993C11.779 17.9993 11.5647 17.9264 11.3899 17.792C11.2151 17.6576 11.0896 17.4691 11.033 17.256L9.854 12.8L6.5 10.866C6.34799 10.7782 6.22177 10.652 6.13401 10.5C6.04625 10.348 6.00004 10.1755 6.00004 10C6.00004 9.82447 6.04625 9.65204 6.13401 9.50002C6.22177 9.34801 6.34799 9.22177 6.5 9.134L9.854 7.199L11.034 2.744C11.0905 2.53083 11.2158 2.3423 11.3905 2.20774C11.5652 2.07318 11.7795 2.00015 12 2Z" />
                        </Svg>
                        <Text style={tailwind('text-base font-medium leading-5 text-gray-500 blk:text-gray-400')}>Subscription</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onDataBtnClick} style={tailwind('mt-2 w-full flex-row items-center rounded-md px-2 py-2.5')}>
                        <Svg style={tailwind('mr-2 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                          <Path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                          <Path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                          <Path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                        </Svg>
                        <Text style={tailwind('text-base font-medium leading-5 text-gray-500 blk:text-gray-400')}>Data</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onListsBtnClick} style={tailwind('mt-2 w-full flex-row items-center rounded-md px-2 py-2.5')}>
                        <Svg style={tailwind('mr-2 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                          <Path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                        </Svg>
                        <Text style={tailwind('text-base font-medium leading-5 text-gray-500 blk:text-gray-400')}>Lists</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onTagsBtnClick} style={tailwind('mt-2 w-full flex-row items-center rounded-md px-2 py-2.5')}>
                        <Svg style={tailwind('mr-2 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                          <Path fillRule="evenodd" clipRule="evenodd" d="M17.707 9.293C17.8945 9.48053 17.9998 9.73484 17.9998 10C17.9998 10.2652 17.8945 10.5195 17.707 10.707L10.707 17.707C10.5195 17.8945 10.2652 17.9998 10 17.9998C9.73484 17.9998 9.48053 17.8945 9.293 17.707L2.293 10.707C2.2 10.6143 2.12624 10.5041 2.07596 10.3827C2.02568 10.2614 1.99986 10.1313 2 10V5C2 4.20435 2.31607 3.44129 2.87868 2.87868C3.44129 2.31607 4.20435 2 5 2H10C10.256 2 10.512 2.098 10.707 2.293L17.707 9.293ZM5 6C5.26522 6 5.51957 5.89464 5.70711 5.70711C5.89464 5.51957 6 5.26522 6 5C6 4.73478 5.89464 4.48043 5.70711 4.29289C5.51957 4.10536 5.26522 4 5 4C4.73478 4 4.48043 4.10536 4.29289 4.29289C4.10536 4.48043 4 4.73478 4 5C4 5.26522 4.10536 5.51957 4.29289 5.70711C4.48043 5.89464 4.73478 6 5 6Z" />
                        </Svg>
                        <Text style={tailwind('text-base font-medium leading-5 text-gray-500 blk:text-gray-400')}>Tags</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onMiscBtnClick} style={tailwind('mt-2 w-full flex-row items-center rounded-md px-2 py-2.5')}>
                        <Svg style={tailwind('mr-2 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                          <Path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                          <Path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                          <Path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                        </Svg>
                        <Text style={tailwind('text-base font-medium leading-5 text-gray-500 blk:text-gray-400')}>Misc.</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onAboutBtnClick} style={tailwind('mt-2 w-full flex-row items-center rounded-md px-2 py-2.5')}>
                        <Svg style={tailwind('mr-2 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                          <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10ZM11 6C11 6.26522 10.8946 6.51957 10.7071 6.70711C10.5196 6.89464 10.2652 7 10 7C9.73478 7 9.48043 6.89464 9.29289 6.70711C9.10536 6.51957 9 6.26522 9 6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6ZM9 9C8.73478 9 8.48043 9.10536 8.29289 9.29289C8.10536 9.48043 8 9.73478 8 10C8 10.2652 8.10536 10.5196 8.29289 10.7071C8.48043 10.8946 8.73478 11 9 11V14C9 14.2652 9.10536 14.5196 9.29289 14.7071C9.48043 14.8946 9.73478 15 10 15H11C11.2652 15 11.5196 14.8946 11.7071 14.7071C11.8946 14.5196 12 14.2652 12 14C12 13.7348 11.8946 13.4804 11.7071 13.2929C11.5196 13.1054 11.2652 13 11 13V10C11 9.73478 10.8946 9.48043 10.7071 9.29289C10.5196 9.10536 10.2652 9 10 9H9Z" />
                        </Svg>
                        <Text style={tailwind('text-base font-medium leading-5 text-gray-500 blk:text-gray-400')}>About</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => Linking.openURL(reviewUrl)} style={tailwind('mt-2 w-full flex-row items-center rounded-md px-2 py-2.5')}>
                        <Svg style={tailwind('mr-2 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                          <Path d="M9.04897 2.927C9.34897 2.006 10.652 2.006 10.951 2.927L12.021 6.219C12.0863 6.41949 12.2134 6.59418 12.384 6.71811C12.5547 6.84203 12.7601 6.90885 12.971 6.909H16.433C17.402 6.909 17.804 8.149 17.021 8.719L14.221 10.753C14.05 10.877 13.9227 11.052 13.8573 11.2529C13.7919 11.4537 13.7918 11.6701 13.857 11.871L14.927 15.163C15.227 16.084 14.172 16.851 13.387 16.281L10.587 14.247C10.4162 14.123 10.2105 14.0562 9.99947 14.0562C9.78842 14.0562 9.58277 14.123 9.41197 14.247L6.61197 16.281C5.82797 16.851 4.77397 16.084 5.07297 15.163L6.14297 11.871C6.20815 11.6701 6.20803 11.4537 6.14264 11.2529C6.07725 11.052 5.94994 10.877 5.77897 10.753L2.97997 8.72C2.19697 8.15 2.59997 6.91 3.56797 6.91H7.02897C7.24002 6.91006 7.44568 6.84334 7.6165 6.7194C7.78732 6.59546 7.91455 6.42065 7.97997 6.22L9.04997 2.928L9.04897 2.927Z" />
                        </Svg>
                        <Text style={tailwind('text-base font-medium leading-5 text-gray-500 blk:text-gray-400')}>Review us</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>
              <View style={tailwind('w-14 flex-shrink-0')}>
                {/* Force sidebar to shrink to fit close icon */}
              </View>
              <View style={tailwind('absolute top-0 right-0')}>
                <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('h-12 w-12 items-center justify-center')}>
                  <Svg style={tailwind('font-normal text-gray-300 blk:text-gray-600')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderAccountView = () => {
    const content = (
      <SettingsPopupAccount onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const renderIapView = () => {
    const content = (
      <SettingsPopupIap onSidebarOpenBtnClick={onSidebarOpenBtnClick} onToRestoreIapViewBtnClick={onToRestoreIapViewBtnClick} />
    );
    return _render(content);
  };

  const renderRestoreIapView = () => {
    const content = (
      <SettingsPopupIapRestore onBackToIapViewBtnClick={onBackToIapViewBtnClick} />
    );
    return _render(content);
  };

  const renderDataView = () => {
    const content = (
      <SettingsPopupData onSidebarOpenBtnClick={onSidebarOpenBtnClick} onToImportAllDataViewBtnClick={onToImportAllDataViewBtnClick} onToExportAllDataViewBtnClick={onToExportAllDataViewBtnClick} onToDeleteAllDataViewBtnClick={onToDeleteAllDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderImportAllDataView = () => {
    const content = (
      <SettingsPopupDataImport onBackToDataViewBtnClick={onBackToDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderExportAllDataView = () => {
    const content = (
      <SettingsPopupDataExport onBackToDataViewBtnClick={onBackToDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderDeleteAllDataView = () => {
    const content = (
      /* @ts-expect-error */
      <SettingsPopupDataDelete onBackToDataViewBtnClick={onBackToDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderListsView = () => {
    const content = (
      <SettingsPopupLists onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const renderTagsView = () => {
    const content = (
      <SettingsPopupTags onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const renderMiscView = () => {
    const content = (
      <SettingsPopupMisc onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const renderAboutView = () => {
    const content = (
      <SettingsPopupAbout onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const _renderConflictLoading = () => {
    if (!(conflictedSettings.status === MERGING)) return null;

    return (
      <React.Fragment>
        <View style={tailwind('absolute inset-0 bg-white bg-opacity-25 blk:bg-gray-900 blk:bg-opacity-25')} />
        <View style={[tailwind('absolute top-1/3 left-1/2 items-center justify-center'), { transform: [{ translateX: -10 }, { translateY: -10 }] }]}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
        </View>
      </React.Fragment>
    );
  };

  const _renderConflictMergeError = () => {
    if (!(conflictedSettings.status === DIED_MERGING)) return null;

    const mergeErrorStyle = {
      transform: [{
        scale: mergeErrorAnim.interpolate({
          inputRange: [0, 1], outputRange: [0.95, 1],
        }),
      }],
    };

    return (
      <View style={tailwind('absolute inset-x-0 top-10 flex-row items-start justify-center md:top-0')}>
        <Animated.View style={[tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg'), mergeErrorStyle]}>
          <View style={tailwind('flex-row')}>
            <View style={tailwind('flex-shrink-0')}>
              <Svg width={24} height={24} style={tailwind('font-normal text-red-400')} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 lg:mt-0.5')}>
              <Text style={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Oops..., something went wrong!</Text>
              <Text style={tailwind('mt-2.5 text-sm font-normal text-red-700')}>Please wait a moment and try again.{'\n'}If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-sm font-normal text-red-700 underline')}>contact us</Text>.</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderConflictView = () => {
    const content = (
      <SettingsPopupConflict />
    );
    return (
      <View style={[tailwind('absolute inset-0 z-30 bg-white blk:bg-gray-900'), canvasStyle]}>
        <View style={tailwind('flex-1')}>
          {_renderPanel(content)}
          {_renderConflictLoading()}
          {_renderConflictMergeError()}
          {_renderPanelCloseBtn()}
        </View>
      </View>
    );
  };

  if (
    Array.isArray(conflictedSettings.contents) &&
    conflictedSettings.contents.length > 0
  ) {
    return renderConflictView();
  }

  if (viewId === VIEW_ACCOUNT) return renderAccountView();
  else if (viewId === VIEW_IAP) return renderIapView();
  else if (viewId === VIEW_IAP_RESTORE) return renderRestoreIapView();
  else if (viewId === VIEW_DATA) return renderDataView();
  else if (viewId === VIEW_DATA_IMPORT) return renderImportAllDataView();
  else if (viewId === VIEW_DATA_EXPORT) return renderExportAllDataView();
  else if (viewId === VIEW_DATA_DELETE) return renderDeleteAllDataView();
  else if (viewId === VIEW_LISTS) return renderListsView();
  else if (viewId === VIEW_TAGS) return renderTagsView();
  else if (viewId === VIEW_MISC) return renderMiscView();
  else if (viewId === VIEW_ABOUT) return renderAboutView();
  else throw new Error(`Invalid viewId: ${viewId}`);
};

export default React.memo(SettingsPopup);
