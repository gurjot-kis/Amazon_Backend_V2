export const USER_ROLE = Object.freeze({
  SUPERADMIN: "SuperAdmin",
  ADMIN: "Admin",
  USER: "User",
  VENDOR: "Vendor",
});

export const AUTH_PROVIDER = Object.freeze({
  LOCAL: "local",
  GOOGLE: "google",
  FACEBOOK: "facebook",
  APPLE: "apple",
});

export const GENDER = Object.freeze({
  MALE: "male",
  FEMALE: "female",
  OTHERS: "others",
});

export const USER_ROLE_VALUES = Object.values(USER_ROLE);
export const AUTH_PROVIDER_VALUES = Object.values(AUTH_PROVIDER);
export const GENDER_VALUES = Object.values(GENDER);
