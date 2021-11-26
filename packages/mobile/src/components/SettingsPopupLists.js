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
  addListNames, updateListNames, moveListName, updateSelectingListName,
  updateDeletingListName, updateListNameEditors, updatePopup,
} from '../actions';
import {
  VALID_LIST_NAME, IN_USE_LIST_NAME,
  NO_LIST_NAME, TOO_LONG_LIST_NAME, DUPLICATE_LIST_NAME,
  SETTINGS_LISTS_MENU_POPUP, CONFIRM_DELETE_POPUP,
  SWAP_LEFT, SWAP_RIGHT, MODE_VIEW, MODE_EDIT,
} from '../types/const';
import { getListNameMap, makeGetListNameEditor } from '../selectors';
import { validateListNameDisplayName, getAllListNames } from '../utils';
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
        <ListNameEditor key="SPL_newListNameEditor" listNameObj={null} validateDisplayName={validateDisplayName} level={0} />
        {listNameMap.map(listNameObj => <ListNameEditor key={listNameObj.listName} listNameObj={listNameObj} validateDisplayName={validateDisplayName} level={0} />)}
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

  const { listNameObj, validateDisplayName, level } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const key = listNameObj ? listNameObj.listName : 'newListNameEditor';
  const getListNameEditor = useMemo(makeGetListNameEditor, []);
  const state = useSelector(s => getListNameEditor(s, key));
  const prevFocusCount = useRef(0);
  const input = useRef(null);
  const menuBtn = useRef(null);
  const didOkBtnJustPress = useRef(false);
  const didCancelBtnJustPress = useRef(false);
  const dispatch = useDispatch();

  const onAddBtnClick = () => {
    dispatch(updateListNameEditors({
      [key]: { mode: MODE_EDIT, value: '', msg: '', focusCount: state.focusCount + 1 },
    }));
  };

  const onEditBtnClick = () => {
    dispatch(updateListNameEditors({
      [key]: {
        mode: MODE_EDIT,
        value: listNameObj.displayName,
        msg: '',
        focusCount: state.focusCount + 1,
      },
    }));
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
        [key]: {
          mode: MODE_EDIT,
          msg: LIST_NAME_MSGS[listNameValidatedResult],
          focusCount: state.focusCount + 1,
        },
      }));
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
        [key]: {
          mode: MODE_EDIT,
          msg: LIST_NAME_MSGS[listNameValidatedResult],
          focusCount: state.focusCount + 1,
        },
      }));
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

  const onMenuBtnClick = () => {
    menuBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = {
        x, y, width, height, top: y, right: x + width, bottom: y + height, left: x,
      };
      dispatch(updateSelectingListName(listNameObj.listName));
      dispatch(updatePopup(SETTINGS_LISTS_MENU_POPUP, true, rect));
    });
  };

  const onExpandBtnClick = () => {
    dispatch(updateListNameEditors({
      [key]: { doExpand: !state.doExpand },
    }));
  };

  useEffect(() => {
    if (listNameObj) {
      dispatch(updateListNameEditors({
        [key]: { value: listNameObj.displayName },
      }));
    }
  }, [listNameObj, key, dispatch]);

  useEffect(() => {
    // state.focusCount can be undefined when the popup is close, so can't use !==
    if (state.focusCount > prevFocusCount.current) {
      input.current.focus();
      prevFocusCount.current = state.focusCount;
    }
  }, [state.focusCount]);

  useEffect(() => {
    const deleteListName = async () => {
      if (state.isCheckingCanDelete) {
        const listNames = [listNameObj.listName];
        listNames.push(...getAllListNames(listNameObj.children));

        const canDeletes = await canDeleteListNames(listNames);
        if (!canDeletes.every(canDelete => canDelete === true)) {
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

  let expandBtn;
  if (isBusy) {
    expandBtn = (
      <View style={tailwind('flex-grow-0 flex-shrink-0 flex-row justify-start items-center w-8 h-10')}>
        <Circle size={20} color="rgba(107, 114, 128, 1)" />
      </View>
    );
  } else {
    if (listNameObj && listNameObj.children && listNameObj.children.length > 0) {
      const expandSvg = state.doExpand ? (
        <Svg style={tailwind('text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M5.29303 7.29302C5.48056 7.10555 5.73487 7.00023 6.00003 7.00023C6.26519 7.00023 6.5195 7.10555 6.70703 7.29302L10 10.586L13.293 7.29302C13.3853 7.19751 13.4956 7.12133 13.6176 7.06892C13.7396 7.01651 13.8709 6.98892 14.0036 6.98777C14.1364 6.98662 14.2681 7.01192 14.391 7.0622C14.5139 7.11248 14.6255 7.18673 14.7194 7.28062C14.8133 7.37452 14.8876 7.48617 14.9379 7.60907C14.9881 7.73196 15.0134 7.86364 15.0123 7.99642C15.0111 8.1292 14.9835 8.26042 14.9311 8.38242C14.8787 8.50443 14.8025 8.61477 14.707 8.70702L10.707 12.707C10.5195 12.8945 10.2652 12.9998 10 12.9998C9.73487 12.9998 9.48056 12.8945 9.29303 12.707L5.29303 8.70702C5.10556 8.51949 5.00024 8.26518 5.00024 8.00002C5.00024 7.73486 5.10556 7.48055 5.29303 7.29302Z" />
        </Svg>
      ) : (
        <Svg style={tailwind('text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M7.29303 14.707C7.10556 14.5195 7.00024 14.2651 7.00024 14C7.00024 13.7348 7.10556 13.4805 7.29303 13.293L10.586 9.99998L7.29303 6.70698C7.11087 6.51838 7.01008 6.26578 7.01236 6.00358C7.01463 5.74138 7.1198 5.49057 7.30521 5.30516C7.49062 5.11975 7.74143 5.01458 8.00363 5.01231C8.26583 5.01003 8.51843 5.11082 8.70703 5.29298L12.707 9.29298C12.8945 9.48051 12.9998 9.73482 12.9998 9.99998C12.9998 10.2651 12.8945 10.5195 12.707 10.707L8.70703 14.707C8.5195 14.8945 8.26519 14.9998 8.00003 14.9998C7.73487 14.9998 7.48056 14.8945 7.29303 14.707Z" />
        </Svg>
      );
      expandBtn = (
        <TouchableOpacity onPress={onExpandBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 flex-row justify-start items-center w-8 h-10')}>{expandSvg}</TouchableOpacity>
      );
    } else {
      expandBtn = (
        <View style={tailwind('flex-grow-0 flex-shrink-0 w-8 h-10')} />
      );
    }
  }

  return (
    <React.Fragment>
      <View style={[tailwind('mt-1 flex-row justify-start items-center'), { paddingLeft: 12 * level }]}>
        {(state.mode === MODE_VIEW && listNameObj === null) && <TouchableOpacity onPress={onAddBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 flex-row justify-start items-center w-8 h-10')}>
          <Svg style={tailwind('text-gray-500 font-normal')} width={14} height={14} viewBox="0 0 14 14" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M7 0C7.5523 0 8 0.44772 8 1V6H13C13.5523 6 14 6.44772 14 7C14 7.5523 13.5523 8 13 8H8V13C8 13.5523 7.5523 14 7 14C6.44772 14 6 13.5523 6 13V8H1C0.44772 8 0 7.5523 0 7C0 6.44771 0.44772 6 1 6H6V1C6 0.44772 6.44772 0 7 0Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && listNameObj !== null) && expandBtn}
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
        {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity onPress={onEditBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 justify-center items-center w-10 h-10 hidden sm:flex', safeAreaWidth)} disabled={isBusy}>
          <Svg style={tailwind('text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 14 14" fill="currentColor">
            <Path d="M10.5859 0.585788C11.3669 -0.195262 12.6333 -0.195262 13.4143 0.585788C14.1954 1.36683 14.1954 2.63316 13.4143 3.41421L12.6214 4.20711L9.79297 1.37868L10.5859 0.585788Z" />
            <Path d="M8.3787 2.79289L0 11.1716V14H2.82842L11.2071 5.62132L8.3787 2.79289Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity onPress={onMoveUpBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 justify-center items-center w-10 h-10 hidden lg:flex', safeAreaWidth)} disabled={isBusy}>
          <Svg style={tailwind('text-gray-500 font-normal')} width={16} height={18} viewBox="0 0 14 16" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 4.70711C2.90237 4.31658 2.90237 3.68342 3.29289 3.29289L6.29289 0.29289C6.48043 0.10536 6.73478 0 7 0C7.2652 0 7.5196 0.10536 7.7071 0.29289L10.7071 3.29289C11.0976 3.68342 11.0976 4.31658 10.7071 4.70711C10.3166 5.09763 9.6834 5.09763 9.2929 4.70711L8 3.41421V11C8 11.5523 7.5523 12 7 12C6.44771 12 6 11.5523 6 11V3.41421L4.70711 4.70711C4.31658 5.09763 3.68342 5.09763 3.29289 4.70711Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity onPress={onMoveDownBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 justify-center items-center w-10 h-10 hidden lg:flex', safeAreaWidth)} disabled={isBusy}>
          <Svg style={tailwind('text-gray-500 font-normal')} width={16} height={18} viewBox="0 0 14 16" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 7.29289C3.68342 6.90237 4.31658 6.90237 4.70711 7.29289L6 8.5858V1C6 0.44772 6.44771 0 7 0C7.5523 0 8 0.44771 8 1V8.5858L9.2929 7.29289C9.6834 6.90237 10.3166 6.90237 10.7071 7.29289C11.0976 7.68342 11.0976 8.3166 10.7071 8.7071L7.7071 11.7071C7.5196 11.8946 7.2652 12 7 12C6.73478 12 6.48043 11.8946 6.29289 11.7071L3.29289 8.7071C2.90237 8.3166 2.90237 7.68342 3.29289 7.29289Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity ref={menuBtn} onPress={onMenuBtnClick} style={tailwind('flex-grow-0 flex-shrink-0 justify-center items-center w-10 h-10')} disabled={isBusy}>
          <Svg style={tailwind('text-gray-500 font-normal')} width={18} height={18} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
          </Svg>
        </TouchableOpacity>}
      </View>
      {state.doExpand && listNameObj.children.map(child => <ListNameEditor key={child.listName} listNameObj={child} validateDisplayName={validateDisplayName} level={level + 1} />)}
    </React.Fragment>
  );
};

const ListNameEditor = React.memo(_ListNameEditor);

export default React.memo(SettingsPopupLists);
