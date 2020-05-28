import image1 from '../images/card-item/silver-watch-newspaper-magazine-preview.jpg';
import image2 from '../images/card-item/black-and-white-electronic-device-cup-of-espresso-on-saucer-beside-spiral-note.jpg';
import image3 from '../images/card-item/silver-macbook-beside-white-smartphone.jpg';
import image4 from '../images/card-item/green-typewriter-beside-green-hardbound-book-and-book.jpg';
import image5 from '../images/card-item/cup-of-coffee-beside-gray-laptop-on-brown-wooden-desk.jpg';
import image6 from '../images/card-item/macbook-air-beside-white-ceramic-mug-on-brown-wooden-table.jpg';
import image7 from '../images/card-item/person-using-gray-laptop-computer.jpg';
import image8 from '../images/card-item/black-and-gray-laptop-computer-macbook-beside-drinking-glass-on-wooden-table.jpg';
import image9 from '../images/card-item/black-ceramic-mug-near-three-smartphones-on-white-wooden-desk.jpg';
import image10 from '../images/card-item/gold-iphone-6-on-white-book-near-gray-laptop-computer.jpg';
import image11 from '../images/card-item/cup-of-coffee-beside-macbook-pro.jpg';
import image12 from '../images/card-item/silver-iphone-6.jpg';
import image13 from '../images/card-item/silver-iphone-6-beside-white-ruled-paper.jpg';
import image14 from '../images/card-item/eyeglasses-with-black-plastic-frame-on-top-of-open-book.jpg';
import image15 from '../images/card-item/macbook-pro-on-brown-table.jpg';
import image16 from '../images/card-item/white-ceramic-teacup-with-saucer.jpg';
import image17 from '../images/card-item/white-pen-on-white-notebook-beside-the-orange-ceramic-coffee-cup-with-saucer-located-on-top-of-white-table.jpg';
import image18 from '../images/card-item/white-ipad-on-brown-wooden-table.jpg';
import image19 from '../images/card-item/macbook-and-teal-ceramic-kettle-on-white-table.jpg';
import image20 from '../images/card-item/gray-zenit-e-slr-camera-on-brown-surface.jpg';
import image21 from '../images/card-item/eyeglasses-on-top-of-opened-book.jpg';
import image22 from '../images/card-item/turned-off-black-laptop-computer-on-green-grass-field.jpg';
import image23 from '../images/card-item/pencil-with-gray-sharpener-on-notepad.jpg';
import image24 from '../images/card-item/clear-light-bulb.jpg';
import image25 from '../images/card-item/brown-wooden-framed-chalkboard.jpg';
import image26 from '../images/card-item/clear-light-bulb-on-black-chalkboard.jpg';
import image27 from '../images/card-item/clear-sodium-bulb-lot-with-white-background.jpg';
import image28 from '../images/card-item/happiness-illustration.jpg';
import image29 from '../images/card-item/led-bulb-on-black-surface.jpg';
import image30 from '../images/card-item/clear-halogen-bulb.jpg';
import image31 from '../images/card-item/macbook-pro-full-of-sticky-notes.jpg';
import image32 from '../images/card-item/white-notebook-with-gray-ballpoint-pen.jpg';
import image33 from '../images/card-item/blue-ballpoint-pen-on-white-ruled-notebook.jpg';
import image34 from '../images/card-item/white-printing-paper-on-table.jpg';
import image35 from '../images/card-item/white-notepad-between-color-pens.jpg';
import image36 from '../images/card-item/black-ballpoint-pen-on-graphing-notebook.jpg';
import image37 from '../images/card-item/silver-framed-eyeglasses-beside-white-click-pen-and-white-notebook.jpg';

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
export const IMAGES = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10, image11, image12, image13, image14, image15, image16, image17, image18, image19, image20, image21, image22, image23, image24, image25, image26, image27, image28, image29, image30, image31, image32, image33, image34, image35, image36, image37];

export const SHOW_BLANK = 'SHOW_BLANK';
export const SHOW_SIGN_IN = 'SHOW_SIGN_IN';
export const SHOW_COMMANDS = 'SHOW_COMMANDS';
