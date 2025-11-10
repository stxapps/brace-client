import React, { useEffect, useRef, useCallback } from 'react';
import {
  ScrollView, View, TouchableOpacity, BackHandler, Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  KeyboardController, AndroidSoftInputModes,
} from 'react-native-keyboard-controller';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  updateAddPopup, updateLinkEditor, addLink, updateSelectingListName,
  updateListNamesMode,
} from '../actions/chunk';
import {
  LIST_NAMES_POPUP, LIST_NAMES_MODE_ADD_LINK, LIST_NAMES_ANIM_TYPE_BMODAL,
  ADD_MODE_BASIC, ADD_MODE_ADVANCED, BLK_MODE,
} from '../types/const';
import { getThemeMode } from '../selectors';
import { isFldStr, toPx, getRect, adjustRect, getListNameDisplayName } from '../utils';
import { selectHint, deselectValue, addTagName, renameKeys } from '../utils/tag';

import {
  useSafeAreaFrame, useSafeAreaInsets, useTailwind, useKeyboardHeight,
} from '.';
import Text from './CustomText';
import TextInput from './CustomTextInput';

const BottomBarAddPopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const isShown = useSelector(state => state.display.isAddPopupShown);
  const linkEditor = useSelector(state => state.linkEditor);
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const themeMode = useSelector(state => getThemeMode(state));
  const addInput = useRef(null);
  const listNameBtn = useRef(null);
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onAddInputChange = (e) => {
    dispatch(updateLinkEditor(
      { url: e.nativeEvent.text, isAskingConfirm: false }
    ));
  };

  const onAddInputKeyPress = () => {
    onAddOkBtnClick();
  };

  const onAddOkBtnClick = () => {
    if (didClick.current) return;
    dispatch(addLink());
    didClick.current = true;
  };

  const onAddCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updateAddPopup(false));
    didClick.current = true;
  }, [dispatch]);

  const onAdvancedBtnClick = () => {
    let newMode = ADD_MODE_BASIC;
    if (linkEditor.mode === ADD_MODE_BASIC) newMode = ADD_MODE_ADVANCED;
    dispatch(updateLinkEditor({ mode: newMode }));
  };

  const onListNameBtnClick = () => {
    listNameBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateSelectingListName(linkEditor.listName));
      dispatch(updateListNamesMode(
        LIST_NAMES_MODE_ADD_LINK, LIST_NAMES_ANIM_TYPE_BMODAL,
      ));

      const rect = getRect(x, y, width, height);
      const nRect = adjustRect(
        rect, toPx('-0.25rem'), toPx('-0.25rem'), toPx('0.5rem'), toPx('0.5rem')
      );
      dispatch(updatePopup(LIST_NAMES_POPUP, true, nRect));
    });
  };

  const onTagHintSelect = (hint) => {
    if (didClick.current) return;
    didClick.current = true;

    const { tagValues, tagHints } = linkEditor;
    const payload = renameKeys(selectHint(tagValues, tagHints, hint));
    dispatch(updateLinkEditor(payload));
  };

  const onTagValueDeselect = (value) => {
    if (didClick.current) return;
    didClick.current = true;

    const { tagValues, tagHints } = linkEditor;
    const payload = renameKeys(deselectValue(tagValues, tagHints, value));
    dispatch(updateLinkEditor(payload));
  };

  const onTagDnInputChange = (e) => {
    dispatch(updateLinkEditor({ tagDisplayName: e.nativeEvent.text }));
  };

  const onTagDnInputKeyPress = () => {
    onTagAddBtnClick();
  };

  const onTagAddBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;

    const { tagValues, tagHints, tagDisplayName, tagColor } = linkEditor;
    const payload = renameKeys(addTagName(
      tagNameMap, tagValues, tagHints, tagDisplayName, tagColor
    ));
    dispatch(updateLinkEditor(payload));
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onAddCancelBtnClick();
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
  }, [onAddCancelBtnClick]);

  useEffect(() => {
    // Already set android:windowSoftInputMode to adjustNothing in AndroidManifest.xml,
    //   but it doesn't work on split screen. So set it again here.
    KeyboardController.setInputMode(AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING);
  }, [isShown]);

  useEffect(() => {
    if (isShown) {
      setTimeout(() => {
        if (addInput.current) addInput.current.focus();
      }, 100);
    } else {
      if (addInput.current) addInput.current.blur();
    }

    registerPopupBackHandler(isShown);

    return () => {
      registerPopupBackHandler(false);
    };
  }, [isShown, registerPopupBackHandler]);

  useEffect(() => {
    if (isShown) didClick.current = false;
  }, [isShown, linkEditor]);

  if (!isShown) return null;

  const renderContent = () => {
    let displayName = null;
    if (isFldStr(linkEditor.listName)) {
      displayName = getListNameDisplayName(linkEditor.listName, listNameMap);
    }

    let tagDesc = null;
    if (linkEditor.mode === ADD_MODE_ADVANCED) {
      if (linkEditor.tagHints.length === 0) {
        tagDesc = (
          <React.Fragment>Enter a new tag and press the Add button.</React.Fragment>
        );
      } else {
        tagDesc = (
          <React.Fragment>Enter a new tag or select from the hint.</React.Fragment>
        );
      }
    }

    const inputClassNames = Platform.OS === 'ios' ? 'py-1.5 leading-5' : 'py-1';

    const tagInputStyle: any = { paddingVertical: Platform.OS === 'ios' ? 6 : 5.5 };
    if (Platform.OS === 'ios') tagInputStyle.lineHeight = 18;

    return (
      <View style={tailwind('px-4 pt-6 pb-6')}>
        <View style={tailwind('flex-row items-center justify-start')}>
          <Text style={tailwind('flex-none text-sm font-normal text-gray-500 blk:text-gray-300')}>Url:</Text>
          {/* onKeyPress event for Enter key only if there is multiline TextInput */}
          <TextInput ref={addInput} onChange={onAddInputChange} onSubmitEditing={onAddInputKeyPress} style={tailwind(`ml-3 flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-base font-normal text-gray-700 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 ${inputClassNames}`)} keyboardType="url" placeholder="https://" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={linkEditor.url} autoCapitalize="none" />
        </View>
        <TouchableOpacity onPress={onAdvancedBtnClick} style={tailwind('mt-5 -ml-0.5 flex-row items-center justify-start rounded-md px-0.5 py-1.5')}>
          {linkEditor.mode !== ADD_MODE_ADVANCED && <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={12} height={12} viewBox="0 0 14 14" fill="none" stroke="currentColor">
            <Path d="M7 1V7M7 7V13M7 7H13M7 7H1" strokeWidth={themeMode === BLK_MODE ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
          {linkEditor.mode === ADD_MODE_ADVANCED && <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={12} height={12} viewBox="0 0 14 14" fill="none" stroke="currentColor">
            <Path d="M13 7H1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>}
          <Text style={tailwind('ml-1 text-sm font-normal text-gray-500 blk:text-gray-400')}>Advanced</Text>
        </TouchableOpacity>
        {linkEditor.mode === ADD_MODE_ADVANCED && <View style={tailwind('pt-2')}>
          <View style={tailwind('flex-row items-center justify-start')}>
            <Text style={tailwind('w-12 flex-shrink-0 flex-grow-0 text-sm font-normal text-gray-500 blk:text-gray-300')}>List:</Text>
            <TouchableOpacity ref={listNameBtn} onPress={onListNameBtnClick} style={tailwind('flex-row items-center rounded-md bg-white py-1 blk:bg-gray-800')}>
              <Text style={tailwind('text-base font-normal text-gray-700 blk:text-gray-100')} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
              <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-600 blk:text-gray-100')} width={20} height={20} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <Path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
          <View style={tailwind('flex-row items-start justify-start pt-1')}>
            <View style={tailwind('flex-row items-center justify-start flex-shrink-0 flex-grow-0 h-13 w-12')}>
              <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Tags:</Text>
            </View>
            <View style={tailwind('flex-shrink flex-grow')}>
              {linkEditor.tagValues.length === 0 && <View style={tailwind('flex-row min-h-13 items-center justify-start')}>
                <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{tagDesc}</Text>
              </View>}
              {linkEditor.tagValues.length > 0 && <View style={tailwind('flex-row min-h-13 flex-wrap items-start justify-start pt-2.5')}>
                {linkEditor.tagValues.map((value, i) => {
                  return (
                    <View key={`TagEditorValue-${value.tagName}`} style={tailwind(`mb-2 max-w-full flex-row items-center justify-start rounded-full bg-gray-100 pl-3 blk:bg-gray-700 ${i === 0 ? '' : 'ml-2'}`)}>
                      <Text style={tailwind('flex-shrink flex-grow-0 text-sm font-normal text-gray-600 blk:text-gray-300')} numberOfLines={1} ellipsizeMode="tail">{value.displayName}</Text>
                      <TouchableOpacity onPress={() => onTagValueDeselect(value)} style={tailwind('ml-1 flex-shrink-0 flex-grow-0 items-center justify-center rounded-full py-1.5 pr-1.5')}>
                        <Svg style={tailwind('rounded-full font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                          <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
                        </Svg>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>}
              {linkEditor.tagMsg && <Text style={tailwind('text-sm font-normal text-red-500')}>{linkEditor.tagMsg}</Text>}
              <View style={tailwind(`flex-row items-center justify-start ${linkEditor.tagMsg ? 'pt-0.5' : 'pt-1'}`)}>
                <TextInput onChange={onTagDnInputChange} onSubmitEditing={onTagDnInputKeyPress} style={[tailwind('flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-sm font-normal text-gray-700 blk:border-gray-500 blk:bg-gray-800 blk:text-gray-200'), tagInputStyle]} placeholder="Add a new tag" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={linkEditor.tagDisplayName} />
                <TouchableOpacity onPress={onTagAddBtnClick} style={[tailwind('ml-2 flex-shrink-0 flex-grow-0 flex-row items-center rounded-full border border-gray-400 bg-white pl-1.5 pr-2.5 blk:border-gray-500 blk:bg-gray-800'), { paddingVertical: 5 }]}>
                  <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </Svg>
                  <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Add</Text>
                </TouchableOpacity>
              </View>
              {linkEditor.tagHints.length > 0 && <View style={tailwind('flex-row flex-wrap items-center justify-start pt-3.5')}>
                <Text style={tailwind('mb-2 text-sm font-normal text-gray-500 blk:text-gray-400')}>Hint:</Text>
                {linkEditor.tagHints.map(hint => {
                  return (
                    <TouchableOpacity key={`TagEditorHint-${hint.tagName}`} onPress={() => onTagHintSelect(hint)} style={tailwind('ml-2 mb-2 max-w-full rounded-full bg-gray-100 px-3 py-1.5 blk:bg-gray-700')} disabled={hint.isBlur}>
                      <Text style={tailwind(`text-sm font-normal ${hint.isBlur ? 'text-gray-400 blk:text-gray-500' : 'text-gray-600 blk:text-gray-300'}`)} numberOfLines={1} ellipsizeMode="tail">{hint.displayName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>}
            </View>
          </View>
        </View>}
        {linkEditor.msg !== '' && <Text style={tailwind('pt-4 text-sm font-normal text-red-500')}>{linkEditor.msg}</Text>}
        <View style={tailwind(`flex-row items-center justify-start ${linkEditor.msg !== '' ? 'pt-2' : 'pt-5'}`)}>
          <TouchableOpacity onPress={onAddOkBtnClick} style={[tailwind('items-center justify-center rounded-full bg-gray-800 px-4 blk:bg-gray-100'), { paddingTop: 7, paddingBottom: 7 }]}>
            <Text style={tailwind('text-sm font-medium text-gray-50 blk:text-gray-800')}>{linkEditor.isAskingConfirm ? 'Sure' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onAddCancelBtnClick} style={tailwind('ml-2 rounded-md px-2.5 py-1.5')}>
            <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const popupStyle = {
    paddingBottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };
  const scrollViewStyle = {
    maxHeight: Math.max(
      Math.min(safeAreaHeight - keyboardHeight - 24, safeAreaHeight - 368), 192,
    ),
  };

  return (
    <>
      <TouchableOpacity activeOpacity={1.0} onPress={onAddCancelBtnClick} style={tailwind('absolute inset-0 z-30 bg-black bg-opacity-25')} />
      <View style={[tailwind('absolute inset-x-0 bottom-0 z-31 rounded-t-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800'), popupStyle]}>
        {/* Also set pb to kb height on iOS so autoAdjustKbInsets is false */}
        <ScrollView style={scrollViewStyle} automaticallyAdjustKeyboardInsets={false} keyboardShouldPersistTaps="handled">
          {renderContent()}
        </ScrollView>
      </View>
    </>
  );
};

export default React.memo(BottomBarAddPopup);
