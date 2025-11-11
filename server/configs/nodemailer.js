import nodemailer from 'nodemailer';

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use service instead of host/port for Gmail
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Optional: Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error connecting to email server:', error);
  } else {
    console.log('✅ Mail server is ready to send messages');
  }
});

export default transporter;
