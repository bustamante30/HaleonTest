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
export const UPLOAD_SUCCESSFULL_MSG = "Your files were successfully uploaded";
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

export * from "./Constants";
