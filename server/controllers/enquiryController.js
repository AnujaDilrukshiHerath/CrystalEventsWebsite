const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

exports.submitEnquiry = async (req, res) => {
  try {
    const { name, phone, email, eventType, preferredBranch, preferredHall, estimatedGuestCount, eventDate, message } = req.body;
    
    if (!name || !email || !eventType || !preferredBranch) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // 1. Save to Database
    const enquiry = await prisma.enquiry.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || '',
        branch: preferredBranch,
        hall: preferredHall || '',
        date: eventDate || '',
        guests: estimatedGuestCount ? parseInt(estimatedGuestCount) : 0,
        eventType,
        message: message || ''
      }
    });

    // 2. Send Emails using Nodemailer
    let transporter;
    
    // Check if real SMTP credentials are provided in .env
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
        connectionTimeout: 10000,
        servername: 'smtp.gmail.com', // Explicitly set servername for SNI
      });
    } else {
      // Fallback to Ethereal (Mock service for local testing)
      console.log("No SMTP credentials found in .env. Falling back to Ethereal Mock Email...");
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

    const info = await transporter.sendMail({
      from: '"Crystal Events" <info@crystaleventsandmanagement.co.uk>',
      to: email, // Send confirmation to user
      subject: "We received your enquiry!",
      text: `Hello ${firstName},\n\nThank you for enquiring about our ${preferredBranch} branch for your ${eventType}. We will get back to you shortly.\n\nBest,\nCrystal Events Team`,
      html: `<b>Hello ${firstName},</b><br>Thank you for enquiring about our ${preferredBranch} branch for your ${eventType}. We will get back to you shortly.<br><br>Best,<br>Crystal Events Team`,
    });

    // Send notification to Admin
    const adminEmail = "crystalpayments@icloud.com";
    const adminInfo = await transporter.sendMail({
      from: '"Crystal Events System" <info@crystaleventsandmanagement.co.uk>',
      to: adminEmail,
      subject: `New Enquiry Received: ${eventType} at ${preferredBranch}`,
      text: `New Enquiry Details:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nEvent Type: ${eventType}\nBranch: ${preferredBranch}\nHall: ${preferredHall}\nGuests: ${estimatedGuestCount}\nDate: ${eventDate}\nMessage: ${message}`,
      html: `<h2>New Enquiry Received</h2>
             <p><b>Name:</b> ${firstName} ${lastName}</p>
             <p><b>Email:</b> ${email}</p>
             <p><b>Phone:</b> ${phone}</p>
             <p><b>Event Type:</b> ${eventType}</p>
             <p><b>Branch:</b> ${preferredBranch}</p>
             <p><b>Hall:</b> ${preferredHall}</p>
             <p><b>Guests:</b> ${estimatedGuestCount}</p>
             <p><b>Date:</b> ${eventDate}</p>
             <p><b>Message:</b> ${message}</p>`,
    });

    console.log("User Email sent: %s", info.messageId);
    console.log("Admin Email sent: %s", adminInfo.messageId);
    console.log("Preview URL (User): %s", nodemailer.getTestMessageUrl(info));
    console.log("Preview URL (Admin): %s", nodemailer.getTestMessageUrl(adminInfo));

    res.status(201).json({ message: "Enquiry submitted successfully", referenceId: enquiry.id });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({ message: "Error submitting enquiry", error: error.message });
  }
};
