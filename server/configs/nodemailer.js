// ./configs/nodemailer.js
import nodemailer from "nodemailer";

/**
 * Expected env variables:
 *  - SMTP_HOST (default: smtp.gmail.com)
 *  - SMTP_PORT (default: 465)
 *  - SMTP_USER (your gmail address, required)
 *  - SMTP_PASS (your Gmail App Password, required)
 *  - SMTP_SECURE (true/false) optional; autodetected from port
 *  - SENDER_EMAIL (from address used in "from:")
 */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
export const FROM_EMAIL = process.env.SENDER_EMAIL || SMTP_USER || "no-reply@example.com";

if (!SMTP_USER || !SMTP_PASS) {
  console.warn("⚠️ nodemailer: SMTP_USER or SMTP_PASS is not set. Emails will fail until these env vars are provided.");
}

// Warn if sender and auth user mismatch (Gmail may block)
if (FROM_EMAIL && SMTP_USER && FROM_EMAIL.toLowerCase() !== SMTP_USER.toLowerCase()) {
  console.warn(
    `⚠️ nodemailer: SENDER_EMAIL ("${FROM_EMAIL}") differs from SMTP_USER ("${SMTP_USER}"). ` +
    `Gmail often blocks sends where the From address is not the authenticated account unless you have added a verified "Send as" alias.`
  );
}

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
  // generous timeouts to avoid transient ETIMEDOUT on some PaaS networks
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  tls: {
    // keep true in production; if you debug with self-signed certs you may set false temporarily
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

// Verify transporter on startup (non-blocking)
transporter.verify()
  .then(() => console.log("✅ nodemailer: SMTP transporter verified and ready"))
  .catch((err) => {
    console.error("❌ nodemailer: transporter verify failed:", err && err.message ? err.message : err);
    // don't throw — app can continue, emails will log errors when attempted
  });

/**
 * sendMailSafe - small wrapper that accepts attachments as Buffers or objects
 * @param {Object} options
 * @param {string | string[]} options.to
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {Array<{filename, content, contentType}>} [options.attachments] // content can be Buffer
 */
export async function sendMailSafe({ to, subject, text = "", html = "", attachments = [] }) {
  const mailOptions = {
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
    attachments: (attachments || []).map((a) => ({
      filename: a.filename,
      content: a.content, // Buffer or string — nodemailer handles both
      contentType: a.contentType || a.type || undefined,
    })),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 sendMailSafe: Message sent:", info && info.messageId ? info.messageId : info);
    return { ok: true, info };
  } catch (err) {
    console.error("❌ sendMailSafe error:", err && err.stack ? err.stack : err);
    return { ok: false, error: err };
  }
}

export default transporter;
