import fs from 'fs';

const replaceMatchedLine = (fpath, actionObjs) => {
  const text = fs.readFileSync(fpath, 'utf-8');
  const lines = text.trim().split(/\r?\n/);

  const outs = [];
  for (const line of lines) {
    let didMatch = false;
    for (const actionObj of actionObjs) {
      const { match, repmt } = actionObj;
      if (line === match) {
        outs.push(repmt);
        didMatch = true;
        break;
      }
    }
    if (didMatch) continue;

    outs.push(line);
  }

  fs.writeFileSync(fpath, outs.join('\n') + '\n');
};

const patchFetch = () => {
  let match = '    Object.assign(fetchOpts, defaultFetchOpts, init);';
  let repmt = "    const inputUrl = new URL(input); if (inputUrl.host.includes('hiro.so') || inputUrl.host.includes('stacks.co') || inputUrl.host.includes('blockstack.org')) { Object.assign(fetchOpts, defaultFetchOpts, init); } else { Object.assign(fetchOpts, { referrerPolicy: 'origin' }, init); }";
  replaceMatchedLine(
    'node_modules/@stacks/network/dist/fetch.js',
    [{ match, repmt }],
  );
  replaceMatchedLine(
    'node_modules/@stacks/network/dist/esm/fetch.js',
    [{ match, repmt }],
  );
};

const patchCryptoUtils = () => {
  // Bundle gzip size will +125.2 kB, should be await import()?
  /*let match = "            const nodeCrypto = require('crypto');";
  let repmt = "            const nodeCrypto = require('crypto-browserify');";
  replaceMatchedLine(
    'node_modules/@stacks/encryption/dist/cryptoUtils.js',
    [{ match, repmt }],
  );
  replaceMatchedLine(
    'node_modules/@stacks/encryption/dist/esm/cryptoUtils.js',
    [{ match, repmt }],
  );*/
};

const patchLexoRank = () => {
  const fpath = 'node_modules/@wewatch/lexorank/package.json';
  const text = fs.readFileSync(fpath, 'utf-8');

  let outs = text.trim().split(/\r?\n/);

  const match = '      "types": "./dist/types/index.d.ts",';
  const anchor = '      "require": "./dist/cjs/index.js",';
  if (outs.includes(match)) return;

  const i = outs.indexOf(anchor);
  if (i < 0) {
    console.log('In patchLexoRank, invalid i:', i);
    return;
  }

  outs = [...outs.slice(0, i), match, ...outs.slice(i)];
  fs.writeFileSync(fpath, outs.join('\n') + '\n');
};

patchFetch();
patchCryptoUtils();
patchLexoRank();
