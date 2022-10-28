export const isArrayBuffer = val => {
  return val instanceof ArrayBuffer || toString.call(val) === '[object ArrayBuffer]';
};

export const isUint8Array = val => {
  return val instanceof Uint8Array || toString.call(val) === '[object Uint8Array]';
};

export const isBlob = val => {
  return val instanceof Blob || toString.call(val) === '[object Blob]';
};
