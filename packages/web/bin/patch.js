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

patchFetch();
patchCryptoUtils();
patchTypeReactRedux();
patchTypeReselect();
