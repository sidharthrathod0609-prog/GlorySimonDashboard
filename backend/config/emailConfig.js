const nodemailer = require('nodemailer');

const GMAIL_USER = 'sidharthrathod0609@gmail.com';
// Recommended: Set GMAIL_APP_PASSWORD in environment variables.
// Replace 'YOUR_GMAIL_APP_PASSWORD' with your actual Gmail App Password if not using env variables.
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'YOUR_GMAIL_APP_PASSWORD'; 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

module.exports = {
  transporter,
  senderEmail: GMAIL_USER,
  displayName: 'Glory Simon Interiors'
};
