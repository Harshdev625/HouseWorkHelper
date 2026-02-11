const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const JWT_SECRET = 'housemate-secret-key-2026';
const PORT = 3000;

// Helper functions
function readDB() {
  const data = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Middleware to parse JSON body
server.use(jsonServer.bodyParser);
server.use(middlewares);

// CORS headers
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-roles');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Authentication middleware for protected routes
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
server.post('/api/v1/auth/login', async (req, res) => {
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
server.post('/api/v1/auth/register/customer', async (req, res) => {
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
server.post('/api/v1/auth/register/expert', async (req, res) => {
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
      status: 'PENDING',
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

// Logout endpoint
server.post('/api/v1/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Get current user
server.get('/api/v1/auth/me', authenticateToken, (req, res) => {
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

// Use json-server router for other routes
server.use('/api/v1', router);

// Start server
server.listen(PORT, () => {
  console.log('🚀 HouseMate JSON Server is running');
  console.log(`📦 Resources: http://localhost:${PORT}/api/v1`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/v1/auth`);
  console.log(`💾 Database: ${path.join(__dirname, 'db.json')}`);
  console.log(`🔒 JWT & bcrypt enabled`);
});
