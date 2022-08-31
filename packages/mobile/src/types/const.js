export const DOMAIN_NAME = 'https://brace.to';

export const APP_NAME = 'Brace.to';
export const APP_ICON_NAME = 'logo192.png';
export const APP_SCOPES = ['store_write'];
export const APP_URL_SCHEME = 'bracedotto';
export const APP_DOMAIN_NAME = 'bracedotto://app';
export const BLOCKSTACK_AUTH = '/blockstack-auth';

export const BACK_DECIDER = 'BACK_DECIDER';
export const BACK_POPUP = 'BACK_POPUP';

export const HASH_LANDING = '#landing';
export const HASH_LANDING_HOW = '#landing-how';
export const HASH_LANDING_MOBILE = '#landing-mobile';
export const HASH_ABOUT = '#about';
export const HASH_TERMS = '#terms';
export const HASH_PRIVACY = '#privacy';
export const HASH_SUPPORT = '#support';
export const HASH_BACK = '#back';

export const ALL = 'ALL';
export const SIGN_UP_POPUP = 'SIGN_UP_POPUP';
export const SIGN_IN_POPUP = 'SIGN_IN_POPUP';
export const ADD_POPUP = 'ADD_POPUP';
export const SEARCH_POPUP = 'SEARCH_POPUP';
export const PROFILE_POPUP = 'PROFILE_POPUP';
export const LIST_NAMES_POPUP = 'LIST_NAMES_POPUP';
export const PIN_MENU_POPUP = 'PIN_MENU_POPUP';
export const CONFIRM_DELETE_POPUP = 'CONFIRM_DELETE_POPUP';
export const SETTINGS_POPUP = 'SETTINGS_POPUP';
export const SETTINGS_LISTS_MENU_POPUP = 'SETTINGS_LISTS_MENU_POPUP';
export const TIME_PICK_POPUP = 'TIME_PICK_POPUP';
export const PAYWALL_POPUP = 'PAYWALL_POPUP';

export const IS_POPUP_SHOWN = 'isPopupShown';
export const POPUP_ANCHOR_POSITION = 'popupAnchorPosition';

export const LINKS = 'links';
export const SETTINGS = 'settings';
export const PINS = 'pins';
export const DOT_JSON = '.json';

export const N_LINKS = 10;
export const MAX_TRY = 3;
export const N_DAYS = 45;

export const MY_LIST = 'My List';
export const TRASH = 'Trash';
export const ARCHIVE = 'Archive';

export const ID = 'id';
export const STATUS = 'status';

export const ADDING = 'ADDING';
export const ADDED = 'ADDED';
export const MOVING = 'MOVING';
export const MOVED = 'MOVED';
export const REMOVING = 'REMOVING';
export const DELETING = 'DELETING';
export const UPDATING = 'UPDATING';
export const DIED_ADDING = 'DIED_ADDING';
export const DIED_MOVING = 'DIED_MOVING';
export const DIED_REMOVING = 'DIED_REMOVING';
export const DIED_DELETING = 'DIED_DELETING';
export const DIED_UPDATING = 'DIED_UPDATING';

export const COPY_LINK = 'Copy link';
//export const ARCHIVE = 'Archive';
export const REMOVE = 'Remove';
export const RESTORE = 'Restore';
export const DELETE = 'Permanently delete';
export const MOVE_TO = 'Move to';

export const CARD_ITEM_POPUP_MENU = {
  [MY_LIST]: [COPY_LINK, ARCHIVE, REMOVE, MOVE_TO],
  [TRASH]: [COPY_LINK, RESTORE, DELETE],
  [ARCHIVE]: [COPY_LINK, REMOVE, MOVE_TO],
};

export const HTTP = 'http://';
export const HTTPS = 'https://';
export const WWW = 'www.';

export const PC_100 = '100%';
export const PC_50 = '50%';
export const PC_33 = '33.33333%';

export const URL_QUERY_CLOSE_KEY = 'brace-dot-to-show-close';
export const URL_QUERY_CLOSE_WINDOW = 'window';
export const URL_QUERY_CLOSE_TAB = 'tab';

export const IMAGE = 'image';
export const COLOR = 'color';
export const PATTERN = 'pattern';

export const BG_COLOR_STYLES = ['bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900', 'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-900', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800', 'bg-orange-900', 'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-800', 'bg-yellow-900', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900', 'bg-teal-300', 'bg-teal-400', 'bg-teal-500', 'bg-teal-600', 'bg-teal-700', 'bg-teal-800', 'bg-teal-900', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900', 'bg-indigo-300', 'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700', 'bg-indigo-800', 'bg-indigo-900', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800', 'bg-purple-900', 'bg-pink-300', 'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-800', 'bg-pink-900', 'bg-purple-blockstack'];
export const PATTERNS = ['half-rombes', 'weave', 'starry-night', 'upholstery', 'marrakesh', 'rainbow-bokeh', 'carbon', 'hearts', 'argyle', 'steps', 'stars', 'bricks', 'japanese-cube', 'polka-dot', 'checkerboard', 'diagonal-checkerboard', 'tartan', 'madras', 'lined-paper', 'blueprint-grid', 'tablecloth', 'honeycomb', 'wave', 'chocolate-weave', 'cross-dots', 'miriam', 'ana-tudor-halftone', 'discount', 'blossom', 'ladybird', 'peep-holes', 'skulls', 'grannys-armchair', 'duchess', 'lawn', 'nightclub', 'chinese-lanterns', 'pumpkin-spice', 'feline', 'propeller', 'origami', 'shortbread-shake', 'fall', 'sea-wall', 'whispers', 'low-pressure', 'cyclone', 'water-trail', 'fishing-net', 'instrument-panel', 'spider-weave', 'echo-owl', 'sugar-lattice', 'copper-clasp', 'circulation', 'money-zoom', 'headstone', 'moth-bot', 'motor-warp', 'neon-mesh', 'ninja-star', 'braid', 'the-pond', 'segments', 'biohazard', 'phone-alert-system', 'life-buoy', 'lobby', 'target', 'confetti2', 'jam-sandwich', 'tennis', 'cobbles', 'bed-springs', 'linked', 'overlapping-shields', 'mystic-eye', 'lace', 'plant-cells', 'slashes', 'hollow-lemon', 'blood-cells', 'avocado', 'snag', 'bling-chunk', 'ocean', 'star-pips', 'bamboo', 'goldwork', 'interlock', 'knot-work', 'port-hole', 'terracotta-trace', 'purple-quartz', 'sort', 'nope', 'mermaid', 'rainbows', 'bones', 'villain-underpants', 'cumulus', 'quatrefoil', 'leaf', 'kitchen-tiles', 'medpack', 'lazy-triangle', 'isometric', 'googly-eyes', 'circles', 'fake-luggage', 'circle-grid', 'squares', 'blood-moon', 'pyramids', 'sharp-stars', 'confetti', 'dots', 'cat-toes', 'diamonds', 'trellis', 'orange-buzz', 'lemon-lime-gingham', 'lavender-lumberjack', 'vertical-stripes', 'diagonal-stripes', 'stripes'];

export const SHOW_BLANK = 'SHOW_BLANK';
export const SHOW_SIGN_IN = 'SHOW_SIGN_IN';
export const SHOW_COMMANDS = 'SHOW_COMMANDS';

export const TOP_HEADER_HEIGHT = '3.5rem';
export const TOP_LIST_NAME_HEIGHT = '1.75rem';
export const TOP_HEADER_LIST_NAME_SPACE = '1rem';
export const TOP_HEADER_LIST_NAME_SPACE_MD = '1.5rem';

/*
 *  HEADER + SPACE(_MD) + LIST_NAME
 *  In mobile, there is also border bottom 1 px but ignore it for now.
 */
export const TOP_BAR_HEIGHT = '6.25rem';
export const TOP_BAR_HEIGHT_MD = '6.75rem';

export const BOTTOM_BAR_HEIGHT = '3.5rem';
export const SEARCH_POPUP_HEIGHT = '3.625rem';

export const SHARE_BORDER_RADIUS = {
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  borderBottomRightRadius: 16,
  borderBottomLeftRadius: 16,
};

export const VALID_URL = 'VALID_URL';
export const NO_URL = 'NO_URL';
export const ASK_CONFIRM_URL = 'ASK_CONFIRM_URL';

export const URL_MSGS = {
  [VALID_URL]: '',
  [NO_URL]: 'Please fill in a link you want to save in the textbox.',
  [ASK_CONFIRM_URL]: 'Looks like an invalid link. Are you sure?',
};

export const BRACE_URL = 'https://brace-001.uc.r.appspot.com';
export const BRACE_EXTRACT_URL = BRACE_URL + '/extract';
export const BRACE_PRE_EXTRACT_URL = BRACE_URL + '/pre-extract';

export const EXTRACT_INIT = 'EXTRACT_INIT';
export const EXTRACT_OK = 'EXTRACT_OK';
export const EXTRACT_ERROR = 'EXTRACT_ERROR';
export const EXTRACT_INVALID_URL = 'EXTRACT_INVALID_URL';
export const EXTRACT_EXCEEDING_N_URLS = 'EXTRACT_EXCEEDING_N_URLS';

export const SM_WIDTH = 640;
export const MD_WIDTH = 768;
export const LG_WIDTH = 1024;
export const XL_WIDTH = 1280;

export const MAX_SELECTED_LINK_IDS = 10;

export const VALID_LIST_NAME = 'VALID_LIST_NAME';
export const NO_LIST_NAME = 'NO_LIST_NAME';
export const TOO_LONG_LIST_NAME = 'TOO_LONG_LIST_NAME';
export const DUPLICATE_LIST_NAME = 'DUPLICATE_LIST_NAME';
export const IN_USE_LIST_NAME = 'IN_USE_LIST_NAME';

export const SWAP_LEFT = 'SWAP_LEFT';
export const SWAP_RIGHT = 'SWAP_RIGHT';

export const MODAL_SUPPORTED_ORIENTATIONS = /** @type {any} */ (['portrait', 'landscape']);

export const ZERO = 'ZERO'; // top or left of the window
export const CENTER = 'CENTER'; // center of the window
export const EDGE = 'EDGE'; // bottom or right of the window
export const AT_TRIGGER = 'AT_TRIGGER'; // top or left of the trigger
export const EDGE_TRIGGER = 'EDGE_TRIGGER'; // bottom or right of the trigger

export const DELETE_ACTION_LINK_COMMANDS = 0;
export const DELETE_ACTION_LIST_NAME = 1;

export const APP_GROUP_SHARE = 'group.bracedotto.share';
export const APP_GROUP_SHARE_UKEY = 'uKey';

export const MODE_VIEW = 'MODE_VIEW';
export const MODE_EDIT = 'MODE_EDIT';

export const LAYOUT_CARD = 'LAYOUT_CARD';
export const LAYOUT_LIST = 'LAYOUT_LIST';

export const IAP_URL = 'https://iap-001.uc.r.appspot.com'; //'http://192.168.1.44:8088';
export const IAP_VERIFY_URL = IAP_URL + '/verify';
export const IAP_STATUS_URL = IAP_URL + '/status';

export const APPSTORE = 'AppStore';
export const PLAYSTORE = 'PlayStore';
export const COM_BRACEDOTTO = 'com.bracedotto';
export const COM_BRACEDOTTO_SUPPORTER = 'com.bracedotto.supporter';
export const SIGNED_TEST_STRING = 'Privacy Security UX';

export const VALID = 'VALID';
export const INVALID = 'INVALID';
export const UNKNOWN = 'UNKNOWN';
export const ERROR = 'ERROR';

export const ACTIVE = 'Active';
export const NO_RENEW = 'NoRenew';
export const GRACE = 'GracePeriod';
export const ON_HOLD = 'OnHold';
export const PAUSED = 'Paused';
export const EXPIRED = 'Expired';
//export const UNKNOWN = 'UNKNOWN';

export const PIN = 'Pin to the top';
export const MANAGE_PIN = 'Manage pin';
export const UNPIN = 'Unpin';
export const PIN_LEFT = 'Move pin forward';
export const PIN_RIGHT = 'Move pin backward';
export const PIN_UP = 'Move pin up';
export const PIN_DOWN = 'Move pin down';

export const PINNED = 'PINNED';

export const SETTINGS_VIEW_ACCOUNT = 1;
export const SETTINGS_VIEW_IAP = 9;
export const SETTINGS_VIEW_IAP_RESTORE = 10;
export const SETTINGS_VIEW_DATA = 2;
export const SETTINGS_VIEW_DATA_IMPORT = 7;
export const SETTINGS_VIEW_DATA_EXPORT = 3;
export const SETTINGS_VIEW_DATA_DELETE = 4;
export const SETTINGS_VIEW_LISTS = 5;
export const SETTINGS_VIEW_MISC = 6;
export const SETTINGS_VIEW_ABOUT = 8;

export const LIST_NAMES_MODE_CHANGE_LIST_NAME = 'LIST_NAMES_MODE_CHANGE_LIST_NAME';
export const LIST_NAMES_MODE_MOVE_LINKS = 'LIST_NAMES_MODE_MOVE_LINKS';
export const LIST_NAMES_MODE_MOVE_LIST_NAME = 'LIST_NAMES_MODE_MOVE_LIST_NAME';

export const LIST_NAMES_ANIM_TYPE_POPUP = 'LIST_NAMES_ANIM_TYPE_POPUP';
export const LIST_NAMES_ANIM_TYPE_BMODAL = 'LIST_NAMES_ANIM_TYPE_BMODAL';

export const WHT_MODE = 0;
export const BLK_MODE = 1;
export const SYSTEM_MODE = 2;
export const CUSTOM_MODE = 3;
