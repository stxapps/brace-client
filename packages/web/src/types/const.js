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

export const COLORS = ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink'];
export const COLOR_WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
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
