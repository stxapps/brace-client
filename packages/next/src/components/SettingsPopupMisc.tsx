import React, { useRef } from 'react';

import { useSelector, useDispatch } from '../store';
import {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
  updateDoUseLocalLayout, updateLayoutType, updateDoUseLocalTheme, updateTheme,
  updateDoUseLocalAddMode, updateAddMode,
} from '../actions/chunk';
import {
  HASH_PRIVACY, LAYOUT_CARD, LAYOUT_LIST, WHT_MODE, BLK_MODE, SYSTEM_MODE, CUSTOM_MODE,
  ADD_MODE_BASIC, ADD_MODE_ADVANCED,
} from '../types/const';
import {
  getLayoutType, getRawThemeMode, getRawThemeCustomOptions, getRawAddMode,
} from '../selectors';

import { useTailwind } from '.';

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
  const addMode = useSelector(state => getRawAddMode(state));
  const whtTimeInput = useRef(null);
  const blkTimeInput = useRef(null);
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
    const _customOptions = [
      { mode: WHT_MODE, startTime: whtTimeInput.current.value },
      { mode: BLK_MODE, startTime: blkTimeInput.current.value },
    ];
    dispatch(updateTheme(_themeMode, _customOptions));
  };

  const onTimeInputChange = () => {
    const _themeMode = CUSTOM_MODE;
    const _customOptions = [
      { mode: WHT_MODE, startTime: whtTimeInput.current.value },
      { mode: BLK_MODE, startTime: blkTimeInput.current.value },
    ];
    dispatch(updateTheme(_themeMode, _customOptions));
  };

  const onWhtTimeInputBlur = () => {
    if (whtTimeInput.current.value === '') {
      const _themeMode = CUSTOM_MODE;
      const _customOptions = [
        { mode: WHT_MODE, startTime: '06:00' },
        { mode: BLK_MODE, startTime: blkTimeInput.current.value },
      ];
      dispatch(updateTheme(_themeMode, _customOptions));
    }
  };

  const onBlkTimeInputBlur = () => {
    if (blkTimeInput.current.value === '') {
      const _themeMode = CUSTOM_MODE;
      const _customOptions = [
        { mode: WHT_MODE, startTime: whtTimeInput.current.value },
        { mode: BLK_MODE, startTime: '18:00' },
      ];
      dispatch(updateTheme(_themeMode, _customOptions));
    }
  };

  const doExtractBtnClassNames = doExtractContents ? 'bg-blue-500 blk:bg-blue-600' : 'bg-gray-200 blk:bg-gray-700';
  const doExtractBtnInnerClassNames = doExtractContents ? 'translate-x-5' : 'translate-x-0';

  const doDeleteBtnClassNames = doDeleteOldLinksInTrash ? 'bg-blue-500 blk:bg-blue-600' : 'bg-gray-200 blk:bg-gray-700';
  const doDeleteBtnInnerClassNames = doDeleteOldLinksInTrash ? 'translate-x-5' : 'translate-x-0';

  let ascendingBtnClassNames = !doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  if (doDescendingOrder) ascendingBtnClassNames += ' border-b-0';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const ascendingRBtnClassNames = !doDescendingOrder ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const descendingRBtnClassNames = doDescendingOrder ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const addModeDefaultBtnClassNames = !doUseLocalAddMode ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';
  const addModeLocalBtnClassNames = doUseLocalAddMode ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';

  let addModeBscBtnClassNames = addMode === ADD_MODE_BASIC ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  if (addMode === ADD_MODE_BASIC) addModeBscBtnClassNames += ' border-b-0';
  const addModeBscBtnInnerClassNames = addMode === ADD_MODE_BASIC ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const addModeBscRBtnClassNames = addMode === ADD_MODE_BASIC ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const addModeBscRBtnInnerClassNames = addMode === ADD_MODE_BASIC ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let addModeAvdBtnClassNames = addMode === ADD_MODE_ADVANCED ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  if (addMode === ADD_MODE_ADVANCED) addModeAvdBtnClassNames += ' border-b-0';
  const addModeAvdBtnInnerClassNames = addMode === ADD_MODE_ADVANCED ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const addModeAvdRBtnClassNames = addMode === ADD_MODE_ADVANCED ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const addModeAvdRBtnInnerClassNames = addMode === ADD_MODE_ADVANCED ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const layoutDefaultBtnClassNames = !doUseLocalLayout ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';
  const layoutLocalBtnClassNames = doUseLocalLayout ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';

  let layoutCardBtnClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  if (layoutType === LAYOUT_LIST) layoutCardBtnClassNames += ' border-b-0';
  const layoutCardBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const layoutCardRBtnClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const layoutCardRBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const layoutListBtnClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const layoutListBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const layoutListRBtnClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const layoutListRBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const themeDefaultBtnClassNames = !doUseLocalTheme ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';
  const themeLocalBtnClassNames = doUseLocalTheme ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';

  let whtBtnClassNames = themeMode === WHT_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  if (themeMode === BLK_MODE) whtBtnClassNames += ' border-b-0';
  const whtBtnInnerClassNames = themeMode === WHT_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const whtRBtnClassNames = themeMode === WHT_MODE ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const whtRBtnInnerClassNames = themeMode === WHT_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let blkBtnClassNames = themeMode === BLK_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  if (themeMode === SYSTEM_MODE) blkBtnClassNames += ' border-b-0';
  const blkBtnInnerClassNames = themeMode === BLK_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const blkRBtnClassNames = themeMode === BLK_MODE ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const blkRBtnInnerClassNames = themeMode === BLK_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let systemBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  if (themeMode === CUSTOM_MODE) systemBtnClassNames += ' border-b-0';
  const systemBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const systemRBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const systemRBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const customBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const customBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const customRBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-blue-600 group-focus:ring-blue-600 group-focus:ring-offset-blue-100 blk:bg-blue-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-blue-600' : 'border border-gray-500 bg-white group-focus:ring-blue-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-blue-600 blk:group-focus:ring-offset-gray-900';
  const customRBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const customTextClassNames = themeMode === CUSTOM_MODE ? 'text-blue-700 blk:text-blue-200' : 'text-gray-500 blk:text-gray-500';
  const customInputClassNames = themeMode === CUSTOM_MODE ? 'cursor-pointer border-gray-300 bg-white text-gray-600 blk:border-blue-200 blk:bg-blue-600 blk:text-blue-100 blk:focus:ring-blue-200' : 'border-gray-300 bg-white text-gray-400 blk:border-gray-600 blk:bg-gray-900 blk:text-gray-500';

  let whtTime, blkTime;
  for (const option of customOptions) {
    if (option.mode === WHT_MODE) whtTime = option.startTime;
    if (option.mode === BLK_MODE) blkTime = option.startTime;
  }

  return (
    <div className={tailwind('relative p-4 md:p-6')}>
      <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <button onClick={onSidebarOpenBtnClick} className={tailwind('group pb-1 focus:outline-none')}>
          <span className={tailwind('rounded text-sm text-gray-500 group-focus:ring blk:text-gray-400')}>{'<'} <span className={tailwind('group-hover:underline')}>Settings</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100')}>Misc.</h3>
      </div>
      <div className={tailwind('mt-6 flex flex-col md:mt-0')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Appearance</h4>
        <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose appearance to be <span className={tailwind('font-semibold blk:text-gray-300')}>Light</span>, <span className={tailwind('font-semibold blk:text-gray-300')}>Dark</span>, <span className={tailwind('font-semibold blk:text-gray-300')}>System</span> (uses your device&apos;s setting), or <span className={tailwind('font-semibold blk:text-gray-300')}>Custom</span> (schedules times to change appearance automatically). For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</p>
        <div className={tailwind('mx-auto mt-2.5 w-full max-w-sm rounded-md bg-white shadow-xs blk:bg-gray-900')}>
          <div className={tailwind('relative flex justify-evenly')}>
            <button onClick={() => onDoUseLocalThemeBtnClick(false)} className={tailwind(`relative flex-shrink flex-grow rounded-tl-md border border-b-0 border-gray-300 bg-white py-4 text-center text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-inset blk:border-gray-700 blk:bg-gray-900 ${themeDefaultBtnClassNames}`)} type="button">
              Sync
              {!doUseLocalTheme && <div className={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
            </button>
            <button onClick={() => onDoUseLocalThemeBtnClick(true)} className={tailwind(`relative flex-shrink flex-grow rounded-tr-md border border-l-0 border-b-0 border-gray-300 bg-white py-4 text-center text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-inset blk:border-gray-700 blk:bg-gray-900 ${themeLocalBtnClassNames}`)} type="button">
              Device
              {doUseLocalTheme && <div className={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
            </button>
          </div>
          <button onClick={() => onThemeInputChange(WHT_MODE)} className={tailwind(`group flex w-full border p-4 focus:outline-none ${whtBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${whtRBtnClassNames}`)}>
                <div className={tailwind(`h-1.5 w-1.5 rounded-full ${whtRBtnInnerClassNames}`)} />
              </div>
            </div>
            <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${whtBtnInnerClassNames}`)}>Light</p>
          </button>
          <button onClick={() => onThemeInputChange(BLK_MODE)} className={tailwind(`group flex w-full border p-4 focus:outline-none ${blkBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${blkRBtnClassNames}`)}>
                <div className={tailwind(`h-1.5 w-1.5 rounded-full ${blkRBtnInnerClassNames}`)} />
              </div>
            </div>
            <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${blkBtnInnerClassNames}`)}>Dark</p>
          </button>
          <button onClick={() => onThemeInputChange(SYSTEM_MODE)} className={tailwind(`group flex w-full border p-4 focus:outline-none ${systemBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${systemRBtnClassNames}`)}>
                <div className={tailwind(`h-1.5 w-1.5 rounded-full ${systemRBtnInnerClassNames}`)} />
              </div>
            </div>
            <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${systemBtnInnerClassNames}`)}>System</p>
          </button>
          <button onClick={() => onThemeInputChange(CUSTOM_MODE)} className={tailwind(`group flex w-full rounded-bl-md rounded-br-md border p-4 focus:outline-none ${customBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${customRBtnClassNames}`)}>
                <div className={tailwind(`h-1.5 w-1.5 rounded-full ${customRBtnInnerClassNames}`)} />
              </div>
            </div>
            <div className={tailwind('ml-3 flex flex-col')}>
              <p className={tailwind(`text-left text-sm font-medium leading-5 ${customBtnInnerClassNames}`)}>Custom</p>
              <div className={tailwind('mt-1.5 sm:flex sm:items-center sm:justify-start')}>
                <div className={tailwind('flex items-center justify-start')}>
                  <span className={tailwind(`block w-10 text-sm ${customTextClassNames}`)}>Light:</span>
                  <input ref={whtTimeInput} onChange={onTimeInputChange} onBlur={onWhtTimeInputBlur} type="time" className={tailwind(`ml-1 rounded-md border py-1 pl-1 pr-0.5 text-sm leading-5 ${customInputClassNames}`)} placeholder="HH:mm" value={whtTime} disabled={themeMode !== CUSTOM_MODE} pattern="[0-9]{2}:[0-9]{2}" />
                </div>
                <div className={tailwind('mt-2 flex items-center justify-start sm:ml-4 sm:mt-0')}>
                  <span className={tailwind(`block w-10 text-sm ${customTextClassNames}`)}>Dark:</span>
                  <input ref={blkTimeInput} onChange={onTimeInputChange} onBlur={onBlkTimeInputBlur} type="time" className={tailwind(`ml-1 rounded-md border py-1 pl-1 pr-0.5 text-sm leading-5 ${customInputClassNames}`)} placeholder="HH:mm" value={blkTime} disabled={themeMode !== CUSTOM_MODE} pattern="[0-9]{2}:[0-9]{2}" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
      <div className={tailwind('mt-10 flex flex-col')}>
        <h4 id="layout-type-option-label" className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Layout View</h4>
        <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
          <p id="layout-type-option-description" className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose whether your saved links are displayed in the Cards view or in the List view. For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</p>
          <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 rounded-md bg-white shadow-xs blk:bg-gray-900 sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
            <div className={tailwind('relative flex justify-evenly')}>
              <button onClick={() => onDoUseLocalLayoutBtnClick(false)} className={tailwind(`relative flex-shrink flex-grow rounded-tl-md border border-b-0 border-gray-300 bg-white py-4 text-center text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-inset blk:border-gray-700 blk:bg-gray-900 ${layoutDefaultBtnClassNames}`)} type="button">
                Sync
                {!doUseLocalLayout && <div className={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
              </button>
              <button onClick={() => onDoUseLocalLayoutBtnClick(true)} className={tailwind(`relative flex-shrink flex-grow rounded-tr-md border border-l-0 border-b-0 border-gray-300 bg-white py-4 text-center text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-inset blk:border-gray-700 blk:bg-gray-900 ${layoutLocalBtnClassNames}`)} type="button">
                Device
                {doUseLocalLayout && <div className={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
              </button>
            </div>
            <button onClick={() => onLayoutTypeInputChange(LAYOUT_CARD)} className={tailwind(`group flex w-full border p-4 focus:outline-none ${layoutCardBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${layoutCardRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${layoutCardRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${layoutCardBtnInnerClassNames}`)}>Cards view</p>
            </button>
            <button onClick={() => onLayoutTypeInputChange(LAYOUT_LIST)} className={tailwind(`group flex w-full rounded-bl-md rounded-br-md border p-4 focus:outline-none ${layoutListBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${layoutListRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${layoutListRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${layoutListBtnInnerClassNames}`)}>List view</p>
            </button>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 flex flex-col')}>
        <h4 id="list-order-option-label" className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>List Order</h4>
        <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
          <p id="list-order-option-description" className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose whether your saved links are sorted by saved date in <span className={tailwind('font-semibold blk:text-gray-300')}>ascending order</span> (links you save first appear first) or <span className={tailwind('font-semibold blk:text-gray-300')}>descending order</span> (links you save last appear first) when you browse your saved links.</p>
          <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 rounded-md bg-white shadow-xs blk:bg-gray-900 sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
            <button onClick={() => onDoDescendingInputChange('ascending')} className={tailwind(`group flex w-full rounded-tl-md rounded-tr-md border p-4 focus:outline-none ${ascendingBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${ascendingRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${ascendingRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${ascendingBtnInnerClassNames}`)}>Ascending order</p>
            </button>
            <button onClick={() => onDoDescendingInputChange('descending')} className={tailwind(`group flex w-full rounded-bl-md rounded-br-md border p-4 focus:outline-none ${descendingBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${descendingRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${descendingRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${descendingBtnInnerClassNames}`)}>Descending order</p>
            </button>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 id="link-previews-option-label" className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Link Previews</h4>
          <p id="link-previews-option-description" className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Allow your saved links to be sent to our server for extracting their representative title and image. No personal information is involved at all so there is no way to know who saves what links. These titles and images are used in our website and app for you to easily find and recognize your saved links. For more information, please visit <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring blk:hover:text-gray-200')} href={'/' + HASH_PRIVACY} target="_blank" rel="noreferrer">our privacy policy page</a>.</p>
        </div>
        <span onClick={onDoExtractBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="link-previews-option-label" aria-describedby="link-previews-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring blk:focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${doExtractBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out blk:bg-gray-300 ${doExtractBtnInnerClassNames}`)} />
        </span>
      </div>
      <div className={tailwind('mt-10 flex flex-col')}>
        <h4 id="add-mode-option-label" className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Add Mode</h4>
        <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
          <p id="add-mode-option-description" className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose whether your link editor are displayed in the Basic, Advanced (includes list and tags selection), or Last used mode. For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</p>
          <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 rounded-md bg-white shadow-xs blk:bg-gray-900 sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
            <div className={tailwind('relative flex justify-evenly')}>
              <button onClick={() => onDoUseLocalAddModeBtnClick(false)} className={tailwind(`relative flex-shrink flex-grow rounded-tl-md border border-b-0 border-gray-300 bg-white py-4 text-center text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-inset blk:border-gray-700 blk:bg-gray-900 ${addModeDefaultBtnClassNames}`)} type="button">
                Sync
                {!doUseLocalAddMode && <div className={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
              </button>
              <button onClick={() => onDoUseLocalAddModeBtnClick(true)} className={tailwind(`relative flex-shrink flex-grow rounded-tr-md border border-l-0 border-b-0 border-gray-300 bg-white py-4 text-center text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-inset blk:border-gray-700 blk:bg-gray-900 ${addModeLocalBtnClassNames}`)} type="button">
                Device
                {doUseLocalAddMode && <div className={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 blk:bg-blue-300')} />}
              </button>
            </div>
            <button onClick={() => onAddModeInputChange(ADD_MODE_BASIC)} className={tailwind(`group flex w-full border p-4 focus:outline-none ${addModeBscBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${addModeBscRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${addModeBscRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${addModeBscBtnInnerClassNames}`)}>Basic</p>
            </button>
            <button onClick={() => onAddModeInputChange(ADD_MODE_ADVANCED)} className={tailwind(`group flex w-full border p-4 focus:outline-none ${addModeAvdBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${addModeAvdRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${addModeAvdRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${addModeAvdBtnInnerClassNames}`)}>Advanced</p>
            </button>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 mb-4 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 id="auto-delete-option-label" className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Auto Cleanup</h4>
          <p id="auto-delete-option-description" className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Allow old removed links in Trash to be automatically deleted after 45 days.</p>
        </div>
        <span onClick={onDoDeleteBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="auto-cleanup-option-label" aria-describedby="auto-cleanup-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring blk:focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${doDeleteBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out blk:bg-gray-300 ${doDeleteBtnInnerClassNames}`)} />
        </span>
      </div>
    </div>
  );
};

export default React.memo(SettingsPopupMisc);
