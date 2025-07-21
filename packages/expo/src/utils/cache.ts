import { isArrayEqual } from '.';

const cached = {};

export default (key, value, deps = null) => {
  if (deps !== null && !Array.isArray(deps)) {
    console.warn(`In cache, deps needs to be null or an array but found key: ${key}, value: ${value}, deps: ${deps}.`);
    return value;
  }

  if (!(key in cached)) {
    cached[key] = [value, deps];
    return value;
  }

  const [cachedValue, cachedDeps] = cached[key];

  if (
    (cachedDeps === null && cachedDeps === deps) ||
    (Array.isArray(cachedDeps) && isArrayEqual(cachedDeps, deps))
  ) {
    return cachedValue;
  }

  cached[key] = [value, deps];
  return value;
};
