import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopup, updateBulkEdit } from '../actions';
import { updateTagEditor, addTagEditorTagName, updateTagData } from '../actions/chunk';
import {
  TAG_EDITOR_POPUP, TAGGED, ADD_TAGS, MANAGE_TAGS, NOT_SUPPORTED,
} from '../types/const';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';

const TagEditorPopup = () => {
  // Use windowHeight to move along with a virtual keyboard.
  const { windowHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isTagEditorPopupShown);
  const tagEditor = useSelector(state => state.tagEditor);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onPopupCloseBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(TAG_EDITOR_POPUP, false));
    didClick.current = true;
  };

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
    dispatch(updateTagEditor(null, null, e.target.value, null, ''));
  };

  const onDnInputKeyPress = (e) => {
    if (e.key === 'Enter') onAddBtnClick();
  };

  const onAddBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;

    const { values, hints, displayName, color } = tagEditor;
    dispatch(addTagEditorTagName(values, hints, displayName, color));
  };

  useEffect(() => {
    if (isShown) didClick.current = false;
  }, [isShown, tagEditor]);

  if (!isShown) return <AnimatePresence key="AnimatePresence_TEP" />;

  const panelHeight = Math.min(480, windowHeight * 0.9);

  if (tagEditor.mode === NOT_SUPPORTED) {
    return (
      <AnimatePresence key="AnimatePresence_TEP">
        <div className={tailwind('fixed inset-0 z-30 overflow-hidden')}>
          <div className={tailwind('flex items-start justify-center p-4')} style={{ minHeight: windowHeight }}>
            <div className={tailwind('fixed inset-0')}>
              <motion.button onClick={onPopupCloseBtnClick} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
            </div>
            <motion.div className={tailwind('mt-14 w-full max-w-[25rem] overflow-hidden rounded-lg bg-yellow-50 shadow-lg md:mt-2.5')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
              <div className={tailwind('relative overflow-hidden rounded-lg bg-yellow-50 p-4')} style={{ maxHeight: panelHeight }}>
                <div className={tailwind('flex')}>
                  <div className={tailwind('flex-shrink-0')}>
                    <svg className={tailwind('h-6 w-6 text-yellow-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className={tailwind('ml-3 lg:mt-0.5')}>
                    <h3 className={tailwind('text-left text-base font-medium text-yellow-800 lg:text-sm')}>Only the same tags are supported.</h3>
                    <p className={tailwind('mt-2.5 text-sm text-yellow-700')}>Please select items with the same tags to be bulk-edited.</p>
                  </div>
                </div>
                <button onClick={onPopupCloseBtnClick} className={tailwind('absolute top-1 right-1 rounded-md bg-yellow-50 p-1 hover:bg-yellow-100 focus:bg-yellow-100 focus:outline-none')} type="button">
                  <span className={tailwind('sr-only')}>Dismiss</span>
                  <svg className={tailwind('h-5 w-5 text-yellow-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div >
      </AnimatePresence>
    );
  }

  let title = 'Tags';
  let desc = (
    <React.Fragment>Enter a new tag and press the Add button.</React.Fragment>
  );
  if (tagEditor.mode === null) {
    title = ADD_TAGS;
    if (tagEditor.hints.length === 0) {
      desc = (
        <React.Fragment>Enter a new tag and press the Add button.<br />After finishing, choose save.</React.Fragment>
      );
    } else {
      desc = (
        <React.Fragment>Enter a new tag and press the Add button,<br />or select from the hint below.</React.Fragment>
      );
    }
  } else if (tagEditor.mode === TAGGED) {
    title = MANAGE_TAGS;
    if (tagEditor.hints.length === 0) {
      desc = (
        <React.Fragment>No tag for this link. Enter a new one and press <br className={tailwind('hidden sm:inline')} />the Add button.</React.Fragment>
      );
    } else {
      desc = (
        <React.Fragment>No tag for this link. Enter a new one, <br className={tailwind('sm:hidden')} />or select from the hint below.</React.Fragment>
      );
    }
  }

  return (
    <AnimatePresence key="AnimatePresence_TEP">
      <div className={tailwind('fixed inset-0 z-30 overflow-hidden')}>
        <div className={tailwind('flex items-center justify-center p-4')} style={{ minHeight: windowHeight }}>
          <div className={tailwind('fixed inset-0')}>
            {/* No cancel on background of TagEditorPopup */}
            <motion.button className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <motion.div className={tailwind('w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-1 blk:ring-white blk:ring-opacity-25 lg:mb-20')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div className={tailwind('relative flex flex-col overflow-hidden rounded-lg bg-white blk:bg-gray-800')} style={{ maxHeight: panelHeight }}>
              <div className={tailwind('relative flex-1 overflow-y-auto overflow-x-hidden px-4 pt-8 pb-4 sm:px-6 sm:pb-6')}>
                <h2 className={tailwind('text-left text-xl font-semibold text-gray-800 blk:text-gray-100')}>{title}</h2>
                {tagEditor.values.length === 0 && <div className={tailwind('pt-4')}>
                  <p className={tailwind('text-sm leading-6 text-gray-500 blk:text-gray-400')}>{desc}</p>
                </div>}
                {tagEditor.values.length > 0 && <div className={tailwind('flex min-h-[4rem] flex-wrap items-center justify-start pt-5')}>
                  {tagEditor.values.map((value, i) => {
                    return (
                      <div key={`TagEditorValue-${value.tagName}`} className={tailwind(`mb-2 flex max-w-full items-center justify-start rounded-full bg-gray-100 pl-3 blk:bg-gray-700 ${i === 0 ? '' : 'ml-2'}`)}>
                        <div className={tailwind('flex-shrink flex-grow-0 truncate text-sm text-gray-600 blk:text-gray-300')}>{value.displayName}</div>
                        <button onClick={() => onValueDeselect(value)} className={tailwind('group ml-1 flex-shrink-0 flex-grow-0 items-center justify-center rounded-full py-1.5 pr-1.5 focus:outline-none')} type="button">
                          <svg className={tailwind('h-5 w-5 cursor-pointer rounded-full text-gray-400 group-hover:text-gray-500 group-focus:ring blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>}
                {tagEditor.msg && <p className={tailwind('py-2 text-sm text-red-500')}>{tagEditor.msg}</p>}
                <div className={tailwind(`flex items-center justify-start ${tagEditor.msg ? '' : 'pt-5'}`)}>
                  <label htmlFor="new-tag-input" className={tailwind('sr-only')}>Add a new tag</label>
                  <input onChange={onDnInputChange} onKeyDown={onDnInputKeyPress} className={tailwind('block w-full flex-1 rounded-full border border-gray-400 bg-white px-3.5 py-[0.3125rem] text-sm text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-500 blk:bg-gray-800 blk:text-gray-200 blk:placeholder:text-gray-400 blk:focus:border-transparent')} placeholder="Add a new tag" value={tagEditor.displayName} id="new-tag-input" name="new-tag-input" type="text" />
                  <button onClick={onAddBtnClick} className={tailwind('group ml-2 flex flex-shrink-0 flex-grow-0 items-center rounded-full border border-gray-400 bg-white py-[0.3125rem] pl-1.5 pr-2.5 hover:border-gray-500 focus:outline-none focus:ring blk:border-gray-500 blk:bg-gray-800 blk:hover:border-gray-400')} type="button">
                    <svg className={tailwind('h-4 w-4 text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-100')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    <span className={tailwind('text-sm text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')}>Add</span>
                  </button>
                </div>
                {tagEditor.hints.length > 0 && <div className={tailwind('flex flex-wrap items-center justify-start pt-4')}>
                  <div className={tailwind('mb-2 text-sm text-gray-500 blk:text-gray-400')}>Hint:</div>
                  {tagEditor.hints.map(hint => {
                    return (
                      <button key={`TagEditorHint-${hint.tagName}`} onClick={() => onHintSelect(hint)} className={tailwind(`group ml-2 mb-2 block max-w-full rounded-full bg-gray-100 px-3 py-1.5 focus:outline-none focus:ring blk:bg-gray-700 ${hint.isBlur ? '' : 'hover:bg-gray-200 blk:hover:bg-gray-600'}`)} type="button" disabled={hint.isBlur}>
                        <div className={tailwind(`truncate text-sm ${hint.isBlur ? 'text-gray-400 blk:text-gray-500' : 'text-gray-600 group-hover:text-gray-700 blk:text-gray-300 blk:group-hover:text-gray-100'}`)}>{hint.displayName}</div>
                      </button>
                    );
                  })}
                </div>}
                <div className={tailwind('mt-6 border-t border-gray-200 pt-3.5 blk:border-gray-600 sm:pt-5')}>
                  <button onClick={onSaveBtnClick} style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }} className={tailwind('rounded-full bg-gray-800 px-4 text-sm font-medium text-gray-50 hover:bg-gray-900 focus:outline-none focus:ring blk:bg-gray-100 blk:text-gray-800 blk:hover:bg-white')} type="button">Save</button>
                  <button onClick={onPopupCloseBtnClick} className={tailwind('ml-2 rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset blk:text-gray-300 blk:hover:bg-gray-700')} type="button">Cancel</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div >
    </AnimatePresence>
  );
};

export default React.memo(TagEditorPopup);
