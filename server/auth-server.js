const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'housemate-secret-key-2026'; // In production, use environment variable
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper functions
function readDB() {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ==================== AUTH ENDPOINTS ====================

// Login endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    if (!phone || !password || !role) {
      return res.status(400).json({ error: 'Phone, password, and role are required' });
    }

    const db = readDB();
    const user = db.users.find(u => u.phone === phone && u.roles.includes(role));

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile
    const profileEndpoint = role === 'ROLE_CUSTOMER' ? 'customerProfiles' : 'expertProfiles';
    const profile = db[profileEndpoint].find(p => p.userId === user.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: role, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
      profile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register Customer endpoint
app.post('/api/v1/auth/register/customer', async (req, res) => {
  try {
    const { fullName, phone, email, password, age, address } = req.body;

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = readDB();

    // Check if user already exists
    const existingUser = db.users.find(u => u.phone === phone || u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this phone or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const userId = generateId();
    const newUser = {
      id: userId,
      phone,
      email,
      fullName,
      password: hashedPassword,
      roles: ['ROLE_CUSTOMER'],
      blocked: false,
      createdAt: new Date().toISOString()
    };

    // Create customer profile
    const newProfile = {
      id: userId,
      userId,
      fullName,
      phone,
      email,
      age: age || null,
      address: address || null,
      preferredZoneIds: []
    };

    db.users.push(newUser);
    db.customerProfiles.push(newProfile);
    writeDB(db);

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, role: 'ROLE_CUSTOMER', phone },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      token,
      user: userWithoutPassword,
      profile: newProfile
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register Expert endpoint
app.post('/api/v1/auth/register/expert', async (req, res) => {
  try {
    const { fullName, phone, email, password, skills, zoneIds, idProof } = req.body;

    if (!fullName || !phone || !email || !password || !skills || skills.length === 0) {
      return res.status(400).json({ error: 'All fields including at least one skill are required' });
    }

    const db = readDB();

    // Check if user already exists
    const existingUser = db.users.find(u => u.phone === phone || u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this phone or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const userId = generateId();
    const newUser = {
      id: userId,
      phone,
      email,
      fullName,
      password: hashedPassword,
      roles: ['ROLE_EXPERT'],
      blocked: false,
      createdAt: new Date().toISOString()
    };

    // Create expert profile
    const newProfile = {
      id: userId,
      userId,
      fullName,
      phone,
      email,
      skills,
      zoneIds: zoneIds || [],
      status: 'APPROVED',
      onlineStatus: 'OFFLINE',
      rating: 0,
      totalJobs: 0,
      idProof: idProof || null,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.expertProfiles.push(newProfile);
    writeDB(db);

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, role: 'ROLE_EXPERT', phone },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      token,
      user: userWithoutPassword,
      profile: newProfile
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint (client-side only, but here for completeness)
app.post('/api/v1/auth/logout', authenticateToken, (req, res) => {
  // In a real app with refresh tokens, you'd invalidate them here
  res.json({ message: 'Logged out successfully' });
});

// Get current user
app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profileEndpoint = req.user.role === 'ROLE_CUSTOMER' ? 'customerProfiles' : 'expertProfiles';
    const profile = db[profileEndpoint].find(p => p.userId === user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      profile
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== OTHER ENDPOINTS (Pass-through to JSON data) ====================

// Generic GET endpoint for all resources
app.get('/api/v1/:resource', (req, res) => {
  try {
    const db = readDB();
    const resource = req.params.resource;
    
    if (!db[resource]) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    let data = db[resource];

    // Apply query filters
    Object.keys(req.query).forEach(key => {
      if (key !== 'page' && key !== 'size' && key !== '_embed') {
        data = data.filter(item => item[key] == req.query[key]);
      }
    });

    res.json(data);
  } catch (error) {
    console.error('GET error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generic GET by ID endpoint
app.get('/api/v1/:resource/:id', (req, res) => {
  try {
    const db = readDB();
    const resource = req.params.resource;
    const id = req.params.id;
    
    if (!db[resource]) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const item = db[resource].find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('GET error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generic POST endpoint
app.post('/api/v1/:resource', authenticateToken, (req, res) => {
  try {
    const db = readDB();
    const resource = req.params.resource;
    
    if (!db[resource]) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const newItem = {
      id: generateId(),
      ...req.body,
      createdAt: new Date().toISOString()
    };

    db[resource].push(newItem);
    writeDB(db);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generic PATCH/PUT endpoint
app.patch('/api/v1/:resource/:id', authenticateToken, (req, res) => {
  try {
    const db = readDB();
    const resource = req.params.resource;
    const id = req.params.id;
    
    if (!db[resource]) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const index = db[resource].findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    db[resource][index] = {
      ...db[resource][index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    writeDB(db);

    res.json(db[resource][index]);
  } catch (error) {
    console.error('PATCH error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generic DELETE endpoint
app.delete('/api/v1/:resource/:id', authenticateToken, (req, res) => {
  try {
    const db = readDB();
    const resource = req.params.resource;
    const id = req.params.id;
    
    if (!db[resource]) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const index = db[resource].findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deletedItem = db[resource][index];
    db[resource].splice(index, 1);
    writeDB(db);

    res.json(deletedItem);
  } catch (error) {
    console.error('DELETE error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HouseMate API Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${DB_FILE}`);
  console.log(`🔐 JWT Authentication enabled with bcrypt password hashing`);
});
