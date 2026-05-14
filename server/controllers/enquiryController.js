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

    // 2. Send Emails using Nodemailer (SMTP)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Determine branch-specific admin email
      let branchAdminEmail = "info@crystaleventsandmanagement.co.uk";
      if (preferredBranch === 'Slough') {
        branchAdminEmail = "Crystalhayesuk1@gmail.com";
      }

      const adminEmail = process.env.ADMIN_EMAIL || "crystalpayments@icloud.com";

      const mailOptions = {
        from: `"Crystal Events" <${process.env.SMTP_USER}>`,
        to: [adminEmail, branchAdminEmail], // Send to admins and branch manager
        replyTo: process.env.ADMIN_EMAIL || 'crystalpayments@icloud.com', // Reply goes to business email, not personal SMTP account
        subject: `New Enquiry: ${eventType} at ${preferredBranch}`,
        html: `
          <h2>New Enquiry Received</h2>
          <p><b>Name:</b> ${firstName} ${lastName}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Event Type:</b> ${eventType}</p>
          <p><b>Branch:</b> ${preferredBranch}</p>
          <p><b>Hall:</b> ${preferredHall}</p>
          <p><b>Guests:</b> ${estimatedGuestCount}</p>
          <p><b>Date:</b> ${eventDate}</p>
          <p><b>Message:</b> ${message}</p>
          <hr>
          <p>This is an automated notification from your Crystal Events website.</p>
        `
      };

      await transporter.sendMail(mailOptions);

      // Optional: Send confirmation to the customer
      const customerMailOptions = {
        from: `"Crystal Events" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Thank you for your enquiry - Crystal Events`,
        html: `
          <h2>Thank you for contacting Crystal Events!</h2>
          <p>Dear ${firstName},</p>
          <p>We have received your enquiry for a <b>${eventType}</b> at our <b>${preferredBranch}</b> branch.</p>
          <p>Our team will review your details and get back to you shortly.</p>
          <br>
          <p>Best regards,</p>
          <p>The Crystal Events Team</p>
        `
      };
      await transporter.sendMail(customerMailOptions);

      console.log("Emails sent successfully via SMTP");
    } catch (sendError) {
      console.error("SMTP error:", sendError);
      // We don't want to fail the whole request if email fails, 
      // as the enquiry is already saved in the database.
    }

    res.status(201).json({ message: "Enquiry submitted successfully", referenceId: enquiry.id });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({ message: "Error submitting enquiry", error: error.message });
  }
};
