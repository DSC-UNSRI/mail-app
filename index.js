// index.js

require('./config/dotenv');
const { sendEmails } = require('./services/emailService');

sendEmails().catch(console.log);