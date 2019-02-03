const fs = require('fs-extra');
const { filter, startsWith } = require('lodash');

const convertScssFileNameToLess = (fileName) => {
  return fileName.replace('_', '').replace('.scss', '.less');
};

const getFileNamesStartingWith = (path, str) => filter(
  fs.readdirSync(path),
  (fileName) => startsWith(fileName, str)
);

module.exports = {
  convertScssFileNameToLess,
  getFileNamesStartingWith,
};