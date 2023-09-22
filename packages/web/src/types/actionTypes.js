export const INIT = 'INIT';

export const UPDATE_WINDOW = 'UPDATE_WINDOW';
export const UPDATE_HREF = 'UPDATE_HREF';
export const UPDATE_HISTORY_POSITION = 'UPDATE_HISTORY_POSITION';
export const UPDATE_WINDOW_SIZE = 'UPDATE_WINDOW_SIZE';
export const UPDATE_VISUAL_SIZE = 'UPDATE_VISUAL_SIZE';
export const UPDATE_HANDLING_SIGN_IN = 'UPDATE_HANDLING_SIGN_IN';
export const UPDATE_STACKS_ACCESS = 'UPDATE_STACKS_ACCESS';
export const UPDATE_USER = 'UPDATE_USER';
export const UPDATE_LIST_NAME = 'UPDATE_LIST_NAME';
export const UPDATE_QUERY_STRING = 'UPDATE_QUERY_STRING';
export const UPDATE_SEARCH_STRING = 'UPDATE_SEARCH_STRING';
export const UPDATE_POPUP = 'UPDATE_POPUP';
export const UPDATE_BULK_EDITING = 'UPDATE_BULK_EDITING';
export const UPDATE_LINK_EDITOR = 'UPDATE_LINK_EDITOR';

export const ADD_SELECTED_LINK_IDS = 'ADD_SELECTED_LINK_IDS';
export const DELETE_SELECTED_LINK_IDS = 'DELETE_SELECTED_LINK_IDS';

export const FETCH = 'FETCH';
export const FETCH_COMMIT = 'FETCH_COMMIT';
export const FETCH_ROLLBACK = 'FETCH_ROLLBACK';

export const CACHE_FETCHED = 'CACHE_FETCHED';
export const UPDATE_FETCHED = 'UPDATE_FETCHED';

export const FETCH_MORE = 'FETCH_MORE';
export const FETCH_MORE_COMMIT = 'FETCH_MORE_COMMIT';
export const FETCH_MORE_ROLLBACK = 'FETCH_MORE_ROLLBACK';

export const CACHE_FETCHED_MORE = 'CACHE_FETCHED_MORE';
export const UPDATE_FETCHED_MORE = 'UPDATE_FETCHED_MORE';

export const REFRESH_FETCHED = 'REFRESH_FETCHED';

export const ADD_FETCHING_INFO = 'ADD_FETCHING_INFO';
export const DELETE_FETCHING_INFO = 'DELETE_FETCHING_INFO';

export const SET_SHOWING_LINK_IDS = 'SET_SHOWING_LINK_IDS';

export const ADD_LINKS = 'ADD_LINKS';
export const ADD_LINKS_COMMIT = 'ADD_LINKS_COMMIT';
export const ADD_LINKS_ROLLBACK = 'ADD_LINKS_ROLLBACK';

export const UPDATE_LINKS = 'UPDATE_LINKS';

export const DELETE_LINKS = 'DELETE_LINKS';
export const DELETE_LINKS_COMMIT = 'DELETE_LINKS_COMMIT';
export const DELETE_LINKS_ROLLBACK = 'DELETE_LINKS_ROLLBACK';

export const MOVE_LINKS_ADD_STEP = 'MOVE_LINKS_ADD_STEP';
export const MOVE_LINKS_ADD_STEP_COMMIT = 'MOVE_LINKS_ADD_STEP_COMMIT';
export const MOVE_LINKS_ADD_STEP_ROLLBACK = 'MOVE_LINKS_ADD_STEP_ROLLBACK';
export const MOVE_LINKS_DELETE_STEP = 'MOVE_LINKS_DELETE_STEP';
export const MOVE_LINKS_DELETE_STEP_COMMIT = 'MOVE_LINKS_DELETE_STEP_COMMIT';
export const MOVE_LINKS_DELETE_STEP_ROLLBACK = 'MOVE_LINKS_DELETE_STEP_ROLLBACK';

export const CANCEL_DIED_LINKS = 'CANCEL_DIED_LINKS';

export const DELETE_OLD_LINKS_IN_TRASH = 'DELETE_OLD_LINKS_IN_TRASH';
export const DELETE_OLD_LINKS_IN_TRASH_COMMIT = 'DELETE_OLD_LINKS_IN_TRASH_COMMIT';
export const DELETE_OLD_LINKS_IN_TRASH_ROLLBACK = 'DELETE_OLD_LINKS_IN_TRASH_ROLLBACK';

export const EXTRACT_CONTENTS = 'EXTRACT_CONTENTS';
export const EXTRACT_CONTENTS_COMMIT = 'EXTRACT_CONTENTS_COMMIT';
export const EXTRACT_CONTENTS_ROLLBACK = 'EXTRACT_CONTENTS_ROLLBACK';

export const UPDATE_EXTRACTED_CONTENTS = 'UPDATE_EXTRACTED_CONTENTS';

export const UPDATE_STATUS = 'UPDATE_STATUS';

export const UPDATE_SELECTING_LINK_ID = 'UPDATE_SELECTING_LINK_ID';

export const UPDATE_LIST_NAME_EDITORS = 'UPDATE_LIST_NAME_EDITORS';

export const ADD_LIST_NAMES = 'ADD_LIST_NAMES';
export const UPDATE_LIST_NAMES = 'UPDATE_LIST_NAMES';
export const MOVE_LIST_NAME = 'MOVE_LIST_NAME';
export const MOVE_TO_LIST_NAME = 'MOVE_TO_LIST_NAME';
export const DELETE_LIST_NAMES = 'DELETE_LIST_NAMES';

export const UPDATE_SELECTING_LIST_NAME = 'UPDATE_SELECTING_LIST_NAME';
export const UPDATE_DELETING_LIST_NAME = 'UPDATE_DELETING_LIST_NAME';

export const UPDATE_DO_EXTRACT_CONTENTS = 'UPDATE_DO_EXTRACT_CONTENTS';
export const UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH = 'UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH';
export const UPDATE_DO_DESCENDING_ORDER = 'UPDATE_DO_DESCENDING_ORDER';

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
export const UPDATE_SETTINGS_COMMIT = 'UPDATE_SETTINGS_COMMIT';
export const UPDATE_SETTINGS_ROLLBACK = 'UPDATE_SETTINGS_ROLLBACK';

export const CANCEL_DIED_SETTINGS = 'CANCEL_DIED_SETTINGS';

export const MERGE_SETTINGS = 'MERGE_SETTINGS';
export const MERGE_SETTINGS_COMMIT = 'MERGE_SETTINGS_COMMIT';
export const MERGE_SETTINGS_ROLLBACK = 'MERGE_SETTINGS_ROLLBACK';

export const UPDATE_INFO = 'UPDATE_INFO';
export const UPDATE_INFO_COMMIT = 'UPDATE_INFO_COMMIT';
export const UPDATE_INFO_ROLLBACK = 'UPDATE_INFO_ROLLBACK';

export const UPDATE_SETTINGS_VIEW_ID = 'UPDATE_SETTINGS_VIEW_ID';

export const UPDATE_DO_USE_LOCAL_LAYOUT = 'UPDATE_DO_USE_LOCAL_LAYOUT';
export const UPDATE_DEFAULT_LAYOUT_TYPE = 'UPDATE_DEFAULT_LAYOUT_TYPE';
export const UPDATE_LOCAL_LAYOUT_TYPE = 'UPDATE_LOCAL_LAYOUT_TYPE';

export const UPDATE_DELETE_ACTION = 'UPDATE_DELETE_ACTION';
export const UPDATE_DISCARD_ACTION = 'UPDATE_DISCARD_ACTION';

export const UPDATE_LIST_NAMES_MODE = 'UPDATE_LIST_NAMES_MODE';

export const GET_PRODUCTS = 'GET_PRODUCTS';
export const GET_PRODUCTS_COMMIT = 'GET_PRODUCTS_COMMIT';
export const GET_PRODUCTS_ROLLBACK = 'GET_PRODUCTS_ROLLBACK';

export const REQUEST_PURCHASE = 'REQUEST_PURCHASE';
export const REQUEST_PURCHASE_COMMIT = 'REQUEST_PURCHASE_COMMIT';
export const REQUEST_PURCHASE_ROLLBACK = 'REQUEST_PURCHASE_ROLLBACK';

export const RESTORE_PURCHASES = 'RESTORE_PURCHASES';
export const RESTORE_PURCHASES_COMMIT = 'RESTORE_PURCHASES_COMMIT';
export const RESTORE_PURCHASES_ROLLBACK = 'RESTORE_PURCHASES_ROLLBACK';

export const REFRESH_PURCHASES = 'REFRESH_PURCHASES';
export const REFRESH_PURCHASES_COMMIT = 'REFRESH_PURCHASES_COMMIT';
export const REFRESH_PURCHASES_ROLLBACK = 'REFRESH_PURCHASES_ROLLBACK';

export const UPDATE_IAP_PUBLIC_KEY = 'UPDATE_IAP_PUBLIC_KEY';
export const UPDATE_IAP_PRODUCT_STATUS = 'UPDATE_IAP_PRODUCT_STATUS';
export const UPDATE_IAP_PURCHASE_STATUS = 'UPDATE_IAP_PURCHASE_STATUS';
export const UPDATE_IAP_RESTORE_STATUS = 'UPDATE_IAP_RESTORE_STATUS';
export const UPDATE_IAP_REFRESH_STATUS = 'UPDATE_IAP_REFRESH_STATUS';

// Should end with 's', but forgot and afraid of backward incompatibility!
export const PIN_LINK = 'PIN_LINK';
export const PIN_LINK_COMMIT = 'PIN_LINK_COMMIT';
export const PIN_LINK_ROLLBACK = 'PIN_LINK_ROLLBACK';

export const UNPIN_LINK = 'UNPIN_LINK';
export const UNPIN_LINK_COMMIT = 'UNPIN_LINK_COMMIT';
export const UNPIN_LINK_ROLLBACK = 'UNPIN_LINK_ROLLBACK';

export const MOVE_PINNED_LINK_ADD_STEP = 'MOVE_PINNED_LINK_ADD_STEP';
export const MOVE_PINNED_LINK_ADD_STEP_COMMIT = 'MOVE_PINNED_LINK_ADD_STEP_COMMIT';
export const MOVE_PINNED_LINK_ADD_STEP_ROLLBACK = 'MOVE_PINNED_LINK_ADD_STEP_ROLLBACK';
export const MOVE_PINNED_LINK_DELETE_STEP = 'MOVE_PINNED_LINK_DELETE_STEP';
export const MOVE_PINNED_LINK_DELETE_STEP_COMMIT = 'MOVE_PINNED_LINK_DELETE_STEP_COMMIT';
export const MOVE_PINNED_LINK_DELETE_STEP_ROLLBACK = 'MOVE_PINNED_LINK_DELETE_STEP_ROLLBACK';

export const CANCEL_DIED_PINS = 'CANCEL_DIED_PINS';

export const UPDATE_SYSTEM_THEME_MODE = 'UPDATE_SYSTEM_THEME_MODE';
export const UPDATE_DO_USE_LOCAL_THEME = 'UPDATE_DO_USE_LOCAL_THEME';
export const UPDATE_DEFAULT_THEME = 'UPDATE_DEFAULT_THEME';
export const UPDATE_LOCAL_THEME = 'UPDATE_LOCAL_THEME';
export const UPDATE_UPDATING_THEME_MODE = 'UPDATE_UPDATING_THEME_MODE';
export const UPDATE_TIME_PICK = 'UPDATE_TIME_PICK';
export const UPDATE_IS_24H_FORMAT = 'UPDATE_IS_24H_FORMAT';

export const UPDATE_CUSTOM_EDITOR = 'UPDATE_CUSTOM_EDITOR';
export const UPDATE_IMAGES = 'UPDATE_IMAGES';

export const UPDATE_CUSTOM_DATA = 'UPDATE_CUSTOM_DATA';
export const UPDATE_CUSTOM_DATA_COMMIT = 'UPDATE_CUSTOM_DATA_COMMIT';
export const UPDATE_CUSTOM_DATA_ROLLBACK = 'UPDATE_CUSTOM_DATA_ROLLBACK';

export const CLEAN_UP_STATIC_FILES = 'CLEAN_UP_STATIC_FILES';
export const CLEAN_UP_STATIC_FILES_COMMIT = 'CLEAN_UP_STATIC_FILES_COMMIT';
export const CLEAN_UP_STATIC_FILES_ROLLBACK = 'CLEAN_UP_STATIC_FILES_ROLLBACK';

export const UPDATE_PAYWALL_FEATURE = 'UPDATE_PAYWALL_FEATURE';

export const UPDATE_LOCK_ACTION = 'UPDATE_LOCK_ACTION';
export const UPDATE_LOCK_EDITOR = 'UPDATE_LOCK_EDITOR';

export const ADD_LOCK_LIST = 'ADD_LOCK_LIST';
export const REMOVE_LOCK_LIST = 'REMOVE_LOCK_LIST';
export const LOCK_LIST = 'LOCK_LIST';
export const UNLOCK_LIST = 'UNLOCK_LIST';

export const CLEAN_UP_LOCKS = 'CLEAN_UP_LOCKS';

export const UPDATE_LOCKS_FOR_ACTIVE_APP = 'UPDATE_LOCKS_FOR_ACTIVE_APP';
export const UPDATE_LOCKS_FOR_INACTIVE_APP = 'UPDATE_LOCKS_FOR_INACTIVE_APP';

export const UPDATE_TAG_EDITOR = 'UPDATE_TAG_EDITOR';

export const UPDATE_TAG_DATA = 'UPDATE_TAG_DATA';
export const UPDATE_TAG_DATA_COMMIT = 'UPDATE_TAG_DATA_COMMIT';
export const UPDATE_TAG_DATA_ROLLBACK = 'UPDATE_TAG_DATA_ROLLBACK';

export const CANCEL_DIED_TAGS = 'CANCEL_DIED_TAGS';

export const UPDATE_TAG_NAME_EDITORS = 'UPDATE_TAG_NAME_EDITORS';

export const ADD_TAG_NAMES = 'ADD_TAG_NAMES';
export const UPDATE_TAG_NAMES = 'UPDATE_TAG_NAMES';
export const MOVE_TAG_NAME = 'MOVE_TAG_NAME';
export const DELETE_TAG_NAMES = 'DELETE_TAG_NAMES';

export const UPDATE_IMPORT_ALL_DATA_PROGRESS = 'UPDATE_IMPORT_ALL_DATA_PROGRESS';
export const UPDATE_EXPORT_ALL_DATA_PROGRESS = 'UPDATE_EXPORT_ALL_DATA_PROGRESS';
export const UPDATE_DELETE_ALL_DATA_PROGRESS = 'UPDATE_DELETE_ALL_DATA_PROGRESS';

export const DELETE_ALL_DATA = 'DELETE_ALL_DATA';
export const RESET_STATE = 'RESET_STATE';

export const UPDATE_MIGRATE_HUB_STATE = 'UPDATE_MIGRATE_HUB_STATE';
