import { connectToGaiaHub } from '@stacks/storage/dist/esm';
import { encryptContent } from '@stacks/encryption/dist/esm';
import { fetchPrivate } from '@stacks/common/dist/esm';

const SD_HUB_URL = 'https://hub.stacksdrive.com';

const createSdHubConfig = async (privateKey, associationToken) => {
  const hubConfig = await connectToGaiaHub(SD_HUB_URL, privateKey, associationToken);
  return hubConfig;
};

const listFiles = async (hubConfig) => {
  const url = `${hubConfig.server}/list-files/${hubConfig.address}`;

  const fpaths = [];
  let page = null;
  for (let i = 0; i < 655; i++) {
    const res = await fetchPrivate(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${hubConfig.token}`,
      },
      body: JSON.stringify({ page, stat: false }),
    });
    if (!res.ok) throw new Error(`(listFiles) Error ${res.status}`);

    const json = await res.json();
    for (const entry of json.entries) {
      if (entry) fpaths.push(entry);
    }

    if (!json.page) break;
    page = json.page;
  }

  return fpaths;
};

const migrateFile = async (fromHubConfig, toHubConfig, fpath) => {
  const readUrl = `${fromHubConfig.url_prefix}${fromHubConfig.address}/${fpath}`;
  const readRes = await fetchPrivate(readUrl);
  if (!readRes.ok) throw new Error(`(migrateFile) Read error ${readRes.status}`);

  const contentType = readRes.headers.get('Content-Type');
  const headers = {
    'Authorization': `bearer ${toHubConfig.token}`,
  };
  if (contentType) headers['Content-Type'] = contentType;

  const content = await readRes.blob();

  const writeUrl = `${toHubConfig.server}/store/${toHubConfig.address}/${fpath}`;
  const writeRes = await fetchPrivate(writeUrl, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: headers,
    body: content,
  });
  if (!writeRes.ok) throw new Error(`(migrateFile) Write error ${writeRes.status}`);
};

const storeInfoFile = async (hubConfig, privateKey) => {
  const encryptedContent = await encryptContent(JSON.stringify({}), { privateKey });

  const addedDT = Date.now();
  const url = `${hubConfig.server}/store/${hubConfig.address}/info${addedDT}.json`;
  const res = await fetchPrivate(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${hubConfig.token}`,
    },
    body: encryptedContent,
  });
  if (res.ok) {
    const json = await res.json();
    return json;
  }

  throw new Error(`(storeInfoFile) Error ${res.status}`);
};

const revokeAuth = async (hubConfig) => {
  const oldestValidTimestamp = Math.trunc(Date.now() / 1000);

  const url = `${hubConfig.server}/revoke-all/${hubConfig.address}`;
  const res = await fetchPrivate(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${hubConfig.token}`,
    },
    body: JSON.stringify({ oldestValidTimestamp }),
  });
  if (res.ok) {
    const json = await res.json();
    return json;
  }

  throw new Error(`(revokeAuth) Error ${res.status}`);
};

const migrateHub = {
  createSdHubConfig, listFiles, migrateFile, storeInfoFile, revokeAuth,
};
export default migrateHub;
