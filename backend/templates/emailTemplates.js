function getBaseTemplate(title, recipientName, tableRowsHtml, buttonHtml = '') {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f8f9fa;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      border: 1px solid #eef0f2;
    }
    .header {
      background-color: #4CAF50;
      padding: 30px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 300;
      letter-spacing: 1px;
    }
    .content {
      padding: 35px 30px;
    }
    .content p {
      font-size: 15px;
      line-height: 1.6;
      color: #4B4B4B;
      margin: 0 0 20px 0;
    }
    .content h2 {
      font-size: 18px;
      color: #333;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .table-container {
      margin: 25px 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #eef0f2;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      font-size: 14px;
    }
    th {
      background-color: #f4f6f8;
      color: #666;
      font-weight: 600;
      border-bottom: 2px solid #eef0f2;
    }
    td {
      border-bottom: 1px solid #f4f6f8;
      color: #555;
    }
    .footer {
      background-color: #f4f6f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #7D7D7D;
      border-top: 1px solid #eef0f2;
    }
    .btn-container {
      text-align: center;
      margin-top: 25px;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4CAF50;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Glory Simon Interiors</h1>
    </div>
    <div class="content">
      <h2>Hello ${recipientName},</h2>
      <p>${title}</p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Detail</th>
              <th style="width: 60%;">Information</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>
      ${buttonHtml}
    </div>
    <div class="footer">
      <strong>Glory Simon Interiors | Interior Design</strong><br>
      Premium Bespoke Spaces & Interiors
    </div>
  </div>
</body>
</html>
  `;
}

// 1. CLIENT ← System: Site visit booking confirmed
function getClientBookingConfirmation(clientName, visitDate, projectAddress, pmName) {
  const title = 'Your site visit has been booked and confirmed by our engineering team.';
  const rows = `
    <tr><td><strong>Event</strong></td><td>Site Measurements & Survey</td></tr>
    <tr><td><strong>Date & Time</strong></td><td>${visitDate}</td></tr>
    <tr><td><strong>Site Address</strong></td><td>${projectAddress}</td></tr>
    <tr><td><strong>Assigned PM</strong></td><td>${pmName}</td></tr>
  `;
  return {
    subject: 'Site Visit Confirmed - Glory Simon Interiors',
    html: getBaseTemplate(title, clientName, rows)
  };
}

// 2. CLIENT ← System: Design approval status update
function getClientApprovalStatus(clientName, designName, status, designerNotes) {
  const title = `Your design concept status has been updated to: <strong>${status}</strong>.`;
  const rows = `
    <tr><td><strong>Design Name</strong></td><td>${designName}</td></tr>
    <tr><td><strong>New Status</strong></td><td>${status}</td></tr>
    <tr><td><strong>Feedback/Notes</strong></td><td>${designerNotes || 'No additional comments.'}</td></tr>
  `;
  return {
    subject: `Design Concept Status Update: ${status} - Glory Simon Interiors`,
    html: getBaseTemplate(title, clientName, rows)
  };
}

// 3. CLIENT ← System: Invoice generated with amount
function getClientInvoice(clientName, invoiceId, amount, dueDate) {
  const title = 'A new invoice has been generated for your ongoing interior work.';
  const rows = `
    <tr><td><strong>Invoice ID</strong></td><td>#${invoiceId}</td></tr>
    <tr><td><strong>Amount Due</strong></td><td>INR ${Number(amount).toLocaleString()}</td></tr>
    <tr><td><strong>Due Date</strong></td><td>${dueDate}</td></tr>
    <tr><td><strong>Payment Status</strong></td><td>Unpaid (Pending)</td></tr>
  `;
  return {
    subject: 'New Invoice Generated - Glory Simon Interiors',
    html: getBaseTemplate(title, clientName, rows)
  };
}

// 4. DESIGNER ← System: New enquiry assigned
function getDesignerNewEnquiry(designerName, clientName, clientPhone, requirements) {
  const title = 'A new customer enquiry has been received and assigned to your catalog portfolio.';
  const rows = `
    <tr><td><strong>Client Name</strong></td><td>${clientName}</td></tr>
    <tr><td><strong>Client Phone</strong></td><td>${clientPhone}</td></tr>
    <tr><td><strong>Requirements</strong></td><td>${requirements}</td></tr>
    <tr><td><strong>Role Assignment</strong></td><td>Lead Designer</td></tr>
  `;
  return {
    subject: 'New Client Enquiry Assigned - Glory Simon Interiors',
    html: getBaseTemplate(title, designerName, rows)
  };
}

// 5. DESIGNER ← System: Material approval needed
function getDesignerMaterialApproval(designerName, projectName, materialName, vendorName) {
  const title = 'A client-selected material requires coordinator dispatch verification and technical approval.';
  const rows = `
    <tr><td><strong>Project Name</strong></td><td>${projectName}</td></tr>
    <tr><td><strong>Material Name</strong></td><td>${materialName}</td></tr>
    <tr><td><strong>Preferred Vendor</strong></td><td>${vendorName}</td></tr>
    <tr><td><strong>Required Action</strong></td><td>Verify spec checklist & sign approval</td></tr>
  `;
  return {
    subject: 'Material Selection Approval Required - Glory Simon Interiors',
    html: getBaseTemplate(title, designerName, rows)
  };
}

// 6. PM ← System: Deadline reminder
function getPMDeadlineReminder(pmName, projectName, taskTitle, dueDate) {
  const title = 'This is a warning alert: A project task is approaching its scheduled completion timeline.';
  const rows = `
    <tr><td><strong>Project Name</strong></td><td>${projectName}</td></tr>
    <tr><td><strong>Task Title</strong></td><td>${taskTitle}</td></tr>
    <tr><td><strong>Deadline Date</strong></td><td>${dueDate}</td></tr>
    <tr><td><strong>Severity Alert</strong></td><td>High Reminder</td></tr>
  `;
  return {
    subject: 'Task Deadline Reminder - Glory Simon Interiors',
    html: getBaseTemplate(title, pmName, rows)
  };
}

// 7. PM ← System: Milestone status updated
function getPMMilestoneUpdate(pmName, projectName, milestoneName, status) {
  const title = 'A project execution milestone has been updated in the layout timeline tracker.';
  const rows = `
    <tr><td><strong>Project Name</strong></td><td>${projectName}</td></tr>
    <tr><td><strong>Milestone Name</strong></td><td>${milestoneName}</td></tr>
    <tr><td><strong>Milestone Status</strong></td><td>${status}</td></tr>
  `;
  return {
    subject: `Milestone Status Update: ${milestoneName} - Glory Simon Interiors`,
    html: getBaseTemplate(title, pmName, rows)
  };
}

// 8. VENDOR ← System: New vendor request raised
function getVendorNewRequest(vendorName, requestItem, quantity, deliveryDate) {
  const title = 'A new request for quote (RFQ) / material purchase inquiry has been dispatched to your portal.';
  const rows = `
    <tr><td><strong>Material Item</strong></td><td>${requestItem}</td></tr>
    <tr><td><strong>Quantity Requested</strong></td><td>${quantity} units</td></tr>
    <tr><td><strong>Target Delivery</strong></td><td>${deliveryDate}</td></tr>
  `;
  return {
    subject: 'New Vendor Request Raised - Glory Simon Interiors',
    html: getBaseTemplate(title, vendorName, rows)
  };
}

// 9. VENDOR ← System: Price confirmation needed
function getVendorPriceConfirmation(vendorName, materialName, basePrice, status) {
  const title = 'Please review and confirm the contract unit pricing for the material selection below.';
  const rows = `
    <tr><td><strong>Material Name</strong></td><td>${materialName}</td></tr>
    <tr><td><strong>Offered Unit Price</strong></td><td>INR ${Number(basePrice).toLocaleString()}</td></tr>
    <tr><td><strong>Confirmation Status</strong></td><td>${status}</td></tr>
  `;
  return {
    subject: 'Price Confirmation Pending - Glory Simon Interiors',
    html: getBaseTemplate(title, vendorName, rows)
  };
}

// 10. ADMIN ← System: Escalation alert
function getAdminEscalationAlert(adminName, projectName, issueTitle, severity) {
  const title = '🚨 Critical Project Issue Escalation Alert requiring direct administrative intervention.';
  const rows = `
    <tr><td><strong>Project Name</strong></td><td>${projectName}</td></tr>
    <tr><td><strong>Escalated Issue</strong></td><td>${issueTitle}</td></tr>
    <tr><td><strong>Severity Level</strong></td><td><strong>${severity}</strong></td></tr>
  `;
  return {
    subject: `🚨 Escalation Alert: ${issueTitle} - Glory Simon Interiors`,
    html: getBaseTemplate(title, adminName, rows)
  };
}

// 11. ADMIN ← System: Payment reminder
function getAdminPaymentReminder(adminName, clientName, invoiceId, overdueDays) {
  const title = 'A client invoice payment period has exceeded the standard timeline.';
  const rows = `
    <tr><td><strong>Client Name</strong></td><td>${clientName}</td></tr>
    <tr><td><strong>Invoice ID</strong></td><td>#${invoiceId}</td></tr>
    <tr><td><strong>Days Overdue</strong></td><td>${overdueDays} Days</td></tr>
  `;
  return {
    subject: 'Payment Overdue Reminder - Glory Simon Interiors',
    html: getBaseTemplate(title, adminName, rows)
  };
}

// 12. CLIENT ← Designer: Design approval request with link
function getDesignerToClientApproval(clientName, designName, linkUrl, designerName) {
  const title = `Our interior designer <strong>${designerName}</strong> has prepared new layout plans for your penthouse. Please review them.`;
  const rows = `
    <tr><td><strong>Design Name</strong></td><td>${designName}</td></tr>
    <tr><td><strong>Prepared By</strong></td><td>${designerName}</td></tr>
  `;
  const buttonHtml = `
    <div class="btn-container">
      <a href="${linkUrl}" class="btn" target="_blank">Review Concept Designs</a>
    </div>
  `;
  return {
    subject: 'Design Concept Approval Request - Glory Simon Interiors',
    html: getBaseTemplate(title, clientName, rows, buttonHtml)
  };
}

// 13. ALL ROLES ← Admin: Broadcast announcement
function getAdminBroadcast(recipientName, announcementTitle, announcementContent) {
  const title = `Announcement: <strong>${announcementTitle}</strong>`;
  const rows = `
    <tr><td><strong>Subject</strong></td><td>${announcementTitle}</td></tr>
    <tr><td><strong>Message</strong></td><td>${announcementContent}</td></tr>
  `;
  return {
    subject: `Announcement: ${announcementTitle} - Glory Simon Interiors`,
    html: getBaseTemplate(title, recipientName, rows)
  };
}

module.exports = {
  getClientBookingConfirmation,
  getClientApprovalStatus,
  getClientInvoice,
  getDesignerNewEnquiry,
  getDesignerMaterialApproval,
  getPMDeadlineReminder,
  getPMMilestoneUpdate,
  getVendorNewRequest,
  getVendorPriceConfirmation,
  getAdminEscalationAlert,
  getAdminPaymentReminder,
  getDesignerToClientApproval,
  getAdminBroadcast
};
