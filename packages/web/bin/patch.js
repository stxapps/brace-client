const fs = require('fs');

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

const patchWalletUtils = () => {
  // Use new Stacks apis instead of the old one
  let match = '    const url = `https://core.blockstack.org/v1/names/${name}`;';
  let repmt = '    const url = `https://api.hiro.so/v1/names/${name}`;';
  replaceMatchedLine(
    'node_modules/@stacks/wallet-sdk/dist/utils.js',
    [{ match, repmt }],
  );

  match = '    const url = `https://core.blockstack.org/v1/names/${name}`;';
  repmt = '    const url = `https://api.hiro.so/v1/names/${name}`;';
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

const patchTypeReactRedux = () => {

  let match = '    <TState = unknown, Selected = unknown>(selector: (state: TState) => Selected, equalityFn?: EqualityFn<Selected>): Selected;';
  let repmt = '    <TState = any, Selected = any>(selector: (state: TState) => Selected, equalityFn?: EqualityFn<Selected>): Selected;';
  replaceMatchedLine(
    'node_modules/react-redux/es/hooks/useSelector.d.ts',
    [{ match, repmt }],
  );

  match = '    <TState = unknown, Selected = unknown>(selector: (state: TState) => Selected, options?: UseSelectorOptions<Selected>): Selected;';
  repmt = '    <TState = any, Selected = any>(selector: (state: TState) => Selected, options?: UseSelectorOptions<Selected>): Selected;';
  replaceMatchedLine(
    'node_modules/react-redux/es/hooks/useSelector.d.ts',
    [{ match, repmt }],
  );

  match = 'export declare const useDispatch: <AppDispatch extends Dispatch<AnyAction> = Dispatch<AnyAction>>() => AppDispatch;';
  repmt = 'export declare const useDispatch: <AppDispatch extends Dispatch<any> = Dispatch<any>>() => AppDispatch;';
  replaceMatchedLine(
    'node_modules/react-redux/es/hooks/useDispatch.d.ts',
    [{ match, repmt }],
  );
};

const patchTypeReselect = () => {

  let match = 'export type Selector<State = any, Result = unknown, Params extends never | readonly any[] = any[]> = [Params] extends [never] ? (state: State) => Result : (state: State, ...params: Params) => Result;';
  let repmt = 'export type Selector<State = any, Result = any, Params extends never | readonly any[] = any[]> = [Params] extends [never] ? (state: State) => Result : (state: State, ...params: Params) => Result;';
  replaceMatchedLine(
    'node_modules/reselect/es/types.d.ts',
    [{ match, repmt }],
  );
};

patchWalletUtils();
patchSignECDSA();
patchFetchReferer();
patchTypeReactRedux();
patchTypeReselect();
