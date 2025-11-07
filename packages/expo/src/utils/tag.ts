import { VALID_TAG_NAME, DUPLICATE_TAG_NAME, TAG_NAME_MSGS } from '../types/const';
import {
  isObject, isString, isArrayEqual, randomString, validateTagNameDisplayName,
  getTagNameObjFromDisplayName, getTags, getMainId, getTagNameObj,
} from '../utils';

export const selectHint = (values, hints, hint) => {
  const found = values.some(value => value.tagName === hint.tagName);
  if (found && hint.isBlur) return {};

  const newValues = [
    ...values,
    { tagName: hint.tagName, displayName: hint.displayName, color: hint.color },
  ];
  const newHints = hints.map(_hint => {
    if (_hint.tagName !== hint.tagName) return _hint;
    return { ..._hint, isBlur: true };
  });

  return { values: newValues, hints: newHints };
};

export const deselectValue = (values, hints, value) => {
  const newValues = values.filter(_value => _value.tagName !== value.tagName);
  const newHints = hints.map(hint => {
    if (hint.tagName !== value.tagName) return hint;
    return { ...hint, isBlur: false };
  });
  return { values: newValues, hints: newHints };
};

export const addTagName = (tagNameMap, values, hints, displayName, color) => {
  displayName = displayName.trim();

  const result = validateTagNameDisplayName(null, displayName, []);
  if (result !== VALID_TAG_NAME) {
    return { msg: TAG_NAME_MSGS[result] };
  }

  const found = values.some(value => value.displayName === displayName);
  if (found) {
    return { msg: TAG_NAME_MSGS[DUPLICATE_TAG_NAME] };
  }

  const { tagNameObj } = getTagNameObjFromDisplayName(displayName, tagNameMap);

  let tagName;
  if (isObject(tagNameObj)) tagName = tagNameObj.tagName;
  if (!isString(tagName)) tagName = `${Date.now()}-${randomString(4)}`;

  const newValues = [...values, { tagName, displayName, color }];
  const newHints = hints.map(hint => {
    if (hint.tagName !== tagName) return hint;
    return { ...hint, isBlur: true };
  });

  return { values: newValues, hints: newHints, displayName: '' };
};

const keyMap = {
  values: 'tagValues',
  hints: 'tagHints',
  displayName: 'tagDisplayName',
  color: 'tagColor',
  msg: 'tagMsg',
};
export const renameKeys = (obj) => {
  const newObj = {};
  for (const oldKey in obj) {
    const newKey = keyMap[oldKey] || oldKey;
    newObj[newKey] = obj[oldKey];
  }
  return newObj;
};

export const getUpdateTagDataSStepPayload = (
  rawIds, rawValuesPerId, tagFPaths, tagNameMap, ssTagNameMap
) => {
  const solvedTags = getTags(tagFPaths, {});

  const ids = [], valuesPerId = {};
  for (const id of rawIds) {
    const [values, mainId] = [rawValuesPerId[id], getMainId(id)];

    const aTns = [], bTns = [];
    if (isObject(solvedTags[mainId])) {
      for (const value of solvedTags[mainId].values) aTns.push(value.tagName);
    }
    for (const value of values) bTns.push(value.tagName);

    if (isArrayEqual(aTns, bTns)) continue;

    ids.push(id);
    valuesPerId[id] = values;
  }

  const newTagNameObjsPerId = {}, newTagNameObjs = [], chkdTagNames = [];
  for (const id of ids) {
    const values = valuesPerId[id];
    for (const value of values) {
      const { tagNameObj } = getTagNameObj(value.tagName, tagNameMap);
      const { tagNameObj: ssTagNameObj } = getTagNameObj(value.tagName, ssTagNameMap);

      if (isObject(tagNameObj) && isObject(ssTagNameObj)) continue;

      if (!Array.isArray(newTagNameObjsPerId[id])) newTagNameObjsPerId[id] = [];
      newTagNameObjsPerId[id].push(value);

      if (!chkdTagNames.includes(value.tagName)) {
        newTagNameObjs.push(value);
        chkdTagNames.push(value.tagName);
      }
    }
  }

  return { ids, valuesPerId, newTagNameObjsPerId, newTagNameObjs };
};
