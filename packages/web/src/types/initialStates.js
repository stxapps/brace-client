import {
  MY_LIST, TRASH, ARCHIVE, MODE_VIEW, LAYOUT_CARD, WHT_MODE, BLK_MODE,
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
  purchases: null, // No need anymore but keep it for comparing
  checkPurchasesDT: null, // No need anymore but keep it for comparing
  layoutType: LAYOUT_CARD,
  themeMode: WHT_MODE,
  themeCustomOptions: [
    { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
  ],
};

export const initialLocalSettingsState = {
  doUseLocalLayout: false,
  layoutType: LAYOUT_CARD,
  doUseLocalTheme: false,
  themeMode: WHT_MODE,
  themeCustomOptions: [
    { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
  ],
  cleanUpStaticFilesDT: null,
};

export const initialInfoState = {
  purchases: null, // an array with elements as purchase objs
  checkPurchasesDT: null,
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
