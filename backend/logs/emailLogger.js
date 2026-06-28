const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'emails_log.json');

function logEmail(data) {
  try {
    const dir = path.dirname(logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let logs = [];
    if (fs.existsSync(logFilePath)) {
      const fileContent = fs.readFileSync(logFilePath, 'utf8');
      if (fileContent.trim()) {
        logs = JSON.parse(fileContent);
      }
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      trigger: data.trigger,
      recipient_role: data.recipient_role,
      recipient_email: data.recipient_email,
      subject: data.subject,
      status: data.status
    };

    logs.push(logEntry);
    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}

function getEmailLogs() {
  try {
    if (fs.existsSync(logFilePath)) {
      const fileContent = fs.readFileSync(logFilePath, 'utf8');
      if (fileContent.trim()) {
        return JSON.parse(fileContent);
      }
    }
  } catch (err) {
    console.error('Failed to read email logs:', err);
  }
  return [];
}

module.exports = {
  logEmail,
  getEmailLogs
};
