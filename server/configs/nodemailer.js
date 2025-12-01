// ./configs/nodemailer.js
import nodemailer from "nodemailer";

// Environment variables
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : SMTP_PORT === 465;

const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
export const FROM_EMAIL = process.env.SENDER_EMAIL || SMTP_USER;

// Warnings
if (!SMTP_USER || !SMTP_PASS) {
  console.warn("⚠️ SMTP_USER or SMTP_PASS not set — emails will fail.");
}

if (FROM_EMAIL !== SMTP_USER) {
  console.warn(
    `⚠️ FROM_EMAIL (${FROM_EMAIL}) does not match SMTP_USER (${SMTP_USER}). ` +
    `Gmail requires Send-as alias if these differ.`
  );
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

// Verify and show "ACTIVE" message
transporter.verify()
  .then(() => {
    console.log("🚀 Nodemailer is ACTIVE and ready to send emails!");
  })
  .catch((err) => {
    console.error("❌ Nodemailer FAILED to start:", err.message || err);
  });

// Safe send wrapper
export async function sendMailSafe({ to, subject, html = "", text = "", attachments = [] }) {
  const mailOptions = {
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType || a.type,
    })),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);
    return { ok: true };
  } catch (err) {
    console.error("❌ Email error:", err);
    return { ok: false, error: err };
  }
}

export default transporter;
