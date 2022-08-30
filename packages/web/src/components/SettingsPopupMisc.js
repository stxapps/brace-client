import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
  updateLayoutType, updateTheme,
} from '../actions';
import {
  HASH_PRIVACY, LAYOUT_CARD, LAYOUT_LIST, WHT_MODE, BLK_MODE, SYSTEM_MODE, CUSTOM_MODE,
} from '../types/const';

import { useTailwind } from '.';

const SettingsPopupMisc = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const doExtractContents = useSelector(state => state.settings.doExtractContents);
  const doDeleteOldLinksInTrash = useSelector(
    state => state.settings.doDeleteOldLinksInTrash
  );
  const doDescendingOrder = useSelector(state => state.settings.doDescendingOrder);
  const layoutType = useSelector(state => state.localSettings.layoutType);
  const themeMode = useSelector(state => state.localSettings.themeMode);
  const customOptions = useSelector(
    state => state.localSettings.themeCustomOptions
  );
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

  const onDoDescendingInputChange = (e) => {
    let doDescendingOrder;

    const value = e.target.value;
    if (value === 'ascending') doDescendingOrder = false;
    else if (value === 'descending') doDescendingOrder = true;
    else throw new Error(`Invalid value: ${value}`);

    dispatch(updateDoDescendingOrder(doDescendingOrder));
  };

  const onLayoutTypeInputChange = (e) => {
    dispatch(updateLayoutType(e.target.value));
  };

  const onThemeInputChange = (e) => {
    const value = e.target.value;

    const _themeMode = parseInt(value, 10);
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

  const doExtractBtnClassNames = doExtractContents ? 'bg-blue-500' : 'bg-gray-200';
  const doExtractBtnInnerClassNames = doExtractContents ? 'translate-x-5' : 'translate-x-0';

  const doDeleteBtnClassNames = doDeleteOldLinksInTrash ? 'bg-blue-500' : 'bg-gray-200';
  const doDeleteBtnInnerClassNames = doDeleteOldLinksInTrash ? 'translate-x-5' : 'translate-x-0';

  const ascendingBtnClassNames = !doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-blue-800' : 'text-gray-600';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-blue-800' : 'text-gray-600';

  const layoutCardBtnClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
  const layoutCardBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'text-blue-800' : 'text-gray-600';

  const layoutListBtnClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
  const layoutListBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'text-blue-800' : 'text-gray-600';

  const whtBtnClassNames = themeMode === WHT_MODE ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
  const whtBtnInnerClassNames = themeMode === WHT_MODE ? 'text-blue-800' : 'text-gray-600';
  const blkBtnClassNames = themeMode === BLK_MODE ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
  const blkBtnInnerClassNames = themeMode === BLK_MODE ? 'text-blue-800' : 'text-gray-600';
  const systemBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
  const systemBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'text-blue-800' : 'text-gray-600';
  const customBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
  const customBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'text-blue-800' : 'text-gray-600';
  const customTextClassNames = themeMode === CUSTOM_MODE ? 'text-blue-700' : 'text-gray-500';
  const customInputClassNames = themeMode === CUSTOM_MODE ? 'text-gray-600' : 'text-gray-400';

  let whtTime, blkTime;
  for (const option of customOptions) {
    if (option.mode === WHT_MODE) whtTime = option.startTime;
    if (option.mode === BLK_MODE) blkTime = option.startTime;
  }

  return (
    <div className={tailwind('relative p-4 md:p-6')}>
      <div className={tailwind('border-b border-gray-200 md:hidden')}>
        <button onClick={onSidebarOpenBtnClick} className={tailwind('group pb-1 focus:outline-none')}>
          <span className={tailwind('rounded text-sm text-gray-500 group-focus:ring')}>{'<'} <span className={tailwind('group-hover:underline')}>Settings</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800')}>Misc.</h3>
      </div>
      <div className={tailwind('mt-6 flex flex-col md:mt-0')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800')}>Appearance</h4>
        <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500')}>Choose appearance to be <span className={tailwind('font-semibold')}>Light</span>, <span className={tailwind('font-semibold')}>Dark</span>, <span className={tailwind('font-semibold')}>System</span> (uses your device's setting), or <span className={tailwind('font-semibold')}>Custom</span> (schedule times to change appearance automatically). This setting is not synced so you can have a different appearance for each of your devices.</p>
        <div className={tailwind('mx-auto mt-2.5 w-full max-w-sm -space-y-px rounded-md bg-white shadow-sm')}>
          <div className={tailwind(`relative flex rounded-tl-md rounded-tr-md border p-4 ${whtBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <input onChange={onThemeInputChange} id="theme-mode-option-1" name="theme-mode-option-1" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={themeMode === WHT_MODE} value={WHT_MODE} />
            </div>
            <label htmlFor="theme-mode-option-1" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
              <span className={tailwind(`block text-sm font-medium leading-5 ${whtBtnInnerClassNames}`)}>Light</span>
            </label>
          </div>
          <div className={tailwind(`relative flex border p-4 ${blkBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <input onChange={onThemeInputChange} id="theme-mode-option-2" name="theme-mode-option-2" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={themeMode === BLK_MODE} value={BLK_MODE} />
            </div>
            <label htmlFor="theme-mode-option-2" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
              <span className={tailwind(`block text-sm font-medium leading-5 ${blkBtnInnerClassNames}`)}>Dark</span>
            </label>
          </div>
          <div className={tailwind(`relative flex border p-4 ${systemBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <input onChange={onThemeInputChange} id="theme-mode-option-3" name="theme-mode-option-3" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={themeMode === SYSTEM_MODE} value={SYSTEM_MODE} />
            </div>
            <label htmlFor="theme-mode-option-3" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
              <span className={tailwind(`block text-sm font-medium leading-5 ${systemBtnInnerClassNames}`)}>System</span>
            </label>
          </div>
          <div className={tailwind(`relative flex rounded-bl-md rounded-br-md border p-4 ${customBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <input onChange={onThemeInputChange} id="theme-mode-option-4" name="theme-mode-option-4" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={themeMode === CUSTOM_MODE} value={CUSTOM_MODE} />
            </div>
            <label htmlFor="theme-mode-option-4" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
              <span className={tailwind(`block text-sm font-medium leading-5 ${customBtnInnerClassNames}`)}>Custom</span>
              <div className={tailwind('mt-1.5 sm:flex sm:items-center sm:justify-start')}>
                <div className={tailwind('flex items-center justify-start')}>
                  <span className={tailwind(`block w-10 text-sm ${customTextClassNames}`)}>Light:</span>
                  <input ref={whtTimeInput} onChange={onTimeInputChange} onBlur={onWhtTimeInputBlur} type="time" className={tailwind(`ml-1 rounded-md border border-gray-300 py-1 pl-1 pr-0.5 text-sm leading-5 ${customInputClassNames}`)} placeholder="HH:mm" value={whtTime} disabled={themeMode !== CUSTOM_MODE} pattern="[0-9]{2}:[0-9]{2}" />
                </div>
                <div className={tailwind('mt-2 flex items-center justify-start sm:ml-4 sm:mt-0')}>
                  <span className={tailwind(`block w-10 text-sm ${customTextClassNames}`)}>Dark:</span>
                  <input ref={blkTimeInput} onChange={onTimeInputChange} onBlur={onBlkTimeInputBlur} type="time" className={tailwind(`ml-1 rounded-md border border-gray-300 py-1 pl-1 pr-0.5 text-sm leading-5 ${customInputClassNames}`)} placeholder="HH:mm" value={blkTime} disabled={themeMode !== CUSTOM_MODE} pattern="[0-9]{2}:[0-9]{2}" />
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 flex flex-col')}>
        <h4 id="layout-type-option-label" className={tailwind('text-base font-medium leading-none text-gray-800')}>Layout View</h4>
        <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
          <p id="layout-type-option-description" className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500')}>Choose whether your saved links are displayed in Cards view or in List view. This setting is not synced so you can have a different layout for each of your devices.</p>
          <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 -space-y-px rounded-md bg-white shadow-sm sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
            <div className={tailwind(`relative flex rounded-tl-md rounded-tr-md border p-4 ${layoutCardBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <input onChange={onLayoutTypeInputChange} id="layout-type-option-1" name="layout-type-option-1" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={layoutType === LAYOUT_CARD} value={LAYOUT_CARD} />
              </div>
              <label htmlFor="layout-type-option-1" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                <span className={tailwind(`block text-sm font-medium leading-5 ${layoutCardBtnInnerClassNames}`)}>Cards view</span>
              </label>
            </div>
            <div className={tailwind(`relative flex rounded-bl-md rounded-br-md border p-4 ${layoutListBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <input onChange={onLayoutTypeInputChange} id="layout-type-option-2" name="layout-type-option-2" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={layoutType === LAYOUT_LIST} value={LAYOUT_LIST} />
              </div>
              <label htmlFor="layout-type-option-2" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                <span className={tailwind(`block text-sm font-medium leading-5 ${layoutListBtnInnerClassNames}`)}>List view</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 flex flex-col')}>
        <h4 id="list-order-option-label" className={tailwind('text-base font-medium leading-none text-gray-800')}>List Order</h4>
        <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
          <p id="list-order-option-description" className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500')}>Choose whether your saved links are sorted by saved date in <span className={tailwind('font-semibold')}>ascending order</span> (links you save first appear first) or <span className={tailwind('font-semibold')}>descending order</span> (links you save last appear first) when you browse your saved links.</p>
          <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 -space-y-px rounded-md bg-white shadow-sm sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
            <div className={tailwind(`relative flex rounded-tl-md rounded-tr-md border p-4 ${ascendingBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <input onChange={onDoDescendingInputChange} id="list-order-option-1" name="list-order-option-1" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={!doDescendingOrder} value="ascending" />
              </div>
              <label htmlFor="list-order-option-1" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                <span className={tailwind(`block text-sm font-medium leading-5 ${ascendingBtnInnerClassNames}`)}>Ascending order</span>
              </label>
            </div>
            <div className={tailwind(`relative flex rounded-bl-md rounded-br-md border p-4 ${descendingBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <input onChange={onDoDescendingInputChange} id="list-order-option-2" name="list-order-option-2" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={doDescendingOrder} value="descending" />
              </div>
              <label htmlFor="list-order-option-2" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                <span className={tailwind(`block text-sm font-medium leading-5 ${descendingBtnInnerClassNames}`)}>Descending order</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 id="link-previews-option-label" className={tailwind('text-base font-medium leading-none text-gray-800')}>Link Previews</h4>
          <p id="link-previews-option-description" className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500')}>Allow your saved links to be sent to our server for extracting their representative title and image. No your personal information involved at all so there is no way to know who saves what links. These titles and images are used in our website and app for you to easily find and recognize your saved links. For more information, please visit <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring')} href={'/' + HASH_PRIVACY} target="_blank" rel="noreferrer">our privacy policy page</a>.</p>
        </div>
        <span onClick={onDoExtractBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="link-previews-option-label" aria-describedby="link-previews-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring ${doExtractBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${doExtractBtnInnerClassNames}`)} />
        </span>
      </div>
      <div className={tailwind('mt-10 mb-4 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 id="auto-delete-option-label" className={tailwind('text-base font-medium leading-none text-gray-800')}>Auto Cleanup</h4>
          <p id="auto-delete-option-description" className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500')}>Allow old removed links in Trash to be automatically deleted after 45 days.</p>
        </div>
        <span onClick={onDoDeleteBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="auto-cleanup-option-label" aria-describedby="auto-cleanup-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring ${doDeleteBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${doDeleteBtnInnerClassNames}`)} />
        </span>
      </div>
    </div>
  );
};

export default React.memo(SettingsPopupMisc);
