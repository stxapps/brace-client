const fs = require('fs');

const patchWalletSdk = () => {
  // Use new Stacks apis instead of the old one
  const fpath = 'node_modules/@stacks/wallet-sdk/dist/utils.js';
  const text = fs.readFileSync(fpath, 'utf-8');
  const lines = text.split('\n')

  const outs = [];
  for (const line of lines) {
    if (line === '    const url = `https://core.blockstack.org/v1/names/${name}`;') {
      outs.push('    const url = `https://stacks-node-api.mainnet.stacks.co/v1/names/${name}`;');
      continue;
    }

    outs.push(line);
  }

  fs.writeFileSync(fpath, outs.join('\n'));
};

patchWalletSdk();
