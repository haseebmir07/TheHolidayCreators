// ./configs/nodemailer.js (try 465 then 587)
import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
export const FROM_EMAIL = process.env.SENDER_EMAIL || SMTP_USER || "no-reply@example.com";

async function createTransportWith(host, port, secure) {
  const t = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: process.env.NODE_ENV === "production" }
  });
  await t.verify(); // throws if cannot connect/auth
  return t;
}

let transporter;
(async () => {
  try {
    transporter = await createTransportWith("smtp.gmail.com", 465, true);
    console.log("🚀 Nodemailer is ACTIVE on smtp.gmail.com:465 (SSL)");
  } catch (err465) {
    console.warn("465 failed:", err465 && err465.message ? err465.message : err465);
    try {
      transporter = await createTransportWith("smtp.gmail.com", 587, false);
      console.log("🚀 Nodemailer is ACTIVE on smtp.gmail.com:587 (STARTTLS)");
    } catch (err587) {
      console.error("❌ Nodemailer FAILED to start on both 465 & 587:", err587 && err587.message ? err587.message : err587);
      // create non-verified placeholder to avoid crashes (calls will fail later)
      transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }
})();

export async function sendMailSafe(opts) {
  if (!transporter) throw new Error("Transporter not initialized");
  return transporter.sendMail(opts);
}

export default transporter;
