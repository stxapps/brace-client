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

const patchExpoShareIntent = () => {
  const match = '    if (project.pbxGroupByName(group).path)';
  const repmt = '    if (project.pbxGroupByName(group)&&project.pbxGroupByName(group).path)';

  replaceMatchedLine(
    'node_modules/xcode/lib/pbxProject.js',
    [{ match, repmt }],
  );
};

patchExpoShareIntent();
