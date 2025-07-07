// globalConstantUtil.js (ES Module syntax)
export const MODAL_BODY_TYPES = Object.freeze({
  USER_DETAIL: "USER_DETAIL",
  LEAD_ADD_NEW: "LEAD_ADD_NEW",
  CONFIRMATION: "CONFIRMATION",
  DEFAULT: "",
});

export const RIGHT_DRAWER_TYPES = Object.freeze({
  NOTIFICATION: "NOTIFICATION",
  CALENDAR_EVENTS: "CALENDAR_EVENTS",
});

export const CONFIRMATION_MODAL_CLOSE_TYPES = Object.freeze({
  LEAD_DELETE: "LEAD_DELETE",
});

export const MODAL_CLOSE_TYPES = Object.freeze({
  LEAD_DELETE: "LEAD_DELETE",
});

export const IsCanada =
  localStorage.getItem("location")?.toUpperCase() === "CANADA" ? true : false;

export function getBoxNumbersFromItems(items) {
  if (!Array.isArray(items)) return "";

  return items
    .map((item) => item?.box_number)
    .filter(Boolean)
    .join(", ");
}
