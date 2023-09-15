import {  type ReportIssueDto } from '../models/ReportIssueDto';
import ApiBasicAuthService from '../services/ApiBasicAuthService';
const baseUrl = import.meta.env.VITE_SERVICE_NOW_URL ?? 'http://localhost:5208/';
const httpService = new ApiBasicAuthService(baseUrl)

class ReportIssueService{
    public static submitIssue(reportData: any) {
        let request: ReportIssueDto = {
            open_on_behalf_of_this_user: reportData.userId,
            which_photon_appication_are_you_reporting_issue_on: reportData.application,
            please_select_your_issue_from_the_following_options1: reportData.issueType,
            browser: reportData.browser,
            browser_versions: 12,
            briefly_describe_the_issue: reportData.description
        }
        return httpService
        .post<ReportIssueDto>('api/sogs/photon', request, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((response: ReportIssueDto) => {
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