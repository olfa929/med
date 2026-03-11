import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(MONGODB_URI);

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'MedFlow API is running!' });
});

// Test database connection route
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    await client.connect();
    const db = client.db('doctor-app');
    const result = await db.command({ ping: 1 });
    res.json({ 
      message: 'MongoDB connected!', 
      ping: result 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'MongoDB connection failed' });
  }
});

// Login route
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    await client.connect();
    const db = client.db('doctor-app');
    const doctors = db.collection('doctors');
    
    const doctor = await doctors.findOne({ 
      email: email.trim().toLowerCase() 
    });
    
    if (!doctor) {
      return res.status(401).json({ message: '❌ No doctor found with this email' });
    }
    
    // Check password
    if (doctor.password === password) {
      const { password: _, ...doctorWithoutPassword } = doctor;
      return res.json({ 
        message: '✅ Login successful!',
        doctor: doctorWithoutPassword 
      });
    } else {
      return res.status(401).json({ message: '❌ Invalid password' });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '❌ Database error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (error) => {
  console.error('❌ Server error:', error);
});