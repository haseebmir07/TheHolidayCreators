// server/controllers/bookingController.js
import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";
import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Helper: create a PDF receipt buffer for a booking
 * Returns a Promise<Buffer>
 */
const createReceiptPDF = (booking, roomData, userDetails, billingName) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Header
      doc.fontSize(18).text("The Holiday Creators — Booking Receipt", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#444").text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(1);

      // Booking Summary box
      doc.fillColor("#000").fontSize(12).text("Booking Summary", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(10);
      doc.text(`Booking ID: ${booking._id}`);
      doc.text(`Guest: ${billingName}`);
      doc.text(`User email: ${userDetails && userDetails.email ? userDetails.email : "N/A"}`);
      doc.text(`Phone: ${booking.billingPhone || "N/A"}`);
      doc.moveDown(0.5);

      doc.text(`Package: ${roomData && roomData.hotel && roomData.hotel.name ? roomData.hotel.name : "N/A"}`);
      doc.text(`Destination: ${roomData && roomData.hotel && roomData.hotel.address ? roomData.hotel.address : "N/A"}`);
      doc.text(`Package Details: ${roomData && (roomData.roomType || (roomData.room && roomData.room.roomType)) ? (roomData.roomType || roomData.room.roomType) : "N/A"}`);
      doc.moveDown(0.5);

      const checkInStr = booking.checkInDate ? new Date(booking.checkInDate).toDateString() : "N/A";
      const checkOutStr = booking.checkOutDate ? new Date(booking.checkOutDate).toDateString() : "N/A";
      doc.text(`Check-in: ${checkInStr}`);
      doc.text(`Check-out: ${checkOutStr}`);

      // Calculate nights and per-night
      const inDate = booking.checkInDate ? new Date(booking.checkInDate) : null;
      const outDate = booking.checkOutDate ? new Date(booking.checkOutDate) : null;
      let nights = 1;
      if (inDate && outDate) {
        nights = Math.max(1, Math.ceil((outDate - inDate) / (24 * 60 * 60 * 1000)));
      }
      const currency = process.env.CURRENCY || "₹";
      const perNight = (roomData && roomData.pricePerNight) ? roomData.pricePerNight : booking.totalPrice || 0;
      doc.moveDown(0.5);
      doc.text(`Nights: ${nights}`);
      doc.text(`Price per night: Rs ${perNight}`);
      doc.text(`Total paid: Rs ${booking.totalPrice}`);

      doc.moveDown(1);
      doc.text("Guests: " + (booking.guests || "N/A"));
      doc.moveDown(1);

      // If customization exists, include it in the PDF
      try {
        if (booking.customization) {
          const pkgText =
            booking.customization.packageText ||
            booking.customization.included ||
            booking.customization.includedThings ||
            booking.customization.includedText ||
            "";
          if (pkgText) {
            doc.fontSize(12).text("Customization / Requests", { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(10).text(pkgText);
            doc.moveDown(0.7);
          }
        }
      } catch (e) {
        // ignore any customization render issues
      }

      // Footer / assistant signature
      doc.fontSize(10).fillColor("#444");
      doc.text(
        "This receipt was generated automatically by The Holiday Creators booking assistant.",
        { lineGap: 2 }
      );
      doc.moveDown(0.5);
      doc.text("If you have any questions, contact us at info@theholidaycreators.com");
      doc.moveDown(1);

      doc.text("Thank you for booking with us!", { align: "center" });

      // End PDF
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/* =========================
   Helpers & Small APIs
   ========================= */

/**
 * Normalize incoming customization payloads.
 * Accepts:
 * - object { guestsRange, daysRange, included / includedThings / packageText, ... }
 * - JSON string (will parse)
 * - simple string (treated as packageText)
 *
 * Returns normalized object or null.
 */
function normalizeCustomization(raw) {
  if (!raw && raw !== "") return null;

  let parsed = raw;

  if (typeof raw === "string") {
    // try parse JSON string; if parse fails, treat as free text
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return {
        guestsRange: null,
        daysRange: null,
        packageText: raw,
        included: raw,
        includedThings: raw,
        addOnSummary: [],
        addonsTotal: 0,
        status: "pending",
        savedAt: new Date(),
      };
    }
  }

  // parsed is expected to be object now
  if (typeof parsed !== "object" || parsed === null) return null;

  // support various naming conventions for the "included" text
  const packageText =
    parsed.packageText ||
    parsed.included ||
    parsed.includedThings ||
    parsed.includedText ||
    parsed.package ||
    "";

  const guestsRange = parsed.guestsRange || parsed.guests || parsed.guests_range || null;
  const daysRange = parsed.daysRange || parsed.days || parsed.days_range || null;

  return {
    guestsRange,
    daysRange,
    packageText,
    // preserve legacy keys too for maximum compatibility
    included: parsed.included || "",
    includedThings: parsed.includedThings || "",
    addOnSummary: parsed.addOnSummary || parsed.addons || [],
    addonsTotal: parsed.addonsTotal || parsed.addons_total || 0,
    status: parsed.status || "pending",
    savedAt: parsed.savedAt ? new Date(parsed.savedAt) : new Date(),
  };
}

const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    if (isNaN(inDate) || isNaN(outDate) || inDate >= outDate) {
      return false;
    }
    // Per your app's current behaviour: don't check DB collisions here.
    return true;
  } catch (error) {
    console.error(error && error.message ? error.message : error);
    return false;
  }
};

/* =========================
   Bookings API
   ========================= */

/**
 * POST /api/bookings/check-availability
 */
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error && error.message ? error.message : "Error" });
  }
};

/**
 * POST /api/bookings/book
 * Creates booking but does NOT send email. Returns bookingId for payment step.
 */
export const createBooking = async (req, res) => {
  try {
    const {
      room,
      checkInDate,
      checkOutDate,
      guests,
      paymentMethod,
      billingName,
      billingPhone,
      customization, // incoming customization from frontend (expected)
    } = req.body;

    const user = req.user && req.user._id ? req.user._id : null;

    if (!billingName || !billingPhone) {
      return res.json({
        success: false,
        message: "Billing name and phone number are required.",
      });
    }

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    if (isNaN(inDate) || isNaN(outDate) || inDate >= outDate) {
      return res.json({ success: false, message: "Invalid date range" });
    }

    const roomData = await Room.findById(room).populate("hotel");
    if (!roomData) {
      return res.json({ success: false, message: "Room not found" });
    }

    let totalPrice = roomData.pricePerNight || 0;
    const timeDiff = outDate.getTime() - inDate.getTime();
    const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    totalPrice *= nights;

    // Normalize customization safely (handles object, JSON-string or plain text)
    const normalizedCustomization = normalizeCustomization(customization || req.body.customOptions || null);

    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel ? roomData.hotel._id : null,
      guests: +guests,
      checkInDate: inDate,
      checkOutDate: outDate,
      totalPrice,
      paymentMethod: paymentMethod || "Pay At Hotel",
      billingName,
      billingPhone,

      // ✅ SAVE NORMALIZED CUSTOMIZATION (or null)
      customization: normalizedCustomization || null,

      isPaid: false,
      status: "pending",
    });

    // IMPORTANT: do NOT send email here. Email will be sent after payment verification.
    return res.json({
      success: true,
      message: "Booking created successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("createBooking error:", error && error.stack ? error.stack : error);
    return res.json({ success: false, message: "Failed to create booking" });
  }
};

/**
 * GET /api/bookings/user
 */
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user && req.user._id ? req.user._id : null;
    const bookings = await Booking.find({ user }).populate("room hotel").sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error("getUserBookings error:", error);
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

/**
 * GET /api/bookings/hotel (owner)
 */
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth && req.auth.userId ? req.auth.userId : null });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }
    const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.totalPrice || 0), 0);

    res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });
  } catch (error) {
    console.error("getHotelBookings error:", error);
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
}

/* =========================
   RAZORPAY INTEGRATION
   ========================= */

// create razorpay instance using env keys; will throw if keys missing when used
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * POST /api/bookings/razorpay/order
 * Body: { bookingId }
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    console.log("[RZP] createRazorpayOrder called, bookingId:", bookingId);

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("[RZP] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in env");
      return res.status(500).json({
        success: false,
        message: "Razorpay not configured on server (missing env keys). Contact admin.",
      });
    }

    if (!bookingId) {
      console.warn("[RZP] bookingId missing in request body");
      return res.status(400).json({ success: false, message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId).populate("room hotel");
    if (!booking) {
      console.warn("[RZP] Booking not found for id:", bookingId);
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const totalPriceRaw = (booking.totalPrice !== undefined && booking.totalPrice !== null) ? booking.totalPrice : (booking.total || 0);
    const numericPrice = Number(totalPriceRaw);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      console.error("[RZP] Invalid booking.totalPrice:", booking.totalPrice);
      return res.status(400).json({ success: false, message: "Invalid booking amount" });
    }

    const amount = Math.round(numericPrice * 100); // paise
    console.log("[RZP] Booking found. totalPrice:", numericPrice, "amount(paise):", amount);

    const options = {
      amount,
      currency: "INR",
      receipt: `booking_${booking._id}`,
      payment_capture: 1,
    };

    console.log("[RZP] Creating order with options:", options);
    const order = await razorpayInstance.orders.create(options);
    console.log("[RZP] Razorpay order created:", order && order.id);

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[RZP] createRazorpayOrder error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: "Server error while creating payment order" });
  }
};

/* =========================
   Email helper (send only after payment success)
   ========================= */

/**
 * Send confirmation email with PDF receipt after booking is paid.
 * Fire-and-forget: returns true on success, false on any failure.
 */
export async function sendBookingConfirmationEmail(booking) {
  try {
    // load room & hotel data for receipt content
    const roomData = await Room.findById(booking.room).populate("hotel");
    let userDetails = { username: booking.billingName, email: "" };

    try {
      if (booking.user) {
        const u = await User.findById(booking.user).select("username email");
        if (u) userDetails = { username: u.username, email: u.email };
      }
    } catch (e) {
      // ignore - fallback to billingName
    }

    // Ensure hotel object exists
    const hotel = roomData && roomData.hotel ? roomData.hotel : {};

    // Generate PDF buffer (the PDF already includes a booking summary;
    // we keep that but also include more hotel details in the email body)
    const pdfBuffer = await createReceiptPDF(booking, roomData, userDetails, booking.billingName);

    // Use normalization fallback for packageText
    const customization = booking.customization || {};
    const packageText =
      (typeof customization === "string" ? customization : null) ||
      customization.packageText ||
      customization.included ||
      customization.includedThings ||
      customization.includedText ||
      "";

    // Build a richer HTML body that includes:
    // - Booking name (billingName)
    // - Phone number (billingPhone)
    // - Number of guests (guests)
    // - Full hotel details (name, address, owner, contact, description if present)
    const hotelOwner = hotel.owner ? (typeof hotel.owner === "object" ? (hotel.owner.name || "") : hotel.owner) : "";
    const hotelAddress = hotel.address || "N/A";
    const hotelPhone = hotel.phone || hotel.contact || "N/A";
    const hotelEmail = hotel.email || "N/A";
    const hotelDesc = hotel.description || "";

    const htmlBody = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
        <h2 style="color:#0b6efd">Booking Confirmed — Thank you!</h2>
        <p>Hi <strong>${booking.billingName || userDetails.username || "Guest"}</strong>,</p>
        <p>We have received your payment and your booking is now <strong>confirmed</strong>. Below are the booking details and hotel information.</p>

        <h3>Booking details</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${booking._id}</li>
          <li><strong>Booking name:</strong> ${booking.billingName || "N/A"}</li>
          <li><strong>Phone number:</strong> ${booking.billingPhone || "N/A"}</li>
          <li><strong>Number of guests:</strong> ${booking.guests || "N/A"}</li>
          <li><strong>Check-in:</strong> ${booking.checkInDate ? new Date(booking.checkInDate).toDateString() : "N/A"}</li>
          <li><strong>Check-out:</strong> ${booking.checkOutDate ? new Date(booking.checkOutDate).toDateString() : "N/A"}</li>
          <li><strong>Total paid:</strong> ${process.env.CURRENCY || "₹"} ${booking.totalPrice}</li>
        </ul>

        ${packageText ? `<h3>Customization / Requests</h3><p>${packageText}</p>` : ""}

        <h3>Package details</h3>
        <ul>
          <li><strong>Package name:</strong> ${hotel.name || "N/A"}</li>
          <li><strong>Destination:</strong> ${hotelAddress}</li>
         <li><strong>Contact For Queries:</strong>Sameer Hussain Mir - The Holiday Creators Team</li>
          <li><strong>Phone:</strong>+91 7006112133 , +91 9906681245</li>
          <li><strong>Email:</strong>info@theholidaycreators.com</li>
          ${hotelDesc ? `<li><strong>Description:</strong> ${hotelDesc}</li>` : ""}
        </ul>

        <p>The attached PDF contains a receipt for your records.</p>

        <hr />
        <p style="font-size:0.9em;color:#666">
          If you need to change or cancel your booking, please contact the hotel directly or reply to this email.
        </p>

        <p style="font-weight:600">Safe travels,</p>
        <p>The Holiday Creators</p>
      </div>
    `;

    // Recipients — prefer real user email if available; fallback to booking.billingPhone only if no email
    const recipients = [];
    if (userDetails.email) recipients.push(userDetails.email);
    if (process.env.ADMIN_EMAIL) recipients.push(process.env.ADMIN_EMAIL);
    // fallback: (not ideal to send email to a phone number, but keep existing behavior)
    if (recipients.length === 0 && booking.billingPhone) recipients.push(booking.billingPhone);

    const mailOptions = {
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER || "no-reply@theholidaycreators.com",
      to: recipients.join(","),
      subject: `Booking Confirmed — ${hotel.name || "Your Booking"} (${booking._id})`,
      html: htmlBody,
      attachments: [
        {
          filename: `receipt-${booking._id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent for", booking._id);
    return true;
  } catch (err) {
    console.error("sendBookingConfirmationEmail error:", err && err.stack ? err.stack : err);
    return false;
  }
}


/**
 * POST /api/bookings/razorpay/verify
 * Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId }
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment fields" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.warn("Razorpay signature mismatch");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.isPaid = true;
        booking.paymentMethod = "Razorpay";
        booking.paymentInfo = {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
        };
        booking.status = booking.status === "pending" ? "confirmed" : booking.status;
        await booking.save();

        // Send confirmation email (fire-and-forget)
        sendBookingConfirmationEmail(booking).catch((e) => {
          console.error("Error sending confirmation email after verify:", e && e.stack ? e.stack : e);
        });
      }
    }

    return res.json({ success: true, message: "Payment verified and booking updated" });
  } catch (err) {
    console.error("verifyRazorpayPayment error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/razorpay-webhook
 * Use express.raw() when mounting so signature verification is accurate
 */
export const razorpayWebhookHandler = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const incomingSig = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody || (req.body && JSON.stringify(req.body)) || "";

    if (secret) {
      const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      if (expected !== incomingSig) {
        console.warn("Razorpay webhook signature mismatch");
        return res.status(400).send("Invalid signature");
      }
    } else {
      console.warn("No RAZORPAY_WEBHOOK_SECRET set — webhook verification skipped");
    }

    const payload = req.body;
    console.log("Razorpay webhook event:", payload && payload.event ? payload.event : payload);

    // Optionally process server-to-server events here (payment.captured, etc.)
    // e.g., find booking by receipt/notes in payload and update DB.

    return res.status(200).send("ok");
  } catch (err) {
    console.error("razorpayWebhookHandler error:", err && err.stack ? err.stack : err);
    return res.status(500).send("error");
  }
};
// =========================
// DELETE BOOKING (ADMIN)
// =========================
export const deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // If you want to also update room availability, do it here
    // Example: remove booking from room.bookings array
    // await Room.updateOne({ _id: booking.room }, { $pull: { bookings: id } });

    await booking.deleteOne();

    return res.json({
      success: true,
      message: "Booking deleted successfully",
      deletedId: id
    });
  } catch (err) {
    console.error("Delete booking error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting booking" });
  }
};
