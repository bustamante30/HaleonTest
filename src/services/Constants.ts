export const MANDATORY_FIELDS_MSG =
  "Please ensure you fill all required fields";
export const SELECT_BROWSER = "You must select a browser.";
export const SELECT_BROWSER_VERSION = "You must select a browser version.";
export const SELECT_ISSUE = "You must select an issue.";
export const SELECT_DISCRIPTION = "You must briefly describe the issue.";
export const BROWSERS = ["Firefox", "Safari", "Chrome", "Other"];
export const ISSUE_TYPE = [
  "Incorrect visuals (PDF/Thumbnail)",
  "Incorrect Search List",
  "Submission request error",
  "Keyword/Advanced search issue",
  "Timed out",
  "Other",
];
export const REPORT_ISSUE_SUCCESS =
  "Your request has been successfully submitted.  Someone will contact you shortly.";
export const REPORT_ISSUE_FAILURE =
  "Sorry, your request was not submitted. Please try again or reach out to your SGS & Co contact";
export const INVALID_FILE = `Invalid file type.`;
export const INVALID_FILE_MSG = `File with the given format cannot be uploaded(exe,bat,com,cmd,inf,ipa,osx,pif,run,wsh.)`;
export const FILE_SIZE_EXCEEDS = "File size exceeds the limit (25 MB).";
export const UPLOAD_SUCCESSFULL = `Uploaded successfully`;
export const UPLOAD_FAILED = `Upload failed `;
export const UPLOAD_FAILED_MSG = `File upload failed. Please try again.`;
export const UPLOAD_SUCCESSFULL_MSG = "Your files were successfully uploaded";
export const DELETE_SUCCESSFULL = `Deleted Successfully `;
export const DELETE_FAILED = `Delete failed`;
export const MAX_FILE_SIZE = 26214400;
export const PO_DELIMITER = ",";

export const PO_FORM_ERROR = "Invalid PO Form";
export const INVALID_DATE_TIME = "Date and Time can not be empty";
export const PO_NUMBER_MIN_LENGTH =
  "Please enter at least 3 characters in the purchase order field.";
export const PO_NUMBER_MAX_LENGTH =
  "The Purchase order field cannot exceed 30 characters.";
export const DUPLICATE_PO_NUMBER = "Duplicate purhcase order number(s)";
export const INVALID_PO_NUMBER =
  "The Purchase order field contains invalid special characters. Only the following special characters are allowed: - _ / \\ # . , + & ( ) \" : ; < > '";
export const REQUEST_CANCEL = "Request canceled by the user";
export const API_LOCAL_URL = "http://localhost:5208/";
export const API_USER_LOCAL_URL = "http://localhost:7026/";
export const COLOR_LIMIT = "Add Colours Limit Exceeded ";
export const COLOR_LIMIT_MSG = "Cannot add more than 10 colors";
export const SUCCESS = "Success: ";
export const FAILURE = "Error: ";
export const CART_SUCCESS = "Cart updated successfully";
export const CART_FAILURE = "Cart update failed";
export const CART_DELETE_SUCCESS = "Cart deleted successfully";
export const WINDOW_CLOSED = "10 mins window closed for Re-Order cancellation";
export const PHOTON_NOT_FOUND = `The order number is incorrect or the order 
        was not confirmed in image carrier reorder portal.`;
export const PHOTON_NOT_FOUND_MSG = `Please check the order number and try again.`;
export const KEYWORD_INVALID_TYPE =
  'Only the following special characters are allowed -, _, /, \\, #, ., , +, &, (, ), " Please correct and try your search again';
export const ORDER_SENT = `Order Sent`;
export const ORDER_SENT_MSG =
  "Your order is successfully sent to a project manager";
export const ORDER_SENT_FAILURE = "Order Sent Failed";
export const ORDER_SENT_FAILURE_MSG =
  "Your order is not sent to a project manager";
export const VALIDATION_ERROR = "Validation Error";
export const PRINTER_REQUIRED = "Printer Name is required.";
export const IDENTITY_REQUIRED = "Identify Provider is required.";
export const FIRSTNAME_REQUIRED = "Admin FirstName is required.";
export const LASTNAME_REQUIRED = "Admin LastName is required.";
export const EMAIL_REQUIRED = "Admin Email is required.";
export const FN_REQUIRED = "FirstName is required.";
export const LN_REQUIRED = "LastName is required.";
export const EM_REQUIRED = "Email is required.";
export const PM_FIRSTNAME_REQUIRED = "PrimaryPM FirstName is required.";
export const PM_LASTNAME_REQUIRED = "PrimaryPM LastName is required.";
export const PM_EMAIL_REQUIRED = "PrimaryPM Email is required.";
export const PRINTER_CREATION = `Printer Creation`;
export const PRINTER_CREATION_SUCCESS = `Printer created successfully`;
export const USER_DELETION = `User Deletion`;
export const USER_DELETION_SUCCESS = `User deleted successfully`;
export const RESEND_INVITATION = `Resend Invitation`;
export const RESEND_INVITATION_SUCCESS = `Invitation resend Successfully`;
export const USER_CREATION = `User Creation`;
export const USER_CREATION_SUCCESS = `User created successfully`;
export const USER_UPDATED = `User Updated`;
export const USER_UPDATED_SUCCESS = `User updated successfully`;
export const INFO = `Info`;
export const WARNING = "Warning";
export const FLEXO_ERROR =
  "There are no flexo items listed for the job you have selected.  Please place your image carrier reorder request directly in MySGS";
export const SGS_ERROR_MSG =
  "Something went Wrong. Please contact sgs help desk";
export const DRAFT_SUCCESS = "Draft discarded successfully";
export const ALREADY_EXIST = `Plate type already exists for this colour`;
export const MORE_THAN_TEN = `You cannot have more than 10 sets reordered for 1 colour`;
export const AVAILABLE_LIST = `Please select the plate type from the available plate type list`;
export const THICKNESS_LIST = `Please select the plate thickness from the available plate thickness list`;
export const ORDER_ERROR = `Your order cannot be processed through this portal.  Please go into MySGS directly to place your order`;
export const SEND_SGS_ERROR = `Your order cannot be processed. This request must be sent directly to a PM. To request it, please click `;
export const REQUIRED_MSG = "Please fill the required fields : ";
export const DELIVERY_TIME = "<p>Delivery Date and Time.</p>";
export const EITHER_ERROR = "<p>Item Code or Description or Plate ID.</p>";
export const ATLEAST_ONE_COLOR =
  "<p>At least 1 Colour and PlateType is required.</p>";
export const VALID_COLOR = "<p>Colour Name, PlateType & Quantity.</p>";
export const INTERNAL_FLEXO_VALIDATION_MSG_FIRSTPART = `There are no flexo items listed for the job's you have selected`;
export const INTERNAL_FLEXO_VALIDATION_MSG_SECPART = `Please place your image carrier reorder request directly in MySGS.`;
export const EXTERNAL_FLEXO_VALIDATION_MSG_FIRSTPART = `The order you have selected cannot be processed:`;
export const EXTERNAL_FLEXO_VALIDATION_MSG_SECPART = `Please contact a PM directly, or please go to`;
export * from "./Constants";
