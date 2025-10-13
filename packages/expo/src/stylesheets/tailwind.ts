import {
  WHT_MODE, BLK_MODE, SM_WIDTH, MD_WIDTH, LG_WIDTH, XL_WIDTH,
} from '../types/const';
import { isNumber, isString, toPx } from '../utils';

import tailwindStyles from './tailwind.json';
import extrasStyles from './extras.json';

const styles = { ...tailwindStyles, ...extrasStyles };

const FONT_VARIANTS = [
  'oldstyle-nums', 'lining-nums', 'tabular-nums', 'proportional-nums',
];

const _tailwind = (classes) => {
  const _style: any = {};
  for (const className of classes) {
    if (className in styles) {
      Object.assign(_style, styles[className]);
    } else {
      console.warn(`Unsupported Tailwind class: "${className}" from classNames: ${classes}`);
    }
  }

  const style: any = {};
  for (const [key, value] of Object.entries<any>(_style)) {
    if (key.startsWith('--')) {
      // Font variant numeric utilities need a special treatment,
      //   because there can be many font variant classes
      //   and they need to be transformed to an array.
      if (FONT_VARIANTS.includes(value)) {
        if (!style.fontVariant) style.fontVariant = [];
        style.fontVariant.push(value);
      }
      continue;
    }

    // Letter spacing needs a special treatment, because its value is set
    //   in em unit, that's why it requires a font size to be set too.
    if (key === 'letterSpacing') {
      if ('fontSize' in _style) {
        const fontSize = _style.fontSize;
        style.letterSpacing = parseFloat(_style[key]) * fontSize;
      } else {
        console.warn('Using tracking-[xxx], need to also have text-[size]');
      }
      continue;
    }

    // Tailwind started using CSS variables for color opacity since v1.4.0,
    //   this helper adds a primitive support for these.
    if (isString(value) && value.includes('var(')) {
      style[key] = value.replace(/var\(([a-zA-Z-]+)\)/, (_, name) => {
        if (name in _style) return _style[name];

        console.warn('No variable: ', name, ' found for ', _style);
        return 1;
      });
      continue;
    }

    style[key] = value;
  }

  return style;
};

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
        newClassName = newClassName.replace(prefix, '');
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
        newClassName = newClassName.replace(prefix, '');
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

const cache = {
  '': {},
};

const tailwind = (classStr, windowWidth, themeMode) => {
  if (!isNumber(windowWidth)) {
    console.log('In tailwind, found NAN windowWidth: ', windowWidth);
  }
  if (!isNumber(themeMode)) {
    console.log('In tailwind, found NAN themeMode: ', themeMode);
  }

  const v1 = classStr.includes('text') ? 1 : 0;
  const v2 = classStr.includes('font') ? 1 : 0;
  if (v1 + v2 === 1) console.warn('Need to have both text size and font weight!');

  if (!isString(classStr) || classStr.length === 0) return cache[''];

  // Order is important i.e.
  //  - leading-[x] needs to be after text-[size]
  //  - bg-opacity-[x] needs to be after bg-[color]
  let classes = classStr.trim().split(/\s+/);
  classes = filterByScreen(classes, windowWidth);
  classes = filterByTheme(classes, themeMode);

  const newClassStr = classes.join(' ');
  if (!isString(newClassStr) || newClassStr.length === 0) return cache[''];
  if (newClassStr in cache) return cache[newClassStr];

  const style = _tailwind(classes);

  cache[newClassStr] = style;
  return cache[newClassStr];
};

export { tailwind };
