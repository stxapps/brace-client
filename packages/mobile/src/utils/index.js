import { createSelector } from 'reselect';
import Url from 'url-parse';

import {
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, DELETE_OLD_LINKS_IN_TRASH,
  DELETE_OLD_LINKS_IN_TRASH_COMMIT, DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
  PIN_LINK, PIN_LINK_ROLLBACK, UNPIN_LINK, UNPIN_LINK_ROLLBACK,
  MOVE_PINNED_LINK_ADD_STEP, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
} from '../types/actionTypes';
import {
  HTTP, HTTPS, WWW, STATUS, ID, LINKS, SETTINGS, PINS, DOT_JSON, ADDED, MOVED, ADDING,
  MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  COLOR, PATTERN, IMAGE, BG_COLOR_STYLES, PATTERNS, VALID_URL, NO_URL, ASK_CONFIRM_URL,
  VALID_LIST_NAME, NO_LIST_NAME, TOO_LONG_LIST_NAME, DUPLICATE_LIST_NAME,
  COM_BRACEDOTTO_SUPPORTER, ACTIVE, NO_RENEW, GRACE, ON_HOLD, PAUSED, UNKNOWN,
} from '../types/const';
import { IMAGES } from '../types/imagePaths';
import { _ } from './obj';

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
  return typeof val === 'string' || val instanceof String;
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
  //   1. Empty 2. Contain space at the begining or the end 3. Contain invalid characters
  //   4. Too long 5. Duplicate
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
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const isStringIn = (link, searchString) => {
  let url = link.url;
  if (!containUppercase(searchString)) {
    url = url.toLowerCase();
  }
  if (url.startsWith(HTTP)) {
    url = url.substring(HTTP.length);
  }
  if (url.startsWith(HTTPS)) {
    url = url.substring(HTTPS.length);
  }
  if (url.startsWith(WWW)) {
    url = url.substring(WWW.length);
  }

  const searchWords = searchString.split(' ');

  let inUrl = searchWords.every(word => url.includes(word));

  let inTitle = null;
  if (link.title) {
    inTitle = searchWords.every(word => link.title.includes(word));
  }

  if (inTitle === null) {
    if (inUrl) {
      return true;
    }
  } else {
    if (inUrl || inTitle) {
      return true;
    }
  }

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
      bg: {},
      fg: null,
    },
    favicon: {
      bg: {},
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
    decor.image.bg.value = sample(IMAGES);
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
  var textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
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
  if (arr.length !== 3 && arr.length !== 4) throw new Error(`Invalid id: ${id}`);

  arr[2] = randomString(4);
  return arr.join('-');
};

export const deleteRemovedDT = (id) => {
  const arr = id.split('-');
  if (arr.length !== 3 && arr.length !== 4) throw new Error(`Invalid id: ${id}`);

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

export const getWindowHeight = () => {
  return 'innerHeight' in window ? window.innerHeight : window.document.documentElement.offsetHeight;
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

export const getFormattedDate = (d) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const year = d.getFullYear();
  const month = months[d.getMonth()];
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
    console.log('Invalid offline action: ', action);
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
    console.log('Invalid offline action: ', action);
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
              (params.doFetchSettings && payload.doFetchSettings) ||
              (params.doFetchSettings && !payload.doFetchSettings) ||
              (!params.doFetchSettings && !payload.doFetchSettings)
            ) return false;
          }
        }
      } catch (error) {
        console.log('Invalid action or payload: ', action, payload);
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
        console.log('Invalid action: ', action);
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

export const splitOnFirst = (str, sep) => {
  const i = str.indexOf(sep);
  if (i < 0) return [str, ''];

  return [str.slice(0, i), str.slice(i + sep.length)];
};

export const escapeDoubleQuotes = (s) => {
  return s.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

export const isDecorValid = (data) => {
  if (!('decor' in data)) return false;
  if (!('image' in data.decor && 'favicon' in data.decor)) return false;
  if (!('bg' in data.decor.image && 'bg' in data.decor.favicon)) return false;
  if (!(isObject(data.decor.image.bg) && isObject(data.decor.favicon.bg))) return false;

  if (!('type' in data.decor.image.bg && 'value' in data.decor.image.bg)) return false;
  if (!(isString(data.decor.image.bg.type) && isString(data.decor.image.bg.value))) {
    return false;
  }

  if ('fg' in data.decor.image) {
    if (!(
      data.decor.image.fg === null ||
      (
        isObject(data.decor.image.fg) &&
        'text' in data.decor.image.fg &&
        isString(data.decor.image.fg.text)
      )
    )) return false;
  }


  if (!('type' in data.decor.favicon.bg && 'value' in data.decor.favicon.bg)) {
    return false;
  }
  if (!(
    isString(data.decor.favicon.bg.type) &&
    isString(data.decor.favicon.bg.value))
  ) {
    return false;
  }

  return true;
};

export const isExtractedResultValid = (data) => {
  if (!('extractedResult' in data)) return false;
  if (!(
    'url' in data.extractedResult &&
    'extractedDT' in data.extractedResult &&
    'status' in data.extractedResult
  )) return false;

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

export const isListNameObjsValid = (listNameObjs) => {
  if (listNameObjs === undefined || listNameObjs === null) return true;
  if (!Array.isArray(listNameObjs)) return false;

  for (const listNameObj of listNameObjs) {
    if (!('listName' in listNameObj && 'displayName' in listNameObj)) return false;
    if (!(isString(listNameObj.listName) && isString(listNameObj.displayName))) {
      return false;
    }
    if ('children' in listNameObj) {
      if (!isListNameObjsValid(listNameObj.children)) return false;
    }
  }

  return true;
};

export const deriveSettingsState = (listNames, settings, initialState) => {
  const state = settings ? { ...initialState, ...settings } : { ...initialState };
  state.listNameMap = copyListNameObjs(state.listNameMap);

  let i = 1;
  for (const listName of listNames) {
    if (!doContainListName(listName, state.listNameMap)) {
      state.listNameMap.push(
        { listName: listName, displayName: `<missing-name-${i}>` }
      );
      i += 1;
    }
  }

  return state;
};

export const getValidProduct = (products) => {
  if (!Array.isArray(products) || products.length === 0) return null;
  for (const product of products) {
    if (product.productId === COM_BRACEDOTTO_SUPPORTER) return product;
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
  const [listName, fname] = fpath.split('/').slice(1);
  //listName = decodeURIComponent(listName);

  const dotIndex = fname.lastIndexOf('.');
  const ext = fname.substring(dotIndex + 1);
  const id = fname.substring(0, dotIndex);

  return { listName, id, ext };
};

export const createPinFPath = (rank, updatedDT, addedDT, id) => {
  return `${PINS}/${rank}/${updatedDT}/${addedDT}/${id}${DOT_JSON}`;
};

export const extractPinFPath = (fpath) => {
  const [rank, updatedDTStr, addedDTStr, fname] = fpath.split('/').slice(1);

  const updatedDT = parseInt(updatedDTStr, 10);
  const addedDT = parseInt(addedDTStr, 10);

  const dotIndex = fname.lastIndexOf('.');
  const ext = fname.substring(dotIndex + 1);
  const id = fname.substring(0, dotIndex);

  return { rank, updatedDT, addedDT, id, ext };
};

export const addFPath = (fpaths, fpath) => {
  if (fpath.startsWith(LINKS)) {
    const { listName } = extractLinkFPath(fpath);
    if (!fpaths.linkFPaths[listName]) fpaths.linkFPaths[listName] = [];
    if (!fpaths.linkFPaths[listName].includes(fpath)) {
      fpaths.linkFPaths[listName].push(fpath);
    }
  } else if (fpath.startsWith(SETTINGS)) {
    fpaths.settingsFPath = fpath;
  } else if (fpath.startsWith(PINS)) {
    if (!fpaths.pinFPaths.includes(fpath)) fpaths.pinFPaths.push(fpath);
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
      if (fpaths.linkFPaths[listName].length === 0) delete fpaths.linkFPaths[listName];
    }
  } else if (fpath.startsWith(SETTINGS)) {
    if (fpaths.settingsFPath === fpath) fpaths.settingsFPath = null;
  } else if (fpath.startsWith(PINS)) {
    fpaths.pinFPaths = fpaths.pinFPaths.filter(el => el !== fpath);
  } else {
    console.log(`Invalid file path: ${fpath}`);
  }
};

export const copyFPaths = (fpaths) => {
  const newLinkFPaths = {};
  for (const listName in fpaths.linkFPaths) {
    newLinkFPaths[listName] = [...fpaths.linkFPaths[listName]];
  }

  const newPinFPaths = [...fpaths.pinFPaths];

  return { ...fpaths, linkFPaths: newLinkFPaths, pinFPaths: newPinFPaths };
};

export const getPinFPaths = (state) => {
  if (
    isObject(state.cachedFPaths) &&
    isObject(state.cachedFPaths.fpaths) &&
    Array.isArray(state.cachedFPaths.fpaths.pinFPaths)
  ) {
    return state.cachedFPaths.fpaths.pinFPaths;
  }
  return [];
};

const _getPins = (pinFPaths, pendingPins, doExcludeUnpinning) => {
  const pins = {};
  for (const fpath of pinFPaths) {
    const { rank, updatedDT, addedDT, id } = extractPinFPath(fpath);
    const pinMainId = getMainId(id);

    // duplicate id, choose the latest updatedDT
    if (pinMainId in pins && pins[pinMainId].updatedDT > updatedDT) continue;
    pins[pinMainId] = { rank, updatedDT, addedDT, id };
  }

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

/** @type {function(any, any, any): any} */
export const getPins = createSelector(
  (...args) => args[0],
  (...args) => args[1],
  (...args) => args[2],
  _getPins,
);

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

export const getFilteredLinks = (links, listName) => {
  if (!links || !links[listName]) return null;

  const selectedLinks = _.select(
    links[listName],
    STATUS,
    [
      ADDED, MOVED, ADDING, MOVING,
      DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
    ]
  );

  const moving_ids = [];
  for (const key in links) {
    if (key === listName || !links[key]) continue;

    moving_ids.push(..._.extract(_.select(
      links[key], STATUS, [MOVED, MOVING, DIED_MOVING]
    ), ID));
  }

  const filteredLinks = excludeWithMainIds(selectedLinks, moving_ids);
  return filteredLinks;
};

export const sortLinks = (links, doDescendingOrder) => {
  const sortedLinks = [...links].sort((a, b) => {
    return b.addedDT - a.addedDT;
  });
  if (!doDescendingOrder) sortedLinks.reverse();

  return sortedLinks;
};

export const sortFilteredLinks = (filteredLinks, doDescendingOrder) => {
  return sortLinks(Object.values(filteredLinks), doDescendingOrder);
};

export const getSortedLinks = (links, listName, doDescendingOrder) => {
  const filteredLinks = getFilteredLinks(links, listName);
  if (!filteredLinks) return null;

  const sortedLinks = sortFilteredLinks(filteredLinks, doDescendingOrder);
  return sortedLinks;
};

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
