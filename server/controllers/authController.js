const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, paidAmount } = req.body;
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET);

    const updatedEnquiry = await prisma.enquiry.update({
      where: { id },
      data: { 
        totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : undefined,
        paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : undefined
      }
    });

    res.status(200).json(updatedEnquiry);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error updating payment' });
  }
};

exports.sendPaymentReminder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET);

    const enquiry = await prisma.enquiry.findUnique({ where: { id } });
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    if (enquiry.totalAmount === null) {
      return res.status(400).json({ message: 'Total amount is not set' });
    }

    const total = enquiry.totalAmount;
    const paid = enquiry.paidAmount;
    const balance = total - paid;

    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Pre-resolve hostname to IPv4 address to avoid ENETUNREACH errors on IPv6-unsupported networks
      let host = process.env.SMTP_HOST;
      try {
        const dns = require('dns').promises;
        const lookup = await dns.lookup(host, { family: 4 });
        host = lookup.address;
        console.log(`Resolved ${process.env.SMTP_HOST} to IPv4: ${host}`);
      } catch (dnsError) {
        console.error('DNS resolution failed, falling back to hostname:', dnsError);
      }

      transporter = nodemailer.createTransport({
        host: host,
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '',
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        tls: {
          rejectUnauthorized: false
        },
        servername: 'smtp.gmail.com', // Explicitly set servername for SNI
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

    await transporter.sendMail({
      from: '"Crystal Events Accounts" <crystalpayments@icloud.com>',
      to: enquiry.email,
      subject: "Payment Reminder - Crystal Events",
      text: `Hello ${enquiry.firstName},\n\nThis is a reminder regarding your upcoming event at Crystal Events.\n\nTotal Agreed Price: ${formatter.format(total)}\nAmount Paid: ${formatter.format(paid)}\nOutstanding Balance: ${formatter.format(balance)}\n\nPlease arrange for the outstanding balance to be paid prior to your event.\n\nThank you,\nCrystal Events Team`,
      html: `<b>Hello ${enquiry.firstName},</b><br><br>This is a reminder regarding your upcoming event at Crystal Events.<br><br>
             <b>Total Agreed Price:</b> ${formatter.format(total)}<br>
             <b>Amount Paid:</b> ${formatter.format(paid)}<br>
             <b>Outstanding Balance:</b> ${formatter.format(balance)}<br><br>
             Please arrange for the outstanding balance to be paid prior to your event.<br><br>
             Thank you,<br>Crystal Events Team`,
    });

    res.status(200).json({ message: 'Reminder sent successfully' });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ message: 'Server error sending reminder' });
  }
};
