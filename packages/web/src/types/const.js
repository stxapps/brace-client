export const DOMAIN_NAME = 'brace.to';

export const APP_NAME = 'Brace';
export const APP_ICON_URL = process.env.NODE_ENV === 'production' ? 'https://brace.to/logo192.png' : 'http://localhost:3000/logo192.png';

export const BACK_DECIDER = 'BACK_DECIDER';
export const BACK_POPUP = 'BACK_POPUP';

export const ALL = 'ALL';
export const ADD_POPUP = 'ADD_POPUP';
export const SEARCH_POPUP = 'SEARCH_POPUP';
export const PROFILE_POPUP = 'PROFILE_POPUP';
export const LIST_NAME_POPUP = 'LIST_NAME_POPUP';
export const CONFIRM_DELETE_POPUP = 'CONFIRM_DELETE_POPUP';

export const IS_POPUP_SHOWN = 'isPopupShown';
export const POPUP_ANCHOR_POSITION = 'popupAnchorPosition';

export const SETTINGS_FNAME = 'settings.json';

export const PUT_FILE = 'PUT_FILE';
export const DELETE_FILE = 'DELETE_FILE';
export const GET_FILE = 'GET_FILE';

export const N_LINKS = 10;
export const MAX_TRY = 3;

export const MY_LIST = 'My List';
export const TRASH = 'Trash';
export const ARCHIVE = 'Archive';

export const ID = 'id';
export const STATUS = 'status';

export const ADDING = 'ADDING';
export const ADDED = 'ADDED';
export const MOVING = 'MOVING';
export const REMOVING = 'REMOVING';
export const DELETING = 'DELETING';
export const DIED_ADDING = 'DIED_ADDING';
export const DIED_MOVING = 'DIED_MOVING';
export const DIED_REMOVING = 'DIED_REMOVING';
export const DIED_DELETING = 'DIED_DELETING';

export const OPEN = 'Open';
export const COPY_LINK = 'Copy link';
//export const ARCHIVE = 'Archive';
export const REMOVE = 'Remove';
export const RESTORE = 'Restore';
export const DELETE = 'Permanently delete';
export const MOVE_TO = 'Move to';

export const CARD_ITEM_POPUP_MENU = {
  [MY_LIST]: [OPEN, COPY_LINK, ARCHIVE, REMOVE, MOVE_TO],
  [TRASH]: [OPEN, COPY_LINK, RESTORE, DELETE],
  [ARCHIVE]: [OPEN, COPY_LINK, REMOVE, MOVE_TO],
};

export const HTTP = 'http://';
export const HTTPS = 'https://';
export const WWW = 'www.';

export const PC_100 = '100%';
export const PC_50 = '50%';
export const PC_33 = '33.33333%';
