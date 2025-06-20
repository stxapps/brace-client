import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, BackHandler, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup } from '../actions';
import { updateLinkEditor, addLink } from '../actions/chunk';
import { ADD_POPUP, NO_URL, ASK_CONFIRM_URL, URL_MSGS, BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';
import { validateUrl } from '../utils';

import { useSafeAreaInsets, useTailwind } from '.';

const BottomBarAddPopup = () => {

  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isAddPopupShown);
  const url = useSelector(state => state.linkEditor.url);
  const msg = useSelector(state => state.linkEditor.msg);
  const isAskingConfirm = useSelector(state => state.linkEditor.isAskingConfirm);
  const themeMode = useSelector(state => getThemeMode(state));
  const addInput = useRef(null);
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = useCallback(() => {
    dispatch(updatePopup(ADD_POPUP, false));
  }, [dispatch]);

  const onOkBtnClick = () => {
    if (didClick.current) return;

    const tmUrl = url.trim();
    if (!isAskingConfirm) {
      const urlValidatedResult = validateUrl(tmUrl);
      if (urlValidatedResult === NO_URL) {
        dispatch(updateLinkEditor(
          { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: false }
        ));
        return;
      }
      if (urlValidatedResult === ASK_CONFIRM_URL) {
        dispatch(updateLinkEditor(
          { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: true }
        ));
        return;
      }
    }

    dispatch(addLink(tmUrl, null, null));
    dispatch(updatePopup(ADD_POPUP, false));
    didClick.current = true;
  };

  const onAddInputChange = (e) => {
    dispatch(updateLinkEditor(
      { url: e.nativeEvent.text, msg: '', isAskingConfirm: false }
    ));
  };

  const onAddInputKeyPress = () => {
    onOkBtnClick();
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
    if (isShown) {
      setTimeout(() => {
        if (addInput.current) addInput.current.focus();
      }, 100);
      didClick.current = false;
    } else {
      if (addInput.current) addInput.current.blur();
    }

    registerPopupBackHandler(isShown);

    return () => {
      registerPopupBackHandler(false);
    };
  }, [isShown, registerPopupBackHandler]);

  if (!isShown) return null;

  const popupStyle = {
    paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };
  const inputClassNames = Platform.OS === 'ios' ? 'py-1.5 leading-5' : 'py-0.5';

  return (
    <>
      <TouchableOpacity activeOpacity={1.0} onPress={onCancelBtnClick} style={tailwind('absolute inset-0 z-40 bg-black bg-opacity-25')} />
      <View style={[tailwind('absolute inset-x-0 bottom-0 z-41 rounded-t-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800'), popupStyle]}>
        <KeyboardAvoidingView behavior="padding">
          <View style={tailwind('px-4 pt-6 pb-6')}>
            <View style={tailwind('flex-row items-center justify-start')}>
              <Text style={tailwind('flex-none text-sm font-normal text-gray-500 blk:text-gray-300')}>Url:</Text>
              {/* onKeyPress event for Enter key only if there is multiline TextInput */}
              <TextInput ref={addInput} onChange={onAddInputChange} onSubmitEditing={onAddInputKeyPress} style={tailwind(`ml-3 flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-base font-normal text-gray-700 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 ${inputClassNames}`)} keyboardType="url" placeholder="https://" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={url} autoCapitalize="none" />
            </View>
            {msg !== '' && <Text style={tailwind('pt-3 text-sm font-normal text-red-500')}>{msg}</Text>}
            <View style={tailwind(`flex-row items-center justify-start ${msg !== '' ? 'pt-3' : 'pt-5'}`)}>
              <TouchableOpacity onPress={onOkBtnClick} style={[tailwind('items-center justify-center rounded-full bg-gray-800 px-4 blk:bg-gray-100'), { paddingTop: 7, paddingBottom: 7 }]}>
                <Text style={tailwind('text-sm font-medium text-gray-50 blk:text-gray-800')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onCancelBtnClick} style={tailwind('ml-2 rounded-md px-2.5 py-1.5')}>
                <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

export default React.memo(BottomBarAddPopup);
