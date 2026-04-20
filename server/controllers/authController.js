const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcrystaleventskey123';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1d' });

    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: true, // Required for sameSite: 'none'
    //   sameSite: 'none', // Allow cross-domain cookies
    //   maxAge: 24 * 60 * 60 * 1000 // 1 day
    // });


    res.status(200).json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkAuth = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ authenticated: true, user: { email: decoded.email } });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET);

    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(500).json({ message: 'Server error fetching enquiries' });
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET);

    if (!['pending', 'contacted', 'reviewed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedEnquiry = await prisma.enquiry.update({
      where: { id },
      data: { status }
    });

    res.status(200).json(updatedEnquiry);
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    res.status(500).json({ message: 'Server error updating enquiry status' });
  }
};

