export const WALLET_STATUS = Object.freeze({
  ACTIVE: "active",
  FROZEN: "frozen",
});
export const TOPUP_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  EXPIRED: "expired",
});
export const WALLET_TXN_TYPE = Object.freeze({
  CREDIT: "credit",
  DEBIT: "debit",
});
export const WALLET_TXN_SOURCE = Object.freeze({
  TOPUP: "topup",
  ORDER_PAYMENT: "order_payment",
  ORDER_REFUND: "order_refund",
  ADMIN_ADJUSTMENT: "admin_adjustment",
});
export const WALLET_REFERENCE_TYPE = Object.freeze({
  WALLET_TOPUP: "WalletTopup",
  ORDER: "Order",
  PAYMENT: "Payment",
});

export const WALLET_STATUS_VALUES = Object.values(WALLET_STATUS);
export const TOPUP_STATUS_VALUES = Object.values(TOPUP_STATUS);
export const WALLET_TXN_TYPE_VALUES = Object.values(WALLET_TXN_TYPE);
export const WALLET_TXN_SOURCE_VALUES = Object.values(WALLET_TXN_SOURCE);
export const WALLET_REFERENCE_TYPE_VALUES = Object.values(
  WALLET_REFERENCE_TYPE,
);
