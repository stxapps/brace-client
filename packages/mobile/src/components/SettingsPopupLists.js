import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Keyboard, Platform, LayoutAnimation,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';
import KeyboardManager from 'react-native-keyboard-manager';

import { canDeleteListNames } from '../apis/blockstack';
import {
  addListNames, updateListNames, moveListName, updateDeletingListName,
  updateListNameEditors, updatePopup,
} from '../actions';
import {
  MY_LIST, TRASH, ARCHIVE, VALID_LIST_NAME, IN_USE_LIST_NAME,
  NO_LIST_NAME, TOO_LONG_LIST_NAME, DUPLICATE_LIST_NAME,
  CONFIRM_DELETE_POPUP, SWAP_LEFT, SWAP_RIGHT,
  MODE_VIEW, MODE_EDIT,
} from '../types/const';
import { getListNameMap, makeGetListNameEditor } from '../selectors';
import { validateListNameDisplayName } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { spListsAnimConfig } from '../types/animConfigs';
import { initialListNameEditorState } from '../types/initialStates';

const SettingsPopupLists = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listNameMap = useSelector(getListNameMap);

  const validateDisplayName = (displayName) => {
    return validateListNameDisplayName(displayName, listNameMap);
  };

  useEffect(() => {
    if (Platform.OS === 'ios') KeyboardManager.setEnable(true);

    return () => {
      if (Platform.OS === 'ios') KeyboardManager.setEnable(false);
      if (Platform.OS === 'android') Keyboard.dismiss();
    };
  }, []);

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
      <View style={tailwind('border-b border-gray-200 md:hidden', safeAreaWidth)}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} <Text style={tailwind('text-sm text-gray-500 font-normal')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-5')}>Lists</Text>
      </View>
      <View style={tailwind('hidden md:flex', safeAreaWidth)}>
        <Text style={tailwind('text-base text-gray-800 font-medium leading-4')}>Lists</Text>
      </View>
      <View style={tailwind('pt-2.5')}>
        <ListNameEditor key="SPL_newListNameEditor" listNameObj={null} validateDisplayName={validateDisplayName} />
        {listNameMap.map(listNameObj => <ListNameEditor key={listNameObj.listName} listNameObj={listNameObj} validateDisplayName={validateDisplayName} />)}
      </View>
    </View>
  );
};

const LIST_NAME_MSGS = {
  [VALID_LIST_NAME]: '',
  [NO_LIST_NAME]: 'List is blank',
  [TOO_LONG_LIST_NAME]: 'List is too long',
  [DUPLICATE_LIST_NAME]: 'List already exists',
  [IN_USE_LIST_NAME]: 'List is in use',
};

const _ListNameEditor = (props) => {

  const { listNameObj, validateDisplayName } = props;
  const key = listNameObj ? listNameObj.listName : 'newListNameEditor';
  const getListNameEditor = useMemo(makeGetListNameEditor, []);
  const state = useSelector(s => getListNameEditor(s, key));

  const input = useRef(null);
  const didOkBtnJustPress = useRef(false);
  const didCancelBtnJustPress = useRef(false);
  const dispatch = useDispatch();

  const onAddBtnClick = () => {
    dispatch(updateListNameEditors({
      [key]: { mode: MODE_EDIT, value: '', msg: '' },
    }));
    input.current.focus();
  };

  const onEditBtnClick = () => {
    dispatch(updateListNameEditors({
      [key]: { mode: MODE_EDIT, value: listNameObj.displayName, msg: '' },
    }));
    input.current.focus();
  };

  const onInputFocus = () => {
    dispatch(updateListNameEditors({
      [key]: { mode: MODE_EDIT },
    }));
  };

  const onInputChange = (e) => {
    // Event is reused and will be nullified after the event handler has been called.
    // https://reactjs.org/docs/legacy-event-pooling.html
    const text = e.nativeEvent.text;
    dispatch(updateListNameEditors({
      [key]: { value: text, msg: '' },
    }));
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

    if (listNameObj) {
      if (listNameObj.displayName === state.value) {
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
    if (listNameObj) return onEditOkBtnClick();
    return onAddOkBtnClick();
  };

  const onAddOkBtnClick = () => {
    const listNameValidatedResult = validateDisplayName(state.value);
    if (listNameValidatedResult !== VALID_LIST_NAME) {
      dispatch(updateListNameEditors({
        [key]: { mode: MODE_EDIT, msg: LIST_NAME_MSGS[listNameValidatedResult] },
      }));
      input.current.focus();
      return;
    }

    dispatch(addListNames([state.value]));
    dispatch(updateListNameEditors({ [key]: { ...initialListNameEditorState } }));
    input.current.blur();
  };

  const onEditOkBtnClick = () => {
    if (state.value === listNameObj.displayName) return onCancelBtnClick();

    const listNameValidatedResult = validateDisplayName(state.value);
    if (listNameValidatedResult !== VALID_LIST_NAME) {
      dispatch(updateListNameEditors({
        [key]: { mode: MODE_EDIT, msg: LIST_NAME_MSGS[listNameValidatedResult] },
      }));
      input.current.focus();
      return;
    }

    dispatch(updateListNames([listNameObj.listName], [state.value]));
    dispatch(updateListNameEditors({
      [key]: { ...initialListNameEditorState, value: state.value },
    }));
    input.current.blur();
  };

  const onCancelBtnPress = () => {
    didCancelBtnJustPress.current = true;
  };

  const onCancelBtnClick = () => {
    const value = listNameObj ? listNameObj.displayName : '';
    dispatch(updateListNameEditors({
      [key]: { mode: MODE_VIEW, value, msg: '' },
    }));
    input.current.blur();
  };

  const onDeleteBtnClick = () => {
    dispatch(updateListNameEditors({
      [key]: { isCheckingCanDelete: true },
    }));
  };

  const onMoveUpBtnClick = () => {
    if (Platform.OS === 'ios') {
      const animConfig = spListsAnimConfig();
      LayoutAnimation.configureNext(animConfig);
    }
    dispatch(moveListName(listNameObj.listName, SWAP_LEFT));
  };

  const onMoveDownBtnClick = () => {
    if (Platform.OS === 'ios') {
      const animConfig = spListsAnimConfig();
      LayoutAnimation.configureNext(animConfig);
    }
    dispatch(moveListName(listNameObj.listName, SWAP_RIGHT));
  };

  useEffect(() => {
    if (listNameObj) {
      dispatch(updateListNameEditors({
        [key]: { value: listNameObj.displayName },
      }));
    }
  }, [listNameObj, key, dispatch]);

  useEffect(() => {
    const deleteListName = async () => {
      if (state.isCheckingCanDelete) {
        const canDeletes = await canDeleteListNames([listNameObj.listName]);
        const canDelete = canDeletes[0];
        if (!canDelete) {
          dispatch(updateListNameEditors({
            [key]: { msg: LIST_NAME_MSGS[IN_USE_LIST_NAME], isCheckingCanDelete: false },
          }));
          return;
        }

        dispatch(updateDeletingListName(listNameObj.listName));
        dispatch(updatePopup(CONFIRM_DELETE_POPUP, true));
        dispatch(updateListNameEditors({
          [key]: { msg: '', isCheckingCanDelete: false },
        }));
      }
    };
    deleteListName();
  }, [state.isCheckingCanDelete, listNameObj, key, dispatch]);

  const isBusy = state.isCheckingCanDelete;

  let deleteBtn;
  if (isBusy) {
    deleteBtn = (
      <View style={tailwind('flex-grow-0 flex-shrink-0 flex-row justify-start items-center w-8 h-10')}>
        <Circle size={20} color="rgba(107, 114, 128, 1)" />
      </View>
    );
  } else {
    if (listNameObj && [MY_LIST, TRASH, ARCHIVE].includes(listNameObj.listName)) {
      deleteBtn = (
        <View style={tailwind('flex-grow-0 flex-shrink-0 w-8 h-10')} />
      );
    } else {
      deleteBtn = (
        <TouchableOpacity onPress={onDeleteBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 flex-row justify-start items-center w-8 h-10')}>
          <Svg style={tailwind('text-gray-500 font-normal')} width={14} height={16} viewBox="0 0 14 16" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M6 0C5.62123 0 5.27497 0.214 5.10557 0.55279L4.38197 2H1C0.44772 2 0 2.44772 0 3C0 3.55228 0.44772 4 1 4V14C1 15.1046 1.89543 16 3 16H11C12.1046 16 13 15.1046 13 14V4C13.5523 4 14 3.55228 14 3C14 2.44772 13.5523 2 13 2H9.618L8.8944 0.55279C8.725 0.214 8.3788 0 8 0H6ZM4 6C4 5.44772 4.44772 5 5 5C5.55228 5 6 5.44772 6 6V12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12V6ZM9 5C8.4477 5 8 5.44772 8 6V12C8 12.5523 8.4477 13 9 13C9.5523 13 10 12.5523 10 12V6C10 5.44772 9.5523 5 9 5Z" />
          </Svg>
        </TouchableOpacity>
      );
    }
  }

  return (
    <View style={tailwind('mt-1 flex-row justify-start items-center')}>
      {(state.mode === MODE_VIEW && listNameObj === null) && <TouchableOpacity onPress={onAddBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 flex-row justify-start items-center w-8 h-10')}>
        <Svg style={tailwind('text-gray-500 font-normal')} width={14} height={14} viewBox="0 0 14 14" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M7 0C7.5523 0 8 0.44772 8 1V6H13C13.5523 6 14 6.44772 14 7C14 7.5523 13.5523 8 13 8H8V13C8 13.5523 7.5523 14 7 14C6.44772 14 6 13.5523 6 13V8H1C0.44772 8 0 7.5523 0 7C0 6.44771 0.44772 6 1 6H6V1C6 0.44772 6.44772 0 7 0Z" />
        </Svg>
      </TouchableOpacity>}
      {(state.mode === MODE_VIEW && listNameObj !== null) && deleteBtn}
      {state.mode === MODE_EDIT && <TouchableOpacity onPressIn={onCancelBtnPress} onPress={onCancelBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 flex-row justify-start items-center w-8 h-10')}>
        <Svg style={tailwind('text-gray-500 font-normal')} width={12} height={12} viewBox="0 0 12 12" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L6 4.58579L10.2929 0.29289C10.6834 -0.09763 11.3166 -0.09763 11.7071 0.29289C12.0976 0.68342 12.0976 1.31658 11.7071 1.70711L7.4142 6L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L6 7.4142L1.70711 11.7071C1.31658 12.0976 0.68342 12.0976 0.29289 11.7071C-0.09763 11.3166 -0.09763 10.6834 0.29289 10.2929L4.58579 6L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289Z" />
        </Svg>
      </TouchableOpacity>}
      <View style={tailwind('flex-grow flex-shrink')}>
        <TextInput ref={input} onFocus={onInputFocus} onBlur={onInputBlur} onChange={onInputChange} onSubmitEditing={onInputKeyPress} style={tailwind('px-0 py-1 w-full bg-white text-base leading-5 text-gray-600 font-normal border-0')} placeholder="Create new list" value={state.value} editable={!isBusy} />
        <Text style={[tailwind('absolute left-0 right-0 text-sm text-red-600 font-medium leading-5'), { bottom: Platform.OS === 'ios' ? -12 : -8 }]} numberOfLines={1} ellipsizeMode="tail">{state.msg}</Text>
      </View>
      {state.mode === MODE_EDIT && <TouchableOpacity onPressIn={onOkBtnPress} onPress={onOkBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 justify-center items-center w-10 h-10')}>
        <Svg style={tailwind('text-gray-500 font-normal')} width={16} height={12} viewBox="0 0 14 10" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M13.7071 0.29289C14.0976 0.68342 14.0976 1.31658 13.7071 1.70711L5.70711 9.7071C5.31658 10.0976 4.68342 10.0976 4.29289 9.7071L0.29289 5.7071C-0.09763 5.3166 -0.09763 4.68342 0.29289 4.29289C0.68342 3.90237 1.31658 3.90237 1.70711 4.29289L5 7.5858L12.2929 0.29289C12.6834 -0.09763 13.3166 -0.09763 13.7071 0.29289Z" />
        </Svg>
      </TouchableOpacity>}
      {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity onPress={onEditBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 justify-center items-center w-10 h-10')} disabled={isBusy}>
        <Svg style={tailwind('text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 14 14" fill="currentColor">
          <Path d="M10.5859 0.585788C11.3669 -0.195262 12.6333 -0.195262 13.4143 0.585788C14.1954 1.36683 14.1954 2.63316 13.4143 3.41421L12.6214 4.20711L9.79297 1.37868L10.5859 0.585788Z" />
          <Path d="M8.3787 2.79289L0 11.1716V14H2.82842L11.2071 5.62132L8.3787 2.79289Z" />
        </Svg>
      </TouchableOpacity>}
      {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity onPress={onMoveUpBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 justify-center items-center w-10 h-10')} disabled={isBusy}>
        <Svg style={tailwind('text-gray-500 font-normal')} width={14} height={16} viewBox="0 0 14 16" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 4.70711C2.90237 4.31658 2.90237 3.68342 3.29289 3.29289L6.29289 0.29289C6.48043 0.10536 6.73478 0 7 0C7.2652 0 7.5196 0.10536 7.7071 0.29289L10.7071 3.29289C11.0976 3.68342 11.0976 4.31658 10.7071 4.70711C10.3166 5.09763 9.6834 5.09763 9.2929 4.70711L8 3.41421V11C8 11.5523 7.5523 12 7 12C6.44771 12 6 11.5523 6 11V3.41421L4.70711 4.70711C4.31658 5.09763 3.68342 5.09763 3.29289 4.70711Z" />
        </Svg>
      </TouchableOpacity>}
      {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity onPress={onMoveDownBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 justify-center items-center w-10 h-10')} disabled={isBusy}>
        <Svg style={tailwind('text-gray-500 font-normal')} width={14} height={16} viewBox="0 0 14 16" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 7.29289C3.68342 6.90237 4.31658 6.90237 4.70711 7.29289L6 8.5858V1C6 0.44772 6.44771 0 7 0C7.5523 0 8 0.44771 8 1V8.5858L9.2929 7.29289C9.6834 6.90237 10.3166 6.90237 10.7071 7.29289C11.0976 7.68342 11.0976 8.3166 10.7071 8.7071L7.7071 11.7071C7.5196 11.8946 7.2652 12 7 12C6.73478 12 6.48043 11.8946 6.29289 11.7071L3.29289 8.7071C2.90237 8.3166 2.90237 7.68342 3.29289 7.29289Z" />
        </Svg>
      </TouchableOpacity>}
    </View>
  );
};

const ListNameEditor = React.memo(_ListNameEditor);

export default React.memo(SettingsPopupLists);
