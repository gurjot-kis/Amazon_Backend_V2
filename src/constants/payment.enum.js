export const PAYMENT_METHOD = Object.freeze({
  COD: "COD",
  ONLINE: "ONLINE",
  UPI: "UPI",
  CARD: "CARD",
  NETBANKING: "NETBANKING",
  WALLET: "WALLET",
});
export const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUND_PENDING: "refund_pending",
  REFUNDED: "refunded",
});

export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);
export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

export const ALLOWED_PAYMENT_METHODS = Object.freeze([
  PAYMENT_METHOD.COD,
  PAYMENT_METHOD.ONLINE,
  PAYMENT_METHOD.WALLET,
]);
