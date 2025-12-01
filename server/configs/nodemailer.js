// ./configs/nodemailer.js
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.sendgrid.net";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587); // 587 recommended (STARTTLS)
const SMTP_SECURE = (process.env.SMTP_SECURE === "true") || (SMTP_PORT === 465); // true for 465
const SMTP_USER = process.env.SMTP_USER || "apikey"; // for SendGrid SMTP use 'apikey' as user
const SMTP_PASS = process.env.SMTP_PASS || process.env.SENDGRID_API_KEY; // for SendGrid, pass the API key here
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SENDER_EMAIL || "no-reply@theholidaycreators.com";

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.warn("⚠️ nodemailer: Missing SMTP configuration environment variables. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
}

// Create pooled transporter for better performance
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE, // true for 465, false for other ports (STARTTLS will be used)
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  pool: true, // use pooled connections
  maxConnections: 5,
  maxMessages: 100,
  // Increase timeouts to avoid transient ETIMEDOUT on slow networks
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  tls: {
    // In production keep this true. If you must debug with self-signed certs set false temporarily.
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

// Verify transporter on startup (non-blocking)
transporter.verify()
  .then(() => console.log("✅ nodemailer: SMTP transporter verified and ready"))
  .catch((err) => {
    console.error("❌ nodemailer: SMTP transporter verification failed:", err && err.message ? err.message : err);
    // Important: do not crash the server for email errors; just log and let application run.
  });

export default transporter;
