import { MY_LIST, TRASH, ARCHIVE, MODE_VIEW } from '../types/const';

export const myListListNameObj = { listName: MY_LIST, displayName: MY_LIST };
export const trashListNameObj = { listName: TRASH, displayName: TRASH };
export const archiveListNameObj = { listName: ARCHIVE, displayName: ARCHIVE };

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
};
