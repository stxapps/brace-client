import {
  MY_LIST, TRASH, ARCHIVE, MODE_VIEW, LAYOUT_CARD, WHT_MODE, BLK_MODE, ADD_MODE_BASIC,
} from '../types/const';

export const myListListNameObj = { listName: MY_LIST, displayName: MY_LIST };
export const trashListNameObj = { listName: TRASH, displayName: TRASH };
export const archiveListNameObj = { listName: ARCHIVE, displayName: ARCHIVE };

export const whtModeThemeCustomOptions = { mode: WHT_MODE, startTime: '06:00' };
export const blkModeThemeCustomOptions = { mode: BLK_MODE, startTime: '18:00' };

export const initialSettingsState = {
  defaultListName: MY_LIST,
  doEncrypt: true,
  doExtractContents: true,
  doDeleteOldLinksInTrash: true,
  doDescendingOrder: true,
  doRemoveAfterClick: false,
  doExitBulkEditAfterAction: true,
  listNameMap: [
    { ...myListListNameObj }, { ...trashListNameObj }, { ...archiveListNameObj },
  ],
  tagNameMap: [],
  purchases: null, // No need anymore but keep it for comparing
  checkPurchasesDT: null, // No need anymore but keep it for comparing
  layoutType: LAYOUT_CARD,
  themeMode: WHT_MODE,
  themeCustomOptions: [
    { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
  ],
  addMode: ADD_MODE_BASIC,
};

export const initialLocalSettingsState = {
  doUseLocalLayout: false,
  layoutType: LAYOUT_CARD,
  doUseLocalTheme: false,
  themeMode: WHT_MODE,
  themeCustomOptions: [
    { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
  ],
  doUseLocalAddMode: false,
  addMode: ADD_MODE_BASIC,
  cleanUpStaticFilesDT: null,
  signInDT: null,
};

export const initialInfoState = {
  purchases: null, // an array with elements as purchase objs
  checkPurchasesDT: null,
};

export const initialLinkEditorState = {
  mode: null,
  url: '',
  msg: '',
  isAskingConfirm: false,
  listName: null,
  tagValues: [], // [{ tagName, displayName, color }, ...]
  tagHints: [], // [{ tagName, displayName, color, isShown }, ...]
  tagDisplayName: '',
  tagColor: '',
  tagMsg: '',
  addingType: null,
  addingParam: null,
  urlValidatedResult: null,
};

export const initialListNameEditorState = {
  mode: MODE_VIEW,
  value: '',
  msg: '',
  isCheckingCanDelete: false,
  doExpand: false,
  focusCount: 0,
  blurCount: 0,
};

export const initialLockSettingsState = {
  lockedLists: {},
};

export const initialTagEditorState = {
  ids: null,
  mode: null,
  values: [], // [{ tagName, displayName, color }, ...]
  hints: [], // [{ tagName, displayName, color, isShown }, ...]
  displayName: '',
  color: '',
  msg: '',
};

export const initialTagNameEditorState = {
  mode: MODE_VIEW,
  value: '',
  color: '',
  msg: '',
  isCheckingCanDelete: false,
  focusCount: 0,
  blurCount: 0,
};
