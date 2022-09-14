import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
  updateLayoutType, updateTheme, updateUpdatingThemeMode, updatePopup,
} from '../actions';
import {
  DOMAIN_NAME, HASH_PRIVACY, LAYOUT_CARD, LAYOUT_LIST, WHT_MODE, BLK_MODE, SYSTEM_MODE,
  CUSTOM_MODE, TIME_PICK_POPUP,
} from '../types/const';
import { getFormattedTime } from '../utils';

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
  const customOptions = useSelector(state => state.localSettings.themeCustomOptions);
  const is24HFormat = useSelector(state => state.window.is24HFormat);
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

  const onLayoutTypeInputChange = (value) => {
    dispatch(updateLayoutType(value));
  };

  const onThemeInputChange = (value) => {
    const _themeMode = value;
    const _customOptions = customOptions;
    dispatch(updateTheme(_themeMode, _customOptions));
  };

  const onWhtTimeBtnClick = () => {
    whtTimeBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateUpdatingThemeMode(WHT_MODE));

      const newX = x - 1, newY = y - 1;
      const rect = {
        x: newX, y: newY, width, height,
        top: newY, right: newX + width, bottom: newY + height, left: newX,
      };
      dispatch(updatePopup(TIME_PICK_POPUP, true, rect));
    });
  };

  const onBlkTimeBtnClick = () => {
    blkTimeBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateUpdatingThemeMode(BLK_MODE));

      const newX = x - 1, newY = y - 1;
      const rect = {
        x: newX, y: newY, width, height,
        top: newY, right: newX + width, bottom: newY + height, left: newX,
      };
      dispatch(updatePopup(TIME_PICK_POPUP, true, rect));
    });
  };

  const switchThumbColorOn = 'rgb(59, 130, 246)';
  const switchThumbColorOff = 'rgb(229, 231, 235)';
  const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(191, 219, 254)' : 'rgb(59, 130, 246)';
  const switchTrackColorOff = 'rgb(156, 163, 175)';

  const ascendingBtnClassNames = !doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const ascendingRBtnClassNames = !doDescendingOrder ? 'border-blue-600 blk:border-blue-300' : 'border-gray-300 blk:border-gray-600';
  const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-blue-600 blk:bg-blue-300' : 'bg-gray-300 blk:bg-gray-900';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const descendingRBtnClassNames = doDescendingOrder ? 'border-blue-600 blk:border-blue-300' : 'border-gray-300 blk:border-gray-600';
  const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-blue-600 blk:bg-blue-300' : 'bg-gray-300 blk:bg-gray-900';

  const layoutCardBtnClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  const layoutCardBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const layoutCardRBtnClassNames = layoutType === LAYOUT_CARD ? 'border-blue-600 blk:border-blue-300' : 'border-gray-300 blk:border-gray-600';
  const layoutCardRBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-600 blk:bg-blue-300' : 'bg-gray-300 blk:bg-gray-900';

  const layoutListBtnClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  const layoutListBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const layoutListRBtnClassNames = layoutType === LAYOUT_LIST ? 'border-blue-600 blk:border-blue-300' : 'border-gray-300 blk:border-gray-600';
  const layoutListRBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-600 blk:bg-blue-300' : 'bg-gray-300 blk:bg-gray-900';

  const whtBtnClassNames = themeMode === WHT_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  const whtBtnInnerClassNames = themeMode === WHT_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const whtRBtnClassNames = themeMode === WHT_MODE ? 'border-blue-600 blk:border-blue-300' : 'border-gray-300 blk:border-gray-600';
  const whtRBtnInnerClassNames = themeMode === WHT_MODE ? 'bg-blue-600 blk:bg-blue-300' : 'bg-gray-300 blk:bg-gray-900';
  const blkBtnClassNames = themeMode === BLK_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  const blkBtnInnerClassNames = themeMode === BLK_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const blkRBtnClassNames = themeMode === BLK_MODE ? 'border-blue-600 blk:border-blue-300' : 'border-gray-300 blk:border-gray-600';
  const blkRBtnInnerClassNames = themeMode === BLK_MODE ? 'bg-blue-600 blk:bg-blue-300' : 'bg-gray-300 blk:bg-gray-900';
  const systemBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  const systemBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const systemRBtnClassNames = themeMode === SYSTEM_MODE ? 'border-blue-600 blk:border-blue-300' : 'border-gray-300 blk:border-gray-600';
  const systemRBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'bg-blue-600 blk:bg-blue-300' : 'bg-gray-300 blk:bg-gray-900';
  const customBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-blue-100 border-blue-200 z-10 blk:bg-blue-600 blk:border-blue-700' : 'border-gray-200 blk:border-gray-700';
  const customBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'text-blue-800 blk:text-blue-100' : 'text-gray-600 blk:text-gray-300';
  const customRBtnClassNames = themeMode === CUSTOM_MODE ? 'border-blue-600 blk:border-blue-300' : 'border-gray-300 blk:border-gray-600';
  const customRBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'bg-blue-600 blk:bg-blue-300' : 'bg-gray-300 blk:bg-gray-900';
  const customTextClassNames = themeMode === CUSTOM_MODE ? 'text-blue-700 blk:text-blue-200' : 'text-gray-500 blk:text-gray-400';
  const customInputClassNames = themeMode === CUSTOM_MODE ? 'border-gray-300 bg-white blk:border-blue-300 blk:bg-blue-600 ' : 'border-gray-300 bg-white blk:border-gray-600 blk:bg-gray-900 ';
  const customInputInnerClassNames = themeMode === CUSTOM_MODE ? 'text-gray-600 blk:text-blue-200' : 'text-gray-400 blk:text-gray-500';

  let whtTime, blkTime;
  for (const option of customOptions) {
    if (option.mode === WHT_MODE) whtTime = option.startTime;
    if (option.mode === BLK_MODE) blkTime = option.startTime;
  }
  whtTime = getFormattedTime(whtTime, is24HFormat).time;
  blkTime = getFormattedTime(blkTime, is24HFormat).time;

  const isSystemShown = (
    Platform.OS !== 'android' || (Platform.OS === 'android' && Platform.Version >= 29)
  );

  let systemText = (
    <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose appearance to be <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Light</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Dark</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>System</Text> (uses your device's setting), or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Custom</Text> (schedule times to change appearance automatically). This setting is not synced so you can have a different appearance for each of your devices.</Text>
  );
  if (!isSystemShown) {
    systemText = (
      <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose appearance to be <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Light</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Dark</Text>, or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Custom</Text> (schedule times to change appearance automatically). This setting is not synced so you can have a different appearance for each of your devices.</Text>
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
          <View style={tailwind('w-full max-w-sm rounded-md bg-white shadow-sm blk:bg-gray-900')}>
            <TouchableOpacity onPress={() => onThemeInputChange(WHT_MODE)}>
              <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${whtBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${whtRBtnClassNames}`)}>
                    <View style={tailwind(`h-3 w-3 rounded-full ${whtRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${whtBtnInnerClassNames}`)}>Light</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onThemeInputChange(BLK_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${blkBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${blkRBtnClassNames}`)}>
                    <View style={tailwind(`h-3 w-3 rounded-full ${blkRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${blkBtnInnerClassNames}`)}>Dark</Text>
              </View>
            </TouchableOpacity>
            {isSystemShown && <TouchableOpacity onPress={() => onThemeInputChange(SYSTEM_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${systemBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${systemRBtnClassNames}`)}>
                    <View style={tailwind(`h-3 w-3 rounded-full ${systemRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${systemBtnInnerClassNames}`)}>System</Text>
              </View>
            </TouchableOpacity>}
            <TouchableOpacity onPress={() => onThemeInputChange(CUSTOM_MODE)}>
              <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${customBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${customRBtnClassNames}`)}>
                    <View style={tailwind(`h-3 w-3 rounded-full ${customRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <View style={tailwind('ml-3')}>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${customBtnInnerClassNames}`)}>Custom</Text>
                  <View style={tailwind('mt-1.5 sm:flex-row sm:items-center sm:justify-start')}>
                    <View style={tailwind('flex-row items-center justify-start')}>
                      <View style={tailwind('w-10')}>
                        <Text style={tailwind(`text-sm font-normal ${customTextClassNames}`)}>Light:</Text>
                      </View>
                      <TouchableOpacity ref={whtTimeBtn} onPress={onWhtTimeBtnClick} style={tailwind(`ml-1 rounded-md border px-3 py-1.5 ${customInputClassNames}`)} disabled={themeMode !== CUSTOM_MODE}>
                        <Text style={tailwind(`text-base font-normal leading-5 ${customInputInnerClassNames}`)}>{whtTime}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={tailwind('mt-2 flex-row items-center justify-start sm:ml-4 sm:mt-0')}>
                      <View style={tailwind('w-10')}>
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
            <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose whether your saved links are displayed in Cards view or in List view. This setting is not synced so you can have a different layout for each of your devices.</Text>
          </View>
          <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-shrink-0 sm:flex-grow-0')}>
            <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-sm blk:bg-gray-900 sm:w-48')}>
              <TouchableOpacity onPress={() => onLayoutTypeInputChange(LAYOUT_CARD)}>
                <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${layoutCardBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${layoutCardRBtnClassNames}`)}>
                      <View style={tailwind(`h-3 w-3 rounded-full ${layoutCardRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${layoutCardBtnInnerClassNames}`)}>Cards view</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onLayoutTypeInputChange(LAYOUT_LIST)}>
                <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${layoutListBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${layoutListRBtnClassNames}`)}>
                      <View style={tailwind(`h-3 w-3 rounded-full ${layoutListRBtnInnerClassNames}`)} />
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
            <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-sm blk:bg-gray-900 sm:w-48')}>
              <TouchableOpacity onPress={() => onDoDescendingInputChange('ascending')} style={tailwind('')}>
                <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${ascendingBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${ascendingRBtnClassNames}`)}>
                      <View style={tailwind(`h-3 w-3 rounded-full ${ascendingRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${ascendingBtnInnerClassNames}`)}>Ascending order</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDoDescendingInputChange('descending')} style={tailwind('')}>
                <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${descendingBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${descendingRBtnClassNames}`)}>
                      <View style={tailwind(`h-3 w-3 rounded-full ${descendingRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${descendingBtnInnerClassNames}`)}>Descending order</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10 flex-row items-center justify-between md:mt-0')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Link Previews</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Allow your saved links to be sent to our server for extracting their representative title and image. No your personal information involved at all so there is no way to know who saves what links. These titles and images are used in our website and app for you to easily find and recognize your saved links. For more information, please visit <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_PRIVACY)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>our privacy policy page</Text>.</Text>
        </View>
        <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
          <Switch onValueChange={onDoExtractBtnClick} value={doExtractContents} thumbColor={Platform.OS === 'android' ? doExtractContents ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
        </View>
      </View>
      <View style={tailwind('mt-10 mb-4 flex-row items-center justify-between')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Auto Cleanup</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Allow old removed links in Trash to be automatically deleted after 45 days.</Text>
        </View>
        <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
          <Switch onValueChange={onDoDeleteBtnClick} value={doDeleteOldLinksInTrash} thumbColor={Platform.OS === 'android' ? doDeleteOldLinksInTrash ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
        </View>
      </View>
    </View>
  );
};

export default React.memo(SettingsPopupMisc);
