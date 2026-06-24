const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'glorysimon.db');

async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

async function initDb() {
  const db = await getDb();

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      type TEXT CHECK(type IN ('Residential', 'Commercial')) DEFAULT 'Residential',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      name TEXT NOT NULL,
      status TEXT CHECK(status IN ('Enquiry', 'Site Visit', 'Space Planning', 'Quotation', 'Design Approval', 'Material Selection', 'Execution', 'Quality Inspection', 'Completed')) DEFAULT 'Enquiry',
      budget REAL DEFAULT 0,
      address TEXT,
      notes TEXT,
      start_date TEXT DEFAULT NULL,
      assigned_designer TEXT DEFAULT NULL,
      image_url TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
  
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name TEXT NOT NULL,
      length REAL,
      width REAL,
      height REAL,
      notes TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS design_concepts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Revised')) DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      category TEXT NOT NULL,
      address TEXT,
      rating REAL DEFAULT 5.0
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT CHECK(category IN ('Tiles', 'Laminates', 'Paints', 'Furniture', 'Lighting', 'Hardware', 'Fabric')) NOT NULL,
      name TEXT NOT NULL,
      brand TEXT,
      sku TEXT,
      unit_price REAL NOT NULL,
      image_url TEXT,
      vendor_id INTEGER,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS material_selections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      room_id INTEGER,
      material_id INTEGER,
      vendor_id INTEGER,
      quantity REAL DEFAULT 1,
      status TEXT CHECK(status IN ('Pending', 'Selected', 'Approved', 'Rejected', 'Replaced')) DEFAULT 'Pending',
      notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS material_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      room_id INTEGER,
      material_selection_id INTEGER,
      user_name TEXT,
      previous_status TEXT,
      new_status TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY (material_selection_id) REFERENCES material_selections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      date TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title TEXT NOT NULL,
      assigned_to TEXT CHECK(assigned_to IN ('Designer', 'Project Manager', 'Site Engineer', 'Vendor Coordinator', 'Admin')) NOT NULL,
      status TEXT CHECK(status IN ('To Do', 'In Progress', 'Completed')) DEFAULT 'To Do',
      due_date TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS site_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      visit_date TEXT NOT NULL,
      visitor_name TEXT NOT NULL,
      notes TEXT,
      photos TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      password TEXT NOT NULL,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Declined')) DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Run dynamic migrations for pre-existing databases
  try {
    await db.run('ALTER TABLE projects ADD COLUMN start_date TEXT DEFAULT NULL');
  } catch (e) {
    // Already exists
  }
  try {
    await db.run('ALTER TABLE projects ADD COLUMN assigned_designer TEXT DEFAULT NULL');
  } catch (e) {
    // Already exists
  }
  try {
    await db.run('ALTER TABLE projects ADD COLUMN image_url TEXT DEFAULT NULL');
  } catch (e) {
    // Already exists
  }

  // Seed default users if users table is empty (always checked on startup)
  try {
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (usersCount.count === 0) {
      console.log('Seeding default system users...');
      await db.run(`INSERT INTO users (name, email, role, avatar, password, status) VALUES
        ('Zotha', 'zotha@glorysimon.com', 'Admin', 'Z', 'Admin123', 'Approved'),
        ('Nisha Sen', 'designer@glorysimon.com', 'Interior Designer', 'NS', 'Design123', 'Approved'),
        ('Rahul Dev', 'pm@glorysimon.com', 'Project Manager', 'RD', 'PM123', 'Approved'),
        ('Meera Nair', 'vendor@glorysimon.com', 'Vendor Coordinator', 'MN', 'Vendor123', 'Approved')
      `);
    }
  } catch (err) {
    console.error('Error seeding default users:', err);
  }

  // Check if we already have clients. If so, database is seeded, skip.
  const clientsCount = await db.get('SELECT COUNT(*) as count FROM clients');
  if (clientsCount.count > 0) {
    console.log('Database already has data. Skipping seed.');
    return db;
  }

  console.log('Seeding database with Glory Simon Interiors refactored mock data...');

  // Seed vendors
  await db.run(`INSERT INTO vendors (name, contact_name, phone, email, category, address, rating) VALUES
    ('Apex Marble & Tiles', 'Ramesh Kumar', '+91 98765 43210', 'info@apexmarble.com', 'Tiles', 'Sector 15, Industrial Area, Mumbai', 4.8),
    ('DecoWood Laminates', 'Sarah Dsouza', '+91 87654 32109', 'sales@decowood.com', 'Laminates', 'Ghatkopar West, Mumbai', 4.5),
    ('Asian Paints Exclusive', 'Amit Patel', '+91 76543 21098', 'dealer@asianpaints.com', 'Paints', 'Andheri East, Mumbai', 4.7),
    ('Lumina Lighting Solutions', 'Vikram Singh', '+91 65432 10987', 'contact@luminalights.com', 'Lighting', 'Lower Parel, Mumbai', 4.2),
    ('Royal Oak Furniture', 'Neha Sharma', '+91 54321 09876', 'b2b@royaloak.com', 'Furniture', 'Thane West, Mumbai', 4.6),
    ('Hettich Hardware', 'Rajesh Mehta', '+91 43210 98765', 'support@hettich.in', 'Hardware', 'Kalyan, Mumbai', 4.9),
    ('Ddecor Fabrics', 'Simran Kaur', '+91 32109 87654', 'orders@ddecor.com', 'Fabric', 'Bandra West, Mumbai', 4.4)
  `);

  // Seed materials
  await db.run(`INSERT INTO materials (category, name, brand, sku, unit_price, image_url, vendor_id) VALUES
    ('Tiles', 'Italian Carrara Vitrified Tile', 'Kajaria', 'KAJ-CAR-01', 120.00, '/assets/materials/carrara_tile.png', 1),
    ('Tiles', 'Chevron Dark Slate Tile', 'Somany', 'SOM-CHV-02', 95.00, '/assets/materials/chevron_tile.png', 1),
    ('Laminates', 'Teak Wood Matte Laminate', 'Greenlam', 'GRN-TEAK-05', 45.00, '/assets/materials/teak_laminate.png', 2),
    ('Laminates', 'Glossy Charcoal Laminate', 'CenturyPly', 'CEN-CHAR-12', 55.00, '/assets/materials/charcoal_laminate.png', 2),
    ('Paints', 'Royale Silk Warm Alabaster', 'Asian Paints', 'AP-ROY-ALB', 15.00, '/assets/materials/warm_alabaster.png', 3),
    ('Paints', 'Deep Teal Matte Accent', 'Asian Paints', 'AP-ROY-TEA', 18.00, '/assets/materials/deep_teal.png', 3),
    ('Lighting', 'Magnetic Track Profile Light', 'Philips', 'PH-MAG-TRK', 250.00, '/assets/materials/track_light.png', 4),
    ('Lighting', 'Warm Recessed COB Light 6W', 'Havells', 'HV-COB-06', 15.00, '/assets/materials/cob_light.png', 4),
    ('Furniture', 'Chesterfield Emerald Velvet Sofa', 'Royal Oak', 'RO-CHS-VEL', 1200.00, '/assets/materials/velvet_sofa.png', 5),
    ('Furniture', 'Ergonomic Mesh Task Chair', 'Featherlite', 'FL-ERG-MSH', 180.00, '/assets/materials/office_chair.png', 5),
    ('Hardware', 'Brushed Brass Knurled Handles', 'Hettich', 'HET-BB-KN', 12.00, '/assets/materials/brass_handle.png', 6),
    ('Hardware', 'Soft-Close Drawer Runners', 'Ebco', 'EB-SCDR-45', 25.00, '/assets/materials/drawer_slides.png', 6),
    ('Fabric', 'Linen Beige Blackout Curtain', 'Ddecor', 'DD-LIN-BGE', 35.00, '/assets/materials/beige_curtain.png', 7),
    ('Fabric', 'Textured Rust Boucle Cushion', 'Ddecor', 'DD-TEX-RST', 15.00, '/assets/materials/rust_boucle.png', 7)
  `);

  // Seed clients
  await db.run(`INSERT INTO clients (name, email, phone, company, type, status) VALUES
    ('Sidharth Rathod', 'sidharth@example.com', '+91 99999 88888', 'Self-Employed', 'Residential', 'Active'),
    ('Suman Sharma', 'suman@nexustech.com', '+91 88888 77777', 'Nexus Tech Solutions', 'Commercial', 'Active'),
    ('Priya Patel', 'priya@example.com', '+91 77777 66666', 'N/A', 'Residential', 'Active'),
    ('Zotha', 'zotha@glorysimon.com', '+91 11111 22222', 'Glory Simon Interiors', 'Commercial', 'Active')
  `);

  // Seed projects
  await db.run(`INSERT INTO projects (client_id, name, status, budget, address, notes, image_url) VALUES
    (1, "Rathod's Villa", 'Material Selection', 45000.00, 'Flat 1402, Highrise Heights, Bandra West, Mumbai', 'Luxury residential design with high-end fixtures.', '/assets/projects/rathods_villa.png'),
    (2, 'Nexus Tech Corporate HQ', 'Design Approval', 85000.00, 'Block B, Tech Park, Outer Ring Road, Mumbai', 'Commercial executive space with acoustic configurations.', '/assets/projects/nexus_hq.png'),
    (3, 'Priya Cozy 2BHK Apartment', 'Site Visit', 18000.00, 'C-302, Green Avenue, Thane, Mumbai', 'Budget-friendly space improvements.', '/assets/projects/priya_apartment.png'),
    (4, 'Glory Simon Experience Studio', 'Execution', 35000.00, 'Showroom 3, Galleria Mall, Lower Parel, Mumbai', 'Brand concept showcase development.', '/assets/projects/experience_studio.png'),
    (1, 'Golden Crest Mansion', 'Material Selection', 120000.00, 'Plot 43, Sector 8, Noida', 'Premium residency development.', '/assets/projects/golden_crest.png'),
    (3, 'Azure Bay Villa', 'Space Planning', 75000.00, 'Coastal Road, Alibaug, Maharashtra', 'Beachfront luxury villa design with modern minimalist style.', '/assets/projects/azure_bay.png')
  `);

  // Seed rooms
  await db.run(`INSERT INTO rooms (project_id, name, length, width, height, notes) VALUES
    (1, 'Grand Living Room', 24.0, 18.0, 10.5, 'Needs marble flooring, glass panel walls, and warm lighting'),
    (1, 'Master Suite', 18.0, 14.0, 10.0, 'Needs dark wooden flooring and custom paneling'),
    (1, 'Modular Kitchen', 14.0, 10.0, 10.0, 'Requires scratch-resistant acrylic laminates and gold hardware'),
    (2, 'Executive Boardroom', 30.0, 20.0, 11.0, 'Needs soundproofing, massive boardroom table and track lighting'),
    (2, 'Reception Area', 20.0, 15.0, 11.0, 'Double height ceiling, feature wall with green accent'),
    (3, 'Master Bedroom', 12.0, 11.0, 9.5, 'Compact storage solutions required'),
    (4, 'Main Display Floor', 40.0, 25.0, 12.0, 'Multi-material displays for laminates, tiles, and fittings')
  `);

  // Seed design concepts
  await db.run(`INSERT INTO design_concepts (room_id, title, description, image_url, status) VALUES
    (1, 'Classic Luxury Concept', 'High-gloss Carrara floors, emerald green velvet accents, and brushed brass details.', '/assets/concepts/luxury_living.svg', 'Approved'),
    (1, 'Warm Modernist Concept', 'Matte slate tiles, warm teak laminate wall claddings, and indirect linear lighting.', '/assets/concepts/modern_living.svg', 'Pending'),
    (3, 'Minimalist Culinary Space', 'White glossy panels, integrated appliances, and clean seamless handles.', '/assets/concepts/kitchen_minimalist.svg', 'Approved'),
    (4, 'Boardroom Executive Style', 'Acoustic oak felt panels, dark grey carpeting, and black metal profile lights.', '/assets/concepts/boardroom.svg', 'Approved')
  `);

  // Seed material selections
  await db.run(`INSERT INTO material_selections (project_id, room_id, material_id, vendor_id, quantity, status, notes) VALUES
    (1, 1, 1, 1, 432, 'Approved', 'Selected Kajaria Carrara tiles for the full living room floor area'),
    (1, 1, 9, 5, 1, 'Approved', 'Royal Oak Chesterfield Emerald Sofa as the centerpiece'),
    (1, 1, 5, 3, 4, 'Approved', 'Warm Alabaster walls paint (4 tins)'),
    (1, 1, 6, 3, 1, 'Pending', 'Deep Teal Accent on the TV backdrop wall (1 tin)'),
    (1, 1, 7, 4, 6, 'Selected', 'Magnetic track profile lights around the false ceiling border'),
    (1, 2, 3, 2, 252, 'Approved', 'Greenlam Teak laminate for the wall headboard paneling'),
    (1, 2, 13, 7, 6, 'Replaced', 'Replaced with neutral grey fabric later due to light reflections'),
    (1, 3, 4, 2, 120, 'Selected', 'CenturyPly Glossy Charcoal for base cabinets'),
    (1, 3, 11, 6, 18, 'Approved', 'Hettich Knurled handles for all cupboards'),
    (2, 4, 2, 1, 600, 'Approved', 'Chevron Dark Slate Tile for the high traffic boardroom floor'),
    (2, 4, 10, 5, 12, 'Approved', 'Featherlite Ergonomic mesh chairs for board members'),
    (2, 4, 7, 4, 12, 'Approved', 'Philips Track Lights for presentation boards'),
    (3, 6, 3, 2, 132, 'Selected', 'Greenlam Teak laminate for wardrobe shutters'),
    (4, 7, 1, 1, 1000, 'Approved', 'Showroom flooring samples setup')
  `);

  // Seed material history logs
  await db.run(`INSERT INTO material_history (project_id, room_id, material_selection_id, user_name, previous_status, new_status, notes) VALUES
    (1, 1, 1, 'Nisha Sen (Designer)', 'Pending', 'Selected', 'Assigned initial Kajaria vitrified Carrara tile layout'),
    (1, 1, 1, 'Sidharth Rathod (Client)', 'Selected', 'Approved', 'Customer approvedCarrara tile pattern during layout design review'),
    (1, 1, 9, 'Nisha Sen (Designer)', 'Pending', 'Selected', 'Sourced Royal Oak Sofa option'),
    (1, 1, 9, 'Sidharth Rathod (Client)', 'Selected', 'Approved', 'Approved accent seating selection'),
    (1, 2, 7, 'Nisha Sen (Designer)', 'Selected', 'Approved', 'Approved curtains specs'),
    (1, 2, 7, 'Rahul Dev (PM)', 'Approved', 'Replaced', 'Requested replacement fabric due to reflectivity concerns'),
    (2, 4, 10, 'Suman Sharma (Client)', 'Selected', 'Approved', 'Approved ergonomic seating structure')
  `);

  // Seed tasks
  await db.run(`INSERT INTO tasks (project_id, title, assigned_to, status, due_date) VALUES
    (1, 'Confirm tile delivery date with Apex Marble', 'Vendor Coordinator', 'In Progress', '2026-06-20'),
    (1, 'Get final signature on TV wall accent paint approval', 'Designer', 'To Do', '2026-06-19'),
    (1, 'Create space layouts for electrical points', 'Designer', 'Completed', '2026-06-15'),
    (2, 'Submit board table quotation adjustments', 'Project Manager', 'In Progress', '2026-06-22'),
    (2, 'Book site engineer layout validation visit', 'Project Manager', 'Completed', '2026-06-12'),
    (3, 'First measurements validation visit', 'Site Engineer', 'To Do', '2026-06-24'),
    (4, 'Supervise drywall installation for display panels', 'Site Engineer', 'In Progress', '2026-06-21'),
    (4, 'Process advance billing for vendor contract', 'Admin', 'To Do', '2026-06-25')
  `);

  // Seed site visits
  await db.run(`INSERT INTO site_visits (project_id, visit_date, visitor_name, notes, photos) VALUES
    (1, '2026-06-10T11:00:00', 'Rahul Dev (Site Engineer)', 'Verified core dimensions. Ceiling slab heights are exactly 10.5 ft. Dampness checked, walls are dry.', '/assets/photos/visit_rathod_1.svg'),
    (2, '2026-06-11T10:00:00', 'Rahul Dev (Site Engineer)', 'Acoustic insulation properties in Boardroom checked. Floor leveling required before tiling.', '/assets/photos/visit_nexus_1.svg'),
    (3, '2026-06-14T15:30:00', 'Nisha Sen (Designer)', 'Took space snapshots for aesthetic concept discussions with Priya. Client prefers beige-brown warmth.', '/assets/photos/visit_priya_1.svg'),
    (1, '2026-06-02T10:00:00', 'Nisha Sen (Designer)', 'Initial site measurements, space blueprint analysis, window dimension check.', '/assets/photos/visit_rathod_1.svg'),
    (1, '2026-06-05T14:30:00', 'Rahul Dev (Project Manager)', 'Structural load walkthrough, electrical layout validation.', '/assets/photos/visit_rathod_1.svg'),
    (1, '2026-06-15T15:00:00', 'Nisha Sen (Designer)', 'Sourced material finish matching on-site under direct sunlight.', '/assets/photos/visit_rathod_1.svg'),
    (1, '2026-06-18T10:30:00', 'Sidharth Rathod (Client)', 'Walkthrough of false ceiling framework, walkthrough preview checkpoints and design signature.', '/assets/photos/visit_rathod_1.svg')
  `);

  // Seed expenses
  await db.run(`INSERT INTO expenses (project_id, category, amount, notes, date) VALUES
    (1, 'Site Civil Masonry Labour', 1200.00, 'Plaster leveling for living room wall', '2026-06-12'),
    (1, 'Local Transport of samples', 80.00, 'Carried wood and slate samples to client penthouse', '2026-06-14'),
    (2, 'CAD Drafting Freelancer fee', 500.00, 'Paid for detailed acoustic grid detailing', '2026-06-13')
  `);

  console.log('Database successfully initialized and seeded!');
  return db;
}

module.exports = {
  getDb,
  initDb
};
