import { FileContentLoader } from '@stacks/storage/dist/esm/fileContentLoader';
import { getPublicKeyFromPrivate, encryptECIES } from '@stacks/encryption/dist/esm';
import { fetchPrivate } from '@stacks/common/dist/esm';

import userSession from '../userSession';
import { PUT_FILE } from '../types/const';
import { isString } from '../utils';

const encryptData = async (data, publicKey) => {
  const ecdData = { ...data };
  if (Array.isArray(data.values) && [true, false].includes(data.isSequential)) {
    ecdData.values = [];
    for (const value of data.values) {
      const ecdValue = await encryptData(value, publicKey);
      ecdData.values.push(ecdValue);
    }
  } else if (isString(data.id) && isString(data.type) && isString(data.path)) {
    if (data.type === PUT_FILE) {
      const contentLoader = new FileContentLoader(data.content, null);
      const contentData = /** @type Buffer */(await contentLoader.load());
      const wasString = contentLoader.wasString;
      const cipherTextEncoding = 'hex';
      ecdData.content = await encryptECIES(
        publicKey, contentData, wasString, cipherTextEncoding
      );
    }
  } else {
    console.log('In encryptData, invalid data:', data);
  }

  return ecdData;
};

const performFiles = async (data) => {
  const userData = userSession.loadUserData();
  const { appPrivateKey: privateKey, gaiaHubConfig: hubConfig } = userData;

  const publicKey = getPublicKeyFromPrivate(privateKey);
  const ecdData = await encryptData(data, publicKey);

  const url = `${hubConfig.server}/perform-files/${hubConfig.address}`;
  const res = await fetchPrivate(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${hubConfig.token}`,
    },
    body: JSON.stringify(ecdData),
  });
  if (res.ok) {
    const json = await res.json();
    return json;
  }

  throw new Error(`(performFiles) Error ${res.status}`);
};

const internalHub = { performFiles };

export default internalHub;
