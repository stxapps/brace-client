import {
  WHT_MODE, BLK_MODE, SM_WIDTH, MD_WIDTH, LG_WIDTH, XL_WIDTH,
} from '../types/const';
import { isNumber, isString, toPx } from '../utils';

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

const SCREEN_VALUES = ['0rem', SM_WIDTH, MD_WIDTH, LG_WIDTH, XL_WIDTH];
const SCREEN_PREFIXES = ['', 'sm:', 'md:', 'lg:', 'xl:'];

const filterByScreen = (classes, windowWidth) => {
  const themeBuckets = [];
  for (let i = 0; i < SCREEN_VALUES.length; i++) themeBuckets.push([]);

  for (const className of classes) {
    let i = 0, newClassName = className;
    for (let j = 1; j < SCREEN_PREFIXES.length; j++) {
      const prefix = SCREEN_PREFIXES[j];
      if (newClassName.includes(prefix)) {
        i = j;
        break;
      }
    }

    themeBuckets[i].push(newClassName);
  }

  let selectedClasses = themeBuckets[0];
  for (let i = 1; i < SCREEN_VALUES.length; i++) {
    if (windowWidth >= toPx(SCREEN_VALUES[i])) {
      selectedClasses = [...selectedClasses, ...themeBuckets[i]];
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
  classes = filterByScreen(classes, windowWidth);
  classes = filterByTheme(classes, themeMode);

  const newClassStr = classes.join(' ');
  return newClassStr;
};

export { tailwind };
