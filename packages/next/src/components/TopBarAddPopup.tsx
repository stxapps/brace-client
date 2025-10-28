import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  updateAddPopup, updateLinkEditor, addLink, updateListNamesMode,
} from '../actions/chunk';
import {
  LIST_NAMES_POPUP, LIST_NAMES_MODE_ADD_LINK, LIST_NAMES_ANIM_TYPE_POPUP,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS, ADD_MODE_BASIC, ADD_MODE_ADVANCED,
} from '../types/const';
import {
  isObject, validateUrl, getRect, toPx, getListNameDisplayName, adjustRect,
} from '../utils';
import { popupBgFMV, popupFMV } from '../types/animConfigs';
import { computePositionStyle } from '../utils/popup';
import { selectHint, deselectValue, addTagName, renameKeys } from '../utils/tag';

import { getTopBarSizes, useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const TopBarAddPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isAddPopupShown);
  const addAnchorPosition = useSelector(state => state.display.addPopupPosition);
  const linkEditor = useSelector(state => state.linkEditor);
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);

  const anchorPosition = useMemo(() => {
    let pos = addAnchorPosition;
    if (isShown && !isObject(pos)) {
      const MAX_W_6XL = '72rem'; // If change max-w-6xl in TopBar, must update this too.
      const { headerPaddingX, commandsWidth } = getTopBarSizes(safeAreaWidth);

      let x = insets.left, barWidth = safeAreaWidth;
      if (safeAreaWidth > toPx(MAX_W_6XL)) {
        x += (safeAreaWidth - toPx(MAX_W_6XL)) / 2;
        barWidth = toPx(MAX_W_6XL);
      }
      x += barWidth - commandsWidth - (headerPaddingX / 2);

      const y = insets.top + toPx('0.75rem') + toPx('2.625rem');
      pos = getRect(x, y, toPx('4.125rem'), toPx('2rem'));
    }
    return pos;
  }, [safeAreaWidth, insets, isShown, addAnchorPosition]);

  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onAddInputChange = (e) => {
    dispatch(updateLinkEditor(
      { url: e.target.value, isAskingConfirm: false }
    ));
  };

  const onAddInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      onAddOkBtnClick();
      if (window.document.activeElement instanceof HTMLInputElement) {
        window.document.activeElement.blur();
      }
    }
  };

  const onAddOkBtnClick = () => {
    if (didClick.current) return;

    const url = linkEditor.url.trim();
    if (!linkEditor.isAskingConfirm) {
      const urlValidatedResult = validateUrl(url);
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

    dispatch(addLink(url, linkEditor.listName, null));
    dispatch(updateAddPopup(false));

    didClick.current = true;
  };

  const onAddCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updateAddPopup(false));
    didClick.current = true;
  };

  const onAdvancedBtnClick = () => {
    let newMode = ADD_MODE_BASIC;
    if (linkEditor.mode === ADD_MODE_BASIC) newMode = ADD_MODE_ADVANCED;
    dispatch(updateLinkEditor({ mode: newMode }));
  };

  const onListNameBtnClick = (e) => {
    dispatch(updateListNamesMode(
      LIST_NAMES_MODE_ADD_LINK, LIST_NAMES_ANIM_TYPE_POPUP,
    ));

    const rect = e.currentTarget.getBoundingClientRect();
    const nRect = adjustRect(
      rect, toPx('-0.25rem'), toPx('-0.25rem'), toPx('0.5rem'), toPx('0.5rem')
    );
    dispatch(updatePopup(LIST_NAMES_POPUP, true, nRect));
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
    dispatch(updateLinkEditor({ tagDisplayName: e.target.value }));
  };

  const onTagDnInputKeyPress = (e) => {
    if (e.key === 'Enter') onTagAddBtnClick();
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

  useEffect(() => {
    if (isShown) {
      const s = popup.current.getBoundingClientRect();
      setPopupSize(s);
    } else {
      setPopupSize(null);
    }
  }, [isShown]);

  useEffect(() => {
    if (isShown) didClick.current = false;
  }, [isShown, linkEditor]);

  if (!isShown) return (
    <AnimatePresence key="AnimatePresence_TopBarAddPopup" />
  );

  const renderContent = () => {
    const displayName = getListNameDisplayName(linkEditor.listName, listNameMap);

    let tagDesc = null;
    if (linkEditor.mode === ADD_MODE_ADVANCED) {
      if (linkEditor.tagHints.length === 0) {
        tagDesc = (
          <React.Fragment>Enter a new tag and press the Add button.<br />After finishing, choose save.</React.Fragment>
        );
      } else {
        tagDesc = (
          <React.Fragment>Enter a new tag and press the Add button,<br />or select from the hint below.</React.Fragment>
        );
      }
    }

    return (
      <>
        <div className={tailwind('flex')}>
          <span className={tailwind('inline-flex items-center text-sm text-gray-500 blk:text-gray-300')}>Url:</span>
          <div className={tailwind('ml-3 flex-1')}>
            <input onChange={onAddInputChange} onKeyDown={onAddInputKeyPress} className={tailwind('w-full rounded-full border border-gray-400 bg-white px-3.5 py-1 text-base text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500/50 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 blk:placeholder:text-gray-400 blk:focus:border-transparent')} type="url" placeholder="https://" value={linkEditor.url} autoCapitalize="none" autoFocus />
          </div>
        </div>
        <button onClick={onAdvancedBtnClick} className={tailwind('mt-5 -ml-2.5 flex items-center rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-600 focus:outline-none focus-visible:ring blk:text-gray-300 blk:hover:text-gray-200')}>
          {linkEditor.mode !== ADD_MODE_ADVANCED && <svg className={tailwind('h-3')} viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0.292787 9.70698C0.105316 9.51945 0 9.26514 0 8.99998C0 8.73482 0.105316 8.48051 0.292787 8.29298L3.58579 4.99998L0.292787 1.70698C0.110629 1.51838 0.00983372 1.26578 0.0121121 1.00358C0.0143906 0.741382 0.11956 0.49057 0.304968 0.305162C0.490376 0.119753 0.741189 0.0145843 1.00339 0.0123059C1.26558 0.0100274 1.51818 0.110822 1.70679 0.29298L5.70679 4.29298C5.89426 4.48051 5.99957 4.73482 5.99957 4.99998C5.99957 5.26514 5.89426 5.51945 5.70679 5.70698L1.70679 9.70698C1.51926 9.89445 1.26495 9.99977 0.999786 9.99977C0.734622 9.99977 0.480314 9.89445 0.292787 9.70698Z" />
          </svg>}
          {linkEditor.mode === ADD_MODE_ADVANCED && <svg className={tailwind('w-3.5')} viewBox="0 0 11 7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0.292787 1.29302C0.480314 1.10555 0.734622 1.00023 0.999786 1.00023C1.26495 1.00023 1.51926 1.10555 1.70679 1.29302L4.99979 4.58602L8.29279 1.29302C8.38503 1.19751 8.49538 1.12133 8.61738 1.06892C8.73939 1.01651 8.87061 0.988924 9.00339 0.98777C9.13616 0.986616 9.26784 1.01192 9.39074 1.0622C9.51364 1.11248 9.62529 1.18673 9.71918 1.28062C9.81307 1.37452 9.88733 1.48617 9.93761 1.60907C9.98789 1.73196 10.0132 1.86364 10.012 1.99642C10.0109 2.1292 9.9833 2.26042 9.93089 2.38242C9.87848 2.50443 9.8023 2.61477 9.70679 2.70702L5.70679 6.70702C5.51926 6.89449 5.26495 6.99981 4.99979 6.99981C4.73462 6.99981 4.48031 6.89449 4.29279 6.70702L0.292787 2.70702C0.105316 2.51949 0 2.26518 0 2.00002C0 1.73486 0.105316 1.48055 0.292787 1.29302V1.29302Z" />
          </svg>}
          <span className={tailwind('ml-1')}>Advanced</span>
        </button>
        {linkEditor.mode === ADD_MODE_ADVANCED && <div className={tailwind('')}>
          <div className={tailwind('flex')}>
            <span className={tailwind('inline-flex items-center text-sm text-gray-500 blk:text-gray-300')}>List:</span>
            <button onClick={onListNameBtnClick} className={tailwind('ml-2 flex items-center rounded-xs bg-white focus:outline-none focus:ring blk:bg-gray-900')}>
              <span className={tailwind('truncate text-sm text-gray-500 blk:text-gray-300')}>{displayName}</span>
              <svg className={tailwind('w-5 text-gray-900 blk:text-white')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className={tailwind('flex')}>
            <span className={tailwind('inline-flex items-center text-sm text-gray-500 blk:text-gray-300')}>Tags:</span>
            <div>
              {linkEditor.tagValues.length === 0 && <div className={tailwind('pt-4')}>
                <p className={tailwind('text-sm leading-6 text-gray-500 blk:text-gray-400')}>{tagDesc}</p>
              </div>}
              {linkEditor.tagValues.length > 0 && <div className={tailwind('flex min-h-16 flex-wrap items-center justify-start pt-5')}>
                {linkEditor.tagValues.map((value, i) => {
                  return (
                    <div key={`TagEditorValue-${value.tagName}`} className={tailwind(`mb-2 flex max-w-full items-center justify-start rounded-full bg-gray-100 pl-3 blk:bg-gray-700 ${i === 0 ? '' : 'ml-2'}`)}>
                      <div className={tailwind('flex-shrink flex-grow-0 truncate text-sm text-gray-600 blk:text-gray-300')}>{value.displayName}</div>
                      <button onClick={() => onTagValueDeselect(value)} className={tailwind('group ml-1 flex-shrink-0 flex-grow-0 items-center justify-center rounded-full py-1.5 pr-1.5 focus:outline-none')} type="button">
                        <svg className={tailwind('h-5 w-5 cursor-pointer rounded-full text-gray-400 group-hover:text-gray-500 group-focus:ring blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>}
              {linkEditor.tagMsg && <p className={tailwind('py-2 text-sm text-red-500')}>{linkEditor.tagMsg}</p>}
              <div className={tailwind(`flex items-center justify-start ${linkEditor.tagMsg ? '' : 'pt-5'}`)}>
                <label htmlFor="new-tag-input" className={tailwind('sr-only')}>Add a new tag</label>
                <input onChange={onTagDnInputChange} onKeyDown={onTagDnInputKeyPress} className={tailwind('block w-full flex-1 rounded-full border border-gray-400 bg-white px-3.5 py-1.25 text-sm text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500/50 blk:border-gray-500 blk:bg-gray-800 blk:text-gray-200 blk:placeholder:text-gray-400 blk:focus:border-transparent')} placeholder="Add a new tag" value={linkEditor.tagDisplayName} id="new-tag-input" name="new-tag-input" type="text" />
                <button onClick={onTagAddBtnClick} className={tailwind('group ml-2 flex flex-shrink-0 flex-grow-0 items-center rounded-full border border-gray-400 bg-white py-1.25 pl-1.5 pr-2.5 hover:border-gray-500 focus:outline-none focus:ring blk:border-gray-500 blk:bg-gray-800 blk:hover:border-gray-400')} type="button">
                  <svg className={tailwind('h-4 w-4 text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-100')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  <span className={tailwind('text-sm text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')}>Add</span>
                </button>
              </div>
              {linkEditor.tagHints.length > 0 && <div className={tailwind('flex flex-wrap items-center justify-start pt-4')}>
                <div className={tailwind('mb-2 text-sm text-gray-500 blk:text-gray-400')}>Hint:</div>
                {linkEditor.tagHints.map(hint => {
                  return (
                    <button key={`TagEditorHint-${hint.tagName}`} onClick={() => onTagHintSelect(hint)} className={tailwind(`group ml-2 mb-2 block max-w-full rounded-full bg-gray-100 px-3 py-1.5 focus:outline-none focus:ring blk:bg-gray-700 ${hint.isBlur ? '' : 'hover:bg-gray-200 blk:hover:bg-gray-600'}`)} type="button" disabled={hint.isBlur}>
                      <div className={tailwind(`truncate text-sm ${hint.isBlur ? 'text-gray-400 blk:text-gray-500' : 'text-gray-600 group-hover:text-gray-700 blk:text-gray-300 blk:group-hover:text-gray-100'}`)}>{hint.displayName}</div>
                    </button>
                  );
                })}
              </div>}
            </div>
          </div>
        </div>}
        {linkEditor.msg !== '' && <p className={tailwind('pt-3 text-sm text-red-500')}>{linkEditor.msg}</p>}
        <div className={tailwind(`${linkEditor.msg !== '' ? 'pt-3' : 'pt-5'}`)}>
          <button onClick={onAddOkBtnClick} style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }} className={tailwind('rounded-full bg-gray-800 px-4 text-sm font-medium text-gray-50 hover:bg-gray-900 focus:outline-none focus:ring blk:bg-gray-100 blk:text-gray-800 blk:hover:bg-white')}>{linkEditor.isAskingConfirm ? 'Sure' : 'Save'}</button>
          <button onClick={onAddCancelBtnClick} className={tailwind('ml-2 rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset blk:text-gray-300 blk:hover:bg-gray-700')}>Cancel</button>
        </div>
      </>
    );
  }

  const popupClassNames = 'fixed z-31 w-96 overflow-auto rounded-lg bg-white px-4 pt-6 pb-5 shadow-xl ring-1 ring-black/5 blk:bg-gray-800 blk:ring-white/25';

  let panel;
  if (popupSize) {
    const maxHeight = safeAreaHeight - 16;
    const posStyle = computePositionStyle(
      anchorPosition,
      {
        width: popupSize.width,
        height: Math.min(popupSize.height, maxHeight),
      },
      { width: safeAreaWidth, height: safeAreaHeight },
      null,
      insets,
      8,
    );
    const popupStyle = { ...posStyle, maxHeight };

    panel = (
      <motion.div key="TopBarAddPopup_addPopup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
        {renderContent()}
      </motion.div>
    );
  } else {
    panel = (
      <div key="TopBarAddPopup_addPopup" ref={popup} style={{ top: safeAreaHeight + 256, left: safeAreaWidth + 256 }} className={tailwind(popupClassNames)}>
        {renderContent()}
      </div>
    );
  }

  return (
    <AnimatePresence key="AnimatePresence_TopBarAddPopup">
      <motion.button key="TopBarAddPopup_cancelBtn" onClick={onAddCancelBtnClick} tabIndex={-1} className={tailwind('fixed inset-0 z-30 h-full w-full cursor-default bg-black/25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(TopBarAddPopup);
