const fs = require('fs-extra');
const path = require('path');
const { each, remove } = require('lodash');

const { convertScssFileNameToLess, getFileNamesStartingWith } = require('./utilities');

const SRC = path.join(__dirname, 'node_modules/bootstrap/scss');
const DEST = path.join(__dirname, 'build');

const ENCODING = {
  UTF8: 'utf8',
};

const SRC_PATH = {
  ROOT: SRC,
  MIXINS: path.join(SRC, 'mixins'),
  UTILITIES: path.join(SRC, 'utilities'),
};

const DEST_PATH = {
  ROOT: DEST,
  MIXINS: path.join(DEST, 'mixins'),
  UTILITIES: path.join(DEST, 'utilities'),
};

// Ensure empty destination directory structure
each(DEST_PATH, fs.emptyDirSync);

const rootFileNames = getFileNamesStartingWith(SRC_PATH.ROOT, '_');
const mixinFileNames = getFileNamesStartingWith(SRC_PATH.MIXINS, '_');
const utilityFileNames = getFileNamesStartingWith(SRC_PATH.UTILITIES, '_');

console.log(mixinFileNames);

const processFilesByName = ({ srcDir, destDir, fileNames, mergeDir, mergeFileNames }) => {
  each(fileNames, (fileName) => {
    let data = fs.readFileSync(path.join(srcDir, fileName), ENCODING.UTF8);

    if(mergeFileNames && mergeFileNames.indexOf(fileName) >= 0) {
      const mergeFilePath = path.join(mergeDir, fileName);
      if(fs.existsSync(mergeFilePath)) {
        data += fs.readFileSync(path.join(mergeDir, fileName), ENCODING.UTF8);
        remove(mergeFileNames, (name) => name === fileName);
      }
    }

    data = data.replace(/\$/g, '@');
    data = data.replace(/@mixin /g, '.');
    data = data.replace(/@include /g, '.');
    data = data.replace(/ !default/g, '');
    data = data.replace(
      /theme-color\("([a-z]*)"\)/g,
      (str, key) => `@${key}`
    );
    data = data.replace(
      /rgba\(([#a-zA-Z|#@a-zA-Z0-9\-]*), ([0-9]*\.[0-9]+|[0-9]+)\)/g,
      (str, color, opacity) => `fade(${color}, ${parseFloat(opacity)*100}%)`
    );


    const newFileName = convertScssFileNameToLess(fileName);
    fs.writeFileSync(path.join(destDir, newFileName), data, ENCODING.UTF8);
  });
};

processFilesByName({
  srcDir: SRC_PATH.ROOT,
  destDir: DEST_PATH.ROOT,
  fileNames: rootFileNames,
  mergeDir: SRC_PATH.MIXINS,
  mergeFileNames: mixinFileNames,
});

processFilesByName({
  srcDir: SRC_PATH.UTILITIES,
  destDir: DEST_PATH.UTILITIES,
  fileNames: utilityFileNames,
  mergeDir: SRC_PATH.MIXINS,
  mergeFileNames: mixinFileNames,
});

processFilesByName({
  srcDir: SRC_PATH.MIXINS,
  destDir: DEST_PATH.MIXINS,
  fileNames: mixinFileNames,
});