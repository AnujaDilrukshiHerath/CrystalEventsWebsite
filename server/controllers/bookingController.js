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
      include: { payments: true },
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
    const { 
      clientName, email, phone, date, branch, hall, eventType, 
      totalAmount, paidAmount, paymentMethod, status, notes 
    } = req.body;
    
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        clientName,
        email,
        phone,
        date,
        branch,
        hall,
        eventType,
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

// Add a partial payment to a booking
exports.addPayment = async (req, res) => {
  try {
    verifyAdmin(req);
    const { id } = req.params; // bookingId
    const { amount, method, notes, date } = req.body;

    const payment = await prisma.payment.create({
      data: {
        bookingId: id,
        amount: parseFloat(amount),
        method,
        notes,
        date: date ? new Date(date) : new Date()
      }
    });

    // Update the booking's paidAmount cache
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payments: true }
    });

    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);

    await prisma.booking.update({
      where: { id },
      data: { paidAmount: totalPaid }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Error adding payment' });
  }
};

// Delete a partial payment
exports.deletePayment = async (req, res) => {
  try {
    verifyAdmin(req);
    const { id } = req.params; // paymentId

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const bookingId = payment.bookingId;

    await prisma.payment.delete({ where: { id } });

    // Re-calculate total paid for the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true }
    });

    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);

    await prisma.booking.update({
      where: { id: bookingId },
      data: { paidAmount: totalPaid }
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Error deleting payment' });
  }
};
