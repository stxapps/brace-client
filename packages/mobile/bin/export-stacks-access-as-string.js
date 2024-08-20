const fs = require('fs');
const path = require('path');

const stacksAccessDir = process.argv[2];
const outputDir = process.argv[3];

const readLines = (fpath) => {

  const text = fs.readFileSync(fpath, 'utf-8');
  const lines = text.split(/\r?\n/)
    .filter(line => {
      const i = line.indexOf('//');
      if (i >= 0) {
        if (i - 5 >= 0 && line.slice(i - 5, i) === 'http:') return true;
        if (i - 6 >= 0 && line.slice(i - 6, i) === 'https:') return true;
        if (i - 5 >= 0 && line.slice(i - 5, i) === 'file:') return true;
        if (i - 1 >= 0 && line.slice(i - 1, i) === '"') return true;
        if (i - 1 >= 0 && line.slice(i - 1, i) === '\\') return true;

        console.log(`Line with a comment deleted: ${line}`);
        return false;
      }
      return true;
    })
    .map(line => line.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"'));

  return lines;
};

const signUpText = readLines(
  path.join(stacksAccessDir, 'sign-up/build/index.html')
).join(' ');
fs.writeFileSync(
  path.join(outputDir, 'stacks-access-sign-up.js'),
  'module.exports = "' + signUpText + '";\n'
);

const signInText = readLines(
  path.join(stacksAccessDir, 'sign-in/build/index.html')
).join(' ');
fs.writeFileSync(
  path.join(outputDir, 'stacks-access-sign-in.js'),
  'module.exports = "' + signInText + '";\n'
);
