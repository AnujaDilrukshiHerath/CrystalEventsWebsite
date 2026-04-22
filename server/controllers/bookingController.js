const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcrystaleventskey123';

const verifyAdmin = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, JWT_SECRET);
};

// Get all confirmed bookings
exports.getBookings = async (req, res) => {
  try {
    verifyAdmin(req);
    const bookings = await prisma.booking.findMany({
      orderBy: { date: 'asc' }
    });
    res.json(bookings);
  } catch (error) {
    if (error.message === 'Unauthorized' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

// Create a new manual booking
exports.createBooking = async (req, res) => {
  try {
    verifyAdmin(req);
    const { clientName, email, phone, date, branch, hall, eventType, totalAmount, paidAmount, paymentMethod, notes } = req.body;
    
    const booking = await prisma.booking.create({
      data: {
        clientName,
        email,
        phone,
        date,
        branch,
        hall,
        eventType,
        totalAmount: totalAmount ? parseFloat(totalAmount) : null,
        paidAmount: paidAmount ? parseFloat(paidAmount) : 0,
        paymentMethod: paymentMethod || 'Bank',
        notes,
        status: 'confirmed'
      }
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    verifyAdmin(req);
    const { id } = req.params;
    await prisma.booking.delete({ where: { id } });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    if (error.message === 'Unauthorized' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking' });
  }
};

// Update booking payment/details
exports.updateBooking = async (req, res) => {
  try {
    verifyAdmin(req);
    const { id } = req.params;
    const { totalAmount, paidAmount, paymentMethod, status, notes } = req.body;
    
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : undefined,
        paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : undefined,
        paymentMethod,
        status,
        notes
      }
    });
    
    res.json(booking);
  } catch (error) {
    if (error.message === 'Unauthorized' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
};
