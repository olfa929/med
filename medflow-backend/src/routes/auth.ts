import express from 'express';
import clientPromise from '../lib/mongodb';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const client = await clientPromise;
    const db = client.db('doctor-app');
    const doctors = db.collection('doctors');
    
    const doctor = await doctors.findOne({ 
      email: email.trim().toLowerCase() 
    });
    
    if (!doctor) {
      return res.status(401).json({ message: '❌ No doctor found with this email' });
    }
    
    // Check password (you should hash passwords!)
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

export default router;