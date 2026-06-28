const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { getEmailLogs } = require('../logs/emailLogger');

// 1. Booking Confirmation
router.post('/booking-confirmation', async (req, res) => {
  const { clientEmail, clientName, visitDate, projectAddress, pmName } = req.body;
  const result = await emailService.sendClientBookingConfirmation(
    clientEmail || 'sidharthrathod0609@gmail.com',
    clientName || 'Sidharth Rathod',
    visitDate || '2026-06-30 10:00 AM',
    projectAddress || 'Penthouse 101, Prestige Palms, Mumbai',
    pmName || 'Phani'
  );
  res.json(result);
});

// 2. Design Approval (Approved/Rejected status update)
router.post('/design-approval', async (req, res) => {
  const { clientEmail, clientName, designName, status, designerNotes } = req.body;
  const result = await emailService.sendClientApprovalStatus(
    clientEmail || 'sidharthrathod0609@gmail.com',
    clientName || 'Sidharth Rathod',
    designName || 'Living Room false ceiling layout',
    status || 'Approved',
    designerNotes || 'Looks perfect. Sourced materials approved.'
  );
  res.json(result);
});

// 3. Invoice
router.post('/invoice', async (req, res) => {
  const { clientEmail, clientName, invoiceId, amount, dueDate } = req.body;
  const result = await emailService.sendClientInvoice(
    clientEmail || 'sidharthrathod0609@gmail.com',
    clientName || 'Sidharth Rathod',
    invoiceId || 'INV-2026-092',
    amount || 120000,
    dueDate || '2026-07-05'
  );
  res.json(result);
});

// 4. New Enquiry (Designer)
router.post('/new-enquiry', async (req, res) => {
  const { clientName, clientPhone, requirements } = req.body;
  const result = await emailService.sendDesignerNewEnquiry(
    clientName || 'Sidharth Rathod',
    clientPhone || '+91 98765 43210',
    requirements || 'Kitchen modular furniture layout with marble countertops.'
  );
  res.json(result);
});

// 5. Material Approval (Designer)
router.post('/material-approval', async (req, res) => {
  const { projectName, materialName, vendorName } = req.body;
  const result = await emailService.sendDesignerMaterialApproval(
    projectName || "Rathod's Villa",
    materialName || 'Carrara Vitrified Tiles',
    vendorName || 'Apex Marble & Tiles'
  );
  res.json(result);
});

// 6. Deadline Reminder (PM)
router.post('/deadline-reminder', async (req, res) => {
  const { projectName, taskTitle, dueDate } = req.body;
  const result = await emailService.sendPMDeadlineReminder(
    projectName || "Rathod's Villa",
    taskTitle || 'Confirm false ceiling frame layout design',
    dueDate || '2026-06-29'
  );
  res.json(result);
});

// 7. Milestone Update (PM)
router.post('/milestone-update', async (req, res) => {
  const { projectName, milestoneName, status } = req.body;
  const result = await emailService.sendPMMilestoneUpdate(
    projectName || "Rathod's Villa",
    milestoneName || 'Flooring & Tiling Work',
    status || 'In Progress'
  );
  res.json(result);
});

// 8. Vendor Request
router.post('/vendor-request', async (req, res) => {
  const { requestItem, quantity, deliveryDate } = req.body;
  const result = await emailService.sendVendorNewRequest(
    requestItem || 'Italian Carrara Vitrified Tile',
    quantity || 432,
    deliveryDate || '2026-07-10'
  );
  res.json(result);
});

// 9. Price Confirmation (Vendor)
router.post('/price-confirmation', async (req, res) => {
  const { materialName, basePrice, status } = req.body;
  const result = await emailService.sendVendorPriceConfirmation(
    materialName || 'Brushed Brass Knurled Handles',
    basePrice || 12,
    status || 'Approved'
  );
  res.json(result);
});

// 10. Escalation Alert (Admin)
router.post('/escalation-alert', async (req, res) => {
  const { projectName, issueTitle, severity } = req.body;
  const result = await emailService.sendAdminEscalationAlert(
    projectName || "Rathod's Villa",
    issueTitle || 'Slabs delayed due to supplier transit issues.',
    severity || 'Urgent / High Priority'
  );
  res.json(result);
});

// 11. Payment Reminder (Admin)
router.post('/payment-reminder', async (req, res) => {
  const { clientName, invoiceId, overdueDays } = req.body;
  const result = await emailService.sendAdminPaymentReminder(
    clientName || 'Sidharth Rathod',
    invoiceId || 'INV-2026-092',
    overdueDays || 7
  );
  res.json(result);
});

// 12. Design Approval Request (Client from Designer)
router.post('/design-approval-request', async (req, res) => {
  const { clientEmail, clientName, designName, linkUrl, designerName } = req.body;
  const result = await emailService.sendDesignerToClientApproval(
    clientEmail || 'sidharthrathod0609@gmail.com',
    clientName || 'Sidharth Rathod',
    designName || 'Living Room false ceiling layout',
    linkUrl || 'http://localhost:5173/projects',
    designerName || 'Alex'
  );
  res.json(result);
});

// 13. Broadcast (All Roles)
router.post('/broadcast', async (req, res) => {
  const { clientEmail, clientName, announcementTitle, announcementContent } = req.body;
  const result = await emailService.sendAdminBroadcast(
    clientEmail || 'sidharthrathod0609@gmail.com',
    clientName || 'Sidharth Rathod',
    announcementTitle || 'System Upgrade & Maintenance Schedule',
    announcementContent || 'Portal will be offline for 2 hours on Sunday morning for schema upgrades.'
  );
  res.json({ success: true, results: result });
});

// Get logs endpoint
router.get('/logs', (req, res) => {
  res.json(getEmailLogs());
});

module.exports = router;
