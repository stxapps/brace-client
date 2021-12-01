import { MY_LIST, TRASH, ARCHIVE, MODE_VIEW } from '../types/const';

export const initialSettingsState = {
  defaultListName: MY_LIST,
  doEncrypt: true,
  doExtractContents: true,
  doDeleteOldLinksInTrash: true,
  doDescendingOrder: true,
  doRemoveAfterClick: false,
  doExitBulkEditAfterAction: true,
  listNameMap: [
    { listName: MY_LIST, displayName: MY_LIST },
    { listName: TRASH, displayName: TRASH },
    { listName: ARCHIVE, displayName: ARCHIVE },
  ],
};

export const initialListNameEditorState = {
  mode: MODE_VIEW,
  value: '',
  msg: '',
  isCheckingCanDelete: false,
  doExpand: false,
  focusCount: 0,
};
