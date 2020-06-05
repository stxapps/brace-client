import Url from 'url-parse';

import {
  HTTP, HTTPS, WWW,
  DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  COLOR, PATTERN, IMAGE,
  COLORS, COLOR_WEIGHTS, PATTERNS,
  VALID_URL, NO_URL, ASK_CONFIRM_URL,
} from '../types/const';
import { IMAGES } from '../types/imagePaths';

export const randomString = (length) => {

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export class DefaultDict {
  constructor(defaultInit) {
    return new Proxy({}, {
      get: (target, name) => name in target ?
        target[name] :
        (target[name] = typeof defaultInit === 'function' ?
          new defaultInit().valueOf() :
          defaultInit)
    })
  }
}

const mapKeys = (arr, key) => {
  const obj = {};
  for (const el of arr) {
    obj[el[key]] = el;
  }
  return obj;
};

const select = (obj, key, value) => {
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
  const newObj = {};
  for (const id in obj) {
    if (conKey === null) {
      newObj[id] = _update(obj[id], updKey, updValue);
      continue;
    }

    if (Array.isArray(conValue)) {
      if (conValue.includes(obj[id][conKey])) {
        newObj[id] = _update(obj[id], updKey, updValue);
        continue
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

const extract = (obj, key) => {
  const arr = [];
  for (const id in obj) {
    arr.push(obj[id][key]);
  }
  return arr;
};

const exclude = (obj, key, value) => {
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

const ignore = (obj, key) => {
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

export const _ = { mapKeys, select, update, extract, exclude, ignore, copyAttr };

const fallbackCopyTextToClipboard = (text) => {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

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

export const containUppercase = (letters) => {
  for (let i = 0; i < letters.length; i++) {
    if (letters[i] === letters[i].toUpperCase()
      && letters[i] !== letters[i].toLowerCase()) {
      return true;
    }
  }
  return false;
};

export const containUrlProtocol = (url) => {
  const urlObj = new Url(url, {});
  return urlObj.protocol && urlObj.protocol !== '';
};

export const ensureContainUrlProtocol = (url) => {
  if (!containUrlProtocol(url)) return HTTP + url;
  return url;
};

export const extractUrl = (url) => {
  url = ensureContainUrlProtocol(url);
  const urlObj = new Url(url, {});
  return {
    host: urlObj.host,
    origin: urlObj.origin,
  };
};

export const getUrlFirstChar = (url) => {
  url = ensureContainUrlProtocol(url);
  const urlObj = new Url(url, {});

  return urlObj.hostname.split('.').slice(-2)[0][0];
};

export const validateUrl = (url) => {

  if (!url) {
    return NO_URL;
  }

  url = ensureContainUrlProtocol(url);

  const urlObj = new Url(url, {});
  if (!urlObj.hostname.match(/^([-a-zA-Z0-9@:%_+~#=]{2,256}\.)+[a-z]{2,6}$/)) {
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

export const subtractPixel = (a, b) => {
  a = parseInt(a.slice(0, -2));
  b = parseInt(b.slice(0, -2));

  return (a - b).toString() + 'px';
};

export const addRem = (a, b) => {
  a = parseFloat(a.slice(0, -3));
  b = parseFloat(b.slice(0, -3));

  return (a + b).toString() + 'rem';
};

export const isEqual = function (x, y) {
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

    if (typeof (x[p]) !== "object") return false;
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

export const isDiedStatus = (status) => {
  return [DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING].includes(status);
};

export const randInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

export const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
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
    decor.image.bg.value = `${sample(COLORS)}-${sample(COLOR_WEIGHTS)}`;
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
    decor.favicon.bg.value = `${sample(COLORS)}-${sample(COLOR_WEIGHTS)}`;
  } else {
    decor.image.bg.type = PATTERN;
    decor.image.bg.value = sample(PATTERNS);
  }

  return decor;
};

export const truncateString = (s, n) => {
  if (!(typeof s === 'string' || s instanceof String)) return s;

  if (s.length <= n) {
    return s;
  }

  return s.slice(0, n) + '...';
};

export const getWindowHeight = () => {
  return "innerHeight" in window ? window.innerHeight : window.document.documentElement.offsetHeight;
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
