export const DOMAIN_NAME = 'brace.to';

export const APP_NAME = 'Brace';
export const APP_ICON_NAME = 'logo192.png';

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
export const N_DAYS = 45;

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

export const BAR_HEIGHT = '3.5rem';

export const VALID_URL = 'VALID_URL';
export const NO_URL = 'NO_URL';
export const ASK_CONFIRM_URL = 'ASK_CONFIRM_URL';

export const URL_MSGS = {
  [VALID_URL]: '',
  [NO_URL]: 'Please fill in a link you want to save in the textbox.',
  [ASK_CONFIRM_URL]: 'Looks like an invalid link. Are you sure?',
};
