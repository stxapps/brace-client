import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

import { updatePopup, updateBulkEdit } from '../actions';
import {
  updateQueryString, changeListName, moveLinks, moveToListName, updateListNamesMode,
  updateSettingsPopup, updateSettingsViewId,
} from '../actions/chunk';
import {
  LIST_NAMES_POPUP, TRASH, LIST_NAMES_MODE_CHANGE_LIST_NAME,
  LIST_NAMES_MODE_CHANGE_TAG_NAME, LIST_NAMES_MODE_MOVE_LINKS,
  LIST_NAMES_MODE_MOVE_LIST_NAME, LIST_NAMES_ANIM_TYPE_POPUP,
  LIST_NAMES_ANIM_TYPE_BMODAL, SETTINGS_VIEW_LISTS,
} from '../types/const';
import { getListNameMap } from '../selectors';
import {
  getLastHalfHeight, getListNameObj, getLongestListNameDisplayName,
  getMaxListNameChildrenSize,
} from '../utils';
import {
  popupBgFMV, popupFMV, bModalBgFMV, bModalFMV, slideInPopupFMV, slideInModalFMV,
} from '../types/animConfigs';
import { computePositionStyle } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const MODE_CHANGE_LIST_NAME = LIST_NAMES_MODE_CHANGE_LIST_NAME;
const MODE_CHANGE_TAG_NAME = LIST_NAMES_MODE_CHANGE_TAG_NAME;
const MODE_MOVE_LINKS = LIST_NAMES_MODE_MOVE_LINKS;
const MODE_MOVE_LIST_NAME = LIST_NAMES_MODE_MOVE_LIST_NAME;

const ANIM_TYPE_POPUP = LIST_NAMES_ANIM_TYPE_POPUP;
const ANIM_TYPE_BMODAL = LIST_NAMES_ANIM_TYPE_BMODAL;

const ListNamesPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isListNamesPopupShown);
  const anchorPosition = useSelector(state => state.display.listNamesPopupPosition);
  const mode = useSelector(state => state.display.listNamesMode);
  const animType = useSelector(state => state.display.listNamesAnimType);
  const listName = useSelector(state => state.display.listName);
  const selectingLinkId = useSelector(state => state.display.selectingLinkId);
  const selectedLinkIds = useSelector(state => state.display.selectedLinkIds);
  const selectingListName = useSelector(state => state.display.selectingListName);
  const listNameMap = useSelector(getListNameMap);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const updates = useSelector(state => state.fetched);

  const [currentListName, setCurrentListName] = useState(null);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const [derivedMode, setDerivedMode] = useState(mode);
  const [derivedAnimType, setDerivedAnimType] = useState(animType);
  const [derivedListName, setDerivedListName] = useState(listName);
  const [derivedSelectingLinkId, setDerivedSelectingLinkId] = useState(selectingLinkId);
  const [derivedSelectedLinkIds, setDerivedSelectedLinkIds] = useState(selectedLinkIds);
  const [derivedSelectingListName, setDerivedSelectingListName] = useState(
    selectingListName
  );
  const [derivedListNameMap, setDerivedListNameMap] = useState(listNameMap);
  const [derivedTagNameMap, setDerivedTagNameMap] = useState(tagNameMap);
  const [derivedUpdates, setDerivedUpdates] = useState(updates);

  const [forwardCount, setForwardCount] = useState(0);
  const [prevForwardCount, setPrevForwardCount] = useState(forwardCount);
  const [backCount, setBackCount] = useState(0);
  const [prevBackCount, setPrevBackCount] = useState(backCount);
  const slideAnim = useMotionValue('0%');
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const { listNameObj, parent, children } = useMemo(() => {
    const { listNameObj: obj, parent: p } = getListNameObj(
      currentListName, derivedListNameMap
    );
    const c = currentListName === null ? derivedListNameMap : obj.children;
    return { listNameObj: obj, parent: p, children: c };
  }, [currentListName, derivedListNameMap]);
  const longestDisplayName = useMemo(() => {
    if (derivedMode === MODE_CHANGE_TAG_NAME) {
      return getLongestListNameDisplayName(derivedTagNameMap);
    }
    return getLongestListNameDisplayName(derivedListNameMap);
  }, [derivedMode, derivedListNameMap, derivedTagNameMap]);
  const maxChildrenSize = useMemo(() => {
    if (derivedMode === MODE_CHANGE_TAG_NAME) {
      return getMaxListNameChildrenSize(derivedTagNameMap);
    }
    return getMaxListNameChildrenSize(derivedListNameMap);
  }, [derivedMode, derivedListNameMap, derivedTagNameMap]);
  const slideFMV = useMemo(() => {
    if (derivedAnimType === ANIM_TYPE_BMODAL) return slideInModalFMV;
    return slideInPopupFMV;
  }, [derivedAnimType]);

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(LIST_NAMES_POPUP, false, null));
    didClick.current = true;
  };

  const onSwitchBtnClick = () => {
    if (didClick.current) return;
    if (derivedMode === MODE_CHANGE_LIST_NAME) {
      dispatch(updateListNamesMode(MODE_CHANGE_TAG_NAME, ANIM_TYPE_POPUP));
      didClick.current = true;
    } else if (derivedMode === MODE_CHANGE_TAG_NAME) {
      dispatch(updateListNamesMode(MODE_CHANGE_LIST_NAME, ANIM_TYPE_POPUP));
      didClick.current = true;
    } else {
      console.log('In ListNamesPopup.onSwitchBtnClick, invalid mode:', derivedMode);
    }
  };

  const onNewBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();

    dispatch(updateSettingsViewId(SETTINGS_VIEW_LISTS, false));
    dispatch(updateSettingsPopup(true));
    didClick.current = true;
  };

  const onLnItemBtnClick = (selectedListName) => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (derivedMode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(derivedSelectingListName, selectedListName));
    } else if (derivedMode === MODE_MOVE_LINKS) {
      let ids = [derivedSelectingLinkId];
      if (derivedSelectedLinkIds.length > 0) ids = derivedSelectedLinkIds;

      dispatch(moveLinks(selectedListName, ids));
      dispatch(updateBulkEdit(false));
    } else if (derivedMode === MODE_CHANGE_LIST_NAME) {
      dispatch(changeListName(selectedListName));
    } else {
      console.log('In ListNamesPopup.onLnItemBtnClick, invalid mode:', derivedMode);
    }
    didClick.current = true;
  };

  const onTgItemBtnClick = (selectedTagName) => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(updateQueryString(selectedTagName));
    didClick.current = true;
  };

  const onMoveHereBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (derivedMode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(derivedSelectingListName, currentListName));
    } else if (derivedMode === MODE_MOVE_LINKS) {
      let ids = [derivedSelectingLinkId];
      if (derivedSelectedLinkIds.length > 0) ids = derivedSelectedLinkIds;
      if (currentListName) {
        dispatch(moveLinks(currentListName, ids));
      } else {
        console.log('In ListNamesPopup.onMoveHereBtnClick, invalid currentListName');
      }
      dispatch(updateBulkEdit(false));
    } else {
      console.log('In ListNamesPopup.onMoveHereBtnClick, invalid mode:', derivedMode);
    }
    didClick.current = true;
  };

  const onBackBtnClick = (selectedListName) => {
    setCurrentListName(selectedListName);
    setBackCount(backCount + 1);
  };

  const onForwardBtnClick = (selectedListName) => {
    const transition = /** @type import('framer-motion').Tween */({
      ...slideFMV,
      onComplete: () => {
        setCurrentListName(selectedListName);
        setForwardCount(forwardCount + 1);
      }
    });
    animate(slideAnim, '-100%', transition);
  };

  useEffect(() => {
    if (derivedIsShown) {
      cancelBtn.current.focus();
      didClick.current = false;
    }
  }, [derivedIsShown, derivedMode]);

  useEffect(() => {
    const transition = /** @type import('framer-motion').Tween */({ ...slideFMV });
    const controls = animate(slideAnim, '0%', transition);
    return () => controls.stop();
  }, [backCount, slideFMV, slideAnim]);

  if (derivedIsShown !== isShown || derivedMode !== mode) {
    if (
      (!derivedIsShown && isShown) ||
      (derivedIsShown && isShown && derivedMode !== mode)
    ) {
      setDerivedAnchorPosition(anchorPosition);
      setDerivedAnimType(animType);
      setDerivedListName(listName);
      setDerivedSelectingLinkId(selectingLinkId);
      setDerivedSelectedLinkIds(selectedLinkIds);
      setDerivedSelectingListName(selectingListName);
      setDerivedListNameMap(listNameMap);
      setDerivedTagNameMap(tagNameMap);
      setDerivedUpdates(updates);

      if (mode === MODE_CHANGE_TAG_NAME) {
        setCurrentListName(null);
      } else if (mode === MODE_MOVE_LIST_NAME) {
        const { parent: p } = getListNameObj(selectingListName, listNameMap);
        setCurrentListName(p);
      } else {
        const { parent: p } = getListNameObj(listName, listNameMap);
        setCurrentListName(p);
      }
    }
    if (derivedIsShown !== isShown) setDerivedIsShown(isShown);
    if (derivedMode !== mode) setDerivedMode(mode);
  }

  if (!derivedIsShown || !derivedAnchorPosition) return (
    <AnimatePresence key="AP_lnPopup" />
  );

  if (forwardCount !== prevForwardCount) {
    slideAnim.set('0%');
    setPrevForwardCount(forwardCount);
  }
  if (backCount !== prevBackCount) {
    slideAnim.set('-100%');
    setPrevBackCount(backCount);
  }

  const isAnimTypeB = derivedAnimType === ANIM_TYPE_BMODAL;

  let popupWidth = 0, popupHeight = 0;
  if (isAnimTypeB) {
    popupWidth = safeAreaWidth;

    popupHeight = Math.min(371, 52 * maxChildrenSize + 56 + 55);
    if (maxChildrenSize > 4) {
      popupHeight = getLastHalfHeight(
        Math.min(popupHeight, safeAreaHeight - 16), 52, 56, 55, 0.55
      );
    } else if (maxChildrenSize > 3) {
      popupHeight = Math.min(popupHeight, safeAreaHeight - 16);
    }
  } else {
    if ([MODE_CHANGE_LIST_NAME, MODE_CHANGE_TAG_NAME].includes(derivedMode)) {
      popupWidth = 160;
      if (longestDisplayName.length > 26) popupWidth = 256;
      else if (longestDisplayName.length > 14) popupWidth = 208;

      popupHeight = 44 * (maxChildrenSize + 1) + 4;
      if (popupHeight > safeAreaHeight - 16) {
        popupHeight = getLastHalfHeight(
          Math.min(popupHeight, safeAreaHeight - 16), 44, 0, 0, 0.5
        );
      }
    } else if ([MODE_MOVE_LINKS, MODE_MOVE_LIST_NAME].includes(derivedMode)) {
      popupWidth = 168;
      if (longestDisplayName.length > 26) popupWidth = 256;
      else if (longestDisplayName.length > 14) popupWidth = 208;

      popupHeight = 44 * (maxChildrenSize + 1) + 51;
      if (popupHeight > safeAreaHeight - 16) {
        popupHeight = getLastHalfHeight(
          Math.min(popupHeight, safeAreaHeight - 16), 44, 0, 51, 0.5
        );
      }
    } else {
      console.log('In ListNamesPopup popupWidth/Height, invalid mode:', derivedMode);
    }
  }

  const renderListNameBtns = () => {
    const viewClassNames = isAnimTypeB ? '-mt-0.5' : '-mt-0.5';

    return (
      <div className={tailwind(`${viewClassNames}`)}>
        {children.map(obj => {
          let btnClassNames = isAnimTypeB ? 'py-4' : 'py-3';
          if (!obj.children || obj.children.length === 0) btnClassNames += ' pr-4';

          let disabled = false, forwardDisabled = false;
          if (derivedMode === MODE_MOVE_LIST_NAME) {
            const { parent: p } = getListNameObj(
              derivedSelectingListName, derivedListNameMap
            );
            disabled = [TRASH, derivedSelectingListName, p].includes(obj.listName);
            forwardDisabled = [TRASH, derivedSelectingListName].includes(obj.listName);
          } else if (derivedMode === MODE_MOVE_LINKS) {
            disabled = [TRASH, derivedListName].includes(obj.listName);
            forwardDisabled = [TRASH].includes(obj.listName);
          }

          return (
            <div key={obj.listName} className={tailwind('flex w-full flex-row items-center justify-start')}>
              <button onClick={() => onLnItemBtnClick(obj.listName)} className={tailwind(`group flex min-w-0 flex-shrink flex-grow flex-row items-center pl-4 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none blk:hover:bg-gray-700 blk:focus:bg-gray-700 ${btnClassNames}`)} disabled={disabled}>
                <p className={tailwind(`truncate text-left text-sm ${disabled ? 'text-gray-400 blk:text-gray-500' : 'text-gray-700 group-hover:text-gray-900 group-focus:text-gray-900 blk:text-gray-200 blk:group-hover:text-white blk:group-focus:text-white'}`)}>{obj.displayName}</p>
                {(derivedMode === MODE_CHANGE_LIST_NAME && obj.listName in derivedUpdates) && <div className={tailwind('ml-1 h-1.5 w-1.5 flex-shrink-0 flex-grow-0 self-start rounded-full bg-blue-400')}></div>}
              </button>
              {(obj.children && obj.children.length > 0) && <button onClick={() => onForwardBtnClick(obj.listName)} className={tailwind('group flex h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center focus:outline-none')} disabled={forwardDisabled}>
                <svg className={tailwind(`h-5 w-5 rounded ${forwardDisabled ? 'text-gray-300 blk:text-gray-600' : 'text-gray-500 group-hover:text-gray-700 group-focus:ring blk:text-gray-300 blk:group-hover:text-gray-100'}`)} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.29303 14.7069C7.10556 14.5194 7.00024 14.2651 7.00024 13.9999C7.00024 13.7348 7.10556 13.4804 7.29303 13.2929L10.586 9.99992L7.29303 6.70692C7.11087 6.51832 7.01008 6.26571 7.01236 6.00352C7.01463 5.74132 7.1198 5.49051 7.30521 5.3051C7.49062 5.11969 7.74143 5.01452 8.00363 5.01224C8.26583 5.00997 8.51843 5.11076 8.70703 5.29292L12.707 9.29292C12.8945 9.48045 12.9998 9.73475 12.9998 9.99992C12.9998 10.2651 12.8945 10.5194 12.707 10.7069L8.70703 14.7069C8.5195 14.8944 8.26519 14.9997 8.00003 14.9997C7.73487 14.9997 7.48056 14.8944 7.29303 14.7069Z" />
                </svg>
              </button>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTagNameBtns = () => {
    return (
      <div className={tailwind('-mt-0.5')}>
        {derivedTagNameMap.map(obj => {
          return (
            <div key={obj.tagName} className={tailwind('flex w-full flex-row items-center justify-start')}>
              <button onClick={() => onTgItemBtnClick(obj.tagName)} className={tailwind('group flex min-w-0 flex-shrink flex-grow flex-row items-center py-3 pl-4 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none blk:hover:bg-gray-700 blk:focus:bg-gray-700')}>
                <p className={tailwind('truncate text-left text-sm text-gray-700 group-hover:text-gray-900 group-focus:text-gray-900 blk:text-gray-200 blk:group-hover:text-white blk:group-focus:text-white')}>{obj.displayName}</p>
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const _render = () => {
    let rootName = 'Move to';
    if (derivedMode === MODE_CHANGE_LIST_NAME) rootName = 'Lists';
    else if (derivedMode === MODE_CHANGE_TAG_NAME) rootName = 'Tags';

    const displayName = currentListName ? listNameObj.displayName : rootName;
    const contentStyle = { x: slideAnim };

    let moveHereDisabled = false;
    if (derivedMode === MODE_MOVE_LIST_NAME) {
      const { parent: p } = getListNameObj(derivedSelectingListName, derivedListNameMap);
      moveHereDisabled = [TRASH, p].includes(currentListName);
    } else if (derivedMode === MODE_MOVE_LINKS) {
      moveHereDisabled = (
        !currentListName || [TRASH, derivedListName].includes(currentListName)
      );
    }

    const viewClassNames = isAnimTypeB ? 'h-14 pt-1' : 'h-11 pt-1';
    const moveHereClassNames = isAnimTypeB ? 'py-3' : 'py-2.5';

    return (
      <div className={tailwind('flex h-full w-full flex-col')}>
        <div className={tailwind(`flex w-full flex-shrink-0 flex-grow-0 items-center justify-start ${viewClassNames}`)}>
          {currentListName && <button onClick={() => onBackBtnClick(parent)} className={tailwind('group h-10 flex-shrink-0 flex-grow-0 items-center justify-center pl-2.5 pr-1 focus:outline-none')}>
            <svg className={tailwind('h-5 w-5 rounded text-gray-500 group-hover:text-gray-700 group-focus:ring blk:text-gray-300 blk:group-hover:text-gray-100')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12.707 5.29303C12.8945 5.48056 12.9998 5.73487 12.9998 6.00003C12.9998 6.26519 12.8945 6.5195 12.707 6.70703L9.41403 10L12.707 13.293C12.8892 13.4816 12.99 13.7342 12.9877 13.9964C12.9854 14.2586 12.8803 14.5094 12.6948 14.6948C12.5094 14.8803 12.2586 14.9854 11.9964 14.9877C11.7342 14.99 11.4816 14.8892 11.293 14.707L7.29303 10.707C7.10556 10.5195 7.00024 10.2652 7.00024 10C7.00024 9.73487 7.10556 9.48056 7.29303 9.29303L11.293 5.29303C11.4806 5.10556 11.7349 5.00024 12 5.00024C12.2652 5.00024 12.5195 5.10556 12.707 5.29303Z" />
            </svg>
          </button>}
          <p className={tailwind(`flex-shrink flex-grow truncate text-sm font-semibold text-gray-600 blk:text-gray-200 ${currentListName ? 'pr-4' : 'px-4'}`)}>{displayName}</p>
          {((derivedMode === MODE_CHANGE_LIST_NAME && derivedTagNameMap.length > 0) || derivedMode === MODE_CHANGE_TAG_NAME) && <button onClick={onSwitchBtnClick} className={tailwind('group flex h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center focus:outline-none')}>
            <svg className={tailwind('h-5 w-5 rounded text-gray-500 group-hover:text-gray-700 group-focus:ring blk:text-gray-300 blk:group-hover:text-gray-100')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.00003 5C7.73481 5 7.48046 5.10535 7.29292 5.29289C7.10539 5.48043 7.00003 5.73478 7.00003 6C7.00003 6.26521 7.10539 6.51957 7.29292 6.7071C7.48046 6.89464 7.73481 7 8.00003 7H13.586L12.293 8.293C12.1109 8.4816 12.0101 8.7342 12.0124 8.9964C12.0146 9.25859 12.1198 9.50941 12.3052 9.69482C12.4906 9.88022 12.7414 9.98539 13.0036 9.98767C13.2658 9.98995 13.5184 9.88915 13.707 9.707L16.707 6.707C16.8945 6.51947 16.9998 6.26516 16.9998 6C16.9998 5.73483 16.8945 5.48053 16.707 5.293L13.707 2.293C13.6148 2.19749 13.5044 2.1213 13.3824 2.0689C13.2604 2.01649 13.1292 1.9889 12.9964 1.98775C12.8637 1.98659 12.732 2.01189 12.6091 2.06218C12.4862 2.11246 12.3745 2.18671 12.2806 2.2806C12.1867 2.37449 12.1125 2.48615 12.0622 2.60904C12.0119 2.73194 11.9866 2.86362 11.9878 2.9964C11.9889 3.12918 12.0165 3.2604 12.0689 3.3824C12.1213 3.50441 12.1975 3.61475 12.293 3.707L13.586 5H8.00003ZM12 15C12.2652 15 12.5196 14.8946 12.7071 14.7071C12.8947 14.5196 13 14.2652 13 14C13 13.7348 12.8947 13.4804 12.7071 13.2929C12.5196 13.1054 12.2652 13 12 13H6.41403L7.70703 11.707C7.80254 11.6147 7.87872 11.5044 7.93113 11.3824C7.98354 11.2604 8.01113 11.1292 8.01228 10.9964C8.01344 10.8636 7.98813 10.7319 7.93785 10.609C7.88757 10.4861 7.81332 10.3745 7.71943 10.2806C7.62553 10.1867 7.51388 10.1125 7.39098 10.0622C7.26809 10.0119 7.13641 9.98659 7.00363 9.98775C6.87085 9.9889 6.73963 10.0165 6.61763 10.0689C6.49562 10.1213 6.38528 10.1975 6.29303 10.293L3.29303 13.293C3.10556 13.4805 3.00024 13.7348 3.00024 14C3.00024 14.2652 3.10556 14.5195 3.29303 14.707L6.29303 17.707C6.48163 17.8892 6.73424 17.99 6.99643 17.9877C7.25863 17.9854 7.50944 17.8802 7.69485 17.6948C7.88026 17.5094 7.98543 17.2586 7.9877 16.9964C7.98998 16.7342 7.88919 16.4816 7.70703 16.293L6.41403 15H12Z" />
            </svg>
          </button>}
          {derivedMode === MODE_MOVE_LINKS && <button onClick={onNewBtnClick} className={tailwind('group flex h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center focus:outline-none')}>
            <svg className={tailwind('h-5 w-5 rounded text-gray-500 group-hover:text-gray-700 group-focus:ring blk:text-gray-300 blk:group-hover:text-gray-100')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6V9H14C14.2652 9 14.5196 9.10536 14.7071 9.29289C14.8946 9.48043 15 9.73478 15 10C15 10.2652 14.8946 10.5196 14.7071 10.7071C14.5196 10.8946 14.2652 11 14 11H11V14C11 14.2652 10.8946 14.5196 10.7071 14.7071C10.5196 14.8946 10.2652 15 10 15C9.73478 15 9.48043 14.8946 9.29289 14.7071C9.10536 14.5196 9 14.2652 9 14V11H6C5.73478 11 5.48043 10.8946 5.29289 10.7071C5.10536 10.5196 5 10.2652 5 10C5 9.73478 5.10536 9.48043 5.29289 9.29289C5.48043 9.10536 5.73478 9 6 9H9V6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5Z" />
            </svg>
          </button>}
        </div>
        <div className={tailwind('flex w-full flex-1 flex-col overflow-hidden')}>
          <motion.div className={tailwind('flex-1 overflow-auto')} style={contentStyle}>
            {derivedMode === MODE_CHANGE_TAG_NAME ? renderTagNameBtns() : renderListNameBtns()}
          </motion.div>
        </div>
        {[MODE_MOVE_LINKS, MODE_MOVE_LIST_NAME].includes(derivedMode) && <div className={tailwind(`flex w-full flex-shrink-0 flex-grow-0 flex-row items-center justify-end border-t border-gray-200 px-3 blk:border-gray-600 ${moveHereClassNames}`)}>
          <button onClick={onMoveHereBtnClick} className={tailwind(`rounded-full border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring blk:bg-gray-800 ${moveHereDisabled ? 'border-gray-300 blk:border-gray-600' : 'border-gray-400 hover:border-gray-500 blk:border-gray-400 blk:hover:border-gray-300'} ${moveHereDisabled ? 'text-gray-400 blk:text-gray-500' : 'text-gray-500 hover:text-gray-600 blk:text-gray-300 blk:hover:text-gray-200'}`)} disabled={moveHereDisabled}>
            {moveHereDisabled ? 'View only' : 'Move here'}
          </button>
        </div>}
      </div>
    );
  };

  let panel;
  if (isAnimTypeB) {
    const popupStyle = {
      height: popupHeight + insets.bottom,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left, paddingRight: insets.right,
    };
    panel = (
      <motion.div key="LNP_popup" style={popupStyle} className={tailwind('fixed inset-x-0 bottom-0 z-41 rounded-t-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25')} variants={bModalFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {_render()}
      </motion.div>
    );
  } else {
    const posStyle = computePositionStyle(
      derivedAnchorPosition,
      { width: popupWidth, height: popupHeight },
      { width: safeAreaWidth, height: safeAreaHeight },
      null,
      insets,
      8,
    );
    const popupStyle = { ...posStyle, width: popupWidth, height: popupHeight };

    panel = (
      <motion.div key="LNP_popup" style={popupStyle} className={tailwind('fixed z-41 overflow-auto rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25')} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {_render()}
      </motion.div>
    );
  }

  const bgFMV = isAnimTypeB ? bModalBgFMV : popupBgFMV;

  return (
    <AnimatePresence key="AP_lnPopup">
      <motion.button key="LNP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 z-40 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={bgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(ListNamesPopup);
