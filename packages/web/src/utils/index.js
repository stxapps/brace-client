import Url from 'url-parse';

import {
  HTTP, HTTPS, WWW,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  COLOR, PATTERN, IMAGE,
  BG_COLOR_STYLES, PATTERNS,
  VALID_URL, NO_URL, ASK_CONFIRM_URL,
  VALID_LIST_NAME, NO_LIST_NAME, TOO_LONG_LIST_NAME, DUPLICATE_LIST_NAME,
} from '../types/const';
import { FETCH } from '../types/actionTypes';
import { IMAGES } from '../types/imagePaths';

/**
 * Convert an array of objects to an object of objects.
 **/
const mapKeys = (arr, key) => {
  if (!Array.isArray(arr)) throw new Error(`Must be arr: ${arr}`);

  const obj = {};
  for (const el of arr) {
    obj[el[key]] = el;
  }
  return obj;
};

/**
 * Select objects that meet the criteria: key and value
 *   returning an object with selected objects.
 **/
const select = (obj, key, value) => {
  if (Array.isArray(obj)) throw new Error(`Must be obj, not arr: ${obj}`);

  const newObj = {};
  for (const id in obj) {
    if (Array.isArray(value)) {
      if (value.includes(obj[id][key])) {
        newObj[id] = obj[id];
      }
      continue;
    }

    if (obj[id][key] === value) {
      newObj[id] = obj[id];
    }
  }
  return newObj;
};

const _update = (obj, updKey, updValue) => {
  const newObj = { ...obj };
  if (Array.isArray(updKey)) {
    for (let i = 0; i < updKey.length; i++) {
      newObj[updKey[i]] = updValue[i];
    }
  } else {
    newObj[updKey] = updValue;
  }
  return newObj;
};

const update = (obj, conKey, conValue, updKey, updValue) => {
  if (Array.isArray(obj)) throw new Error(`Must be obj, not arr: ${obj}`);

  const newObj = {};
  for (const id in obj) {
    if (conKey === null) {
      newObj[id] = _update(obj[id], updKey, updValue);
      continue;
    }

    if (Array.isArray(conValue)) {
      if (conValue.includes(obj[id][conKey])) {
        newObj[id] = _update(obj[id], updKey, updValue);
        continue;
      }

      newObj[id] = { ...obj[id] };
      continue;
    }

    if (obj[id][conKey] === conValue) {
      newObj[id] = _update(obj[id], updKey, updValue);
      continue;
    }

    newObj[id] = { ...obj[id] };
  }
  return newObj;
};

/**
 * Extract an array of values from objects in an object or an array.
 **/
const extract = (obj, key) => {

  const arr = [];
  if (Array.isArray(obj)) {
    for (const el of obj) {
      arr.push(el[key]);
    }
  } else {
    for (const id in obj) {
      arr.push(obj[id][key]);
    }
  }

  return arr;
};

/**
 * Exclude objects in an object that meets the criteria.
 **/
const exclude = (obj, key, value) => {
  if (Array.isArray(obj)) throw new Error(`Must be obj, not arr: ${obj}`);

  const newObj = {};
  for (const id in obj) {
    if (Array.isArray(value)) {
      if (value.includes(obj[id][key])) {
        continue;
      }

      newObj[id] = obj[id];
      continue;
    }

    if (obj[id][key] === value) {
      continue;
    }
    newObj[id] = obj[id];
  }
  return newObj;
};

/**
 * Return an object of objects without/ignoring some attributes that meet the criteria.
 **/
const ignore = (obj, key) => {
  if (Array.isArray(obj)) throw new Error(`Must be obj, not arr: ${obj}`);

  const newObj = {};
  for (const id in obj) {
    const newObjEl = {};
    for (const keyEl in obj[id]) {
      if (Array.isArray(key)) {
        if (key.includes(keyEl)) {
          continue;
        }

        newObjEl[keyEl] = obj[id][keyEl];
        continue;
      }

      if (key === keyEl) {
        continue;
      }

      newObjEl[keyEl] = obj[id][keyEl];
    }
    newObj[id] = newObjEl;
  }
  return newObj;
};

const copyAttr = (obj, copiedObj, key) => {
  if (Array.isArray(obj)) throw new Error(`Must be obj, not arr: ${obj}`);

  if (!obj || !copiedObj) {
    return obj;
  }

  const objKeys = Object.keys(obj);
  const copiedObjKeys = Object.keys(copiedObj);

  const newObj = {};

  for (const objKey of objKeys) {
    if (copiedObjKeys.includes(objKey)) {
      newObj[objKey] = { ...obj[objKey] };
      if (Array.isArray(key)) {
        for (const k of key) {
          newObj[objKey][k] = copiedObj[objKey][k];
        }
      } else {
        newObj[objKey][key] = copiedObj[objKey][key];
      }
    } else {
      newObj[objKey] = obj[objKey];
    }
  }

  return newObj;
};

/**
 * Return an object of objects containing/choosing only attributes specified in key.
 */
const choose = (obj, key) => {
  if (Array.isArray(obj)) throw new Error(`Must be obj, not arr: ${obj}`);

  const newObj = {};
  for (const id in obj) {
    const newObjEl = {};
    for (const keyEl in obj[id]) {
      if (Array.isArray(key)) {
        if (key.includes(keyEl)) newObjEl[keyEl] = obj[id][keyEl];
        continue;
      }

      if (key === keyEl) newObjEl[keyEl] = obj[id][keyEl];
    }
    newObj[id] = newObjEl;
  }

  return newObj;
};

export const _ = { mapKeys, select, update, extract, exclude, ignore, copyAttr, choose };

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

export const isObject = val => {
  return typeof val === 'object' && val !== null;
};

export const isString = val => {
  return typeof val === 'string' || val instanceof String;
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

export const getListNameDisplayName = (listName, listNameMap) => {
  for (const listNameObj of listNameMap) {
    if (listNameObj.listName === listName) return listNameObj.displayName;
  }

  // Not throw an error because it can happen:
  //   - Delete a link
  //   - Delete a list name
  //   - Commit delete the link -> cause rerender without the list name!
  console.log(`getListNameDisplayName: invalid listName: ${listName} and listNameMap: ${listNameMap}`);
  return listName;
};

export const getLongestListNameDisplayName = (listNameMap) => {
  let displayName = '';
  for (const listNameObj of listNameMap) {
    if (listNameObj.displayName.length > displayName.length) {
      displayName = listNameObj.displayName;
    }
  }
  return displayName;
};

export const doContainListName = (listName, listNameObjs) => {

  for (const listNameObj of listNameObjs) {
    if (listNameObj.listName === listName) return true;
  }

  return false;
};

export const doContainListNameDisplayName = (displayName, listNameObjs) => {

  for (const listNameObj of listNameObjs) {
    if (listNameObj.displayName === displayName) return true;
  }

  return false;
};

export const validateListNameDisplayName = (displayName, listNameMap) => {

  // Validate:
  //   1. Empty 2. Contain space at the begining or the end 3. Contain invalid characters
  //   4. Too long 5. Duplicate
  //
  // 2 and 3 are not the problem because this is display name!

  if (!displayName || !isString(displayName) || displayName === '') return NO_LIST_NAME;
  if (displayName.length > 256) return TOO_LONG_LIST_NAME;

  if (doContainListNameDisplayName(displayName, listNameMap)) return DUPLICATE_LIST_NAME;

  return VALID_LIST_NAME;
};

export const isDiedStatus = (status) => {
  return [
    DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  ].includes(status);
};

export const getLastHalfHeight = (height, textHeight, pt, pb, halfRatio = 0.6) => {
  const x = Math.floor((height - pt - pb) / textHeight) - 1;
  return Math.round((textHeight * x + textHeight * halfRatio) + pt + pb);
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

export const getInsertIndex = (listNameObj, oldListNameMap, newListNameMap) => {

  // listNameObj is in oldListNameMap and try to find where to insert into newListNameMap
  //   while preserving the order.

  const i = oldListNameMap.findIndex(obj => obj.listName === listNameObj.listName);
  if (i < 0) {
    console.log(`getInsertIndex: invalid listNameObj: ${listNameObj} and oldListNameMap: ${oldListNameMap}`);
    return -1;
  }

  let prev = i - 1;
  let next = i + 1;
  while (prev >= 0 || next < oldListNameMap.length) {
    if (prev >= 0) {
      const listName = oldListNameMap[prev].listName;
      const listNameIndex = newListNameMap.findIndex(obj => obj.listName === listName);
      if (listNameIndex >= 0) return listNameIndex + 1;
      prev -= 1;
    }
    if (next < oldListNameMap.length) {
      const listName = oldListNameMap[next].listName;
      const listNameIndex = newListNameMap.findIndex(obj => obj.listName === listName);
      if (listNameIndex >= 0) return listNameIndex;
      next += 1;
    }
  }

  return -1;
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
