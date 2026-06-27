const express = require('express');
const cors = require('cors');
const { initDb, getDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database on startup
initDb()
  .then(() => {
    console.log('Database initialized successfully.');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });

// --- API ROUTES ---

// 1. Overview Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const db = await getDb();
    
    const projectsCount = await db.get('SELECT COUNT(*) as count FROM projects');
    const activeProjects = await db.get("SELECT COUNT(*) as count FROM projects WHERE status != 'Completed'");
    const approvedMaterials = await db.get("SELECT COUNT(*) as count FROM material_selections WHERE status = 'Approved'");
    const pendingMaterials = await db.get("SELECT COUNT(*) as count FROM material_selections WHERE status = 'Pending'");
    const activeVendors = await db.get('SELECT COUNT(*) as count FROM vendors');
    const siteVisits = await db.get('SELECT COUNT(*) as count FROM site_visits');

    // Budget usage calculation: approved materials sum + expenses vs total budget of all projects
    const totalBudget = await db.get('SELECT SUM(budget) as total FROM projects');
    const approvedCost = await db.get('SELECT SUM(ms.quantity * m.unit_price) as total FROM material_selections ms JOIN materials m ON ms.material_id = m.id WHERE ms.status = "Approved"');
    const expensesCost = await db.get('SELECT SUM(amount) as total FROM expenses');

    const totalSpent = (approvedCost.total || 0) + (expensesCost.total || 0);
    const budgetCap = totalBudget.total || 0;
    const utilizationPct = budgetCap > 0 ? Math.round((totalSpent / budgetCap) * 100) : 0;

    // Recent activity log from audit trail
    const recentActivity = await db.all(`
      SELECT mh.*, p.name as project_name, m.name as material_name
      FROM material_history mh
      JOIN projects p ON mh.project_id = p.id
      JOIN material_selections ms ON mh.material_selection_id = ms.id
      JOIN materials m ON ms.material_id = m.id
      ORDER BY mh.created_at DESC
      LIMIT 8
    `);

    res.json({
      totalProjects: projectsCount.count,
      activeProjects: activeProjects.count,
      approvedMaterials: approvedMaterials.count,
      pendingMaterials: pendingMaterials.count,
      activeVendors: activeVendors.count,
      siteVisitsScheduled: siteVisits.count,
      budgetUsage: {
        totalBudget: budgetCap,
        totalSpent,
        utilizationPct
      },
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Projects CRUD
app.get('/api/projects', async (req, res) => {
  const { search, type, status, sortBy, sortOrder } = req.query;
  
  try {
    const db = await getDb();
    
    let query = `
      SELECT p.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.type as client_type
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR c.name LIKE ? OR p.address LIKE ?)`;
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (type) {
      query += ` AND c.type = ?`;
      params.push(type);
    }

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    // Sorting
    const allowedSortFields = {
      name: 'p.name',
      budget: 'p.budget',
      created_at: 'p.created_at',
      status: 'p.status'
    };
    const sortField = allowedSortFields[sortBy] || 'p.created_at';
    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${direction}`;

    const projects = await db.all(query, params);
    
    // Add approved selections info
    for (let project of projects) {
      const selections = await db.get(`
        SELECT COUNT(*) as total, 
        SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) as approved 
        FROM material_selections WHERE project_id = ?
      `, [project.id]);
      project.total_selections = selections.total || 0;
      project.approved_selections = selections.approved || 0;
    }
    
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Project
app.post('/api/projects', async (req, res) => {
  const { name, clientName, phone, email, location, type, budget, notes, startDate, assignedDesigner } = req.body;
  if (!name || !clientName) {
    return res.status(400).json({ error: 'Project Name and Client Name are required.' });
  }

  try {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');

    // Create client
    const clientRes = await db.run(
      `INSERT INTO clients (name, email, phone, type, status) VALUES (?, ?, ?, ?, 'Active')`,
      [clientName, email || '', phone || '', type || 'Residential']
    );
    const clientId = clientRes.lastID;

    // Create project
    const projectRes = await db.run(
      `INSERT INTO projects (client_id, name, status, budget, address, notes, start_date, assigned_designer) VALUES (?, ?, 'Enquiry', ?, ?, ?, ?, ?)`,
      [clientId, name, budget || 0, location || '', notes || '', startDate || null, assignedDesigner || null]
    );
    const projectId = projectRes.lastID;

    // Seed default spaces for direct quick setup
    await db.run(
      `INSERT INTO rooms (project_id, name, length, width, height, notes) VALUES
       (?, 'Living Room', 16.0, 14.0, 10.0, 'Primary reception space'),
       (?, 'Master Bedroom', 14.0, 12.0, 10.0, 'Standard master bedroom layout')`,
      [projectId, projectId]
    );

    // Initial audit entry
    await db.run(
      `INSERT INTO material_history (project_id, room_id, material_selection_id, user_name, previous_status, new_status, notes)
       VALUES (?, NULL, NULL, 'System', 'None', 'Created', ?)`,
      [projectId, `Project folder initialized: ${name}`]
    );

    await db.run('COMMIT');
    res.status(201).json({ id: projectId, clientId });
  } catch (err) {
    const db = await getDb();
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Update Project
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, budget, address, notes, status, clientName, clientEmail, clientPhone, clientType, startDate, assignedDesigner } = req.body;
  
  try {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');

    // Update project attributes
    let projectUpdates = [];
    let projectParams = [];
    if (name !== undefined) { projectUpdates.push('name = ?'); projectParams.push(name); }
    if (budget !== undefined) { projectUpdates.push('budget = ?'); projectParams.push(budget); }
    if (address !== undefined) { projectUpdates.push('address = ?'); projectParams.push(address); }
    if (notes !== undefined) { projectUpdates.push('notes = ?'); projectParams.push(notes); }
    if (status !== undefined) { projectUpdates.push('status = ?'); projectParams.push(status); }
    if (startDate !== undefined) { projectUpdates.push('start_date = ?'); projectParams.push(startDate); }
    if (assignedDesigner !== undefined) { projectUpdates.push('assigned_designer = ?'); projectParams.push(assignedDesigner); }
    
    if (projectUpdates.length > 0) {
      projectParams.push(id);
      await db.run(`UPDATE projects SET ${projectUpdates.join(', ')} WHERE id = ?`, projectParams);
    }

    // Update client attributes
    const proj = await db.get('SELECT client_id FROM projects WHERE id = ?', [id]);
    if (proj) {
      let clientUpdates = [];
      let clientParams = [];
      if (clientName !== undefined) { clientUpdates.push('name = ?'); clientParams.push(clientName); }
      if (clientEmail !== undefined) { clientUpdates.push('email = ?'); clientParams.push(clientEmail); }
      if (clientPhone !== undefined) { clientUpdates.push('phone = ?'); clientParams.push(clientPhone); }
      if (clientType !== undefined) { clientUpdates.push('type = ?'); clientParams.push(clientType); }

      if (clientUpdates.length > 0) {
        clientParams.push(proj.client_id);
        await db.run(`UPDATE clients SET ${clientUpdates.join(', ')} WHERE id = ?`, clientParams);
      }
    }

    // Add status history update if applicable
    if (status !== undefined) {
      await db.run(
        `INSERT INTO material_history (project_id, room_id, material_selection_id, user_name, previous_status, new_status, notes)
         VALUES (?, NULL, NULL, 'Staff', 'StatusChange', ?, ?)`,
        [id, status, `Project status changed to ${status}`]
      );
    }

    await db.run('COMMIT');
    res.json({ success: true });
  } catch (err) {
    const db = await getDb();
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Delete Project
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    await db.run('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Project successfully deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Project details
app.get('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    
    const project = await db.get(`
      SELECT p.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.type as client_type
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const rooms = await db.all('SELECT * FROM rooms WHERE project_id = ?', [id]);

    for (let room of rooms) {
      room.concepts = await db.all('SELECT * FROM design_concepts WHERE room_id = ?', [room.id]);
    }

    const selections = await db.all(`
      SELECT ms.*, m.name as material_name, m.brand, m.sku, m.unit_price, m.category, m.image_url, v.name as vendor_name
      FROM material_selections ms
      JOIN materials m ON ms.material_id = m.id
      LEFT JOIN vendors v ON ms.vendor_id = v.id
      WHERE ms.project_id = ?
    `, [id]);

    const expenses = await db.all('SELECT * FROM expenses WHERE project_id = ?', [id]);
    const tasks = await db.all('SELECT * FROM tasks WHERE project_id = ?', [id]);
    const siteVisits = await db.all('SELECT * FROM site_visits WHERE project_id = ?', [id]);

    const activityHistory = await db.all(`
      SELECT mh.*, m.name as material_name, r.name as room_name
      FROM material_history mh
      LEFT JOIN material_selections ms ON mh.material_selection_id = ms.id
      LEFT JOIN materials m ON ms.material_id = m.id
      LEFT JOIN rooms r ON mh.room_id = r.id
      WHERE mh.project_id = ?
      ORDER BY mh.created_at DESC
    `, [id]);

    res.json({
      project,
      rooms,
      selections,
      expenses,
      tasks,
      siteVisits,
      activityHistory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rooms add
app.post('/api/projects/:id/rooms', async (req, res) => {
  const { id } = req.params;
  const { name, length, width, height, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Room name required.' });

  try {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO rooms (project_id, name, length, width, height, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, length || 0, width || 0, height || 0, notes || '']
    );
    res.status(201).json({ id: result.lastID, project_id: id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Materials Catalog
app.get('/api/materials', async (req, res) => {
  try {
    const db = await getDb();
    const materials = await db.all(`
      SELECT m.*, v.name as vendor_name 
      FROM materials m
      LEFT JOIN vendors v ON m.vendor_id = v.id
    `);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const db = await getDb();
    const vendors = await db.all('SELECT * FROM vendors');
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Selections
app.post('/api/selections', async (req, res) => {
  const { projectId, roomId, materialId, vendorId, quantity, notes, userName } = req.body;
  if (!projectId || !materialId) {
    return res.status(400).json({ error: 'Project ID and Material ID are required.' });
  }

  try {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');

    let finalVendorId = vendorId;
    if (!finalVendorId) {
      const mat = await db.get('SELECT vendor_id FROM materials WHERE id = ?', [materialId]);
      finalVendorId = mat ? mat.vendor_id : null;
    }

    const result = await db.run(
      `INSERT INTO material_selections (project_id, room_id, material_id, vendor_id, quantity, status, notes) 
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
      [projectId, roomId || null, materialId, finalVendorId, quantity || 1, notes || '']
    );
    const selectionId = result.lastID;

    // Log to material_history audit log
    const mat = await db.get('SELECT name FROM materials WHERE id = ?', [materialId]);
    await db.run(
      `INSERT INTO material_history (project_id, room_id, material_selection_id, user_name, previous_status, new_status, notes)
       VALUES (?, ?, ?, ?, 'None', 'Pending', ?)`,
      [projectId, roomId || null, selectionId, userName || 'Staff', `Selected initial material "${mat.name}"`]
    );

    await db.run('COMMIT');

    const newSelection = await db.get(`
      SELECT ms.*, m.name as material_name, m.brand, m.sku, m.unit_price, m.category, m.image_url, v.name as vendor_name
      FROM material_selections ms
      JOIN materials m ON ms.material_id = m.id
      LEFT JOIN vendors v ON ms.vendor_id = v.id
      WHERE ms.id = ?
    `, [selectionId]);

    res.status(201).json(newSelection);
  } catch (err) {
    const db = await getDb();
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Update selection status (Approve, Replaced, Selected) + audit logging
app.put('/api/selections/:id', async (req, res) => {
  const { id } = req.params;
  const { status, notes, quantity, vendorId, userName } = req.body;
  
  try {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');

    const oldSelection = await db.get(`
      SELECT ms.*, m.name as mat_name
      FROM material_selections ms
      JOIN materials m ON ms.material_id = m.id
      WHERE ms.id = ?
    `, [id]);

    if (!oldSelection) {
      return res.status(404).json({ error: 'Selection not found' });
    }

    let updates = [];
    let params = [];
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (quantity !== undefined) { updates.push('quantity = ?'); params.push(quantity); }
    if (vendorId !== undefined) { updates.push('vendor_id = ?'); params.push(vendorId); }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await db.run(`UPDATE material_selections SET ${updates.join(', ')} WHERE id = ?`, params);

    // If status changed, record audit trail log
    if (status && status !== oldSelection.status) {
      await db.run(
        `INSERT INTO material_history (project_id, room_id, material_selection_id, user_name, previous_status, new_status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          oldSelection.project_id,
          oldSelection.room_id,
          id,
          userName || 'Staff',
          oldSelection.status,
          status,
          notes || `Updated state from ${oldSelection.status} to ${status} for "${oldSelection.mat_name}"`
        ]
      );
    }

    await db.run('COMMIT');

    const updatedSelection = await db.get(`
      SELECT ms.*, m.name as material_name, m.brand, m.sku, m.unit_price, m.category, m.image_url, v.name as vendor_name
      FROM material_selections ms
      JOIN materials m ON ms.material_id = m.id
      LEFT JOIN vendors v ON ms.vendor_id = v.id
      WHERE ms.id = ?
    `, [id]);

    res.json(updatedSelection);
  } catch (err) {
    const db = await getDb();
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Selections audit log GET api
app.get('/api/selections/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const history = await db.all(`
      SELECT mh.*, m.name as material_name 
      FROM material_history mh
      JOIN material_selections ms ON mh.material_selection_id = ms.id
      JOIN materials m ON ms.material_id = m.id
      WHERE mh.material_selection_id = ?
      ORDER BY mh.created_at DESC
    `, [id]);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete material selection
app.delete('/api/selections/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    await db.run('DELETE FROM material_selections WHERE id = ?', [id]);
    res.json({ success: true, message: 'Selection deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sourcing direct expenses
app.post('/api/projects/:projectId/expenses', async (req, res) => {
  const { projectId } = req.params;
  const { category, amount, notes, date } = req.body;
  if (!category || !amount) {
    return res.status(400).json({ error: 'Category and Amount are required.' });
  }
  try {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO expenses (project_id, category, amount, notes, date) VALUES (?, ?, ?, ?, ?)`,
      [projectId, category, amount, notes || '', date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ id: result.lastID, project_id: projectId, category, amount, notes, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks update
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const db = await getDb();
    await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Task to project
app.post('/api/projects/:id/tasks', async (req, res) => {
  const { id } = req.params;
  const { title, assignedTo, dueDate } = req.body;
  if (!title || !assignedTo) {
    return res.status(400).json({ error: 'Title and Assignment Role are required.' });
  }
  try {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO tasks (project_id, title, assigned_to, status, due_date) VALUES (?, ?, ?, 'To Do', ?)`,
      [id, title, assignedTo, dueDate || '']
    );
    res.status(201).json({ id: result.lastID, project_id: id, title, assigned_to: assignedTo, status: 'To Do', due_date: dueDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Site Visit
app.post('/api/projects/:id/site-visits', async (req, res) => {
  const { id } = req.params;
  const { visitDate, visitorName, notes, photos } = req.body;
  if (!visitDate || !visitorName) {
    return res.status(400).json({ error: 'Visit date and visitor name are required.' });
  }
  try {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');

    const result = await db.run(
      `INSERT INTO site_visits (project_id, visit_date, visitor_name, notes, photos) VALUES (?, ?, ?, ?, ?)`,
      [id, visitDate, visitorName, notes || '', photos || '/assets/photos/visit_generic.svg']
    );
    const visitId = result.lastID;

    // Log to material_history
    await db.run(
      `INSERT INTO material_history (project_id, room_id, material_selection_id, user_name, previous_status, new_status, notes)
       VALUES (?, NULL, NULL, ?, 'None', 'SiteVisit', ?)`,
      [id, visitorName, `Scheduled site visit logged for date ${visitDate}`]
    );

    await db.run('COMMIT');
    res.status(201).json({ id: visitId, project_id: id, visitDate, visitorName, notes });
  } catch (err) {
    const db = await getDb();
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Update Design Concept approval status
app.put('/api/projects/:id/concepts/:conceptId', async (req, res) => {
  const { id, conceptId } = req.params;
  const { status, userName } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }
  try {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');

    const concept = await db.get('SELECT * FROM design_concepts WHERE id = ?', [conceptId]);
    if (!concept) {
      await db.run('ROLLBACK');
      return res.status(404).json({ error: 'Design concept not found.' });
    }

    await db.run('UPDATE design_concepts SET status = ? WHERE id = ?', [status, conceptId]);

    // Log to audit history
    await db.run(
      `INSERT INTO material_history (project_id, room_id, material_selection_id, user_name, previous_status, new_status, notes)
       VALUES (?, ?, NULL, ?, ?, ?, ?)`,
      [id, concept.room_id, userName || 'Staff', concept.status, status, `Design concept "${concept.title}" marked as ${status}`]
    );

    await db.run('COMMIT');
    res.json({ success: true, status });
  } catch (err) {
    const db = await getDb();
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// --- REPORTING ENDPOINTS ---

// Material Report
app.get('/api/reports/materials', async (req, res) => {
  const { projectId } = req.query;
  try {
    const db = await getDb();
    let query = `
      SELECT ms.id, p.name as project_name, r.name as room_name, m.name as material_name, 
             m.category, v.name as vendor_name, ms.quantity, m.unit_price, 
             (ms.quantity * m.unit_price) as total_cost, ms.status
      FROM material_selections ms
      JOIN projects p ON ms.project_id = p.id
      JOIN materials m ON ms.material_id = m.id
      LEFT JOIN rooms r ON ms.room_id = r.id
      LEFT JOIN vendors v ON ms.vendor_id = v.id
    `;
    let params = [];
    if (projectId) {
      query += ` WHERE ms.project_id = ?`;
      params.push(projectId);
    }
    query += ` ORDER BY p.name, r.name, m.name`;
    const reports = await db.all(query, params);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vendor Sourced Cost Report
app.get('/api/reports/vendors', async (req, res) => {
  try {
    const db = await getDb();
    const reports = await db.all(`
      SELECT v.name as vendor_name, v.category, v.rating,
             COUNT(DISTINCT ms.project_id) as projects_sourced,
             COUNT(ms.id) as materials_sourced,
             SUM(ms.quantity * m.unit_price) as total_sourced_cost
      FROM vendors v
      LEFT JOIN material_selections ms ON v.id = ms.vendor_id
      LEFT JOIN materials m ON ms.material_id = m.id
      GROUP BY v.id
      ORDER BY total_sourced_cost DESC
    `);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Budget tracking summary report
app.get('/api/reports/budget', async (req, res) => {
  try {
    const db = await getDb();
    const reports = await db.all(`
      SELECT p.id, p.name as project_name, p.budget as total_budget,
             COALESCE(SUM(CASE WHEN ms.status = 'Approved' THEN ms.quantity * m.unit_price ELSE 0 END), 0) as approved_materials_cost,
             COALESCE((SELECT SUM(amount) FROM expenses WHERE project_id = p.id), 0) as total_expenses_cost
      FROM projects p
      LEFT JOIN material_selections ms ON p.id = ms.project_id
      LEFT JOIN materials m ON ms.material_id = m.id
      GROUP BY p.id
    `);

    // Add remaining calculations dynamically
    reports.forEach(r => {
      r.total_spent = r.approved_materials_cost + r.total_expenses_cost;
      r.remaining_budget = r.total_budget - r.total_spent;
      r.utilization_pct = r.total_budget > 0 ? Math.round((r.total_spent / r.total_budget) * 100) : 0;
    });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clients CRUD APIs
app.get('/api/clients', async (req, res) => {
  try {
    const db = await getDb();
    const clients = await db.all('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, email, phone, company, type, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO clients (name, email, phone, company, type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email || '', phone || '', company || '', type || 'Residential', status || 'Active']
    );
    res.status(201).json({ id: result.lastID, name, email, phone, company, type, status: status || 'Active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  const { name, email, phone, company, type, status } = req.body;
  const { id } = req.params;
  try {
    const db = await getDb();
    await db.run(
      'UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, type = ?, status = ? WHERE id = ?',
      [name, email, phone, company, type, status, id]
    );
    res.json({ id: Number(id), name, email, phone, company, type, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    await db.run('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vendors CRUD APIs
app.post('/api/vendors', async (req, res) => {
  const { name, contact_name, phone, email, category, address, rating } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Name and category are required' });
  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO vendors (name, contact_name, phone, email, category, address, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, contact_name || '', phone || '', email || '', category, address || '', rating || 5.0]
    );
    res.status(201).json({ id: result.lastID, name, contact_name, phone, email, category, address, rating: rating || 5.0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vendors/:id', async (req, res) => {
  const { name, contact_name, phone, email, category, address, rating } = req.body;
  const { id } = req.params;
  try {
    const db = await getDb();
    await db.run(
      'UPDATE vendors SET name = ?, contact_name = ?, phone = ?, email = ?, category = ?, address = ?, rating = ? WHERE id = ?',
      [name, contact_name, phone, email, category, address, rating, id]
    );
    res.json({ id: Number(id), name, contact_name, phone, email, category, address, rating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    await db.run('DELETE FROM vendors WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USERS & AUTH API ENDPOINTS ---

// 1. Get all users
app.get('/api/users', async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.all('SELECT name, email, role, avatar, status FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Authenticate User (Login)
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const status = user.status || 'Approved';
    if (status === 'Pending') {
      return res.status(403).json({ error: 'Your access request is pending admin approval.' });
    }
    if (status === 'Declined') {
      return res.status(403).json({ error: 'Your access request has been declined or suspended.' });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      status: user.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Request Access (Register)
app.post('/api/users/register', async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const db = await getDb();
    const existing = await db.get('SELECT email FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    await db.run(
      `INSERT INTO users (name, email, role, avatar, password, status) VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [name, email.trim(), role, initials || 'US', password]
    );

    res.status(201).json({ success: true, message: 'Access request submitted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create User (Admin Manual Add)
app.post('/api/users', async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const db = await getDb();
    const existing = await db.get('SELECT email FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    await db.run(
      `INSERT INTO users (name, email, role, avatar, password, status) VALUES (?, ?, ?, ?, ?, 'Approved')`,
      [name, email.trim(), role, initials || 'US', password]
    );

    res.status(201).json({ success: true, message: 'User created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Update User Access Status (Approve/Decline/Suspend)
app.put('/api/users/:email/status', async (req, res) => {
  const { email } = req.params;
  const { status } = req.body;
  
  if (!status || !['Pending', 'Approved', 'Declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing status value.' });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      'UPDATE users SET status = ? WHERE LOWER(email) = LOWER(?)',
      [status, email.trim()]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    res.json({ success: true, message: 'User access status updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Delete User Account
app.delete('/api/users/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    res.json({ success: true, message: 'User account successfully deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. Communications & Notifications APIs
// ==========================================

// Get all communications
app.get('/api/communications', async (req, res) => {
  try {
    const db = await getDb();
    const list = await db.all('SELECT * FROM communications ORDER BY created_at DESC');
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new communication
app.post('/api/communications', async (req, res) => {
  const { projectId, type, recipient, message, status } = req.body;
  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO communications (project_id, type, recipient, message, status) VALUES (?, ?, ?, ?, ?)',
      [projectId || null, type || 'email', recipient, message, status || 'Sent']
    );
    const newComm = await db.get('SELECT * FROM communications WHERE id = ?', [result.lastID]);
    res.status(201).json(newComm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const db = await getDb();
    const list = await db.all('SELECT * FROM notifications ORDER BY created_at DESC');
    // Map SQLite read 0/1 to boolean false/true
    const formatted = list.map(n => ({
      ...n,
      read: !!n.read
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new notification
app.post('/api/notifications', async (req, res) => {
  const { type, title, message, date, requestEmail } = req.body;
  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO notifications (type, title, message, date, read, requestEmail) VALUES (?, ?, ?, ?, 0, ?)',
      [type, title, message, date || 'Just now', requestEmail || null]
    );
    const newNotif = await db.get('SELECT * FROM notifications WHERE id = ?', [result.lastID]);
    res.status(201).json({
      ...newNotif,
      read: !!newNotif.read
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read/unread
app.put('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  const { read } = req.body;
  try {
    const db = await getDb();
    await db.run(
      'UPDATE notifications SET read = ? WHERE id = ?',
      [read ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a notification
app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    await db.run('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
