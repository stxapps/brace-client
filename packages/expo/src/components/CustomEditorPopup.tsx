import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, TextInput,
  Animated, BackHandler, Platform, Keyboard,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { useSelector, useDispatch } from '../store';
import fileApi from '../apis/localFile';
import { updatePopup, increaseUpdateStatusBarStyleCount } from '../actions';
import { updateCustomEditor, updateImages, updateCustomData } from '../actions/chunk';
import {
  CUSTOM_EDITOR_POPUP, IMAGES, CD_ROOT, BLK_MODE, LG_WIDTH,
} from '../types/const';
import { getCustomEditor, getThemeMode } from '../selectors';
import { isObject, isString, randomString, getFileExt, getMainId } from '../utils';
import { dialogFMV } from '../types/animConfigs';
import cache from '../utils/cache';

import { useSafeAreaFrame, useSafeAreaInsets, useKeyboardHeight, useTailwind } from '.';

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 597;

const resizeImage = async (asset) => {
  const { uri, width, height } = asset;
  const cxt = ImageManipulator.manipulate(uri);

  let outUri = uri;
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    let newWidth, newHeight;

    const aspectRatio = width / height;
    if (width / MAX_WIDTH > height / MAX_HEIGHT) {
      newWidth = MAX_WIDTH;
      newHeight = MAX_WIDTH / aspectRatio;
    } else {
      newHeight = MAX_HEIGHT;
      newWidth = MAX_HEIGHT * aspectRatio;
    }

    let imageType = SaveFormat.JPEG;
    if (uri.slice(-3).toLowerCase() === 'png') imageType = SaveFormat.PNG;

    const ref = await cxt.resize({ width: newWidth, height: newHeight }).renderAsync();
    const res = await ref.saveAsync({ compress: 0.92, format: imageType });
    outUri = res.uri;
  }

  return outUri;
};

const CustomEditorPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight(Platform.OS === 'android');
  const isShown = useSelector(state => state.display.isCustomEditorPopupShown);
  const selectingLinkId = useSelector(state => state.display.selectingLinkId);
  const customEditor = useSelector(state => getCustomEditor(state));
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
    dispatch(updatePopup(CUSTOM_EDITOR_POPUP, false));
    didClick.current = true;
  }, [dispatch]);

  const onSaveBtnClick = async () => {
    if (didClick.current) return;
    didClick.current = true;

    const { title, image } = customEditor;

    if (!isObject(image)) {
      dispatch(updatePopup(CUSTOM_EDITOR_POPUP, false));
      dispatch(updateCustomData(title, image));
      return;
    }

    const toId = `${getMainId(selectingLinkId)}-${randomString(4)}-${Date.now()}`;
    let fpart = IMAGES + '/' + toId;
    const ext = getFileExt(image.path);
    if (ext) fpart += `.${ext}`;

    const cfpart = CD_ROOT + '/' + fpart;
    try {
      const { contentUrl } = await fileApi.cp(image.path, fpart);
      dispatch(updateImages(cfpart, contentUrl));

      dispatch(updatePopup(CUSTOM_EDITOR_POPUP, false));
      dispatch(updateCustomData(title, cfpart));
    } catch (error) {
      console.log('CustomEditorPopup: onCanvasToBlob error: ', error);
      dispatch(updateCustomEditor(
        null, null, null, null, null, null, null, `Image Save Failed: ${error}`,
      ));
      didClick.current = false;
    }
  };

  const onTitleInputChange = (e) => {
    dispatch(updateCustomEditor(e.nativeEvent.text));
  };

  const onUploadImageBtnClick = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        mediaTypes: 'images',
        aspect: [MAX_WIDTH, MAX_HEIGHT],
      });
      dispatch(increaseUpdateStatusBarStyleCount());

      if (res.canceled) return;

      const asset = res.assets[0];
      const path = await resizeImage(asset);
      dispatch(updateCustomEditor(null, { ...asset, path }, 0, 0, 0, 0));
    } catch (error) {
      console.log('In CustomEditorPopup, ImagePicker error:', error);
      dispatch(increaseUpdateStatusBarStyleCount());
      dispatch(updateCustomEditor(
        null, null, null, null, null, null, null, `Image Upload Failed: ${error}`,
      ));
    }
  };

  const onClearImageBtnClick = () => {
    dispatch(updateCustomEditor(null, null, 0, 0, 0, 0, true));
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

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom + keyboardHeight,
    paddingLeft: insets.left, paddingRight: insets.right,
  };

  // safeAreaHeight doesn't include status bar height, but minus it anyway.
  const statusBarHeight = 24;
  const appHeight = Math.max(safeAreaHeight - statusBarHeight - keyboardHeight, 128);
  const panelHeight = Math.min(480 - 40, appHeight * 0.9);

  const popupStyle: any = {
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ],
  };
  if (Platform.OS === 'ios' && safeAreaWidth >= LG_WIDTH) {
    popupStyle.marginTop = Math.round(appHeight / 6);
  }
  const bgStyle = { opacity: popupAnim };

  const inputClassNames = Platform.OS === 'ios' ? 'py-1.5 leading-5' : 'py-1';

  let imageUrl;
  if (isString(customEditor.image)) imageUrl = customEditor.imageUrl;
  else if (isObject(customEditor.image)) imageUrl = customEditor.image.path;

  return (
    <View style={[tailwind('absolute inset-0 z-30'), canvasStyle]}>
      {/* No cancel on background of CustomEditorPopup */}
      <TouchableWithoutFeedback>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      <View style={tailwind(`flex-1 items-center justify-center p-4 ${Platform.OS === 'ios' ? 'lg:justify-start' : ''}`)}>
        <Animated.View style={[tailwind('w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800'), popupStyle]}>
          <ScrollView style={{ maxHeight: panelHeight }} automaticallyAdjustKeyboardInsets={true} keyboardShouldPersistTaps="handled">
            {imageUrl && <View style={tailwind('w-full rounded-t-lg bg-white blk:border-b blk:border-gray-700 blk:bg-gray-800 aspect-7/12 shadow-xs')}>
              <Image style={tailwind('h-full w-full')} source={cache(`CEP_image_${imageUrl}`, { uri: imageUrl }, [imageUrl])} />
              <TouchableOpacity onPress={onClearImageBtnClick} style={tailwind('absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center')}>
                <View style={tailwind('flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
                  <Svg width={16} height={16} style={tailwind('font-normal text-gray-500 blk:text-gray-300')} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
                  </Svg>
                </View>
              </TouchableOpacity>
            </View>}
            {!imageUrl && <View style={tailwind('w-full items-center justify-center rounded-t-lg bg-white blk:border-b blk:border-gray-700 blk:bg-gray-800 aspect-7/12 shadow-xs')}>
              <TouchableOpacity onPress={onUploadImageBtnClick} style={tailwind('mt-4 items-center justify-center rounded-lg p-2')}>
                <Svg width={36} height={36} style={tailwind('font-normal text-gray-400 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M4 3C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5V15C2 15.5304 2.21071 16.0391 2.58579 16.4142C2.96086 16.7893 3.46957 17 4 17H16C16.5304 17 17.0391 16.7893 17.4142 16.4142C17.7893 16.0391 18 15.5304 18 15V5C18 4.46957 17.7893 3.96086 17.4142 3.58579C17.0391 3.21071 16.5304 3 16 3H4ZM16 15H4L8 7L11 13L13 9L16 15Z" />
                </Svg>
                <Text style={tailwind('mt-1 text-sm font-normal text-gray-500 blk:text-gray-300')}>Upload an image</Text>
              </TouchableOpacity>
            </View>}
            <View style={tailwind('flex-row items-center justify-start px-4 pt-4')}>
              <Text style={tailwind('flex-none text-sm font-normal text-gray-500 blk:text-gray-300')}>Title:</Text>
              <TextInput onChange={onTitleInputChange} style={tailwind(`ml-3 flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-base font-normal text-gray-700 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 ${inputClassNames}`)} placeholder="Title" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'} value={customEditor.title} />
            </View>
            <View style={tailwind('flex-row items-center justify-start px-4 pt-3 pb-4')}>
              <TouchableOpacity onPress={onSaveBtnClick} style={[tailwind('items-center justify-center rounded-full bg-gray-800 px-4 blk:bg-gray-100'), { paddingTop: 7, paddingBottom: 7 }]}>
                <Text style={tailwind('text-sm font-medium text-gray-50 blk:text-gray-800')}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('ml-2 rounded-md px-2.5 py-1.5')}>
                <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {customEditor.msg.length > 0 && <View style={tailwind('absolute inset-x-0 top-0 items-start justify-center')}>
              <View style={tailwind('m-4 rounded-md bg-red-50 p-4 shadow')}>
                <View style={tailwind('w-full flex-row')}>
                  <View style={tailwind('flex-shrink-0 flex-grow-0')}>
                    <Svg style={tailwind('font-normal text-red-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                      <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </Svg>
                  </View>
                  <View style={tailwind('ml-3 flex-shrink flex-grow')}>
                    <Text style={tailwind('text-left text-sm font-normal leading-5 text-red-800')} numberOfLines={2} ellipsizeMode="tail" >{customEditor.msg}</Text>
                  </View>
                </View>
              </View>
            </View>}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
};

export default React.memo(CustomEditorPopup);
