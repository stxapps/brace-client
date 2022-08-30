import { WHT_MODE, BLK_MODE } from '../types/const';
import { isNumber, isString } from '../utils';

const THEME_MODES = [WHT_MODE, BLK_MODE];
const THEME_PREFIXES = ['', 'blk:'];

const filterByTheme = (classes, themeMode) => {
  const themeBuckets = [];
  for (let i = 0; i < THEME_MODES.length; i++) themeBuckets.push([]);

  for (const className of classes) {
    let i = 0, newClassName = className;
    for (let j = 1; j < THEME_PREFIXES.length; j++) {
      const prefix = THEME_PREFIXES[j];
      if (newClassName.includes(prefix)) {
        i = j;
        break;
      }
    }

    themeBuckets[i].push(newClassName);
  }

  let selectedClasses = themeBuckets[0];
  for (let i = 1; i < THEME_MODES.length; i++) {
    if (themeMode === THEME_MODES[i]) {
      selectedClasses = [...selectedClasses, ...themeBuckets[i]];
      break;
    }
  }

  return selectedClasses;
};

const tailwind = (classStr, windowWidth, themeMode) => {
  if (!isNumber(windowWidth)) {
    console.log('In tailwind, found NAN windowWidth: ', windowWidth);
  }
  if (!isNumber(themeMode)) {
    console.log('In tailwind, found NAN themeMode: ', themeMode);
  }

  if (!isString(classStr) || classStr.length === 0) return '';

  let classes = classStr.trim().split(/\s+/);
  classes = filterByTheme(classes, themeMode);

  const newClassStr = classes.join(' ');
  return newClassStr;
};

export { tailwind };
