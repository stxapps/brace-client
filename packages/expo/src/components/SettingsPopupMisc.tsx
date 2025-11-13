import React, { useRef } from 'react';
import { View, TouchableOpacity, Switch, Linking, Platform } from 'react-native';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
  updateDoUseLocalLayout, updateLayoutType, updateDoUseLocalTheme, updateTheme,
  updateUpdatingThemeMode, updateDoUseLocalAddMode, updateAddMode,
} from '../actions/chunk';
import {
  DOMAIN_NAME, HASH_PRIVACY, LAYOUT_CARD, LAYOUT_LIST, WHT_MODE, BLK_MODE, SYSTEM_MODE,
  CUSTOM_MODE, TIME_PICK_POPUP, ADD_MODE_BASIC, ADD_MODE_ADVANCED,
} from '../types/const';
import {
  getLayoutType, getRawThemeMode, getRawThemeCustomOptions, getThemeMode, getRawAddMode,
} from '../selectors';
import { getFormattedTime, getRect, adjustRect } from '../utils';

import { useTailwind } from '.';
import Text from './CustomText';

const SettingsPopupMisc = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const doExtractContents = useSelector(state => state.settings.doExtractContents);
  const doDeleteOldLinksInTrash = useSelector(
    state => state.settings.doDeleteOldLinksInTrash
  );
  const doDescendingOrder = useSelector(state => state.settings.doDescendingOrder);
  const doUseLocalLayout = useSelector(state => state.localSettings.doUseLocalLayout);
  const doUseLocalTheme = useSelector(state => state.localSettings.doUseLocalTheme);
  const doUseLocalAddMode = useSelector(state => state.localSettings.doUseLocalAddMode);
  const layoutType = useSelector(state => getLayoutType(state));
  const themeMode = useSelector(state => getRawThemeMode(state));
  const customOptions = useSelector(state => getRawThemeCustomOptions(state));
  const is24HFormat = useSelector(state => state.window.is24HFormat);
  const derivedThemeMode = useSelector(state => getThemeMode(state));
  const addMode = useSelector(state => getRawAddMode(state));
  const whtTimeBtn = useRef(null);
  const blkTimeBtn = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onDoExtractBtnClick = () => {
    dispatch(updateDoExtractContents(!doExtractContents));
  };

  const onDoDeleteBtnClick = () => {
    dispatch(updateDoDeleteOldLinksInTrash(!doDeleteOldLinksInTrash));
  };

  const onDoDescendingInputChange = (value) => {
    let doDescend;
    if (value === 'ascending') doDescend = false;
    else if (value === 'descending') doDescend = true;
    else throw new Error(`Invalid value: ${value}`);

    dispatch(updateDoDescendingOrder(doDescend));
  };

  const onDoUseLocalAddModeBtnClick = (doUse) => {
    dispatch(updateDoUseLocalAddMode(doUse));
  };

  const onAddModeInputChange = (value) => {
    dispatch(updateAddMode(value));
  };

  const onDoUseLocalLayoutBtnClick = (doUse) => {
    dispatch(updateDoUseLocalLayout(doUse));
  };

  const onLayoutTypeInputChange = (value) => {
    dispatch(updateLayoutType(value));
  };

  const onDoUseLocalThemeBtnClick = (doUse) => {
    dispatch(updateDoUseLocalTheme(doUse));
  };

  const onThemeInputChange = (value) => {
    const _themeMode = value;
    const _customOptions = customOptions;
    dispatch(updateTheme(_themeMode, _customOptions));
  };

  const onWhtTimeBtnClick = () => {
    whtTimeBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateUpdatingThemeMode(WHT_MODE));

      const rect = getRect(x, y, width, height);
      const nRect = adjustRect(rect, -1, -1, 0, 0);
      dispatch(updatePopup(TIME_PICK_POPUP, true, nRect));
    });
  };

  const onBlkTimeBtnClick = () => {
    blkTimeBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateUpdatingThemeMode(BLK_MODE));

      const rect = getRect(x, y, width, height);
      const nRect = adjustRect(rect, -1, -1, 0, 0);
      dispatch(updatePopup(TIME_PICK_POPUP, true, nRect));
    });
  };

  const isSystemShown = (
    Platform.OS !== 'android' || (Platform.OS === 'android' && Platform.Version >= 29)
  );
  const isNewIos = Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 26;

  const switchThumbColorOn = 'rgb(59, 130, 246)';
  const switchThumbColorOff = 'rgb(229, 231, 235)';
  const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(191, 219, 254)' : 'rgb(59, 130, 246)';
  const switchTrackColorOff = 'rgb(156, 163, 175)';
  const switchIosTrackColorOff = derivedThemeMode === BLK_MODE ? 'rgb(55, 65, 81)' : 'rgb(243, 244, 246)';

  let ascendingBtnClassNames = !doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  if (doDescendingOrder) ascendingBtnClassNames += ' border-b-0';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const ascendingRBtnClassNames = !doDescendingOrder ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const descendingRBtnClassNames = doDescendingOrder ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const addModeDefaultBtnClassNames = !doUseLocalAddMode ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';
  const addModeLocalBtnClassNames = doUseLocalAddMode ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';

  let addModeBscBtnClassNames = addMode === ADD_MODE_BASIC ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  if (addMode === ADD_MODE_ADVANCED) addModeBscBtnClassNames += ' border-b-0';
  const addModeBscBtnInnerClassNames = addMode === ADD_MODE_BASIC ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const addModeBscRBtnClassNames = addMode === ADD_MODE_BASIC ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const addModeBscRBtnInnerClassNames = addMode === ADD_MODE_BASIC ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const addModeAvdBtnClassNames = addMode === ADD_MODE_ADVANCED ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const addModeAvdBtnInnerClassNames = addMode === ADD_MODE_ADVANCED ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const addModeAvdRBtnClassNames = addMode === ADD_MODE_ADVANCED ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const addModeAvdRBtnInnerClassNames = addMode === ADD_MODE_ADVANCED ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const layoutDefaultBtnClassNames = !doUseLocalLayout ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';
  const layoutLocalBtnClassNames = doUseLocalLayout ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';

  let layoutCardBtnClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  if (layoutType === LAYOUT_LIST) layoutCardBtnClassNames += ' border-b-0';
  const layoutCardBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const layoutCardRBtnClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const layoutCardRBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const layoutListBtnClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const layoutListBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const layoutListRBtnClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const layoutListRBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const themeDefaultBtnClassNames = !doUseLocalTheme ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';
  const themeLocalBtnClassNames = doUseLocalTheme ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';

  let whtBtnClassNames = themeMode === WHT_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  if (themeMode === BLK_MODE) whtBtnClassNames += ' border-b-0';
  const whtBtnInnerClassNames = themeMode === WHT_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const whtRBtnClassNames = themeMode === WHT_MODE ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const whtRBtnInnerClassNames = themeMode === WHT_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let blkBtnClassNames = themeMode === BLK_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  if (isSystemShown && themeMode === SYSTEM_MODE) blkBtnClassNames += ' border-b-0';
  const blkBtnInnerClassNames = themeMode === BLK_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const blkRBtnClassNames = themeMode === BLK_MODE ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const blkRBtnInnerClassNames = themeMode === BLK_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let systemBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  if (themeMode === CUSTOM_MODE) systemBtnClassNames += ' border-b-0';
  const systemBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const systemRBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const systemRBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const customBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const customBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const customRBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-blue-600 blk:bg-blue-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const customRBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const customTextClassNames = themeMode === CUSTOM_MODE ? 'text-blue-700 blk:text-blue-200' : 'text-gray-500 blk:text-gray-400';
  const customInputClassNames = themeMode === CUSTOM_MODE ? 'border-gray-300 bg-white blk:border-blue-300 blk:bg-blue-600' : 'border-gray-300 bg-white blk:border-gray-600 blk:bg-gray-900';
  const customInputInnerClassNames = themeMode === CUSTOM_MODE ? 'text-gray-600 blk:text-blue-200' : 'text-gray-400 blk:text-gray-500';

  let whtTime, blkTime;
  for (const option of customOptions) {
    if (option.mode === WHT_MODE) whtTime = option.startTime;
    if (option.mode === BLK_MODE) blkTime = option.startTime;
  }
  whtTime = getFormattedTime(whtTime, is24HFormat).time;
  blkTime = getFormattedTime(blkTime, is24HFormat).time;

  let systemText = (
    <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose appearance to be <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Light</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Dark</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>System</Text> (uses your device&apos;s setting), or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Custom</Text> (schedules times to change appearance automatically). For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</Text>
  );
  if (!isSystemShown) {
    systemText = (
      <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose appearance to be <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Light</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Dark</Text>, or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Custom</Text> (schedule times to change appearance automatically). For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</Text>
    );
  }

  return (
    <View style={tailwind('relative p-4 md:p-6')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800 blk:text-gray-100')}>Misc.</Text>
      </View>
      <View style={tailwind('mt-6 md:mt-0')}>
        <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Appearance</Text>
        {systemText}
        <View style={tailwind('mt-2.5 w-full items-center justify-start')}>
          <View style={tailwind('w-full max-w-sm rounded-md bg-white shadow-xs blk:bg-gray-900')}>
            <View style={tailwind('flex-row justify-evenly')}>
              <TouchableOpacity onPress={() => onDoUseLocalThemeBtnClick(false)} style={tailwind('flex-shrink flex-grow rounded-tl-md border border-b-0 border-gray-300 bg-white py-4 blk:border-gray-700 blk:bg-gray-900')}>
                <Text style={tailwind(`text-center text-sm font-medium ${themeDefaultBtnClassNames}`)}>Sync</Text>
                {!doUseLocalTheme && <View style={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDoUseLocalThemeBtnClick(true)} style={tailwind('flex-shrink flex-grow rounded-tr-md border border-l-0 border-b-0 border-gray-300 bg-white py-4 blk:border-gray-700 blk:bg-gray-900')}>
                <Text style={tailwind(`text-center text-sm font-medium ${themeLocalBtnClassNames}`)}>Device</Text>
                {doUseLocalTheme && <View style={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => onThemeInputChange(WHT_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${whtBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${whtRBtnClassNames}`)}>
                    <View style={tailwind(`h-1.5 w-1.5 rounded-full ${whtRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${whtBtnInnerClassNames}`)}>Light</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onThemeInputChange(BLK_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${blkBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${blkRBtnClassNames}`)}>
                    <View style={tailwind(`h-1.5 w-1.5 rounded-full ${blkRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${blkBtnInnerClassNames}`)}>Dark</Text>
              </View>
            </TouchableOpacity>
            {isSystemShown && <TouchableOpacity onPress={() => onThemeInputChange(SYSTEM_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${systemBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${systemRBtnClassNames}`)}>
                    <View style={tailwind(`h-1.5 w-1.5 rounded-full ${systemRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${systemBtnInnerClassNames}`)}>System</Text>
              </View>
            </TouchableOpacity>}
            <TouchableOpacity onPress={() => onThemeInputChange(CUSTOM_MODE)}>
              <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${customBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${customRBtnClassNames}`)}>
                    <View style={tailwind(`h-1.5 w-1.5 rounded-full ${customRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <View style={tailwind('ml-3')}>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${customBtnInnerClassNames}`)}>Custom</Text>
                  <View style={tailwind('mt-1.5 sm:flex-row sm:items-center sm:justify-start')}>
                    <View style={tailwind('flex-row items-center justify-start')}>
                      <View style={tailwind('w-11')}>
                        <Text style={tailwind(`text-sm font-normal ${customTextClassNames}`)}>Light:</Text>
                      </View>
                      <TouchableOpacity ref={whtTimeBtn} onPress={onWhtTimeBtnClick} style={tailwind(`ml-1 rounded-md border px-3 py-1.5 ${customInputClassNames}`)} disabled={themeMode !== CUSTOM_MODE}>
                        <Text style={tailwind(`text-base font-normal leading-5 ${customInputInnerClassNames}`)}>{whtTime}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={tailwind('mt-2 flex-row items-center justify-start sm:ml-4 sm:mt-0')}>
                      <View style={tailwind('w-11')}>
                        <Text style={tailwind(`text-sm font-normal ${customTextClassNames}`)}>Dark:</Text>
                      </View>
                      <TouchableOpacity ref={blkTimeBtn} onPress={onBlkTimeBtnClick} style={tailwind(`ml-1 rounded-md border px-3 py-1.5 ${customInputClassNames}`)} disabled={themeMode !== CUSTOM_MODE}>
                        <Text style={tailwind(`text-base font-normal leading-5 ${customInputInnerClassNames}`)}>{blkTime}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10')}>
        <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Layout View</Text>
        <View style={tailwind('sm:flex-row sm:items-start sm:justify-between')}>
          <View style={tailwind('mt-2.5 sm:flex-shrink sm:flex-grow')}>
            <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose whether your saved links are displayed in the Cards view or in the List view. For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</Text>
          </View>
          <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-shrink-0 sm:flex-grow-0')}>
            <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-xs blk:bg-gray-900 sm:w-48')}>
              <View style={tailwind('flex-row justify-evenly')}>
                <TouchableOpacity onPress={() => onDoUseLocalLayoutBtnClick(false)} style={tailwind('flex-shrink flex-grow rounded-tl-md border border-b-0 border-gray-300 bg-white py-4 blk:border-gray-700 blk:bg-gray-900')}>
                  <Text style={tailwind(`text-center text-sm font-medium ${layoutDefaultBtnClassNames}`)}>Sync</Text>
                  {!doUseLocalLayout && <View style={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDoUseLocalLayoutBtnClick(true)} style={tailwind('flex-shrink flex-grow rounded-tr-md border border-l-0 border-b-0 border-gray-300 bg-white py-4 blk:border-gray-700 blk:bg-gray-900')}>
                  <Text style={tailwind(`text-center text-sm font-medium ${layoutLocalBtnClassNames}`)}>Device</Text>
                  {doUseLocalLayout && <View style={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => onLayoutTypeInputChange(LAYOUT_CARD)}>
                <View style={tailwind(`flex-row border p-4 ${layoutCardBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${layoutCardRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${layoutCardRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${layoutCardBtnInnerClassNames}`)}>Cards view</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onLayoutTypeInputChange(LAYOUT_LIST)}>
                <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${layoutListBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${layoutListRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${layoutListRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${layoutListBtnInnerClassNames}`)}>List View</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10')}>
        <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>List Order</Text>
        <View style={tailwind('sm:flex-row sm:items-start sm:justify-between')}>
          <View style={tailwind('mt-2.5 sm:flex-shrink sm:flex-grow')}>
            <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose whether your saved links are sorted by saved date in <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>ascending order</Text> (links you save first appear first) or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>descending order</Text> (links you save last appear first) when you browse your saved links.</Text>
          </View>
          <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-shrink-0 sm:flex-grow-0')}>
            <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-xs blk:bg-gray-900 sm:w-48')}>
              <TouchableOpacity onPress={() => onDoDescendingInputChange('ascending')} style={tailwind('')}>
                <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${ascendingBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${ascendingRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${ascendingRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${ascendingBtnInnerClassNames}`)}>Ascending order</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDoDescendingInputChange('descending')} style={tailwind('')}>
                <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${descendingBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${descendingRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${descendingRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${descendingBtnInnerClassNames}`)}>Descending order</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10 flex-row items-center justify-between')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Link Previews</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Allow your saved links to be sent to our server for extracting their representative title and image. No personal information is involved at all so there is no way to know who saves what links. These titles and images are used in our website and app for you to easily find and recognize your saved links. For more information, please visit <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_PRIVACY)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>our privacy policy page</Text>.</Text>
        </View>
        <View style={tailwind(`ml-4 flex-shrink-0 flex-grow-0 ${isNewIos ? 'h-7 w-16' : 'h-6 w-11'}`)}>
          <Switch onValueChange={onDoExtractBtnClick} value={doExtractContents} thumbColor={Platform.OS === 'android' ? doExtractContents ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} ios_backgroundColor={switchIosTrackColorOff} />
        </View>
      </View>
      <View style={tailwind('mt-10')}>
        <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Add Mode</Text>
        <View style={tailwind('sm:flex-row sm:items-start sm:justify-between')}>
          <View style={tailwind('mt-2.5 sm:flex-shrink sm:flex-grow')}>
            <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose whether your link editor are displayed in the Basic or Advanced (includes list and tags selection) mode. For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</Text>
          </View>
          <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-shrink-0 sm:flex-grow-0')}>
            <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-xs blk:bg-gray-900 sm:w-48')}>
              <View style={tailwind('flex-row justify-evenly')}>
                <TouchableOpacity onPress={() => onDoUseLocalAddModeBtnClick(false)} style={tailwind('flex-shrink flex-grow rounded-tl-md border border-b-0 border-gray-300 bg-white py-4 blk:border-gray-700 blk:bg-gray-900')}>
                  <Text style={tailwind(`text-center text-sm font-medium ${addModeDefaultBtnClassNames}`)}>Sync</Text>
                  {!doUseLocalAddMode && <View style={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDoUseLocalAddModeBtnClick(true)} style={tailwind('flex-shrink flex-grow rounded-tr-md border border-l-0 border-b-0 border-gray-300 bg-white py-4 blk:border-gray-700 blk:bg-gray-900')}>
                  <Text style={tailwind(`text-center text-sm font-medium ${addModeLocalBtnClassNames}`)}>Device</Text>
                  {doUseLocalAddMode && <View style={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => onAddModeInputChange(ADD_MODE_BASIC)}>
                <View style={tailwind(`flex-row border p-4 ${addModeBscBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${addModeBscRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${addModeBscRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${addModeBscBtnInnerClassNames}`)}>Basic</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onAddModeInputChange(ADD_MODE_ADVANCED)}>
                <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${addModeAvdBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${addModeAvdRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${addModeAvdRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${addModeAvdBtnInnerClassNames}`)}>Advanced</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10 mb-4 flex-row items-center justify-between')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Auto Cleanup</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Allow old removed links in Trash to be automatically deleted after 45 days.</Text>
        </View>
        <View style={tailwind(`ml-4 flex-shrink-0 flex-grow-0 ${isNewIos ? 'h-7 w-16' : 'h-6 w-11'}`)}>
          <Switch onValueChange={onDoDeleteBtnClick} value={doDeleteOldLinksInTrash} thumbColor={Platform.OS === 'android' ? doDeleteOldLinksInTrash ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} ios_backgroundColor={switchIosTrackColorOff} />
        </View>
      </View>
    </View>
  );
};

export default React.memo(SettingsPopupMisc);
