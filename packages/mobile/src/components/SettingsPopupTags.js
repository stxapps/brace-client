import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Keyboard, Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import { updatePopup } from '../actions';
import {
  addTagNames, updateTagNames, moveTagName, checkDeleteTagName, updateSelectingTagName,
  updateTagNameEditors,
} from '../actions/chunk';
import {
  VALID_TAG_NAME, TAG_NAME_MSGS, SETTINGS_TAGS_MENU_POPUP, SWAP_LEFT, SWAP_RIGHT,
  MODE_VIEW, MODE_EDIT, BLK_MODE,
} from '../types/const';
import { makeGetTagNameEditor, getThemeMode } from '../selectors';
import { validateTagNameDisplayName, getRect } from '../utils';
import { initialTagNameEditorState } from '../types/initialStates';

import { useTailwind } from '.';

const SettingsPopupTags = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const tailwind = useTailwind();

  const validateDisplayName = (tagName, displayName) => {
    return validateTagNameDisplayName(tagName, displayName, tagNameMap);
  };

  useEffect(() => {
    return () => {
      if (Platform.OS === 'android') Keyboard.dismiss();
    };
  }, []);

  return (
    <View style={tailwind('p-4 md:p-6')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800 blk:text-gray-100')}>Tags</Text>
      </View>
      <View style={tailwind('hidden md:flex')}>
        <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Tags</Text>
      </View>
      <View style={tailwind('pt-2.5')}>
        <TagNameEditor key="SPT_newTagNameEditor" tagNameObj={null} validateDisplayName={validateDisplayName} />
        {tagNameMap.map(tagNameObj => <TagNameEditor key={tagNameObj.tagName} tagNameObj={tagNameObj} validateDisplayName={validateDisplayName} />)}
      </View>
    </View>
  );
};

const _TagNameEditor = (props) => {

  const { tagNameObj, validateDisplayName } = props;
  const key = tagNameObj ? tagNameObj.tagName : 'newTagNameEditor';
  const getTagNameEditor = useMemo(makeGetTagNameEditor, []);
  const state = useSelector(s => getTagNameEditor(s, key));
  const themeMode = useSelector(s => getThemeMode(s));
  const prevFocusCount = useRef(state.focusCount);
  const prevBlurCount = useRef(state.blurCount);
  const prevDisplayName = useRef(null);
  const input = useRef(null);
  const menuBtn = useRef(null);
  const didOkBtnJustPress = useRef(false);
  const didCancelBtnJustPress = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onAddBtnClick = () => {
    dispatch(updateTagNameEditors({
      [key]: { mode: MODE_EDIT, value: '', msg: '', focusCount: state.focusCount + 1 },
    }));
  };

  const onEditBtnClick = () => {
    dispatch(updateTagNameEditors({
      [key]: {
        mode: MODE_EDIT,
        value: tagNameObj.displayName,
        msg: '',
        focusCount: state.focusCount + 1,
      },
    }));
  };

  const onInputFocus = () => {
    dispatch(updateTagNameEditors({
      [key]: { mode: MODE_EDIT },
    }));
  };

  const onInputChange = (e) => {
    // Event is reused and will be nullified after the event handler has been called.
    // https://reactjs.org/docs/legacy-event-pooling.html
    const text = e.nativeEvent.text;
    dispatch(updateTagNameEditors({ [key]: { value: text, msg: '' } }));
  };

  const onInputKeyPress = () => {
    onOkBtnClick();
  };

  const onInputBlur = () => {
    if (didOkBtnJustPress.current || didCancelBtnJustPress.current) {
      didOkBtnJustPress.current = false;
      didCancelBtnJustPress.current = false;
      return;
    }

    if (tagNameObj) {
      if (tagNameObj.displayName === state.value) {
        onCancelBtnClick();
        return;
      }
    } else {
      if (state.value === '') {
        onCancelBtnClick();
        return;
      }
    }
  };

  const onOkBtnPress = () => {
    didOkBtnJustPress.current = true;
  };

  const onOkBtnClick = () => {
    if (tagNameObj) return onEditOkBtnClick();
    return onAddOkBtnClick();
  };

  const onAddOkBtnClick = () => {
    const value = state.value.trim();
    const tagNameValidatedResult = validateDisplayName(null, value);
    if (tagNameValidatedResult !== VALID_TAG_NAME) {
      dispatch(updateTagNameEditors({
        [key]: {
          mode: MODE_EDIT,
          msg: TAG_NAME_MSGS[tagNameValidatedResult],
          focusCount: state.focusCount + 1,
        },
      }));
      return;
    }

    dispatch(addTagNames([value], [state.color]));
    dispatch(updateTagNameEditors({
      [key]: { ...initialTagNameEditorState, focusCount: state.focusCount },
    }));
    if (input.current) input.current.blur();
  };

  const onEditOkBtnClick = () => {
    const value = state.value.trim();
    if (value === tagNameObj.displayName) return onCancelBtnClick();

    const tagNameValidatedResult = validateDisplayName(tagNameObj.tagName, value);
    if (tagNameValidatedResult !== VALID_TAG_NAME) {
      dispatch(updateTagNameEditors({
        [key]: {
          mode: MODE_EDIT,
          msg: TAG_NAME_MSGS[tagNameValidatedResult],
          focusCount: state.focusCount + 1,
        },
      }));
      return;
    }

    dispatch(updateTagNames([tagNameObj.tagName], [value]));
    dispatch(updateTagNameEditors({
      [key]: {
        ...initialTagNameEditorState,
        value: value,
        focusCount: state.focusCount,
      },
    }));
    if (input.current) input.current.blur();
  };

  const onCancelBtnPress = () => {
    didCancelBtnJustPress.current = true;
  };

  const onCancelBtnClick = () => {
    const value = tagNameObj ? tagNameObj.displayName : '';
    dispatch(updateTagNameEditors({
      [key]: { mode: MODE_VIEW, value, msg: '' },
    }));
    if (input.current) input.current.blur();
  };

  const onMoveUpBtnClick = () => {
    dispatch(moveTagName(tagNameObj.tagName, SWAP_LEFT));
  };

  const onMoveDownBtnClick = () => {
    dispatch(moveTagName(tagNameObj.tagName, SWAP_RIGHT));
  };

  const onMenuBtnClick = () => {
    if (!menuBtn.current) return;
    menuBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = getRect(x, y, width, height);
      dispatch(updateSelectingTagName(tagNameObj.tagName));
      dispatch(updatePopup(SETTINGS_TAGS_MENU_POPUP, true, rect));
    });
  };

  useEffect(() => {
    // displayName is already derived from tagNameMap in Selector,
    //   still need to update to Editor so when deleting, there's value to be shown.
    if (tagNameObj && tagNameObj.displayName !== prevDisplayName.current) {
      dispatch(updateTagNameEditors({
        [key]: { value: state.value },
      }));
      prevDisplayName.current = tagNameObj.displayName;
    }
  }, [state.value, tagNameObj, key, dispatch]);

  useEffect(() => {
    // state.focusCount can be undefined when the popup is close, so can't use !==
    if (state.focusCount > prevFocusCount.current) {
      if (input.current) input.current.focus();
    }
    prevFocusCount.current = state.focusCount;
  }, [state.focusCount]);

  useEffect(() => {
    if (state.blurCount > prevBlurCount.current && Platform.OS === 'ios') {
      if (input.current) input.current.blur();
    }
    prevBlurCount.current = state.blurCount;
  }, [state.blurCount]);

  useEffect(() => {
    if (state.isCheckingCanDelete) {
      dispatch(checkDeleteTagName(key, tagNameObj));
    }
  }, [state.isCheckingCanDelete, key, tagNameObj, dispatch]);

  const isBusy = state.isCheckingCanDelete;

  let loadingView;
  if (isBusy) {
    loadingView = (
      <View style={tailwind('h-10 w-8 flex-shrink-0 flex-grow-0 flex-row items-center justify-start')}>
        <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
      </View>
    );
  } else {
    loadingView = (
      <View style={tailwind('h-10 w-8 flex-shrink-0 flex-grow-0')} />
    );
  }

  return (
    <React.Fragment>
      <View style={tailwind('mt-1 flex-row items-center justify-start')}>
        {(state.mode === MODE_VIEW && tagNameObj === null) && <TouchableOpacity onPress={onAddBtnClick} style={tailwind('h-10 w-8 flex-shrink-0 flex-grow-0 flex-row items-center justify-start')}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={14} height={14} viewBox="0 0 14 14" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M7 0C7.5523 0 8 0.44772 8 1V6H13C13.5523 6 14 6.44772 14 7C14 7.5523 13.5523 8 13 8H8V13C8 13.5523 7.5523 14 7 14C6.44772 14 6 13.5523 6 13V8H1C0.44772 8 0 7.5523 0 7C0 6.44771 0.44772 6 1 6H6V1C6 0.44772 6.44772 0 7 0Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && tagNameObj !== null) && loadingView}
        {state.mode === MODE_EDIT && <TouchableOpacity onPressIn={onCancelBtnPress} onPress={onCancelBtnClick} style={tailwind('h-10 w-8 flex-shrink-0 flex-grow-0 flex-row items-center justify-start')}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={12} height={12} viewBox="0 0 12 12" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L6 4.58579L10.2929 0.29289C10.6834 -0.09763 11.3166 -0.09763 11.7071 0.29289C12.0976 0.68342 12.0976 1.31658 11.7071 1.70711L7.4142 6L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L6 7.4142L1.70711 11.7071C1.31658 12.0976 0.68342 12.0976 0.29289 11.7071C-0.09763 11.3166 -0.09763 10.6834 0.29289 10.2929L4.58579 6L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289Z" />
          </Svg>
        </TouchableOpacity>}
        <View style={tailwind('flex-shrink flex-grow')}>
          <TextInput ref={input} onFocus={onInputFocus} onBlur={onInputBlur} onChange={onInputChange} onSubmitEditing={onInputKeyPress} style={tailwind('w-full border-0 bg-transparent px-0 py-1 text-base font-normal leading-5 text-gray-600 blk:text-gray-300')} placeholder="Create a new tag" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={state.value} editable={!isBusy} />
          <Text style={[tailwind('absolute left-0 right-0 text-sm font-medium leading-5 text-red-600 blk:text-red-500'), { bottom: Platform.OS === 'ios' ? -12 : -8 }]} numberOfLines={1} ellipsizeMode="tail">{state.msg}</Text>
        </View>
        {state.mode === MODE_EDIT && <TouchableOpacity onPressIn={onOkBtnPress} onPress={onOkBtnClick} style={tailwind('h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center')}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={12} viewBox="0 0 14 10" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M13.7071 0.29289C14.0976 0.68342 14.0976 1.31658 13.7071 1.70711L5.70711 9.7071C5.31658 10.0976 4.68342 10.0976 4.29289 9.7071L0.29289 5.7071C-0.09763 5.3166 -0.09763 4.68342 0.29289 4.29289C0.68342 3.90237 1.31658 3.90237 1.70711 4.29289L5 7.5858L12.2929 0.29289C12.6834 -0.09763 13.3166 -0.09763 13.7071 0.29289Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && tagNameObj !== null) && <TouchableOpacity onPress={onEditBtnClick} style={tailwind('hidden h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center sm:flex')} disabled={isBusy}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={16} viewBox="0 0 14 14" fill="currentColor">
            <Path d="M10.5859 0.585788C11.3669 -0.195262 12.6333 -0.195262 13.4143 0.585788C14.1954 1.36683 14.1954 2.63316 13.4143 3.41421L12.6214 4.20711L9.79297 1.37868L10.5859 0.585788Z" />
            <Path d="M8.3787 2.79289L0 11.1716V14H2.82842L11.2071 5.62132L8.3787 2.79289Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && tagNameObj !== null) && <TouchableOpacity onPress={onMoveUpBtnClick} style={tailwind('hidden h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center lg:flex')} disabled={isBusy}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={18} viewBox="0 0 14 16" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 4.70711C2.90237 4.31658 2.90237 3.68342 3.29289 3.29289L6.29289 0.29289C6.48043 0.10536 6.73478 0 7 0C7.2652 0 7.5196 0.10536 7.7071 0.29289L10.7071 3.29289C11.0976 3.68342 11.0976 4.31658 10.7071 4.70711C10.3166 5.09763 9.6834 5.09763 9.2929 4.70711L8 3.41421V11C8 11.5523 7.5523 12 7 12C6.44771 12 6 11.5523 6 11V3.41421L4.70711 4.70711C4.31658 5.09763 3.68342 5.09763 3.29289 4.70711Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && tagNameObj !== null) && <TouchableOpacity onPress={onMoveDownBtnClick} style={tailwind('hidden h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center lg:flex')} disabled={isBusy}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={18} viewBox="0 0 14 16" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 7.29289C3.68342 6.90237 4.31658 6.90237 4.70711 7.29289L6 8.5858V1C6 0.44772 6.44771 0 7 0C7.5523 0 8 0.44771 8 1V8.5858L9.2929 7.29289C9.6834 6.90237 10.3166 6.90237 10.7071 7.29289C11.0976 7.68342 11.0976 8.3166 10.7071 8.7071L7.7071 11.7071C7.5196 11.8946 7.2652 12 7 12C6.73478 12 6.48043 11.8946 6.29289 11.7071L3.29289 8.7071C2.90237 8.3166 2.90237 7.68342 3.29289 7.29289Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && tagNameObj !== null) && <TouchableOpacity ref={menuBtn} onPress={onMenuBtnClick} style={tailwind('h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center')} disabled={isBusy}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={18} height={18} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
          </Svg>
        </TouchableOpacity>}
      </View>
    </React.Fragment>
  );
};

const TagNameEditor = React.memo(_TagNameEditor);

export default React.memo(SettingsPopupTags);
