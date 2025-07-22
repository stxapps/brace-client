import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Keyboard, Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  addListNames, updateListNames, moveListName, checkDeleteListName,
  updateSelectingListName, updateListNameEditors,
} from '../actions/chunk';
import {
  VALID_LIST_NAME, LIST_NAME_MSGS, SETTINGS_LISTS_MENU_POPUP, SWAP_LEFT, SWAP_RIGHT,
  MODE_VIEW, MODE_EDIT, SM_WIDTH, BLK_MODE,
} from '../types/const';
import { makeGetListNameEditor, getThemeMode } from '../selectors';
import { validateListNameDisplayName, getRect } from '../utils';
import { initialListNameEditorState } from '../types/initialStates';

import { useSafeAreaFrame, useTailwind } from '.';

const SettingsPopupLists = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const tailwind = useTailwind();

  const validateDisplayName = (listName, displayName) => {
    return validateListNameDisplayName(listName, displayName, listNameMap);
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
        <Text style={tailwind('pb-2 text-xl font-medium leading-5 text-gray-800 blk:text-gray-100')}>Lists</Text>
      </View>
      <View style={tailwind('hidden md:flex')}>
        <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Lists</Text>
      </View>
      <View style={tailwind('pt-2.5')}>
        <ListNameEditor key="SPL_newListNameEditor" listNameObj={null} validateDisplayName={validateDisplayName} level={0} />
        {listNameMap.map(listNameObj => <ListNameEditor key={listNameObj.listName} listNameObj={listNameObj} validateDisplayName={validateDisplayName} level={0} />)}
      </View>
    </View>
  );
};

const InnerListNameEditor = (props) => {

  const { listNameObj, validateDisplayName, level } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const key = listNameObj ? listNameObj.listName : 'newListNameEditor';
  const getListNameEditor = useMemo(makeGetListNameEditor, []);
  const state = useSelector(s => getListNameEditor(s, key));
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
    dispatch(updateListNameEditors({ [key]: { value: text, msg: '' } }));
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
    const value = state.value.trimEnd();
    const listNameValidatedResult = validateDisplayName(null, value);
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

    dispatch(addListNames([value]));
    dispatch(updateListNameEditors({
      [key]: { ...initialListNameEditorState, focusCount: state.focusCount },
    }));
    if (input.current) input.current.blur();
  };

  const onEditOkBtnClick = () => {
    const value = state.value.trimEnd();
    if (value === listNameObj.displayName) return onCancelBtnClick();

    const listNameValidatedResult = validateDisplayName(listNameObj.listName, value);
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

    dispatch(updateListNames([listNameObj.listName], [value]));
    dispatch(updateListNameEditors({
      [key]: {
        ...initialListNameEditorState,
        value: value,
        doExpand: state.doExpand,
        focusCount: state.focusCount,
      },
    }));
    if (input.current) input.current.blur();
  };

  const onCancelBtnPress = () => {
    didCancelBtnJustPress.current = true;
  };

  const onCancelBtnClick = () => {
    const value = listNameObj ? listNameObj.displayName : '';
    dispatch(updateListNameEditors({
      [key]: { mode: MODE_VIEW, value, msg: '' },
    }));
    if (input.current) input.current.blur();
  };

  const onMoveUpBtnClick = () => {
    dispatch(moveListName(listNameObj.listName, SWAP_LEFT));
  };

  const onMoveDownBtnClick = () => {
    dispatch(moveListName(listNameObj.listName, SWAP_RIGHT));
  };

  const onMenuBtnClick = () => {
    if (!menuBtn.current) return;
    menuBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = getRect(x, y, width, height);
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
    // displayName is already derived from listNameMap in Selector,
    //   still need to update to Editor so when deleting, there's value to be shown.
    if (listNameObj && listNameObj.displayName !== prevDisplayName.current) {
      dispatch(updateListNameEditors({
        [key]: { value: state.value },
      }));
      prevDisplayName.current = listNameObj.displayName;
    }
  }, [state.value, listNameObj, key, dispatch]);

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
      dispatch(checkDeleteListName(key, listNameObj));
    }
  }, [state.isCheckingCanDelete, key, listNameObj, dispatch]);

  const isBusy = state.isCheckingCanDelete;

  let expandBtn;
  if (isBusy) {
    expandBtn = (
      <View style={tailwind('h-10 w-8 flex-shrink-0 flex-grow-0 flex-row items-center justify-start')}>
        <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
      </View>
    );
  } else {
    if (listNameObj && listNameObj.children && listNameObj.children.length > 0) {
      const expandSvg = state.doExpand ? (
        <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={14} height={9} viewBox="0 0 11 7" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M0.292787 1.29302C0.480314 1.10555 0.734622 1.00023 0.999786 1.00023C1.26495 1.00023 1.51926 1.10555 1.70679 1.29302L4.99979 4.58602L8.29279 1.29302C8.38503 1.19751 8.49538 1.12133 8.61738 1.06892C8.73939 1.01651 8.87061 0.988924 9.00339 0.98777C9.13616 0.986616 9.26784 1.01192 9.39074 1.0622C9.51364 1.11248 9.62529 1.18673 9.71918 1.28062C9.81307 1.37452 9.88733 1.48617 9.93761 1.60907C9.98789 1.73196 10.0132 1.86364 10.012 1.99642C10.0109 2.1292 9.9833 2.26042 9.93089 2.38242C9.87848 2.50443 9.8023 2.61477 9.70679 2.70702L5.70679 6.70702C5.51926 6.89449 5.26495 6.99981 4.99979 6.99981C4.73462 6.99981 4.48031 6.89449 4.29279 6.70702L0.292787 2.70702C0.105316 2.51949 0 2.26518 0 2.00002C0 1.73486 0.105316 1.48055 0.292787 1.29302V1.29302Z" />
        </Svg>
      ) : (
        <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={20} height={12} viewBox="0 0 6 10" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M0.292787 9.70698C0.105316 9.51945 0 9.26514 0 8.99998C0 8.73482 0.105316 8.48051 0.292787 8.29298L3.58579 4.99998L0.292787 1.70698C0.110629 1.51838 0.00983372 1.26578 0.0121121 1.00358C0.0143906 0.741382 0.11956 0.49057 0.304968 0.305162C0.490376 0.119753 0.741189 0.0145843 1.00339 0.0123059C1.26558 0.0100274 1.51818 0.110822 1.70679 0.29298L5.70679 4.29298C5.89426 4.48051 5.99957 4.73482 5.99957 4.99998C5.99957 5.26514 5.89426 5.51945 5.70679 5.70698L1.70679 9.70698C1.51926 9.89445 1.26495 9.99977 0.999786 9.99977C0.734622 9.99977 0.480314 9.89445 0.292787 9.70698Z" />
        </Svg>
      );
      expandBtn = (
        <TouchableOpacity onPress={onExpandBtnClick} style={tailwind('h-10 w-8 flex-shrink-0 flex-grow-0 flex-row items-center justify-start')}>
          <View style={tailwind('h-3.5 w-3.5 items-center justify-center pl-1')}>
            {expandSvg}
          </View>
        </TouchableOpacity>
      );
    } else {
      expandBtn = (
        <View style={tailwind('h-10 w-8 flex-shrink-0 flex-grow-0')} />
      );
    }
  }

  const tabWidth = safeAreaWidth < SM_WIDTH ? 16 : 32;
  const viewStyle = { paddingLeft: tabWidth * level };
  const inputClassNames = Platform.OS === 'ios' ? 'leading-5 py-1' : 'py-2';

  return (
    <React.Fragment>
      <View style={[tailwind('mt-1 flex-row items-center justify-start'), viewStyle]}>
        {(state.mode === MODE_VIEW && listNameObj === null) && <TouchableOpacity onPress={onAddBtnClick} style={tailwind('h-10 w-8 flex-shrink-0 flex-grow-0 flex-row items-center justify-start')}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={14} height={14} viewBox="0 0 14 14" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M7 0C7.5523 0 8 0.44772 8 1V6H13C13.5523 6 14 6.44772 14 7C14 7.5523 13.5523 8 13 8H8V13C8 13.5523 7.5523 14 7 14C6.44772 14 6 13.5523 6 13V8H1C0.44772 8 0 7.5523 0 7C0 6.44771 0.44772 6 1 6H6V1C6 0.44772 6.44772 0 7 0Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && listNameObj !== null) && expandBtn}
        {state.mode === MODE_EDIT && <TouchableOpacity onPressIn={onCancelBtnPress} onPress={onCancelBtnClick} style={tailwind('h-10 w-8 flex-shrink-0 flex-grow-0 flex-row items-center justify-start')}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={12} height={12} viewBox="0 0 12 12" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L6 4.58579L10.2929 0.29289C10.6834 -0.09763 11.3166 -0.09763 11.7071 0.29289C12.0976 0.68342 12.0976 1.31658 11.7071 1.70711L7.4142 6L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L6 7.4142L1.70711 11.7071C1.31658 12.0976 0.68342 12.0976 0.29289 11.7071C-0.09763 11.3166 -0.09763 10.6834 0.29289 10.2929L4.58579 6L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289Z" />
          </Svg>
        </TouchableOpacity>}
        <View style={tailwind('flex-shrink flex-grow')}>
          <TextInput ref={input} onFocus={onInputFocus} onBlur={onInputBlur} onChange={onInputChange} onSubmitEditing={onInputKeyPress} style={tailwind(`w-full border-0 bg-transparent px-0 text-base font-normal text-gray-600 blk:text-gray-300 ${inputClassNames}`)} placeholder="Create a new list" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={state.value} editable={!isBusy} />
          <Text style={[tailwind('absolute left-0 right-0 text-sm font-medium leading-5 text-red-600 blk:text-red-500'), { bottom: Platform.OS === 'ios' ? -12 : -8 }]} numberOfLines={1} ellipsizeMode="tail">{state.msg}</Text>
        </View>
        {state.mode === MODE_EDIT && <TouchableOpacity onPressIn={onOkBtnPress} onPress={onOkBtnClick} style={tailwind('h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center')}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={12} viewBox="0 0 14 10" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M13.7071 0.29289C14.0976 0.68342 14.0976 1.31658 13.7071 1.70711L5.70711 9.7071C5.31658 10.0976 4.68342 10.0976 4.29289 9.7071L0.29289 5.7071C-0.09763 5.3166 -0.09763 4.68342 0.29289 4.29289C0.68342 3.90237 1.31658 3.90237 1.70711 4.29289L5 7.5858L12.2929 0.29289C12.6834 -0.09763 13.3166 -0.09763 13.7071 0.29289Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity onPress={onEditBtnClick} style={tailwind('hidden h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center sm:flex')} disabled={isBusy}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={16} viewBox="0 0 14 14" fill="currentColor">
            <Path d="M10.5859 0.585788C11.3669 -0.195262 12.6333 -0.195262 13.4143 0.585788C14.1954 1.36683 14.1954 2.63316 13.4143 3.41421L12.6214 4.20711L9.79297 1.37868L10.5859 0.585788Z" />
            <Path d="M8.3787 2.79289L0 11.1716V14H2.82842L11.2071 5.62132L8.3787 2.79289Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity onPress={onMoveUpBtnClick} style={tailwind('hidden h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center lg:flex')} disabled={isBusy}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={18} viewBox="0 0 14 16" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 4.70711C2.90237 4.31658 2.90237 3.68342 3.29289 3.29289L6.29289 0.29289C6.48043 0.10536 6.73478 0 7 0C7.2652 0 7.5196 0.10536 7.7071 0.29289L10.7071 3.29289C11.0976 3.68342 11.0976 4.31658 10.7071 4.70711C10.3166 5.09763 9.6834 5.09763 9.2929 4.70711L8 3.41421V11C8 11.5523 7.5523 12 7 12C6.44771 12 6 11.5523 6 11V3.41421L4.70711 4.70711C4.31658 5.09763 3.68342 5.09763 3.29289 4.70711Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity onPress={onMoveDownBtnClick} style={tailwind('hidden h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center lg:flex')} disabled={isBusy}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={16} height={18} viewBox="0 0 14 16" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0 15C0 14.4477 0.44772 14 1 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H1C0.44772 16 0 15.5523 0 15ZM3.29289 7.29289C3.68342 6.90237 4.31658 6.90237 4.70711 7.29289L6 8.5858V1C6 0.44772 6.44771 0 7 0C7.5523 0 8 0.44771 8 1V8.5858L9.2929 7.29289C9.6834 6.90237 10.3166 6.90237 10.7071 7.29289C11.0976 7.68342 11.0976 8.3166 10.7071 8.7071L7.7071 11.7071C7.5196 11.8946 7.2652 12 7 12C6.73478 12 6.48043 11.8946 6.29289 11.7071L3.29289 8.7071C2.90237 8.3166 2.90237 7.68342 3.29289 7.29289Z" />
          </Svg>
        </TouchableOpacity>}
        {(state.mode === MODE_VIEW && listNameObj !== null) && <TouchableOpacity ref={menuBtn} onPress={onMenuBtnClick} style={tailwind('h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center')} disabled={isBusy}>
          <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={18} height={18} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
          </Svg>
        </TouchableOpacity>}
      </View>
      {(state.doExpand && listNameObj && listNameObj.children && listNameObj.children.length > 0) && listNameObj.children.map(child => <ListNameEditor key={child.listName} listNameObj={child} validateDisplayName={validateDisplayName} level={level + 1} />)}
    </React.Fragment>
  );
};

const ListNameEditor = React.memo(InnerListNameEditor);

export default React.memo(SettingsPopupLists);
