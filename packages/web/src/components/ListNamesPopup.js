import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

import {
  updatePopup, updateBulkEdit, changeListName, moveLinks, moveToListName,
} from '../actions';
import {
  LIST_NAMES_POPUP, TRASH, LIST_NAMES_MODE_CHANGE_LIST_NAME,
  LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_MODE_MOVE_LIST_NAME,
  LIST_NAMES_ANIM_TYPE_BMODAL,
} from '../types/const';
import { getListNameMap } from '../selectors';
import {
  getLastHalfHeight, getListNameObj, getLongestListNameDisplayName,
  getMaxListNameChildrenSize,
} from '../utils';
import {
  popupBgFMV, popupFMV, bModalBgFMV, bModalFMV, slideInPopupFMV, slideInModalFMV,
} from '../types/animConfigs';

import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';
import { useSafeAreaFrame } from '.';

// eslint-disable-next-line
import { Tween } from 'framer-motion';

const MODE_CHANGE_LIST_NAME = LIST_NAMES_MODE_CHANGE_LIST_NAME;
const MODE_MOVE_LINKS = LIST_NAMES_MODE_MOVE_LINKS;
const MODE_MOVE_LIST_NAME = LIST_NAMES_MODE_MOVE_LIST_NAME;

const ANIM_TYPE_BMODAL = LIST_NAMES_ANIM_TYPE_BMODAL;

const ListNamesPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isListNamesPopupShown);
  const anchorPosition = useSelector(state => state.display.listNamesPopupPosition);
  const mode = useSelector(state => state.display.listNamesMode);
  const animType = useSelector(state => state.display.listNamesAnimType);
  const listName = useSelector(state => state.display.listName);
  const selectingLinkId = useSelector(state => state.display.selectingLinkId);
  const selectedLinkIds = useSelector(state => state.display.selectedLinkIds);
  const selectingListName = useSelector(state => state.display.selectingListName);
  const listNameMap = useSelector(getListNameMap);
  const updates = useSelector(state => state.fetched);

  const [currentListName, setCurrentListName] = useState(null);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const [derivedListName, setDerivedListName] = useState(listName);
  const [derivedSelectingLinkId, setDerivedSelectingLinkId] = useState(selectingLinkId);
  const [derivedSelectedLinkIds, setDerivedSelectedLinkIds] = useState(selectedLinkIds);
  const [derivedSelectingListName, setDerivedSelectingListName] = useState(
    selectingListName
  );
  const [derivedListNameMap, setDerivedListNameMap] = useState(listNameMap);
  const [derivedUpdates, setDerivedUpdates] = useState(updates);

  const [forwardCount, setForwardCount] = useState(0);
  const [prevForwardCount, setPrevForwardCount] = useState(forwardCount);
  const [backCount, setBackCount] = useState(0);
  const [prevBackCount, setPrevBackCount] = useState(backCount);
  const slideAnim = useMotionValue('0%');
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const { listNameObj, parent, children } = useMemo(() => {
    const { listNameObj: obj, parent: p } = getListNameObj(
      currentListName, derivedListNameMap
    );
    const c = currentListName === null ? derivedListNameMap : obj.children;
    return { listNameObj: obj, parent: p, children: c };
  }, [currentListName, derivedListNameMap]);
  const longestDisplayName = useMemo(() => {
    return getLongestListNameDisplayName(derivedListNameMap);
  }, [derivedListNameMap]);
  const maxChildrenSize = useMemo(() => {
    return getMaxListNameChildrenSize(derivedListNameMap);
  }, [derivedListNameMap]);
  const slideFMV = useMemo(() => {
    if (animType === ANIM_TYPE_BMODAL) return slideInModalFMV;
    return slideInPopupFMV;
  }, [animType]);

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(LIST_NAMES_POPUP, false, null));
    didClick.current = true;
  };

  const onMoveToItemBtnClick = (selectedListName) => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (mode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(derivedSelectingListName, selectedListName));
    } else if (mode === MODE_MOVE_LINKS) {
      let ids = [derivedSelectingLinkId];
      if (derivedSelectedLinkIds.length > 0) ids = derivedSelectedLinkIds;

      dispatch(moveLinks(selectedListName, ids));
      dispatch(updateBulkEdit(false));
    } else if (mode === MODE_CHANGE_LIST_NAME) {
      dispatch(changeListName(selectedListName));
    } else throw new Error(`Invalid mode: ${mode}`);
    didClick.current = true;
  };

  const onMoveHereBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (mode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(derivedSelectingListName, currentListName));
    } else if (mode === MODE_MOVE_LINKS) {
      if (!currentListName) {
        throw new Error(`Invalid currentListName: ${currentListName}`);
      }

      let ids = [derivedSelectingLinkId];
      if (derivedSelectedLinkIds.length > 0) ids = derivedSelectedLinkIds;
      dispatch(moveLinks(currentListName, ids));
      dispatch(updateBulkEdit(false));
    } else throw new Error(`Invalid mode: ${mode}`);
    didClick.current = true;
  };

  const onBackBtnClick = (selectedListName) => {
    setCurrentListName(selectedListName);
    setBackCount(backCount + 1);
  };

  const onForwardBtnClick = (selectedListName) => {
    const transition = /** @type Tween */({
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
  }, [derivedIsShown]);

  useEffect(() => {
    const transition = /** @type Tween */({ ...slideFMV });
    const controls = animate(slideAnim, '0%', transition);
    return () => controls.stop();
  }, [backCount, slideFMV, slideAnim]);

  if (derivedIsShown !== isShown) {
    if (!derivedIsShown && isShown) {
      setDerivedAnchorPosition(anchorPosition);
      setDerivedListName(listName);
      setDerivedSelectingLinkId(selectingLinkId);
      setDerivedSelectedLinkIds(selectedLinkIds);
      setDerivedSelectingListName(selectingListName);
      setDerivedListNameMap(listNameMap);
      setDerivedUpdates(updates);

      if (mode === MODE_MOVE_LIST_NAME) {
        const { parent: p } = getListNameObj(selectingListName, listNameMap);
        setCurrentListName(p);
      } else {
        const { parent: p } = getListNameObj(listName, listNameMap);
        setCurrentListName(p);
      }
    }
    setDerivedIsShown(isShown);
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

  let popupWidth, popupHeight;
  if (animType === ANIM_TYPE_BMODAL) {
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
    if (mode === MODE_CHANGE_LIST_NAME) {
      popupWidth = 160;
      if (longestDisplayName.length > 26) popupWidth = 256;
      else if (longestDisplayName.length > 14) popupWidth = 208;

      popupHeight = Math.min(268, 44 * (maxChildrenSize + 1) + 4);
      if (maxChildrenSize > 4) {
        popupHeight = getLastHalfHeight(
          Math.min(popupHeight, safeAreaHeight - 16), 44, 0, 0, 0.5
        );
      } else if (maxChildrenSize > 3) {
        popupHeight = Math.min(popupHeight, safeAreaHeight - 16);
      }
    } else if ([MODE_MOVE_LINKS, MODE_MOVE_LIST_NAME].includes(mode)) {
      popupWidth = 168;
      if (longestDisplayName.length > 26) popupWidth = 256;
      else if (longestDisplayName.length > 14) popupWidth = 208;

      popupHeight = Math.min(315, 44 * (maxChildrenSize + 1) + 51);
      if (maxChildrenSize > 4) {
        popupHeight = getLastHalfHeight(
          Math.min(popupHeight, safeAreaHeight - 16), 44, 0, 51, 0.5
        );
      } else if (maxChildrenSize > 3) {
        popupHeight = Math.min(popupHeight, safeAreaHeight - 16);
      }
    } else throw new Error(`Invalid mode: ${mode}`);
  }

  const renderListNameBtns = () => {
    const viewClassNames = animType === ANIM_TYPE_BMODAL ? '-mt-0.5' : '-mt-0.5';

    return (
      <div className={`${viewClassNames}`}>
        {children.map(obj => {
          let btnClassNames = animType === ANIM_TYPE_BMODAL ? 'py-4' : 'py-3';
          if (!obj.children || obj.children.length === 0) btnClassNames += ' pr-4';

          let disabled = false, forwardDisabled = false;
          if (mode === MODE_MOVE_LIST_NAME) {
            const { parent: p } = getListNameObj(
              derivedSelectingListName, derivedListNameMap
            );
            disabled = [TRASH, derivedSelectingListName, p].includes(obj.listName);
            forwardDisabled = [TRASH, derivedSelectingListName].includes(obj.listName);
          } else if (mode === MODE_MOVE_LINKS) {
            disabled = [TRASH, derivedListName].includes(obj.listName);
            forwardDisabled = [TRASH].includes(obj.listName);
          }

          return (
            <div key={obj.listName} className="w-full flex flex-row justify-start items-center">
              <button onClick={() => onMoveToItemBtnClick(obj.listName)} className={`flex-grow flex-shrink min-w-0 pl-4 ${btnClassNames} flex flex-row items-center group hover:bg-gray-100 focus:outline-none focus:bg-gray-100`} disabled={disabled}>
                <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700 group-hover:text-gray-900 group-focus:text-gray-900'} text-left truncate`}>{obj.displayName}</p>
                {(mode === MODE_CHANGE_LIST_NAME && obj.listName in derivedUpdates) && <div className="ml-1 flex-grow-0 flex-shrink-0 self-start w-1.5 h-1.5 bg-blue-400 rounded-full"></div>}
              </button>
              {(obj.children && obj.children.length > 0) && <button onClick={() => onForwardBtnClick(obj.listName)} className="flex-grow-0 flex-shrink-0 w-10 h-10 flex justify-center items-center group focus:outline-none" disabled={forwardDisabled}>
                <svg className={`w-5 h-5 ${forwardDisabled ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-700 group-focus:ring'} rounded`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.29303 14.7069C7.10556 14.5194 7.00024 14.2651 7.00024 13.9999C7.00024 13.7348 7.10556 13.4804 7.29303 13.2929L10.586 9.99992L7.29303 6.70692C7.11087 6.51832 7.01008 6.26571 7.01236 6.00352C7.01463 5.74132 7.1198 5.49051 7.30521 5.3051C7.49062 5.11969 7.74143 5.01452 8.00363 5.01224C8.26583 5.00997 8.51843 5.11076 8.70703 5.29292L12.707 9.29292C12.8945 9.48045 12.9998 9.73475 12.9998 9.99992C12.9998 10.2651 12.8945 10.5194 12.707 10.7069L8.70703 14.7069C8.5195 14.8944 8.26519 14.9997 8.00003 14.9997C7.73487 14.9997 7.48056 14.8944 7.29303 14.7069Z" />
                </svg>
              </button>}
            </div>
          );
        })}
      </div>
    );
  };

  const _render = () => {
    const rootName = mode === MODE_CHANGE_LIST_NAME ? 'Lists' : 'Move to';
    const displayName = currentListName ? listNameObj.displayName : rootName;
    const contentStyle = { x: slideAnim };

    let moveHereDisabled = false;
    if (mode === MODE_MOVE_LIST_NAME) {
      const { parent: p } = getListNameObj(derivedSelectingListName, derivedListNameMap);
      moveHereDisabled = [TRASH, p].includes(currentListName);
    } else if (mode === MODE_MOVE_LINKS) {
      moveHereDisabled = (
        !currentListName || [TRASH, derivedListName].includes(currentListName)
      );
    }

    const viewClassNames = animType === ANIM_TYPE_BMODAL ? 'h-14 pt-1' : 'h-11 pt-1';
    const moveHereClassNames = animType === ANIM_TYPE_BMODAL ? 'py-3' : 'py-2.5';

    return (
      <div className="w-full h-full flex flex-col">
        <div className={`flex-grow-0 flex-shrink-0 flex justify-start items-center w-full ${viewClassNames}`}>
          {currentListName && <button onClick={() => onBackBtnClick(parent)} className="pl-2.5 pr-1 h-10 flex-grow-0 flex-shrink-0 justify-center items-center group focus:outline-none">
            <svg className="w-5 h-5 text-gray-500 rounded group-hover:text-gray-700 group-focus:ring" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12.707 5.29303C12.8945 5.48056 12.9998 5.73487 12.9998 6.00003C12.9998 6.26519 12.8945 6.5195 12.707 6.70703L9.41403 10L12.707 13.293C12.8892 13.4816 12.99 13.7342 12.9877 13.9964C12.9854 14.2586 12.8803 14.5094 12.6948 14.6948C12.5094 14.8803 12.2586 14.9854 11.9964 14.9877C11.7342 14.99 11.4816 14.8892 11.293 14.707L7.29303 10.707C7.10556 10.5195 7.00024 10.2652 7.00024 10C7.00024 9.73487 7.10556 9.48056 7.29303 9.29303L11.293 5.29303C11.4806 5.10556 11.7349 5.00024 12 5.00024C12.2652 5.00024 12.5195 5.10556 12.707 5.29303Z" />
            </svg>
          </button>}
          <p className={`flex-grow flex-shrink text-gray-600 text-sm font-semibold truncate ${currentListName ? 'pr-4' : 'px-4'}`}>{displayName}</p>
        </div>
        <div className="flex-1 overflow-hidden w-full flex flex-col">
          <motion.div className="flex-1 overflow-auto" style={contentStyle}>
            {renderListNameBtns()}
          </motion.div>
        </div>
        {[MODE_MOVE_LINKS, MODE_MOVE_LIST_NAME].includes(mode) && <div className={`flex-grow-0 flex-shrink-0 w-full px-3 ${moveHereClassNames} border-t border-gray-200 flex flex-row justify-end items-center`}>
          <button onClick={onMoveHereBtnClick} className={`px-3 py-1.5 bg-white border ${moveHereDisabled ? 'border-gray-300' : 'border-gray-400 hover:border-gray-500'} rounded-full text-xs ${moveHereDisabled ? 'text-gray-400' : 'text-gray-500 hover:text-gray-600'} focus:outline-none focus:ring`} disabled={moveHereDisabled}>
            {moveHereDisabled ? 'View only' : 'Move here'}
          </button>
        </div>}
      </div>
    );
  };

  let panel;
  if (animType === ANIM_TYPE_BMODAL) {
    const popupStyle = { height: popupHeight };
    panel = (
      <motion.div key="LNP_popup" style={popupStyle} className="fixed inset-x-0 bottom-0 bg-white rounded-t-lg shadow-xl ring-1 ring-black ring-opacity-5 z-41" variants={bModalFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {_render()}
      </motion.div>
    );
  } else {
    const layouts = createLayouts(
      derivedAnchorPosition,
      { width: popupWidth, height: popupHeight },
      { width: safeAreaWidth, height: safeAreaHeight },
    );
    const popupPosition = computePosition(layouts, null, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const popupStyle = { top, left, width: popupWidth, height: popupHeight };
    const popupClassNames = getOriginClassName(topOrigin, leftOrigin);

    panel = (
      <motion.div key="LNP_popup" style={popupStyle} className={`fixed rounded-lg shadow-xl bg-white overflow-auto ring-1 ring-black ring-opacity-5 z-41 ${popupClassNames}`} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {_render()}
      </motion.div>
    );
  }

  const bgFMV = animType === ANIM_TYPE_BMODAL ? bModalBgFMV : popupBgFMV;

  return (
    <AnimatePresence key="AP_lnPopup">
      <motion.button key="LNP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className="fixed inset-0 w-full h-full bg-black bg-opacity-25 cursor-default z-40 focus:outline-none" variants={bgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(ListNamesPopup);
