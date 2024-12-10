// utils/fileUtils.js

const fs = require('fs');
const { parseFile } = require('@fast-csv/parse');

function getFolderPath(pathToFile) {
  const regex = /\/[\w\.]+$/;
  if (pathToFile.match(regex)) {
    return pathToFile.replace(regex, '');
  }
  return null;
}

function createWriterToFile(filePath) {
  return (data) =>
    fs.appendFileSync(filePath, data + '\n', {
      encoding: 'utf8',
    });
}

function csvGetRow(pathToCsv) {
  return parseFile(pathToCsv, {
    headers: false,
  });
}

module.exports = { getFolderPath, createWriterToFile, csvGetRow };