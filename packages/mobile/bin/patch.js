const fs = require('fs');

const replaceMatchedLine = (fpath, actionObjs) => {
  const text = fs.readFileSync(fpath, 'utf-8');
  const lines = text.trim().split('\r\n');

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

  let match = 'export declare const useSelector: <TState = unknown, Selected = unknown>(selector: (state: TState) => Selected, equalityFn?: EqualityFn<Selected> | undefined) => Selected;';
  let repmt = 'export declare const useSelector: <TState = any, Selected = any>(selector: (state: TState) => Selected, equalityFn?: EqualityFn<Selected> | undefined) => Selected;';
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

patchTypeReactRedux();
