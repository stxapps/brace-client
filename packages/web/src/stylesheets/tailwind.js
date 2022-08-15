import { isNumber } from '../utils';

const tailwind = (classStr, windowWidth) => {
  if (!isNumber(windowWidth)) {
    console.log('In tailwind, found NAN windowWidth: ', windowWidth);
  }

  return classStr;
};

export { tailwind };
