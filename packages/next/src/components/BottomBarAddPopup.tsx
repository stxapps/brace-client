import React, { useEffect, useRef } from 'react';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  updateAddPopup, updateLinkEditor, addLink, updateSelectingListName,
  updateListNamesMode,
} from '../actions/chunk';
import {
  LIST_NAMES_POPUP, LIST_NAMES_MODE_ADD_LINK, LIST_NAMES_ANIM_TYPE_BMODAL,
  ADD_MODE_BASIC, ADD_MODE_ADVANCED,
} from '../types/const';
import { isFldStr, getListNameDisplayName } from '../utils';
import { selectHint, deselectValue, addTagName, renameKeys } from '../utils/tag';

import { useSafeAreaInsets, useTailwind } from '.';

const BottomBarAddPopup = () => {

  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isAddPopupShown);
  const linkEditor = useSelector(state => state.linkEditor);
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const addInput = useRef(null);
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
    dispatch(addLink());
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
    dispatch(updateSelectingListName(linkEditor.listName));
    dispatch(updateListNamesMode(
      LIST_NAMES_MODE_ADD_LINK, LIST_NAMES_ANIM_TYPE_BMODAL,
    ));

    const rect = e.currentTarget.getBoundingClientRect();
    dispatch(updatePopup(LIST_NAMES_POPUP, true, rect));
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
    if (isShown && addInput.current) addInput.current.focus();
  }, [isShown]);

  useEffect(() => {
    if (isShown) didClick.current = false;
  }, [isShown, linkEditor]);

  const renderContent = () => {
    let displayName = null;
    if (isFldStr(linkEditor.listName)) {
      displayName = getListNameDisplayName(linkEditor.listName, listNameMap);
    }

    let tagDesc = null;
    if (linkEditor.mode === ADD_MODE_ADVANCED) {
      if (linkEditor.tagHints.length === 0) {
        tagDesc = (
          <React.Fragment>Enter a new tag and press the Add button.</React.Fragment>
        );
      } else {
        tagDesc = (
          <React.Fragment>Enter a new tag or select from the hint.</React.Fragment>
        );
      }
    }

    return (
      <div className={tailwind('px-4 pt-6 pb-6')}>
        <div className={tailwind('flex')}>
          <span className={tailwind('inline-flex items-center text-sm text-gray-500 blk:text-gray-300')}>Url:</span>
          <div className={tailwind('ml-3 flex-1')}>
            <input ref={addInput} onChange={onAddInputChange} onKeyDown={onAddInputKeyPress} className={tailwind('w-full rounded-full border border-gray-400 bg-white px-3.5 py-1 text-base text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500/50 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 blk:placeholder:text-gray-400 blk:focus:border-transparent')} type="url" placeholder="https://" value={linkEditor.url} autoCapitalize="none" />
          </div>
        </div>
        <button onClick={onAdvancedBtnClick} className={tailwind('mt-5 -ml-2.5 flex items-center rounded-md text-sm text-gray-500 px-2.5 py-1.5 hover:text-gray-600 focus:outline-none focus-visible:ring blk:text-gray-300 blk:hover:text-gray-200')}>
          {linkEditor.mode !== ADD_MODE_ADVANCED && <svg className={tailwind('size-3')} viewBox="0 0 14 14" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1V7M7 7V13M7 7H13M7 7H1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
          {linkEditor.mode === ADD_MODE_ADVANCED && <svg className={tailwind('size-3')} viewBox="0 0 14 14" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 7H1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
          <span className={tailwind('ml-1')}>Advanced</span>
        </button>
        {linkEditor.mode === ADD_MODE_ADVANCED && <div className={tailwind('pt-3')}>
          <div className={tailwind('flex items-baseline')}>
            <span className={tailwind('inline-flex items-center w-12 flex-shrink-0 flex-grow-0 text-sm text-gray-500 blk:text-gray-300')}>List:</span>
            <button onClick={onListNameBtnClick} className={tailwind('flex min-w-0 items-center rounded-xs bg-white focus:outline-none focus:ring blk:bg-gray-900')}>
              <span className={tailwind('truncate text-base text-gray-700 blk:text-gray-100')}>{displayName}</span>
              <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-gray-600 blk:text-gray-100')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className={tailwind('flex pt-2')}>
            <div className={tailwind('inline-flex items-center flex-shrink-0 flex-grow-0 h-13 w-12')}>
              <p className={tailwind('text-sm text-gray-500 blk:text-gray-300')}>Tags:</p>
            </div>
            <div className={tailwind('flex-shrink flex-grow')}>
              {linkEditor.tagValues.length === 0 && <div className={tailwind('flex min-h-13 items-center justify-start')}>
                <p className={tailwind('text-sm text-gray-500 blk:text-gray-400')}>{tagDesc}</p>
              </div>}
              {linkEditor.tagValues.length > 0 && <div className={tailwind('flex min-h-13 flex-wrap items-center justify-start pt-2')}>
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
              {linkEditor.tagMsg && <p className={tailwind('text-sm text-red-500')}>{linkEditor.tagMsg}</p>}
              <div className={tailwind(`flex items-center justify-start ${linkEditor.tagMsg ? 'pt-0.5' : 'pt-1'}`)}>
                <label htmlFor="new-tag-input" className={tailwind('sr-only')}>Add a new tag</label>
                <input onChange={onTagDnInputChange} onKeyDown={onTagDnInputKeyPress} className={tailwind('block w-full flex-1 rounded-full border border-gray-400 bg-white px-3.5 py-1.25 text-sm text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500/50 blk:border-gray-500 blk:bg-gray-800 blk:text-gray-200 blk:placeholder:text-gray-400 blk:focus:border-transparent')} placeholder="Add a new tag" value={linkEditor.tagDisplayName} id="new-tag-input" name="new-tag-input" type="text" />
                <button onClick={onTagAddBtnClick} className={tailwind('group ml-2 flex flex-shrink-0 flex-grow-0 items-center rounded-full border border-gray-400 bg-white py-1.25 pl-1.5 pr-2.5 hover:border-gray-500 focus:outline-none focus:ring blk:border-gray-500 blk:bg-gray-800 blk:hover:border-gray-400')} type="button">
                  <svg className={tailwind('h-4 w-4 text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-100')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  <span className={tailwind('text-sm text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')}>Add</span>
                </button>
              </div>
              {linkEditor.tagHints.length > 0 && <div className={tailwind('flex flex-wrap items-center justify-start pt-3.5')}>
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
        {linkEditor.msg !== '' && <p className={tailwind('pt-4 text-sm text-red-500')}>{linkEditor.msg}</p>}
        <div className={tailwind(`${linkEditor.msg !== '' ? 'pt-2' : 'pt-5'}`)}>
          <button onClick={onAddOkBtnClick} style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }} className={tailwind('rounded-full bg-gray-800 px-4 text-sm font-medium text-gray-50 hover:bg-gray-900 focus:outline-none focus:ring blk:bg-gray-100 blk:text-gray-800 blk:hover:bg-white')}>{linkEditor.isAskingConfirm ? 'Sure' : 'Save'}</button>
          <button onClick={onAddCancelBtnClick} className={tailwind('ml-2 rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset blk:text-gray-300 blk:hover:bg-gray-700')}>Cancel</button>
        </div>
      </div>
    );
  };

  const popupStyle = {
    paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };

  return (
    <React.Fragment>
      <button onClick={onAddCancelBtnClick} tabIndex={-1} className={tailwind(`fixed inset-0 z-30 h-full w-full cursor-default bg-black/25 focus:outline-none ${!isShown ? 'hidden' : ''}`)} />
      <div style={popupStyle} className={tailwind(`fixed inset-x-0 bottom-0 z-31 transform rounded-t-lg bg-white shadow-xl ring-1 ring-black/5 blk:bg-gray-800 blk:ring-white/25 ${!isShown ? 'translate-y-full' : ''}`)}>
        {renderContent()}
      </div>
    </React.Fragment>
  );
};

export default React.memo(BottomBarAddPopup);
