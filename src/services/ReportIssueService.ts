/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReportIssueRequestDto } from "../models/ReportIssueRequestDto";
import type { ReportIssueResponseDto } from "../models/ReportIssueResponseDto";
import { type AttachmentDto } from "../models/AttachmentDto";
import ApiService from "../services/apiService";
import * as Constants from "./Constants";
import { Logger } from "@/logger/logger";

const logger = new Logger("stores-auth");

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? Constants.API_LOCAL_URL;
const httpService = new ApiService(baseUrl);

class ReportIssueService {
  public static submitIssue(reportData: any, userName: string, files: any) {
    const newattachments = [] as AttachmentDto[];
    files.forEach((file) => {
      newattachments.push({
        filename: file.filename,
        contentType: file.contentType,
        base64data: file.contents,
      });
    });
    const request: ReportIssueRequestDto = {
      open_on_behalf_of_this_user: userName,
      which_photon_appication_are_you_reporting_issue_on:
        reportData.application,
      please_select_your_issue_from_the_following_options: reportData.issueType,
      browser: reportData.browser,
      browser_versions: reportData.browserVersion,
      briefly_describe_the_issue: reportData.description,
      attachments: newattachments,
    };
    return httpService
      .post<ReportIssueResponseDto>("v1/ReportIssue", request)
      .then((response: ReportIssueResponseDto) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error submitting issue]:", error);
        logger.error("[Error submitting issue]:", error);
        return null;
      });
  }
}
export default ReportIssueService;
