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
