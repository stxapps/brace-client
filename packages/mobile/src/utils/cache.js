import { isEqual } from '.';

const cached = {};

export default (key, value, deps = null) => {

  if (!(key in cached)) {
    cached[key] = [value, deps];
    return value;
  }

  const [cachedValue, cachedDeps] = cached[key];

  if (!isEqual(cachedDeps, deps)) {
    cached[key] = [value, deps];
    return value;
  }

  return cachedValue;
};
