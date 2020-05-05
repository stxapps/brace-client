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

export const _ = { mapKeys, select, update, extract, exclude, ignore };

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
