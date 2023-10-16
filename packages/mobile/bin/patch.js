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

const patchAnsiStyles = () => {

  const match1 = '				const matches = /(?<colorString>[a-f\\d]{6}|[a-f\\d]{3})/i.exec(hex.toString(16));';
  const repmt1 = '				const matches = /([a-f\\d]{6}|[a-f\\d]{3})/i.exec(hex.toString(16));';

  const match2 = '				let {colorString} = matches.groups;';
  const repmt2 = '				let colorString = matches[1];';

  replaceMatchedLine(
    'node_modules/jest-diff/node_modules/ansi-styles/index.js',
    [{ match: match1, repmt: repmt1 }, { match: match2, repmt: repmt2 }],
  );
};

patchTypeReactRedux();
patchTypeReselect();
patchAnsiStyles();
