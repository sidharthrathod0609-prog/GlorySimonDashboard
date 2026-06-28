const http = require('http');

const endpoints = [
  { path: '/api/email/booking-confirmation', body: {} },
  { path: '/api/email/design-approval', body: {} },
  { path: '/api/email/invoice', body: {} },
  { path: '/api/email/new-enquiry', body: {} },
  { path: '/api/email/material-approval', body: {} },
  { path: '/api/email/deadline-reminder', body: {} },
  { path: '/api/email/milestone-update', body: {} },
  { path: '/api/email/vendor-request', body: {} },
  { path: '/api/email/price-confirmation', body: {} },
  { path: '/api/email/escalation-alert', body: {} },
  { path: '/api/email/payment-reminder', body: {} },
  { path: '/api/email/design-approval-request', body: {} },
  { path: '/api/email/broadcast', body: {} }
];

function postRequest(endpoint) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(endpoint.body);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Triggered ${endpoint.path} -> Status: ${res.statusCode}`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`Error triggering ${endpoint.path}: ${e.message}`);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Starting automated triggers test...');
  for (const ep of endpoints) {
    await postRequest(ep);
    // Wait briefly between calls to keep output ordered
    await new Promise(r => setTimeout(r, 100));
  }
  console.log('Triggers test complete! Check server logs for [ROLE] outputs and backend/logs/emails_log.json for logged statuses.');
}

runTests();
