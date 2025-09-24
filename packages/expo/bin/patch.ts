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

const patchExpoShareIntent = () => {
  const match = '    if (project.pbxGroupByName(group).path)';
  const repmt = '    if (project.pbxGroupByName(group)&&project.pbxGroupByName(group).path)';

  replaceMatchedLine(
    'node_modules/xcode/lib/pbxProject.js',
    [{ match, repmt }],
  );
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

const patchReduxOffline = () => {
  let match = '    dispatch?: any => void,';
  let repmt = '    dispatch?: (any) => void;';
  replaceMatchedLine(
    'node_modules/@redux-offline/redux-offline/typings.d.ts',
    [{ match, repmt }],
  );

  match = '    filterOutboxRehydrate?: (outbox: Outbox) => Outbox,';
  repmt = '    filterOutboxRehydrate?: (outbox: Outbox) => Outbox;';
  replaceMatchedLine(
    'node_modules/@redux-offline/redux-offline/typings.d.ts',
    [{ match, repmt }],
  );
};

patchExpoShareIntent();
patchLexoRank();
patchReduxOffline();
