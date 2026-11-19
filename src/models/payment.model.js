import mongoose from "mongoose";
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
} from "../constants/index.js";

const { Schema } = mongoose;

const GatewaySchema = new Schema(
  {
    provider: { type: String, default: null, trim: true }, // "razorpay"
    order_ref: { type: String, default: null, trim: true }, // razorpay order id
    payment_ref: { type: String, default: null, trim: true }, // razorpay payment id
    method: { type: String, default: null, trim: true }, // actual method used: upi/card/...
    signature: { type: String, default: null, trim: true },
    last_event_id: { type: String, default: null, trim: true }, // webhook dedupe
    error_code: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const PaymentSchema = new Schema(
  {
    order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: PAYMENT_METHOD_VALUES,
      default: PAYMENT_METHOD.COD,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true },
    status: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paid_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },
    collected_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, default: "", trim: true, maxlength: 500 },
    failure_reason: { type: String, default: "", trim: true },
    gateway: { type: GatewaySchema, default: null },

    // Online payments: the order is auto-cancelled if unpaid by this time.
    expires_at: { type: Date, default: null },

    // Refunds
    refund_id: { type: String, default: null, trim: true },
    refunded_amount: { type: Number, default: 0, min: 0 },
    refunded_at: { type: Date, default: null },
    refund_reason: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true, versionKey: false },
);

PaymentSchema.index({ order_id: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });

// An order can never have two successful payments (double-collect / double-webhook guard).
PaymentSchema.index(
  { order_id: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "paid" },
    name: "uniq_paid_payment_per_order",
  },
);

// Webhook idempotency for online payments later.
PaymentSchema.index(
  { "gateway.payment_ref": 1 },
  {
    unique: true,
    partialFilterExpression: { "gateway.payment_ref": { $type: "string" } },
    name: "uniq_gateway_payment_ref",
  },
);

// Used by the expiry job.
PaymentSchema.index({ status: 1, expires_at: 1 });

// One Payment per Razorpay order.
PaymentSchema.index(
  { "gateway.order_ref": 1 },
  {
    unique: true,
    partialFilterExpression: { "gateway.order_ref": { $type: "string" } },
    name: "uniq_gateway_order_ref",
  },
);

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
