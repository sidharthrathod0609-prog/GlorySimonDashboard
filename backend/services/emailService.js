const { transporter, senderEmail, displayName } = require('../config/emailConfig');
const templates = require('../templates/emailTemplates');
const { logEmail } = require('../logs/emailLogger');

// Constants for hardcoded roles
const ADMIN_EMAIL = 'zotha@glorysimon.com';
const DESIGNER_EMAIL = 'alex@glorysimon.com';
const PM_EMAIL = 'phani@glorysimon.com';
const VENDOR_EMAIL = 'abdul@glorysimon.com';

// Helper to send email and log it
async function sendMailHelper(roleName, toEmail, templateData, triggerName) {
  const mailOptions = {
    from: `"${displayName}" <${senderEmail}>`,
    to: toEmail,
    subject: templateData.subject,
    html: templateData.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[${roleName.toUpperCase()}] Email sent → ${toEmail}`);
    logEmail({
      trigger: triggerName,
      recipient_role: roleName,
      recipient_email: toEmail,
      subject: templateData.subject,
      status: 'sent'
    });
    return { success: true, info };
  } catch (error) {
    console.error(`[${roleName.toUpperCase()}] Email failed → ${error.message}`);
    logEmail({
      trigger: triggerName,
      recipient_role: roleName,
      recipient_email: toEmail,
      subject: templateData.subject,
      status: `failed: ${error.message}`
    });
    return { success: false, error };
  }
}

// 1. CLIENT ← System: Site visit booking confirmed
async function sendClientBookingConfirmation(clientEmail, clientName, visitDate, projectAddress, pmName) {
  const template = templates.getClientBookingConfirmation(clientName, visitDate, projectAddress, pmName);
  return sendMailHelper('Client', clientEmail, template, 'site_visit_booked');
}

// 2. CLIENT ← System: Design approval status update
async function sendClientApprovalStatus(clientEmail, clientName, designName, status, designerNotes) {
  const template = templates.getClientApprovalStatus(clientName, designName, status, designerNotes);
  const trigger = status === 'Approved' ? 'design_approved' : 'design_rejected';
  return sendMailHelper('Client', clientEmail, template, trigger);
}

// 3. CLIENT ← System: Invoice generated with amount
async function sendClientInvoice(clientEmail, clientName, invoiceId, amount, dueDate) {
  const template = templates.getClientInvoice(clientName, invoiceId, amount, dueDate);
  return sendMailHelper('Client', clientEmail, template, 'invoice_generated');
}

// 4. DESIGNER ← System: New enquiry assigned (alex@glorysimon.com)
async function sendDesignerNewEnquiry(clientName, clientPhone, requirements) {
  const template = templates.getDesignerNewEnquiry('Alex', clientName, clientPhone, requirements);
  return sendMailHelper('Interior Designer', DESIGNER_EMAIL, template, 'enquiry_submitted');
}

// 5. DESIGNER ← System: Material approval needed
async function sendDesignerMaterialApproval(projectName, materialName, vendorName) {
  const template = templates.getDesignerMaterialApproval('Alex', projectName, materialName, vendorName);
  return sendMailHelper('Interior Designer', DESIGNER_EMAIL, template, 'material_pending');
}

// 6. PM ← System: Deadline reminder (phani@glorysimon.com)
async function sendPMDeadlineReminder(projectName, taskTitle, dueDate) {
  const template = templates.getPMDeadlineReminder('Phani', projectName, taskTitle, dueDate);
  return sendMailHelper('Project Manager', PM_EMAIL, template, 'deadline_approaching');
}

// 7. PM ← System: Milestone status updated
async function sendPMMilestoneUpdate(projectName, milestoneName, status) {
  const template = templates.getPMMilestoneUpdate('Phani', projectName, milestoneName, status);
  return sendMailHelper('Project Manager', PM_EMAIL, template, 'milestone_updated');
}

// 8. VENDOR ← System: New vendor request raised (abdul@glorysimon.com)
async function sendVendorNewRequest(requestItem, quantity, deliveryDate) {
  const template = templates.getVendorNewRequest('Abdul', requestItem, quantity, deliveryDate);
  return sendMailHelper('Vendor Coordinator', VENDOR_EMAIL, template, 'vendor_request_raised');
}

// 9. VENDOR ← System: Price confirmation needed
async function sendVendorPriceConfirmation(materialName, basePrice, status) {
  const template = templates.getVendorPriceConfirmation('Abdul', materialName, basePrice, status);
  return sendMailHelper('Vendor Coordinator', VENDOR_EMAIL, template, 'price_pending');
}

// 10. ADMIN ← System: Escalation alert (zotha@glorysimon.com)
async function sendAdminEscalationAlert(projectName, issueTitle, severity) {
  const template = templates.getAdminEscalationAlert('Zotha', projectName, issueTitle, severity);
  return sendMailHelper('Admin', ADMIN_EMAIL, template, 'issue_escalated');
}

// 11. ADMIN ← System: Payment reminder
async function sendAdminPaymentReminder(clientName, invoiceId, overdueDays) {
  const template = templates.getAdminPaymentReminder('Zotha', clientName, invoiceId, overdueDays);
  return sendMailHelper('Admin', ADMIN_EMAIL, template, 'payment_overdue');
}

// 12. CLIENT ← Designer: Design approval request with link
async function sendDesignerToClientApproval(clientEmail, clientName, designName, linkUrl, designerName) {
  const template = templates.getDesignerToClientApproval(clientName, designName, linkUrl, designerName);
  return sendMailHelper('Client', clientEmail, template, 'design_sent_to_client');
}

// 13. ALL ROLES ← Admin: Broadcast announcement
async function sendAdminBroadcast(clientEmail, clientName, announcementTitle, announcementContent) {
  const recipients = [
    { role: 'Admin', email: ADMIN_EMAIL, name: 'Zotha' },
    { role: 'Interior Designer', email: DESIGNER_EMAIL, name: 'Alex' },
    { role: 'Project Manager', email: PM_EMAIL, name: 'Phani' },
    { role: 'Vendor Coordinator', email: VENDOR_EMAIL, name: 'Abdul' }
  ];
  if (clientEmail) {
    recipients.push({ role: 'Client', email: clientEmail, name: clientName || 'Client' });
  }

  const results = [];
  for (const r of recipients) {
    const template = templates.getAdminBroadcast(r.name, announcementTitle, announcementContent);
    const result = await sendMailHelper(r.role, r.email, template, 'admin_announcement');
    results.push(result);
  }
  return results;
}

module.exports = {
  sendClientBookingConfirmation,
  sendClientApprovalStatus,
  sendClientInvoice,
  sendDesignerNewEnquiry,
  sendDesignerMaterialApproval,
  sendPMDeadlineReminder,
  sendPMMilestoneUpdate,
  sendVendorNewRequest,
  sendVendorPriceConfirmation,
  sendAdminEscalationAlert,
  sendAdminPaymentReminder,
  sendDesignerToClientApproval,
  sendAdminBroadcast
};
