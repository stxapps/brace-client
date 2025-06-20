import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, TextInput,
  Animated, BackHandler, Platform, Keyboard, KeyboardAvoidingView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, updateBulkEdit } from '../actions';
import { updateTagEditor, addTagEditorTagName, updateTagData } from '../actions/chunk';
import {
  TAG_EDITOR_POPUP, TAGGED, ADD_TAGS, MANAGE_TAGS, BLK_MODE, SM_WIDTH, LG_WIDTH,
  NOT_SUPPORTED,
} from '../types/const';
import { getThemeMode } from '../selectors';
import { dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const TagEditorPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isTagEditorPopupShown);
  const tagEditor = useSelector(state => state.tagEditor);
  const themeMode = useSelector(state => getThemeMode(state));
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onPopupCloseBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(TAG_EDITOR_POPUP, false));
    didClick.current = true;
  }, [dispatch]);

  const onSaveBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;

    dispatch(updatePopup(TAG_EDITOR_POPUP, false));
    dispatch(updateTagData(tagEditor.ids, tagEditor.values));
    dispatch(updateBulkEdit(false));
  };

  const onHintSelect = (hint) => {
    if (didClick.current) return;
    didClick.current = true;

    const { values, hints } = tagEditor;

    const found = values.some(value => value.tagName === hint.tagName);
    if (found && hint.isBlur) return;

    const newValues = [
      ...values,
      { tagName: hint.tagName, displayName: hint.displayName, color: hint.color },
    ];
    const newHints = hints.map(_hint => {
      if (_hint.tagName !== hint.tagName) return _hint;
      return { ..._hint, isBlur: true };
    });
    dispatch(updateTagEditor(newValues, newHints, null, null, ''));
  };

  const onValueDeselect = (value) => {
    if (didClick.current) return;
    didClick.current = true;

    const { values, hints } = tagEditor;

    const newValues = values.filter(_value => _value.tagName !== value.tagName);
    const newHints = hints.map(hint => {
      if (hint.tagName !== value.tagName) return hint;
      return { ...hint, isBlur: false };
    });
    dispatch(updateTagEditor(newValues, newHints, null, null, ''));
  };

  const onDnInputChange = (e) => {
    const text = e.nativeEvent.text;
    dispatch(updateTagEditor(null, null, text, null, ''));
  };

  const onDnInputKeyPress = () => {
    onAddBtnClick();
  };

  const onAddBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;

    const { values, hints, displayName, color } = tagEditor;
    dispatch(addTagEditorTagName(values, hints, displayName, color));
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
    if (isShown) didClick.current = false;
  }, [isShown, tagEditor]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...dialogFMV.visible }).start();
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...dialogFMV.hidden }).start(() => {
        if (didMount) setDidCloseAnimEnd(true);
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [isShown, popupAnim, registerPopupBackHandler]);

  useEffect(() => {
    return () => {
      if (isShown) {
        if (Platform.OS === 'android') Keyboard.dismiss();
      }
    };
  }, [isShown]);

  if (derivedIsShown !== isShown) {
    if (derivedIsShown && !isShown) setDidCloseAnimEnd(false);
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  // safeAreaHeight doesn't include status bar height, but minus it anyway.
  const statusBarHeight = 24;
  const appHeight = safeAreaHeight - statusBarHeight;
  const panelHeight = Math.min(480, appHeight * 0.9);

  const popupStyle = {
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ],
  };
  if (tagEditor.mode === NOT_SUPPORTED) {
    popupStyle.maxWidth = 400;
  } else {
    if (Platform.OS === 'ios' && safeAreaWidth >= LG_WIDTH) {
      popupStyle.marginTop = Math.round(appHeight / 6);
    }
  }
  const bgStyle = { opacity: popupAnim };

  if (tagEditor.mode === NOT_SUPPORTED) {
    const canvasStyle = {
      paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right,
    };

    return (
      <View style={[tailwind('absolute inset-0 z-30'), canvasStyle]}>
        <TouchableWithoutFeedback onPress={onPopupCloseBtnClick}>
          <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
        </TouchableWithoutFeedback>
        <View style={tailwind('flex-1 flex-row items-start justify-center p-4')}>
          <Animated.View style={[tailwind('mt-14 w-full overflow-hidden rounded-lg bg-yellow-50 p-4 shadow-lg md:mt-2.5'), popupStyle]}>
            <View style={tailwind('flex-row')}>
              <View style={tailwind('flex-shrink-0 flex-grow-0')}>
                <Svg width={24} height={24} style={tailwind('font-normal text-yellow-400')} fill="currentColor" viewBox="0 0 20 20" stroke="none">
                  <Path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </Svg>
              </View>
              <View style={tailwind('ml-3 flex-shrink flex-grow lg:mt-0.5')}>
                <Text style={tailwind('mr-4 text-left text-base font-medium text-yellow-800 lg:text-sm')}>Only the same tags are supported.</Text>
                <Text style={tailwind('mt-2.5 text-sm font-normal text-yellow-700')}>Please select items with the same tags to be bulk-edited.</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('absolute top-1 right-1 rounded-md bg-yellow-50 p-1')}>
              <Svg width={20} height={20} style={tailwind('font-normal text-yellow-500')} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </Svg>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };

  const inputStyle = { paddingVertical: Platform.OS === 'ios' ? 6 : 1 };
  if (Platform.OS === 'ios') inputStyle.lineHeight = 18;

  let title = 'Tags';
  let desc = (
    <React.Fragment>Enter a new tag and press the Add button.</React.Fragment>
  );
  if (tagEditor.mode === null) {
    title = ADD_TAGS;
    if (tagEditor.hints.length === 0) {
      desc = (
        <React.Fragment>Enter a new tag and press the Add button.{'\n'}After finishing, choose save.</React.Fragment>
      );
    } else {
      desc = (
        <React.Fragment>Enter a new tag and press the Add button,{'\n'}or select from the hint below.</React.Fragment>
      );
    }
  } else if (tagEditor.mode === TAGGED) {
    title = MANAGE_TAGS;
    if (tagEditor.hints.length === 0) {
      desc = (
        <React.Fragment>No tag for this link. Enter a new one and press {safeAreaWidth < SM_WIDTH ? '' : '\n'}the Add button.</React.Fragment>
      );
    } else {
      desc = (
        <React.Fragment>No tag for this link. Enter a new one, {safeAreaWidth < SM_WIDTH ? '\n' : ''}or select from the hint below.</React.Fragment>
      );
    }
  }

  return (
    <View style={[tailwind('absolute inset-0 z-30'), canvasStyle]}>
      {/* No cancel on background of TagEditorPopup */}
      <TouchableWithoutFeedback>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      <View style={tailwind(`flex-1 justify-center p-4 ${Platform.OS === 'ios' ? 'lg:justify-start' : ''}`)}>
        <KeyboardAvoidingView behavior="padding" style={tailwind('items-center')}>
          <Animated.View style={[tailwind('w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800'), popupStyle]}>
            <ScrollView style={{ maxHeight: panelHeight }} keyboardShouldPersistTaps="handled">
              <View style={tailwind('px-4 pt-8 pb-4 sm:px-6 sm:pb-6')}>
                <Text style={tailwind('text-left text-xl font-semibold text-gray-800 blk:text-gray-100')}>{title}</Text>
                {tagEditor.values.length === 0 && <View style={tailwind('pt-4')}>
                  <Text style={tailwind('text-sm font-normal leading-6 text-gray-500 blk:text-gray-400')}>{desc}</Text>
                </View>}
                {tagEditor.values.length > 0 && <View style={[tailwind('flex-row flex-wrap items-center justify-start pt-5'), { minHeight: 64 }]}>
                  {tagEditor.values.map((value, i) => {
                    return (
                      <View key={`TagEditorValue-${value.tagName}`} style={tailwind(`mb-2 max-w-full flex-row items-center justify-start rounded-full bg-gray-100 pl-3 blk:bg-gray-700 ${i === 0 ? '' : 'ml-2'}`)}>
                        <Text style={tailwind('flex-shrink flex-grow-0 text-sm font-normal text-gray-600 blk:text-gray-300')} numberOfLines={1} ellipsizeMode="tail">{value.displayName}</Text>
                        <TouchableOpacity onPress={() => onValueDeselect(value)} style={tailwind('ml-1 flex-shrink-0 flex-grow-0 items-center justify-center py-1.5 pr-1.5')}>
                          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
                          </Svg>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>}
                {tagEditor.msg && <Text style={tailwind('py-2 text-sm font-normal text-red-500')}>{tagEditor.msg}</Text>}
                <View style={tailwind(`flex-row items-center justify-start ${tagEditor.msg ? '' : 'pt-5'}`)}>
                  <TextInput onChange={onDnInputChange} onSubmitEditing={onDnInputKeyPress} style={[tailwind('flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-sm font-normal text-gray-700 blk:border-gray-500 blk:bg-gray-800 blk:text-gray-200'), inputStyle]} placeholder="Add a new tag" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={tagEditor.displayName} />
                  <TouchableOpacity onPress={onAddBtnClick} style={[tailwind('ml-2 flex-shrink-0 flex-grow-0 flex-row items-center rounded-full border border-gray-400 bg-white pl-1.5 pr-2.5 blk:border-gray-500 blk:bg-gray-800'), { paddingVertical: 5 }]}>
                    <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
                      <Path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </Svg>
                    <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Add</Text>
                  </TouchableOpacity>
                </View>
                {tagEditor.hints.length > 0 && <View style={tailwind('flex-row flex-wrap items-center justify-start pt-4')}>
                  <Text style={tailwind('mb-2 text-sm font-normal text-gray-500 blk:text-gray-400')}>Hint:</Text>
                  {tagEditor.hints.map(hint => {
                    return (
                      <TouchableOpacity key={`TagEditorHint-${hint.tagName}`} onPress={() => onHintSelect(hint)} style={tailwind('ml-2 mb-2 max-w-full rounded-full bg-gray-100 px-3 py-1.5 blk:bg-gray-700')} disabled={hint.isBlur}>
                        <Text style={tailwind(`text-sm font-normal ${hint.isBlur ? 'text-gray-400 blk:text-gray-500' : 'text-gray-600 blk:text-gray-300'}`)} numberOfLines={1} ellipsizeMode="tail">{hint.displayName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>}
                <View style={tailwind('mt-6 flex-row items-center justify-start border-t border-gray-200 pt-3.5 blk:border-gray-600 sm:pt-5')}>
                  <TouchableOpacity onPress={onSaveBtnClick} style={[tailwind('items-center justify-center rounded-full bg-gray-800 px-4 blk:bg-gray-100'), { paddingTop: 7, paddingBottom: 7 }]}>
                    <Text style={tailwind('text-sm font-medium text-gray-50 blk:text-gray-800')}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('ml-2 rounded-md px-2.5 py-1.5')}>
                    <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default React.memo(TagEditorPopup);
