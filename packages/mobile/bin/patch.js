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

patchTypeReactRedux();
patchTypeReselect();
