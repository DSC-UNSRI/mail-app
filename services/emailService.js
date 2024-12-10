// services/emailService.js

const path = require('path');
const { prepareTransporter } = require('./transporterService');
const { getFolderPath, createWriterToFile, csvGetRow } = require('../utils/fileUtils');
const { compileTemplate, applyTemplate } = require('../utils/templateUtils');

const pathToCsv = process.env.CSV_PATH;
const pathToTemplate = process.env.HTML_FILE_TO_SEND_PATH;
const attachmentPath = process.env.ATTACHMENT_PATH;

async function sendEmails() {
  const subject = process.env.SUBJECT_EMAIL;
  const idxEmail = parseInt(process.env.RECEIVER_EMAIL_IDX);
  const writeError = createWriterToFile((getFolderPath(pathToCsv) || '.') + '/error.csv');
  const template = pathToTemplate ? compileTemplate(pathToTemplate) : null;
  const templateData = process.env.TEMPLATE_DATA ? JSON.parse(process.env.TEMPLATE_DATA) : null;

  const transporter = await prepareTransporter();
  const emailPromises = [];

  for await (const row of csvGetRow(pathToCsv)) {
    const receiver = row[idxEmail];
    if (!receiver) {
      writeError(JSON.stringify(row));
      continue;
    }

    console.log(`SENDING TO ${'-'.repeat(20)}\n${row}\n`);

    const mailOptions = {
      subject,
      to: receiver,
    };

    if (template) {
      if (templateData) {
        // Apply the template with the row data
        mailOptions.html = applyTemplate(template, templateData, row);
      } else {
        // If your event does not require template data (e.g. certificate link), pass an empty object
        mailOptions.html = template({});
      }
    } else {
      mailOptions.text = 'This is a plain text email without a template.';
    }
    
    // Add attachment if your event requires it
    if (attachmentPath) {
      mailOptions.attachments = [
        {
          filename: path.basename(attachmentPath),
          path: attachmentPath
        }
      ];
    }

    emailPromises.push(transporter.sendMail(mailOptions).catch(error => {
      console.log('Failed to send :(');
      console.log('err : ' + error);
      writeError(JSON.stringify(row));
    }));
  }

  await Promise.all(emailPromises);
}

module.exports = { sendEmails };