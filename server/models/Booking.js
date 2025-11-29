// server/models/Booking.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Explicit customization subdocument so fields are searchable and predictable.
 * We keep some legacy fields (included, includedThings) to be safe.
 */
const CustomizationSchema = new Schema(
  {
    guestsRange: {
      min: { type: Number },
      max: { type: Number },
    },
    daysRange: {
      min: { type: Number },
      max: { type: Number },
    },

    // canonical text field where we map various incoming keys into
    packageText: { type: String, default: "" },

    // legacy / backward-compatibility fields (if older code set these)
    included: { type: String, default: "" },
    includedThings: { type: String, default: "" },
    includedText: { type: String, default: "" },

    // add-on support (optional)
    addOnSummary: { type: Array, default: [] },
    addonsTotal: { type: Number, default: 0 },

    // workflow
    status: { type: String, enum: ["pending", "approved", "declined"], default: "pending" },

    // when this customization was saved
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    user: { type: String, ref: "User", required: true },
    room: { type: String, ref: "Room", required: true },
    hotel: { type: String, ref: "Hotel", required: true },

    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },

    totalPrice: { type: Number, required: true },
    guests: { type: Number, required: true },

    billingName: { type: String, required: true },
    billingPhone: { type: String, required: true },

    // typed customization subdocument (recommended)
    customization: { type: CustomizationSchema, default: null },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      required: true,
      default: "Pay At Hotel",
    },

    isPaid: { type: Boolean, default: false },

    // optional payment info object (Razorpay etc.)
    paymentInfo: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
