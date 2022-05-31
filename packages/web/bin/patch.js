const fs = require('fs');

const replaceMatchedLine = (fpath, actionObjs) => {
  const text = fs.readFileSync(fpath, 'utf-8');
  const lines = text.split('\n');

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

  fs.writeFileSync(fpath, outs.join('\n'));
};

const patchWalletUtils = () => {
  // Use new Stacks apis instead of the old one
  let match = '    const url = `https://core.blockstack.org/v1/names/${name}`;';
  let repmt = '    const url = `https://stacks-node-api.mainnet.stacks.co/v1/names/${name}`;';
  replaceMatchedLine(
    'node_modules/@stacks/wallet-sdk/dist/utils.js',
    [{ match, repmt }],
  );

  match = '    const url = `https://core.blockstack.org/v1/names/${name}`;';
  repmt = '    const url = `https://stacks-node-api.mainnet.stacks.co/v1/names/${name}`;';
  replaceMatchedLine(
    'node_modules/@stacks/wallet-sdk/dist/esm/utils.js',
    [{ match, repmt }],
  );
};

const patchSignECDSA = () => {

  let match = '    const signature = ecPrivate.sign(contentHash);';
  let repmt = '    const signature = ecPrivate.sign(contentHash, { canonical: true });';
  replaceMatchedLine(
    'node_modules/@stacks/encryption/dist/ec.js',
    [{ match, repmt }],
  );

  match = '    const signature = ecPrivate.sign(contentHash);';
  repmt = '    const signature = ecPrivate.sign(contentHash, { canonical: true });';
  replaceMatchedLine(
    'node_modules/@stacks/encryption/dist/esm/ec.js',
    [{ match, repmt }],
  );
};

const patchFetchReferer = () => {

  replaceMatchedLine(
    'node_modules/@stacks/common/dist/fetchUtil.js',
    [
      {
        match: "        referrer: 'no-referrer',",
        repmt: '',
      },
      {
        match: "        referrerPolicy: 'no-referrer',",
        repmt: "        referrerPolicy: 'origin',",
      }
    ],
  );

  replaceMatchedLine(
    'node_modules/@stacks/common/dist/esm/fetchUtil.js',
    [
      {
        match: "        referrer: 'no-referrer',",
        repmt: '',
      },
      {
        match: "        referrerPolicy: 'no-referrer',",
        repmt: "        referrerPolicy: 'origin',",
      }
    ],
  );

  replaceMatchedLine(
    'node_modules/@stacks/transactions/dist/utils.js',
    [
      {
        match: "        referrer: 'no-referrer',",
        repmt: '',
      },
      {
        match: "        referrerPolicy: 'no-referrer',",
        repmt: "        referrerPolicy: 'origin',",
      }
    ],
  );

  replaceMatchedLine(
    'node_modules/@stacks/transactions/dist/esm/utils.js',
    [
      {
        match: "        referrer: 'no-referrer',",
        repmt: '',
      },
      {
        match: "        referrerPolicy: 'no-referrer',",
        repmt: "        referrerPolicy: 'origin',",
      }
    ],
  );
};

patchWalletUtils();
patchSignECDSA();
patchFetchReferer();
