import {  type ReportIssueRequestDto } from '../models/ReportIssueRequestDto';
import type {   ReportIssueResponeDto } from '../models/ReportIssueResponeDto';
import {  type AttachmentDto } from '../models/AttachmentDto';
import ApiService from '../services/apiService';
const baseUrl = import.meta.env.VITE_API_BASE_URL ??'http://localhost:5208/';

const httpService = new ApiService(baseUrl)

class ReportIssueService{
    public static submitIssue(reportData: any, id: int, files: any) {
      const newattachments = [] as AttachmentDto[]
      files.forEach(file => {
        newattachments.push({
          filename: file.filename,
          contentType: file.contentType,
          contents: file.contents
        })
       });
        let request: ReportIssueRequestDto = {
            open_on_behalf_of_this_user: id,
            which_photon_appication_are_you_reporting_issue_on: reportData.application,
            please_select_your_issue_from_the_following_options: reportData.issueType,
            browser: reportData.browser,
            browser_versions: reportData.browserVersion,
            briefly_describe_the_issue: reportData.description,
            attachments: newattachments
        }
        return httpService
        .post<ReportIssueRequestDto>('v1/ReportIssue', request, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((response: ReportIssueResponeDto) => {
          console.log('Issue submitted Successfully.');
          return response;
        })
        .catch((error: any) => {
          console.log('Error submitting issue:', error);
          return {
            status: 'Failed',
            uri: '',
          };
        });
      }
}
export default ReportIssueService;