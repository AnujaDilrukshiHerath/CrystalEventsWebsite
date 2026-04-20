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

    // 2. Send Emails using Resend
    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Send confirmation to user and notification to Admin
      // Note: On the free tier without a custom domain, you can only send to your own email.
      // We will send both notifications to the admin email for now to ensure they are received.
      const adminEmail = process.env.ADMIN_EMAIL || "crystalpayments@icloud.com";

      try {
        await resend.emails.send({
          from: 'Crystal Events <onboarding@resend.dev>',
          to: [adminEmail, email, "info@crystaleventsandmanagement.co.uk"], // Send to admins and the user
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
        });
        console.log("Emails sent successfully via Resend");
      } catch (sendError) {
        console.error("Resend error:", sendError);
        // We don't want to fail the whole request if email fails, 
        // as the enquiry is already saved in the database.
      }
    } else {
      console.log("No RESEND_API_KEY found. Skipping email.");
    }

    res.status(201).json({ message: "Enquiry submitted successfully", referenceId: enquiry.id });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({ message: "Error submitting enquiry", error: error.message });
  }
};
