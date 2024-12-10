// utils/templateUtils.js

const fs = require('fs');
const handlebars = require('handlebars');

function compileTemplate(templatePath) {
  const fileBytes = fs.readFileSync(templatePath, {
    encoding: 'utf8',
  });
  return handlebars.compile(fileBytes);
}

function applyTemplate(template, templateData, rowCsv) {
  const data = {};

  templateData.forEach(([key, idx]) => {
    if (parseInt(idx) >= rowCsv.length) {
      throw new Error('Index not valid');
    }
    data[key] = rowCsv[idx];
  });

  return template(data);
}

module.exports = { compileTemplate, applyTemplate };