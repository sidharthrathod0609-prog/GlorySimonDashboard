const { initDb, getDb } = require('./database');

async function verify() {
  console.log('--- Refactored Database Verification Script ---');
  try {
    const db = await initDb();

    // Check tables counts
    const clients = await db.get('SELECT COUNT(*) as count FROM clients');
    const projects = await db.get('SELECT COUNT(*) as count FROM projects');
    const rooms = await db.get('SELECT COUNT(*) as count FROM rooms');
    const materials = await db.get('SELECT COUNT(*) as count FROM materials');
    const selections = await db.get('SELECT COUNT(*) as count FROM material_selections');
    const history = await db.get('SELECT COUNT(*) as count FROM material_history');
    const vendors = await db.get('SELECT COUNT(*) as count FROM vendors');
    const expenses = await db.get('SELECT COUNT(*) as count FROM expenses');
    const tasks = await db.get('SELECT COUNT(*) as count FROM tasks');

    console.log(`Clients count: ${clients.count}`);
    console.log(`Projects count: ${projects.count}`);
    console.log(`Rooms count: ${rooms.count}`);
    console.log(`Materials in catalogue: ${materials.count}`);
    console.log(`Selections created: ${selections.count}`);
    console.log(`Audit History count: ${history.count}`);
    console.log(`Vendors count: ${vendors.count}`);
    console.log(`Expenses count: ${expenses.count}`);
    console.log(`Tasks count: ${tasks.count}`);

    console.log('Querying a project-material selection audit history workflow demo:');
    const selectQuery = await db.all(`
      SELECT mh.id, p.name as project, m.name as material, mh.previous_status, mh.new_status, mh.user_name
      FROM material_history mh
      JOIN projects p ON mh.project_id = p.id
      JOIN material_selections ms ON mh.material_selection_id = ms.id
      JOIN materials m ON ms.material_id = m.id
      LIMIT 3
    `);
    console.log(JSON.stringify(selectQuery, null, 2));

    console.log('SUCCESS: Simplified Database created and verified successfully.');
    await db.close();
  } catch (err) {
    console.error('ERROR during verification:', err);
    process.exit(1);
  }
}

verify();
