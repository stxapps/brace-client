export const isArrayBuffer = val => {
  return val instanceof ArrayBuffer || toString.call(val) === '[object ArrayBuffer]';
};

export const isUint8Array = val => {
  return val instanceof Uint8Array || toString.call(val) === '[object Uint8Array]';
};

export const isBlob = val => {
  return val instanceof Blob || toString.call(val) === '[object Blob]';
};

export const convertBlobToDataUrl = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = e => reject(e);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

export const convertDataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return blob;
};
