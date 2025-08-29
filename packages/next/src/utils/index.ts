import { createSelector } from 'reselect';
import Url from 'url-parse';

import {
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, FETCH_MORE, DELETE_OLD_LINKS_IN_TRASH,
  DELETE_OLD_LINKS_IN_TRASH_COMMIT, DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
  PIN_LINK, PIN_LINK_ROLLBACK, UNPIN_LINK, UNPIN_LINK_ROLLBACK,
  MOVE_PINNED_LINK_ADD_STEP, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
  UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_S_STEP_COMMIT,
  UPDATE_TAG_DATA_S_STEP_ROLLBACK, UPDATE_TAG_DATA_T_STEP,
  UPDATE_TAG_DATA_T_STEP_ROLLBACK,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, HTTP, HTTPS, WWW, STATUS, LINKS, SSLTS, IMAGES, SETTINGS, INFO, PINS,
  TAGS, DOT_JSON, ADDED, REMOVING, PENDING_REMOVING, DIED_ADDING, DIED_UPDATING,
  DIED_MOVING, DIED_REMOVING, DIED_DELETING, COLOR, PATTERN, IMAGE, BG_COLOR_STYLES,
  PATTERNS, VALID_URL, NO_URL, ASK_CONFIRM_URL, VALID_LIST_NAME, NO_LIST_NAME,
  TOO_LONG_LIST_NAME, DUPLICATE_LIST_NAME, COM_BRACEDOTTO_SUPPORTER, ACTIVE, NO_RENEW,
  GRACE, ON_HOLD, PAUSED, UNKNOWN, CD_ROOT, MODE_EDIT, MAX_TRY, EXTRACT_INVALID_URL,
  VALID_PASSWORD, NO_PASSWORD, CONTAIN_SPACES_PASSWORD, TOO_LONG_PASSWORD, N_LINKS,
  MY_LIST, TRASH, ARCHIVE, NO_TAG_NAME, TOO_LONG_TAG_NAME, DUPLICATE_TAG_NAME,
  VALID_TAG_NAME, LOCKED, UNLOCKED,
} from '../types/const';
import {
  myListListNameObj, trashListNameObj, archiveListNameObj,
} from '../types/initialStates';
import { IMAGE_PATHS } from '../types/imagePaths';

const shortMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const removeTailingSlash = (url) => {
  if (url.slice(-1) === '/') return url.slice(0, -1);
  return url;
};

export const containUrlProtocol = (url) => {
  const urlObj = new Url(url, {});
  return urlObj.protocol && urlObj.protocol !== '';
};

export const ensureContainUrlProtocol = (url) => {
  if (!containUrlProtocol(url)) return HTTP + url;
  return url;
};

export const ensureContainUrlSecureProtocol = (url) => {
  const urlObj = new Url(url, {});
  urlObj.set('protocol', 'https');
  return urlObj.toString();
};

export const extractUrl = (url) => {
  url = ensureContainUrlProtocol(url);
  const urlObj = new Url(url, {});
  return {
    host: urlObj.host,
    origin: urlObj.origin,
    pathname: urlObj.pathname,
  };
};

export const getUrlFirstChar = (url) => {
  url = ensureContainUrlProtocol(url);
  const urlObj = new Url(url, {});

  return urlObj.hostname.split('.').slice(-2)[0][0];
};

export const validateUrl = (url) => {

  if (!url) return NO_URL;
  if (/\s/g.test(url)) return ASK_CONFIRM_URL;

  url = ensureContainUrlProtocol(url);

  const urlObj = new Url(url, {});
  if (!urlObj.hostname.match(/^([-a-zA-Z0-9@:%_+~#=]{1,256}\.)+[a-z]{2,8}$/)) {
    return ASK_CONFIRM_URL;
  }

  return VALID_URL;
};

export const separateUrlAndParam = (url, paramKey) => {

  const doContain = containUrlProtocol(url);
  url = ensureContainUrlProtocol(url);

  const urlObj = new Url(url, {}, true);

  const newQuery = {}, param = {};
  for (const key in urlObj.query) {
    if (Array.isArray(paramKey)) {
      if (paramKey.includes(key)) {
        param[key] = urlObj.query[key];
      } else {
        newQuery[key] = urlObj.query[key];
      }
    } else {
      if (key === paramKey) {
        param[key] = urlObj.query[key];
      } else {
        newQuery[key] = urlObj.query[key];
      }
    }
  }

  urlObj.set('query', newQuery);

  let separatedUrl = urlObj.toString();
  if (!doContain) {
    separatedUrl = separatedUrl.substring(HTTP.length);
  }

  return { separatedUrl, param };
};

export const getUrlPathQueryHash = (url) => {

  const urlObj = new Url(url, {});

  let i;
  if (!urlObj.protocol || urlObj.protocol === '') i = 1;
  else if (!urlObj.slashes) i = 2;
  else i = 3;

  return url.split('/').slice(i).join('/');
};

export const getUserUsername = (userData) => {
  if (!isObject(userData) || !isString(userData.username)) return '';
  return userData.username;
};

export const getUserImageUrl = (userData) => {

  let userImage = null;
  if (userData && userData.profile) {
    if (userData.profile.image) userImage = userData.profile.image;
    else if (
      userData.profile.decodedToken &&
      userData.profile.decodedToken.payload &&
      userData.profile.decodedToken.payload.claim &&
      userData.profile.decodedToken.payload.claim.image
    ) userImage = userData.profile.decodedToken.payload.claim.image;
  }

  let userImageUrl = null;
  if (userImage) {
    if (Array.isArray(userImage) && userImage.length > 0) {
      userImageUrl = userImage[0].contentUrl || null;
    }
  }

  return userImageUrl;
};

export const getUserHubAddr = (userData) => {
  let hubAddr = null;
  if (
    isObject(userData) &&
    isObject(userData.gaiaHubConfig) &&
    isString(userData.gaiaHubConfig.address)
  ) {
    hubAddr = userData.gaiaHubConfig.address;
  }
  return hubAddr;
};

export const prependDomainName = (value) => {
  if (value.startsWith('data:')) return value;
  return DOMAIN_NAME + value;
};

export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export const debounce = (func, wait, immediate) => {
  let timeout;

  return function () {
    let context = this;
    let args = arguments;

    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
};

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isObject = val => {
  return typeof val === 'object' && val !== null;
};

export const isString = val => {
  return typeof val === 'string';
};

export const isNumber = val => {
  return typeof val === 'number' && isFinite(val);
};

export const isEqual = (x, y) => {
  if (x === y) return true;
  // if both x and y are null or undefined and exactly the same

  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  // if they are not strictly equal, they both need to be Objects

  if (x.constructor !== y.constructor) return false;
  // they must have the exact same prototype chain, the closest we can do is
  // test there constructor.

  for (const p in x) {
    if (!x.hasOwnProperty(p)) continue;
    // other properties were tested using x.constructor === y.constructor

    if (!y.hasOwnProperty(p)) return false;
    // allows to compare x[ p ] and y[ p ] when set to undefined

    if (x[p] === y[p]) continue;
    // if they have the same strict value or identity then they are equal

    if (typeof (x[p]) !== 'object') return false;
    // Numbers, Strings, Functions, Booleans must be strictly equal

    if (!isEqual(x[p], y[p])) return false;
    // Objects and Arrays must be tested recursively
  }

  for (const p in y) {
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
    // allows x[ p ] to be set to undefined
  }
  return true;
};

export const isArrayEqual = (arr1, arr2) => {
  // if the other array is a falsy value, return
  if (!arr1 || !arr2) return false;

  // compare lengths - can save a lot of time
  if (arr1.length !== arr2.length) return false;

  for (let i = 0, l = arr1.length; i < l; i++) {
    // Check if we have nested arrays
    if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!isArrayEqual(arr1[i], arr2[i])) return false;
    } else if (arr1[i] !== arr2[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }

  return true;
};

export const isFldStr = (val) => {
  return isString(val) && val.length > 0;
};

export const getListNameObj = (listName, listNameObjs, parent = null) => {
  if (!listName || !listNameObjs) return { listNameObj: null, parent: null };

  for (const listNameObj of listNameObjs) {
    if (listNameObj.listName === listName) return { listNameObj, parent };

    const res = getListNameObj(listName, listNameObj.children, listNameObj.listName);
    if (res.listNameObj) return res;
  }

  return { listNameObj: null, parent: null };
};

export const getListNameObjFromDisplayName = (
  displayName, listNameObjs, parent = null
) => {
  if (!displayName || !listNameObjs) return { listNameObj: null, parent: null };

  for (const listNameObj of listNameObjs) {
    if (listNameObj.displayName === displayName) return { listNameObj, parent };

    const res = getListNameObjFromDisplayName(
      displayName, listNameObj.children, listNameObj.listName
    );
    if (res.listNameObj) return res;
  }

  return { listNameObj: null, parent: null };
};

export const getListNameDisplayName = (listName, listNameMap) => {
  const { listNameObj } = getListNameObj(listName, listNameMap);
  if (listNameObj) return listNameObj.displayName;

  // Not throw an error because it can happen:
  //   - Delete a link
  //   - Delete a list name
  //   - Commit delete the link -> cause rerender without the list name!
  console.log(`getListNameDisplayName: invalid listName: ${listName} and listNameMap: ${listNameMap}`);
  return listName;
};

export const getLongestListNameDisplayName = (listNameObjs) => {
  let displayName = '';
  if (!listNameObjs) return displayName;

  for (const listNameObj of listNameObjs) {
    if (listNameObj.displayName.length > displayName.length) {
      displayName = listNameObj.displayName;
    }

    const childrenDisplayName = getLongestListNameDisplayName(listNameObj.children);
    if (childrenDisplayName.length > displayName.length) {
      displayName = childrenDisplayName;
    }
  }

  return displayName;
};

export const getMaxListNameChildrenSize = (listNameObjs) => {
  let size = 0;
  if (!listNameObjs) return size;

  size = listNameObjs.length;
  for (const listNameObj of listNameObjs) {
    const childrenSize = getMaxListNameChildrenSize(listNameObj.children);
    if (childrenSize > size) size = childrenSize;
  }

  return size;
};

export const doContainListName = (listName, listNameObjs) => {
  const { listNameObj } = getListNameObj(listName, listNameObjs);
  if (listNameObj) return true;

  return false;
};

export const doContainListNameDisplayName = (displayName, listNameObjs) => {
  const { listNameObj } = getListNameObjFromDisplayName(displayName, listNameObjs);
  if (listNameObj) return true;

  return false;
};

export const doDuplicateDisplayName = (listName, displayName, listNameMap) => {
  // Check duplicate only in the same level
  const { parent } = getListNameObj(listName, listNameMap);
  if (parent) {
    const { listNameObj: parentObj } = getListNameObj(parent, listNameMap);
    if (parentObj && parentObj.children) {
      for (const obj of parentObj.children) {
        if (obj.listName === listName) continue;
        if (obj.displayName === displayName) return true;
      }
    }
  } else {
    for (const obj of listNameMap) {
      if (obj.listName === listName) continue;
      if (obj.displayName === displayName) return true;
    }
  }

  return false;
};

export const validateListNameDisplayName = (listName, displayName, listNameMap) => {
  // Validate:
  //   1. Empty 2. Contain space at the begining or the end
  //   3. Contain invalid characters 4. Too long 5. Duplicate
  //
  // 2 and 3 are not the problem because this is display name!

  if (!displayName || !isString(displayName) || displayName === '') return NO_LIST_NAME;
  if (displayName.length > 256) return TOO_LONG_LIST_NAME;

  if (doDuplicateDisplayName(listName, displayName, listNameMap)) {
    return DUPLICATE_LIST_NAME;
  }

  return VALID_LIST_NAME;
};

export const copyListNameObjs = (listNameObjs, excludedListNames = []) => {
  const objs = listNameObjs.filter(listNameObj => {
    return !excludedListNames.includes(listNameObj.listName);
  }).map(listNameObj => {
    const obj = { ...listNameObj };
    if (STATUS in obj) delete obj[STATUS];
    if (obj.children) obj.children = copyListNameObjs(obj.children, excludedListNames);
    return obj;
  });
  return objs;
};

export const copyListNameObjsWithExactExclude = (listNameObjs, excludedListNames) => {
  const newListNameObjs = [];
  for (const listNameObj of listNameObjs) {
    const obj = { ...listNameObj };
    if (STATUS in obj) delete obj[STATUS];
    if (Array.isArray(obj.children)) {
      obj.children = copyListNameObjsWithExactExclude(obj.children, excludedListNames);
    }

    if (excludedListNames.includes(obj.listName)) {
      if (Array.isArray(obj.children)) newListNameObjs.push(...obj.children);
      continue;
    }

    newListNameObjs.push(obj);
  }
  return newListNameObjs;
};

export const getAllListNames = (listNameObjs) => {
  const listNames = [];
  if (!listNameObjs) return listNames;

  for (const listNameObj of listNameObjs) {
    listNames.push(listNameObj.listName);
    listNames.push(...getAllListNames(listNameObj.children));
  }

  return listNames;
};

export const isDiedStatus = (status) => {
  return [
    DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  ].includes(status);
};

export const getStatusCounts = (statuses) => {
  const results = [
    { count: 0, index: -1, value: FETCH },
    { count: 0, index: -1, value: DELETE_OLD_LINKS_IN_TRASH },
    { count: 0, index: -1, value: EXTRACT_CONTENTS },
    { count: 0, index: -1, value: UPDATE_SETTINGS },
  ];
  const ops = {
    [FETCH]: { value: 1, index: 0 },
    [FETCH_COMMIT]: { value: -1, index: 0 },
    [FETCH_ROLLBACK]: { value: -1, index: 0 },
    [DELETE_OLD_LINKS_IN_TRASH]: { value: 1, index: 1 },
    [DELETE_OLD_LINKS_IN_TRASH_COMMIT]: { value: -1, index: 1 },
    [DELETE_OLD_LINKS_IN_TRASH_ROLLBACK]: { value: -1, index: 1 },
    [EXTRACT_CONTENTS]: { value: 1, index: 2 },
    [EXTRACT_CONTENTS_COMMIT]: { value: -1, index: 2 },
    [EXTRACT_CONTENTS_ROLLBACK]: { value: -1, index: 2 },
    [UPDATE_SETTINGS]: { value: 1, index: 3 },
    [UPDATE_SETTINGS_COMMIT]: { value: -1, index: 3 },
    [UPDATE_SETTINGS_ROLLBACK]: { value: -1, index: 3 },
  };

  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i];
    if (!(status in ops)) continue;

    const op = ops[status];
    results[op.index].count += op.value;
    results[op.index].index = i;
  }

  return results;
};

export const getLastHalfHeight = (height, textHeight, pt, pb, halfRatio = 0.6) => {
  let x = height - pt - pb - (textHeight * halfRatio);
  x = Math.floor(x / textHeight);

  return Math.round((textHeight * x) + (textHeight * halfRatio) + pt + pb);
};

export const randInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

export const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const randomString = (length) => {
  // Important - characters can't contain numbers
  //   as this random string might append to timestamp.
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const isStringIn = (link, searchString) => {
  const hasUppercase = containUppercase(searchString);
  const searchWords = searchString.split(' ');

  let text, isIn;
  if (isObject(link.custom) && isString(link.custom.title)) {
    text = link.custom.title;
    if (!hasUppercase) text = text.toLowerCase();

    isIn = searchWords.every(word => text.includes(word));
    if (isIn) return true;
  } else if (
    isObject(link.extractedResult) &&
    isString(link.extractedResult.title) &&
    !link.doIgnoreExtrdRst
  ) {
    text = link.extractedResult.title;
    if (!hasUppercase) text = text.toLowerCase();

    isIn = searchWords.every(word => text.includes(word));
    if (isIn) return true;
  }

  text = link.url;
  if (!hasUppercase) text = text.toLowerCase();
  if (text.startsWith(HTTPS)) text = text.substring(HTTPS.length);
  if (text.startsWith(HTTP)) text = text.substring(HTTP.length);
  if (text.startsWith(WWW)) text = text.substring(WWW.length);

  isIn = searchWords.every(word => text.includes(word));
  if (isIn) return true;

  return false;
};

export const randomDecor = (text) => {

  /*
  decor = {
    image: {
      bg: {
        type: image|color|pattern,
        value: [value],
      },
      fg: {
        text: 'A',
      },
    },
    favicon: {
      bg: {
        type: color|pattern,
        value: [value],
      },
    }
  }
  */

  const decor = {
    image: {
      bg: {} as any,
      fg: null,
    },
    favicon: {
      bg: {} as any,
    },
  };
  let n;

  // image background
  n = randInt(100);
  if (n < 30) {
    decor.image.bg.type = COLOR;
    decor.image.bg.value = `${sample(BG_COLOR_STYLES)}`;
  } else if (n < 80) {
    decor.image.bg.type = PATTERN;
    decor.image.bg.value = sample(PATTERNS);
  } else {
    decor.image.bg.type = IMAGE;
    decor.image.bg.value = sample(IMAGE_PATHS);
  }

  // image foreground
  n = randInt(100);
  if ((decor.image.bg.type === COLOR && n < 75) ||
    (decor.image.bg.type === PATTERN && n < 25)) {

    decor.image.fg = {
      text: text,
    };
  }

  // favicon background
  n = randInt(100);
  if (n < 75) {
    decor.favicon.bg.type = COLOR;
    decor.favicon.bg.value = `${sample(BG_COLOR_STYLES)}`;
  } else {
    decor.favicon.bg.type = PATTERN;
    decor.favicon.bg.value = sample(PATTERNS);
  }

  return decor;
};

export const containUppercase = (letters) => {
  for (let i = 0; i < letters.length; i++) {
    if (letters[i] === letters[i].toUpperCase()
      && letters[i] !== letters[i].toLowerCase()) {
      return true;
    }
  }
  return false;
};

export const truncateString = (s, n) => {
  if (!(typeof s === 'string' || s instanceof String)) return s;

  if (s.length <= n) {
    return s;
  }

  return s.slice(0, n) + '...';
};

const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (error) {
    console.error('Fallback: Oops, unable to copy', error);
  }

  document.body.removeChild(textArea);
};

export const copyTextToClipboard = (text) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
};

export const subtractPixel = (a, b) => {
  a = parseInt(a.slice(0, -2), 10);
  b = parseInt(b.slice(0, -2), 10);

  return (a - b).toString() + 'px';
};

export const addRem = (a, b) => {
  a = parseFloat(a.slice(0, -3));
  b = parseFloat(b.slice(0, -3));

  return (a + b).toString() + 'rem';
};

export const subtractRem = (a, b) => {
  a = parseFloat(a.slice(0, -3));
  b = parseFloat(b.slice(0, -3));

  return (a - b).toString() + 'rem';
};

export const negRem = (a) => {
  a = parseFloat(a.slice(0, -3));

  return (-1 * a).toString() + 'rem';
};

export const toPx = (rem, fontSize = 16) => {
  if (rem.endsWith('rem')) rem = rem.slice(0, -3);
  return parseFloat(rem) * fontSize;
};

export const multiplyPercent = (value, percent) => {
  if (percent.endsWith('%')) percent = percent.slice(0, -1);
  return value * parseFloat(percent) / 100;
};

export const rerandomRandomTerm = (id) => {
  const arr = id.split('-');
  if (arr.length !== 3 && arr.length !== 4) {
    console.log(`In rerandomRandomTerm, invalid id: ${id}`);
    return id;
  }

  arr[2] = randomString(4);
  return arr.join('-');
};

export const deleteRemovedDT = (id) => {
  const arr = id.split('-');
  if (arr.length !== 3 && arr.length !== 4) {
    console.log(`In deleteRemovedDT, invalid id: ${id}`);
    return id;
  }

  return arr.slice(0, 3).join('-');
};

export const getMainId = (id) => {
  return id.split('-').slice(0, 2).join('-');
};

export const excludeWithMainIds = (links, ids) => {

  ids = ids.map(id => getMainId(id));

  const newLinks = {};
  for (const id in links) {
    if (ids.includes(getMainId(id))) {
      continue;
    }
    newLinks[id] = links[id];
  }
  return newLinks;
};

export const getLinkMainIds = (linkMetas) => {
  const linkMainIds = [];
  for (const meta of linkMetas) {
    const { id } = meta;
    linkMainIds.push(getMainId(id));
  }

  return linkMainIds;
};

export const getWindowScrollHeight = () => {
  const body = window.document.body;
  const html = window.document.documentElement;
  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
};

export const getOffsetTop = (element) => {
  if (!element) return 0;
  return getOffsetTop(element.offsetParent) + element.offsetTop;
};

export const indexesOf = (text, searchValue) => {
  const indexes = [];

  let i = -1;
  while ((i = text.indexOf(searchValue, i + 1)) >= 0) indexes.push(i);

  return indexes;
};

export const swapArrayElements = (a, x, y) => (a[x] && a[y] && [
  ...a.slice(0, x),
  a[y],
  ...a.slice(x + 1, y),
  a[x],
  ...a.slice(y + 1),
]) || a;

export const getFormattedDT = (dt) => {
  const d = new Date(dt);

  const year = d.getFullYear() % 2000;
  const month = shortMonths[d.getMonth()];
  const date = d.getDate();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');

  return `${date} ${month} ${year} ${hour}:${min}`;
};

export const getFormattedDate = (d) => {
  const year = d.getFullYear();
  const month = shortMonths[d.getMonth()];
  const date = d.getDate();

  return `${date} ${month} ${year}`;
};

export const isOfflineAction = (action, actionType, listName = null) => {
  try {
    const { method, params } = action.meta.offline.effect;
    if (method === actionType) {
      if (listName === null) return true;
      else return params && params.listName === listName;
    }
  } catch (error) {
    console.log('Invalid offline action: ', action, ' error: ', error);
  }

  return false;
};

export const isOfflineActionWithPayload = (action, actionType, payload = null) => {
  try {
    const { method, params } = action.meta.offline.effect;
    if (method === actionType) {
      if (payload === null) return true;
      else return isEqual(payload, params);
    }
  } catch (error) {
    console.log('Invalid offline action: ', action, ' error: ', error);
  }

  return false;
};

export const shouldDispatchFetch = (outbox, payload) => {
  if (Array.isArray(outbox)) {
    for (const action of outbox) {
      try {
        const { method, params } = action.meta.offline.effect;
        if (method === FETCH) {
          if (
            params.listName === payload.listName &&
            params.doDescendingOrder === payload.doDescendingOrder
          ) {
            if (
              (params.doFetchStgsAndInfo && payload.doFetchStgsAndInfo) ||
              (params.doFetchStgsAndInfo && !payload.doFetchStgsAndInfo) ||
              (!params.doFetchStgsAndInfo && !payload.doFetchStgsAndInfo)
            ) return false;
          }
        }
      } catch (error) {
        console.log('Invalid action or payload: ', action, payload, ' error: ', error);
      }
    }
  }

  return true;
};

export const doOutboxContainMethods = (outbox, methods) => {
  if (Array.isArray(outbox)) {
    for (const action of outbox) {
      try {
        const { method } = action.meta.offline.effect;
        if (methods.includes(method)) return true;
      } catch (error) {
        console.log('Invalid action: ', action, ' error: ', error);
      }
    }
  }

  return false;
};

export const isIPadIPhoneIPod = () => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) {
    return true;
  }
  if (/Mac OS X/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua) && !/Firefox/.test(ua)) {
    return true;
  }
  return false;
};

export const isMobile = () => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) {
    return true;
  }
  if (isIPadIPhoneIPod()) {
    return true;
  }
  if (/windows phone/i.test(ua)) {
    return true;
  }
  return false;
};

export const splitOnFirst = (str, sep) => {
  const i = str.indexOf(sep);
  if (i < 0) return [str, ''];

  return [str.slice(0, i), str.slice(i + sep.length)];
};

export const escapeDoubleQuotes = (s) => {
  return s.trim().replace(/\r?\n/g, '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

const _isDecorValid = (decor) => {
  if (!isObject(decor)) return false;
  if (!isObject(decor.image) || !isObject(decor.favicon)) return false;
  if (!isObject(decor.image.bg) || !isObject(decor.favicon.bg)) return false;
  if (!isString(decor.image.bg.type) || !isString(decor.image.bg.value)) {
    return false;
  }

  // no fg, fg is null, fg is an empty object, fg must have text.
  const isFgValid = (
    !('fg' in decor.image) ||
    decor.image.fg === null ||
    isEqual(decor.image.fg, {}) ||
    (isObject(decor.image.fg) && isString(decor.image.fg.text))
  );
  if (!isFgValid) return false;

  if (!isString(decor.favicon.bg.type) || !isString(decor.favicon.bg.value)) {
    return false;
  }

  return true;
};

export const isDecorValid = (data) => {
  if (isObject(data) && 'decor' in data) return _isDecorValid(data.decor);
  return _isDecorValid(data);
};

export const isExtractedResultValid = (data) => {
  if (!isObject(data.extractedResult)) return false;

  if (!(
    isString(data.extractedResult.url) &&
    isNumber(data.extractedResult.extractedDT) &&
    isString(data.extractedResult.status)
  )) return false;

  if ('title' in data.extractedResult) {
    if (!isString(data.extractedResult.title)) return false;
  }
  if ('image' in data.extractedResult) {
    if (!isString(data.extractedResult.image)) return false;
  }
  if ('favicon' in data.extractedResult) {
    if (!isString(data.extractedResult.favicon)) return false;
  }

  return true;
};

export const isCustomValid = (data) => {
  if (!isObject(data.custom)) return false;

  const isTitle = 'title' in data.custom;
  const isImage = 'image' in data.custom;
  if (!isTitle && !isImage) return false;

  if (isTitle) {
    if (!isString(data.custom.title)) return false;
  }
  if (isImage) {
    if (!isString(data.custom.image)) return false;
  }

  return true;
};

export const isListNameObjsValid = (listNameObjs) => {
  if (!Array.isArray(listNameObjs)) return false;

  for (const listNameObj of listNameObjs) {
    if (!isObject(listNameObj)) return false;
    if (!isString(listNameObj.listName) || !isString(listNameObj.displayName)) {
      return false;
    }
    if (![undefined, null].includes(listNameObj.children)) {
      if (!isListNameObjsValid(listNameObj.children)) return false;
    }
  }

  return true;
};

export const isTagNameObjsValid = (tagNameObjs) => {
  if (!Array.isArray(tagNameObjs)) return false;

  for (const tagNameObj of tagNameObjs) {
    if (!isObject(tagNameObj)) return false;
    if (!isString(tagNameObj.tagName) || !isString(tagNameObj.displayName)) {
      return false;
    }
    // color can be optional
  }

  return true;
};

export const deriveSettingsState = (listNames, tagNames, settings, initialState) => {
  const state = settings ? { ...initialState, ...settings } : { ...initialState };
  state.listNameMap = copyListNameObjs(state.listNameMap);
  state.tagNameMap = copyTagNameObjs(state.tagNameMap);

  if (!doContainListName(MY_LIST, state.listNameMap)) {
    state.listNameMap.push({ ...myListListNameObj });
  }
  if (!doContainListName(TRASH, state.listNameMap)) {
    state.listNameMap.push({ ...trashListNameObj });
  }
  if (!doContainListName(ARCHIVE, state.listNameMap)) {
    state.listNameMap.push({ ...archiveListNameObj });
  }

  let i = 1;
  for (const listName of listNames) {
    if (!doContainListName(listName, state.listNameMap)) {
      state.listNameMap.push(
        { listName: listName, displayName: `<missing-name-${i}>` }
      );
      i += 1;
    }
  }
  for (const tagName of tagNames) {
    if (!doContainTagName(tagName, state.tagNameMap)) {
      state.tagNameMap.push(
        { tagName: tagName, displayName: `<missing-name-${i}>`, color: '' }
      );
      i += 1;
    }
  }

  return state;
};

export const deriveInfoState = (info, initialState) => {
  const state = info ? { ...initialState, ...info } : { ...initialState };
  state.purchases = getNormalizedPurchases(state.purchases);
  return state;
};

export const getValidProduct = (products) => {
  if (!Array.isArray(products) || products.length === 0) return null;
  for (const product of products) {
    if (product.id === COM_BRACEDOTTO_SUPPORTER) return product;
  }
  return null;
};

export const getLatestPurchase = (purchases) => {
  if (!Array.isArray(purchases) || purchases.length === 0) return null;

  const _purchases = [...purchases].sort((a, b) => {
    return (new Date(b.endDate)).getTime() - (new Date(a.endDate)).getTime();
  });

  for (const status of [ACTIVE, NO_RENEW, GRACE, ON_HOLD, PAUSED]) {
    const purchase = _purchases.find(p => p.status === status);
    if (purchase) return purchase;
  }

  return _purchases[0];
};

export const getValidPurchase = (purchases) => {
  const purchase = getLatestPurchase(purchases);

  if (!purchase) return null;
  if ([ACTIVE, NO_RENEW, GRACE, ON_HOLD, PAUSED].includes(purchase.status)) {
    return purchase;
  }
  return null;
};

export const getNormalizedPurchases = (purchases) => {
  if (!Array.isArray(purchases)) return null;

  const purchase = getLatestPurchase(purchases);
  if (!isObject(purchase)) return [];

  // Purchase token from Apple is too big for Redux persist.
  const nPurchase = { ...purchase };
  if (isString(nPurchase.token)) nPurchase.token = nPurchase.token.slice(0, 128);

  return [nPurchase];
};

export const doEnableExtraFeatures = (purchases) => {
  // If just purchased, enable extra features.
  // Can have pro features or premium features that not included here,
  //   just don't use this function to enable the features.
  const purchase = getLatestPurchase(purchases);

  if (!purchase) return false;
  if ([ACTIVE, NO_RENEW, GRACE].includes(purchase.status)) return true;
  if (purchase.status === UNKNOWN) return null;
  return false;
};

export const createLinkFPath = (listName, id = null) => {
  // Cannot encode because fpaths in etags are not encoded
  // When fetch, unencoded fpaths are saved in etags
  // When update, if encode, fpath will be different to the fpath in etags,
  //   it'll be treated as a new file and fails in putFile
  //   as on server, error is thrown: etag is different.
  //listName = encodeURIComponent(listName);
  return id === null ? `${LINKS}/${listName}` : `${LINKS}/${listName}/${id}${DOT_JSON}`;
};

export const extractLinkFPath = (fpath) => {
  const arr = fpath.split('/');
  if (arr.length !== 3) console.log(`In extractLinkFPath, invalid fpath: ${fpath}`);

  let id, ext;
  const [listName, fname] = [arr[1] || '', arr[2] || ''];
  const dotIndex = fname.lastIndexOf('.');
  if (dotIndex === -1) {
    [id, ext] = [fname, ''];
  } else {
    [id, ext] = [fname.substring(0, dotIndex), fname.substring(dotIndex + 1)];
  }

  return { listName, id, ext };
};

export const extractLinkId = (id) => {
  const arr = id.split('-');
  if (arr.length !== 3 && arr.length !== 4) {
    console.log(`In extractLinkId, invalid id: ${id}`);
  }

  const addedDT = parseInt(arr[0], 10);
  const updatedDT = parseInt(arr[3], 10);
  return { addedDT, updatedDT: isNumber(updatedDT) ? updatedDT : addedDT };
};

export const createSsltFPath = (listName, updatedDT, addedDT, id) => {
  return `${SSLTS}/${listName}/${updatedDT}/${addedDT}/${id}${DOT_JSON}`;
};

export const extractSsltFPath = (fpath) => {
  const arr = fpath.split('/');
  if (arr.length !== 5) console.log(`In extractSsltFPath, invalid fpath: ${fpath}`);

  let id, ext;
  const [listName, fname] = [arr[1] || '', arr[4] || ''];
  const [updatedDTStr, addedDTStr] = [arr[2] || '', arr[3] || ''];

  const updatedDT = parseInt(updatedDTStr, 10);
  const addedDT = parseInt(addedDTStr, 10);

  const dotIndex = fname.lastIndexOf('.');
  if (dotIndex === -1) {
    [id, ext] = [fname, ''];
  } else {
    [id, ext] = [fname.substring(0, dotIndex), fname.substring(dotIndex + 1)];
  }

  return { listName, updatedDT, addedDT, id, ext };
};

export const extractStaticFPath = (fpath) => {
  const arr = fpath.split('/');
  if (arr.length !== 2) console.log(`In extractStaticFPath, invalid fpath: ${fpath}`);

  let id, ext;
  const fname = arr[1] || '';
  const dotIndex = fname.lastIndexOf('.');
  if (dotIndex === -1) {
    [id, ext] = [fname, ''];
  } else {
    [id, ext] = [fname.substring(0, dotIndex), fname.substring(dotIndex + 1)];
  }

  return { id, ext };
};

export const createSettingsFPath = (fname) => {
  return `${SETTINGS}${fname}${DOT_JSON}`;
};

export const extractSettingsFPath = (fpath) => {
  const fname = fpath.slice(SETTINGS.length, -1 * DOT_JSON.length);
  return { fname };
};

export const createPinFPath = (rank, updatedDT, addedDT, id) => {
  return `${PINS}/${rank}/${updatedDT}/${addedDT}/${id}${DOT_JSON}`;
};

export const extractPinFPath = (fpath) => {
  const arr = fpath.split('/');
  if (arr.length !== 5) console.log(`In extractPinFPath, invalid fpath: ${fpath}`);

  let id, ext;
  const [rank, fname] = [arr[1] || '', arr[4] || ''];
  const [updatedDTStr, addedDTStr] = [arr[2] || '', arr[3] || ''];

  const updatedDT = parseInt(updatedDTStr, 10);
  const addedDT = parseInt(addedDTStr, 10);

  const dotIndex = fname.lastIndexOf('.');
  if (dotIndex === -1) {
    [id, ext] = [fname, ''];
  } else {
    [id, ext] = [fname.substring(0, dotIndex), fname.substring(dotIndex + 1)];
  }

  return { rank, updatedDT, addedDT, id, ext };
};

export const createTagFPath = (tagName, rank, updatedDT, addedDT, id) => {
  return `${TAGS}/${tagName}/${rank}/${updatedDT}/${addedDT}/${id}${DOT_JSON}`;
};

export const extractTagFPath = (fpath) => {
  const arr = fpath.split('/');
  if (arr.length !== 6) console.log(`In extractTagFPath, invalid fpath: ${fpath}`);

  let id, ext;
  const [tagName, rank, fname] = [arr[1] || '', arr[2] || '', arr[5] || ''];
  const [updatedDTStr, addedDTStr] = [arr[3] || '', arr[4] || ''];

  const updatedDT = parseInt(updatedDTStr, 10);
  const addedDT = parseInt(addedDTStr, 10);

  const dotIndex = fname.lastIndexOf('.');
  if (dotIndex === -1) {
    [id, ext] = [fname, ''];
  } else {
    [id, ext] = [fname.substring(0, dotIndex), fname.substring(dotIndex + 1)];
  }

  return { tagName, rank, updatedDT, addedDT, id, ext };
};

export const addFPath = (fpaths, fpath) => {
  if (fpath.startsWith('file://')) fpath = fpath.slice('file://'.length);

  if (fpath.startsWith(LINKS)) {
    const { listName } = extractLinkFPath(fpath);
    if (!fpaths.linkFPaths[listName]) fpaths.linkFPaths[listName] = [];
    if (!fpaths.linkFPaths[listName].includes(fpath)) {
      fpaths.linkFPaths[listName].push(fpath);
    }
  } else if (fpath.startsWith(SSLTS)) {
    if (!fpaths.ssltFPaths.includes(fpath)) fpaths.ssltFPaths.push(fpath);
  } else if (fpath.startsWith(IMAGES)) {
    if (!fpaths.staticFPaths.includes(fpath)) fpaths.staticFPaths.push(fpath);
  } else if (fpath.startsWith(SETTINGS)) {
    if (!fpaths.settingsFPaths.includes(fpath)) fpaths.settingsFPaths.push(fpath);
  } else if (fpath.startsWith(INFO)) {
    if (!fpaths.infoFPath) fpaths.infoFPath = fpath;
    else {
      const dt = parseInt(
        fpaths.infoFPath.slice(INFO.length, -1 * DOT_JSON.length), 10
      );
      const _dt = parseInt(fpath.slice(INFO.length, -1 * DOT_JSON.length), 10);
      if (isNumber(dt) && isNumber(_dt) && dt < _dt) fpaths.infoFPath = fpath;
    }
  } else if (fpath.startsWith(PINS)) {
    if (!fpaths.pinFPaths.includes(fpath)) fpaths.pinFPaths.push(fpath);
  } else if (fpath.startsWith(TAGS)) {
    if (!fpaths.tagFPaths.includes(fpath)) fpaths.tagFPaths.push(fpath);
  } else {
    console.log(`Invalid file path: ${fpath}`);
  }
};

export const deleteFPath = (fpaths, fpath) => {
  if (fpath.startsWith(LINKS)) {
    const { listName } = extractLinkFPath(fpath);
    if (fpaths.linkFPaths[listName]) {
      fpaths.linkFPaths[listName] = fpaths.linkFPaths[listName].filter(el => {
        return el !== fpath;
      });
      if (fpaths.linkFPaths[listName].length === 0) {
        delete fpaths.linkFPaths[listName];
      }
    }
  } else if (fpath.startsWith(SSLTS)) {
    fpaths.ssltFPaths = fpaths.ssltFPaths.filter(el => el !== fpath);
  } else if (fpath.startsWith(IMAGES)) {
    fpaths.staticFPaths = fpaths.staticFPaths.filter(el => el !== fpath);
  } else if (fpath.startsWith(SETTINGS)) {
    fpaths.settingsFPaths = fpaths.settingsFPaths.filter(el => el !== fpath);
  } else if (fpath.startsWith(INFO)) {
    if (fpaths.infoFPath === fpath) fpaths.infoFPath = null;
  } else if (fpath.startsWith(PINS)) {
    fpaths.pinFPaths = fpaths.pinFPaths.filter(el => el !== fpath);
  } else if (fpath.startsWith(TAGS)) {
    fpaths.tagFPaths = fpaths.tagFPaths.filter(el => el !== fpath);
  } else {
    console.log(`Invalid file path: ${fpath}`);
  }
};

export const copyFPaths = (fpaths) => {
  const newLinkFPaths = {};
  if (isObject(fpaths.linkFPaths)) {
    for (const initListName in fpaths.linkFPaths) {
      if (Array.isArray(fpaths.linkFPaths[initListName])) {
        newLinkFPaths[initListName] = [...fpaths.linkFPaths[initListName]];
      }
    }
  }

  let newSsltFPaths = [];
  if (Array.isArray(fpaths.ssltFPaths)) newSsltFPaths = [...fpaths.ssltFPaths];

  let newStaticFPaths = [];
  if (Array.isArray(fpaths.staticFPaths)) newStaticFPaths = [...fpaths.staticFPaths];

  let newSettingsFPaths = [];
  if (Array.isArray(fpaths.settingsFPaths)) {
    newSettingsFPaths = [...fpaths.settingsFPaths];
  }

  let newPinFPaths = [];
  if (Array.isArray(fpaths.pinFPaths)) newPinFPaths = [...fpaths.pinFPaths];

  let newTagFPaths = [];
  if (Array.isArray(fpaths.tagFPaths)) newTagFPaths = [...fpaths.tagFPaths];

  return {
    ...fpaths,
    linkFPaths: newLinkFPaths,
    ssltFPaths: newSsltFPaths,
    staticFPaths: newStaticFPaths,
    settingsFPaths: newSettingsFPaths,
    pinFPaths: newPinFPaths,
    tagFPaths: newTagFPaths,
  };
};

const EMPTY_OBJECTS = {};
const getEmptyObject = (key) => {
  // Some functions are used as an input of createSelector.
  // Returning a same object to fix warning: An input selector returned a different
  //   result when passed same arguments (InputStabilityCheck).
  if (isEqual(EMPTY_OBJECTS[key], {})) {
    return EMPTY_OBJECTS[key];
  }

  EMPTY_OBJECTS[key] = {};
  return EMPTY_OBJECTS[key];
};

const EMPTY_ARRAYS = {};
const getEmptyArray = (key) => {
  // Some functions are used as an input of createSelector.
  // Returning a same object to fix warning: An input selector returned a different
  //   result when passed same arguments (InputStabilityCheck).
  if (Array.isArray(EMPTY_ARRAYS[key]) && EMPTY_ARRAYS[key].length === 0) {
    return EMPTY_ARRAYS[key];
  }

  EMPTY_ARRAYS[key] = [];
  return EMPTY_ARRAYS[key];
};

export const getLinkFPaths = (state) => {
  if (
    isObject(state.cachedFPaths) &&
    isObject(state.cachedFPaths.fpaths) &&
    isObject(state.cachedFPaths.fpaths.linkFPaths)
  ) {
    return state.cachedFPaths.fpaths.linkFPaths;
  }
  return getEmptyObject('getLinkFPaths');
};

export const getSsltFPaths = (state) => {
  if (
    isObject(state.cachedFPaths) &&
    isObject(state.cachedFPaths.fpaths) &&
    Array.isArray(state.cachedFPaths.fpaths.ssltFPaths)
  ) {
    return state.cachedFPaths.fpaths.ssltFPaths;
  }
  return getEmptyArray('getSsltFPaths');
};

const _listLinkMetas = createSelector(
  linkFPaths => linkFPaths,
  (linkFPaths) => {
    const lnkInfosPerMid = {};
    for (const initListName in linkFPaths) {
      for (const fpath of linkFPaths[initListName]) {
        const { id } = extractLinkFPath(fpath);
        const { addedDT, updatedDT } = extractLinkId(id);

        const mainId = getMainId(id);
        if (!Array.isArray(lnkInfosPerMid[mainId])) lnkInfosPerMid[mainId] = [];

        const info = { id, addedDT, updatedDT, fpaths: [fpath], initListName };
        lnkInfosPerMid[mainId].push(info);
      }
    }

    const metaPerMids = {}, prevFPathsPerMids = {};
    for (const mainId in lnkInfosPerMid) {
      let latestUpdatedDT = -1, latestIndex = -1;
      for (let i = 0; i < lnkInfosPerMid[mainId].length; i++) {
        const info = lnkInfosPerMid[mainId][i];
        if (info.updatedDT > latestUpdatedDT) {
          latestUpdatedDT = info.updatedDT;
          latestIndex = i;
        }
      }
      for (let i = 0; i < lnkInfosPerMid[mainId].length; i++) {
        const info = lnkInfosPerMid[mainId][i];
        const { id, addedDT, updatedDT, fpaths, initListName } = info;

        if (i !== latestIndex) {
          if (!Array.isArray(prevFPathsPerMids[mainId])) prevFPathsPerMids[mainId] = [];
          prevFPathsPerMids[mainId].push(...fpaths);
          continue;
        }

        const meta = { id, addedDT, updatedDT, fpaths, listName: initListName };
        metaPerMids[mainId] = meta;
      }
    }

    return { metaPerMids, prevFPathsPerMids };
  },
);

const _listSsltInfos = createSelector(
  ssltFPaths => ssltFPaths,
  (ssltFPaths) => {
    const ssltInfos = {};
    for (const fpath of ssltFPaths) {
      const { listName, updatedDT, id } = extractSsltFPath(fpath);

      const mainId = getMainId(id);
      if (isObject(ssltInfos[mainId]) && ssltInfos[mainId].updatedDT >= updatedDT) {
        continue;
      }

      ssltInfos[mainId] = { updatedDT, listName, fpath };
    }

    return ssltInfos;
  },
);

export const listLinkMetas = (linkFPaths, ssltFPaths, pendingSslts) => {

  const { metaPerMids, prevFPathsPerMids } = _listLinkMetas(linkFPaths);
  const rawSsltInfos = _listSsltInfos(ssltFPaths);

  const ssltInfos = { ...rawSsltInfos };
  for (const id in pendingSslts) {
    const { listName } = pendingSslts[id];
    const mainId = getMainId(id);

    const info = isObject(ssltInfos[mainId]) ? { ...ssltInfos[mainId] } : {};
    info.listName = listName;

    ssltInfos[mainId] = info;
  }

  const metas = [], inUseListNames = [];
  for (const [mainId, meta] of Object.entries<any>(metaPerMids)) {
    let listName = meta.listName;
    if (isObject(ssltInfos[mainId])) listName = ssltInfos[mainId].listName;
    metas.push({ ...meta, listName });

    // 1. initLn, 2. initLn + pending, 3. initLn + sslt, 4. initList + sslt + pending
    let pListName = meta.listName;
    if (isObject(rawSsltInfos[mainId])) pListName = rawSsltInfos[mainId].listName;

    if (!inUseListNames.includes(listName)) inUseListNames.push(listName);
    if (!inUseListNames.includes(pListName)) inUseListNames.push(pListName);
  }

  return { linkMetas: metas, prevFPathsPerMids, ssltInfos, inUseListNames };
};

const applyPcLinksToMetas = (pcListNames, pcLinks, linkMetas) => {
  const metas = [], mainIds = [];
  for (let i = 0; i < pcListNames.length; i++) {
    const [listName, link] = [pcListNames[i], pcLinks[i]];
    if ([REMOVING, PENDING_REMOVING].includes(link.status)) continue;

    const { id } = link;
    const mainId = getMainId(id);
    if (mainIds.includes(mainId)) continue;

    const { addedDT, updatedDT } = extractLinkId(id);

    metas.push({ id, addedDT, updatedDT, fpaths: [], listName });
    mainIds.push(mainId);
  }
  for (const meta of linkMetas) {
    const mainId = getMainId(meta.id);
    if (mainIds.includes(mainId)) continue;

    metas.push(meta);
    mainIds.push(mainId);
  }
  for (let i = 0; i < pcListNames.length; i++) {
    const [listName, link] = [pcListNames[i], pcLinks[i]];

    const { id } = link;
    const mainId = getMainId(id);
    if (mainIds.includes(mainId)) continue;

    const { addedDT, updatedDT } = extractLinkId(id);

    metas.push({ id, addedDT, updatedDT, fpaths: [], listName });
    mainIds.push(mainId);
  }

  return { linkMetas: metas };
};

export const getStaticFPaths = (state) => {
  if (
    isObject(state.cachedFPaths) &&
    isObject(state.cachedFPaths.fpaths) &&
    Array.isArray(state.cachedFPaths.fpaths.staticFPaths)
  ) {
    return state.cachedFPaths.fpaths.staticFPaths;
  }
  return getEmptyArray('getStaticFPaths');
};

export const getSettingsFPaths = (state) => {
  if (
    isObject(state.cachedFPaths) &&
    isObject(state.cachedFPaths.fpaths) &&
    Array.isArray(state.cachedFPaths.fpaths.settingsFPaths)
  ) {
    return state.cachedFPaths.fpaths.settingsFPaths;
  }
  return getEmptyArray('getSettingsFPaths');
};

export const getInfoFPath = (state) => {
  if (isObject(state.cachedFPaths) && isObject(state.cachedFPaths.fpaths)) {
    return state.cachedFPaths.fpaths.infoFPath;
  }
  return null;
};

export const createDataFName = (id, parentIds) => {
  if (Array.isArray(parentIds)) {
    parentIds = parentIds.filter(el => isString(el) && el.length > 0);
    if (parentIds.length > 0) return `${id}_${parentIds.join('-')}`;
  }
  return id;
};

export const extractDataFName = (fname) => {
  if (!fname.includes('_')) return { id: fname, parentIds: null };

  const [id, _parentIds] = fname.split('_');
  const parentIds = _parentIds.split('-');
  return { id, parentIds };
};

export const extractDataId = (id) => {
  let i;
  for (i = id.length - 1; i >= 0; i--) {
    if (/\d/.test(id[i])) break;
  }

  return { dt: parseInt(id.slice(0, i + 1), 10) };
};

export const getDataParentIds = (leafId, toParents) => {
  const parentIds = [];

  let pendingIds = [leafId];
  while (pendingIds.length > 0) {
    let id = pendingIds[0];
    pendingIds = pendingIds.slice(1);

    const parents = toParents[id];
    if (!parents) continue;

    for (const parentId of parents) {
      if (!parentIds.includes(parentId)) {
        pendingIds.push(parentId);
        parentIds.push(parentId);
      }
    }
  }

  return parentIds;
};

const getDataRootIds = (leafId, toParents) => {
  const rootIds = [], passedIds = [leafId];

  let pendingIds = [leafId];
  while (pendingIds.length > 0) {
    let id = pendingIds[0];
    pendingIds = pendingIds.slice(1);

    let doBreak = false;
    while (toParents[id]) {
      const parents = toParents[id];

      let i = 0, doFound = false;
      for (; i < parents.length; i++) {
        const parentId = parents[i];
        if (!passedIds.includes(parentId)) {
          [id, doFound] = [parentId, true];
          passedIds.push(parentId);
          break;
        }
      }
      if (!doFound) {
        doBreak = true;
        break;
      }

      for (; i < parents.length; i++) {
        const parentId = parents[i];
        if (!passedIds.includes(parentId)) {
          pendingIds.push(parentId);
          passedIds.push(parentId);
        }
      }
    }

    if (!doBreak && !rootIds.includes(id)) rootIds.push(id);
  }

  return { rootIds, passedIds };
};

const getDataOldestRootId = (rootIds) => {
  let rootId, addedDT;
  for (const id of [...rootIds].sort()) {
    const { dt } = extractDataId(id);
    if (!isNumber(addedDT) || dt < addedDT) {
      addedDT = dt;
      rootId = id;
    }
  }
  return rootId;
};

const _listMetas = (dataFPaths, extractDataFPath, workingSubName) => {
  const ids = [], toFPaths = {}, toParents = {}, toChildren = {};
  for (const fpath of dataFPaths) {
    const { fname, subName } = extractDataFPath(fpath);
    const { id, parentIds } = extractDataFName(fname);

    if (!Array.isArray(toFPaths[id])) toFPaths[id] = [];
    if (!toFPaths[id].includes(fpath)) toFPaths[id].push(fpath);

    if (subName !== workingSubName) continue;

    if (!ids.includes(id)) ids.push(id);

    if (Array.isArray(parentIds)) {
      if (Array.isArray(toParents[id])) {
        for (const pid of parentIds) {
          if (!toParents[id].includes(pid)) toParents[id].push(pid);
        }
      } else toParents[id] = parentIds;

      for (const pid of parentIds) {
        if (!Array.isArray(toChildren[pid])) toChildren[pid] = [];
        if (!toChildren[pid].includes(pid)) toChildren[pid].push(id);
      }
    } else {
      if (Array.isArray(toParents[id])) {
        if (toParents[id].length === 0) toParents[id] = null;
      } else toParents[id] = null;
    }
  }

  // Process from leaves for the same rootIds and better performance.
  ids.sort().reverse();

  const leafIds = [];
  for (const id of ids) {
    if (!toChildren[id]) {
      if (id.startsWith('deleted')) continue;
      leafIds.push(id);
    }
  }

  const toRootIds = {};
  for (const id of ids) {
    if (isString(toRootIds[id])) continue;
    const { rootIds, passedIds } = getDataRootIds(id, toParents);
    const rootId = getDataOldestRootId(rootIds);
    for (const passedId of passedIds) toRootIds[passedId] = rootId;
  }

  const toLeafIds = {};
  for (const id of leafIds) {
    const rootId = toRootIds[id];

    if (!toLeafIds[rootId]) toLeafIds[rootId] = [];
    toLeafIds[rootId].push(id);
  }

  const metas = [];
  const conflictedMetas = [];
  for (const id of leafIds) {
    const parentIds = toParents[id];

    const rootId = toRootIds[id];
    const { dt: addedDT } = extractDataId(rootId);
    const { dt: updatedDT } = extractDataId(id);

    const tIds = toLeafIds[rootId];
    const isConflicted = tIds.length > 1;
    const conflictWith = isConflicted ? tIds : null;

    const fpaths = toFPaths[id];
    const { listName } = extractDataFPath(fpaths[0]);

    const meta = {
      parentIds, id, addedDT, updatedDT, isConflicted, conflictWith, fpaths, listName,
    };

    if (isConflicted) conflictedMetas.push(meta);
    else metas.push(meta);
  }

  const conflictWiths = Object.values<string>(toLeafIds).filter(tIds => {
    return tIds.length > 1;
  });

  return {
    metas, conflictedMetas, conflictWiths, toRootIds, toParents, toFPaths,
    toLeafIds, allIds: ids,
  };
};

export const getPinFPaths = (state) => {
  if (
    isObject(state.cachedFPaths) &&
    isObject(state.cachedFPaths.fpaths) &&
    Array.isArray(state.cachedFPaths.fpaths.pinFPaths)
  ) {
    return state.cachedFPaths.fpaths.pinFPaths;
  }
  return getEmptyArray('getPinFPaths');
};

export const getRawPins = createSelector(
  pinFPaths => pinFPaths,
  (pinFPaths) => {
    const pins = {};
    for (const fpath of pinFPaths) {
      const { rank, updatedDT, addedDT, id } = extractPinFPath(fpath);
      const pinMainId = getMainId(id);

      // duplicate id, choose the latest updatedDT
      if (pinMainId in pins && pins[pinMainId].updatedDT > updatedDT) continue;
      pins[pinMainId] = { rank, updatedDT, addedDT, id, fpath };
    }

    return pins;
  },
);

export const getPins = (pinFPaths, pendingPins, doExcludeUnpinning) => {
  const rawPins = getRawPins(pinFPaths);

  const pins = { ...rawPins };
  for (const id in pendingPins) {
    const { status, rank, updatedDT, addedDT } = pendingPins[id];
    const pinMainId = getMainId(id);

    if ([PIN_LINK, PIN_LINK_ROLLBACK].includes(status)) {
      pins[pinMainId] = { status, rank, updatedDT, addedDT, id };
    } else if ([UNPIN_LINK, UNPIN_LINK_ROLLBACK].includes(status)) {
      if (doExcludeUnpinning) {
        delete pins[pinMainId];
      } else {
        // Can't delete just yet, need for showing loading.
        pins[pinMainId] = { status, rank, updatedDT, addedDT, id };
      }
    } else if ([
      MOVE_PINNED_LINK_ADD_STEP, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
    ].includes(status)) {
      pins[pinMainId] = { status, rank, updatedDT, addedDT, id };
    } else {
      console.log('getPins: unsupport pin status: ', status);
    }
  }

  return pins;
};

export const separatePinnedValues = (
  sortedValues, pinFPaths, pendingPins, getValueMainId
) => {
  const pins = getPins(pinFPaths, pendingPins, true);

  let values = [], pinnedValues = [];
  for (const value of sortedValues) {
    const valueMainId = getValueMainId(value);

    if (valueMainId in pins) {
      pinnedValues.push({ value, pin: pins[valueMainId] });
    } else {
      values.push(value);
    }
  }

  pinnedValues = pinnedValues.sort((pinnedValueA, pinnedValueB) => {
    if (pinnedValueA.pin.rank < pinnedValueB.pin.rank) return -1;
    if (pinnedValueA.pin.rank > pinnedValueB.pin.rank) return 1;
    return 0;
  });

  return [pinnedValues, values];
};

export const sortWithPins = (sortedValues, pinFPaths, pendingPins, getValueMainId) => {
  let [pinnedValues, values] = separatePinnedValues(
    sortedValues, pinFPaths, pendingPins, getValueMainId
  );
  pinnedValues = pinnedValues.map(pinnedValue => pinnedValue.value);

  const pinnedAndSortedValues = [...pinnedValues, ...values];
  return pinnedAndSortedValues;
};

export const isPinningStatus = (pinStatus) => {
  return [
    PIN_LINK, PIN_LINK_ROLLBACK, UNPIN_LINK, UNPIN_LINK_ROLLBACK,
    MOVE_PINNED_LINK_ADD_STEP, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
  ].includes(pinStatus);
};

export const sortLinks = (links, doDescendingOrder) => {
  const sortedLinks = [...links].sort((a, b) => {
    return b.addedDT - a.addedDT;
  });
  if (!doDescendingOrder) sortedLinks.reverse();

  return sortedLinks;
};

const listSettingsMetas = (settingsFPaths) => {
  const {
    metas, conflictedMetas, conflictWiths, toRootIds, toParents, toFPaths, allIds,
  } = _listMetas(settingsFPaths, extractSettingsFPath, undefined);
  return {
    settingsMetas: metas, conflictedMetas, conflictWiths, toRootIds, toParents,
    toFPaths, allIds,
  };
};

export const getLastSettingsFPaths = createSelector(
  settingsFPaths => settingsFPaths,
  (settingsFPaths) => {
    const _v1FPaths = [], _v2FPaths = [];
    for (const fpath of settingsFPaths) {
      const { fname } = extractSettingsFPath(fpath);
      const { id } = extractDataFName(fname);
      const { dt } = extractDataId(id);

      if (!isNumber(dt)) _v1FPaths.push(fpath);
      else _v2FPaths.push(fpath);
    }

    const v1FPath = _v1FPaths.length > 0 ? _v1FPaths[0] : null;

    let v2FPaths = [];
    const { settingsMetas, conflictedMetas } = listSettingsMetas(_v2FPaths);
    for (const meta of [...settingsMetas, ...conflictedMetas]) {
      for (const fpath of meta.fpaths) {
        v2FPaths.push({ fpath, id: meta.id, dt: meta.updatedDT });
      }
    }
    v2FPaths = v2FPaths.sort((a, b) => b.dt - a.dt);

    const lastFPaths = [], lastIds = [];
    if (v2FPaths.length > 0) {
      for (const v2FPath of v2FPaths) {
        if (lastFPaths.includes(v2FPath.fpath)) continue;
        lastFPaths.push(v2FPath.fpath);
        lastIds.push(v2FPath.id);
      }
    } else if (isString(v1FPath)) {
      lastFPaths.push(v1FPath);
    }

    return { fpaths: lastFPaths, ids: lastIds };
  },
);

export const getFormattedTime = (timeStr, is24HFormat) => {
  const [hStr, mStr] = timeStr.trim().split(':');
  if (is24HFormat) return { time: timeStr, hour: hStr, minute: mStr, period: null };

  const hNum = parseInt(hStr, 10);
  const period = hNum < 12 ? 'AM' : 'PM';

  const newHNum = (hNum % 12) || 12;
  const newHStr = String(newHNum).padStart(2, '0');
  const newTimeStr = `${newHStr}:${mStr} ${period}`;

  return { time: newTimeStr, hour: newHStr, minute: mStr, period };
};

export const get24HFormattedTime = (hStr, mStr, period) => {
  let newHStr = hStr;
  if (['AM', 'PM'].includes(period)) {
    let hNum = parseInt(hStr, 10);
    if (period === 'PM' && hNum < 12) hNum += 12;
    else if (period === 'AM' && hNum === 12) hNum -= 12;

    newHStr = String(hNum).padStart(2, '0');
  }

  return `${newHStr}:${mStr}`;
};

export const getFormattedTimeStamp = (d) => {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${date} ${hour}-${min}-${sec}`;
};

export const getFileExt = (fname) => {
  if (fname.includes('.')) {
    const ext = fname.split('.').pop();
    if (ext.length <= 5) return ext.toLowerCase();
  }
  return null;
};

export const getStaticFPath = (fpath) => {
  fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
  fpath = fpath.slice((CD_ROOT + '/').length);
  return fpath;
};

export const deriveFPaths = (custom, toCustom) => {
  const usedFPaths = [], serverUnusedFPaths = [], localUnusedFPaths = [];

  let image = null, toImage = null;
  if (isObject(custom) && isString(custom.image)) image = custom.image;
  if (isObject(toCustom) && isString(toCustom.image)) toImage = toCustom.image;

  if (image !== toImage) {
    if (toImage) usedFPaths.push(getStaticFPath(toImage));
    if (image) {
      serverUnusedFPaths.push(getStaticFPath(image));
      localUnusedFPaths.push(getStaticFPath(image));
    }
  }

  return { usedFPaths, serverUnusedFPaths, localUnusedFPaths };
};

export const getWindowSize = () => {
  let width = null, height = null, visualWidth = null, visualHeight = null;
  if (typeof window !== 'undefined' && isObject(window)) {
    if (isNumber(window.innerWidth)) width = window.innerWidth;
    if (isNumber(window.innerHeight)) height = window.innerHeight;

    if (isObject(window.visualViewport)) {
      if (isNumber(window.visualViewport.width)) {
        visualWidth = window.visualViewport.width;
      }
      if (isNumber(window.visualViewport.height)) {
        visualHeight = window.visualViewport.height;
      }
    }
  }

  return { width, height, visualWidth, visualHeight };
};

export const getWindowInsets = () => {
  let top = null, right = null, bottom = null, left = null;
  if (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    isObject(window) &&
    isObject(document.documentElement)
  ) {
    const cs = window.getComputedStyle(document.documentElement);
    const st = cs.getPropertyValue('--env-safe-area-inset-top');
    const sr = cs.getPropertyValue('--env-safe-area-inset-right');
    const sb = cs.getPropertyValue('--env-safe-area-inset-bottom');
    const sl = cs.getPropertyValue('--env-safe-area-inset-left');

    // Assume always in pixels (px)
    const [nt, nr] = [parseFloat(st), parseFloat(sr)];
    const [nb, nl] = [parseFloat(sb), parseFloat(sl)];

    if (isNumber(nt)) top = nt;
    if (isNumber(nr)) right = nr;
    if (isNumber(nb)) bottom = nb;
    if (isNumber(nl)) left = nl;
  }

  return { top, right, bottom, left };
};

export const excludeNotObjContents = (fpaths, contents) => {
  const exFPaths = [], exContents = [];
  for (let i = 0; i < fpaths.length; i++) {
    const [fpath, content] = [fpaths[i], contents[i]];
    if (!isObject(content)) continue;

    exFPaths.push(fpath);
    exContents.push(content);
  }
  return { fpaths: exFPaths, contents: exContents };
};

export const getEditingListNameEditors = (listNameEditors, listNameObjs) => {
  let editingLNEs = null;
  for (const k in listNameEditors) {
    if (listNameEditors[k].mode !== MODE_EDIT) continue;
    if (!isString(listNameEditors[k].value)) continue;

    let displayName = ''; // Empty string and no listNameObj for newListNameEditor
    const { listNameObj } = getListNameObj(k, listNameObjs);
    if (isObject(listNameObj)) displayName = listNameObj.displayName;

    if (listNameEditors[k].value === displayName) continue;

    if (!isObject(editingLNEs)) editingLNEs = {};
    editingLNEs[k] = { ...listNameEditors[k] };
  }
  return editingLNEs;
};

export const batchGetFileWithRetry = async (
  getFile, fpaths, callCount, dangerouslyIgnoreError = false
) => {

  const responses = await Promise.all(
    fpaths.map(fpath =>
      getFile(fpath)
        .then(content => ({ content, fpath, success: true }))
        .catch(error => ({ error, content: null, fpath, success: false }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) {
      if (dangerouslyIgnoreError) {
        console.log('batchGetFileWithRetry error: ', failedResponses[0].error);
        return responses;
      }
      throw failedResponses[0].error;
    }

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchGetFileWithRetry(
        getFile, failedFPaths, callCount + 1, dangerouslyIgnoreError
      )),
    ];
  }

  return responses;
};

export const deriveUnknownErrorLink = (fpath) => {
  const { id } = extractLinkFPath(fpath);
  const { addedDT } = extractLinkId(id);

  const url = 'Unknown error';
  const decor = {
    image: {
      bg: { type: COLOR, value: BG_COLOR_STYLES[0] },
      fg: null,
    },
    favicon: {
      bg: { type: COLOR, value: BG_COLOR_STYLES[0] },
    },
  };
  const extractedResult = {
    url, extractedDT: Date.now(), status: EXTRACT_INVALID_URL,
  };

  // Need extractedResult to prevent extractContents to override the link content!
  return { id, url, addedDT, decor, extractedResult };
};

export const extractFPath = (fpath) => {
  const fpathParts = fpath.split('/');
  const fname = fpathParts[fpathParts.length - 1];
  const fnameParts = fname.split('.');
  const fext = fnameParts.length >= 2 ? fnameParts[fnameParts.length - 1] : '';
  return { fpath, fpathParts, fname, fnameParts, fext };
};

export const applySubscriptionOfferDetails = (product) => {
  if (!isObject(product)) return;

  const { subscriptionOfferDetails } = product;
  if (!Array.isArray(subscriptionOfferDetails)) return;

  const offers = [];
  for (const offer of subscriptionOfferDetails) {
    if (!isObject(offer)) continue;
    if (!isObject(offer.pricingPhases)) continue;
    if (!Array.isArray(offer.pricingPhases.pricingPhaseList)) continue;

    let firstPrice, firstNonZeroFormattedPrice;
    for (const pricing of offer.pricingPhases.pricingPhaseList) {
      if (!isObject(pricing)) continue;

      const price = parseInt(pricing.priceAmountMicros, 10);
      if (isNumber(price)) {
        if (!isNumber(firstPrice)) firstPrice = price;
        if (price > 0 && !isString(firstNonZeroFormattedPrice)) {
          firstNonZeroFormattedPrice = pricing.formattedPrice;
        }
      }
    }

    if (isNumber(firstPrice) && isString(firstNonZeroFormattedPrice)) {
      offers.push({ ...offer, firstPrice, firstNonZeroFormattedPrice });
    }
  }

  let offer = offers.find(_offer => {
    return _offer.basePlanId === 'p1y' && _offer.offerId === 'freetrial';
  });
  if (!isObject(offer)) {
    offer = offers.find(_offer => {
      return _offer.basePlanId === 'p1y' && _offer.offerId === null;
    });
  }
  if (!isObject(offer)) {
    for (const _offer of offers) {
      if (!isObject(offer)) {
        offer = _offer;
        continue;
      }
      // Not totally correct, good enough for now.
      if (_offer.firstPrice < offer.firstPrice) offer = _offer;
    }
  }
  if (!isObject(offer)) return;

  product.offerToken = offer.offerToken;
  product.localizedPrice = offer.firstNonZeroFormattedPrice;
};

export const validatePassword = (password) => {
  if (!isString(password) || password.length === 0) return NO_PASSWORD;
  if (/\s/g.test(password)) return CONTAIN_SPACES_PASSWORD;
  if (password.length > 27) return TOO_LONG_PASSWORD;
  return VALID_PASSWORD;
};

export const getLockListStatus = (doForceLock, lockedLists, listName) => {
  if (!isString(listName)) return null;

  if (isObject(lockedLists[listName])) {
    if (isString(lockedLists[listName].password)) {
      if (doForceLock) return LOCKED;
      if (isNumber(lockedLists[listName].unlockedDT)) return UNLOCKED;
      return LOCKED;
    }
  }
  return null;
};

const _doListContainUnlocks = (listName, lockedLists) => {
  if (isObject(lockedLists[listName])) {
    if (isString(lockedLists[listName].password)) {
      if (isNumber(lockedLists[listName].unlockedDT)) return true;
    }
  }

  return false;
};

export const doListContainUnlocks = (state) => {
  const links = state.links;
  const queryString = state.display.queryString;
  const showingLinkIds = state.display.showingLinkIds;
  const lockedLists = state.lockSettings.lockedLists;

  if (queryString) {
    if (!Array.isArray(showingLinkIds)) return false;
    for (const id of showingLinkIds) {
      const { listName } = getListNameAndLink(id, links);
      if (!isString(listName)) continue;

      const doContain = _doListContainUnlocks(listName, lockedLists);
      if (doContain) return true;
    }
    return false;
  }

  const listName = state.display.listName;

  const doContain = _doListContainUnlocks(listName, lockedLists);
  return doContain;
};

export const getLink = (id, links) => {
  const selectedLinks = [];
  for (const listName in links) {
    if (isObject(links[listName]) && isObject(links[listName][id])) {
      selectedLinks.push(links[listName][id]);
    }
  }

  for (const link of selectedLinks) {
    if (![ADDED, REMOVING, PENDING_REMOVING].includes(link.status)) {
      return link;
    }
  }
  for (const link of selectedLinks) {
    if (link.status === ADDED) return link;
  }
  if (selectedLinks.length > 0) return selectedLinks[0];

  return null;
};

export const getListNameAndLink = (id, links) => {
  const selectedLinks = [];
  for (const listName in links) {
    if (isObject(links[listName]) && isObject(links[listName][id])) {
      selectedLinks.push({ listName, link: links[listName][id] });
    }
  }

  for (const { listName, link } of selectedLinks) {
    if (![ADDED, REMOVING, PENDING_REMOVING].includes(link.status)) {
      return { listName, link };
    }
  }
  for (const { listName, link } of selectedLinks) {
    if (link.status === ADDED) return { listName, link };
  }
  if (selectedLinks.length > 0) return selectedLinks[0];

  return { listName: null, link: null };
};

export const getNLinkObjs = (params) => {
  const { links, listName, doDescendingOrder, pinFPaths, pendingPins } = params;

  let excludingIds = [], excludingMainIds = [];
  if (Array.isArray(params.excludingIds)) excludingIds = params.excludingIds;
  if (Array.isArray(params.excludingMainIds)) {
    excludingMainIds = params.excludingMainIds;
  }

  let namedLinks = [];
  if (isObject(links[listName])) namedLinks = Object.values(links[listName]);

  let sortedLinks = sortLinks(namedLinks, doDescendingOrder);
  sortedLinks = sortWithPins(sortedLinks, pinFPaths, pendingPins, (link) => {
    return getMainId(link.id);
  });

  // With pins, can't fetch further from the current point
  const objs = [], objsWithPcEc = [];
  for (const link of sortedLinks) {
    const { id, status } = link;
    if ([REMOVING, PENDING_REMOVING].includes(status)) continue;

    if (excludingIds.includes(id) || excludingMainIds.includes(getMainId(id))) {
      objsWithPcEc.push(link);
      continue;
    }
    if (status !== ADDED) {
      objsWithPcEc.push(link);
      continue;
    }
    if (objs.length < N_LINKS) {
      objs.push(link);
      objsWithPcEc.push(link);
    }
  }

  const hasMore = objsWithPcEc.length < sortedLinks.length;

  let foundNotExcl = false, hasDisorder = false;
  for (const link of objsWithPcEc) {
    const { id } = link;

    if (excludingIds.includes(id) || excludingMainIds.includes(getMainId(id))) {
      if (foundNotExcl) {
        hasDisorder = true;
        break;
      }
      continue;
    }
    foundNotExcl = true;
  }

  return { hasMore, hasDisorder, objsWithPcEc };
};

export const getNLinkMetas = (params) => {
  const {
    linkFPaths, ssltFPaths, pendingSslts, links, listName, doDescendingOrder, pinFPaths,
    pendingPins,
  } = params;

  let excludingIds = [], excludingMainIds = [];
  if (Array.isArray(params.excludingIds)) excludingIds = params.excludingIds;
  if (Array.isArray(params.excludingMainIds)) {
    excludingMainIds = params.excludingMainIds;
  }

  const pcListNames = [], pcLinks = [], processingLinkIds = [];
  for (const ln in links) {
    for (const link of Object.values<any>(links[ln])) {
      if (link.status === ADDED) continue;
      pcListNames.push(ln);
      pcLinks.push(link);
      processingLinkIds.push(link.id);
    }
  }

  const { linkMetas: _linkMetas } = listLinkMetas(linkFPaths, ssltFPaths, pendingSslts);
  const { linkMetas } = applyPcLinksToMetas(pcListNames, pcLinks, _linkMetas);

  const fsMetas = linkMetas.filter(meta => meta.listName === listName);
  fsMetas.sort((a, b) => a.addedDT - b.addedDT);
  if (doDescendingOrder) fsMetas.reverse();

  const cbMetas = sortWithPins(fsMetas, pinFPaths, pendingPins, (meta) => {
    return getMainId(meta.id);
  });

  const metas = [], metasWithPcEc = [];
  for (const meta of cbMetas) {
    const { id } = meta;
    const mainId = getMainId(id);

    if (excludingIds.includes(id) || excludingMainIds.includes(mainId)) {
      metasWithPcEc.push(meta);
      continue;
    }
    if (processingLinkIds.includes(id)) {
      metasWithPcEc.push(meta);
      continue;
    }
    if (metas.length < N_LINKS) {
      metas.push(meta);
      metasWithPcEc.push(meta);
    }
  }

  const idsWithPcEc = metasWithPcEc.map(meta => meta.id);
  const hasMore = cbMetas.some(meta => !idsWithPcEc.includes(meta.id));

  let foundNotExcl = false, hasDisorder = false;
  for (const meta of metasWithPcEc) {
    const { id } = meta;
    const mainId = getMainId(id);

    if (excludingIds.includes(id) || excludingMainIds.includes(mainId)) {
      if (foundNotExcl) {
        hasDisorder = true;
        break;
      }
      continue;
    }
    foundNotExcl = true;
  }

  return { metas, hasMore, hasDisorder, metasWithPcEc };
};

export const newObject = (object, ignoreAttrs) => {
  const nObject: any = {};
  for (const attr in object) {
    if (ignoreAttrs.includes(attr)) continue;
    nObject[attr] = object[attr];
  }
  return nObject;
};

export const addFetchedToVars = (lnOrQt, links, vars) => {
  const { fetchedLnOrQts, fetchedLinkIds } = vars.fetch;

  if (isString(lnOrQt) && !fetchedLnOrQts.includes(lnOrQt)) {
    fetchedLnOrQts.push(lnOrQt);
  }

  if (isObject(links) && !Array.isArray(links)) {
    for (const listName in links) {
      for (const id in links[listName]) {
        if (!fetchedLinkIds.includes(id)) fetchedLinkIds.push(id);
      }
    }
  } else if (Array.isArray(links)) {
    for (const link of links) {
      if (!fetchedLinkIds.includes(link.id)) fetchedLinkIds.push(link.id);
    }
  }
};

export const isFetchedLinkId = (fetchedLinkIds, links, listName, id) => {
  if (!fetchedLinkIds.includes(id)) return false;

  // Beware, in fetchedLinkIds but might not in links!
  //   e.g. delete by UPDATE_FETCHED or UPDATE_FETCHED_MORE
  //   so need to check still in the links.
  // The flow should be like showingLinkIds/fpaths -> links -> filtered by fetched.
  if (!isObject(links[listName]) || !isObject(links[listName][id])) return false;
  return true;
};

export const doesIncludeFetching = (lnOrQt, doForce, fetchingInfos) => {
  for (const info of fetchingInfos) {
    if (info.type !== FETCH) continue;
    if (info.lnOrQt === lnOrQt) {
      if (!doForce) return true;
      if (info.doForce === doForce) return true;
    }
  }
  return false;
};

export const doesIncludeFetchingMore = (lnOrQt, doForCompare, fetchingInfos) => {
  for (const info of fetchingInfos) {
    if (info.type !== FETCH_MORE) continue;
    if (info.lnOrQt === lnOrQt && info.doForCompare === doForCompare) return true;
  }
  return false;
};

export const isFetchingInterrupted = (fthId, fetchingInfos) => {
  for (const info of fetchingInfos) {
    if (info.fthId === fthId) return !!info.isInterrupted;
  }
  return false;
};

export const getTagFPaths = (state) => {
  if (
    isObject(state.cachedFPaths) &&
    isObject(state.cachedFPaths.fpaths) &&
    Array.isArray(state.cachedFPaths.fpaths.tagFPaths)
  ) {
    return state.cachedFPaths.fpaths.tagFPaths;
  }
  return getEmptyArray('getTagFPaths');
};

export const getRawTags = createSelector(
  tagFPaths => tagFPaths,
  (tagFPaths) => {
    const tags = {};
    for (const fpath of tagFPaths) {
      const { tagName, rank, updatedDT, addedDT, id } = extractTagFPath(fpath);
      const mainId = getMainId(id);

      if (!isObject(tags[mainId])) tags[mainId] = { values: [] };

      const { values } = tags[mainId];

      const i = values.findIndex(tag => tag.tagName === tagName);
      if (i < 0) {
        values.push({ tagName, rank, updatedDT, addedDT, id, fpath });
        continue;
      }

      if (values[i].updatedDT > updatedDT) continue;

      tags[mainId].values = [
        ...values.slice(0, i),
        ...values.slice(i + 1),
        { tagName, rank, updatedDT, addedDT, id, fpath },
      ];
    }

    for (const mainId in tags) {
      tags[mainId].values.sort((a, b) => { // Beware sort in place
        if (a.rank < b.rank) return -1;
        if (a.rank > b.rank) return 1;
        return 0;
      });
    }

    return tags;
  },
);

export const getTags = (tagFPaths, pendingTags) => {
  const rawTags = getRawTags(tagFPaths);

  const tags = { ...rawTags };
  for (const id in pendingTags) {
    const mainId = getMainId(id);
    tags[mainId] = { ...tags[mainId], ...pendingTags[id] };
  }

  return tags;
};

export const getTagNameObj = (tagName, tagNameObjs) => {
  if (!tagName || !tagNameObjs) return { tagNameObj: null };

  for (const tagNameObj of tagNameObjs) {
    if (tagNameObj.tagName === tagName) return { tagNameObj };
  }

  return { tagNameObj: null };
};

export const getTagNameObjFromDisplayName = (displayName, tagNameObjs) => {
  if (!displayName || !tagNameObjs) return { tagNameObj: null };

  for (const tagNameObj of tagNameObjs) {
    if (tagNameObj.displayName === displayName) return { tagNameObj };
  }

  return { tagNameObj: null };
};

export const getTagNameDisplayName = (tagName, tagNameMap) => {
  const { tagNameObj } = getTagNameObj(tagName, tagNameMap);
  if (tagNameObj) return tagNameObj.displayName;

  return tagName;
};

export const doContainTagName = (tagName, tagNameObjs) => {
  const { tagNameObj } = getTagNameObj(tagName, tagNameObjs);
  if (tagNameObj) return true;

  return false;
};

export const doDuplicateTagNameDisplayName = (tagName, displayName, tagNameMap) => {
  for (const obj of tagNameMap) {
    if (obj.tagName === tagName) continue;
    if (obj.displayName === displayName) return true;
  }
  return false;
};

export const validateTagNameDisplayName = (tagName, displayName, tagNameMap) => {
  // Validate:
  //   1. Empty 2. Contain space at the begining or the end
  //   3. Contain invalid characters 4. Too long 5. Duplicate
  //
  // 2 and 3 are not the problem because this is display name!

  if (!displayName || !isString(displayName) || displayName === '') return NO_TAG_NAME;
  if (displayName.length > 256) return TOO_LONG_TAG_NAME;

  if (doDuplicateTagNameDisplayName(tagName, displayName, tagNameMap)) {
    return DUPLICATE_TAG_NAME;
  }

  return VALID_TAG_NAME;
};

export const copyTagNameObjs = (tagNameObjs, excludedTagNames = []) => {
  const objs = tagNameObjs.filter(tagNameObj => {
    return !excludedTagNames.includes(tagNameObj.tagName);
  }).map(tagNameObj => {
    const obj = { ...tagNameObj };
    return obj;
  });
  return objs;
};

export const getInUseTagNames = (linkMetas, tagFPaths, pendingTags) => {
  const linkMainIds = getLinkMainIds(linkMetas);

  const inUseTagNames = [];
  for (const fpath of tagFPaths) {
    const { tagName, id } = extractTagFPath(fpath);

    const tagMainId = getMainId(id);
    if (!isString(tagMainId) || !linkMainIds.includes(tagMainId)) continue;

    if (!inUseTagNames.includes(tagName)) inUseTagNames.push(tagName);
  }
  for (const id in pendingTags) {
    const { values } = pendingTags[id];
    for (const value of values) {
      const { tagName } = value;
      if (!inUseTagNames.includes(tagName)) inUseTagNames.push(tagName);
    }
  }

  return inUseTagNames;
};

export const getEditingTagNameEditors = (tagNameEditors, tagNameObjs) => {
  let editingTNEs = null;
  for (const k in tagNameEditors) {
    if (tagNameEditors[k].mode !== MODE_EDIT) continue;
    if (!isString(tagNameEditors[k].value)) continue;

    let displayName = ''; // Empty string and no tagNameObj for newTagNameEditor
    const { tagNameObj } = getTagNameObj(k, tagNameObjs);
    if (isObject(tagNameObj)) displayName = tagNameObj.displayName;

    if (tagNameEditors[k].value === displayName) continue;

    if (!isObject(editingTNEs)) editingTNEs = {};
    editingTNEs[k] = { ...tagNameEditors[k] };
  }
  return editingTNEs;
};

export const isTaggingStatus = (tagStatus) => {
  return [
    UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_S_STEP_COMMIT,
    UPDATE_TAG_DATA_S_STEP_ROLLBACK, UPDATE_TAG_DATA_T_STEP,
    UPDATE_TAG_DATA_T_STEP_ROLLBACK,
  ].includes(tagStatus);
};

const getLinkMetasByTagName = (
  linkMetas, tagFPaths, pendingTags, selectedTagName, doForceLock, lockedLists,
) => {
  const tags = getTags(tagFPaths, pendingTags);

  const mainIds = [];
  for (const mainId in tags) {
    const found = tags[mainId].values.some(value => {
      return value.tagName === selectedTagName;
    });
    if (found) mainIds.push(mainId);
  }

  const metas = [];
  for (const meta of linkMetas) {
    const { id, listName } = meta;
    if (listName === TRASH) continue;

    const lockStatus = getLockListStatus(doForceLock, lockedLists, listName);
    if (lockStatus === LOCKED) continue;

    const mainId = getMainId(id);
    if (!mainIds.includes(mainId)) continue;
    metas.push(meta);
  }

  return metas;
};

export const getNLinkMetasByQt = (params) => {
  const {
    linkFPaths, ssltFPaths, pendingSslts, links, doDescendingOrder, pinFPaths,
    pendingPins, tagFPaths, pendingTags, doForceLock, lockedLists, queryString,
  } = params;

  let excludingIds = [], excludingMainIds = [];
  if (Array.isArray(params.excludingIds)) excludingIds = params.excludingIds;
  if (Array.isArray(params.excludingMainIds)) {
    excludingMainIds = params.excludingMainIds;
  }

  const pcListNames = [], pcLinks = [], processingLinkIds = [];
  for (const ln in links) {
    for (const link of Object.values<any>(links[ln])) {
      if (link.status === ADDED) continue;
      pcListNames.push(ln);
      pcLinks.push(link);
      processingLinkIds.push(link.id);
    }
  }

  const { linkMetas: _linkMetas } = listLinkMetas(linkFPaths, ssltFPaths, pendingSslts);
  const { linkMetas } = applyPcLinksToMetas(pcListNames, pcLinks, _linkMetas);

  // Only tag name for now
  const tagName = queryString.trim();
  const fsMetas = getLinkMetasByTagName(
    linkMetas, tagFPaths, pendingTags, tagName, doForceLock, lockedLists,
  );
  fsMetas.sort((a, b) => a.addedDT - b.addedDT);
  if (doDescendingOrder) fsMetas.reverse();

  const cbMetas = sortWithPins(fsMetas, pinFPaths, pendingPins, (meta) => {
    return getMainId(meta.id);
  });

  const metas = [], metasWithPcEc = [];
  for (const meta of cbMetas) {
    const { id } = meta;
    const mainId = getMainId(id);

    if (excludingIds.includes(id) || excludingMainIds.includes(mainId)) {
      metasWithPcEc.push(meta);
      continue;
    }
    if (processingLinkIds.includes(meta)) {
      metasWithPcEc.push(meta);
      continue;
    }
    if (metas.length < N_LINKS) {
      metas.push(meta);
      metasWithPcEc.push(meta);
    }
  }

  const idsWithPcEc = metasWithPcEc.map(meta => meta.id);
  const hasMore = cbMetas.some(meta => !idsWithPcEc.includes(meta.id));

  let foundNotExcl = false, hasDisorder = false;
  for (const meta of metasWithPcEc) {
    const { id } = meta;
    const mainId = getMainId(id);

    if (excludingIds.includes(id) || excludingMainIds.includes(mainId)) {
      if (foundNotExcl) {
        hasDisorder = true;
        break;
      }
      continue;
    }
    foundNotExcl = true;
  }

  return { metas, hasMore, hasDisorder, metasWithPcEc };
};

export const getArraysPerKey = (keys, values) => {
  const arraysPerKey = {};
  for (let i = 0; i < keys.length; i++) {
    const [key, value] = [keys[i], values[i]];
    if (!Array.isArray(arraysPerKey[key])) arraysPerKey[key] = [];
    arraysPerKey[key].push(value);
  }
  return arraysPerKey;
};

export const getPerformFilesDataPerId = (data) => {
  let dataPerId = {};
  if (Array.isArray(data.values) && [true, false].includes(data.isSequential)) {
    for (const value of data.values) {
      const _dataPerId = getPerformFilesDataPerId(value);
      dataPerId = { ...dataPerId, ..._dataPerId };
    }
  } else if (isString(data.id) && isString(data.type) && isString(data.path)) {
    dataPerId[data.id] = data;
  } else {
    console.log('In getPerformFilesDataPerId, invalid data:', data);
  }
  return dataPerId;
};

export const getPerformFilesResultsPerId = (results) => {
  const resultPerId = {};
  for (const result of results) {
    resultPerId[result.id] = result;
  }
  return resultPerId;
};

const _throwIfPerformFilesError = (data, resultsPerId) => {
  if (Array.isArray(data.values) && [true, false].includes(data.isSequential)) {
    for (const value of data.values) {
      _throwIfPerformFilesError(value, resultsPerId);
    }
  } else if (isString(data.id) && isString(data.type) && isString(data.path)) {
    const result = resultsPerId[data.id];
    if (!isObject(result)) throw new Error('Error on previous dependent item');
    if (!result.success) throw new Error(result.error);
  } else {
    console.log('In getPerformFilesDataPerId, invalid data:', data);
  }
};

export const throwIfPerformFilesError = (data, results) => {
  const resultsPerId = getPerformFilesResultsPerId(results);
  _throwIfPerformFilesError(data, resultsPerId);
};

export const getRect = (x, y, width, height) => {
  const rect = {
    x, y, width, height, left: x, right: x + width, top: y, bottom: y + height,
  };
  return rect;
};

export const adjustRect = (rect, oX, oY, oW, oH) => {
  const newX = rect.x + oX, newY = rect.y + oY;
  const newW = rect.width + oW, newH = rect.height + oH;
  const nRect = {
    x: newX, y: newY, width: newW, height: newH,
    top: newY, bottom: newY + newH, left: newX, right: newX + newW,
  };
  return nRect;
};

export const getResErrMsg = async (res) => {
  let bodyText = '';
  try {
    const json = await res.json();
    bodyText = json.error;
  } catch (error) {
    console.log('No json error attr from http response body.', error);
  }

  let msg = `${res.status}`;
  if (isFldStr(res.statusText)) msg += ' ' + res.statusText;
  if (isFldStr(bodyText)) msg += ' ' + bodyText;
  return msg;
};
