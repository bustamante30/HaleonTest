import { type AttachmentDto } from "./AttachmentDto";

export type ReportIssueRequestDto = {
  open_on_behalf_of_this_user: number;
  which_photon_appication_are_you_reporting_issue_on: string;
  please_select_your_issue_from_the_following_options: string;
  browser: string;
  browser_versions?: number;
  briefly_describe_the_issue: string;
  attachments?: Array<AttachmentDto> | null;
};
export type { AttachmentDto };
