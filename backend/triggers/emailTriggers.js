const emailService = require('../services/emailService');

async function triggerEmailEvent(event, data) {
  console.log(`[TRIGGER] Event received: ${event}`);
  
  switch (event) {
    case 'enquiry_submitted':
      // Calls sendDesignerNewEnquiry AND sendClientBookingConfirmation
      await emailService.sendDesignerNewEnquiry(
        data.clientName,
        data.clientPhone,
        data.requirements || 'No specific requirements given.'
      );
      await emailService.sendClientBookingConfirmation(
        data.clientEmail,
        data.clientName,
        data.visitDate || new Date().toLocaleString(),
        data.projectAddress || 'TBD Address',
        data.pmName || 'Phani'
      );
      break;

    case 'site_visit_booked':
      await emailService.sendClientBookingConfirmation(
        data.clientEmail,
        data.clientName,
        data.visitDate,
        data.projectAddress,
        data.pmName || 'Phani'
      );
      break;

    case 'design_approved':
      await emailService.sendClientApprovalStatus(
        data.clientEmail,
        data.clientName,
        data.designName,
        'Approved',
        data.designerNotes
      );
      break;

    case 'design_rejected':
      await emailService.sendClientApprovalStatus(
        data.clientEmail,
        data.clientName,
        data.designName,
        'Rejected',
        data.designerNotes
      );
      break;

    case 'invoice_generated':
      await emailService.sendClientInvoice(
        data.clientEmail,
        data.clientName,
        data.invoiceId,
        data.amount,
        data.dueDate
      );
      break;

    case 'material_pending':
      await emailService.sendDesignerMaterialApproval(
        data.projectName,
        data.materialName,
        data.vendorName
      );
      break;

    case 'deadline_approaching':
      await emailService.sendPMDeadlineReminder(
        data.projectName,
        data.taskTitle,
        data.dueDate
      );
      break;

    case 'milestone_updated':
      await emailService.sendPMMilestoneUpdate(
        data.projectName,
        data.milestoneName,
        data.status
      );
      break;

    case 'vendor_request_raised':
      await emailService.sendVendorNewRequest(
        data.requestItem,
        data.quantity,
        data.deliveryDate
      );
      break;

    case 'price_pending':
      await emailService.sendVendorPriceConfirmation(
        data.materialName,
        data.basePrice,
        data.status || 'Pending'
      );
      break;

    case 'issue_escalated':
      await emailService.sendAdminEscalationAlert(
        data.projectName,
        data.issueTitle,
        data.severity || 'Urgent'
      );
      break;

    case 'payment_overdue':
      await emailService.sendAdminPaymentReminder(
        data.clientName,
        data.invoiceId,
        data.overdueDays || 5
      );
      break;

    case 'design_sent_to_client':
      await emailService.sendDesignerToClientApproval(
        data.clientEmail,
        data.clientName,
        data.designName,
        data.linkUrl || 'http://localhost:5173/projects',
        data.designerName || 'Alex'
      );
      break;

    case 'admin_announcement':
      await emailService.sendAdminBroadcast(
        data.clientEmail,
        data.clientName,
        data.announcementTitle,
        data.announcementContent
      );
      break;

    default:
      console.warn(`[TRIGGER] Event not recognized: ${event}`);
  }
}

module.exports = {
  triggerEmailEvent
};
